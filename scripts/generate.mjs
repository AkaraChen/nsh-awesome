#!/usr/bin/env node
/**
 * Thin orchestrator generating README.md, README.zh.md, machine-readable feeds
 * (index.json, count.json, badge.svg, ai-catalog.json, llms*.txt, robots.txt,
 * sitemap.xml), shared CSS/JS assets, 40 bilingual SSR HTML + Markdown pages,
 * and 404.html from `data/entries.json` and `data/seo-content.json`.
 *
 * Note: `scripts/build-seo-assets.mjs` (raster favicon/OG image generator) is a
 * manual-only script and MUST NOT be invoked here or in fast CI loops.
 *
 * Usage:
 *   node scripts/generate.mjs          # write all generated files
 *   node scripts/generate.mjs --check  # fail if any generated file is out of sync
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  githubHeadingAnchor,
  buildReadme,
  buildIndexJson,
  buildCountJson,
  buildBadgeSvg,
} from './lib/readme-feed.mjs';
import { buildPageManifest } from './lib/site-routes.mjs';
import { buildAppCss, buildAppJs } from './lib/site-assets.mjs';
import { render404Page } from './lib/site-layout.mjs';
import {
  renderHomePage,
  renderSectionPage,
  renderModulePage,
  renderDiscoveryPage,
  renderAboutPage,
} from './lib/site-pages.mjs';
import { buildSitemapXml } from './lib/seo-sitemap.mjs';
import {
  buildRobotsTxt,
  buildLlmsTxt,
  buildLlmsFullTxt,
  renderAiCatalogJson,
  buildPageMarkdown,
} from './lib/seo-agentic.mjs';

export { githubHeadingAnchor };

const CHECK = process.argv.includes('--check');
const DATA_PATH = 'data/entries.json';
const SEO_CONTENT_PATH = 'data/seo-content.json';

function readJsonIfExists(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
}

function renderRouteHtml(route, data, seoContent) {
  switch (route.pageType) {
    case 'home':
      return renderHomePage({ route, data, seoContent });
    case 'section':
      return renderSectionPage({ route, data, seoContent });
    case 'module':
      return renderModulePage({ route, data, seoContent });
    case 'discovery':
      return renderDiscoveryPage({ route, data, seoContent });
    case 'about':
      return renderAboutPage({ route, data, seoContent });
    default:
      throw new TypeError(`Unknown pageType "${route.pageType}"`);
  }
}

export function generateAll(data, seoContent = readJsonIfExists(SEO_CONTENT_PATH)) {
  const siteUrl = data.siteUrl || 'https://nsh-awesome.vercel.app/';
  const indexObj = buildIndexJson(data);
  const countObj = buildCountJson(data);
  const routes = buildPageManifest(data, seoContent);

  const outputs = new Map([
    ['README.md', buildReadme(data, 'en')],
    ['README.zh.md', buildReadme(data, 'zh')],
    ['site/index.json', JSON.stringify(indexObj, null, 2) + '\n'],
    ['site/count.json', JSON.stringify(countObj) + '\n'],
    ['site/badge.svg', buildBadgeSvg(data)],
    ['site/.nojekyll', ''],
    ['site/assets/app.css', buildAppCss()],
    ['site/assets/app.js', buildAppJs()],
    ['site/404.html', render404Page({ data })],
  ]);

  const sitemapPages = [];
  for (const route of routes) {
    outputs.set(route.htmlFile, renderRouteHtml(route, data, seoContent));
    outputs.set(
      route.mdFile,
      buildPageMarkdown({
        siteUrl,
        lang: route.lang,
        pageType: route.pageType,
        data,
        seoContent,
        section: route.entriesSection,
        entry: route.entry,
        canonicalUrl: route.url,
        alternateUrl: route.altMdUrl,
      }),
    );
    sitemapPages.push({
      url: route.url,
      enUrl: route.enUrl,
      zhUrl: route.zhUrl,
      lastmod: route.lastmod,
    });
  }

  outputs.set('site/robots.txt', buildRobotsTxt({ siteUrl }));
  outputs.set('site/sitemap.xml', buildSitemapXml(sitemapPages, { strictMesh: true }));
  outputs.set('site/llms.txt', buildLlmsTxt({ siteUrl, data, pages: routes }));
  outputs.set('site/llms-full.txt', buildLlmsFullTxt({ siteUrl, data, seoContent }));
  outputs.set('site/.well-known/ai-catalog.json', renderAiCatalogJson({ siteUrl, data }));

  return outputs;
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const seoContent = readJsonIfExists(SEO_CONTENT_PATH);
  const outputs = generateAll(data, seoContent);

  if (CHECK) {
    const drifted = [];
    for (const [relPath, expected] of outputs.entries()) {
      if (!fs.existsSync(relPath)) {
        drifted.push(`${relPath} (missing)`);
        continue;
      }
      const actual = fs.readFileSync(relPath, 'utf8');
      if (actual !== expected) {
        drifted.push(`${relPath} (out of sync)`);
      }
    }
    if (drifted.length > 0) {
      console.error('Generated artifacts are out of sync with data/entries.json & data/seo-content.json:');
      for (const d of drifted) console.error(`  - ${d}`);
      console.error('Run `node scripts/generate.mjs` and commit the updated files.');
      process.exit(1);
    }
    console.log(`check: all ${outputs.size} generated files match data/entries.json & data/seo-content.json`);
    return;
  }

  for (const [relPath, content] of outputs.entries()) {
    fs.mkdirSync(path.dirname(relPath), { recursive: true });
    fs.writeFileSync(relPath, content);
    console.log(`wrote ${relPath}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
