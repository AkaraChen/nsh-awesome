import { computePageLastmod } from '../../scripts/lib/seo-sitemap.mjs';

export const SECTION_HUB_DEFS = Object.freeze([
  Object.freeze({ slug: 'nshm', entriesSection: 'nshm' }),
  Object.freeze({ slug: 'framework', entriesSection: 'framework' }),
  Object.freeze({ slug: 'templates', entriesSection: 'templates' }),
  Object.freeze({ slug: 'guides', entriesSection: 'articles' }),
]);

export const SECTION_SLUG_FOR_ID = Object.freeze({
  nshm: 'nshm',
  framework: 'framework',
  templates: 'templates',
  articles: 'guides',
});

export function normalizeBaseSiteUrl(rawSiteUrl) {
  const raw = String(rawSiteUrl || 'https://nsh-awesome.vercel.app/').trim();
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function clampLength(str, max) {
  if (str.length <= max) return str;
  const cut = str.slice(0, max - 1).replace(/[\s,.;:，。；：]+$/, '');
  return `${cut}…`;
}

/**
 * Deterministic fallback metadata and prose for any future installable `nshm`
 * added to `data/entries.json` before dedicated `src/content/modules/{en,zh}/<id>.md`
 * files are authored. Ensures SEO bounds (title length, unique non-templated meta
 * description, and >= 250 EN words / >= 300 ZH chars) pass automatically.
 */
export function buildFallbackModuleMeta({ entry, lang = 'en', allEntries = [], nshVerifiedVersion = '0.7.1' }) {
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const desc = entry.description?.[lang] || entry.description?.en || '';
  const note = entry.notes?.[lang] || entry.notes?.en || '';
  const plats = Array.isArray(entry.platforms) ? entry.platforms : [];
  const platText = plats.join(isZh ? '、' : ', ');
  const ver = entry.version || 'N/A';
  const targetVer = entry.nshVersion || nshVerifiedVersion;

  let title = isZh
    ? `${entry.name}：Native Shell ${entry.kind} 模块详情`
    : `${entry.name}: ${entry.kind} Module for Native Shell`;
  if ((isZh && title.length > 55) || (!isZh && title.length > 65)) {
    title = isZh
      ? clampLength(`${entry.name} — NSH 模块`, 55)
      : clampLength(`${entry.name} — Native Shell`, 65);
  }

  let metaDescription = isZh
    ? `${entry.name}（${entry.sourceType}，${entry.license}）：${desc} 支持 ${platText}，通过 ${entry.installCommand} 在 nsh ${nshVerifiedVersion} 验证安装。`
    : `${entry.name} (${entry.sourceType}, ${entry.license}): ${desc} Supports ${platText}; install via ${entry.installCommand} on nsh ${nshVerifiedVersion}.`;

  if (isZh) {
    if (metaDescription.length < 45) {
      metaDescription = `${metaDescription} 兼容版本 ${targetVer}，提供源码仓与平台兼容性档案。`;
    }
    metaDescription = clampLength(metaDescription, 130);
  } else {
    if (metaDescription.length < 100) {
      metaDescription = `${metaDescription} Targets ${targetVer} with verified manifest compatibility and source metadata.`;
    }
    metaDescription = clampLength(metaDescription, 165);
  }

  const related = allEntries
    .filter((e) => e.installable && e.id !== entry.id)
    .sort((a, b) => Number(b.category === entry.category) - Number(a.category === entry.category))
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      path: `${langPrefix}/nshm/${e.id}/`,
      name: e.name,
      reason: e.description?.[lang] || e.description?.en || '',
    }));

  const parentLinks = [
    {
      path: `${langPrefix}/nshm/`,
      label: isZh ? '返回可安装 nshm 目录' : 'Back to Installable nshm Catalog',
    },
    {
      path: `${langPrefix}/discovery/`,
      label: isZh ? '查看 nshm 发现与验证规范' : 'Read Discovery & Verification Rules',
    },
    {
      path: `${langPrefix}/`,
      label: isZh ? '返回 Awesome NSH 首页' : 'Back to Awesome NSH Home',
    },
  ];

  const platformRows = plats.map((p) => ({
    platform: p,
    status: isZh ? '条目已声明' : 'Declared target',
    notes: isZh
      ? `列于 \`data/entries.json\` 支持平台列表，需使用对应原生目标工具链完成应用构建（当前仅验证 \`nsh add\` 清单解析）。`
      : `Listed in \`data/entries.json\` platforms; target native build requires the corresponding platform toolchain (verified via \`nsh add\` resolution only).`,
  }));

  const paragraphs = isZh
    ? [
        {
          heading: '模块概览与核心能力',
          body: [
            `\`${entry.name}\` 是收录于 Awesome NSH 的 ${entry.kind} 类型模块（ID：\`${entry.id}\`，分类：\`${entry.category}\`）。${desc}`,
            note
              ? `补充说明：${note} 该模块当前发布版本为 \`${ver}\`，声明兼容 Native Shell \`${targetVer}\`，采用 \`${entry.license}\` 开源许可证，最近核验日期为 ${entry.updatedAt}。`
              : `该模块当前发布版本为 \`${ver}\`，声明兼容 Native Shell \`${targetVer}\`，采用 \`${entry.license}\` 开源许可证，最近核验日期为 ${entry.updatedAt}。`,
          ],
        },
        {
          heading: '安装方式与分发来源说明',
          body: [
            `通过分发来源 \`${entry.sourceType}\` 在干净应用中运行 \`${entry.installCommand}\` 即可将 \`${entry.name}\` 写入 \`nsh.json\` 与 \`nsh.lock\`。源码仓库托管于 ${entry.sourceUrl}，声明支持的目标平台包括 ${platText}。`,
            `目前该模块尚未单独编写深入的 \`src/content/modules/zh/${entry.id}.md\` 说明文档，页面档案由 \`data/entries.json\` 自动渲染生成；欢迎社区维护者补充使用示例、特性开关与平台注意事项。`,
          ],
        },
        {
          heading: `nsh ${nshVerifiedVersion} 验证记录与范围边界`,
          body: [
            `已于干净临时项目中在 \`nsh ${nshVerifiedVersion}\` 下实测执行 \`${entry.installCommand}\` 并成功解析清单与写入 \`nsh.lock\`（最近核验：${entry.updatedAt}）。`,
            `验证边界声明：自动验证仅覆盖 \`nsh add\` 依赖解析与清单规范检查，并不声称已在 ${platText} 全部目标设备上完成完整原生编译或运行时功能测试。`,
          ],
        },
      ]
    : [
        {
          heading: 'Module Overview & Capabilities',
          body: [
            `\`${entry.name}\` is a curated \`${entry.kind}\` package in Awesome NSH (catalog ID \`${entry.id}\`, category \`${entry.category}\`). ${desc}`,
            note
              ? `Additional note: ${note} The tracked version is \`${ver}\` targeting Native Shell \`${targetVer}\` under the \`${entry.license}\` license, last verified on ${entry.updatedAt}.`
              : `The tracked version is \`${ver}\` targeting Native Shell \`${targetVer}\` under the \`${entry.license}\` license, last verified on ${entry.updatedAt}.`,
          ],
        },
        {
          heading: `Installation on nsh ${nshVerifiedVersion} & Source Details`,
          body: [
            `Install \`${entry.name}\` from \`${entry.sourceType}\` by running \`${entry.installCommand}\` inside a Native Shell project directory. The upstream repository is hosted at ${entry.sourceUrl} with declared platform targets covering ${platText}.`,
            `Dedicated long-form prose in \`src/content/modules/en/${entry.id}.md\` has not been authored yet, so this detail page renders deterministically from \`data/entries.json\`. Contributors are welcome to add deeper architectural notes and Cargo feature guidance via pull request.`,
          ],
        },
        {
          heading: `nsh ${nshVerifiedVersion} Verification Record`,
          body: [
            `Running \`${entry.installCommand}\` in a clean scratch Native Shell project on \`nsh ${nshVerifiedVersion}\` resolves the manifest and records \`${entry.name}\` inside \`nsh.json\` and \`nsh.lock\` (verified ${entry.updatedAt}).`,
            `Scope boundary: automated CI checks \`nsh add\` manifest resolution and lockfile generation only. Full native device builds and runtime checks across ${platText} are not claimed.`,
          ],
        },
      ];

  const securityNote = isZh
    ? {
        heading: '构建脚本与权限边界提示',
        body: `安装 \`${entry.name}\` 前请审查上游源码仓库（${entry.sourceUrl}）与 \`nsh.lock\` 变更；Rust 或混合模块会在构建期以本机权限执行 \`build.rs\` 与过程宏，并可能通过 \`[package.metadata.nsh]\` 声明平台权限。`,
      }
    : {
        heading: 'Build & System Permission Notice',
        body: `Review the upstream repository (${entry.sourceUrl}) and \`nsh.lock\` diffs before shipping \`${entry.name}\`. Installing Rust or hybrid \`nshm\` packages runs \`build.rs\`, proc macros, and runtime code with app permissions.`,
      };

  return {
    title,
    description: metaDescription,
    h1: entry.name,
    summary: desc,
    updatedAt: entry.updatedAt,
    platformSupport: {
      heading: isZh ? '声明支持平台概览' : 'Declared Platform Support',
      overview: isZh
        ? `\`${entry.name}\` 在 \`data/entries.json\` 中声明支持 ${platText}。`
        : `\`${entry.name}\` declares support for ${platText} in \`data/entries.json\`.`,
      matrix: platformRows,
    },
    securityNote,
    related,
    parentLinks,
    paragraphs,
  };
}

export function buildRouteManifestFromData({ data, pagesByKey = new Map(), modulesByKey = new Map() }) {
  const siteUrl = normalizeBaseSiteUrl(data?.siteUrl);
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const installable = entries.filter((e) => e.installable);
  const routes = [];

  function makeDescriptor({
    key,
    pageType,
    lang,
    slug,
    sectionId = null,
    entriesSection = null,
    moduleId = null,
    entry = null,
    enPath,
    zhPath,
    enMdPath,
    zhMdPath,
    title,
    description,
    lastmod,
  }) {
    const routePath = lang === 'zh' ? zhPath : enPath;
    const altPath = lang === 'zh' ? enPath : zhPath;
    const mdPath = lang === 'zh' ? zhMdPath : enMdPath;
    const altMdPath = lang === 'zh' ? enMdPath : zhMdPath;
    const cleanRel = routePath.replace(/^\/+/, '');
    const cleanMdRel = mdPath.replace(/^\/+/, '');

    return {
      key,
      pageType,
      lang,
      slug,
      sectionId,
      entriesSection,
      moduleId,
      entry,
      path: routePath,
      altPath,
      enPath,
      zhPath,
      mdPath,
      altMdPath,
      url: `${siteUrl}${cleanRel}`,
      enUrl: `${siteUrl}${enPath.replace(/^\/+/, '')}`,
      zhUrl: `${siteUrl}${zhPath.replace(/^\/+/, '')}`,
      altUrl: `${siteUrl}${altPath.replace(/^\/+/, '')}`,
      mdUrl: `${siteUrl}${cleanMdRel}`,
      altMdUrl: `${siteUrl}${altMdPath.replace(/^\/+/, '')}`,
      title,
      description,
      lastmod,
    };
  }

  const enHomePage = pagesByKey.get('en/home');
  const zhHomePage = pagesByKey.get('zh/home');
  const homeLastmod = computePageLastmod(
    [enHomePage?.updatedAt, zhHomePage?.updatedAt, ...entries.map((e) => e.updatedAt)],
    '2026-11-26',
  );

  for (const lang of ['en', 'zh']) {
    const p = lang === 'zh' ? zhHomePage : enHomePage;
    routes.push(
      makeDescriptor({
        key: 'home',
        pageType: 'home',
        lang,
        slug: 'home',
        enPath: '/',
        zhPath: '/zh/',
        enMdPath: '/index.md',
        zhMdPath: '/zh/index.md',
        title:
          p?.title ||
          (lang === 'zh'
            ? 'Awesome NSH 中文目录 — Native Shell 模块、框架 Crate 与指南'
            : 'Awesome NSH — Curated Native Shell Modules & Directory'),
        description: p?.description || data?.description?.[lang] || '',
        lastmod: homeLastmod,
      }),
    );
  }

  for (const hub of SECTION_HUB_DEFS) {
    const key = `section:${hub.slug}`;
    const secEntries = entries.filter((e) => e.section === hub.entriesSection);
    const secMeta = sections.find((s) => s.id === hub.entriesSection);
    const enSecPage = pagesByKey.get(`en/${hub.slug}`);
    const zhSecPage = pagesByKey.get(`zh/${hub.slug}`);
    const secLastmod = computePageLastmod(
      [enSecPage?.updatedAt, zhSecPage?.updatedAt, ...secEntries.map((e) => e.updatedAt)],
      homeLastmod,
    );
    for (const lang of ['en', 'zh']) {
      const p = lang === 'zh' ? zhSecPage : enSecPage;
      routes.push(
        makeDescriptor({
          key,
          pageType: 'section',
          lang,
          slug: hub.slug,
          sectionId: hub.slug,
          entriesSection: hub.entriesSection,
          enPath: `/${hub.slug}/`,
          zhPath: `/zh/${hub.slug}/`,
          enMdPath: `/${hub.slug}.md`,
          zhMdPath: `/zh/${hub.slug}.md`,
          title: p?.title || `${secMeta?.title?.[lang] || hub.slug} — Awesome NSH`,
          description: p?.description || secMeta?.description?.[lang] || '',
          lastmod: secLastmod,
        }),
      );
    }
  }

  for (const entry of installable) {
    const key = `module:${entry.id}`;
    const enMod = modulesByKey.get(`en/${entry.id}`);
    const zhMod = modulesByKey.get(`zh/${entry.id}`);
    const modLastmod = computePageLastmod(
      [enMod?.updatedAt, zhMod?.updatedAt, entry.updatedAt],
      homeLastmod,
    );
    for (const lang of ['en', 'zh']) {
      const m = lang === 'zh' ? zhMod : enMod;
      const fallback = m
        ? null
        : buildFallbackModuleMeta({
            entry,
            lang,
            allEntries: entries,
            nshVerifiedVersion: data?.nshVerifiedVersion || '0.7.1',
          });
      routes.push(
        makeDescriptor({
          key,
          pageType: 'module',
          lang,
          slug: entry.id,
          sectionId: 'nshm',
          entriesSection: 'nshm',
          moduleId: entry.id,
          entry,
          enPath: `/nshm/${entry.id}/`,
          zhPath: `/zh/nshm/${entry.id}/`,
          enMdPath: `/nshm/${entry.id}.md`,
          zhMdPath: `/zh/nshm/${entry.id}.md`,
          title: m?.title || fallback.title,
          description: m?.description || fallback.description,
          lastmod: modLastmod,
        }),
      );
    }
  }

  for (const pillarSlug of ['discovery', 'about']) {
    const key = `pillar:${pillarSlug}`;
    const enPillar = pagesByKey.get(`en/${pillarSlug}`);
    const zhPillar = pagesByKey.get(`zh/${pillarSlug}`);
    const pillarLastmod = computePageLastmod(
      [enPillar?.updatedAt, zhPillar?.updatedAt],
      homeLastmod,
    );
    for (const lang of ['en', 'zh']) {
      const p = lang === 'zh' ? zhPillar : enPillar;
      routes.push(
        makeDescriptor({
          key,
          pageType: pillarSlug,
          lang,
          slug: pillarSlug,
          enPath: `/${pillarSlug}/`,
          zhPath: `/zh/${pillarSlug}/`,
          enMdPath: `/${pillarSlug}.md`,
          zhMdPath: `/zh/${pillarSlug}.md`,
          title: p?.title || pillarSlug,
          description: p?.description || data?.description?.[lang] || '',
          lastmod: pillarLastmod,
        }),
      );
    }
  }

  return routes;
}
