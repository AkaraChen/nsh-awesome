import { defineConfig } from 'astro/config';

const rawBase = String(process.env.ASTRO_BASE || '/').trim();
const cleanBase = rawBase.replace(/^\/+|\/+$/g, '');
const base = cleanBase ? `/${cleanBase}` : '/';

export default defineConfig({
  site: 'https://nsh-awesome.vercel.app',
  base,
  trailingSlash: 'always',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    format: 'directory',
  },
});
