#!/usr/bin/env node
/**
 * Generate README.md, README.zh.md, site/index.json, site/count.json,
 * site/badge.svg, site/index.html, site/404.html, and site/.nojekyll
 * from the single source of truth `data/entries.json`.
 *
 * Usage:
 *   node scripts/generate.mjs          # write all generated files
 *   node scripts/generate.mjs --check  # fail if any generated file is out of sync
 */
import fs from 'node:fs';
import path from 'node:path';

const CHECK = process.argv.includes('--check');
const DATA_PATH = 'data/entries.json';

export function githubHeadingAnchor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replaceAll(' ', '-');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeJsonForHtml(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function sectionHeading(section, lang) {
  const title = section.title[lang];
  return lang === 'en' ? title : `${section.emoji} ${title}`;
}

function categoryHeading(cat, lang) {
  const title = cat.title[lang];
  return lang === 'en' ? title : `${cat.emoji} ${title}`;
}

function renderEntryMarkdown(entry, lang) {
  const desc = entry.description[lang];
  const lines = [`- [${entry.name}](${entry.sourceUrl}) — ${desc}`];
  const metaParts = [];

  if (entry.installable && entry.installCommand) {
    metaParts.push(
      lang === 'en' ? `Install: \`${entry.installCommand}\`` : `安装：\`${entry.installCommand}\``,
    );
  } else if (entry.section === 'framework') {
    metaParts.push(
      lang === 'en'
        ? '**Not nshm** (cannot install with `nsh add`)'
        : '**非 nshm**（不可通过 `nsh add` 安装）',
    );
  }

  const kindLabels = {
    'rust-nshm': lang === 'en' ? 'Rust nshm' : 'Rust nshm',
    'tsx-nshm': lang === 'en' ? 'TSX nshm' : 'TSX nshm',
    'hybrid-nshm': lang === 'en' ? 'Rust + TSX nshm' : 'Rust + TSX nshm',
    'platform-nshm': lang === 'en' ? 'Platform nshm' : '平台 nshm',
    'framework-crate': lang === 'en' ? 'Framework crate' : '框架 Crate',
    examples: lang === 'en' ? 'Official examples' : '官方示例',
    template: lang === 'en' ? 'Template' : '工程模板',
    directory: lang === 'en' ? 'Directory' : '生态目录',
    'reference-app': lang === 'en' ? 'Reference app' : '参考应用',
    documentation: lang === 'en' ? 'Docs' : '官方文档',
    tutorial: lang === 'en' ? 'Tutorial' : '教程',
    article: lang === 'en' ? 'Guide' : '指南',
  };
  const kindLabel = kindLabels[entry.kind] ?? entry.kind;
  metaParts.push(lang === 'en' ? `Type: ${kindLabel}` : `类型：${kindLabel}`);

  if (entry.version) {
    metaParts.push(lang === 'en' ? `Version: \`${entry.version}\`` : `版本：\`${entry.version}\``);
  }
  if (entry.platforms?.length) {
    metaParts.push(
      lang === 'en'
        ? `Platforms: ${entry.platforms.join(', ')}`
        : `支持平台：${entry.platforms.join('、')}`,
    );
  }
  metaParts.push(lang === 'en' ? `License: ${entry.license}` : `许可证：${entry.license}`);
  metaParts.push(lang === 'en' ? `Updated: ${entry.updatedAt}` : `更新时间：${entry.updatedAt}`);

  const links = [];
  if (entry.cratesUrl && entry.cratesUrl !== entry.sourceUrl) {
    links.push(`[crates.io](${entry.cratesUrl})`);
  }
  if (entry.homepage && entry.homepage !== entry.sourceUrl) {
    links.push(`[${lang === 'en' ? 'Docs / Demo' : '文档 / 演示'}](${entry.homepage})`);
  }
  if (links.length) {
    metaParts.push(links.join(' · '));
  }

  lines.push(`  - ${metaParts.join(' · ')}`);
  if (entry.notes?.[lang]) {
    lines.push(`  - ${lang === 'en' ? 'Note' : '说明'}：${entry.notes[lang]}`.replace('Note：', 'Note: '));
  }
  return lines.join('\n');
}

function buildReadme(data, lang) {
  const isEn = lang === 'en';
  const nshmCount = data.entries.filter((e) => e.installable).length;
  const repoUrl = data.repository;
  const siteUrl = data.siteUrl;
  const indexUrl = `${siteUrl}index.json`;
  const countUrl = `${siteUrl}count.json`;
  const badgeUrl = `${siteUrl}badge.svg`;
  const shieldsUrl = `https://img.shields.io/endpoint?url=${encodeURIComponent(countUrl)}`;
  const ciBadgeUrl = `${repoUrl}/actions/workflows/ci.yml/badge.svg`;
  const ciRunUrl = `${repoUrl}/actions/workflows/ci.yml`;

  const lines = [];
  lines.push(`<!-- GENERATED FILE — DO NOT EDIT DIRECTLY. Edit data/entries.json and run \`node scripts/generate.mjs\`. -->`);
  lines.push('');
  lines.push(
    `# Awesome NSH [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) [![awesome · nsh](${badgeUrl})](${siteUrl}) [![nshm count](${shieldsUrl})](${siteUrl}) [![CI](${ciBadgeUrl})](${ciRunUrl})`,
  );
  lines.push('');
  lines.push(isEn ? 'English | [中文](README.zh.md)' : '[English](README.md) | 中文');
  lines.push('');
  lines.push(
    isEn
      ? `> A curated list of modules (\`nshm\`), framework crates, templates, and documentation for [Native Shell](https://nsh.dev) (\`nsh\`).`
      : `> [Native Shell](https://nsh.dev)（\`nsh\`）模块（\`nshm\`）、框架 crate、工程模板与教程文档精选列表。`,
  );
  lines.push('');
  lines.push(
    isEn
      ? `Native Shell is a Rust-first native UI framework: build once in TSX or Rust for iOS, Android, macOS, Windows, Linux, GPUI, TUI, and the web, and extend apps with installable packages called **nshm** via \`nsh add\`.`
      : `Native Shell 是一个以 Rust 为核心的原生跨平台 UI 框架：使用 TSX 或 Rust 构建一次，即可在 iOS、Android、macOS、Windows、Linux、GPUI、终端与 Web 上以原生控件渲染，并通过 \`nsh add\` 安装 **nshm** 扩展模块。`,
  );
  lines.push('');
  lines.push(
    isEn
      ? `> 🌐 **Interactive directory:** [${siteUrl}](${siteUrl}) (${nshmCount} installable \`nshm\` verified on \`nsh ${data.nshVerifiedVersion}\`) · 📡 **Machine-readable index:** [\`index.json\`](${indexUrl}) · 🔍 **Discovery methodology:** [\`docs/DISCOVERY.md\`](docs/DISCOVERY.md)`
      : `> 🌐 **交互式网页目录：** [${siteUrl}](${siteUrl})（已在 \`nsh ${data.nshVerifiedVersion}\` 实测通过 ${nshmCount} 个可安装 \`nshm\`） · 📡 **机器可读索引：** [\`index.json\`](${indexUrl}) · 🔍 **发现机制调研报告：** [\`docs/DISCOVERY.md\`](docs/DISCOVERY.md)`,
  );
  lines.push('');
  lines.push('> [!WARNING]');
  lines.push(
    isEn
      ? '> Installing a Rust or TSX `nshm` runs its build scripts (`build.rs`), procedural macros, and runtime code with your app\'s full permissions, and crates can contribute platform permissions/entitlements via `[package.metadata.nsh]`. Inspect source repositories and `nsh.lock` changes before shipping.'
      : '> 安装 Rust 或 TSX `nshm` 时，其构建脚本（`build.rs`）、过程宏及代码会以应用的完整权限运行，且 crate 可通过 `[package.metadata.nsh]` 声明系统权限与 Entitlements。集成前请先审阅源码仓库与 `nsh.lock` 变更。',
  );
  lines.push('');
  lines.push(isEn ? '## Contents' : '## 目录');
  lines.push('');

  // Table of Contents
  for (const section of data.sections) {
    const sh = sectionHeading(section, lang);
    lines.push(`- [${sh}](#${githubHeadingAnchor(sh)})`);
    const cats = data.categories.filter(
      (c) => c.section === section.id && data.entries.some((e) => e.section === section.id && e.category === c.id),
    );
    if (cats.length > 1 || section.id === 'nshm' || section.id === 'framework') {
      for (const cat of cats) {
        const ch = categoryHeading(cat, lang);
        lines.push(`  - [${ch}](#${githubHeadingAnchor(ch)})`);
      }
    }
  }
  const discTitle = isEn ? 'Discovery & Verification' : '发现机制与自动校验';
  const contribTitle = isEn ? 'Contributing' : '参与贡献';
  lines.push(`- [${discTitle}](#${githubHeadingAnchor(discTitle)})`);
  lines.push(`- [${contribTitle}](#${githubHeadingAnchor(contribTitle)})`);
  lines.push('');

  // Sections
  for (const section of data.sections) {
    const sh = sectionHeading(section, lang);
    lines.push(`## ${sh}`);
    lines.push('');
    if (section.id === 'framework') {
      lines.push('> [!IMPORTANT]');
      lines.push(`> ${section.description[lang]}`);
    } else {
      lines.push(section.description[lang]);
    }
    lines.push('');

    const cats = data.categories.filter(
      (c) => c.section === section.id && data.entries.some((e) => e.section === section.id && e.category === c.id),
    );
    const useSubheadings = cats.length > 1 || section.id === 'nshm' || section.id === 'framework';

    for (const cat of cats) {
      const catEntries = data.entries.filter((e) => e.section === section.id && e.category === cat.id);
      if (useSubheadings) {
        lines.push(`### ${categoryHeading(cat, lang)}`);
        lines.push('');
      }
      for (const entry of catEntries) {
        lines.push(renderEntryMarkdown(entry, lang));
      }
      lines.push('');
    }
  }

  // Discovery & Verification section
  lines.push(`## ${discTitle}`);
  lines.push('');
  lines.push(
    isEn
      ? `- **Empirical manifest rules:** An installable \`nshm\` requires \`#[native_module("...")]\` in its Rust crate root, \`nsh.json\` \`"exports"\` for TSX modules, or \`nsh.json\` \`"platform"\` for platform targets — not just the \`nshm\` keyword on crates.io. See [\`docs/DISCOVERY.md\`](docs/DISCOVERY.md) for hit counts across all 6 discovery channels and why 18 normalized \`0.6\` crates and 3 \`0.6\`/\`=0.7.0\` GitHub modules are currently excluded from the \`0.7.1\` installable list.`
      : `- **实测准入规则：** 可被 \`nsh add\` 安装的模块必须在 crate 根包含 \`#[native_module("...")]\`、在 \`nsh.json\` 声明 \`"exports"\`（TSX）或声明 \`"platform"\`（平台后端），仅有 crates.io \`nshm\` keyword 并不足够。详见 [\`docs/DISCOVERY.md\`](docs/DISCOVERY.md) 中 6 条发现渠道的实测命中数，以及为何 18 个 \`0.6\` 规范化 crate 与 3 个 \`0.6\`/\`=0.7.0\` 模块暂未列入 \`0.7.1\` 安装清单。`,
  );
  lines.push(
    isEn
      ? `- **Automated discovery & CI checks:** Run \`node scripts/discover.mjs\` to scan crates.io, GitHub, and \`longbridge/nsh-showcases\`. CI validates Markdown & schema lint (\`scripts/lint.mjs\`), generated file parity (\`scripts/generate.mjs --check\`), live link checks (\`scripts/check-links.mjs\`), and real \`nsh add\` installation (\`scripts/verify-install.mjs\`) for every installable entry.`
      : `- **自动发现与 CI 校验：** 运行 \`node scripts/discover.mjs\` 即可扫描 crates.io、GitHub 与 \`longbridge/nsh-showcases\`；CI 会校验 Markdown/Schema 格式（\`scripts/lint.mjs\`）、生成物一致性（\`scripts/generate.mjs --check\`）、全量链接可用性（\`scripts/check-links.mjs\`）及每条 \`nshm\` 的真实 \`nsh add\` 安装（\`scripts/verify-install.mjs\`）。`,
  );
  lines.push('');

  // Contributing section
  lines.push(`## ${contribTitle}`);
  lines.push('');
  lines.push(
    isEn
      ? `Contributions are welcome! Edit [\`data/entries.json\`](data/entries.json), run \`node scripts/generate.mjs\`, and see [\`CONTRIBUTING.md\`](CONTRIBUTING.md) before opening a pull request.`
      : `欢迎提交新模块或修正信息！请直接编辑单一数据源 [\`data/entries.json\`](data/entries.json) 并运行 \`node scripts/generate.mjs\`，详情见 [\`CONTRIBUTING.md\`](CONTRIBUTING.md)。`,
  );
  lines.push('');

  return lines.join('\n');
}

function buildIndexJson(data) {
  const latestUpdatedAt = data.entries.reduce(
    (max, e) => (e.updatedAt > max ? e.updatedAt : max),
    '1970-01-01',
  );
  const installableEntries = data.entries.filter((e) => e.installable);

  const sectionCounts = {};
  for (const s of data.sections) {
    sectionCounts[s.id] = data.entries.filter((e) => e.section === s.id).length;
  }

  return {
    format: 1,
    schemaVersion: 1,
    title: data.title,
    description: data.description,
    repository: data.repository,
    siteUrl: data.siteUrl,
    nshVerifiedVersion: data.nshVerifiedVersion,
    updatedAt: latestUpdatedAt,
    counts: {
      total: data.entries.length,
      installableNshm: installableEntries.length,
      sections: sectionCounts,
    },
    sections: data.sections,
    categories: data.categories,
    nshms: installableEntries.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      kind: e.kind,
      sourceType: e.sourceType,
      installCommand: e.installCommand,
      version: e.version,
      nshVersion: e.nshVersion,
      description: e.description,
      sourceUrl: e.sourceUrl,
      cratesUrl: e.cratesUrl,
      homepage: e.homepage,
      platforms: e.platforms,
      license: e.license,
      updatedAt: e.updatedAt,
      notes: e.notes,
    })),
    entries: data.entries,
  };
}

function buildCountJson(data) {
  const count = data.entries.filter((e) => e.installable).length;
  return {
    schemaVersion: 1,
    label: 'nshm',
    message: String(count),
    color: '8cc01d',
    cacheSeconds: 300,
  };
}

function buildBadgeSvg(data) {
  const count = data.entries.filter((e) => e.installable).length;
  const rightText = `nshm · ${count}`;
  const leftWidth = 70;
  const rightWidth = Math.max(66, rightText.length * 7 + 16);
  const totalWidth = leftWidth + rightWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="awesome: ${escapeHtml(rightText)}">
  <title>awesome: ${escapeHtml(rightText)}</title>
  <linearGradient id="g" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".12"/>
    <stop offset="1" stop-opacity=".14"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="#161920"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="#4a840a"/>
    <rect width="${totalWidth}" height="20" fill="url(#g)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="11" font-weight="600">
    <text x="${leftWidth / 2}" y="14" fill="#eefcc0">awesome</text>
    <text x="${leftWidth + rightWidth / 2}" y="14" fill="#ffffff">${escapeHtml(rightText)}</text>
  </g>
</svg>
`;
}

function buildSiteHtml(indexObj) {
  const embeddedJson = safeJsonForHtml(indexObj);
  const nshmCount = indexObj.counts.installableNshm;
  const siteUrl = indexObj.siteUrl;
  const indexUrl = `${siteUrl}index.json`;
  const countUrl = `${siteUrl}count.json`;

  return `<!doctype html>
<html lang="en" class="dark" data-theme-pref="system">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Awesome NSH — Curated Native Shell Modules &amp; Directory</title>
  <meta name="description" content="${escapeHtml(indexObj.description.en)}">
  <meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="#0e1016" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <link rel="canonical" href="${escapeHtml(siteUrl)}">
  <script>
    (function () {
      var params = new URLSearchParams(location.search);
      var qTheme = params.get('theme');
      var stored = null;
      try { stored = localStorage.getItem('nsh_awesome_theme'); } catch (e) {}
      var pref = (qTheme === 'light' || qTheme === 'dark')
        ? qTheme
        : (stored === 'light' || stored === 'dark' ? stored : 'system');
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      var root = document.documentElement;
      function applyTheme() {
        var p = root.dataset.themePref;
        var dark = p === 'dark' || (p === 'system' && media.matches);
        root.classList.toggle('dark', dark);
        root.classList.toggle('light', !dark);
      }
      root.dataset.themePref = pref;
      applyTheme();
      media.addEventListener('change', applyTheme);
      window.__applyAwesomeTheme = applyTheme;
    })();
  </script>
  <style>
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Noto Sans SC", Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      --background: #0e1016;
      --band-tinted: #12141b;
      --card: #161920;
      --raised: #1c1f27;
      --inset: #0b0d12;
      --foreground: #f3f5f8;
      --muted-foreground: #9aa3b2;
      --faint: #687082;
      --border: #282c35;
      --line: #1f222a;
      --citrus: #a9d63f;
      --citrus-hi: #c2ea62;
      --citrus-ink: #13160c;
      --citrus-soft: rgba(169, 214, 63, 0.14);
      --citrus-border: rgba(169, 214, 63, 0.34);
      --amber: #f5b942;
      --amber-soft: rgba(245, 185, 66, 0.14);
      --amber-border: rgba(245, 185, 66, 0.36);
      --sky: #5eb8ff;
      --sky-soft: rgba(94, 184, 255, 0.13);
      --nav-bg: rgba(14, 16, 22, 0.78);
      --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 20px -12px rgba(0, 0, 0, 0.55);
      --radius: 12px;
      --radius-sm: 8px;
    }
    html.light {
      --background: #ffffff;
      --band-tinted: #f7f7f8;
      --card: #ffffff;
      --raised: #f2f3f6;
      --inset: #f7f8fa;
      --foreground: #14171f;
      --muted-foreground: #565d6d;
      --faint: #848b99;
      --border: #e2e4e9;
      --line: #eceef2;
      --citrus: #4a840a;
      --citrus-hi: #4a840a;
      --citrus-ink: #ffffff;
      --citrus-soft: rgba(74, 132, 10, 0.10);
      --citrus-border: rgba(74, 132, 10, 0.30);
      --amber: #9b5c00;
      --amber-soft: rgba(180, 106, 0, 0.10);
      --amber-border: rgba(180, 106, 0, 0.32);
      --sky: #0969da;
      --sky-soft: rgba(9, 105, 218, 0.10);
      --nav-bg: rgba(255, 255, 255, 0.82);
      --shadow-card: 0 1px 2px rgba(16, 20, 30, 0.05), 0 6px 18px -10px rgba(16, 20, 30, 0.08);
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--citrus); text-decoration: none; }
    a:hover { text-decoration: underline; text-underline-offset: 3px; }
    button { font-family: inherit; cursor: pointer; }
    code {
      font-family: var(--font-mono);
      font-size: 0.87em;
      background: var(--raised);
      border: 1px solid var(--border);
      padding: 0.1em 0.35em;
      border-radius: 5px;
    }
    .container {
      width: min(1180px, 100% - 2rem);
      margin: 0 auto;
    }
    .nav {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--nav-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--line);
    }
    .nav__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      min-height: 58px;
      padding: 0.5rem 0;
      flex-wrap: wrap;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--foreground);
      font-weight: 650;
      font-size: 1.02rem;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .brand:hover { text-decoration: none; }
    .brand__tag {
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--citrus);
      background: var(--citrus-soft);
      border: 1px solid var(--citrus-border);
      padding: 0.12rem 0.5rem;
      border-radius: 999px;
    }
    .nav__actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .nav__link, .ctrl-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.84rem;
      font-weight: 500;
      color: var(--muted-foreground);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      padding: 0.36rem 0.62rem;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .nav__link:hover, .ctrl-btn:hover {
      color: var(--foreground);
      background: var(--raised);
      border-color: var(--border);
      text-decoration: none;
    }
    .ctrl-btn {
      border-color: var(--border);
      background: var(--card);
      color: var(--foreground);
    }
    .hero {
      position: relative;
      border-bottom: 1px solid var(--line);
      background:
        radial-gradient(62% 85% at 88% 8%, var(--citrus-soft), transparent 72%),
        var(--band-tinted);
      padding: 2.5rem 0 2.1rem;
    }
    .hero__top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .hero__copy { max-width: 720px; min-width: 0; }
    .hero h1 {
      margin: 0;
      font-size: clamp(1.95rem, 4.2vw, 2.95rem);
      font-weight: 680;
      letter-spacing: -0.035em;
      line-height: 1.1;
    }
    .hero__desc {
      margin: 0.8rem 0 0;
      color: var(--muted-foreground);
      font-size: 1.03rem;
      line-height: 1.58;
    }
    .hero__stats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1.2rem;
    }
    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 550;
      padding: 0.32rem 0.72rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--foreground);
    }
    .stat-pill--accent {
      background: var(--citrus-soft);
      border-color: var(--citrus-border);
      color: var(--citrus);
    }
    .endpoint-box {
      margin-top: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-wrap: wrap;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.6rem 0.8rem;
      max-width: 720px;
    }
    .endpoint-box__label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--muted-foreground);
      white-space: nowrap;
    }
    .endpoint-box__url {
      font-family: var(--font-mono);
      font-size: 0.81rem;
      color: var(--foreground);
      word-break: break-all;
      flex: 1 1 220px;
    }
    .controls {
      position: sticky;
      top: 58px;
      z-index: 30;
      background: var(--nav-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--line);
      padding: 0.85rem 0;
    }
    .controls__row {
      display: flex;
      gap: 0.65rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-wrap {
      position: relative;
      flex: 1 1 280px;
      min-width: 0;
    }
    .search-input {
      width: 100%;
      background: var(--card);
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.56rem 2.4rem 0.56rem 2.15rem;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-input:focus {
      border-color: var(--citrus);
      box-shadow: 0 0 0 3px var(--citrus-soft);
    }
    .search-icon {
      position: absolute;
      left: 0.72rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--faint);
      pointer-events: none;
    }
    .search-kbd {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      font-family: var(--font-mono);
      font-size: 0.73rem;
      color: var(--faint);
      border: 1px solid var(--border);
      background: var(--raised);
      border-radius: 4px;
      padding: 0.05rem 0.35rem;
      pointer-events: none;
    }
    .select-filter {
      background: var(--card);
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.54rem 0.72rem;
      font-size: 0.86rem;
    }
    .chips {
      display: flex;
      gap: 0.42rem;
      flex-wrap: wrap;
      margin-top: 0.65rem;
    }
    .chip {
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--muted-foreground);
      border-radius: 999px;
      padding: 0.28rem 0.74rem;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.14s;
    }
    .chip:hover { color: var(--foreground); border-color: var(--faint); }
    .chip.is-active {
      background: var(--citrus);
      color: var(--citrus-ink);
      border-color: var(--citrus);
      font-weight: 600;
    }
    .chips--sub { margin-top: 0.45rem; }
    .chip--sub { font-size: 0.78rem; padding: 0.2rem 0.62rem; }
    main { padding: 1.75rem 0 3.5rem; }
    .results-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.2rem;
      color: var(--muted-foreground);
      font-size: 0.88rem;
      flex-wrap: wrap;
    }
    .section-block { margin-bottom: 2.5rem; }
    .section-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
      flex-wrap: wrap;
    }
    .section-head h2 {
      margin: 0;
      font-size: 1.38rem;
      font-weight: 650;
      letter-spacing: -0.025em;
    }
    .section-count {
      font-size: 0.8rem;
      color: var(--muted-foreground);
      font-family: var(--font-mono);
    }
    .section-note {
      margin: 0 0 1rem;
      color: var(--muted-foreground);
      font-size: 0.92rem;
    }
    .section-note--warn {
      background: var(--amber-soft);
      border: 1px solid var(--amber-border);
      color: var(--foreground);
      padding: 0.62rem 0.85rem;
      border-radius: var(--radius-sm);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 0.95rem;
    }
    @media (max-width: 720px) {
      .grid { grid-template-columns: 1fr; }
      .search-kbd { display: none; }
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem 1.05rem;
      display: flex;
      flex-direction: column;
      gap: 0.72rem;
      box-shadow: var(--shadow-card);
      min-width: 0;
    }
    .card:hover { border-color: var(--faint); }
    .card__top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .card__title {
      font-size: 1.04rem;
      font-weight: 650;
      color: var(--foreground);
      word-break: break-word;
    }
    .card__badges {
      display: flex;
      gap: 0.32rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.14rem 0.48rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--raised);
      color: var(--muted-foreground);
      white-space: nowrap;
    }
    .badge--citrus {
      background: var(--citrus-soft);
      border-color: var(--citrus-border);
      color: var(--citrus);
    }
    .badge--warn {
      background: var(--amber-soft);
      border-color: var(--amber-border);
      color: var(--amber);
    }
    .badge--sky {
      background: var(--sky-soft);
      border-color: transparent;
      color: var(--sky);
    }
    .card__desc {
      margin: 0;
      font-size: 0.91rem;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .card__note {
      margin: 0;
      font-size: 0.81rem;
      color: var(--faint);
      border-left: 2px solid var(--border);
      padding-left: 0.55rem;
    }
    .install-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: var(--inset);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.42rem 0.5rem 0.42rem 0.68rem;
      min-width: 0;
    }
    .install-cmd {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--foreground);
      overflow-x: auto;
      white-space: nowrap;
      flex: 1 1 auto;
      scrollbar-width: thin;
      background: transparent;
      border: 0;
      padding: 0;
    }
    .copy-btn {
      flex: 0 0 auto;
      background: var(--raised);
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.25rem 0.58rem;
      font-size: 0.76rem;
      font-weight: 600;
      transition: all 0.14s;
    }
    .copy-btn:hover { border-color: var(--citrus); color: var(--citrus); }
    .copy-btn.is-copied {
      background: var(--citrus);
      border-color: var(--citrus);
      color: var(--citrus-ink);
    }
    .card__meta {
      margin-top: auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.45rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--line);
      font-size: 0.77rem;
      color: var(--faint);
    }
    .card__platforms {
      display: flex;
      flex-wrap: wrap;
      gap: 0.28rem;
      align-items: center;
    }
    .plat-tag {
      background: var(--raised);
      border: 1px solid var(--line);
      border-radius: 4px;
      padding: 0.08rem 0.36rem;
      font-size: 0.72rem;
      color: var(--muted-foreground);
    }
    .card__links {
      display: inline-flex;
      gap: 0.55rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      color: var(--muted-foreground);
    }
    footer {
      border-top: 1px solid var(--line);
      padding: 1.75rem 0 2.5rem;
      color: var(--muted-foreground);
      font-size: 0.85rem;
    }
    .footer__inner {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .footer__links { display: flex; gap: 1rem; flex-wrap: wrap; }
  </style>
</head>
<body>
  <header class="nav">
    <div class="container nav__inner">
      <a class="brand" href="./">
        <svg width="24" height="24" viewBox="14 12 100 100" aria-hidden="true">
          <path d="M30 100 V58 a34 34 0 0 1 68 0 V100" fill="none" stroke="#55800c" stroke-width="20" stroke-linecap="round"/>
          <path d="M30 100 V58 a34 34 0 0 1 68 0 V100" fill="none" stroke="#a9d63f" stroke-width="14" stroke-linecap="round"/>
          <circle cx="64" cy="76" r="10" fill="#f3f5f8"/>
        </svg>
        <span>Awesome NSH</span>
        <span class="brand__tag" id="badge-count">${nshmCount} nshm</span>
      </a>
      <nav class="nav__actions" aria-label="Primary">
        <a class="nav__link" href="./index.json">index.json</a>
        <a class="nav__link" href="./count.json">count.json</a>
        <a class="nav__link" href="https://github.com/AkaraChen/nsh-awesome/blob/main/docs/DISCOVERY.md" target="_blank" rel="noopener">Discovery</a>
        <a class="nav__link" href="https://github.com/AkaraChen/nsh-awesome" target="_blank" rel="noopener">GitHub</a>
        <button type="button" class="ctrl-btn" id="lang-toggle" aria-label="Switch language">中文</button>
        <button type="button" class="ctrl-btn" id="theme-toggle" aria-label="Toggle theme">Theme</button>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <div class="hero__top">
        <div class="hero__copy">
          <h1 id="hero-title">Awesome Native Shell Modules</h1>
          <p class="hero__desc" id="hero-desc">${escapeHtml(indexObj.description.en)}</p>
          <div class="hero__stats" id="hero-stats"></div>
          <div class="endpoint-box">
            <span class="endpoint-box__label" id="endpoint-label">Market index URL:</span>
            <span class="endpoint-box__url">${escapeHtml(indexUrl)}</span>
            <button type="button" class="copy-btn" data-copy="${escapeHtml(indexUrl)}" id="copy-index-btn">Copy</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="controls" aria-label="Search and filter">
    <div class="container">
      <div class="controls__row">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input id="search-input" class="search-input" type="search" placeholder="Search nshm, crate, platform, license..." autocomplete="off">
          <span class="search-kbd">/</span>
        </div>
        <select id="source-filter" class="select-filter" aria-label="Filter by source">
          <option value="all">All sources</option>
          <option value="crates.io">crates.io</option>
          <option value="github">github:</option>
          <option value="git">Git URL</option>
          <option value="web">Web / Docs</option>
        </select>
      </div>
      <div class="chips" id="section-chips" role="tablist" aria-label="Sections"></div>
      <div class="chips chips--sub" id="category-chips" aria-label="Categories"></div>
    </div>
  </section>

  <main class="container">
    <div class="results-meta">
      <span id="results-summary">Loading catalog...</span>
      <button type="button" class="ctrl-btn" id="clear-filters" hidden>Clear filters</button>
    </div>
    <div id="catalog-root"></div>
  </main>

  <footer>
    <div class="container footer__inner">
      <span id="footer-copy">Curated from single source of truth <code>data/entries.json</code> · Verified on <code>nsh ${escapeHtml(indexObj.nshVerifiedVersion)}</code>.</span>
      <div class="footer__links">
        <a href="./index.json">index.json</a>
        <a href="./count.json">count.json</a>
        <a href="./badge.svg">badge.svg</a>
        <a href="https://nsh.dev" target="_blank" rel="noopener">nsh.dev</a>
        <a href="https://github.com/AkaraChen/nsh-awesome" target="_blank" rel="noopener">AkaraChen/nsh-awesome</a>
      </div>
    </div>
  </footer>

  <script id="nsh-index-data" type="application/json">${embeddedJson}</script>
  <script>
    (function () {
      var fallbackData = JSON.parse(document.getElementById('nsh-index-data').textContent);
      var catalog = fallbackData;
      var params = new URLSearchParams(location.search);
      var storedLang = null;
      try { storedLang = localStorage.getItem('nsh_awesome_lang'); } catch (e) {}
      var state = {
        lang: params.get('lang') === 'zh' ? 'zh' : params.get('lang') === 'en' ? 'en' : (storedLang === 'zh' ? 'zh' : 'en'),
        section: 'all',
        category: 'all',
        source: 'all',
        query: ''
      };

      var UI = {
        en: {
          title: 'Awesome Native Shell Modules',
          langBtn: '中文',
          themeLight: 'Light mode',
          themeDark: 'Dark mode',
          endpointLabel: 'Market index URL:',
          searchPlaceholder: 'Search nshm, crate, platform, license...',
          allSections: 'All',
          allCategories: 'All categories',
          sourceAll: 'All sources',
          sourceCrates: 'crates.io',
          sourceGithub: 'github:',
          sourceGit: 'Git URL',
          sourceWeb: 'Web / Docs',
          copy: 'Copy',
          copied: 'Copied ✓',
          clear: 'Clear filters',
          notNshm: 'NOT nshm',
          sourceLink: 'Source',
          cratesLink: 'crates.io',
          docsLink: 'Docs / Demo',
          showing: function (n, total) { return 'Showing ' + n + ' of ' + total + ' entries'; },
          empty: 'No entries match the current search or filters.',
          statInstallable: 'installable nshm',
          statFramework: 'framework crates',
          statTemplates: 'examples & templates',
          statArticles: 'guides',
          statVerified: 'verified on nsh '
        },
        zh: {
          title: 'Awesome Native Shell 模块精选',
          langBtn: 'English',
          themeLight: '浅色模式',
          themeDark: '深色模式',
          endpointLabel: '索引 JSON 地址：',
          searchPlaceholder: '搜索 nshm、crate、平台、许可证...',
          allSections: '全部',
          allCategories: '全部分类',
          sourceAll: '全部来源',
          sourceCrates: 'crates.io',
          sourceGithub: 'github:',
          sourceGit: 'Git URL',
          sourceWeb: '网页 / 文档',
          copy: '复制',
          copied: '已复制 ✓',
          clear: '重置筛选',
          notNshm: '非 nshm',
          sourceLink: '源码仓库',
          cratesLink: 'crates.io',
          docsLink: '文档 / 演示',
          showing: function (n, total) { return '当前展示 ' + n + ' / ' + total + ' 个条目'; },
          empty: '没有符合当前搜索或筛选条件的条目。',
          statInstallable: '个可安装 nshm',
          statFramework: '个框架 Crate',
          statTemplates: '个示例模板',
          statArticles: '篇文档教程',
          statVerified: '实测兼容 nsh '
        }
      };

      function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function copyText(text, btn) {
        function done() {
          var t = UI[state.lang];
          btn.textContent = t.copied;
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = t.copy;
            btn.classList.remove('is-copied');
          }, 1400);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      }

      function fallbackCopy(text, cb) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        cb();
      }

      function updateThemeBtn() {
        var isDark = document.documentElement.classList.contains('dark');
        var t = UI[state.lang];
        document.getElementById('theme-toggle').textContent = isDark ? '☀ ' + t.themeLight : '☾ ' + t.themeDark;
      }

      function renderStats() {
        var t = UI[state.lang];
        var c = catalog.counts;
        var html = [
          '<span class="stat-pill stat-pill--accent">' + c.installableNshm + ' ' + t.statInstallable + '</span>',
          '<span class="stat-pill">' + (c.sections.framework || 0) + ' ' + t.statFramework + '</span>',
          '<span class="stat-pill">' + (c.sections.templates || 0) + ' ' + t.statTemplates + '</span>',
          '<span class="stat-pill">' + (c.sections.articles || 0) + ' ' + t.statArticles + '</span>',
          '<span class="stat-pill">' + esc(t.statVerified + catalog.nshVerifiedVersion) + '</span>'
        ].join('');
        document.getElementById('hero-stats').innerHTML = html;
      }

      function renderChips() {
        var t = UI[state.lang];
        var secEl = document.getElementById('section-chips');
        var secHtml = ['<button type="button" class="chip' + (state.section === 'all' ? ' is-active' : '') + '" data-section="all">' + esc(t.allSections) + ' (' + catalog.entries.length + ')</button>'];
        catalog.sections.forEach(function (s) {
          var cnt = catalog.entries.filter(function (e) { return e.section === s.id; }).length;
          secHtml.push('<button type="button" class="chip' + (state.section === s.id ? ' is-active' : '') + '" data-section="' + esc(s.id) + '">' + esc(s.emoji + ' ' + s.title[state.lang]) + ' (' + cnt + ')</button>');
        });
        secEl.innerHTML = secHtml.join('');

        var catEl = document.getElementById('category-chips');
        var visibleCats = catalog.categories.filter(function (c) {
          return (state.section === 'all' || c.section === state.section) &&
            catalog.entries.some(function (e) { return e.category === c.id; });
        });
        var catHtml = ['<button type="button" class="chip chip--sub' + (state.category === 'all' ? ' is-active' : '') + '" data-category="all">' + esc(t.allCategories) + '</button>'];
        visibleCats.forEach(function (c) {
          catHtml.push('<button type="button" class="chip chip--sub' + (state.category === c.id ? ' is-active' : '') + '" data-category="' + esc(c.id) + '">' + esc(c.emoji + ' ' + c.title[state.lang]) + '</button>');
        });
        catEl.innerHTML = catHtml.join('');
      }

      function matchesEntry(e) {
        if (state.section !== 'all' && e.section !== state.section) return false;
        if (state.category !== 'all' && e.category !== state.category) return false;
        if (state.source !== 'all' && e.sourceType !== state.source) return false;
        if (state.query) {
          var hay = [
            e.name, e.id, e.kind, e.sourceType, e.installCommand || '',
            e.description.en, e.description.zh,
            (e.notes && e.notes[state.lang]) || '',
            (e.platforms || []).join(' '), e.license || ''
          ].join(' ').toLowerCase();
          if (hay.indexOf(state.query) === -1) return false;
        }
        return true;
      }

      function renderCard(e) {
        var t = UI[state.lang];
        var badges = [];
        if (e.section === 'framework') {
          badges.push('<span class="badge badge--warn">' + esc(t.notNshm) + '</span>');
        } else {
          badges.push('<span class="badge badge--citrus">' + esc(e.kind) + '</span>');
        }
        badges.push('<span class="badge badge--sky">' + esc(e.sourceType) + '</span>');
        if (e.version) badges.push('<span class="badge">v' + esc(e.version) + '</span>');

        var installBlock = e.installable && e.installCommand
          ? '<div class="install-row"><code class="install-cmd">' + esc(e.installCommand) + '</code><button type="button" class="copy-btn" data-copy="' + esc(e.installCommand) + '">' + esc(t.copy) + '</button></div>'
          : '';

        var noteBlock = e.notes && e.notes[state.lang]
          ? '<p class="card__note">' + esc(e.notes[state.lang]) + '</p>'
          : '';

        var platTags = (e.platforms || []).map(function (p) {
          return '<span class="plat-tag">' + esc(p) + '</span>';
        }).join('');

        var links = ['<a href="' + esc(e.sourceUrl) + '" target="_blank" rel="noopener">' + esc(t.sourceLink) + '</a>'];
        if (e.cratesUrl && e.cratesUrl !== e.sourceUrl) {
          links.push('<a href="' + esc(e.cratesUrl) + '" target="_blank" rel="noopener">' + esc(t.cratesLink) + '</a>');
        }
        if (e.homepage && e.homepage !== e.sourceUrl) {
          links.push('<a href="' + esc(e.homepage) + '" target="_blank" rel="noopener">' + esc(t.docsLink) + '</a>');
        }

        return '<article class="card">' +
          '<div class="card__top">' +
            '<a class="card__title" href="' + esc(e.sourceUrl) + '" target="_blank" rel="noopener">' + esc(e.name) + '</a>' +
            '<div class="card__badges">' + badges.join('') + '</div>' +
          '</div>' +
          '<p class="card__desc">' + esc(e.description[state.lang]) + '</p>' +
          installBlock +
          noteBlock +
          '<div class="card__meta">' +
            '<div class="card__platforms">' + platTags + '</div>' +
            '<div class="card__links"><span>' + esc(e.license) + '</span><span>' + esc(e.updatedAt) + '</span>' + links.join('') + '</div>' +
          '</div>' +
        '</article>';
      }

      function render() {
        var t = UI[state.lang];
        document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
        document.getElementById('hero-title').textContent = t.title;
        document.getElementById('hero-desc').textContent = catalog.description[state.lang];
        document.getElementById('lang-toggle').textContent = t.langBtn;
        document.getElementById('endpoint-label').textContent = t.endpointLabel;
        document.getElementById('copy-index-btn').textContent = t.copy;
        document.getElementById('search-input').placeholder = t.searchPlaceholder;
        document.getElementById('clear-filters').textContent = t.clear;

        var sel = document.getElementById('source-filter');
        sel.options[0].text = t.sourceAll;
        sel.options[1].text = t.sourceCrates;
        sel.options[2].text = t.sourceGithub;
        sel.options[3].text = t.sourceGit;
        sel.options[4].text = t.sourceWeb;

        updateThemeBtn();
        renderStats();
        renderChips();

        var filtered = catalog.entries.filter(matchesEntry);
        document.getElementById('results-summary').textContent = t.showing(filtered.length, catalog.entries.length);
        var hasFilter = state.section !== 'all' || state.category !== 'all' || state.source !== 'all' || state.query !== '';
        document.getElementById('clear-filters').hidden = !hasFilter;

        var root = document.getElementById('catalog-root');
        if (filtered.length === 0) {
          root.innerHTML = '<div class="empty-state">' + esc(t.empty) + '</div>';
          return;
        }

        var html = [];
        catalog.sections.forEach(function (sec) {
          var secItems = filtered.filter(function (e) { return e.section === sec.id; });
          if (secItems.length === 0) return;
          var noteCls = sec.id === 'framework' ? 'section-note section-note--warn' : 'section-note';
          html.push('<section class="section-block" id="sec-' + esc(sec.id) + '">' +
            '<div class="section-head"><h2>' + esc(sec.emoji + ' ' + sec.title[state.lang]) + '</h2><span class="section-count">' + secItems.length + '</span></div>' +
            '<p class="' + noteCls + '">' + esc(sec.description[state.lang]) + '</p>' +
            '<div class="grid">' + secItems.map(renderCard).join('') + '</div>' +
          '</section>');
        });
        root.innerHTML = html.join('');
      }

      document.addEventListener('click', function (ev) {
        var copyBtn = ev.target.closest('[data-copy]');
        if (copyBtn) {
          copyText(copyBtn.getAttribute('data-copy'), copyBtn);
          return;
        }
        var secBtn = ev.target.closest('[data-section]');
        if (secBtn) {
          state.section = secBtn.getAttribute('data-section');
          state.category = 'all';
          render();
          return;
        }
        var catBtn = ev.target.closest('[data-category]');
        if (catBtn) {
          state.category = catBtn.getAttribute('data-category');
          render();
        }
      });

      document.getElementById('search-input').addEventListener('input', function (ev) {
        state.query = ev.target.value.trim().toLowerCase();
        render();
      });
      document.getElementById('source-filter').addEventListener('change', function (ev) {
        state.source = ev.target.value;
        render();
      });
      document.getElementById('clear-filters').addEventListener('click', function () {
        state.section = 'all';
        state.category = 'all';
        state.source = 'all';
        state.query = '';
        document.getElementById('search-input').value = '';
        document.getElementById('source-filter').value = 'all';
        render();
      });
      document.getElementById('lang-toggle').addEventListener('click', function () {
        state.lang = state.lang === 'en' ? 'zh' : 'en';
        try { localStorage.setItem('nsh_awesome_lang', state.lang); } catch (e) {}
        render();
      });
      document.getElementById('theme-toggle').addEventListener('click', function () {
        var root = document.documentElement;
        var next = root.classList.contains('dark') ? 'light' : 'dark';
        root.dataset.themePref = next;
        try { localStorage.setItem('nsh_awesome_theme', next); } catch (e) {}
        window.__applyAwesomeTheme();
        updateThemeBtn();
      });
      document.addEventListener('keydown', function (ev) {
        var input = document.getElementById('search-input');
        if (ev.key === '/' && document.activeElement !== input && !ev.metaKey && !ev.ctrlKey) {
          ev.preventDefault();
          input.focus();
        } else if (ev.key === 'Escape' && document.activeElement === input) {
          input.value = '';
          state.query = '';
          input.blur();
          render();
        }
      });

      render();

      if (location.protocol === 'http:' || location.protocol === 'https:') {
        fetch('./index.json', { cache: 'no-cache' })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (fresh) {
            if (fresh && Array.isArray(fresh.entries)) {
              catalog = fresh;
              render();
            }
          })
          .catch(function () {});
      }
    })();
  </script>
</body>
</html>
`;
}

function build404Html(siteUrl) {
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 · Awesome NSH</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0e1016; color: #f3f5f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; text-align: center; padding: 2rem; }
    a { color: #a9d63f; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    p { color: #9aa3b2; }
  </style>
</head>
<body>
  <main>
    <h1>Page not found</h1>
    <p>Return to the <a href="${escapeHtml(siteUrl)}">Awesome NSH directory</a> or read <a href="./index.json">index.json</a>.</p>
  </main>
</body>
</html>
`;
}

export function generateAll(data) {
  const indexObj = buildIndexJson(data);
  const countObj = buildCountJson(data);

  return new Map([
    ['README.md', buildReadme(data, 'en')],
    ['README.zh.md', buildReadme(data, 'zh')],
    ['site/index.json', JSON.stringify(indexObj, null, 2) + '\n'],
    ['site/count.json', JSON.stringify(countObj) + '\n'],
    ['site/badge.svg', buildBadgeSvg(data)],
    ['site/index.html', buildSiteHtml(indexObj)],
    ['site/404.html', build404Html(data.siteUrl)],
    ['site/.nojekyll', ''],
  ]);
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const outputs = generateAll(data);

  if (CHECK) {
    const drifted = [];
    for (const [relPath, expected] of outputs.entries()) {
      if (!fs.existsSync(relPath)) {
        drifted.push(`${relPath} (missing)`);
        continue;
      }
      const actual = fs.readFileSync(relPath, 'utf8');
      if (actual !== expected) {
        drifted.push(`${relPath} (out of sync)`);
      }
    }
    if (drifted.length > 0) {
      console.error('Generated artifacts are out of sync with data/entries.json:');
      for (const d of drifted) console.error(`  - ${d}`);
      console.error('Run `node scripts/generate.mjs` and commit the updated files.');
      process.exit(1);
    }
    console.log(`check: all ${outputs.size} generated files match data/entries.json`);
    return;
  }

  for (const [relPath, content] of outputs.entries()) {
    fs.mkdirSync(path.dirname(relPath), { recursive: true });
    fs.writeFileSync(relPath, content);
    console.log(`wrote ${relPath}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
