/**
 * Bilingual route manifest builder for all 40 indexable SSR pages (20 EN + 20 ZH).
 *
 * Keeps route topology, canonical URLs, Markdown alternates, and per-page
 * W3C `lastmod` dates synchronized between HTML generation and `sitemap.xml`.
 */
import { computePageLastmod } from './seo-sitemap.mjs';

const SECTION_HUB_DEFS = Object.freeze([
  Object.freeze({ slug: 'nshm', entriesSection: 'nshm' }),
  Object.freeze({ slug: 'framework', entriesSection: 'framework' }),
  Object.freeze({ slug: 'templates', entriesSection: 'templates' }),
  Object.freeze({ slug: 'guides', entriesSection: 'articles' }),
]);

function normalizeBaseSiteUrl(rawSiteUrl) {
  const raw = String(rawSiteUrl || 'https://nsh-awesome.vercel.app/').trim();
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function getSeoRouteMap(seoContent) {
  const map = new Map();
  if (Array.isArray(seoContent?.routes)) {
    for (const item of seoContent.routes) {
      if (item?.key) map.set(item.key, item);
    }
  }
  return map;
}

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
  siteUrl,
  title,
  description,
  lastmod,
}) {
  const path = lang === 'zh' ? zhPath : enPath;
  const altPath = lang === 'zh' ? enPath : zhPath;
  const mdPath = lang === 'zh' ? zhMdPath : enMdPath;
  const altMdPath = lang === 'zh' ? enMdPath : zhMdPath;
  const cleanRel = path.replace(/^\/+/, '');
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
    path,
    altPath,
    enPath,
    zhPath,
    mdPath,
    altMdPath,
    htmlFile: cleanRel ? `site/${cleanRel}index.html` : 'site/index.html',
    mdFile: `site/${cleanMdRel}`,
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

/**
 * Build the ordered manifest of all 40 bilingual pages (`20 EN + 20 ZH`).
 *
 * @param {object} data - Parsed `data/entries.json`.
 * @param {object} seoContent - Parsed `data/seo-content.json`.
 * @returns {Array<object>}
 */
export function buildPageManifest(data, seoContent = {}) {
  const siteUrl = normalizeBaseSiteUrl(data?.siteUrl);
  const seoRoutes = getSeoRouteMap(seoContent);
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const installable = entries.filter((e) => e.installable);
  const pages = [];

  // 1. Home pages: `/` and `/zh/`
  const homeLastmod = computePageLastmod(
    [seoRoutes.get('home')?.updatedAt, seoContent?.updatedAt, ...entries.map((e) => e.updatedAt)],
    '2026-11-26',
  );
  for (const lang of ['en', 'zh']) {
    const seoHome = seoContent?.home?.[lang];
    const fallbackTitle =
      lang === 'zh'
        ? 'Awesome NSH 中文目录 — Native Shell 模块、框架 Crate 与指南'
        : 'Awesome NSH — Curated Native Shell Modules & Directory';
    pages.push(
      makeDescriptor({
        key: 'home',
        pageType: 'home',
        lang,
        slug: 'home',
        enPath: '/',
        zhPath: '/zh/',
        enMdPath: '/index.md',
        zhMdPath: '/zh/index.md',
        siteUrl,
        title: seoHome?.title || fallbackTitle,
        description: seoHome?.metaDescription || data?.description?.[lang] || '',
        lastmod: homeLastmod,
      }),
    );
  }

  // 2. Four section hub pages (EN + ZH = 8)
  for (const hub of SECTION_HUB_DEFS) {
    const key = `section:${hub.slug}`;
    const secEntries = entries.filter((e) => e.section === hub.entriesSection);
    const secMeta = sections.find((s) => s.id === hub.entriesSection);
    const secLastmod = computePageLastmod(
      [seoRoutes.get(key)?.updatedAt, ...secEntries.map((e) => e.updatedAt)],
      homeLastmod,
    );
    for (const lang of ['en', 'zh']) {
      const seoSec = seoContent?.sections?.[hub.slug]?.[lang];
      pages.push(
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
          siteUrl,
          title: seoSec?.title || `${secMeta?.title?.[lang] || hub.slug} — Awesome NSH`,
          description: seoSec?.metaDescription || secMeta?.description?.[lang] || '',
          lastmod: secLastmod,
        }),
      );
    }
  }

  // 3. Installable nshm module detail pages (13 * 2 = 26)
  for (const entry of installable) {
    const key = `module:${entry.id}`;
    const modLastmod = computePageLastmod(
      [seoRoutes.get(key)?.updatedAt, entry.updatedAt],
      homeLastmod,
    );
    for (const lang of ['en', 'zh']) {
      const seoMod = seoContent?.modules?.[entry.id]?.[lang];
      pages.push(
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
          siteUrl,
          title: seoMod?.title || `${entry.name} — Awesome NSH`,
          description: seoMod?.metaDescription || entry.description?.[lang] || '',
          lastmod: modLastmod,
        }),
      );
    }
  }

  // 4. Two E-E-A-T pillar pages (`/discovery/`, `/about/`, EN + ZH = 4)
  for (const pillarSlug of ['discovery', 'about']) {
    const key = `pillar:${pillarSlug}`;
    const pillarLastmod = computePageLastmod(
      [seoRoutes.get(key)?.updatedAt, seoContent?.updatedAt],
      homeLastmod,
    );
    for (const lang of ['en', 'zh']) {
      const seoPillar = seoContent?.pillars?.[pillarSlug]?.[lang];
      const fallbackTitle =
        pillarSlug === 'discovery'
          ? lang === 'zh'
            ? 'nshm 模块发现机制与 nsh 0.7.1 验证方法论'
            : 'How nshm Discovery & nsh 0.7.1 Verification Work'
          : lang === 'zh'
            ? '关于 Awesome NSH — 维护者、收录标准与验证边界'
            : 'About Awesome NSH — Maintainer, Criteria & Boundaries';
      pages.push(
        makeDescriptor({
          key,
          pageType: pillarSlug,
          lang,
          slug: pillarSlug,
          enPath: `/${pillarSlug}/`,
          zhPath: `/zh/${pillarSlug}/`,
          enMdPath: `/${pillarSlug}.md`,
          zhMdPath: `/zh/${pillarSlug}.md`,
          siteUrl,
          title: seoPillar?.title || fallbackTitle,
          description: seoPillar?.metaDescription || data?.description?.[lang] || '',
          lastmod: pillarLastmod,
        }),
      );
    }
  }

  return pages;
}
