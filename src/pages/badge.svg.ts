import type { APIRoute } from 'astro';
import { readCatalogData } from '../lib/catalog';
import { buildBadgeSvg } from '../../scripts/lib/readme-feed.mjs';

export const GET: APIRoute = () => {
  const data = readCatalogData();
  return new Response(buildBadgeSvg(data), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
