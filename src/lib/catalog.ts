import fs from 'node:fs';
import path from 'node:path';
import { getCollection, getEntry } from 'astro:content';
import {
  SECTION_HUB_DEFS,
  SECTION_SLUG_FOR_ID,
  buildFallbackModuleMeta,
  buildRouteManifestFromData,
  normalizeBaseSiteUrl,
} from './catalog-pure.mjs';

export { SECTION_HUB_DEFS, SECTION_SLUG_FOR_ID, buildFallbackModuleMeta, normalizeBaseSiteUrl };

export interface CatalogMeta {
  schemaVersion: number;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  repository: string;
  siteUrl: string;
  nshVerifiedVersion: string;
  sections: Array<{
    id: 'nshm' | 'framework' | 'templates' | 'articles';
    title: { en: string; zh: string };
    emoji: string;
    description: { en: string; zh: string };
  }>;
  categories: Array<{
    id: string;
    section: string;
    emoji: string;
    title: { en: string; zh: string };
  }>;
  entries: Array<any>;
}

let cachedCatalog: CatalogMeta | null = null;

export function readCatalogData(): CatalogMeta {
  if (!cachedCatalog) {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'data/entries.json'), 'utf8');
    cachedCatalog = JSON.parse(raw) as CatalogMeta;
  }
  return cachedCatalog;
}

export async function getCatalogBundle() {
  const data = readCatalogData();
  const [entriesCol, pagesCol, modulesCol] = await Promise.all([
    getCollection('entries'),
    getCollection('pages'),
    getCollection('modules'),
  ]);

  const pagesByKey = new Map(pagesCol.map((p) => [p.id, p.data]));
  const modulesByKey = new Map(modulesCol.map((m) => [m.id, m.data]));
  const routes = buildRouteManifestFromData({ data, pagesByKey, modulesByKey });

  return {
    data,
    entriesCol,
    pagesCol,
    modulesCol,
    pagesByKey,
    modulesByKey,
    routes,
  };
}

export async function getPageContentEntry(lang: 'en' | 'zh', slug: string) {
  const entry = await getEntry('pages', `${lang}/${slug}`);
  if (!entry) {
    throw new Error(`Missing pages content entry: ${lang}/${slug}`);
  }
  return entry;
}

export async function getModuleContentEntry(lang: 'en' | 'zh', moduleId: string) {
  return (await getEntry('modules', `${lang}/${moduleId}`)) ?? null;
}

export function buildInstallableLinkMap(entries: any[], lang: 'en' | 'zh'): Map<string, string> {
  const prefix = lang === 'zh' ? '/zh' : '';
  const map = new Map<string, string>();
  for (const e of entries) {
    if (e.installable) {
      map.set(e.name, `${prefix}/nshm/${e.id}/`);
    }
  }
  return map;
}
