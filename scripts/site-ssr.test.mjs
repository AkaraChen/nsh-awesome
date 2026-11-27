import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateAll } from './generate.mjs';
import { assertNoDeprecatedTypes } from './lib/seo-schema.mjs';

const entriesData = JSON.parse(fs.readFileSync(new URL('../data/entries.json', import.meta.url), 'utf8'));
const seoContent = JSON.parse(fs.readFileSync(new URL('../data/seo-content.json', import.meta.url), 'utf8'));

test('generateAll produces 94 outputs covering 40 bilingual pages, 404, 40 md files, and feeds', () => {
  const outputs = generateAll(entriesData, seoContent);
  assert.equal(outputs.size, 94);

  const htmlKeys = [...outputs.keys()].filter((k) => k.startsWith('site/') && k.endsWith('.html'));
  const mdKeys = [...outputs.keys()].filter((k) => k.startsWith('site/') && k.endsWith('.md'));
  assert.equal(htmlKeys.length, 41); // 40 indexable + 404.html
  assert.equal(mdKeys.length, 40);

  for (const required of [
    'README.md',
    'README.zh.md',
    'site/index.json',
    'site/count.json',
    'site/badge.svg',
    'site/.nojekyll',
    'site/assets/app.css',
    'site/assets/app.js',
    'site/404.html',
    'site/robots.txt',
    'site/sitemap.xml',
    'site/llms.txt',
    'site/llms-full.txt',
    'site/.well-known/ai-catalog.json',
  ]) {
    assert.ok(outputs.has(required), `missing generated output: ${required}`);
  }
});

test('home EN and ZH SSR HTML contain all 43 semantic cards, 13 module links, and valid WebMCP form', () => {
  const outputs = generateAll(entriesData, seoContent);
  const installable = entriesData.entries.filter((e) => e.installable);

  for (const [file, prefix] of [
    ['site/index.html', ''],
    ['site/zh/index.html', '/zh'],
  ]) {
    const html = outputs.get(file);
    assert.ok(html.includes('<a class="skip-link" href="#main-content">'));
    assert.ok(html.includes('<main id="main-content"'));
    assert.equal((html.match(/<article class="card"/g) || []).length, entriesData.entries.length);
    for (const mod of installable) {
      assert.ok(html.includes(`href="${prefix}/nshm/${mod.id}/"`), `${file} missing link to ${mod.id}`);
    }
    // Check declarative WebMCP form has toolparamdescription on every input/select control
    const formMatch = html.match(/<form[^>]*toolname="filter_catalog_entries"[^>]*>([\s\S]*?)<\/form>/);
    assert.ok(formMatch, `${file} missing declarative WebMCP search form`);
    assert.ok(/tooldescription="[^"]+"/.test(formMatch[0]), `${file} form missing tooldescription`);
    const controls = [...formMatch[1].matchAll(/<(?:input|select|textarea)\b[^>]*>/g)].map((m) => m[0]);
    assert.equal(controls.length, 2);
    for (const ctrl of controls) {
      assert.ok(/toolparamdescription="[^"]+"/.test(ctrl), `control missing toolparamdescription: ${ctrl}`);
    }
  }
});

test('every indexable HTML page has SEO metadata, JSON-LD, heading order, and valid internal links', () => {
  const outputs = generateAll(entriesData, seoContent);
  const htmlKeys = [...outputs.keys()].filter((k) => k.startsWith('site/') && k.endsWith('.html'));
  const sitemapXml = outputs.get('site/sitemap.xml');

  const prebuiltSiteFiles = new Set([
    'favicon.ico',
    'favicon.svg',
    'apple-touch-icon.png',
    'site.webmanifest',
    'og-image.png',
    'og-image-zh.png',
  ]);

  function resolvesInSite(hrefPath) {
    const clean = hrefPath.split('#')[0].split('?')[0].replace(/^\/+/, '');
    if (!clean) return outputs.has('site/index.html');
    if (outputs.has(`site/${clean}`) || prebuiltSiteFiles.has(clean)) return true;
    const asDirIndex = clean.endsWith('/') ? `site/${clean}index.html` : `site/${clean}/index.html`;
    return outputs.has(asDirIndex);
  }

  for (const key of htmlKeys) {
    const html = outputs.get(key);
    const h1Count = (html.match(/<h1\b/g) || []).length;
    assert.equal(h1Count, 1, `${key} expected exactly 1 <h1>, got ${h1Count}`);

    // Verify heading levels never skip (h1 -> h2 -> h3)
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) {
      assert.ok(
        levels[i] <= levels[i - 1] + 1,
        `${key} skipped heading level H${levels[i - 1]} -> H${levels[i]}`,
      );
    }

    // Verify zero duplicate id attributes
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size, `${key} contains duplicate id attributes`);

    // Verify every internal root-relative href resolves to an existing site artifact
    for (const m of html.matchAll(/\shref="(\/[^"]*)"/g)) {
      const target = m[1];
      assert.ok(resolvesInSite(target), `${key} has broken internal href="${target}"`);
    }

    // Verify language switcher stays on same origin using root-relative path
    const langSwitch = html.match(/id="lang-toggle"\s+href="([^"]+)"/);
    assert.ok(langSwitch && langSwitch[1].startsWith('/'), `${key} #lang-toggle must use root-relative href`);

    if (key === 'site/404.html') {
      assert.ok(html.includes('<meta name="robots" content="noindex">'));
      assert.ok(!sitemapXml.includes('404'));
      continue;
    }

    assert.ok(html.includes('<link rel="canonical" href="https://'));
    assert.ok(html.includes('hreflang="en"'));
    assert.ok(html.includes('hreflang="zh-Hans"'));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(html.includes('<meta property="og:title"'));
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
    assert.ok(html.includes('<link rel="ai-catalog"'));
    assert.ok(html.includes('<link rel="alternate" type="text/markdown"'));

    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `${key} missing JSON-LD script`);
    const parsedLd = JSON.parse(ldMatch[1]);
    assertNoDeprecatedTypes(parsedLd);
    assert.ok(Array.isArray(parsedLd['@graph']) && parsedLd['@graph'].length >= 3);
  }
});

test('scripts/generate.mjs never imports or executes manual build-seo-assets.mjs', () => {
  const src = fs.readFileSync(new URL('./generate.mjs', import.meta.url), 'utf8');
  const codeWithoutComments = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!codeWithoutComments.includes('build-seo-assets'));
  for (const file of fs.readdirSync(new URL('./lib', import.meta.url))) {
    const libSrc = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'lib', file), 'utf8');
    const libCode = libSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.ok(!libCode.includes('build-seo-assets'), `scripts/lib/${file} must not reference build-seo-assets`);
  }
});
