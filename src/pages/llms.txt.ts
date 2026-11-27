import type { APIRoute } from 'astro';
import { getCatalogBundle } from '../lib/catalog';
import { buildLlmsTxt } from '../../scripts/lib/seo-agentic.mjs';

export const GET: APIRoute = async () => {
  const { data, routes } = await getCatalogBundle();
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  const text = buildLlmsTxt({ siteUrl, data, pages: routes });
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
