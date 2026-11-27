import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { getCatalogBundle } from '../../lib/catalog';
import { buildPageMarkdown } from '../../../scripts/lib/seo-agentic.mjs';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getCollection('entries');
  return entries
    .filter((e) => e.data.installable)
    .map((e) => ({
      params: { id: e.id },
      props: { entry: { id: e.id, ...e.data } },
    }));
};

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry;
  const { data, routes } = await getCatalogBundle();
  const route = routes.find((r) => r.key === `module:${entry.id}` && r.lang === 'en')!;
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  const md = buildPageMarkdown({
    siteUrl,
    lang: 'en',
    pageType: 'module',
    data,
    entry,
    canonicalUrl: route.url,
    alternateUrl: route.altMdUrl,
  });
  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
