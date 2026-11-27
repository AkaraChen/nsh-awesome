import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { evaluateNshmManifest, extractTarGzTexts, satisfiesSemver } from './lib/manifest-check.mjs';
import { lintReadmeText, validateContentCollections, validateEntriesData } from './lint.mjs';
import { getDefaultOgImage, renderHeadIconsAndManifest, renderSocialMeta } from './lib/seo-assets.mjs';
import { buildRouteManifestFromData } from '../src/lib/catalog-pure.mjs';
import { collectUrls, isSelfUrl } from './check-links.mjs';
import { runSeoCheck } from './seo-check.mjs';

const entriesData = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));

function withTempDistCopy(t, fn) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsh-seo-check-'));
  const tmpDist = path.join(tmpRoot, 'dist');
  fs.cpSync('dist', tmpDist, { recursive: true });
  t.after(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });
  return fn(tmpDist);
}

test('evaluateNshmManifest recognizes Rust, TSX, Hybrid, and Platform nshm', () => {
  const rustNshm = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "demo-rust"\nversion = "0.2.0"\n[dependencies]\nnsh-core = "0.7"`,
    libRsText: `use nsh_core::prelude::*;\n#[native_module("demo-rust")]\nfn native(_r: &mut Registry) {}`,
  });
  assert.equal(rustNshm.kind, 'rust-nshm');
  assert.equal(rustNshm.specifier, 'demo-rust');
  assert.equal(rustNshm.cleanCompatible, true);

  const tsxNshm = evaluateNshmManifest({
    nshJsonText: JSON.stringify({
      name: 'demo-tsx',
      version: '0.1.0',
      nsh: '>=0.6',
      exports: { 'demo-tsx': 'src/index.ts' },
    }),
  });
  assert.equal(tsxNshm.kind, 'tsx-nshm');
  assert.equal(tsxNshm.cleanCompatible, true);

  const hybridNshm = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "demo-hybrid"\nversion = "0.1.0"\n[dependencies]\nnsh-core = "0.7.1"`,
    nshJsonText: JSON.stringify({ nsh: '>=0.7', exports: { 'demo-hybrid': 'tsx/index.ts' } }),
    libRsText: `#[native_module("demo-hybrid/native")]\nfn native() {}`,
  });
  assert.equal(hybridNshm.kind, 'hybrid-nshm');
  assert.equal(hybridNshm.cleanCompatible, true);

  const platformNshm = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "demo-plat"\nversion = "0.1.1"`,
    nshJsonText: JSON.stringify({ name: 'demo-plat', version: '0.1.1', platform: 'harmonyos' }),
  });
  assert.equal(platformNshm.kind, 'platform-nshm');
  assert.equal(platformNshm.platform, 'harmonyos');
  assert.equal(platformNshm.cleanCompatible, true);
});

test('evaluateNshmManifest catches 0.6 vs 0.7 mismatch and normalized Cargo quirk', () => {
  const gitPinned06 = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "old-nshm"\nversion = "0.1.0"\n[dependencies]\nnsh-core = "0.6"`,
    libRsText: `#[native_module("old-nshm")]\nfn native() {}`,
  });
  assert.equal(gitPinned06.cliWouldAdd, false);
  assert.equal(gitPinned06.cleanCompatible, false);

  const normalized06 = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "norm-nshm"\nversion = "0.1.0"\n[dependencies.nsh-core]\nversion = "0.6.0"`,
    libRsText: `#[native_module("norm-nshm")]\nfn native() {}`,
  });
  assert.equal(normalized06.cliWouldAdd, true);
  assert.equal(normalized06.coreCompatible, false);
  assert.equal(normalized06.cleanCompatible, false);
});

test('evaluateNshmManifest rejects framework crates without #[native_module]', () => {
  const fw = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "nsh-core"\nversion = "0.7.1"`,
    libRsText: `pub fn hello() {}`,
  });
  assert.equal(fw.kind, 'not-nshm');
  assert.equal(fw.cliWouldAdd, false);
});

test('satisfiesSemver matches Cargo/nsh constraints accurately', () => {
  assert.equal(satisfiesSemver('0.7.1', '0.7'), true);
  assert.equal(satisfiesSemver('0.7.1', '>=0.7'), true);
  assert.equal(satisfiesSemver('0.7.1', '^0.7.1'), true);
  assert.equal(satisfiesSemver('0.7.1', '0.6'), false);
  assert.equal(satisfiesSemver('0.7.1', '=0.7.0'), false);
  assert.equal(satisfiesSemver('0.7.1', '>=0.6, <0.8'), true);
});

test('lintReadmeText flags skipped headings, bad entry format, and duplicate URLs', () => {
  const bad = [
    '# Title',
    '',
    '## Section',
    '',
    '#### Skipped Heading',
    '',
    '- [one](https://example.com/a) — lowercase start without period',
    '- [two](https://example.com/a) — Duplicate URL.',
    '',
  ].join('\n');
  const res = lintReadmeText(bad, 'en', 'test.md');
  assert.ok(res.errors.some((e) => e.includes('skipped heading level')));
  assert.ok(res.errors.some((e) => e.includes('lowercase') || e.includes('must start uppercase')));
  assert.ok(res.errors.some((e) => e.includes('duplicate entry URL')));
});

test('data/entries.json validates cleanly and extractTarGzTexts is exported', () => {
  assert.equal(typeof extractTarGzTexts, 'function');
  assert.deepEqual(validateEntriesData(entriesData), []);
});

test('seo-assets renders icons, manifest, bilingual OG images, and escaped social metadata', () => {
  const headIcons = renderHeadIconsAndManifest('/');
  assert.ok(headIcons.includes('href="/favicon.ico"'));
  assert.ok(headIcons.includes('href="/favicon.svg"'));
  assert.ok(headIcons.includes('href="/apple-touch-icon.png"'));
  assert.ok(headIcons.includes('href="/site.webmanifest"'));

  const enOg = getDefaultOgImage('en');
  const zhOg = getDefaultOgImage('zh-Hans');
  assert.equal(enOg.url, 'https://nsh-awesome.vercel.app/og-image.png');
  assert.equal(zhOg.url, 'https://nsh-awesome.vercel.app/og-image-zh.png');
  assert.equal(enOg.width, 1200);
  assert.equal(enOg.height, 630);

  const articleMeta = renderSocialMeta({
    title: 'Discovery & "Rules"',
    description: "Line1 &\nLine2",
    canonicalUrl: 'https://nsh-awesome.vercel.app/discovery/',
    lang: 'en',
    type: 'article',
    publishedTime: '2026-11-26',
    modifiedTime: '2026-11-27',
  });
  assert.ok(articleMeta.includes('content="Discovery &amp; &quot;Rules&quot;"'));
  assert.ok(articleMeta.includes('content="Line1 &amp; Line2"'));
  assert.ok(articleMeta.includes('property="og:image:width" content="1200"'));
  assert.ok(articleMeta.includes('property="og:image:height" content="630"'));
  assert.ok(articleMeta.includes('property="article:published_time" content="2026-11-26"'));
  assert.ok(articleMeta.includes('name="twitter:card" content="summary_large_image"'));
});

test('buildRouteManifestFromData returns 40 unique bilingual routes with consistent metadata', () => {
  const routes = buildRouteManifestFromData({ data: entriesData });
  assert.equal(routes.length, 40);
  assert.equal(routes.filter((r) => r.lang === 'en').length, 20);
  assert.equal(routes.filter((r) => r.lang === 'zh').length, 20);
  assert.equal(new Set(routes.map((r) => r.url)).size, 40);
  assert.equal(new Set(routes.map((r) => r.path)).size, 40);
  assert.equal(new Set(routes.map((r) => r.mdPath)).size, 40);
  for (const r of routes) {
    assert.match(r.lastmod, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(r.enUrl.startsWith('https://nsh-awesome.vercel.app/'));
    assert.ok(r.zhUrl.startsWith('https://nsh-awesome.vercel.app/zh/'));
  }
});

test('validateContentCollections passes on src/content and rejects orphans, missing pages, or duplicate titles/descriptions', (t) => {
  assert.deepEqual(validateContentCollections(entriesData, 'src/content'), []);

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsh-content-check-'));
  const tmpContent = path.join(tmpRoot, 'content');
  fs.cpSync('src/content', tmpContent, { recursive: true });
  t.after(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  // Remove a required page, add an orphan module, and duplicate title/description
  fs.unlinkSync(path.join(tmpContent, 'pages', 'en', 'templates.md'));
  fs.copyFileSync(
    path.join(tmpContent, 'modules', 'en', 'nsh-omarchy.md'),
    path.join(tmpContent, 'modules', 'en', 'orphan-mod.md'),
  );
  const aboutPath = path.join(tmpContent, 'pages', 'en', 'about.md');
  const discText = fs.readFileSync(path.join(tmpContent, 'pages', 'en', 'discovery.md'), 'utf8');
  const discTitle = discText.match(/^title: (.+)$/m)[1];
  const discDesc = discText.match(/^description: (.+)$/m)[1];
  const aboutText = fs
    .readFileSync(aboutPath, 'utf8')
    .replace(/^title: .+$/m, `title: ${discTitle}`)
    .replace(/^description: .+$/m, `description: ${discDesc}`);
  fs.writeFileSync(aboutPath, aboutText);

  const errs = validateContentCollections(entriesData, tmpContent);
  assert.ok(errs.some((e) => e.includes('pages/en/templates.md: missing required page')));
  assert.ok(errs.some((e) => e.includes('orphan module entry "orphan-mod"')));
  assert.ok(errs.some((e) => e.includes('duplicate title')));
  assert.ok(errs.some((e) => e.includes('duplicate description')));
});

test('check-links collects all built dist/ routes and properly filters self hosts', () => {
  assert.equal(isSelfUrl('https://nsh-awesome.vercel.app/'), true);
  assert.equal(isSelfUrl('https://nsh-awesome.vercel.app/zh/nshm/nsh-omarchy/'), true);
  assert.equal(isSelfUrl('https://akarachen.github.io/nsh-awesome/'), true);
  assert.equal(isSelfUrl('https://nsh-awesome.vercel.app.evil.com/'), false);
  assert.equal(isSelfUrl('https://nsh.dev/docs/nshm'), false);

  const allUrls = new Set(collectUrls({ ignoreSelf: false, siteDir: 'dist' }));
  for (const required of [
    'https://nsh-awesome.vercel.app/',
    'https://nsh-awesome.vercel.app/zh/',
    'https://nsh-awesome.vercel.app/nshm/',
    'https://nsh-awesome.vercel.app/nshm/nsh-omarchy/',
    'https://nsh-awesome.vercel.app/discovery/',
    'https://nsh-awesome.vercel.app/about/',
    'https://nsh-awesome.vercel.app/robots.txt',
    'https://nsh-awesome.vercel.app/sitemap.xml',
    'https://nsh-awesome.vercel.app/llms.txt',
    'https://nsh-awesome.vercel.app/llms-full.txt',
    'https://nsh-awesome.vercel.app/.well-known/ai-catalog.json',
    'https://nsh-awesome.vercel.app/index.md',
    'https://nsh-awesome.vercel.app/og-image.png',
    'https://nsh-awesome.vercel.app/favicon.ico',
  ]) {
    assert.ok(allUrls.has(required), `collectUrls missing ${required}`);
  }
  assert.equal(allUrls.has('http://www.sitemaps.org/schemas/sitemap/0.9'), false);
  assert.equal(allUrls.has('https://github.com/...git'), false);

  const externalOnly = collectUrls({ ignoreSelf: true, siteDir: 'dist' });
  assert.ok(externalOnly.length >= 70);
  assert.equal(externalOnly.some((u) => u.includes('nsh-awesome.vercel.app') && !u.includes('img.shields.io')), false);
});

test('runSeoCheck passes on real Astro-built dist/ with zero errors', () => {
  const res = runSeoCheck({ siteDir: 'dist' });
  assert.equal(res.ok, true, `Unexpected SEO errors:\n${res.errors.join('\n')}`);
  assert.equal(res.errors.length, 0);
  assert.equal(res.stats.indexableHtml, 40);
  assert.equal(res.stats.md, 40);
  assert.ok(res.stats.minInboundLinks >= 1);
});

test('runSeoCheck rejects thin SSR content, missing/duplicate h1, and skipped headings', (t) => {
  withTempDistCopy(t, (tmpDist) => {
    const target = path.join(tmpDist, 'about', 'index.html');
    const html = fs
      .readFileSync(target, 'utf8')
      .replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, '<main id="main-content"><h1>Only one</h1><h4>Skipped</h4></main>');
    fs.writeFileSync(target, html);

    const res = runSeoCheck({ siteDir: tmpDist });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes('skipped heading level H1 -> H4')));
    assert.ok(res.errors.some((e) => e.includes('English word count too low')));
  });
});

test('runSeoCheck rejects duplicate titles, title-matching descriptions, and templated descriptions', (t) => {
  withTempDistCopy(t, (tmpDist) => {
    const aboutFile = path.join(tmpDist, 'about', 'index.html');
    const discFile = path.join(tmpDist, 'discovery', 'index.html');
    const templatesFile = path.join(tmpDist, 'templates', 'index.html');
    const guidesFile = path.join(tmpDist, 'guides', 'index.html');

    const discHtml = fs.readFileSync(discFile, 'utf8');
    const discTitle = discHtml.match(/<title>([\s\S]*?)<\/title>/i)[1];
    let aboutHtml = fs.readFileSync(aboutFile, 'utf8');
    aboutHtml = aboutHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${discTitle}</title>`)
      .replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${discTitle}"`);
    fs.writeFileSync(aboutFile, aboutHtml);

    const sharedTemplate =
      'Explore all verified Native Shell modules, runtime libraries, developer tools, and integration docs for macOS, Linux, Windows, iOS, Android, and Web today.';
    fs.writeFileSync(
      templatesFile,
      fs
        .readFileSync(templatesFile, 'utf8')
        .replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${sharedTemplate} Alpha"`),
    );
    fs.writeFileSync(
      guidesFile,
      fs
        .readFileSync(guidesFile, 'utf8')
        .replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${sharedTemplate} Betas"`),
    );

    const res = runSeoCheck({ siteDir: tmpDist });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes('duplicate <title>')));
    assert.ok(res.errors.some((e) => e.includes('meta description duplicates <title>')));
    assert.ok(res.errors.some((e) => e.includes('templated meta descriptions')));
  });
});

test('runSeoCheck rejects broken canonical, og:url mismatch, bad og:image, and broken hreflang loop', (t) => {
  withTempDistCopy(t, (tmpDist) => {
    const enAbout = path.join(tmpDist, 'about', 'index.html');
    const zhAbout = path.join(tmpDist, 'zh', 'about', 'index.html');

    let enHtml = fs.readFileSync(enAbout, 'utf8');
    enHtml = enHtml
      .replace('href="https://nsh-awesome.vercel.app/about/"', 'href="https://nsh-awesome.vercel.app/wrong/"')
      .replace('property="og:image:width" content="1200"', 'property="og:image:width" content="640"')
      .replace('og-image.png', 'missing-og.png');
    fs.writeFileSync(enAbout, enHtml);

    let zhHtml = fs.readFileSync(zhAbout, 'utf8');
    zhHtml = zhHtml.replace('<link rel="alternate" hreflang="en" href="https://nsh-awesome.vercel.app/about/">', '');
    fs.writeFileSync(zhAbout, zhHtml);

    const res = runSeoCheck({ siteDir: tmpDist });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes('must self-reference')));
    assert.ok(res.errors.some((e) => e.includes('og:image target missing locally')));
    assert.ok(res.errors.some((e) => e.includes('missing <link rel="alternate" hreflang="en">')));
  });
});

test('runSeoCheck rejects retired JSON-LD types, http:// URLs, bad sitemap, bad robots/llms/ai-catalog, dead links, and orphans', (t) => {
  withTempDistCopy(t, (tmpDist) => {
    const omarchyFile = path.join(tmpDist, 'nshm', 'nsh-omarchy', 'index.html');
    let omarchyHtml = fs.readFileSync(omarchyFile, 'utf8');
    omarchyHtml = omarchyHtml
      .replace('"@type":"SoftwareSourceCode"', '"@type":"FAQPage"')
      .replace('https://github.com/huacnlee/nsh-omarchy', 'http://github.com/huacnlee/nsh-omarchy');
    fs.writeFileSync(omarchyFile, omarchyHtml);

    const homeFile = path.join(tmpDist, 'index.html');
    fs.writeFileSync(
      homeFile,
      fs.readFileSync(homeFile, 'utf8').replace('href="/nshm/"', 'href="/nonexistent-route/"'),
    );

    // Strip all inbound <a href> links targeting /about/ across all indexable HTML pages
    for (const rel of fs.readdirSync(tmpDist, { recursive: true })) {
      const full = path.join(tmpDist, String(rel));
      if (!full.endsWith('.html') || full.endsWith('404.html')) continue;
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('/about/')) {
        fs.writeFileSync(full, content.replace(/<a\b([^>]*?)href="\/about\/"([^>]*)>/g, '<a$1href="/"$2>'));
      }
    }

    const sitemapFile = path.join(tmpDist, 'sitemap.xml');
    fs.writeFileSync(
      sitemapFile,
      fs.readFileSync(sitemapFile, 'utf8').replace('<url>', '<url><priority>0.8</priority>'),
    );
    fs.writeFileSync(path.join(tmpDist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    fs.writeFileSync(path.join(tmpDist, 'llms.txt'), '# Tiny\n');
    fs.writeFileSync(path.join(tmpDist, '.well-known', 'ai-catalog.json'), JSON.stringify({ entries: [] }));

    const res = runSeoCheck({ siteDir: tmpDist });
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => e.includes('retired/deprecated Schema.org @type "FAQPage"')));
    assert.ok(res.errors.some((e) => e.includes('insecure http:// URL in JSON-LD')));
    assert.ok(res.errors.some((e) => e.includes('broken internal link/asset reference "/nonexistent-route/"')));
    assert.ok(res.errors.some((e) => e.includes('orphan page (0 inbound internal links): https://nsh-awesome.vercel.app/about/')));
    assert.ok(res.errors.some((e) => e.includes('deprecated <priority> or <changefreq>')));
    assert.ok(res.errors.some((e) => e.includes('must not Disallow: /')));
    assert.ok(res.errors.some((e) => e.includes('at least 50 non-whitespace characters')));
    assert.ok(res.errors.some((e) => e.includes('ARD specVersion must be "1.0"')));
  });
});

test('subpath ASTRO_BASE=/nsh-awesome build prefixes all internal links and assets while keeping Vercel canonicals and passing seo-check', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsh-subpath-build-'));
  const tmpDist = path.join(tmpRoot, 'dist-pages');
  try {
    execFileSync(
      process.execPath,
      [path.resolve('node_modules/astro/bin/astro.mjs'), 'build', '--outDir', tmpDist],
      {
        cwd: process.cwd(),
        env: { ...process.env, ASTRO_BASE: '/nsh-awesome' },
        stdio: 'pipe',
      },
    );

    const okRes = runSeoCheck({ siteDir: tmpDist, basePath: '/nsh-awesome' });
    assert.equal(okRes.ok, true, `Unexpected subpath SEO errors:\n${okRes.errors.join('\n')}`);
    assert.equal(okRes.stats.indexableHtml, 40);

    const manifest = JSON.parse(fs.readFileSync(path.join(tmpDist, 'site.webmanifest'), 'utf8'));
    assert.equal(manifest.id, '/nsh-awesome/');
    assert.equal(manifest.start_url, '/nsh-awesome/');
    assert.equal(manifest.scope, '/nsh-awesome/');
    assert.equal(manifest.icons[0].src, '/nsh-awesome/apple-touch-icon.png');
    assert.equal(manifest.icons[1].src, '/nsh-awesome/favicon.svg');

    const indexHtml = fs.readFileSync(path.join(tmpDist, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('href="/nsh-awesome/favicon.ico"'));
    assert.ok(indexHtml.includes('href="/nsh-awesome/site.webmanifest"'));
    assert.ok(indexHtml.includes('/nsh-awesome/_astro/'));
    assert.ok(indexHtml.includes('href="/nsh-awesome/nshm/"'));
    assert.ok(indexHtml.includes('href="/nsh-awesome/zh/"'));
    assert.ok(indexHtml.includes('<link rel="canonical" href="https://nsh-awesome.vercel.app/">'));

    // Negative control: unprefixed root-relative links/assets must fail subpath seo-check
    const mutatedHtml = indexHtml
      .replace('href="/nsh-awesome/favicon.ico"', 'href="/favicon.ico"')
      .replace('href="/nsh-awesome/nshm/"', 'href="/nshm/"');
    fs.writeFileSync(path.join(tmpDist, 'index.html'), mutatedHtml);

    const badRes = runSeoCheck({ siteDir: tmpDist, basePath: '/nsh-awesome' });
    assert.equal(badRes.ok, false);
    assert.ok(badRes.errors.some((e) => e.includes('missing required base prefix "/nsh-awesome/"')));
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
