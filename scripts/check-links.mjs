#!/usr/bin/env node
/**
 * Check all HTTP(S) URLs referenced in `data/entries.json`, `README.md`,
 * `README.zh.md`, `docs/DISCOVERY.md`, `CONTRIBUTING.md`, and built
 * `dist/` discovery/route artifacts (`sitemap.xml`, `robots.txt`, `llms.txt`,
 * `.well-known/ai-catalog.json`, `index.html`, `zh/index.html`).
 *
 * Usage:
 *   node scripts/check-links.mjs [--ignore-self] [--dir dist]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UA = 'nsh-awesome-link-check/1.0 (https://github.com/AkaraChen/nsh-awesome)';
export const SELF_HOSTS = Object.freeze([
  'https://nsh-awesome.vercel.app',
  'https://akarachen.github.io/nsh-awesome',
  'https://github.com/AkaraChen/nsh-awesome',
  'https://img.shields.io/endpoint?url=https%3A%2F%2Fnsh-awesome.vercel.app%2Fcount.json',
]);

export function isSelfUrl(url) {
  return SELF_HOSTS.some((prefix) => {
    if (url === prefix) return true;
    const next = url.charAt(prefix.length);
    return url.startsWith(prefix) && (next === '/' || next === '?' || next === '#');
  });
}

export function collectUrls({ ignoreSelf = false, siteDir = 'dist' } = {}) {
  const urls = new Set();
  const data = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  const baseSiteUrl = String(data.siteUrl || 'https://nsh-awesome.vercel.app/').replace(/\/?$/, '/');
  if (data.repository) urls.add(data.repository);
  if (data.siteUrl) urls.add(data.siteUrl);
  for (const e of data.entries) {
    for (const k of ['sourceUrl', 'cratesUrl', 'homepage']) {
      if (e[k]) urls.add(e[k]);
    }
  }

  for (const file of ['README.md', 'README.zh.md', 'docs/DISCOVERY.md', 'CONTRIBUTING.md']) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/https?:\/\/[^\s)>`\]"']+/g)) {
      const cleaned = m[0].replace(/[.,;:]+$/, '');
      urls.add(cleaned);
    }
  }

  // Built agentic & route surfaces under siteDir (default dist/)
  const robotsFile = path.join(siteDir, 'robots.txt');
  if (fs.existsSync(robotsFile)) {
    urls.add(`${baseSiteUrl}robots.txt`);
    const robots = fs.readFileSync(robotsFile, 'utf8');
    for (const m of robots.matchAll(/^(?:Sitemap|Agentmap):\s*(https?:\/\/\S+)/gim)) {
      urls.add(m[1].trim());
    }
  }

  const sitemapFile = path.join(siteDir, 'sitemap.xml');
  if (fs.existsSync(sitemapFile)) {
    urls.add(`${baseSiteUrl}sitemap.xml`);
    const sitemap = fs.readFileSync(sitemapFile, 'utf8');
    for (const m of sitemap.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)) {
      urls.add(m[1].trim());
    }
    for (const m of sitemap.matchAll(/<xhtml:link\b[^>]*\shref="(https?:\/\/[^"]+)"/g)) {
      urls.add(m[1].trim());
    }
  }

  const llmsFile = path.join(siteDir, 'llms.txt');
  if (fs.existsSync(llmsFile)) {
    urls.add(`${baseSiteUrl}llms.txt`);
    const llms = fs.readFileSync(llmsFile, 'utf8');
    for (const m of llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      urls.add(m[1].trim());
    }
  }

  const aiCatalogFile = path.join(siteDir, '.well-known', 'ai-catalog.json');
  if (fs.existsSync(aiCatalogFile)) {
    urls.add(`${baseSiteUrl}.well-known/ai-catalog.json`);
    const catalog = JSON.parse(fs.readFileSync(aiCatalogFile, 'utf8'));
    for (const u of [catalog.host?.identifier, catalog.host?.documentationUrl, catalog.host?.logoUrl]) {
      if (typeof u === 'string' && /^https?:\/\//.test(u)) urls.add(u);
    }
    for (const entry of catalog.entries || []) {
      if (typeof entry?.url === 'string' && /^https?:\/\//.test(entry.url)) urls.add(entry.url);
    }
  }

  for (const htmlFile of [path.join(siteDir, 'index.html'), path.join(siteDir, 'zh', 'index.html')]) {
    if (!fs.existsSync(htmlFile)) continue;
    const html = fs.readFileSync(htmlFile, 'utf8');
    for (const m of html.matchAll(/<meta\s+property="og:image"\s+content="(https?:\/\/[^"]+)"/gi)) {
      urls.add(m[1].trim());
    }
  }

  for (const asset of ['favicon.ico', 'apple-touch-icon.png', 'site.webmanifest']) {
    if (fs.existsSync(path.join(siteDir, asset)) || fs.existsSync(path.join('public', asset))) {
      urls.add(`${baseSiteUrl}${asset}`);
    }
  }

  return [...urls].filter((u) => !ignoreSelf || !isSelfUrl(u));
}

async function checkOne(url) {
  const maxAttempts = 3;
  let lastErr = '';

  // crates.io SPA serves 404 on HEAD and 200 HTML for missing crates on GET;
  // check the crates.io API directly for real crate existence.
  const crateMatch = url.match(/^https:\/\/crates\.io\/crates\/([A-Za-z0-9_-]+)\/?$/);
  const targetUrl = crateMatch ? `https://crates.io/api/v1/crates/${crateMatch[1]}` : url;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let res = await fetch(targetUrl, {
        method: crateMatch ? 'GET' : 'HEAD',
        redirect: 'follow',
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(15_000),
      });
      if (!crateMatch && (res.status === 403 || res.status === 404 || res.status === 405 || res.status === 501)) {
        res = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*' },
          signal: AbortSignal.timeout(15_000),
        });
      }
      await res.body?.cancel().catch(() => {});
      if (res.status >= 200 && res.status < 400) {
        return { url, ok: true, status: res.status };
      }
      lastErr = `HTTP ${res.status}`;
      if (res.status !== 429 && res.status < 500) {
        return { url, ok: false, error: lastErr };
      }
    } catch (err) {
      lastErr = err.message;
    }
    await new Promise((r) => setTimeout(r, 400 * attempt));
  }

  return { url, ok: false, error: lastErr };
}

async function main() {
  const argv = process.argv.slice(2);
  const ignoreSelf = argv.includes('--ignore-self');
  const dirIdx = argv.indexOf('--dir');
  const siteDir = dirIdx >= 0 && argv[dirIdx + 1] ? argv[dirIdx + 1] : 'dist';
  const urls = collectUrls({ ignoreSelf, siteDir }).sort();
  const results = new Array(urls.length);
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const idx = cursor++;
      results[idx] = await checkOne(urls[idx]);
    }
  }

  await Promise.all(Array.from({ length: 6 }, worker));

  const failed = results.filter((r) => !r.ok);
  console.log(`check-links: checked ${results.length} unique URLs (${results.length - failed.length} OK, ${failed.length} failed)`);
  for (const r of failed) {
    console.error(`  FAIL ${r.url} -> ${r.error}`);
  }
  if (failed.length > 0) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
