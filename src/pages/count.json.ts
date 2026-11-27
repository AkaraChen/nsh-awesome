import type { APIRoute } from 'astro';
import { readCatalogData } from '../lib/catalog';
import { buildCountJson } from '../../scripts/lib/readme-feed.mjs';

export const GET: APIRoute = () => {
  const data = readCatalogData();
  const body = `${JSON.stringify(buildCountJson(data))}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
