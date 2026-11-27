import type { APIRoute } from 'astro';
import { readCatalogData } from '../lib/catalog';
import { buildIndexJson } from '../../scripts/lib/readme-feed.mjs';

export const GET: APIRoute = () => {
  const data = readCatalogData();
  const body = `${JSON.stringify(buildIndexJson(data), null, 2)}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
