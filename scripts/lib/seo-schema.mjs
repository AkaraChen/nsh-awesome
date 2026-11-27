/**
 * Pure Schema.org 2026 JSON-LD `@graph` builders for Awesome NSH static pages.
 *
 * Follows `AgriciDaniel/claude-seo` (v2.6.3) `seo-schema` and
 * `deprecated-types-2024-2026.md`:
 * - Uses absolute HTTPS URLs for every entity, `@id`, `url`, and `item`.
 * - Declares `@context: "https://schema.org"` once at the root with `@graph`.
 * - Never emits retired rich-result types (`FAQPage`, `HowTo`,
 *   `SpecialAnnouncement`, `CourseInfo`, `EstimatedSalary`, `LearningVideo`,
 *   `ClaimReview`, `VehicleListing`, `PracticeProblem`).
 */

export const SCHEMA_CONTEXT = 'https://schema.org';
export const DEFAULT_SITE_URL = 'https://nsh-awesome.vercel.app/';
export const DEFAULT_SITE_NAME = 'Awesome NSH';

export const MAINTAINER = Object.freeze({
  name: 'AkaraChen',
  url: 'https://github.com/AkaraChen',
  sameAs: Object.freeze(['https://github.com/AkaraChen']),
});

export const SECTION_SLUGS = Object.freeze({
  nshm: 'nshm',
  framework: 'framework',
  templates: 'templates',
  articles: 'guides',
  guides: 'guides',
});

export const DEPRECATED_SCHEMA_TYPES = Object.freeze([
  'FAQPage',
  'HowTo',
  'SpecialAnnouncement',
  'CourseInfo',
  'EstimatedSalary',
  'LearningVideo',
  'ClaimReview',
  'VehicleListing',
  'PracticeProblem',
]);

const RETIRED_SCHEMA_TYPE_SET = new Set([
  ...DEPRECATED_SCHEMA_TYPES,
  'Practice Problem',
  'OccupationalAggregateRating',
  'Vehicle',
]);

const SECTION_DEFAULT_LABELS = Object.freeze({
  nshm: Object.freeze({ en: 'Installable nshm', zh: '可安装 nshm' }),
  framework: Object.freeze({ en: 'Framework & Official Crates', zh: '框架与官方 Crate' }),
  templates: Object.freeze({ en: 'Examples & Templates', zh: '示例与模板' }),
  guides: Object.freeze({ en: 'Documentation & Guides', zh: '文档与指南' }),
});

const OG_IMAGE_META = Object.freeze({
  en: Object.freeze({
    filename: 'og-image.png',
    caption: 'Awesome NSH — Curated Native Shell Modules & Directory',
  }),
  zh: Object.freeze({
    filename: 'og-image-zh.png',
    caption: 'Awesome NSH — Native Shell 模块与 Crate 中文目录',
  }),
});

/**
 * Normalize a language tag to `'en'` or `'zh'`.
 */
export function normalizeLang(lang = 'en') {
  return typeof lang === 'string' && lang.trim().toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/**
 * Convert a language input to canonical BCP-47 (`'en'` or `'zh-Hans'`).
 */
export function toBcp47Lang(lang = 'en') {
  return normalizeLang(lang) === 'zh' ? 'zh-Hans' : 'en';
}

/**
 * Normalize a non-empty string or return `undefined`.
 */
function cleanString(value) {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Validate and normalize the site root URL as an absolute HTTPS URL ending with `/`.
 */
export function normalizeSiteUrl(siteUrl = DEFAULT_SITE_URL) {
  const raw = cleanString(siteUrl);
  if (!raw) {
    throw new TypeError('siteUrl must be a non-empty HTTPS URL');
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    throw new TypeError(`Invalid siteUrl "${siteUrl}": ${err.message}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new TypeError(`siteUrl must use https://, got "${parsed.protocol}"`);
  }
  if (parsed.search || parsed.hash) {
    throw new TypeError(`siteUrl must not include query or fragment: "${siteUrl}"`);
  }
  const href = parsed.href;
  return href.endsWith('/') ? href : `${href}/`;
}

/**
 * Resolve a URL against `baseSiteUrl` and enforce `https://`.
 */
export function toAbsoluteHttpsUrl(url, baseSiteUrl = DEFAULT_SITE_URL) {
  const raw = cleanString(url);
  if (!raw) {
    throw new TypeError('URL must be a non-empty string');
  }
  const base = normalizeSiteUrl(baseSiteUrl);
  let parsed;
  try {
    parsed = new URL(raw, base);
  } catch (err) {
    throw new TypeError(`Invalid URL "${url}": ${err.message}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new TypeError(`Schema URL must use https://, got "${parsed.href}"`);
  }
  return parsed.href;
}

/**
 * Normalize an HTML page URL as absolute HTTPS and enforce trailing `/` on directory routes.
 */
export function normalizePageUrl(pageUrl, baseSiteUrl = DEFAULT_SITE_URL) {
  const abs = toAbsoluteHttpsUrl(pageUrl, baseSiteUrl);
  const parsed = new URL(abs);
  if (!parsed.search && !parsed.hash && !parsed.pathname.endsWith('/')) {
    const lastSegment = parsed.pathname.split('/').pop() || '';
    if (!lastSegment.includes('.')) {
      parsed.pathname = `${parsed.pathname}/`;
    }
  }
  return parsed.href;
}

/**
 * Resolve the canonical home URL for `'en'` or `'zh'`.
 */
export function resolveHomeUrl(siteUrl = DEFAULT_SITE_URL, lang = 'en') {
  const base = normalizeSiteUrl(siteUrl);
  return normalizeLang(lang) === 'zh' ? `${base}zh/` : base;
}

/**
 * Resolve the canonical section hub URL, mapping `articles` -> `/guides/`.
 */
export function resolveSectionUrl(siteUrl = DEFAULT_SITE_URL, lang = 'en', sectionId = 'nshm') {
  const base = normalizeSiteUrl(siteUrl);
  const key = cleanString(sectionId);
  const slug = key ? SECTION_SLUGS[key] : undefined;
  if (!slug) {
    throw new TypeError(`Unknown section id "${sectionId}"`);
  }
  const prefix = normalizeLang(lang) === 'zh' ? 'zh/' : '';
  return `${base}${prefix}${slug}/`;
}

/**
 * Resolve the canonical module detail URL for an `nshm` entry.
 */
export function resolveModuleUrl(siteUrl = DEFAULT_SITE_URL, lang = 'en', entryId) {
  const id = cleanString(entryId);
  if (!id) {
    throw new TypeError('Module entry.id is required');
  }
  const base = normalizeSiteUrl(siteUrl);
  const prefix = normalizeLang(lang) === 'zh' ? 'zh/' : '';
  return `${base}${prefix}nshm/${encodeURIComponent(id)}/`;
}

/**
 * Validate and normalize an ISO 8601 date string (`YYYY-MM-DD`).
 * Returns `undefined` when `value` is nullish/empty; throws on invalid non-empty input.
 */
export function normalizeIsoDate(value) {
  const raw = cleanString(value);
  if (!raw) return undefined;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
  if (!match) {
    throw new TypeError(`Invalid ISO date "${value}" (expected YYYY-MM-DD)`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    throw new TypeError(`Invalid calendar date "${value}"`);
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * Compute the latest `updatedAt` ISO date across entries without using runtime clock fallbacks.
 */
export function computeLatestDate(entries = []) {
  if (!Array.isArray(entries)) return undefined;
  let latest;
  for (const entry of entries) {
    const iso = normalizeIsoDate(entry?.updatedAt);
    if (iso && (!latest || iso > latest)) {
      latest = iso;
    }
  }
  return latest;
}

/**
 * Normalize an SPDX identifier or HTTPS URL into an absolute HTTPS license URL.
 */
export function normalizeLicenseUrl(license) {
  const raw = cleanString(license);
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) {
    return toAbsoluteHttpsUrl(raw);
  }
  if (/^[A-Za-z0-9.+-]+$/.test(raw)) {
    return `https://spdx.org/licenses/${encodeURIComponent(raw)}`;
  }
  return undefined;
}

/**
 * Map `data/entries.json` `kind` to Schema.org `programmingLanguage`.
 */
export function mapProgrammingLanguage(kind) {
  switch (kind) {
    case 'tsx-nshm':
      return 'TypeScript';
    case 'hybrid-nshm':
      return ['Rust', 'TypeScript'];
    case 'rust-nshm':
    case 'platform-nshm':
    case 'framework-crate':
    default:
      return 'Rust';
  }
}

/**
 * Return a copy of `obj` without `undefined` or `null` properties.
 */
function compactObject(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Build the `ImageObject` referencing the site's localized 1200x630 OG card.
 */
function buildOgImageObject(baseSiteUrl, langKey) {
  const og = OG_IMAGE_META[langKey] ?? OG_IMAGE_META.en;
  return {
    '@type': 'ImageObject',
    url: `${baseSiteUrl}${og.filename}`,
    width: 1200,
    height: 630,
    caption: og.caption,
  };
}

/**
 * Build the shared `WebSite` node with localized `SearchAction`.
 */
function buildWebSiteNode({ baseSiteUrl, langKey, data }) {
  const homeUrl = resolveHomeUrl(baseSiteUrl, langKey);
  const siteDescription =
    cleanString(data?.description?.[langKey]) ??
    cleanString(data?.description?.en) ??
    (langKey === 'zh'
      ? 'Native Shell（nsh）模块（nshm）、框架 crate、模板示例与文档教程的精选清单、可搜索目录与机器可读索引。'
      : 'A curated list, searchable directory, and machine-readable index of Native Shell (nsh) modules (nshm), framework crates, templates, and guides.');

  return {
    '@type': 'WebSite',
    '@id': `${baseSiteUrl}#website`,
    url: baseSiteUrl,
    name: DEFAULT_SITE_NAME,
    description: siteDescription,
    inLanguage: ['en', 'zh-Hans'],
    publisher: { '@id': `${baseSiteUrl}#maintainer` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${homeUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Build the shared `Person` node for maintainer `AkaraChen`.
 */
function buildMaintainerNode(baseSiteUrl) {
  return {
    '@type': 'Person',
    '@id': `${baseSiteUrl}#maintainer`,
    name: MAINTAINER.name,
    url: MAINTAINER.url,
    sameAs: [...MAINTAINER.sameAs],
  };
}

/**
 * Build a `BreadcrumbList` node from ordered `[name, absoluteHttpsUrl]` items.
 */
function buildBreadcrumbNode(id, items) {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build an `ItemList` node for catalog entries, linking installable `nshm`
 * entries to their canonical module detail page and other entries to `sourceUrl`.
 */
function buildEntryItemList({ id, name, entries, baseSiteUrl, langKey }) {
  return {
    '@type': 'ItemList',
    '@id': id,
    name,
    numberOfItems: entries.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: entries.map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        throw new TypeError(`ItemList entry at index ${index} must be an object`);
      }
      const entryName = cleanString(entry.name);
      if (!entryName) {
        throw new TypeError(`ItemList entry at index ${index} is missing name`);
      }
      const itemUrl = entry.installable
        ? resolveModuleUrl(baseSiteUrl, langKey, entry.id)
        : toAbsoluteHttpsUrl(entry.sourceUrl, baseSiteUrl);
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: entryName,
        url: itemUrl,
      };
    }),
  };
}

/**
 * Recursively assert that no `@type` in a JSON-LD node or `@graph` is retired/deprecated.
 */
export function assertNoDeprecatedTypes(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      assertNoDeprecatedTypes(item);
    }
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }

  const rawType = node['@type'];
  const types = Array.isArray(rawType) ? rawType : rawType !== undefined ? [rawType] : [];
  for (const schemaType of types) {
    if (typeof schemaType === 'string' && RETIRED_SCHEMA_TYPE_SET.has(schemaType.trim())) {
      throw new Error(`Deprecated or retired Schema.org @type is forbidden: "${schemaType}"`);
    }
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') {
      assertNoDeprecatedTypes(value);
    }
  }
}

/**
 * Build the 2026 JSON-LD `@graph` for the bilingual home directory (`/` and `/zh/`).
 *
 * Graph nodes: `WebSite` (with `SearchAction`), `Person` (`AkaraChen`),
 * `CollectionPage`, `ItemList`, and `Dataset` (describing `/index.json`).
 */
export function buildHomeSchema({
  siteUrl = DEFAULT_SITE_URL,
  lang = 'en',
  data,
  pageUrl,
  title,
  description,
  updatedAt,
} = {}) {
  const baseSiteUrl = normalizeSiteUrl(siteUrl || data?.siteUrl || DEFAULT_SITE_URL);
  const langKey = normalizeLang(lang);
  const bcp47 = toBcp47Lang(langKey);
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const canonicalPageUrl = pageUrl
    ? normalizePageUrl(pageUrl, baseSiteUrl)
    : resolveHomeUrl(baseSiteUrl, langKey);

  const resolvedTitle =
    cleanString(title) ??
    cleanString(data?.title?.[langKey]) ??
    cleanString(data?.title?.en) ??
    DEFAULT_SITE_NAME;
  const resolvedDescription =
    cleanString(description) ??
    cleanString(data?.description?.[langKey]) ??
    cleanString(data?.description?.en);
  const resolvedUpdatedAt = normalizeIsoDate(updatedAt) ?? computeLatestDate(entries);

  const installableCount = entries.filter((e) => e?.installable).length;
  const nshVer = cleanString(data?.nshVerifiedVersion);
  const indexJsonUrl = toAbsoluteHttpsUrl('index.json', baseSiteUrl);
  const websiteId = `${baseSiteUrl}#website`;
  const maintainerId = `${baseSiteUrl}#maintainer`;
  const webPageId = `${canonicalPageUrl}#webpage`;
  const itemListId = `${canonicalPageUrl}#itemlist`;

  const datasetDescription =
    langKey === 'zh'
      ? `Awesome NSH 机器可读 JSON 目录索引，收录 ${entries.length} 个生态条目（其中 ${installableCount} 个为已验证可通过 nsh${nshVer ? ` ${nshVer}` : ''} 的 nsh add 安装的模块），包含安装命令、平台矩阵、SPDX 许可证与更新时间。`
      : `Machine-readable JSON catalog for Awesome NSH covering ${entries.length} curated entries (${installableCount} verified installable nshm packages${nshVer ? ` on nsh ${nshVer}` : ''}) with install commands, platform targets, SPDX licenses, and update dates.`;

  const webSiteNode = buildWebSiteNode({ baseSiteUrl, langKey, data });
  const maintainerNode = buildMaintainerNode(baseSiteUrl);
  const collectionPageNode = compactObject({
    '@type': 'CollectionPage',
    '@id': webPageId,
    url: canonicalPageUrl,
    name: resolvedTitle,
    description: resolvedDescription,
    inLanguage: bcp47,
    isPartOf: { '@id': websiteId },
    about: { '@id': websiteId },
    author: { '@id': maintainerId },
    mainEntity: { '@id': itemListId },
    primaryImageOfPage: buildOgImageObject(baseSiteUrl, langKey),
    dateModified: resolvedUpdatedAt,
  });
  const itemListNode = buildEntryItemList({
    id: itemListId,
    name: resolvedTitle,
    entries,
    baseSiteUrl,
    langKey,
  });
  const datasetNode = compactObject({
    '@type': 'Dataset',
    '@id': `${indexJsonUrl}#dataset`,
    name:
      langKey === 'zh'
        ? 'Awesome NSH 机器可读目录索引（index.json）'
        : 'Awesome NSH Machine-Readable Index (index.json)',
    description: datasetDescription,
    url: indexJsonUrl,
    identifier: indexJsonUrl,
    inLanguage: ['en', 'zh-Hans'],
    license: 'https://spdx.org/licenses/MIT',
    isAccessibleForFree: true,
    creator: { '@id': maintainerId },
    isPartOf: { '@id': websiteId },
    dateModified: resolvedUpdatedAt,
    version: nshVer ?? (data?.schemaVersion != null ? String(data.schemaVersion) : undefined),
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: indexJsonUrl,
      },
    ],
  });

  const graph = {
    '@context': SCHEMA_CONTEXT,
    '@graph': [webSiteNode, maintainerNode, collectionPageNode, itemListNode, datasetNode],
  };
  assertNoDeprecatedTypes(graph);
  return graph;
}

/**
 * Build the 2026 JSON-LD `@graph` for a bilingual section hub page
 * (`/nshm/`, `/framework/`, `/templates/`, `/guides/`, and `/zh/...`).
 *
 * Graph nodes: `WebSite`, `Person`, `CollectionPage`, `ItemList`, `BreadcrumbList`.
 */
export function buildSectionSchema({
  siteUrl = DEFAULT_SITE_URL,
  lang = 'en',
  section,
  entries = [],
  pageUrl,
  title,
  description,
  updatedAt,
} = {}) {
  const baseSiteUrl = normalizeSiteUrl(siteUrl);
  const langKey = normalizeLang(lang);
  const bcp47 = toBcp47Lang(langKey);

  const rawSectionId = typeof section === 'string' ? section : section?.id;
  const sectionId = cleanString(rawSectionId);
  const routeSlug = sectionId ? SECTION_SLUGS[sectionId] : undefined;
  if (!routeSlug) {
    throw new TypeError(`buildSectionSchema requires a valid section id, got "${rawSectionId}"`);
  }

  const list = Array.isArray(entries) ? entries : [];
  const canonicalPageUrl = pageUrl
    ? normalizePageUrl(pageUrl, baseSiteUrl)
    : resolveSectionUrl(baseSiteUrl, langKey, sectionId);
  const homeUrl = resolveHomeUrl(baseSiteUrl, langKey);

  const defaultLabel =
    SECTION_DEFAULT_LABELS[routeSlug]?.[langKey] ??
    SECTION_DEFAULT_LABELS[routeSlug]?.en ??
    routeSlug;
  const sectionLabel =
    (typeof section === 'object' && section
      ? cleanString(section.title?.[langKey]) ?? cleanString(section.title?.en)
      : undefined) ?? defaultLabel;

  const resolvedTitle = cleanString(title) ?? sectionLabel;
  const resolvedDescription =
    cleanString(description) ??
    (typeof section === 'object' && section
      ? cleanString(section.description?.[langKey]) ?? cleanString(section.description?.en)
      : undefined);
  const resolvedUpdatedAt = normalizeIsoDate(updatedAt) ?? computeLatestDate(list);

  const websiteId = `${baseSiteUrl}#website`;
  const maintainerId = `${baseSiteUrl}#maintainer`;
  const webPageId = `${canonicalPageUrl}#webpage`;
  const itemListId = `${canonicalPageUrl}#itemlist`;
  const breadcrumbId = `${canonicalPageUrl}#breadcrumb`;

  const webSiteNode = buildWebSiteNode({ baseSiteUrl, langKey });
  const maintainerNode = buildMaintainerNode(baseSiteUrl);
  const collectionPageNode = compactObject({
    '@type': 'CollectionPage',
    '@id': webPageId,
    url: canonicalPageUrl,
    name: resolvedTitle,
    description: resolvedDescription,
    inLanguage: bcp47,
    isPartOf: { '@id': websiteId },
    author: { '@id': maintainerId },
    breadcrumb: { '@id': breadcrumbId },
    mainEntity: { '@id': itemListId },
    primaryImageOfPage: buildOgImageObject(baseSiteUrl, langKey),
    dateModified: resolvedUpdatedAt,
  });
  const itemListNode = buildEntryItemList({
    id: itemListId,
    name: sectionLabel,
    entries: list,
    baseSiteUrl,
    langKey,
  });
  const breadcrumbNode = buildBreadcrumbNode(breadcrumbId, [
    { name: langKey === 'zh' ? '首页' : 'Home', url: homeUrl },
    { name: sectionLabel, url: canonicalPageUrl },
  ]);

  const graph = {
    '@context': SCHEMA_CONTEXT,
    '@graph': [webSiteNode, maintainerNode, collectionPageNode, itemListNode, breadcrumbNode],
  };
  assertNoDeprecatedTypes(graph);
  return graph;
}

/**
 * Build the 2026 JSON-LD `@graph` for an installable `nshm` module detail page
 * (`/nshm/<id>/` and `/zh/nshm/<id>/`).
 *
 * Graph nodes: `WebSite`, `Person`, `WebPage`, `SoftwareSourceCode`, `BreadcrumbList`.
 */
export function buildModuleSchema({
  siteUrl = DEFAULT_SITE_URL,
  lang = 'en',
  entry,
  pageUrl,
  title,
  description,
  updatedAt,
} = {}) {
  if (!entry || typeof entry !== 'object') {
    throw new TypeError('buildModuleSchema requires an entry object');
  }
  const entryName = cleanString(entry.name);
  if (!entryName) {
    throw new TypeError('buildModuleSchema requires entry.name');
  }

  const baseSiteUrl = normalizeSiteUrl(siteUrl);
  const langKey = normalizeLang(lang);
  const bcp47 = toBcp47Lang(langKey);
  const canonicalPageUrl = pageUrl
    ? normalizePageUrl(pageUrl, baseSiteUrl)
    : resolveModuleUrl(baseSiteUrl, langKey, entry.id);
  const homeUrl = resolveHomeUrl(baseSiteUrl, langKey);
  const nshmHubUrl = resolveSectionUrl(baseSiteUrl, langKey, 'nshm');

  const resolvedTitle = cleanString(title) ?? entryName;
  const resolvedDescription =
    cleanString(description) ??
    cleanString(entry.description?.[langKey]) ??
    cleanString(entry.description?.en);
  const resolvedUpdatedAt = normalizeIsoDate(updatedAt ?? entry.updatedAt);

  const codeRepository = toAbsoluteHttpsUrl(entry.sourceUrl, baseSiteUrl);
  const licenseUrl = normalizeLicenseUrl(entry.license);
  const nshVer = cleanString(entry.nshVersion);
  const platforms =
    Array.isArray(entry.platforms) && entry.platforms.length > 0 ? [...entry.platforms] : undefined;

  const sameAsSet = new Set();
  for (const candidate of [entry.cratesUrl, entry.homepage]) {
    const raw = cleanString(candidate);
    if (!raw) continue;
    const abs = toAbsoluteHttpsUrl(raw, baseSiteUrl);
    if (abs !== codeRepository && abs !== canonicalPageUrl) {
      sameAsSet.add(abs);
    }
  }
  const sameAs = sameAsSet.size > 0 ? [...sameAsSet] : undefined;

  const websiteId = `${baseSiteUrl}#website`;
  const maintainerId = `${baseSiteUrl}#maintainer`;
  const webPageId = `${canonicalPageUrl}#webpage`;
  const softwareId = `${canonicalPageUrl}#software`;
  const breadcrumbId = `${canonicalPageUrl}#breadcrumb`;

  const webSiteNode = buildWebSiteNode({ baseSiteUrl, langKey });
  const maintainerNode = buildMaintainerNode(baseSiteUrl);
  const webPageNode = compactObject({
    '@type': 'WebPage',
    '@id': webPageId,
    url: canonicalPageUrl,
    name: resolvedTitle,
    description: resolvedDescription,
    inLanguage: bcp47,
    isPartOf: { '@id': websiteId },
    breadcrumb: { '@id': breadcrumbId },
    mainEntity: { '@id': softwareId },
    primaryImageOfPage: buildOgImageObject(baseSiteUrl, langKey),
    dateModified: resolvedUpdatedAt,
  });

  const targetProduct = compactObject({
    '@type': 'SoftwareApplication',
    name: 'Native Shell (nsh)',
    url: 'https://nsh.dev',
    applicationCategory: 'DeveloperApplication',
    softwareVersion: nshVer,
    operatingSystem: platforms,
  });

  const softwareNode = compactObject({
    '@type': 'SoftwareSourceCode',
    '@id': softwareId,
    name: entryName,
    description: resolvedDescription,
    url: canonicalPageUrl,
    codeRepository,
    license: licenseUrl,
    version: cleanString(entry.version),
    programmingLanguage: mapProgrammingLanguage(entry.kind),
    runtimePlatform: nshVer ? `Native Shell ${nshVer}` : 'Native Shell',
    targetProduct,
    dateModified: resolvedUpdatedAt,
    isAccessibleForFree: true,
    inLanguage: bcp47,
    isPartOf: { '@id': websiteId },
    mainEntityOfPage: { '@id': webPageId },
    sameAs,
  });

  const breadcrumbNode = buildBreadcrumbNode(breadcrumbId, [
    { name: langKey === 'zh' ? '首页' : 'Home', url: homeUrl },
    { name: langKey === 'zh' ? '可安装 nshm' : 'Installable nshm', url: nshmHubUrl },
    { name: entryName, url: canonicalPageUrl },
  ]);

  const graph = {
    '@context': SCHEMA_CONTEXT,
    '@graph': [webSiteNode, maintainerNode, webPageNode, softwareNode, breadcrumbNode],
  };
  assertNoDeprecatedTypes(graph);
  return graph;
}

/**
 * Resolve article mode (`'techarticle'` or `'aboutpage'`) from explicit `kind` or URL.
 */
function resolveArticleMode(kind, pageUrl) {
  const rawKind = cleanString(kind)?.toLowerCase();
  if (rawKind) {
    if (rawKind === 'about' || rawKind === 'aboutpage') return 'aboutpage';
    if (rawKind === 'discovery' || rawKind === 'techarticle' || rawKind === 'article') {
      return 'techarticle';
    }
    throw new TypeError(`Unsupported article schema kind "${kind}"`);
  }
  if (pageUrl && String(pageUrl).toLowerCase().includes('/about')) {
    return 'aboutpage';
  }
  return 'techarticle';
}

/**
 * Build the 2026 JSON-LD `@graph` for E-E-A-T pillar pages:
 * - `TechArticle` + `BreadcrumbList` (for `/discovery/` & `/zh/discovery/`)
 * - `AboutPage` + `BreadcrumbList` (for `/about/` & `/zh/about/`)
 */
export function buildArticleSchema({
  siteUrl = DEFAULT_SITE_URL,
  lang = 'en',
  pageUrl,
  title,
  description,
  datePublished,
  dateModified,
  kind,
  breadcrumbName,
} = {}) {
  const baseSiteUrl = normalizeSiteUrl(siteUrl);
  const langKey = normalizeLang(lang);
  const bcp47 = toBcp47Lang(langKey);
  const mode = resolveArticleMode(kind, pageUrl);

  const defaultSlug = mode === 'aboutpage' ? 'about' : 'discovery';
  const defaultPathUrl = `${baseSiteUrl}${langKey === 'zh' ? 'zh/' : ''}${defaultSlug}/`;
  const canonicalPageUrl = pageUrl
    ? normalizePageUrl(pageUrl, baseSiteUrl)
    : defaultPathUrl;
  const homeUrl = resolveHomeUrl(baseSiteUrl, langKey);

  const defaultTitle =
    mode === 'aboutpage'
      ? langKey === 'zh'
        ? '关于 Awesome NSH'
        : 'About Awesome NSH'
      : langKey === 'zh'
        ? 'nshm 发现机制与验证方法论'
        : 'How nshm Discovery & Verification Work';
  const resolvedTitle = cleanString(title) ?? defaultTitle;
  const resolvedDescription = cleanString(description);

  const isoPublished = normalizeIsoDate(datePublished);
  const isoModified = normalizeIsoDate(dateModified) ?? isoPublished;

  const websiteId = `${baseSiteUrl}#website`;
  const maintainerId = `${baseSiteUrl}#maintainer`;
  const webPageId = `${canonicalPageUrl}#webpage`;
  const breadcrumbId = `${canonicalPageUrl}#breadcrumb`;
  const ogImage = buildOgImageObject(baseSiteUrl, langKey);

  const defaultCrumbLabel =
    mode === 'aboutpage'
      ? langKey === 'zh'
        ? '关于'
        : 'About'
      : langKey === 'zh'
        ? '发现机制'
        : 'Discovery Methodology';
  const crumbLabel = cleanString(breadcrumbName) ?? defaultCrumbLabel;

  const webSiteNode = buildWebSiteNode({ baseSiteUrl, langKey });
  const maintainerNode = buildMaintainerNode(baseSiteUrl);
  const breadcrumbNode = buildBreadcrumbNode(breadcrumbId, [
    { name: langKey === 'zh' ? '首页' : 'Home', url: homeUrl },
    { name: crumbLabel, url: canonicalPageUrl },
  ]);

  if (mode === 'aboutpage') {
    const aboutPageNode = compactObject({
      '@type': 'AboutPage',
      '@id': webPageId,
      url: canonicalPageUrl,
      name: resolvedTitle,
      description: resolvedDescription,
      inLanguage: bcp47,
      isPartOf: { '@id': websiteId },
      mainEntity: { '@id': maintainerId },
      author: { '@id': maintainerId },
      primaryImageOfPage: ogImage,
      breadcrumb: { '@id': breadcrumbId },
      datePublished: isoPublished,
      dateModified: isoModified,
    });

    const graph = {
      '@context': SCHEMA_CONTEXT,
      '@graph': [webSiteNode, maintainerNode, aboutPageNode, breadcrumbNode],
    };
    assertNoDeprecatedTypes(graph);
    return graph;
  }

  const articleId = `${canonicalPageUrl}#article`;
  const webPageNode = compactObject({
    '@type': 'WebPage',
    '@id': webPageId,
    url: canonicalPageUrl,
    name: resolvedTitle,
    description: resolvedDescription,
    inLanguage: bcp47,
    isPartOf: { '@id': websiteId },
    breadcrumb: { '@id': breadcrumbId },
    mainEntity: { '@id': articleId },
    primaryImageOfPage: ogImage,
    datePublished: isoPublished,
    dateModified: isoModified,
  });
  const techArticleNode = compactObject({
    '@type': 'TechArticle',
    '@id': articleId,
    headline: resolvedTitle,
    name: resolvedTitle,
    description: resolvedDescription,
    url: canonicalPageUrl,
    inLanguage: bcp47,
    author: { '@id': maintainerId },
    publisher: { '@id': maintainerId },
    image: ogImage,
    mainEntityOfPage: { '@id': webPageId },
    isPartOf: { '@id': websiteId },
    datePublished: isoPublished,
    dateModified: isoModified,
  });

  const graph = {
    '@context': SCHEMA_CONTEXT,
    '@graph': [webSiteNode, maintainerNode, webPageNode, techArticleNode, breadcrumbNode],
  };
  assertNoDeprecatedTypes(graph);
  return graph;
}

/**
 * Serialize a validated JSON-LD object safely for embedding inside `<script>`,
 * escaping `<` as `\u003c` and line separators `\u2028` / `\u2029`.
 */
export function serializeJsonLd(graphObj) {
  if (!graphObj || typeof graphObj !== 'object' || Array.isArray(graphObj)) {
    throw new TypeError('JSON-LD payload must be a non-null object');
  }
  assertNoDeprecatedTypes(graphObj);
  return JSON.stringify(graphObj)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Render an inline `<script type="application/ld+json">` element safely.
 */
export function renderJsonLdScript(graphObj) {
  return `<script type="application/ld+json">${serializeJsonLd(graphObj)}</script>`;
}
