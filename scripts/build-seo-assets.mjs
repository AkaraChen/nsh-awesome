#!/usr/bin/env node
/**
 * Deterministically generate brand favicons, Web App Manifest, and
 * bilingual Open Graph social preview images in `public/` from `data/entries.json`.
 *
 * Usage:
 *   node scripts/build-seo-assets.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DATA_PATH = 'data/entries.json';
const SITE_DIR = 'public';

const RSVG_CAIRO_SCRIPT = `
import ctypes, sys
w, h, out_path = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
svg_bytes = sys.stdin.buffer.read()
rsvg = ctypes.CDLL('librsvg-2.so.2')
cairo = ctypes.CDLL('libcairo.so.2')
gobj = ctypes.CDLL('libgobject-2.0.so.0')

class RsvgRectangle(ctypes.Structure):
    _fields_ = [
        ('x', ctypes.c_double),
        ('y', ctypes.c_double),
        ('width', ctypes.c_double),
        ('height', ctypes.c_double),
    ]

rsvg.rsvg_handle_new_from_data.argtypes = [
    ctypes.c_char_p,
    ctypes.c_size_t,
    ctypes.POINTER(ctypes.c_void_p),
]
rsvg.rsvg_handle_new_from_data.restype = ctypes.c_void_p
rsvg.rsvg_handle_render_document.argtypes = [
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.POINTER(RsvgRectangle),
    ctypes.POINTER(ctypes.c_void_p),
]
rsvg.rsvg_handle_render_document.restype = ctypes.c_int
gobj.g_object_unref.argtypes = [ctypes.c_void_p]

cairo.cairo_image_surface_create.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int]
cairo.cairo_image_surface_create.restype = ctypes.c_void_p
cairo.cairo_create.argtypes = [ctypes.c_void_p]
cairo.cairo_create.restype = ctypes.c_void_p
cairo.cairo_surface_write_to_png.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
cairo.cairo_surface_write_to_png.restype = ctypes.c_int
cairo.cairo_destroy.argtypes = [ctypes.c_void_p]
cairo.cairo_surface_destroy.argtypes = [ctypes.c_void_p]

err = ctypes.c_void_p()
handle = rsvg.rsvg_handle_new_from_data(svg_bytes, len(svg_bytes), ctypes.byref(err))
if not handle:
    raise RuntimeError('rsvg_handle_new_from_data failed')
surface = cairo.cairo_image_surface_create(0, w, h)
cr = cairo.cairo_create(surface)
rect = RsvgRectangle(0.0, 0.0, float(w), float(h))
ok = rsvg.rsvg_handle_render_document(handle, cr, ctypes.byref(rect), ctypes.byref(err))
if not ok:
    cairo.cairo_destroy(cr)
    cairo.cairo_surface_destroy(surface)
    gobj.g_object_unref(handle)
    raise RuntimeError('rsvg_handle_render_document failed')
status = cairo.cairo_surface_write_to_png(surface, out_path.encode('utf-8'))
cairo.cairo_destroy(cr)
cairo.cairo_surface_destroy(surface)
gobj.g_object_unref(handle)
if status != 0:
    raise RuntimeError(f'cairo_surface_write_to_png failed: {status}')
`;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function commandExists(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const HAS_RSVG_CONVERT = commandExists('rsvg-convert');
const HAS_MAGICK = commandExists('magick');

/**
 * Rasterize an SVG document to a PNG file and losslessly optimize with ImageMagick if available.
 */
function rasterizeSvgToPng(svg, width, height, outPath, { opaque = false, background = '#0e1016' } = {}) {
  if (HAS_RSVG_CONVERT) {
    execFileSync('rsvg-convert', ['-w', String(width), '-h', String(height), '-f', 'png', '-o', outPath], {
      input: svg,
    });
  } else {
    execFileSync('python3', ['-c', RSVG_CAIRO_SCRIPT, String(width), String(height), outPath], {
      input: svg,
    });
  }

  if (HAS_MAGICK) {
    const args = opaque
      ? [
          outPath,
          '-strip',
          '-background',
          background,
          '-alpha',
          'remove',
          '-alpha',
          'off',
          '-define',
          'png:compression-level=9',
          `PNG24:${outPath}`,
        ]
      : [
          outPath,
          '-strip',
          '-define',
          'png:compression-level=9',
          `PNG32:${outPath}`,
        ];
    execFileSync('magick', args);
  }
}

/**
 * Pack an array of `{ width, height, pngBuffer }` frames into a multi-size Windows ICO buffer.
 */
function packIcoFromPngBuffers(frames) {
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + entrySize * frames.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = 1 (icon)
  header.writeUInt16LE(frames.length, 4);

  let offset = directorySize;
  const entries = [];
  const payloads = [];

  for (const frame of frames) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(frame.width >= 256 ? 0 : frame.width, 0);
    entry.writeUInt8(frame.height >= 256 ? 0 : frame.height, 1);
    entry.writeUInt8(0, 2); // color count (0 = >=8bpp)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(frame.pngBuffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    payloads.push(frame.pngBuffer);
    offset += frame.pngBuffer.length;
  }

  return Buffer.concat([header, ...entries, ...payloads]);
}

/**
 * Adaptive vector favicon supporting dark & light browser tab themes.
 */
function buildFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <title>Awesome NSH</title>
  <style>
    .bg { fill: #0e1016; stroke: #282c35; }
    .arch-outer { stroke: #55800c; }
    .arch-inner { stroke: #a9d63f; }
    .dot { fill: #f3f5f8; }
    @media (prefers-color-scheme: light) {
      .bg { fill: #f6faee; stroke: #c8d8a8; }
      .arch-outer { stroke: #3b6b08; }
      .arch-inner { stroke: #6fb216; }
      .dot { fill: #14171f; }
    }
  </style>
  <rect class="bg" x="2" y="2" width="60" height="60" rx="15" stroke-width="2"/>
  <path class="arch-outer" d="M16 47 V32 a16 16 0 0 1 32 0 V47" fill="none" stroke-width="10" stroke-linecap="round"/>
  <path class="arch-inner" d="M16 47 V32 a16 16 0 0 1 32 0 V47" fill="none" stroke-width="6.8" stroke-linecap="round"/>
  <circle class="dot" cx="32" cy="39" r="5"/>
</svg>
`;
}

/**
 * Static dark-theme SVG tuned for crisp 16x16 and 32x32 ICO rasterization.
 */
function buildFaviconRasterSvg(size) {
  const outerStroke = size <= 16 ? 11.2 : 10;
  const innerStroke = size <= 16 ? 7.6 : 6.8;
  const dotRadius = size <= 16 ? 5.6 : 5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="2" y="2" width="60" height="60" rx="15" fill="#0e1016" stroke="#282c35" stroke-width="2"/>
  <path d="M16 47 V32 a16 16 0 0 1 32 0 V47" fill="none" stroke="#55800c" stroke-width="${outerStroke}" stroke-linecap="round"/>
  <path d="M16 47 V32 a16 16 0 0 1 32 0 V47" fill="none" stroke="#a9d63f" stroke-width="${innerStroke}" stroke-linecap="round"/>
  <circle cx="32" cy="39" r="${dotRadius}" fill="#f3f5f8"/>
</svg>
`;
}

/**
 * Full-bleed 180x180 Apple Touch Icon (iOS applies its own squircle mask).
 */
function buildAppleTouchIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#13161f"/>
      <stop offset="100%" stop-color="#0e1016"/>
    </linearGradient>
    <radialGradient id="citrus-glow" cx="0.82" cy="0.14" r="0.72">
      <stop offset="0%" stop-color="#a9d63f" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#a9d63f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="180" height="180" fill="url(#bg-grad)"/>
  <rect width="180" height="180" fill="url(#citrus-glow)"/>
  <path d="M48 134 V89 a42 42 0 0 1 84 0 V134" fill="none" stroke="#55800c" stroke-width="24" stroke-linecap="round"/>
  <path d="M48 134 V89 a42 42 0 0 1 84 0 V134" fill="none" stroke="#a9d63f" stroke-width="16.5" stroke-linecap="round"/>
  <circle cx="90" cy="111" r="12.5" fill="#f3f5f8"/>
</svg>
`;
}

function buildWebManifest() {
  return `${JSON.stringify(
    {
      name: 'Awesome NSH',
      short_name: 'Awesome NSH',
      description: 'Curated Native Shell (nsh) modules (nshm), framework crates, templates, and guides.',
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#0e1016',
      theme_color: '#0e1016',
      icons: [
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
      ],
    },
    null,
    2,
  )}\n`;
}

/**
 * Build bilingual 1200x630 Open Graph SVG master artwork.
 * Uses hex colors + explicit opacity attributes (no `rgba(...)` or CSS filters)
 * for deterministic librsvg/Cairo rendering.
 */
function buildOgImageSvg({ lang, totalEntries, installableCount, nshVersion, host }) {
  const isZh = lang === 'zh';
  const sansFont = isZh
    ? "'Noto Sans CJK SC', 'DejaVu Sans', sans-serif"
    : "'DejaVu Sans', 'Noto Sans CJK SC', sans-serif";
  const monoFont = isZh
    ? "'Noto Sans Mono CJK SC', 'Noto Sans Mono', 'DejaVu Sans Mono', monospace"
    : "'Noto Sans Mono', 'Noto Sans Mono CJK SC', 'DejaVu Sans Mono', monospace";

  const copy = isZh
    ? {
        topPill: '精选生态目录 · INDEX.JSON',
        topPillX: 848,
        topPillW: 280,
        topPillCenterX: 988,
        headlineSub: 'Native Shell 精选模块目录',
        headlineSubSize: 36,
        subtitle1: `${totalEntries} 个精选条目 · ${installableCount} 个实测可安装 nshm（nsh ${nshVersion}）`,
        subtitle2: '涵盖框架 Crate、工程模板、文档指南与 index.json',
        metric1Label: '精选条目总数',
        metric2Label: '已验证 nshm',
        metric3Label: '实测 nsh 版本',
        cliHeader: 'nsh 命令行',
        cliComment: '# 安装实测通过的 nshm',
        cliStatus: `已在 nsh ${nshVersion} 实测通过`,
        endpointNote: `· ${totalEntries} 条索引`,
      }
    : {
        topPill: 'CURATED DIRECTORY · INDEX.JSON',
        topPillX: 798,
        topPillW: 330,
        topPillCenterX: 963,
        headlineSub: 'Native Shell Modules',
        headlineSubSize: 40,
        subtitle1: `${totalEntries} Curated Entries · ${installableCount} Verified nshm (nsh ${nshVersion})`,
        subtitle2: 'Framework crates, templates, guides & index.json',
        metric1Label: 'Curated Entries',
        metric2Label: 'Verified nshm',
        metric3Label: 'nsh Verified',
        cliHeader: 'nsh cli',
        cliComment: '# Install verified nshm',
        cliStatus: `verified on nsh ${nshVersion}`,
        endpointNote: `· ${totalEntries} entries`,
      };

  const versionTag = `nsh ${nshVersion}`;
  const metrics = [
    {
      x: 72,
      value: String(totalEntries),
      label: copy.metric1Label,
      valueColor: '#a9d63f',
      borderColor: '#a9d63f',
      borderOpacity: '0.45',
    },
    {
      x: 282,
      value: String(installableCount),
      label: copy.metric2Label,
      valueColor: '#f3f5f8',
      borderColor: '#282c35',
      borderOpacity: '1',
    },
    {
      x: 492,
      value: String(nshVersion),
      label: copy.metric3Label,
      valueColor: '#5eb8ff',
      borderColor: '#282c35',
      borderOpacity: '1',
    },
  ];

  const metricCardsSvg = metrics
    .map(
      (m) => `
    <g>
      <rect x="${m.x}" y="382" width="192" height="86" rx="12" fill="#161920" stroke="${m.borderColor}" stroke-opacity="${m.borderOpacity}" stroke-width="1.5"/>
      <text x="${m.x + 20}" y="424" font-family="${sansFont}" font-size="30" font-weight="700" fill="${m.valueColor}">${escapeXml(m.value)}</text>
      <text x="${m.x + 20}" y="450" font-family="${sansFont}" font-size="14" font-weight="500" fill="#9aa3b2">${escapeXml(m.label)}</text>
    </g>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#282c35" stroke-opacity="0.22" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow-citrus" cx="0.86" cy="0.14" r="0.65">
      <stop offset="0%" stop-color="#a9d63f" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="#a9d63f" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#a9d63f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow-sky" cx="0.14" cy="0.88" r="0.52">
      <stop offset="0%" stop-color="#5eb8ff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#5eb8ff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base canvas & atmospheric glows -->
  <rect width="1200" height="630" fill="#0e1016"/>
  <rect width="1200" height="630" fill="url(#bg-grid)"/>
  <rect width="1200" height="630" fill="url(#glow-citrus)"/>
  <rect width="1200" height="630" fill="url(#glow-sky)"/>

  <!-- Subtle outer frame & top accent -->
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="#232732" stroke-width="1.5"/>
  <rect x="72" y="23" width="128" height="3" rx="1.5" fill="#a9d63f"/>

  <!-- Top bar -->
  <g>
    <rect x="72" y="64" width="44" height="44" rx="11" fill="#161920" stroke="#282c35" stroke-width="1.5"/>
    <path d="M83 96 V86 a11 11 0 0 1 22 0 V96" fill="none" stroke="#55800c" stroke-width="6.8" stroke-linecap="round"/>
    <path d="M83 96 V86 a11 11 0 0 1 22 0 V96" fill="none" stroke="#a9d63f" stroke-width="4.6" stroke-linecap="round"/>
    <circle cx="94" cy="91" r="3.4" fill="#f3f5f8"/>

    <text x="130" y="93" font-family="${sansFont}" font-size="22" font-weight="700" fill="#f3f5f8">Awesome NSH</text>

    <rect x="320" y="71" width="108" height="30" rx="15" fill="#a9d63f" fill-opacity="0.14" stroke="#a9d63f" stroke-opacity="0.42" stroke-width="1"/>
    <text x="374" y="91" text-anchor="middle" font-family="${monoFont}" font-size="14" font-weight="700" fill="#a9d63f">${escapeXml(versionTag)}</text>

    <rect x="${copy.topPillX}" y="70" width="${copy.topPillW}" height="32" rx="16" fill="#161920" stroke="#282c35" stroke-width="1"/>
    <text x="${copy.topPillCenterX}" y="91" text-anchor="middle" font-family="${monoFont}" font-size="13" font-weight="600" fill="#9aa3b2">${escapeXml(copy.topPill)}</text>
  </g>

  <!-- Left column: Hero headline, summary & metric cards -->
  <g>
    <text x="72" y="214" font-family="${sansFont}" font-size="56" font-weight="700" fill="#f3f5f8">Awesome NSH</text>
    <text x="72" y="268" font-family="${sansFont}" font-size="${copy.headlineSubSize}" font-weight="700" fill="#a9d63f">${escapeXml(copy.headlineSub)}</text>

    <text x="72" y="315" font-family="${sansFont}" font-size="19" font-weight="600" fill="#e1e6ef">${escapeXml(copy.subtitle1)}</text>
    <text x="72" y="346" font-family="${sansFont}" font-size="18" font-weight="400" fill="#9aa3b2">${escapeXml(copy.subtitle2)}</text>

    ${metricCardsSvg}
  </g>

  <!-- Right column: Terminal CLI snippet card -->
  <g>
    <rect x="714" y="156" width="414" height="312" rx="16" fill="#161920" stroke="#282c35" stroke-width="1.5"/>
    <path d="M714 172 a16 16 0 0 1 16 -16 h382 a16 16 0 0 1 16 16 v24 h-414 z" fill="#1c1f27"/>
    <line x1="714" y1="196" x2="1128" y2="196" stroke="#282c35" stroke-width="1"/>

    <circle cx="738" cy="176" r="5.5" fill="#ff5f56" fill-opacity="0.88"/>
    <circle cx="756" cy="176" r="5.5" fill="#ffbd2e" fill-opacity="0.88"/>
    <circle cx="774" cy="176" r="5.5" fill="#27c93f" fill-opacity="0.88"/>
    <text x="1106" y="181" text-anchor="end" font-family="${monoFont}" font-size="13" font-weight="600" fill="#9aa3b2">${escapeXml(copy.cliHeader)}</text>

    <rect x="730" y="210" width="382" height="242" rx="10" fill="#0b0d12" stroke="#1f222a" stroke-width="1"/>

    <text x="750" y="242" font-family="${monoFont}" font-size="13.5" fill="#687082">${escapeXml(copy.cliComment)}</text>

    <text x="750" y="274" font-family="${monoFont}" font-size="16" font-weight="700" fill="#a9d63f">$</text>
    <text x="768" y="274" font-family="${monoFont}" font-size="16" font-weight="500" fill="#f3f5f8">nsh add nsh-omarchy</text>

    <path d="M752 296 l4 4 l8 -8" fill="none" stroke="#a9d63f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="772" y="300" font-family="${sansFont}" font-size="13.5" font-weight="500" fill="#a9d63f">${escapeXml(copy.cliStatus)}</text>

    <text x="750" y="338" font-family="${monoFont}" font-size="16" font-weight="700" fill="#a9d63f">$</text>
    <text x="768" y="338" font-family="${monoFont}" font-size="16" font-weight="500" fill="#f3f5f8">nsh add nsh-extra \</text>
    <text x="768" y="364" font-family="${monoFont}" font-size="15.5" font-weight="500" fill="#c2ea62">  --features camera</text>

    <line x1="750" y1="392" x2="1092" y2="392" stroke="#1f222a" stroke-width="1"/>

    <rect x="750" y="408" width="48" height="26" rx="6" fill="#a9d63f" fill-opacity="0.14" stroke="#a9d63f" stroke-opacity="0.40" stroke-width="1"/>
    <text x="774" y="426" text-anchor="middle" font-family="${monoFont}" font-size="12.5" font-weight="700" fill="#a9d63f">GET</text>
    <text x="810" y="426" font-family="${monoFont}" font-size="14.5" font-weight="600" fill="#f3f5f8">/index.json</text>
    <text x="920" y="426" font-family="${sansFont}" font-size="13.5" fill="#9aa3b2">${escapeXml(copy.endpointNote)}</text>
  </g>

  <!-- Footer bar -->
  <line x1="72" y1="508" x2="1128" y2="508" stroke="#1f222a" stroke-width="1"/>
  <circle cx="80" cy="542" r="5" fill="#a9d63f"/>
  <text x="96" y="548" font-family="${monoFont}" font-size="18.5" font-weight="700" fill="#f3f5f8">${escapeXml(host)}</text>
  <text x="1128" y="548" text-anchor="end" font-family="${sansFont}" font-size="14.5" font-weight="500" fill="#9aa3b2">iOS · Android · macOS · Windows · Linux · Web</text>
</svg>
`;
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const totalEntries = data.entries.length;
  const installableCount = data.entries.filter((e) => e.installable).length;
  const nshVersion = data.nshVerifiedVersion || '0.7.1';
  const host = new URL(data.siteUrl || 'https://nsh-awesome.vercel.app/').host;

  fs.mkdirSync(SITE_DIR, { recursive: true });

  const faviconSvgPath = path.join(SITE_DIR, 'favicon.svg');
  const faviconIcoPath = path.join(SITE_DIR, 'favicon.ico');
  const appleIconPath = path.join(SITE_DIR, 'apple-touch-icon.png');
  const manifestPath = path.join(SITE_DIR, 'site.webmanifest');
  const ogEnPath = path.join(SITE_DIR, 'og-image.png');
  const ogZhPath = path.join(SITE_DIR, 'og-image-zh.png');

  fs.writeFileSync(faviconSvgPath, buildFaviconSvg(), 'utf8');
  fs.writeFileSync(manifestPath, buildWebManifest(), 'utf8');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsh-seo-assets-'));
  try {
    const icoFrames = [16, 32].map((size) => {
      const pngPath = path.join(tmpDir, `favicon-${size}.png`);
      rasterizeSvgToPng(buildFaviconRasterSvg(size), size, size, pngPath, { opaque: false });
      return {
        width: size,
        height: size,
        pngBuffer: fs.readFileSync(pngPath),
      };
    });
    fs.writeFileSync(faviconIcoPath, packIcoFromPngBuffers(icoFrames));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  rasterizeSvgToPng(buildAppleTouchIconSvg(), 180, 180, appleIconPath, { opaque: true });

  const sharedStats = { totalEntries, installableCount, nshVersion, host };
  rasterizeSvgToPng(buildOgImageSvg({ ...sharedStats, lang: 'en' }), 1200, 630, ogEnPath, {
    opaque: true,
  });
  rasterizeSvgToPng(buildOgImageSvg({ ...sharedStats, lang: 'zh' }), 1200, 630, ogZhPath, {
    opaque: true,
  });

  const outputs = [
    faviconSvgPath,
    faviconIcoPath,
    appleIconPath,
    manifestPath,
    ogEnPath,
    ogZhPath,
  ];
  for (const filePath of outputs) {
    const bytes = fs.statSync(filePath).size;
    console.log(`generated ${filePath} (${bytes} bytes)`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
