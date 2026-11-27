import type { APIRoute } from 'astro';
import { getCatalogBundle, getPageContentEntry } from '../lib/catalog';
import { buildPageMarkdown } from '../../scripts/lib/seo-agentic.mjs';

export const GET: APIRoute = async () => {
  const { data, routes } = await getCatalogBundle();
  const [enHome, zhHome] = await Promise.all([
    getPageContentEntry('en', 'home'),
    getPageContentEntry('zh', 'home'),
  ]);
  const route = routes.find((r) => r.key === 'home' && r.lang === 'en')!;
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  const md = buildPageMarkdown({
    siteUrl,
    lang: 'en',
    pageType: 'home',
    data,
    seoContent: {
      home: {
        en: { definition: enHome.body || '' },
        zh: { definition: zhHome.body || '' },
      },
    },
    canonicalUrl: route.url,
    alternateUrl: route.altMdUrl,
  });
  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
