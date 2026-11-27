/**
 * Pure GEO, Agentic Discovery, Markdown delivery, and WebMCP builders for Awesome NSH.
 *
 * Consumed by `scripts/generate.mjs` (stage 3) and validated standalone against
 * RFC 9309, llmstxt.org v2, ARD 1.0, and W3C WebML CG WebMCP draft conventions.
 */

export const SITE_URL = 'https://nsh-awesome.vercel.app/';
export const CONTENT_SIGNAL_POLICY = 'search=yes, ai-input=yes, ai-train=yes';

const ROBOT_GROUPS = Object.freeze([
  Object.freeze({
    comment: '# Default fallback policy for all crawlers',
    tokens: Object.freeze(['*']),
  }),
  Object.freeze({
    comment: '# Search indexing & AI search citation crawlers',
    tokens: Object.freeze([
      'Googlebot',
      'Applebot',
      'OAI-SearchBot',
      'Claude-SearchBot',
      'PerplexityBot',
    ]),
  }),
  Object.freeze({
    comment: '# User-triggered live fetch agents',
    tokens: Object.freeze(['ChatGPT-User', 'Claude-User']),
  }),
  Object.freeze({
    comment: '# Model training crawlers & training control tokens (public open-source catalog)',
    tokens: Object.freeze(['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended']),
  }),
]);

export const WEBMCP_TOOLS_META = Object.freeze([
  Object.freeze({
    name: 'search_nshm_modules',
    title: 'Search Native Shell Modules',
    description:
      'Search and filter the curated Awesome NSH catalog of installable nshm modules, framework crates, templates, and documentation by keyword, section, source type, or platform.',
    annotations: Object.freeze({
      readOnlyHint: true,
      untrustedContentHint: false,
    }),
  }),
  Object.freeze({
    name: 'get_nshm_install_command',
    title: 'Get Native Shell Module Install Command',
    description:
      'Look up the verified nsh add install command, source type, supported platforms, and metadata for a specific Awesome NSH entry by ID or package name.',
    annotations: Object.freeze({
      readOnlyHint: true,
      untrustedContentHint: false,
    }),
  }),
]);

function normalizeSiteUrl(siteUrl = SITE_URL) {
  const raw = String(siteUrl || SITE_URL).trim() || SITE_URL;
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function isChineseLang(lang) {
  return typeof lang === 'string' && lang.trim().toLowerCase().startsWith('zh');
}

function getLatestUpdatedAt(data) {
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  let maxDate = '2026-11-26';
  for (const entry of entries) {
    if (typeof entry?.updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.updatedAt)) {
      if (entry.updatedAt > maxDate) maxDate = entry.updatedAt;
    }
  }
  return maxDate;
}

function getSectionHubSlug(sectionId) {
  return sectionId === 'articles' ? 'guides' : String(sectionId || '');
}

function resolveSection(data, sectionOrId) {
  if (sectionOrId && typeof sectionOrId === 'object' && sectionOrId.id) {
    return sectionOrId;
  }
  const target = sectionOrId === 'guides' ? 'articles' : String(sectionOrId || 'nshm');
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  return sections.find((s) => s.id === target) || sections[0] || null;
}

function resolveEntry(data, entryOrId) {
  if (entryOrId && typeof entryOrId === 'object' && entryOrId.id) {
    return entryOrId;
  }
  const target = String(entryOrId || '').trim().toLowerCase();
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  return (
    entries.find((e) => e.id.toLowerCase() === target || e.name.toLowerCase() === target) || null
  );
}

function resolveAbsoluteUrl(value, baseUrl) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return trimmed;
  }
}

function llmsLinkKey(url) {
  try {
    const u = new URL(url);
    return `${u.protocol.toLowerCase()}//${u.host.toLowerCase()}${u.pathname || '/'}${u.search}`;
  } catch {
    return String(url || '');
  }
}

function cleanText(text) {
  return String(text ?? '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeMdLinkLabel(text) {
  return cleanText(text).replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function escapeMdTableCell(text) {
  return cleanText(text).replace(/\|/g, '\\|');
}

function wrapInlineCode(text) {
  const cleaned = cleanText(text);
  const matches = cleaned.match(/`+/g);
  const maxRun = matches ? Math.max(...matches.map((m) => m.length)) : 0;
  const fence = '`'.repeat(maxRun + 1);
  const needsPad = cleaned.startsWith('`') || cleaned.endsWith('`');
  return needsPad ? `${fence} ${cleaned} ${fence}` : `${fence}${cleaned}${fence}`;
}

function renderCodeFence(lang, code) {
  const raw = String(code ?? '');
  const matches = raw.match(/`{3,}/g);
  const maxRun = matches ? Math.max(...matches.map((m) => m.length)) : 2;
  const fence = '`'.repeat(maxRun + 1);
  return `${fence}${lang}\n${raw}\n${fence}`;
}

function getInstallSourceStats(entries) {
  const installable = entries.filter((e) => e.installable);
  const bySource = {
    'crates.io': installable.filter((e) => e.sourceType === 'crates.io'),
    github: installable.filter((e) => e.sourceType === 'github'),
    git: installable.filter((e) => e.sourceType === 'git'),
  };
  return { installable, bySource };
}

function formatEntryMarkdownBlock(entry, lang, siteUrl) {
  const isZh = isChineseLang(lang);
  const desc = entry.description?.[isZh ? 'zh' : 'en'] || entry.description?.en || '';
  const base = normalizeSiteUrl(siteUrl);
  const detailLink = entry.installable
    ? isZh
      ? `${base}zh/nshm/${entry.id}/`
      : `${base}nshm/${entry.id}/`
    : entry.sourceUrl;

  const lines = [`- [${escapeMdLinkLabel(entry.name)}](${detailLink}) — ${cleanText(desc)}`];
  const meta = [];

  if (entry.installable && entry.installCommand) {
    meta.push(
      isZh
        ? `安装命令：${wrapInlineCode(entry.installCommand)}`
        : `Install: ${wrapInlineCode(entry.installCommand)}`,
    );
  } else if (entry.section === 'framework') {
    meta.push(
      isZh
        ? '**非 nshm**（不可通过 `nsh add` 安装）'
        : '**Not nshm** (cannot install with `nsh add`)',
    );
  }

  meta.push(
    isZh ? `类型：${wrapInlineCode(entry.kind)}` : `Kind: ${wrapInlineCode(entry.kind)}`,
  );
  meta.push(
    isZh
      ? `来源：${wrapInlineCode(entry.sourceType)}`
      : `Source: ${wrapInlineCode(entry.sourceType)}`,
  );
  if (entry.version) {
    meta.push(
      isZh ? `版本：${wrapInlineCode(entry.version)}` : `Version: ${wrapInlineCode(entry.version)}`,
    );
  }
  if (Array.isArray(entry.platforms) && entry.platforms.length > 0) {
    meta.push(
      isZh
        ? `平台：${entry.platforms.join('、')}`
        : `Platforms: ${entry.platforms.join(', ')}`,
    );
  }
  meta.push(isZh ? `许可证：${entry.license}` : `License: ${entry.license}`);
  meta.push(isZh ? `更新：${entry.updatedAt}` : `Updated: ${entry.updatedAt}`);

  const links = [];
  if (entry.sourceUrl) {
    links.push(`[${isZh ? '源码仓库' : 'Source'}](${entry.sourceUrl})`);
  }
  if (entry.cratesUrl && entry.cratesUrl !== entry.sourceUrl) {
    links.push(`[crates.io](${entry.cratesUrl})`);
  }
  if (entry.homepage && entry.homepage !== entry.sourceUrl) {
    links.push(`[${isZh ? '文档 / 演示' : 'Docs / Demo'}](${entry.homepage})`);
  }
  if (links.length > 0) {
    meta.push(links.join(' · '));
  }

  lines.push(`  - ${meta.join(' · ')}`);
  const noteText = entry.notes?.[isZh ? 'zh' : 'en'] || entry.notes?.en;
  if (noteText) {
    lines.push(isZh ? `  - 说明：${cleanText(noteText)}` : `  - Note: ${cleanText(noteText)}`);
  }
  return lines.join('\n');
}

function getKindLabel(kind, isZh) {
  const labels = {
    'rust-nshm': isZh ? 'Rust nshm（crates.io / Git 源码 crate）' : 'Rust nshm',
    'tsx-nshm': isZh ? '纯 TSX nshm（无需 Rust 工具链）' : 'Pure TSX nshm',
    'hybrid-nshm': isZh ? 'Rust + TSX 混合 nshm' : 'Hybrid Rust + TSX nshm',
    'platform-nshm': isZh ? '社区平台后端 nshm' : 'Platform target nshm',
    'framework-crate': isZh ? '官方框架 Crate（非 nshm）' : 'Framework crate (NOT nshm)',
    examples: isZh ? '官方示例' : 'Official examples',
    template: isZh ? '工程模板' : 'Template',
    directory: isZh ? '生态目录' : 'Directory',
    'reference-app': isZh ? '参考应用' : 'Reference app',
    documentation: isZh ? '官方文档' : 'Documentation',
    tutorial: isZh ? '教程' : 'Tutorial',
    article: isZh ? '技术对比指南' : 'Architecture guide',
  };
  return labels[kind] || kind;
}

/**
 * Build an RFC 9309 compliant `robots.txt` with explicit crawler groups and
 * repeated per-group `Content-Signal` preferences.
 *
 * @param {object} [options]
 * @param {string} [options.siteUrl='https://nsh-awesome.vercel.app/']
 * @returns {string}
 */
export function buildRobotsTxt({ siteUrl = SITE_URL } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const lines = [
    '# Awesome NSH robots.txt (RFC 9309)',
    '# Public open-source module catalog welcoming search indexing and AI grounding.',
    '',
  ];

  for (const group of ROBOT_GROUPS) {
    lines.push(group.comment);
    for (const token of group.tokens) {
      lines.push(`User-agent: ${token}`);
      lines.push(`Content-Signal: ${CONTENT_SIGNAL_POLICY}`);
      lines.push('Allow: /');
      lines.push('');
    }
  }

  lines.push(`Sitemap: ${base}sitemap.xml`);
  lines.push(`Agentmap: ${base}.well-known/ai-catalog.json`);
  return `${lines.join('\n')}\n`;
}

/**
 * Build a concise `/llms.txt` following the llmstxt.org v2 community proposal
 * and passing Lighthouse `llms-txt` and line-level format checks cleanly.
 *
 * @param {object} [options]
 * @param {string} [options.siteUrl='https://nsh-awesome.vercel.app/']
 * @param {object} options.data - Parsed `data/entries.json` object.
 * @param {Array<object>} [options.pages] - Optional extra page descriptors `{ title, name, url, path, notes, description, section }`.
 * @returns {string}
 */
export function buildLlmsTxt({ siteUrl = SITE_URL, data, pages = [] } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const { installable, bySource } = getInstallSourceStats(entries);
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';
  const latestUpdatedAt = getLatestUpdatedAt(data);
  const frameworkCount = entries.filter((e) => e.section === 'framework').length;
  const repoUrl = data?.repository || 'https://github.com/AkaraChen/nsh-awesome';

  const seenUrls = new Set();
  const formatItem = (label, rawUrl, notes) => {
    const abs = resolveAbsoluteUrl(rawUrl, base);
    if (!abs || !/^https?:\/\//i.test(abs)) return null;
    const key = llmsLinkKey(abs);
    if (seenUrls.has(key)) return null;
    seenUrls.add(key);
    const noteStr = cleanText(notes);
    return noteStr
      ? `- [${escapeMdLinkLabel(label)}](${abs}): ${noteStr}`
      : `- [${escapeMdLinkLabel(label)}](${abs})`;
  };

  const lines = [
    '# Awesome NSH',
    '',
    `> Curated directory and machine-readable catalog of ${entries.length} Native Shell (nsh) resources, including ${installable.length} installable nshm modules verified with \`nsh add\` on nsh ${verifiedVersion} (updated ${latestUpdatedAt}).`,
    '',
    `Native Shell (nsh) is a Rust-first native UI framework targeting iOS, Android, macOS, Windows, Linux, GPUI, TUI, and Web. An installable \`nshm\` requires \`#[native_module("...")]\` in its Rust crate root, \`nsh.json\` \`"exports"\` for TSX modules, or \`nsh.json\` \`"platform"\` for community platform targets. The ${frameworkCount} official \`longbridge/nsh\` framework crates listed in this catalog are NOT \`nshm\` packages and cannot be installed with \`nsh add\`.`,
    '',
    `Source distribution among the ${installable.length} verified \`nshm\` modules: ${bySource['crates.io'].length} via crates.io, ${bySource.github.length} via \`github:owner/repo\`, and ${bySource.git.length} via Git URL \`--rev\`. Verification scope covers clean scratch-app \`nsh add\` resolution on nsh ${verifiedVersion}, not cross-platform on-device runtime builds.`,
    '',
    '## Core Pages',
    '',
  ];

  const coreSeeds = [
    [
      'Home Directory (Markdown)',
      `${base}index.md`,
      `Content-equivalent Markdown version of the full ${entries.length}-entry Awesome NSH directory.`,
    ],
    [
      'Discovery Methodology (Markdown)',
      `${base}discovery.md`,
      `Empirical manifest rules, 6 discovery channels (119 crates.io crates, 89 GitHub repos), and nsh ${verifiedVersion} verification ledger.`,
    ],
    [
      'About & Curation Criteria (Markdown)',
      `${base}about.md`,
      'Maintainer background, inclusion and rejection rules, and honest verification boundaries.',
    ],
  ];

  for (const sec of sections) {
    const slug = getSectionHubSlug(sec.id);
    const secCount = entries.filter((e) => e.section === sec.id).length;
    coreSeeds.push([
      `${sec.title?.en || slug} Hub`,
      `${base}${slug}/`,
      `${secCount} curated entries — ${cleanText(sec.description?.en || '')}`,
    ]);
  }

  if (Array.isArray(pages)) {
    for (const p of pages) {
      if (!p || typeof p !== 'object') continue;
      if (p.noindex || p.lang === 'zh' || p.lang === 'zh-CN' || p.lang === 'zh-Hans') continue;
      const targetUrl = p.markdownUrl || p.url || p.path;
      const title = p.title || p.name;
      if (!targetUrl || !title) continue;
      if (String(targetUrl).includes('/nshm/') && !String(targetUrl).endsWith('/nshm/')) continue;
      coreSeeds.push([title, targetUrl, p.notes || p.description || 'Awesome NSH directory page.']);
    }
  }

  for (const [label, url, notes] of coreSeeds) {
    const item = formatItem(label, url, notes);
    if (item) lines.push(item);
  }

  lines.push('', '## Machine-Readable Endpoints', '');
  const endpointSeeds = [
    [
      'JSON Catalog Index (index.json)',
      `${base}index.json`,
      `Canonical machine-readable JSON feed of all ${entries.length} entries, ${installable.length} installable nshms, sections, and categories.`,
    ],
    [
      'Verified Module Count Badge JSON (count.json)',
      `${base}count.json`,
      `Shields.io endpoint reporting ${installable.length} verified installable nshm modules.`,
    ],
    [
      'Full Reference Documentation (llms-full.txt)',
      `${base}llms-full.txt`,
      `Complete self-contained Markdown reference covering all ${entries.length} catalog entries, install commands, and discovery findings.`,
    ],
    [
      'ARD 1.0 AI Resource Catalog (ai-catalog.json)',
      `${base}.well-known/ai-catalog.json`,
      'Agentic Resource Discovery 1.0 manifest registering Awesome NSH feeds and directories.',
    ],
  ];
  for (const [label, url, notes] of endpointSeeds) {
    const item = formatItem(label, url, notes);
    if (item) lines.push(item);
  }

  lines.push('', '## Verified Installable nshm Modules', '');
  for (const entry of installable) {
    const platText = Array.isArray(entry.platforms) ? entry.platforms.join(', ') : '';
    const notes = `${cleanText(entry.description?.en || '')} Install: \`${entry.installCommand}\`. Platforms: ${platText}. License: ${entry.license}.`;
    const item = formatItem(entry.name, `${base}nshm/${entry.id}.md`, notes);
    if (item) lines.push(item);
  }

  lines.push('', '## Optional', '');
  const optionalSeeds = [
    [
      'Chinese Home Directory (Markdown)',
      `${base}zh/index.md`,
      '中文完整目录页（与英文版语义对等）。',
    ],
    [
      'Chinese Discovery Methodology (Markdown)',
      `${base}zh/discovery.md`,
      'nshm 发现机制、清单规则与实测验证说明中文版。',
    ],
    [
      'Chinese About Page (Markdown)',
      `${base}zh/about.md`,
      '维护者信息、收录标准与验证边界中文说明。',
    ],
    [
      'Interactive HTML Directory',
      base,
      'Filterable web interface with copyable install commands and dark/light theme support.',
    ],
    [
      'GitHub Repository (AkaraChen/nsh-awesome)',
      repoUrl,
      'Single source of truth `data/entries.json`, discovery scanner, generator, and verification scripts.',
    ],
    [
      'Official Native Shell nshm Documentation',
      'https://nsh.dev/docs/nshm',
      'Upstream specification for nsh add, nsh.lock, #[native_module], and publishing.',
    ],
  ];
  for (const [label, url, notes] of optionalSeeds) {
    const item = formatItem(label, url, notes);
    if (item) lines.push(item);
  }

  return `${lines.join('\n')}\n`;
}

/**
 * Build `/llms-full.txt`, a comprehensive single-file Markdown reference for
 * AI coding agents built strictly from `data/entries.json` and `docs/DISCOVERY.md`.
 *
 * @param {object} [options]
 * @param {string} [options.siteUrl='https://nsh-awesome.vercel.app/']
 * @param {object} options.data - Parsed `data/entries.json` object.
 * @param {object|null} [options.seoContent=null] - Optional `data/seo-content.json` object.
 * @returns {string}
 */
export function buildLlmsFullTxt({ siteUrl = SITE_URL, data, seoContent = null } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const { installable, bySource } = getInstallSourceStats(entries);
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';
  const latestUpdatedAt = getLatestUpdatedAt(data);
  const repoUrl = data?.repository || 'https://github.com/AkaraChen/nsh-awesome';

  const lines = [
    '# Awesome NSH — Full Reference',
    '',
    `> Complete self-contained Markdown reference for Native Shell (nsh): ${entries.length} curated entries (${installable.length} installable nshm modules verified on nsh ${verifiedVersion}), installation rules, source comparison, and empirical discovery findings as of ${latestUpdatedAt}.`,
    '',
    '## Overview & Verification Scope',
    '',
    `- **Canonical site:** ${base}`,
    `- **Source repository:** ${repoUrl}`,
    `- **Machine-readable index:** ${base}index.json`,
    `- **ARD catalog:** ${base}.well-known/ai-catalog.json`,
    `- **Verified CLI version:** \`nsh ${verifiedVersion}\` (clean scratch-app \`nsh add\` verification; cross-platform on-device compilation is not claimed).`,
    `- **Total curated entries:** ${entries.length} (${installable.length} installable \`nshm\`, ${entries.filter((e) => e.section === 'framework').length} non-nshm framework crates, ${entries.filter((e) => e.section === 'templates').length} examples/templates, ${entries.filter((e) => e.section === 'articles').length} guides/docs).`,
  ];

  const homeIntroEn = seoContent?.pages?.home?.en?.definition || seoContent?.home?.en?.definition;
  if (typeof homeIntroEn === 'string' && homeIntroEn.trim()) {
    lines.push('', cleanText(homeIntroEn));
  }

  lines.push(
    '',
    '## Install Source Comparison (Verified nshm Modules)',
    '',
    '| Source Type | Count | Command Pattern | Operational Notes |',
    '|---|---:|---|---|',
    `| \`crates.io\` | ${bySource['crates.io'].length} | \`nsh add <crate>\` | Published on crates.io with \`nsh-core >= 0.7\` (or \`nsh-extra --features ...\`). |`,
    `| \`github:owner/repo\` | ${bySource.github.length} | \`nsh add github:owner/repo\` | Hosted on GitHub; not yet on crates.io or crates.io tarball lags behind \`0.7.1\` (\`nsh-platform-harmonyos\`). |`,
    `| \`Git URL --rev\` | ${bySource.git.length} | \`nsh add https://github.com/...git --rev master\` | Required when crates.io/tag pins \`^0.6\` while \`master\` supports \`^0.7.1\` (\`nsh-widgets\`). |`,
    '',
    '> Security warning: Installing a Rust or TSX `nshm` runs build scripts (`build.rs`), procedural macros, and runtime code with full app permissions, and crates can contribute entitlements via `[package.metadata.nsh]`. Inspect source repositories and `nsh.lock` before shipping.',
  );

  for (const sec of sections) {
    const secEntries = entries.filter((e) => e.section === sec.id);
    if (secEntries.length === 0) continue;
    lines.push('', `## ${cleanText(sec.title?.en || sec.id)} (${secEntries.length})`, '');
    lines.push(cleanText(sec.description?.en || ''));
    if (sec.id === 'framework') {
      lines.push(
        '',
        '**Important:** None of the crates in this section are `nshm` packages. Running `nsh add` on them fails because they lack `#[native_module("...")]` and `nsh.json` `"exports"`.',
      );
    }

    const secCats = categories.filter(
      (c) => c.section === sec.id && secEntries.some((e) => e.category === c.id),
    );
    for (const cat of secCats) {
      const catEntries = secEntries.filter((e) => e.category === cat.id);
      lines.push('', `### ${cleanText(cat.title?.en || cat.id)}`, '');
      for (const entry of catEntries) {
        lines.push(formatEntryMarkdownBlock(entry, 'en', base));
      }
    }
  }

  lines.push(
    '',
    '## Empirical Manifest Rules & Discovery Summary',
    '',
    '- **Structural criteria (`longbridge/nsh` `manifest.rs`):** A package is installable via `nsh add` only when it defines `#[native_module("<specifier>")]` in its Rust crate root, declares `"exports"` in `nsh.json` (TSX nshm), combines both without specifier collision (Hybrid nshm), or declares `"platform": "<target>"` in `nsh.json` (Platform nshm), alongside compatible `nsh-core` / `"nsh"` version constraints.',
    '- **Cargo normalization quirk (`nsh-cli 0.7.1`):** `cargo publish` rewrites `[dependencies] nsh-core = "0.6.0"` into `[dependencies.nsh-core]`. Because `manifest.rs::nsh_core_requirement` scans `[dependencies]` / `[workspace.dependencies]`, 18 crates.io crates pinned to `0.6` pass `nsh add` technically despite targeting NSH `0.6`, so this catalog excludes them from the clean `0.7.1` installable list.',
    '- **6 external discovery channels:** Combining crates.io `keyword=nshm` (68 raw hits), `nsh-core` reverse dependencies (107 raw hits), `keyword=nsh`/`native-shell` (96 hits), `longbridge/nsh-showcases` (10 entries), GitHub Topic/Code Search, and multi-crate GitHub org enumeration inspected **119 unique crates.io crates** and **89 unique GitHub repositories**.',
    `- **Full methodology:** Read [${base}discovery.md](${base}discovery.md) or [${repoUrl}/blob/main/docs/DISCOVERY.md](${repoUrl}/blob/main/docs/DISCOVERY.md).`,
    '',
    '## Machine-Readable Endpoints',
    '',
    `- Catalog JSON: ${base}index.json`,
    `- Installable count JSON: ${base}count.json`,
    `- Concise LLM index: ${base}llms.txt`,
    `- ARD 1.0 resource catalog: ${base}.well-known/ai-catalog.json`,
    `- XML Sitemap: ${base}sitemap.xml`,
  );

  return `${lines.join('\n')}\n`;
}

/**
 * Build an ARD 1.0 compliant `ai-catalog.json` object registering Awesome NSH
 * feeds and directory resources.
 *
 * Strictly uses truthful IANA media types, `urn:air:` identifiers, `url`
 * references, 3 `representativeQueries` per entry, `trustManifest.identity`,
 * and omits top-level `collections`.
 *
 * @param {object} [options]
 * @param {string} [options.siteUrl='https://nsh-awesome.vercel.app/']
 * @param {object} options.data - Parsed `data/entries.json` object.
 * @returns {object}
 */
export function buildAiCatalogJson({ siteUrl = SITE_URL, data } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const parsed = new URL(base);
  const publisher = parsed.hostname;
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const installableCount = entries.filter((e) => e.installable).length;
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';
  const latestUpdatedAt = getLatestUpdatedAt(data);
  const updatedIso = `${latestUpdatedAt}T00:00:00Z`;
  const trustManifest = {
    identity: base,
    identityType: 'https',
  };

  return {
    specVersion: '1.0',
    host: {
      displayName: 'Awesome NSH',
      identifier: base,
      documentationUrl: `${base}discovery/`,
      logoUrl: `${base}favicon.svg`,
      trustManifest,
    },
    entries: [
      {
        identifier: `urn:air:${publisher}:catalog:index-json`,
        displayName: 'Awesome NSH Catalog JSON Index (index.json)',
        type: 'application/json',
        url: `${base}index.json`,
        description: `Machine-readable JSON catalog of ${entries.length} Native Shell entries including ${installableCount} verified installable nshm modules on nsh ${verifiedVersion}.`,
        tags: ['nsh', 'nshm', 'rust', 'catalog', 'json'],
        capabilities: ['CatalogFeed', 'InstallCommandLookup', 'PlatformMetadata'],
        representativeQueries: [
          `List all installable nshm modules verified for nsh ${verifiedVersion}`,
          'Get the nsh add install command and supported platforms for nsh-omarchy',
          'Which Native Shell framework crates cannot be installed with nsh add?',
        ],
        version: '1.0.0',
        updatedAt: updatedIso,
        trustManifest,
      },
      {
        identifier: `urn:air:${publisher}:docs:llms-txt`,
        displayName: 'Awesome NSH LLM Directory Index (llms.txt)',
        type: 'text/markdown',
        url: `${base}llms.txt`,
        description:
          'Concise llmstxt.org v2 index linking core Markdown pages, hubs, machine-readable endpoints, and verified nshm module docs.',
        tags: ['llms-txt', 'nsh', 'nshm', 'markdown'],
        capabilities: ['DirectoryIndex', 'MarkdownDiscovery'],
        representativeQueries: [
          'Where are the Markdown documentation links for Awesome NSH?',
          'Find the llms.txt index of verified Native Shell nshm modules',
          'What machine-readable endpoints does Awesome NSH publish?',
        ],
        version: '1.0.0',
        updatedAt: updatedIso,
        trustManifest,
      },
      {
        identifier: `urn:air:${publisher}:docs:llms-full-txt`,
        displayName: 'Awesome NSH Full LLM Reference (llms-full.txt)',
        type: 'text/markdown',
        url: `${base}llms-full.txt`,
        description: `Self-contained Markdown reference listing all ${entries.length} Native Shell modules, framework crates, templates, guides, and discovery rules.`,
        tags: ['llms-full-txt', 'nsh', 'nshm', 'reference'],
        capabilities: ['FullCatalogReference', 'DiscoveryRulesReference'],
        representativeQueries: [
          'Compare crates.io vs GitHub vs Git URL nshm installation sources',
          'Explain how nsh add determines if a package is an installable nshm',
          'Show all curated Native Shell visualization and UI modules',
        ],
        version: '1.0.0',
        updatedAt: updatedIso,
        trustManifest,
      },
      {
        identifier: `urn:air:${publisher}:web:directory`,
        displayName: 'Awesome NSH Interactive Directory',
        type: 'text/html',
        url: base,
        description: `Bilingual searchable web directory of ${entries.length} Native Shell modules, framework crates, templates, and documentation.`,
        tags: ['nsh', 'directory', 'web', 'bilingual'],
        capabilities: ['InteractiveDirectory', 'WebMCPSearchTools'],
        representativeQueries: [
          'Browse and filter Native Shell modules by category and platform',
          'Search Native Shell UI component libraries for macOS, Linux, and Web',
          'Read Native Shell module discovery methodology and verification scope',
        ],
        version: '1.0.0',
        updatedAt: updatedIso,
        trustManifest,
      },
    ],
  };
}

/**
 * Serialize `buildAiCatalogJson` output as formatted UTF-8 JSON with trailing newline.
 */
export function renderAiCatalogJson(options = {}) {
  return `${JSON.stringify(buildAiCatalogJson(options), null, 2)}\n`;
}

function renderHomeMarkdown({ base, isZh, data, seoContent, canonicalUrl, alternateUrl }) {
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const { installable, bySource } = getInstallSourceStats(entries);
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';
  const latestUpdatedAt = getLatestUpdatedAt(data);
  const frameworkCount = entries.filter((e) => e.section === 'framework').length;
  const templatesCount = entries.filter((e) => e.section === 'templates').length;
  const articlesCount = entries.filter((e) => e.section === 'articles').length;

  const htmlUrl = canonicalUrl || (isZh ? `${base}zh/` : base);
  const altMdUrl = alternateUrl || (isZh ? `${base}index.md` : `${base}zh/index.md`);
  const homeSeo = seoContent?.pages?.home?.[isZh ? 'zh' : 'en'] || seoContent?.home?.[isZh ? 'zh' : 'en'];
  const summaryQuote = isZh
    ? data?.description?.zh ||
      `Native Shell（nsh）模块（nshm）、框架 crate、模板示例与文档教程的精选清单与机器可读索引（已在 nsh ${verifiedVersion} 实测）。`
    : data?.description?.en ||
      `A curated list, searchable directory, and machine-readable index of Native Shell (nsh) modules (nshm), framework crates, templates, and guides.`;

  const defaultDefinition = isZh
    ? `**Awesome NSH** 是面向跨平台原生 Rust UI 框架 [Native Shell](https://nsh.dev)（\`nsh\`）的精选模块索引目录。共收录 **${entries.length}** 条资源（更新至 ${latestUpdatedAt}），其中 **${installable.length}** 个可安装 \`nshm\` 已在 \`nsh ${verifiedVersion}\` 实测通过 \`nsh add\`，而 **${frameworkCount}** 个 \`longbridge/nsh\` 官方框架 crate 不可通过 \`nsh add\` 安装。`
    : `**Awesome NSH** is a curated directory and machine-readable index for [Native Shell](https://nsh.dev) (\`nsh\`), a Rust-first cross-platform native UI framework. It catalogs **${entries.length}** entries (updated ${latestUpdatedAt}): **${installable.length}** installable \`nshm\` modules verified with \`nsh add\` on \`nsh ${verifiedVersion}\`, clearly separated from **${frameworkCount}** non-installable framework crates.`;

  const lines = [
    `# ${isZh ? 'Awesome Native Shell 模块精选' : 'Awesome Native Shell Modules'}`,
    '',
    `> ${cleanText(summaryQuote)}`,
    '',
    isZh
      ? `HTML 版本：[${htmlUrl}](${htmlUrl}) · [English Markdown](${altMdUrl}) · [发现机制](${base}zh/discovery.md) · [关于与标准](${base}zh/about.md) · [index.json](${base}index.json)`
      : `HTML edition: [${htmlUrl}](${htmlUrl}) · [中文 Markdown](${altMdUrl}) · [Discovery](${base}discovery.md) · [About](${base}about.md) · [index.json](${base}index.json)`,
    '',
    `## ${isZh ? '什么是 Awesome NSH 与 nshm？' : 'What Are Awesome NSH and nshm?'}`,
    '',
    cleanText(homeSeo?.definition || defaultDefinition),
    '',
    isZh
      ? `- **可安装 nshm：** ${installable.length} 个（\`nsh ${verifiedVersion}\` 实测通过）\n- **官方框架 Crate（非 nshm）：** ${frameworkCount} 个\n- **示例与工程模板：** ${templatesCount} 个\n- **官方文档与教程：** ${articlesCount} 篇`
      : `- **Installable nshm:** ${installable.length} (verified on \`nsh ${verifiedVersion}\`)\n- **Framework crates (NOT nshm):** ${frameworkCount}\n- **Examples & templates:** ${templatesCount}\n- **Guides & documentation:** ${articlesCount}`,
    '',
    `## ${isZh ? '安装来源对比（crates.io vs github: vs Git URL）' : 'Install Source Comparison'}`,
    '',
    isZh
      ? '| 安装来源 | 数量 | 命令格式 | 说明 |\n|---|---:|---|---|'
      : '| Source | Count | Command Format | Notes |\n|---|---:|---|---|',
    isZh
      ? `| crates.io | ${bySource['crates.io'].length} | \`nsh add <crate>\` | 发布于 crates.io 且依赖兼容 \`nsh 0.7\`（含 \`nsh-extra --features ...\`）。 |`
      : `| crates.io | ${bySource['crates.io'].length} | \`nsh add <crate>\` | Published on crates.io with \`0.7\`-compatible \`nsh-core\` (including \`nsh-extra --features ...\`). |`,
    isZh
      ? `| \`github:owner/repo\` | ${bySource.github.length} | \`nsh add github:owner/repo\` | 仅托管于 GitHub 或 crates.io 版本早于 \`0.7.1\`（如 \`nsh-platform-harmonyos\`）。 |`
      : `| \`github:owner/repo\` | ${bySource.github.length} | \`nsh add github:owner/repo\` | GitHub-only packages or newer \`0.7\` releases ahead of crates.io (\`nsh-platform-harmonyos\`). |`,
    isZh
      ? `| Git URL \`--rev\` | ${bySource.git.length} | \`nsh add https://github.com/...git --rev master\` | 当 crates.io 与 tag 仍锁定 \`^0.6\` 而默认分支支持 \`^0.7.1\` 时使用（\`nsh-widgets\`）。 |`
      : `| Git URL \`--rev\` | ${bySource.git.length} | \`nsh add https://github.com/...git --rev master\` | Used when crates.io/tag pins \`^0.6\` while \`master\` targets \`^0.7.1\` (\`nsh-widgets\`). |`,
    '',
    isZh
      ? '> 安全提示：安装 Rust 或 TSX `nshm` 会以应用完整权限执行 `build.rs`、过程宏与运行时代码，并可通过 `[package.metadata.nsh]` 声明系统权限。集成前请审查源码与 `nsh.lock`。'
      : '> Security warning: Installing a Rust or TSX `nshm` executes `build.rs`, procedural macros, and runtime code with full app permissions, and crates can contribute entitlements via `[package.metadata.nsh]`. Inspect repositories and `nsh.lock` before shipping.',
  ];

  for (const sec of sections) {
    const secEntries = entries.filter((e) => e.section === sec.id);
    if (secEntries.length === 0) continue;
    const secTitle = sec.title?.[isZh ? 'zh' : 'en'] || sec.id;
    const secDesc = sec.description?.[isZh ? 'zh' : 'en'] || '';
    const slug = getSectionHubSlug(sec.id);
    const hubUrl = isZh ? `${base}zh/${slug}/` : `${base}${slug}/`;

    lines.push('', `## ${cleanText(secTitle)} (${secEntries.length})`, '');
    lines.push(`${cleanText(secDesc)} ([${isZh ? '查看专题页' : 'Section hub'}](${hubUrl}))`);

    const secCats = categories.filter(
      (c) => c.section === sec.id && secEntries.some((e) => e.category === c.id),
    );
    for (const cat of secCats) {
      const catEntries = secEntries.filter((e) => e.category === cat.id);
      lines.push('', `### ${cleanText(cat.title?.[isZh ? 'zh' : 'en'] || cat.id)}`, '');
      for (const item of catEntries) {
        lines.push(formatEntryMarkdownBlock(item, isZh ? 'zh' : 'en', base));
      }
    }
  }

  lines.push(
    '',
    `## ${isZh ? '机器可读接口' : 'Machine-Readable Feeds'}`,
    '',
    `- [index.json](${base}index.json)`,
    `- [count.json](${base}count.json)`,
    `- [llms.txt](${base}llms.txt)`,
    `- [llms-full.txt](${base}llms-full.txt)`,
    `- [ai-catalog.json](${base}.well-known/ai-catalog.json)`,
  );

  return `${lines.join('\n')}\n`;
}

function renderSectionMarkdown({ base, isZh, data, section, canonicalUrl, alternateUrl }) {
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const resolved = resolveSection(data, section);
  if (!resolved) {
    return renderHomeMarkdown({ base, isZh, data, canonicalUrl, alternateUrl });
  }

  const secEntries = entries.filter((e) => e.section === resolved.id);
  const slug = getSectionHubSlug(resolved.id);
  const htmlUrl = canonicalUrl || (isZh ? `${base}zh/${slug}/` : `${base}${slug}/`);
  const altHtmlUrl = alternateUrl || (isZh ? `${base}${slug}/` : `${base}zh/${slug}/`);
  const title = resolved.title?.[isZh ? 'zh' : 'en'] || resolved.id;
  const desc = resolved.description?.[isZh ? 'zh' : 'en'] || '';

  const lines = [
    `# ${cleanText(title)}`,
    '',
    `> ${cleanText(desc)}`,
    '',
    isZh
      ? `HTML 专题页：[${htmlUrl}](${htmlUrl}) · [English](${altHtmlUrl}) · [返回目录首页](${base}zh/index.md)`
      : `HTML hub: [${htmlUrl}](${htmlUrl}) · [中文](${altHtmlUrl}) · [Back to home](${base}index.md)`,
    '',
    isZh
      ? `本分类共收录 **${secEntries.length}** 个条目，全部来自单一数据源 \`data/entries.json\`（验证基准：\`nsh ${data?.nshVerifiedVersion || '0.7.1'}\`）。`
      : `This section includes **${secEntries.length}** curated entries sourced from \`data/entries.json\` (verified against \`nsh ${data?.nshVerifiedVersion || '0.7.1'}\`).`,
  ];

  if (resolved.id === 'framework') {
    lines.push(
      '',
      isZh
        ? '> **重要区分：** 以下均为 `longbridge/nsh` 维护的框架与平台核心 Crate，**并非 `nshm` 模块**，无法通过 `nsh add` 安装。'
        : '> **Important distinction:** Every crate below is an official framework or backend crate maintained in `longbridge/nsh`. They are **NOT `nshm` packages** and cannot be installed with `nsh add`.',
    );
  }

  const secCats = categories.filter(
    (c) => c.section === resolved.id && secEntries.some((e) => e.category === c.id),
  );
  for (const cat of secCats) {
    const catEntries = secEntries.filter((e) => e.category === cat.id);
    lines.push('', `## ${cleanText(cat.title?.[isZh ? 'zh' : 'en'] || cat.id)} (${catEntries.length})`, '');
    for (const item of catEntries) {
      lines.push(formatEntryMarkdownBlock(item, isZh ? 'zh' : 'en', base));
    }
  }

  return `${lines.join('\n')}\n`;
}

function renderModuleMarkdown({
  base,
  isZh,
  data,
  entry,
  canonicalUrl,
  alternateUrl,
  relatedEntries,
}) {
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const resolved = resolveEntry(data, entry);
  if (!resolved) {
    return renderHomeMarkdown({ base, isZh, data, canonicalUrl, alternateUrl });
  }

  const catObj = categories.find((c) => c.id === resolved.category);
  const catTitle = catObj?.title?.[isZh ? 'zh' : 'en'] || resolved.category;
  const htmlUrl = canonicalUrl || (isZh ? `${base}zh/nshm/${resolved.id}/` : `${base}nshm/${resolved.id}/`);
  const altMdUrl =
    alternateUrl || (isZh ? `${base}nshm/${resolved.id}.md` : `${base}zh/nshm/${resolved.id}.md`);
  const desc = resolved.description?.[isZh ? 'zh' : 'en'] || resolved.description?.en || '';
  const note = resolved.notes?.[isZh ? 'zh' : 'en'] || resolved.notes?.en || '';
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';

  const lines = [
    `# ${cleanText(resolved.name)}`,
    '',
    `> ${cleanText(desc)}`,
    '',
    isZh
      ? `HTML 详情页：[${htmlUrl}](${htmlUrl}) · [English Markdown](${altMdUrl}) · [全部可安装 nshm](${base}zh/nshm/)`
      : `HTML page: [${htmlUrl}](${htmlUrl}) · [中文 Markdown](${altMdUrl}) · [All installable nshm](${base}nshm/)`,
    '',
    `## ${isZh ? '模块档案' : 'Module Facts'}`,
    '',
    isZh ? '| 字段 | 值 |\n|---|---|' : '| Field | Value |\n|---|---|',
    `| ID | ${escapeMdTableCell(wrapInlineCode(resolved.id))} |`,
    `| ${isZh ? '分类' : 'Category'} | ${escapeMdTableCell(catTitle)} (${escapeMdTableCell(wrapInlineCode(resolved.category))}) |`,
    `| ${isZh ? '形态' : 'Kind'} | ${escapeMdTableCell(getKindLabel(resolved.kind, isZh))} (${escapeMdTableCell(wrapInlineCode(resolved.kind))}) |`,
    `| ${isZh ? '分发来源' : 'Source Type'} | ${escapeMdTableCell(wrapInlineCode(resolved.sourceType))} |`,
    `| ${isZh ? '模块版本' : 'Package Version'} | ${escapeMdTableCell(wrapInlineCode(resolved.version || 'N/A'))} |`,
    `| ${isZh ? '兼容 NSH 版本' : 'NSH Requirement'} | ${escapeMdTableCell(wrapInlineCode(resolved.nshVersion || verifiedVersion))} |`,
    `| ${isZh ? '支持平台' : 'Platforms'} | ${escapeMdTableCell((resolved.platforms || []).join(isZh ? '、' : ', '))} |`,
    `| ${isZh ? '许可证' : 'License'} | ${escapeMdTableCell(resolved.license)} |`,
    `| ${isZh ? '最近核验更新' : 'Updated'} | ${escapeMdTableCell(resolved.updatedAt)} |`,
    `| ${isZh ? '源码仓库' : 'Source Repository'} | [${escapeMdLinkLabel(escapeMdTableCell(resolved.sourceUrl))}](${resolved.sourceUrl}) |`,
  ];

  if (resolved.cratesUrl && resolved.cratesUrl !== resolved.sourceUrl) {
    lines.push(
      `| crates.io | [${escapeMdLinkLabel(escapeMdTableCell(resolved.cratesUrl))}](${resolved.cratesUrl}) |`,
    );
  }
  if (resolved.homepage && resolved.homepage !== resolved.sourceUrl) {
    lines.push(
      `| ${isZh ? '文档 / 演示' : 'Docs / Demo'} | [${escapeMdLinkLabel(escapeMdTableCell(resolved.homepage))}](${resolved.homepage}) |`,
    );
  }

  lines.push('', `## ${isZh ? '安装命令与验证说明' : 'Installation & Verification'}`, '');
  if (resolved.installable && resolved.installCommand) {
    lines.push(renderCodeFence('bash', resolved.installCommand), '');
    lines.push(
      isZh
        ? `该模块已在干净临时应用中于 \`nsh ${verifiedVersion}\` 实测通过 \`nsh add\` 解析安装（不代表已在全部目标平台完成真机编译运行）。`
        : `Verified with \`nsh add\` in a clean scratch app on \`nsh ${verifiedVersion}\` (install resolution only; does not claim full cross-platform on-device compilation).`,
    );
  } else {
    lines.push(
      isZh
        ? `该条目不属于可安装 \`nshm\`，不可使用 \`nsh add\` 安装。`
        : `This entry is not an installable \`nshm\` and cannot be installed via \`nsh add\`.`,
    );
  }

  if (note) {
    lines.push('', `## ${isZh ? '补充说明' : 'Implementation Notes'}`, '', cleanText(note));
  }

  const related = Array.isArray(relatedEntries)
    ? relatedEntries
    : entries.filter(
        (e) => e.installable && e.id !== resolved.id && e.category === resolved.category,
      );
  if (related.length > 0) {
    lines.push('', `## ${isZh ? '同分类相关模块' : 'Related Modules in This Category'}`, '');
    for (const rel of related) {
      const relUrl = isZh ? `${base}zh/nshm/${rel.id}.md` : `${base}nshm/${rel.id}.md`;
      const relDesc = rel.description?.[isZh ? 'zh' : 'en'] || rel.description?.en || '';
      lines.push(`- [${escapeMdLinkLabel(rel.name)}](${relUrl}) — ${cleanText(relDesc)}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function renderDiscoveryMarkdown({ base, isZh, data, canonicalUrl, alternateUrl }) {
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const installable = entries.filter((e) => e.installable);
  const frameworkCount = entries.filter((e) => e.section === 'framework').length;
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';
  const repoUrl = data?.repository || 'https://github.com/AkaraChen/nsh-awesome';
  const htmlUrl = canonicalUrl || (isZh ? `${base}zh/discovery/` : `${base}discovery/`);
  const altMdUrl = alternateUrl || (isZh ? `${base}discovery.md` : `${base}zh/discovery.md`);

  const lines = [
    `# ${isZh ? 'nshm 模块发现机制与验证方法论' : 'How nshm Modules Are Defined and Discovered'}`,
    '',
    isZh
      ? `> 基于 \`longbridge/nsh\`（\`nsh ${verifiedVersion}\`）源码审计与 6 大外部渠道实测扫描的 \`nshm\` 准入规则与验证记录。`
      : `> Empirical findings from inspecting \`longbridge/nsh\` (\`nsh ${verifiedVersion}\`) manifest rules and scanning 6 external discovery channels.`,
    '',
    isZh
      ? `HTML 报告：[${htmlUrl}](${htmlUrl}) · [English Markdown](${altMdUrl}) · [原始报告 docs/DISCOVERY.md](${repoUrl}/blob/main/docs/DISCOVERY.md)`
      : `HTML page: [${htmlUrl}](${htmlUrl}) · [中文 Markdown](${altMdUrl}) · [Raw docs/DISCOVERY.md](${repoUrl}/blob/main/docs/DISCOVERY.md)`,
    '',
    `## ${isZh ? '1. 什么样的包才是可安装的 nshm？' : '1. What Makes a Package an Installable nshm?'}`,
    '',
    isZh
      ? '仅仅在 crates.io 添加 `keywords = ["nshm"]` 或以 `nsh-` 命名并**不能**让包被 `nsh add` 安装。依据 `longbridge/nsh` 中 `crates/nsh-cli/src/nshm/manifest.rs` 源码，`nsh add` 仅接受同时满足**结构化清单规则**与**NSH 版本兼容检查（`check_nsh`）**的 4 类形态：'
      : 'Contrary to common assumptions, crates.io keywords (`keywords = ["nshm"]`) and crate names starting with `nsh-` do NOT make a crate installable via `nsh add`. Per `crates/nsh-cli/src/nshm/manifest.rs` in `longbridge/nsh`, `nsh add` accepts a package only when it meets structural manifest rules AND NSH version compatibility (`check_nsh`):',
    '',
    isZh
      ? '| 类型 | 必需清单文件 | 结构入口规则 | 版本兼容检查 |\n|---|---|---|---|'
      : '| Kind | Required Manifest Files | Structural Entry Criterion | NSH Version Check |\n|---|---|---|---|',
    isZh
      ? '| **Rust nshm** | `Cargo.toml` (`[package]`) | crate 根（默认 `src/lib.rs`）含 `#[native_module("<specifier>")]` | 检查 `[dependencies]`/`[workspace.dependencies]` 的 `nsh-core` 与可选 `nsh.json` `"nsh"` |'
      : '| **Rust nshm** | `Cargo.toml` (`[package]`) | `#[native_module("<specifier>")]` in `[lib]` root (`src/lib.rs`) | Checks `nsh-core` in `[dependencies]`/`[workspace.dependencies]` and optional `nsh.json` `"nsh"` |',
    isZh
      ? '| **TSX nshm** | `nsh.json`（无 `Cargo.toml`） | 含 `"name"`、semver `"version"` 及非空 `"exports"` 映射现有 TS/TSX | 检查可选 `"nsh"` semver 约束 |'
      : '| **TSX nshm** | `nsh.json` (no `Cargo.toml`) | `"name"`, semver `"version"`, and non-empty `"exports"` mapping existing files | Checks optional `"nsh"` semver requirement |',
    isZh
      ? '| **Hybrid nshm** | `Cargo.toml` + `nsh.json` | 同时具备 `#[native_module]` 与 `"exports"` 且导出名不冲突 | 同时检查 `Cargo.toml` `nsh-core` 与 `nsh.json` `"nsh"` |'
      : '| **Hybrid nshm** | `Cargo.toml` + `nsh.json` | Both `#[native_module]` and `nsh.json` `"exports"` without specifier collision | Checks both `Cargo.toml` `nsh-core` and `nsh.json` `"nsh"` |',
    isZh
      ? '| **Platform nshm** | `Cargo.toml` + `nsh.json` | `nsh.json` 声明 `"platform": "<target>"` 且构建 `nsh-platform-<target>` | 检查 `Cargo.toml` `nsh-core` 与 `nsh.json` `"nsh"` |'
      : '| **Platform nshm** | `Cargo.toml` + `nsh.json` | `nsh.json` declares `"platform": "<target>"` and builds `nsh-platform-<target>` | Checks `Cargo.toml` `nsh-core` and `nsh.json` `"nsh"` |',
    '',
    isZh
      ? '**`cargo publish` 解析边界发现：** `cargo publish` 会把 `[dependencies] nsh-core = "0.6.0"` 规范化改写为 `[dependencies.nsh-core]` 子表，而 `nsh-cli 0.7.1` 的 `nsh_core_requirement` 仅扫描 `[dependencies]`/`[workspace.dependencies]` 表，导致 **18 个锁定 `0.6` 的 crates.io crate**（17 个 `SuperNSH/*` 与 `nsh-platform-miniprogram@0.1.0`）技术上能绕过检查。本目录将这 18 个 `0.6` crate 暂不列入 `0.7.1` 清洁可安装清单。'
      : '**Discovered `cargo publish` parser quirk (`nsh-cli 0.7.1`):** `cargo publish` rewrites `[dependencies] nsh-core = "0.6.0"` into a `[dependencies.nsh-core]` sub-table, which `manifest.rs::nsh_core_requirement` skips. As a result, **18 crates.io crates pinned to `0.6`** (17 `SuperNSH/*` crates plus `nsh-platform-miniprogram@0.1.0`) pass `nsh add` technically despite targeting NSH 0.6; this catalog excludes them until updated to `0.7` on crates.io.',
    '',
    `## ${isZh ? '2. 6 大发现渠道与实测命中数' : '2. Discovery Channels Tested & Empirical Hit Counts'}`,
    '',
    isZh
      ? '`nsh` CLI 本身无内置搜索命令。`scripts/discover.mjs` 联合扫描 **119 个 crates.io crate** 与 **89 个 GitHub 仓库**：'
      : 'The `nsh` CLI has no built-in search command. Running `node scripts/discover.mjs` combines **6 external channels**, inspecting **119 unique crates.io crates** and **89 unique GitHub repositories**:',
    '',
    isZh
      ? '| 发现渠道 | 原始命中 | NSH 相关 | 关键观察 |\n|---|---:|---:|---|'
      : '| Channel | Raw Hits | Relevant Hits | Key Findings |\n|---|---:|---:|---|',
    isZh
      ? '| 1. crates.io `keyword=nshm` | 68 | 68 | 含 40 个图标子包、17 个 `0.6` `SuperNSH/*` crate 与 3 个非 nshm 辅助 crate。 |'
      : '| 1. crates.io `keyword=nshm` | 68 | 68 | Includes 40 icon sub-crates, 17 `0.6`-pinned `SuperNSH/*` crates, and 3 non-nshm helpers. |',
    isZh
      ? '| 2. crates.io `nsh-core` 反向依赖 | 107 | 104 | 捕获 18 个官方框架 crate 及未打 `nshm` 标签的平台包（如 `nsh-platform-harmonyos`）。 |'
      : '| 2. crates.io `nsh-core` reverse dependencies | 107 | 104 | Catches 18 framework crates and untagged platform packages (`nsh-platform-harmonyos`). |',
    isZh
      ? '| 3. crates.io `keyword=nsh` & `native-shell` | 95 + 1 | 94 + 1 | 补充发现 `nsh-auth`、`nsh-form`、`maplibre-nsh` 等非 nshm Rust crate。 |'
      : '| 3. crates.io `keyword=nsh` & `native-shell` | 95 + 1 | 94 + 1 | Surfaces additional Cargo crates (`nsh-auth`, `nsh-form`, `maplibre-nsh`) that are not nshms. |',
    isZh
      ? '| 4. `longbridge/nsh-showcases` | 10 | 10 | 官方 Showcase 目录；6 个可安装、4 个为非 nshm CLI/独立应用。 |'
      : '| 4. `longbridge/nsh-showcases` | 10 | 10 | Official curated showcase; 6 installable and 4 non-nshm CLIs/apps. |',
    isZh
      ? '| 5. GitHub Topic & Code Search | 1+57+7 / 19+56+29 | — | 发现 `nsh-shadcn`、`nsh-query`；GitHub Code Search 对 `org:SuperNSH` 返回 0 结果。 |'
      : '| 5. GitHub Topic & Code Search | 1+57+7 / 19+56+29 | — | Found `nsh-shadcn` and `nsh-query`; Code Search returned 0 hits for `org:SuperNSH`. |',
    isZh
      ? '| 6. 已知 NSH 组织仓库枚举 | 31 (`SuperNSH`) | 31 | 补全了代码搜索遗漏的 `SuperNSH/webgpu`、`SuperNSH/skia`、`SuperNSH/widgets`。 |'
      : '| 6. Multi-crate GitHub Org Enumeration | 31 (`SuperNSH`) | 31 | Discovered `SuperNSH/webgpu`, `SuperNSH/skia`, and `SuperNSH/widgets`, missed by Code Search. |',
    '',
    `## ${isZh ? `3. 当前 ${installable.length} 个已验证可安装 nshm 清单（nsh ${verifiedVersion}）` : `3. Accepted Installable nshm Modules (${installable.length} Verified on nsh ${verifiedVersion})`}`,
    '',
    isZh
      ? '| 模块 | 来源 | 实测安装命令 | 版本 |\n|---|---|---|---|'
      : '| Package | Source | Verified Command | Version |\n|---|---|---|---|',
  ];

  for (const item of installable) {
    lines.push(
      `| [${escapeMdLinkLabel(escapeMdTableCell(item.name))}](${base}${isZh ? 'zh/' : ''}nshm/${item.id}.md) | ${escapeMdTableCell(wrapInlineCode(item.sourceType))} | ${escapeMdTableCell(wrapInlineCode(item.installCommand))} | ${escapeMdTableCell(wrapInlineCode(item.version || 'N/A'))} |`,
    );
  }

  lines.push(
    '',
    `## ${isZh ? '4. 排除与暂缓说明' : '4. Excluded & Deferred Candidates'}`,
    '',
    isZh
      ? `- **官方框架 Crate（${frameworkCount} 个）：** 不含 \`#[native_module]\`，单独列于框架分类并明确标为「非 nshm」。\n- **40 个图标集子 crate + 3 个内部数据 crate：** 归并在父条目 \`nsh-icon\`（5 个）与 \`supernsh-icons\`（35 个）下说明。\n- **端用户应用与模板（\`SuperNSH/starter\`、\`spotish\`、\`Ferrix\`）：** \`publish = false\` 且 \`nsh.json\` 含 \`"root"\`/\`"id"\`，不属于可复用库。\n- **版本不兼容或尚在开发：** \`nsh-gpu-lexer\`（\`0.6\`）、\`honsunrise/nsh-ext\`（严格 \`=0.7.0\`）、18 个 \`0.6\` 规范化 crate 与 \`nsh-directories\` 暂未列入 \`0.7.1\` 可安装列表。`
      : `- **${frameworkCount} official framework crates:** Lack \`#[native_module]\` and live in the dedicated non-nshm framework section.\n- **40 icon-set subcrates + 3 internal data crates:** Documented under parent entries \`nsh-icon\` (5 packs) and \`supernsh-icons\` (35 packs).\n- **End-user apps (\`SuperNSH/starter\`, \`huacnlee/spotish\`, \`ryujane/Ferrix\`):** Set \`publish = false\` and use app-level \`"root"\`/\`"id"\` keys rather than \`"exports"\`.\n- **Incompatible or unreleased:** \`nsh-gpu-lexer\` (\`0.6\`), \`honsunrise/nsh-ext\` (\`=0.7.0\` exact pin), 18 normalized \`0.6\` crates, and \`nsh-directories\` (in development) are excluded from the \`0.7.1\` list.`,
  );

  return `${lines.join('\n')}\n`;
}

function renderAboutMarkdown({ base, isZh, data, canonicalUrl, alternateUrl }) {
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const installableCount = entries.filter((e) => e.installable).length;
  const verifiedVersion = data?.nshVerifiedVersion || '0.7.1';
  const latestUpdatedAt = getLatestUpdatedAt(data);
  const repoUrl = data?.repository || 'https://github.com/AkaraChen/nsh-awesome';
  const htmlUrl = canonicalUrl || (isZh ? `${base}zh/about/` : `${base}about/`);
  const altMdUrl = alternateUrl || (isZh ? `${base}about.md` : `${base}zh/about.md`);

  const lines = [
    `# ${isZh ? '关于 Awesome NSH 与收录标准' : 'About Awesome NSH & Curation Standards'}`,
    '',
    isZh
      ? `> 独立维护的 Native Shell 生态开源目录，单一数据源 \`data/entries.json\` 驱动全部页面与机器可读索引（最近更新 ${latestUpdatedAt}）。`
      : `> Community-curated Native Shell ecosystem directory driven by \`data/entries.json\` as a single source of truth (updated ${latestUpdatedAt}).`,
    '',
    isZh
      ? `HTML 页面：[${htmlUrl}](${htmlUrl}) · [English Markdown](${altMdUrl}) · [发现机制报告](${base}zh/discovery.md)`
      : `HTML page: [${htmlUrl}](${htmlUrl}) · [中文 Markdown](${altMdUrl}) · [Discovery Methodology](${base}discovery.md)`,
    '',
    `## ${isZh ? '维护者与项目定位（Who & Why）' : 'Maintainer & Purpose (Who & Why)'}`,
    '',
    isZh
      ? `本项目由 [AkaraChen](https://github.com/AkaraChen) 维护并基于 MIT 许可证开源（仓库：[AkaraChen/nsh-awesome](${repoUrl})）。因 \`nsh\` CLI 尚无内置包搜索命令，社区难以及时分辨哪些 crate 真正支持 \`nsh add\`、哪些属于框架内部 crate 或仍停留在旧版本 \`0.6\`，因此构建了这份经过实测验证的人工 + 自动双语目录与 \`index.json\` 接口。`
      : `Maintained by [AkaraChen](https://github.com/AkaraChen) under the MIT license ([AkaraChen/nsh-awesome](${repoUrl})). Because the \`nsh\` CLI has no built-in package search command, Awesome NSH separates verified \`nsh add\`-compatible \`nshm\` modules from official framework crates, templates, and legacy \`0.6\` packages.`,
    '',
    `## ${isZh ? '验证流程与诚实边界（How & Verification Scope）' : 'Verification Process & Honest Boundaries (How)'}`,
    '',
    isZh
      ? `- **实测基线：** 全量 ${entries.length} 个条目由 \`data/entries.json\` 统一生成，\`scripts/verify-install.mjs\` 在隔离临时项目中针对 \`nsh ${verifiedVersion}\` 实测每一个可安装条目的 \`nsh add\` 命令（当前通过 **${installableCount}** 个）。\n- **诚实边界声明：** 通过验证仅代表包满足 \`nsh ${verifiedVersion}\` 清单规范并可成功执行 \`nsh add\` 依赖解析，**不声明**已在 iOS、Android、macOS、Windows、Linux、HarmonyOS 或 Web 真机环境完成全量编译与运行时测试。\n- **禁止编造：** 所有平台列表、版本号、许可证与限制说明均直接核对上游仓库、Cargo.toml、nsh.json 与 \`docs/DISCOVERY.md\`。`
      : `- **Empirical baseline:** All ${entries.length} entries generate from \`data/entries.json\`. \`scripts/verify-install.mjs\` runs real \`nsh add\` commands in clean scratch projects on \`nsh ${verifiedVersion}\` for every installable module (**${installableCount}** passing).\n- **Honest verification boundary:** Inclusion verifies manifest conformance and \`nsh add\` resolution on \`nsh ${verifiedVersion}\`; it does **not** claim full on-device compilation or runtime testing across every listed OS target.\n- **Zero fabrication:** Platforms, versions, licenses, and caveats come directly from upstream repositories, \`Cargo.toml\`, \`nsh.json\`, and \`docs/DISCOVERY.md\`.`,
    '',
    `## ${isZh ? '参与贡献与自动化门禁' : 'Contributing & Automated Checks'}`,
    '',
    isZh
      ? `欢迎通过编辑 \`data/entries.json\` 并运行 \`node scripts/generate.mjs\` 提交 Pull Request。CI 会自动运行 schema lint（\`scripts/lint.mjs\`）、生成物一致性检查（\`scripts/generate.mjs --check\`）、全量链接可用性校验（\`scripts/check-links.mjs\`）与 SEO 门禁。详情见 [${repoUrl}/blob/main/CONTRIBUTING.md](${repoUrl}/blob/main/CONTRIBUTING.md)。`
      : `Contributions are welcome via pull requests editing \`data/entries.json\` and running \`node scripts/generate.mjs\`. CI validates schema linting (\`scripts/lint.mjs\`), generated file parity (\`scripts/generate.mjs --check\`), live link checks (\`scripts/check-links.mjs\`), and automated SEO checks. See [${repoUrl}/blob/main/CONTRIBUTING.md](${repoUrl}/blob/main/CONTRIBUTING.md).`,
  ];

  return `${lines.join('\n')}\n`;
}

/**
 * Generate a clean, HTML-content-equivalent Markdown representation for any
 * Awesome NSH page (`home`, `section`, `module`, `discovery`, `about`) in `en` or `zh`.
 *
 * @param {object} [options]
 * @returns {string}
 */
export function buildPageMarkdown({
  siteUrl = SITE_URL,
  lang = 'en',
  pageType = 'home',
  data,
  seoContent = null,
  section = null,
  entry = null,
  canonicalUrl = null,
  alternateUrl = null,
  relatedEntries = null,
  discoveryMarkdown = null,
} = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const isZh = isChineseLang(lang);
  const type = String(pageType || 'home').toLowerCase();

  if (type === 'section' || type === 'hub') {
    return renderSectionMarkdown({
      base,
      isZh,
      data,
      section,
      canonicalUrl,
      alternateUrl,
    });
  }

  if (type === 'module' || type === 'nshm' || type === 'detail') {
    return renderModuleMarkdown({
      base,
      isZh,
      data,
      entry,
      canonicalUrl,
      alternateUrl,
      relatedEntries,
    });
  }

  if (type === 'discovery') {
    return renderDiscoveryMarkdown({
      base,
      isZh,
      data,
      canonicalUrl,
      alternateUrl,
      discoveryMarkdown,
    });
  }

  if (type === 'about') {
    return renderAboutMarkdown({
      base,
      isZh,
      data,
      canonicalUrl,
      alternateUrl,
    });
  }

  return renderHomeMarkdown({
    base,
    isZh,
    data,
    seoContent,
    canonicalUrl,
    alternateUrl,
  });
}

/**
 * Render `<link rel="ai-catalog">` and optional `<link rel="alternate" type="text/markdown">`
 * head tags for HTML pages.
 *
 * @param {object} [options]
 * @param {string} [options.siteUrl='https://nsh-awesome.vercel.app/']
 * @param {string|null} [options.markdownUrl=null]
 * @returns {string}
 */
export function renderAgenticHeadLinks({ siteUrl = SITE_URL, markdownUrl = null } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const escapeAttr = (v) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const tags = [
    `<link rel="ai-catalog" href="${escapeAttr(`${base}.well-known/ai-catalog.json`)}">`,
  ];
  if (markdownUrl && String(markdownUrl).trim()) {
    const absMd = resolveAbsoluteUrl(markdownUrl, base);
    tags.push(`<link rel="alternate" type="text/markdown" href="${escapeAttr(absMd)}">`);
  }
  return tags.join('\n');
}

/**
 * Build the progressive-enhancement WebMCP registration script snippet.
 *
 * Detects `document.modelContext ?? navigator.modelContext`, binds read-only
 * `search_nshm_modules` and `get_nshm_install_command` tools to the page's
 * shared `catalog` data, uses `AbortController` for lifecycle cleanup, and
 * emits explicit parameter schemas and safety annotations.
 *
 * @param {object} [options]
 * @param {boolean} [options.wrapInScriptTag=false]
 * @returns {string}
 */
export function buildWebMcpSnippet({ wrapInScriptTag = false } = {}) {
  const code = `(function () {
  var mc = (typeof document !== 'undefined' && document.modelContext)
    ? document.modelContext
    : (typeof navigator !== 'undefined' ? navigator.modelContext : null);
  if (!mc || typeof mc.registerTool !== 'function') return;

  if (typeof window !== 'undefined' && window.__nshAwesomeWebMcp && typeof window.__nshAwesomeWebMcp.dispose === 'function') {
    try { window.__nshAwesomeWebMcp.dispose(); } catch (e) {}
  }

  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var signal = controller ? controller.signal : undefined;

  if (typeof window !== 'undefined' && controller) {
    window.__nshAwesomeWebMcp = {
      controller: controller,
      dispose: function () { controller.abort(); }
    };
    window.addEventListener('pagehide', function () {
      controller.abort();
    }, { once: true });
  }

  function loadCatalog() {
    if (typeof window !== 'undefined' && window.__NSH_AWESOME_CATALOG__ && Array.isArray(window.__NSH_AWESOME_CATALOG__.entries)) {
      return Promise.resolve(window.__NSH_AWESOME_CATALOG__);
    }
    var embedded = typeof document !== 'undefined' ? document.getElementById('nsh-index-data') : null;
    if (embedded && embedded.textContent) {
      try {
        var parsed = JSON.parse(embedded.textContent);
        if (parsed && Array.isArray(parsed.entries)) {
          if (typeof window !== 'undefined') window.__NSH_AWESOME_CATALOG__ = parsed;
          return Promise.resolve(parsed);
        }
      } catch (e) {}
    }
    if (typeof fetch === 'function') {
      return fetch('/index.json', { cache: 'default' })
        .then(function (res) { return res && res.ok ? res.json() : null; })
        .then(function (data) {
          if (data && Array.isArray(data.entries)) {
            if (typeof window !== 'undefined') window.__NSH_AWESOME_CATALOG__ = data;
            return data;
          }
          return null;
        })
        .catch(function () { return null; });
    }
    return Promise.resolve(null);
  }

  function formatEntry(entry, lang) {
    var zh = typeof lang === 'string' && lang.toLowerCase().indexOf('zh') === 0;
    return {
      id: entry.id,
      name: entry.name,
      section: entry.section,
      category: entry.category,
      kind: entry.kind,
      installable: Boolean(entry.installable),
      sourceType: entry.sourceType,
      installCommand: entry.installCommand || null,
      version: entry.version || null,
      nshVersion: entry.nshVersion || null,
      platforms: Array.isArray(entry.platforms) ? entry.platforms : [],
      license: entry.license || null,
      updatedAt: entry.updatedAt || null,
      sourceUrl: entry.sourceUrl || null,
      cratesUrl: entry.cratesUrl || null,
      homepage: entry.homepage || null,
      description: (entry.description && (entry.description[zh ? 'zh' : 'en'] || entry.description.en)) || '',
      notes: (entry.notes && (entry.notes[zh ? 'zh' : 'en'] || entry.notes.en)) || null
    };
  }

  var registerOpts = signal ? { signal: signal } : undefined;

  Promise.resolve(mc.registerTool({
    name: 'search_nshm_modules',
    title: 'Search Native Shell Modules',
    description: 'Search and filter the curated Awesome NSH catalog of installable nshm modules, framework crates, templates, and documentation. Read-only lookup over static site catalog data.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          title: 'Search Query',
          description: 'Optional keyword to match module name, ID, description, platform, license, or install command.'
        },
        section: {
          type: 'string',
          title: 'Catalog Section',
          description: 'Filter by top-level catalog section.',
          enum: ['all', 'nshm', 'framework', 'templates', 'articles']
        },
        sourceType: {
          type: 'string',
          title: 'Distribution Source',
          description: 'Filter by package source type.',
          enum: ['all', 'crates.io', 'github', 'git', 'web']
        },
        platform: {
          type: 'string',
          title: 'Target Platform',
          description: 'Optional platform name filter such as macOS, iOS, Android, Linux, Windows, Web, GPUI, or HarmonyOS.'
        },
        installableOnly: {
          type: 'boolean',
          title: 'Installable Only',
          description: 'When true, return only modules verified as installable via nsh add.'
        },
        lang: {
          type: 'string',
          title: 'Language',
          description: 'Preferred language for descriptions and notes.',
          enum: ['en', 'zh']
        }
      }
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false
    },
    execute: function (input) {
      var args = input && typeof input === 'object' ? input : {};
      var q = typeof args.query === 'string' ? args.query.trim().toLowerCase() : '';
      var section = typeof args.section === 'string' && args.section !== 'all' ? args.section : null;
      var sourceType = typeof args.sourceType === 'string' && args.sourceType !== 'all' ? args.sourceType : null;
      var platform = typeof args.platform === 'string' ? args.platform.trim().toLowerCase() : '';
      var installableOnly = Boolean(args.installableOnly);
      var lang = args.lang === 'zh' ? 'zh' : 'en';

      return loadCatalog().then(function (catalog) {
        if (!catalog || !Array.isArray(catalog.entries)) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Catalog data is unavailable on this page.', results: [] })
            }]
          };
        }
        var matches = catalog.entries.filter(function (entry) {
          if (installableOnly && !entry.installable) return false;
          if (section && entry.section !== section) return false;
          if (sourceType && entry.sourceType !== sourceType) return false;
          if (platform) {
            var plats = (entry.platforms || []).map(function (p) { return String(p).toLowerCase(); });
            if (plats.indexOf(platform) === -1 && plats.indexOf('all') === -1) return false;
          }
          if (q) {
            var hay = [
              entry.id,
              entry.name,
              entry.kind,
              entry.sourceType,
              entry.installCommand || '',
              (entry.description && entry.description.en) || '',
              (entry.description && entry.description.zh) || '',
              (entry.notes && entry.notes.en) || '',
              (entry.notes && entry.notes.zh) || '',
              (entry.platforms || []).join(' '),
              entry.license || ''
            ].join(' ').toLowerCase();
            if (hay.indexOf(q) === -1) return false;
          }
          return true;
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              nshVerifiedVersion: catalog.nshVerifiedVersion || '0.7.1',
              totalMatches: matches.length,
              results: matches.slice(0, 25).map(function (item) { return formatEntry(item, lang); })
            }, null, 2)
          }]
        };
      });
    }
  }, registerOpts)).catch(function () {});

  Promise.resolve(mc.registerTool({
    name: 'get_nshm_install_command',
    title: 'Get Native Shell Module Install Command',
    description: 'Return the verified nsh add install command and package metadata for a specific Awesome NSH entry by ID or package name, distinguishing installable nshm modules from non-installable framework crates.',
    inputSchema: {
      type: 'object',
      properties: {
        idOrName: {
          type: 'string',
          title: 'Module ID or Name',
          description: 'Exact entry ID or package name (for example "nsh-omarchy", "nsh-widgets", or "nsh-core").'
        },
        lang: {
          type: 'string',
          title: 'Language',
          description: 'Preferred language for status notes and descriptions.',
          enum: ['en', 'zh']
        }
      },
      required: ['idOrName']
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false
    },
    execute: function (input) {
      var args = input && typeof input === 'object' ? input : {};
      var target = typeof args.idOrName === 'string' ? args.idOrName.trim().toLowerCase() : '';
      var lang = args.lang === 'zh' ? 'zh' : 'en';

      return loadCatalog().then(function (catalog) {
        if (!catalog || !Array.isArray(catalog.entries)) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ found: false, error: 'Catalog data is unavailable on this page.' })
            }]
          };
        }
        var found = catalog.entries.find(function (entry) {
          return entry.id.toLowerCase() === target ||
            entry.name.toLowerCase() === target ||
            entry.id.toLowerCase() === 'crate-' + target;
        });
        if (!found) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                found: false,
                query: args.idOrName || '',
                message: 'No matching entry found in Awesome NSH catalog.'
              }, null, 2)
            }]
          };
        }
        var payload = formatEntry(found, lang);
        payload.found = true;
        payload.nshVerifiedVersion = catalog.nshVerifiedVersion || '0.7.1';
        if (!found.installable) {
          payload.reason = found.section === 'framework'
            ? 'Official framework crate — NOT an installable nshm and cannot be installed with nsh add.'
            : 'Template or documentation entry — not an installable nshm package.';
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(payload, null, 2)
          }]
        };
      });
    }
  }, registerOpts)).catch(function () {});
})();`;

  return wrapInScriptTag ? `<script>\n${code}\n</script>` : code;
}
