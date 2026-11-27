import type { APIRoute } from 'astro';
import { getBasePrefix } from '../i18n/ui';

export const GET: APIRoute = () => {
  const base = getBasePrefix();
  const manifest = {
    name: 'Awesome NSH',
    short_name: 'Awesome NSH',
    description: 'Curated Native Shell (nsh) modules (nshm), framework crates, templates, and guides.',
    id: base,
    start_url: base,
    scope: base,
    display: 'standalone',
    background_color: '#0e1016',
    theme_color: '#0e1016',
    icons: [
      {
        src: `${base}apple-touch-icon.png`,
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${base}favicon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
  return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
