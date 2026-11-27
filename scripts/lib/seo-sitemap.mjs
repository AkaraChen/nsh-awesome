/**
 * Pure bilingual HTML hreflang tag and UTF-8 XML sitemap builders.
 *
 * Follows `AgriciDaniel/claude-seo` (v2.6.3) `seo-hreflang` and `seo-sitemap`:
 * - Emits self-referencing `<link rel="canonical">` and full bidirectional
 *   `en` / `zh-Hans` / `x-default` (pointing to EN) `<link rel="alternate">` tags.
 * - Generates `<urlset>` with `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`
 *   and `xmlns:xhtml="http://www.w3.org/1999/xhtml"`.
 * - Enforces per-page real W3C `<lastmod>` (`YYYY-MM-DD`), omits ignored
 *   `<priority>` and `<changefreq>` tags, and excludes 404 / `noindex` pages.
 */

export const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
export const XHTML_NS = 'http://www.w3.org/1999/xhtml';
export const HREFLANG_EN = 'en';
export const HREFLANG_ZH = 'zh-Hans';
export const HREFLANG_DEFAULT = 'x-default';
export const MAX_SITEMAP_URLS = 50000;
export const MAX_SITEMAP_BYTES = 50 * 1024 * 1024;
export const MAX_LOC_CHARS = 2048;

const HREFLANG_PATTERN = /^[a-z]{2}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2})?$/;

/**
 * Escape XML text and attribute special characters.
 */
export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape HTML attribute special characters after collapsing whitespace.
 */
export function escapeHtmlAttr(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate and return an absolute HTTPS URL suitable for canonical, hreflang, and `<loc>`.
 */
function normalizeAbsoluteHttpsUrl(url, fieldName = 'url') {
  if (typeof url !== 'string' || !url.trim()) {
    throw new TypeError(`${fieldName} must be a non-empty HTTPS URL string`);
  }
  const raw = url.trim();
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    throw new TypeError(`Invalid ${fieldName} "${url}": ${err.message}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new TypeError(`${fieldName} must use https://, got "${parsed.href}"`);
  }
  if (parsed.username || parsed.password) {
    throw new TypeError(`${fieldName} must not contain credentials`);
  }
  if (parsed.hash) {
    throw new TypeError(`${fieldName} must not contain a URL fragment: "${parsed.href}"`);
  }
  const href = parsed.href;
  if (href.length >= MAX_LOC_CHARS) {
    throw new RangeError(`${fieldName} exceeds ${MAX_LOC_CHARS} character sitemap limit`);
  }
  return href;
}

/**
 * Validate a strict W3C `YYYY-MM-DD` date (or ISO 8601 datetime prefix) with real calendar validation.
 */
export function normalizeW3cDate(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError('lastmod date must be a non-empty YYYY-MM-DD string');
  }
  const raw = value.trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
  if (!match) {
    throw new TypeError(`Invalid W3C date "${value}" (expected YYYY-MM-DD)`);
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
 * Compute the maximum valid `YYYY-MM-DD` date from an iterable of candidate dates.
 */
export function computePageLastmod(dates, fallback) {
  let latest;
  if (dates != null) {
    for (const candidate of dates) {
      if (candidate == null || String(candidate).trim() === '') continue;
      const iso = normalizeW3cDate(String(candidate));
      if (!latest || iso > latest) {
        latest = iso;
      }
    }
  }
  if (latest) return latest;
  if (fallback != null && String(fallback).trim() !== '') {
    return normalizeW3cDate(String(fallback));
  }
  return undefined;
}

/**
 * Validate an hreflang code (`x-default`, `ll`, `ll-Ssss`, `ll-RR`, or `ll-Ssss-RR`).
 */
export function isValidHreflangCode(code) {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim();
  return trimmed === HREFLANG_DEFAULT || HREFLANG_PATTERN.test(trimmed);
}

/**
 * Return true if a page represents a 404 or `noindex` resource excluded from sitemap/hreflang.
 */
export function isExcludedSitemapPage(page) {
  if (!page || typeof page !== 'object') return true;
  if (page.noindex === true || page.excludeFromSitemap === true || page.is404 === true) {
    return true;
  }
  if (page.status === 404 || page.statusCode === 404) {
    return true;
  }
  if (typeof page.robots === 'string' && /\bnoindex\b/i.test(page.robots)) {
    return true;
  }
  const rawUrl = page.url ?? page.loc ?? page.canonicalUrl;
  if (typeof rawUrl === 'string' && rawUrl.trim()) {
    try {
      const parsed = new URL(rawUrl.trim());
      if (/\/404(?:\.html|\/)?$/i.test(parsed.pathname)) {
        return true;
      }
    } catch {
      if (/\/404(?:\.html|\/)?$/i.test(rawUrl.trim())) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Render `<link rel="canonical">` and complete bidirectional bilingual `<link rel="alternate">` tags
 * (`en`, `zh-Hans`, and `x-default` pointing to `enUrl`).
 *
 * @param {object} options
 * @param {string} options.enUrl - Absolute HTTPS URL for the English variant.
 * @param {string} options.zhUrl - Absolute HTTPS URL for the Simplified Chinese (`zh-Hans`) variant.
 * @param {string} options.canonicalUrl - Absolute HTTPS canonical URL (must match `enUrl` or `zhUrl`).
 * @returns {string} Newline-separated HTML `<link>` tags.
 */
export function renderHreflangTags({ enUrl, zhUrl, canonicalUrl } = {}) {
  const en = normalizeAbsoluteHttpsUrl(enUrl, 'enUrl');
  const zh = normalizeAbsoluteHttpsUrl(zhUrl, 'zhUrl');
  const canonical = normalizeAbsoluteHttpsUrl(canonicalUrl, 'canonicalUrl');

  if (canonical !== en && canonical !== zh) {
    throw new Error(
      `canonicalUrl "${canonical}" must exactly match enUrl "${en}" or zhUrl "${zh}"`,
    );
  }
  if (en === zh) {
    throw new Error(`enUrl and zhUrl must be distinct URLs, both resolved to "${en}"`);
  }

  return [
    `<link rel="canonical" href="${escapeHtmlAttr(canonical)}">`,
    `<link rel="alternate" hreflang="${HREFLANG_EN}" href="${escapeHtmlAttr(en)}">`,
    `<link rel="alternate" hreflang="${HREFLANG_ZH}" href="${escapeHtmlAttr(zh)}">`,
    `<link rel="alternate" hreflang="${HREFLANG_DEFAULT}" href="${escapeHtmlAttr(en)}">`,
  ].join('\n');
}

/**
 * Normalize alternate declarations from `{ enUrl, zhUrl }` or `alternates` array/map.
 */
function normalizePageAlternates(page, loc) {
  const hasEnZhPair = page.enUrl !== undefined || page.zhUrl !== undefined;
  let list = [];

  if (hasEnZhPair) {
    if (!page.enUrl || !page.zhUrl) {
      throw new TypeError(`Page "${loc}" must provide both enUrl and zhUrl when using bilingual pairs`);
    }
    const en = normalizeAbsoluteHttpsUrl(page.enUrl, 'enUrl');
    const zh = normalizeAbsoluteHttpsUrl(page.zhUrl, 'zhUrl');
    const xDefault = page.xDefaultUrl
      ? normalizeAbsoluteHttpsUrl(page.xDefaultUrl, 'xDefaultUrl')
      : en;
    list = [
      { hreflang: HREFLANG_EN, href: en },
      { hreflang: HREFLANG_ZH, href: zh },
      { hreflang: HREFLANG_DEFAULT, href: xDefault },
    ];
  } else if (Array.isArray(page.alternates)) {
    list = page.alternates.map((alt, idx) => {
      if (!alt || typeof alt !== 'object') {
        throw new TypeError(`Page "${loc}" alternate[${idx}] must be an object`);
      }
      const code = typeof alt.hreflang === 'string' ? alt.hreflang.trim() : '';
      if (!isValidHreflangCode(code)) {
        throw new TypeError(`Page "${loc}" has invalid hreflang code "${alt.hreflang}"`);
      }
      return {
        hreflang: code,
        href: normalizeAbsoluteHttpsUrl(alt.href, `alternates[${idx}].href`),
      };
    });
  } else if (page.alternates && typeof page.alternates === 'object') {
    for (const [rawCode, rawHref] of Object.entries(page.alternates)) {
      if (rawHref == null) continue;
      const code = rawCode === 'zh' ? HREFLANG_ZH : rawCode.trim();
      if (!isValidHreflangCode(code)) {
        throw new TypeError(`Page "${loc}" has invalid hreflang code "${rawCode}"`);
      }
      list.push({
        hreflang: code,
        href: normalizeAbsoluteHttpsUrl(rawHref, `alternates.${rawCode}`),
      });
    }
    if (!list.some((a) => a.hreflang === HREFLANG_DEFAULT)) {
      const enAlt = list.find((a) => a.hreflang === HREFLANG_EN);
      if (enAlt) {
        list.push({ hreflang: HREFLANG_DEFAULT, href: enAlt.href });
      }
    }
  }

  if (list.length > 0) {
    const seenCodes = new Set();
    for (const alt of list) {
      if (seenCodes.has(alt.hreflang)) {
        throw new Error(`Page "${loc}" has duplicate hreflang "${alt.hreflang}"`);
      }
      seenCodes.add(alt.hreflang);
    }
    if (!list.some((alt) => alt.href === loc)) {
      throw new Error(`Page "${loc}" alternates are missing a self-referencing hreflang entry`);
    }
  }

  return list;
}

/**
 * Build a UTF-8 XML sitemap (`<urlset>`) with XHTML `<xhtml:link>` hreflang alternates,
 * real per-page W3C `<lastmod>` dates, no `<priority>` / `<changefreq>`, and automatic
 * exclusion of 404 / `noindex` pages.
 *
 * @param {Array<object>} pages
 * @param {object} [options]
 * @param {boolean} [options.strictMesh=true] - Verify every hreflang alternate has a matching `<url>` with a return link.
 * @returns {string} Complete UTF-8 XML document string.
 */
export function buildSitemapXml(pages, { strictMesh = true } = {}) {
  if (!Array.isArray(pages)) {
    throw new TypeError('buildSitemapXml(pages) requires an array of page descriptors');
  }

  const included = [];
  const byLoc = new Map();

  for (const page of pages) {
    if (isExcludedSitemapPage(page)) {
      continue;
    }

    const rawLoc = page.url ?? page.loc ?? page.canonicalUrl;
    const loc = normalizeAbsoluteHttpsUrl(rawLoc, 'page.url');
    if (byLoc.has(loc)) {
      throw new Error(`Duplicate sitemap URL "${loc}"`);
    }

    const lastmod = normalizeW3cDate(page.lastmod ?? page.updatedAt);
    const alternates = normalizePageAlternates(page, loc);

    const record = { loc, lastmod, alternates };
    included.push(record);
    byLoc.set(loc, record);
  }

  if (included.length > MAX_SITEMAP_URLS) {
    throw new RangeError(
      `Sitemap contains ${included.length} URLs, exceeding single-file limit of ${MAX_SITEMAP_URLS}`,
    );
  }

  if (strictMesh) {
    for (const entry of included) {
      for (const alt of entry.alternates) {
        const target = byLoc.get(alt.href);
        if (!target) {
          throw new Error(
            `Broken hreflang target from "${entry.loc}" (${alt.hreflang} -> "${alt.href}"): target URL is missing or excluded from sitemap`,
          );
        }
        if (!target.alternates.some((back) => back.href === entry.loc)) {
          throw new Error(
            `Missing hreflang return link on "${target.loc}" back to "${entry.loc}"`,
          );
        }
      }
    }
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="${SITEMAP_NS}"`,
    `        xmlns:xhtml="${XHTML_NS}">`,
  ];

  for (const entry of included) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    for (const alt of entry.alternates) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`,
      );
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  const xml = `${lines.join('\n')}\n`;

  if (Buffer.byteLength(xml, 'utf8') > MAX_SITEMAP_BYTES) {
    throw new RangeError(`Sitemap exceeds ${MAX_SITEMAP_BYTES} uncompressed byte limit`);
  }

  return xml;
}
