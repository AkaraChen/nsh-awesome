import type { APIRoute } from 'astro';
import { getCatalogBundle } from '../lib/catalog';
import { buildSitemapXml } from '../../scripts/lib/seo-sitemap.mjs';

export const GET: APIRoute = async () => {
  const { routes } = await getCatalogBundle();
  const sitemapPages = routes.map((r) => ({
    url: r.url,
    enUrl: r.enUrl,
    zhUrl: r.zhUrl,
    lastmod: r.lastmod,
  }));
  const xml = buildSitemapXml(sitemapPages, { strictMesh: true });
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
