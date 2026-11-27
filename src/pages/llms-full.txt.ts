import type { APIRoute } from 'astro';
import { getCatalogBundle, getPageContentEntry } from '../lib/catalog';
import { buildLlmsFullTxt } from '../../scripts/lib/seo-agentic.mjs';

export const GET: APIRoute = async () => {
  const { data } = await getCatalogBundle();
  const enHome = await getPageContentEntry('en', 'home');
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  const text = buildLlmsFullTxt({
    siteUrl,
    data,
    seoContent: {
      home: {
        en: { definition: enHome.body || '' },
      },
    },
  });
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
