#!/usr/bin/env node
/**
 * Check all HTTP(S) URLs referenced in `data/entries.json`, `README.md`,
 * `README.zh.md`, and `docs/DISCOVERY.md`.
 *
 * Usage:
 *   node scripts/check-links.mjs [--ignore-self]
 */
import fs from 'node:fs';

const ignoreSelf = process.argv.includes('--ignore-self');
const UA = 'nsh-awesome-link-check/1.0 (https://github.com/AkaraChen/nsh-awesome)';
const SELF_HOSTS = [
  'https://nsh-awesome.vercel.app',
  'https://github.com/AkaraChen/nsh-awesome',
  'https://img.shields.io/endpoint?url=https%3A%2F%2Fnsh-awesome.vercel.app%2Fcount.json',
];

function collectUrls() {
  const urls = new Set();
  const data = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  if (data.repository) urls.add(data.repository);
  if (data.siteUrl) urls.add(data.siteUrl);
  for (const e of data.entries) {
    for (const k of ['sourceUrl', 'cratesUrl', 'homepage']) {
      if (e[k]) urls.add(e[k]);
    }
  }

  for (const file of ['README.md', 'README.zh.md', 'docs/DISCOVERY.md']) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/https?:\/\/[^\s)>`\]"']+/g)) {
      const cleaned = m[0].replace(/[.,;:]+$/, '');
      urls.add(cleaned);
    }
  }

  return [...urls].filter((u) => {
    if (!ignoreSelf) return true;
    return !SELF_HOSTS.some((prefix) => u.startsWith(prefix));
  });
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
  const urls = collectUrls().sort();
  const results = new Array(urls.length);
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const idx = cursor++;
      results[idx] = await checkOne(urls[idx]);
    }
  }

  await Promise.all(Array.from({ length: 4 }, worker));

  const failed = results.filter((r) => !r.ok);
  console.log(`check-links: checked ${results.length} unique URLs (${results.length - failed.length} OK, ${failed.length} failed)`);
  for (const r of failed) {
    console.error(`  FAIL ${r.url} -> ${r.error}`);
  }
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
