import type { APIRoute } from 'astro';
import { readCatalogData } from '../lib/catalog';
import { buildRobotsTxt } from '../../scripts/lib/seo-agentic.mjs';

export const GET: APIRoute = () => {
  const data = readCatalogData();
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  return new Response(buildRobotsTxt({ siteUrl }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
