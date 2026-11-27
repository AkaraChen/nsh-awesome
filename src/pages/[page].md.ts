import type { APIRoute, GetStaticPaths } from 'astro';
import { getCatalogBundle } from '../lib/catalog';
import { buildPageMarkdown } from '../../scripts/lib/seo-agentic.mjs';

const SLUGS = ['nshm', 'framework', 'templates', 'guides', 'discovery', 'about'] as const;

export const getStaticPaths: GetStaticPaths = () => {
  return SLUGS.map((page) => ({ params: { page } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = String(params.page);
  const { data, routes } = await getCatalogBundle();
  const route = routes.find((r) => r.slug === slug && r.lang === 'en')!;
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  const md = buildPageMarkdown({
    siteUrl,
    lang: 'en',
    pageType: route.pageType,
    data,
    section: route.entriesSection,
    canonicalUrl: route.url,
    alternateUrl: route.altMdUrl,
  });
  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
