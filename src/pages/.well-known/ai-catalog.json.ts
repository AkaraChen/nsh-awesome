import type { APIRoute } from 'astro';
import { readCatalogData } from '../../lib/catalog';
import { renderAiCatalogJson } from '../../../scripts/lib/seo-agentic.mjs';

export const GET: APIRoute = () => {
  const data = readCatalogData();
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  return new Response(renderAiCatalogJson({ siteUrl, data }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
