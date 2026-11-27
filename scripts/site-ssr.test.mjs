import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateAll } from './generate.mjs';
import { assertNoDeprecatedTypes } from './lib/seo-schema.mjs';
import {
  buildFallbackModuleMeta,
  buildRouteManifestFromData,
} from '../src/lib/catalog-pure.mjs';

const entriesData = JSON.parse(
  fs.readFileSync(new URL('../data/entries.json', import.meta.url), 'utf8'),
);

function walkRelFiles(rootDir) {
  const out = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else out.push(path.relative(rootDir, full).split(path.sep).join('/'));
    }
  }
  visit(rootDir);
  return out;
}

test('generateAll builds README.md and README.zh.md from data/entries.json', () => {
  const outputs = generateAll(entriesData);
  assert.equal(outputs.size, 2);
  assert.ok(outputs.has('README.md'));
  assert.ok(outputs.has('README.zh.md'));
  assert.equal(outputs.get('README.md').includes('seo-content.json'), false);
  assert.equal(outputs.get('README.zh.md').includes('seo-content.json'), false);
});

test('Astro build in dist/ produces 41 HTML, 40 MD, feeds, discovery files, and _astro assets', () => {
  assert.ok(fs.existsSync('dist/index.html'), 'dist/ must exist (run npm run build before npm test)');
  const relFiles = walkRelFiles('dist');
  const htmlFiles = relFiles.filter((f) => f.endsWith('.html'));
  const mdFiles = relFiles.filter((f) => f.endsWith('.md'));
  const cssFiles = relFiles.filter((f) => f.startsWith('_astro/') && f.endsWith('.css'));
  const jsFiles = relFiles.filter((f) => f.startsWith('_astro/') && f.endsWith('.js'));

  assert.equal(htmlFiles.length, 41);
  assert.equal(mdFiles.length, 40);
  assert.ok(cssFiles.length >= 1, 'Expected compiled CSS bundle in dist/_astro/');
  assert.ok(jsFiles.length >= 1, 'Expected compiled JS bundle in dist/_astro/');

  for (const required of [
    'index.json',
    'count.json',
    'badge.svg',
    '.nojekyll',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'llms-full.txt',
    '.well-known/ai-catalog.json',
    'favicon.ico',
    'favicon.svg',
    'apple-touch-icon.png',
    'site.webmanifest',
    'og-image.png',
    'og-image-zh.png',
  ]) {
    assert.ok(relFiles.includes(required), `missing dist/${required}`);
  }

  const cssBundle = fs.readFileSync(path.join('dist', cssFiles[0]), 'utf8');
  assert.match(cssBundle, /\[hidden\][\s\S]*display:\s*none/i);
});

test('home EN and ZH Astro SSR HTML contain all 43 semantic cards, 13 module links, hidden #clear-filters, and valid WebMCP form', () => {
  const installable = entriesData.entries.filter((e) => e.installable);

  for (const [file, prefix] of [
    ['dist/index.html', ''],
    ['dist/zh/index.html', '/zh'],
  ]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(html.includes('<a class="skip-link" href="#main-content">'));
    assert.ok(html.includes('<main id="main-content"'));
    assert.match(html, /<button[^>]*id="clear-filters"[^>]*\bhidden\b/i);
    assert.equal((html.match(/<article class="card"/g) || []).length, entriesData.entries.length);
    for (const mod of installable) {
      assert.ok(html.includes(`href="${prefix}/nshm/${mod.id}/"`), `${file} missing link to ${mod.id}`);
    }
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

test('every built HTML page in dist/ has SEO metadata, JSON-LD, heading order, and valid internal links', () => {
  const relFiles = walkRelFiles('dist');
  const fileSet = new Set(relFiles);
  const htmlFiles = relFiles.filter((f) => f.endsWith('.html'));
  const sitemapXml = fs.readFileSync('dist/sitemap.xml', 'utf8');

  function resolvesInDist(refPath) {
    const clean = refPath.split('#')[0].split('?')[0].replace(/^\/+/, '');
    if (!clean) return fileSet.has('index.html');
    if (fileSet.has(clean)) return true;
    const asDirIndex = clean.endsWith('/') ? `${clean}index.html` : `${clean}/index.html`;
    return fileSet.has(asDirIndex);
  }

  for (const rel of htmlFiles) {
    const html = fs.readFileSync(path.join('dist', rel), 'utf8');
    const h1Count = (html.match(/<h1\b/g) || []).length;
    assert.equal(h1Count, 1, `${rel} expected exactly 1 <h1>, got ${h1Count}`);

    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) {
      assert.ok(
        levels[i] <= levels[i - 1] + 1,
        `${rel} skipped heading level H${levels[i - 1]} -> H${levels[i]}`,
      );
    }

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size, `${rel} contains duplicate id attributes`);

    for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
      const target = m[1];
      assert.ok(resolvesInDist(target), `${rel} has broken internal ref="${target}"`);
    }

    const langSwitch = html.match(/id="lang-toggle"\s+href="([^"]+)"/);
    assert.ok(langSwitch && langSwitch[1].startsWith('/'), `${rel} #lang-toggle must use root-relative href`);

    if (rel === '404.html') {
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
    assert.ok(ldMatch, `${rel} missing JSON-LD script`);
    const parsedLd = JSON.parse(ldMatch[1]);
    assertNoDeprecatedTypes(parsedLd);
    assert.ok(Array.isArray(parsedLd['@graph']) && parsedLd['@graph'].length >= 3);
  }
});

test('buildFallbackModuleMeta and buildRouteManifestFromData cleanly support future nshm entries without dedicated .md files', () => {
  const synthetic = structuredClone(entriesData);
  const newMod = {
    id: 'nsh-future-demo',
    name: 'nsh-future-demo',
    section: 'nshm',
    category: 'data',
    kind: 'tsx-nshm',
    installable: true,
    sourceType: 'github',
    installCommand: 'nsh add github:example/nsh-future-demo',
    version: '0.1.0',
    nshVersion: '>=0.7.1',
    description: {
      en: 'Lightweight future TSX storage module for Native Shell apps.',
      zh: '适用于 Native Shell 应用的轻量级未来 TSX 存储模块。',
    },
    sourceUrl: 'https://github.com/example/nsh-future-demo',
    cratesUrl: null,
    homepage: null,
    platforms: ['iOS', 'Android', 'macOS', 'Web'],
    license: 'MIT',
    updatedAt: '2026-11-27',
    notes: null,
  };
  synthetic.entries.push(newMod);

  const routes = buildRouteManifestFromData({ data: synthetic });
  assert.equal(routes.length, 42);
  assert.ok(routes.some((r) => r.path === '/nshm/nsh-future-demo/' && r.lang === 'en'));
  assert.ok(routes.some((r) => r.path === '/zh/nshm/nsh-future-demo/' && r.lang === 'zh'));

  const enFallback = buildFallbackModuleMeta({
    entry: newMod,
    lang: 'en',
    allEntries: synthetic.entries,
    nshVerifiedVersion: synthetic.nshVerifiedVersion,
  });
  const zhFallback = buildFallbackModuleMeta({
    entry: newMod,
    lang: 'zh',
    allEntries: synthetic.entries,
    nshVerifiedVersion: synthetic.nshVerifiedVersion,
  });

  assert.ok(enFallback.title.length >= 25 && enFallback.title.length <= 65);
  assert.ok(enFallback.description.length >= 100 && enFallback.description.length <= 165);
  assert.ok(zhFallback.title.length >= 15 && zhFallback.title.length <= 55);
  assert.ok(zhFallback.description.length >= 45 && zhFallback.description.length <= 130);
  assert.ok(enFallback.paragraphs.length >= 3);
  assert.ok(zhFallback.paragraphs.length >= 3);
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
