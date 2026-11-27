import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nsh-awesome.vercel.app',
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
