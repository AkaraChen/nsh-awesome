/**
 * Pure HTML tag builders for brand favicons, Web App Manifest,
 * Open Graph social previews, and Twitter Card metadata.
 *
 * Consumed by `scripts/generate.mjs` (stage 3) and verified independently.
 */

export const SITE_URL = 'https://nsh-awesome.vercel.app/';
export const SITE_NAME = 'Awesome NSH';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = 'image/png';

export const DEFAULT_OG_IMAGES = Object.freeze({
  en: Object.freeze({
    path: 'og-image.png',
    alt: 'Awesome NSH — 43 curated Native Shell entries and 13 verified nshm modules for nsh 0.7.1',
  }),
  zh: Object.freeze({
    path: 'og-image-zh.png',
    alt: 'Awesome NSH — Native Shell 精选模块目录，收录 43 个条目与 13 个 nsh 0.7.1 实测可安装 nshm 模块',
  }),
});

/**
 * Collapse excess whitespace and escape HTML attribute special characters.
 */
function escapeHtmlAttr(value) {
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
 * Normalize a relative or absolute base path so it always ends with `/`.
 */
function normalizeBasePath(basePath = '/') {
  if (basePath == null) return '/';
  const trimmed = String(basePath).trim();
  if (!trimmed) return '/';
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

/**
 * Return true when a BCP-47 language tag targets Chinese.
 */
function isChineseLang(lang) {
  return typeof lang === 'string' && lang.trim().toLowerCase().startsWith('zh');
}

/**
 * Resolve an absolute URL string against `originBase`, falling back safely.
 */
function resolveAbsoluteUrl(value, originBase) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed, originBase).href;
  } catch {
    return trimmed;
  }
}

/**
 * Derive the origin root URL from a canonical URL or fall back to `SITE_URL`.
 */
function getOriginBase(canonicalUrl) {
  if (canonicalUrl) {
    try {
      const parsed = new URL(String(canonicalUrl).trim());
      return `${parsed.origin}/`;
    } catch {
      // Fall back to default site URL below.
    }
  }
  return SITE_URL;
}

/**
 * Return the default OG image metadata object for `en` or `zh`.
 */
export function getDefaultOgImage(lang = 'en', siteUrl = SITE_URL) {
  const entry = isChineseLang(lang) ? DEFAULT_OG_IMAGES.zh : DEFAULT_OG_IMAGES.en;
  const originBase = getOriginBase(siteUrl);
  return {
    url: resolveAbsoluteUrl(entry.path, originBase),
    alt: entry.alt,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    type: OG_IMAGE_TYPE,
  };
}

/**
 * Render favicon, Apple Touch Icon, and Web App Manifest `<link>` elements.
 *
 * @param {string} [basePath='/'] - Relative or absolute prefix to the site root.
 * @returns {string} Newline-separated HTML `<link>` tags.
 */
export function renderHeadIconsAndManifest(basePath = '/') {
  const base = escapeHtmlAttr(normalizeBasePath(basePath));
  return [
    `<link rel="icon" href="${base}favicon.ico" sizes="32x32">`,
    `<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" sizes="180x180">`,
    `<link rel="manifest" href="${base}site.webmanifest">`,
  ].join('\n');
}

/**
 * Render Open Graph and Twitter Card (`summary_large_image`) `<meta>` tags.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} [options.canonicalUrl]
 * @param {string} [options.lang='en']
 * @param {string} [options.imageUrl]
 * @param {string} [options.imageAlt]
 * @param {string} [options.type='website']
 * @param {string} [options.publishedTime]
 * @param {string} [options.modifiedTime]
 * @param {string} [options.siteName='Awesome NSH']
 * @param {number} [options.imageWidth=1200]
 * @param {number} [options.imageHeight=630]
 * @param {string} [options.imageType='image/png']
 * @returns {string} Newline-separated HTML `<meta>` tags.
 */
export function renderSocialMeta({
  title,
  description,
  canonicalUrl,
  lang = 'en',
  imageUrl,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  siteName = SITE_NAME,
  imageWidth = OG_IMAGE_WIDTH,
  imageHeight = OG_IMAGE_HEIGHT,
  imageType = OG_IMAGE_TYPE,
} = {}) {
  const zh = isChineseLang(lang);
  const locale = zh ? 'zh_CN' : 'en_US';
  const alternateLocale = zh ? 'en_US' : 'zh_CN';
  const originBase = getOriginBase(canonicalUrl);
  const defaultOg = getDefaultOgImage(lang, originBase);

  const resolvedTitle = title != null && String(title).trim() ? String(title) : siteName;
  const resolvedDescription = description != null ? String(description) : '';
  const resolvedCanonical = canonicalUrl ? resolveAbsoluteUrl(canonicalUrl, originBase) : '';
  const resolvedImageUrl =
    imageUrl != null && String(imageUrl).trim()
      ? resolveAbsoluteUrl(imageUrl, originBase)
      : defaultOg.url;
  const resolvedImageAlt =
    imageAlt != null && String(imageAlt).trim() ? String(imageAlt) : defaultOg.alt;
  const resolvedType = type && String(type).trim() ? String(type).trim() : 'website';

  const tags = [
    `<meta property="og:type" content="${escapeHtmlAttr(resolvedType)}">`,
    `<meta property="og:site_name" content="${escapeHtmlAttr(siteName)}">`,
    `<meta property="og:title" content="${escapeHtmlAttr(resolvedTitle)}">`,
    `<meta property="og:description" content="${escapeHtmlAttr(resolvedDescription)}">`,
  ];

  if (resolvedCanonical) {
    tags.push(`<meta property="og:url" content="${escapeHtmlAttr(resolvedCanonical)}">`);
  }

  tags.push(
    `<meta property="og:locale" content="${escapeHtmlAttr(locale)}">`,
    `<meta property="og:locale:alternate" content="${escapeHtmlAttr(alternateLocale)}">`,
    `<meta property="og:image" content="${escapeHtmlAttr(resolvedImageUrl)}">`,
  );

  if (resolvedImageUrl.startsWith('https://')) {
    tags.push(`<meta property="og:image:secure_url" content="${escapeHtmlAttr(resolvedImageUrl)}">`);
  }

  tags.push(
    `<meta property="og:image:type" content="${escapeHtmlAttr(imageType)}">`,
    `<meta property="og:image:width" content="${escapeHtmlAttr(imageWidth)}">`,
    `<meta property="og:image:height" content="${escapeHtmlAttr(imageHeight)}">`,
    `<meta property="og:image:alt" content="${escapeHtmlAttr(resolvedImageAlt)}">`,
  );

  if (resolvedType === 'article') {
    if (publishedTime && String(publishedTime).trim()) {
      tags.push(
        `<meta property="article:published_time" content="${escapeHtmlAttr(publishedTime)}">`,
      );
    }
    if (modifiedTime && String(modifiedTime).trim()) {
      tags.push(
        `<meta property="article:modified_time" content="${escapeHtmlAttr(modifiedTime)}">`,
      );
    }
  } else if (modifiedTime && String(modifiedTime).trim()) {
    tags.push(`<meta property="og:updated_time" content="${escapeHtmlAttr(modifiedTime)}">`);
  }

  tags.push(
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtmlAttr(resolvedTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtmlAttr(resolvedDescription)}">`,
    `<meta name="twitter:image" content="${escapeHtmlAttr(resolvedImageUrl)}">`,
    `<meta name="twitter:image:alt" content="${escapeHtmlAttr(resolvedImageAlt)}">`,
  );

  return tags.join('\n');
}
