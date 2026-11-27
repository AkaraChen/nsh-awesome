/**
 * Pure builders for README.md, README.zh.md, site/index.json,
 * site/count.json, and site/badge.svg from `data/entries.json`.
 *
 * Preserves byte-for-byte backward compatibility with existing consumers.
 */

export function githubHeadingAnchor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replaceAll(' ', '-');
}

function escapeXmlText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    'rust-nshm': 'Rust nshm',
    'tsx-nshm': 'TSX nshm',
    'hybrid-nshm': 'Rust + TSX nshm',
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

export function buildReadme(data, lang) {
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

export function buildIndexJson(data) {
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

export function buildCountJson(data) {
  const count = data.entries.filter((e) => e.installable).length;
  return {
    schemaVersion: 1,
    label: 'nshm',
    message: String(count),
    color: '8cc01d',
    cacheSeconds: 300,
  };
}

export function buildBadgeSvg(data) {
  const count = data.entries.filter((e) => e.installable).length;
  const rightText = `nshm · ${count}`;
  const leftWidth = 70;
  const rightWidth = Math.max(66, rightText.length * 7 + 16);
  const totalWidth = leftWidth + rightWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="awesome: ${escapeXmlText(rightText)}">
  <title>awesome: ${escapeXmlText(rightText)}</title>
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
    <text x="${leftWidth + rightWidth / 2}" y="14" fill="#ffffff">${escapeXmlText(rightText)}</text>
  </g>
</svg>
`;
}
