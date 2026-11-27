#!/usr/bin/env node
/**
 * Deterministic SEO, Schema.org, hreflang, agentic-discovery, and internal-link
 * regression gate for every generated HTML, XML, JSON, TXT, and MD file in `site/`.
 *
 * Usage:
 *   node scripts/seo-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_SITE_URL = 'https://nsh-awesome.vercel.app/';

export const DEPRECATED_SCHEMA_TYPES = Object.freeze([
  'FAQPage',
  'HowTo',
  'SpecialAnnouncement',
  'CourseInfo',
  'EstimatedSalary',
  'LearningVideo',
  'ClaimReview',
  'VehicleListing',
  'PracticeProblem',
  'Practice Problem',
  'OccupationalAggregateRating',
  'Vehicle',
]);

const RETIRED_SCHEMA_TYPE_SET = new Set(DEPRECATED_SCHEMA_TYPES);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const JSONLD_URL_KEYS = new Set([
  '@id',
  'url',
  'item',
  'contentUrl',
  'codeRepository',
  'sameAs',
  'identifier',
  'license',
  'urlTemplate',
  'image',
  'logo',
]);

function walkFiles(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  const results = [];
  function visit(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else results.push(fullPath);
    }
  }
  visit(rootDir);
  return results;
}

export function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function parseAttributes(rawAttrs) {
  const attrs = new Map();
  for (const m of rawAttrs.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    attrs.set(name, decodeHtmlEntities(val));
  }
  return attrs;
}

function extractTags(html, tagName) {
  const out = [];
  const re = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
  for (const m of html.matchAll(re)) {
    out.push(parseAttributes(m[1]));
  }
  return out;
}

function stripTagsAndText(fragment) {
  return decodeHtmlEntities(
    String(fragment ?? '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidW3cDate(value) {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

function readPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return null;
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function normalizeSiteUrl(rawSiteUrl) {
  const raw = String(rawSiteUrl || DEFAULT_SITE_URL).trim();
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function makeSiteResolver(siteDir, siteUrl) {
  const siteOrigin = new URL(siteUrl).origin;

  function toLocalRelativePath(rawUrlOrPath) {
    if (!rawUrlOrPath || typeof rawUrlOrPath !== 'string') return null;
    const trimmed = rawUrlOrPath.trim();
    if (!trimmed || trimmed.startsWith('#') || /^(?:mailto|tel|javascript|data):/i.test(trimmed)) {
      return null;
    }

    let pathname = null;
    if (trimmed.startsWith('/')) {
      pathname = trimmed.split('#')[0].split('?')[0];
    } else if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.origin !== siteOrigin) return null;
        pathname = parsed.pathname;
      } catch {
        return '__INVALID_URL__';
      }
    } else {
      pathname = `/${trimmed.split('#')[0].split('?')[0]}`;
    }

    const clean = decodeURIComponent(pathname).replace(/^\/+/, '');
    if (!clean) {
      const idx = path.join(siteDir, 'index.html');
      return fs.existsSync(idx) && fs.statSync(idx).isFile() ? idx : null;
    }

    const exact = path.join(siteDir, clean);
    if (fs.existsSync(exact) && fs.statSync(exact).isFile()) {
      return exact;
    }

    const dirIdx = path.join(siteDir, clean.replace(/\/+$/, ''), 'index.html');
    if (fs.existsSync(dirIdx) && fs.statSync(dirIdx).isFile()) {
      return dirIdx;
    }

    return null;
  }

  function fileToRouteUrl(filePath) {
    const rel = path.relative(siteDir, filePath).split(path.sep).join('/');
    if (rel === 'index.html') return siteUrl;
    if (rel.endsWith('/index.html')) {
      return `${siteUrl}${rel.slice(0, -'index.html'.length)}`;
    }
    return `${siteUrl}${rel}`;
  }

  return { siteOrigin, toLocalRelativePath, fileToRouteUrl };
}

function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (setA.size === 0 && setB.size === 0) return 0;
  let inter = 0;
  for (const item of setA) {
    if (setB.has(item)) inter += 1;
  }
  return inter / (setA.size + setB.size - inter || 1);
}

function sharedPrefixRatio(a, b) {
  const minLen = Math.min(a.length, b.length);
  if (minLen === 0) return 0;
  let i = 0;
  while (i < minLen && a[i] === b[i]) i += 1;
  return i / minLen;
}

function tokenizeDescription(text, isZh) {
  const norm = text.toLowerCase().trim();
  if (isZh) {
    const compact = norm.replace(/\s+/g, '');
    const grams = [];
    for (let i = 0; i < compact.length - 1; i += 1) {
      grams.push(compact.slice(i, i + 2));
    }
    return grams;
  }
  return norm.match(/[a-z0-9-]+/g)?.filter((t) => t.length >= 2) || [];
}

function checkHeadingHierarchy(fragment, label, errors) {
  const levels = [];
  for (const m of fragment.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const level = Number(m[1]);
    const text = stripTagsAndText(m[2]);
    if (!text) {
      errors.push(`${label}: empty <h${level}> heading`);
    }
    levels.push(level);
  }
  const h1Count = levels.filter((lvl) => lvl === 1).length;
  if (h1Count !== 1) {
    errors.push(`${label}: expected exactly 1 <h1>, found ${h1Count}`);
  }
  if (levels.length > 0 && levels[0] !== 1) {
    errors.push(`${label}: first heading should be H1, found H${levels[0]}`);
  }
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] > levels[i - 1] + 1) {
      errors.push(`${label}: skipped heading level H${levels[i - 1]} -> H${levels[i]}`);
    }
  }
}

function validateJsonLdValue(node, label, errors, currentKey = null) {
  if (typeof node === 'string') {
    if (/^http:\/\//i.test(node.trim())) {
      errors.push(`${label}: insecure http:// URL in JSON-LD${currentKey ? ` (${currentKey})` : ''}: ${node}`);
    }
    if (currentKey && JSONLD_URL_KEYS.has(currentKey)) {
      const candidate = currentKey === 'urlTemplate' ? node.replace(/\{[^}]+\}/g, 'query') : node;
      let parsed;
      try {
        parsed = new URL(candidate);
      } catch {
        errors.push(`${label}: invalid URL in JSON-LD "${currentKey}": ${node}`);
        return;
      }
      if (parsed.protocol !== 'https:') {
        errors.push(`${label}: JSON-LD "${currentKey}" must use https://, got ${node}`);
      }
    }
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      validateJsonLdValue(item, label, errors, currentKey);
    }
    return;
  }

  if (node && typeof node === 'object') {
    if (node['@type'] !== undefined) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      for (const t of types) {
        if (RETIRED_SCHEMA_TYPE_SET.has(String(t))) {
          errors.push(`${label}: JSON-LD uses retired/deprecated Schema.org @type "${t}"`);
        }
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === '@context') continue;
      validateJsonLdValue(v, label, errors, k);
    }
  }
}

function checkMarkdownText(text, relPath, { siteOrigin, toLocalRelativePath, minChars = 100 }, errors) {
  if (text.trim().length < minChars) {
    errors.push(`${relPath}: Markdown content too short (${text.trim().length} < ${minChars} chars)`);
  }
  if (/\bundefined\b/.test(text) || /\[object Object\]/.test(text)) {
    errors.push(`${relPath}: Markdown contains leaked "undefined" or "[object Object]"`);
  }

  const lines = text.split(/\r?\n/);
  let openFence = null;
  let h1Count = 0;
  let prevLevel = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const fence = trimmed.match(/^(`{3,})/);
    if (fence) {
      const len = fence[1].length;
      if (openFence === null) openFence = len;
      else if (trimmed === '`'.repeat(openFence)) openFence = null;
      continue;
    }
    if (openFence !== null) continue;

    const heading = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      if (level === 1) h1Count += 1;
      if (prevLevel > 0 && level > prevLevel + 1) {
        errors.push(`${relPath}:${i + 1}: skipped Markdown heading H${prevLevel} -> H${level}`);
      }
      prevLevel = level;
    }
  }

  if (openFence !== null) {
    errors.push(`${relPath}: unclosed Markdown code fence`);
  }
  if (h1Count !== 1) {
    errors.push(`${relPath}: expected exactly 1 Markdown H1, found ${h1Count}`);
  }

  // Validate every same-origin absolute link and root-relative markdown link
  for (const m of text.matchAll(/https?:\/\/[^\s)>`\]"']+/g)) {
    const cleaned = m[0].replace(/[.,;:]+$/, '');
    try {
      const parsed = new URL(cleaned);
      if (parsed.origin === siteOrigin && !toLocalRelativePath(cleaned)) {
        errors.push(`${relPath}: dead internal Markdown URL ${cleaned}`);
      }
    } catch {
      errors.push(`${relPath}: malformed URL ${cleaned}`);
    }
  }
  for (const m of text.matchAll(/\]\((\/[^)\s]+)\)/g)) {
    if (!toLocalRelativePath(m[1])) {
      errors.push(`${relPath}: dead root-relative Markdown link ${m[1]}`);
    }
  }
}

export function validateSitemapXmlText(xmlText, relPath, { siteOrigin, toLocalRelativePath, expectedPagesByUrl }, errors) {
  if (!xmlText.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    errors.push(`${relPath}: missing UTF-8 XML declaration`);
  }
  if (!xmlText.includes(`<urlset`) || !xmlText.includes(SITEMAP_NS) || !xmlText.includes(XHTML_NS)) {
    errors.push(`${relPath}: missing <urlset> with sitemap and xhtml namespaces`);
  }
  if (!xmlText.trimEnd().endsWith('</urlset>')) {
    errors.push(`${relPath}: missing closing </urlset>`);
  }
  if (/<(?:priority|changefreq)\b/i.test(xmlText)) {
    errors.push(`${relPath}: must not emit deprecated <priority> or <changefreq> tags`);
  }

  const openUrlCount = (xmlText.match(/<url>/g) || []).length;
  const closeUrlCount = (xmlText.match(/<\/url>/g) || []).length;
  if (openUrlCount === 0 || openUrlCount !== closeUrlCount) {
    errors.push(`${relPath}: malformed <url> blocks (${openUrlCount} open vs ${closeUrlCount} close)`);
    return;
  }

  const seenLocs = new Map();
  for (const blockMatch of xmlText.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = blockMatch[1];
    const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/);
    if (!locMatch) {
      errors.push(`${relPath}: <url> block missing <loc>`);
      continue;
    }
    const loc = decodeHtmlEntities(locMatch[1].trim());
    let parsedLoc;
    try {
      parsedLoc = new URL(loc);
    } catch {
      errors.push(`${relPath}: invalid <loc> URL "${loc}"`);
      continue;
    }
    if (parsedLoc.protocol !== 'https:' || parsedLoc.origin !== siteOrigin) {
      errors.push(`${relPath}: <loc> must use HTTPS on ${siteOrigin}, got "${loc}"`);
    }
    if (/\/404(?:\.html|\/)?$/i.test(parsedLoc.pathname)) {
      errors.push(`${relPath}: 404 URL must not appear in sitemap: ${loc}`);
    }
    if (seenLocs.has(loc)) {
      errors.push(`${relPath}: duplicate <loc> "${loc}"`);
      continue;
    }
    const resolved = toLocalRelativePath(loc);
    if (!resolved || !expectedPagesByUrl.has(loc)) {
      errors.push(`${relPath}: <loc> does not correspond to an indexable local HTML page: ${loc}`);
    }
    if (!lastmodMatch || !isValidW3cDate(lastmodMatch[1])) {
      errors.push(`${relPath}: missing or invalid W3C <lastmod> for ${loc}: "${lastmodMatch?.[1] ?? ''}"`);
    }

    const altMap = new Map();
    for (const altMatch of block.matchAll(/<xhtml:link\b([^>]*?)\/?>/g)) {
      const attrs = parseAttributes(altMatch[1]);
      if (attrs.get('rel') !== 'alternate') continue;
      const code = attrs.get('hreflang') || '';
      const href = attrs.get('href') || '';
      if (!code || !href) {
        errors.push(`${relPath}: malformed <xhtml:link> in ${loc}`);
        continue;
      }
      if (altMap.has(code)) {
        errors.push(`${relPath}: duplicate hreflang "${code}" in ${loc}`);
      }
      altMap.set(code, href);
      if (!href.startsWith('https://') || !expectedPagesByUrl.has(href)) {
        errors.push(`${relPath}: sitemap hreflang target missing/non-HTTPS (${code} -> ${href}) in ${loc}`);
      }
    }

    for (const reqCode of ['en', 'zh-Hans', 'x-default']) {
      if (!altMap.has(reqCode)) {
        errors.push(`${relPath}: ${loc} missing xhtml:link hreflang="${reqCode}"`);
      }
    }
    seenLocs.set(loc, altMap);
  }

  for (const [loc, altMap] of seenLocs.entries()) {
    const htmlPage = expectedPagesByUrl.get(loc);
    if (htmlPage) {
      for (const [code, href] of htmlPage.hreflangs.entries()) {
        if (altMap.get(code) !== href) {
          errors.push(`${relPath}: ${loc} hreflang "${code}" mismatch with HTML (${altMap.get(code)} vs ${href})`);
        }
      }
    }
    for (const [code, targetHref] of altMap.entries()) {
      const targetAlts = seenLocs.get(targetHref);
      if (!targetAlts) {
        errors.push(`${relPath}: ${loc} references ${code}=${targetHref} not present in sitemap`);
        continue;
      }
      if (![...targetAlts.values()].includes(loc)) {
        errors.push(`${relPath}: missing return xhtml:link from ${targetHref} back to ${loc}`);
      }
    }
  }

  for (const pageUrl of expectedPagesByUrl.keys()) {
    if (!seenLocs.has(pageUrl)) {
      errors.push(`${relPath}: indexable page missing from sitemap: ${pageUrl}`);
    }
  }
}

export function validateRobotsTxtText(text, relPath, { siteOrigin, toLocalRelativePath }, errors) {
  const groups = [];
  let current = null;
  let inUaBlock = false;
  let sitemapUrl = '';
  let agentmapUrl = '';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#', 1)[0].trim();
    if (!line) continue;
    const colon = line.indexOf(':');
    if (colon === -1) {
      errors.push(`${relPath}: invalid directive "${line}"`);
      continue;
    }
    const key = line.slice(0, colon).trim().toLowerCase();
    const val = line.slice(colon + 1).trim();

    if (key === 'user-agent') {
      if (!current || !inUaBlock) {
        current = { agents: [], allow: [], disallow: [], signals: [] };
        groups.push(current);
      }
      current.agents.push(val);
      inUaBlock = true;
      continue;
    }

    if (key === 'allow' || key === 'disallow') inUaBlock = false;

    if (key === 'sitemap') sitemapUrl = val;
    else if (key === 'agentmap') agentmapUrl = val;
    else if (!current) {
      errors.push(`${relPath}: directive "${key}" before any User-agent`);
    } else if (key === 'allow') {
      current.allow.push(val);
    } else if (key === 'disallow') {
      current.disallow.push(val);
    } else if (key === 'content-signal') {
      current.signals.push(val);
    }
  }

  const wildcard = groups.find((g) => g.agents.includes('*'));
  if (!wildcard) {
    errors.push(`${relPath}: missing User-agent: * group`);
  }
  for (const g of groups) {
    if (!g.allow.includes('/')) {
      errors.push(`${relPath}: User-agent [${g.agents.join(', ')}] missing Allow: /`);
    }
    if (g.disallow.includes('/')) {
      errors.push(`${relPath}: User-agent [${g.agents.join(', ')}] must not Disallow: /`);
    }
    if (g.signals.length === 0) {
      errors.push(`${relPath}: User-agent [${g.agents.join(', ')}] missing Content-Signal`);
    }
  }

  if (!sitemapUrl || !sitemapUrl.startsWith(siteOrigin) || !toLocalRelativePath(sitemapUrl)) {
    errors.push(`${relPath}: missing or broken Sitemap URL "${sitemapUrl}"`);
  }
  if (!agentmapUrl || !agentmapUrl.startsWith(siteOrigin) || !toLocalRelativePath(agentmapUrl)) {
    errors.push(`${relPath}: missing or broken Agentmap URL "${agentmapUrl}"`);
  }
}

export function validateLlmsTxtText(text, relPath, { siteOrigin, toLocalRelativePath }, errors) {
  const nonWs = text.replace(/\s+/g, '');
  if (nonWs.length < 50) {
    errors.push(`${relPath}: must contain at least 50 non-whitespace characters (got ${nonWs.length})`);
  }
  checkMarkdownText(text, relPath, { siteOrigin, toLocalRelativePath, minChars: 50 }, errors);
  const mdLinks = [...text.matchAll(/\[[^\]]+\]\((https:\/\/[^)\s]+)\)/g)];
  if (mdLinks.length === 0) {
    errors.push(`${relPath}: must contain at least one HTTPS Markdown link`);
  }
}

export function validateAiCatalogObject(doc, relPath, { siteUrl, toLocalRelativePath }, errors) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    errors.push(`${relPath}: must be a JSON object`);
    return;
  }
  if (doc.specVersion !== '1.0') {
    errors.push(`${relPath}: ARD specVersion must be "1.0" (got "${doc.specVersion}")`);
  }
  const host = doc.host;
  if (!host || typeof host !== 'object') {
    errors.push(`${relPath}: missing required ARD 1.0 "host" object`);
  } else {
    for (const field of ['displayName', 'identifier', 'documentationUrl', 'logoUrl']) {
      if (typeof host[field] !== 'string' || !host[field].trim()) {
        errors.push(`${relPath}: host.${field} must be a non-empty string`);
      }
    }
    for (const urlField of ['identifier', 'documentationUrl', 'logoUrl']) {
      if (typeof host[urlField] === 'string' && !host[urlField].startsWith('https://')) {
        errors.push(`${relPath}: host.${urlField} must use https://`);
      }
      if (typeof host[urlField] === 'string' && host[urlField].startsWith(siteUrl) && !toLocalRelativePath(host[urlField])) {
        errors.push(`${relPath}: host.${urlField} does not resolve locally: ${host[urlField]}`);
      }
    }
    if (!host.trustManifest || typeof host.trustManifest.identity !== 'string' || host.trustManifest.identityType !== 'https') {
      errors.push(`${relPath}: host.trustManifest must include https identity and identityType="https"`);
    }
  }

  if (!Array.isArray(doc.entries) || doc.entries.length === 0) {
    errors.push(`${relPath}: entries must be a non-empty array`);
    return;
  }

  const seenIds = new Set();
  for (let i = 0; i < doc.entries.length; i += 1) {
    const entry = doc.entries[i];
    const tag = `${relPath} entry[${i}]`;
    if (!entry || typeof entry !== 'object') {
      errors.push(`${tag}: must be an object`);
      continue;
    }
    for (const f of ['identifier', 'displayName', 'type', 'url', 'description', 'version', 'updatedAt']) {
      if (typeof entry[f] !== 'string' || !entry[f].trim()) {
        errors.push(`${tag}: missing required string field "${f}"`);
      }
    }
    if (typeof entry.identifier === 'string') {
      if (!entry.identifier.startsWith('urn:air:')) {
        errors.push(`${tag}: identifier must use "urn:air:" scheme, got "${entry.identifier}"`);
      }
      if (seenIds.has(entry.identifier)) {
        errors.push(`${tag}: duplicate identifier "${entry.identifier}"`);
      }
      seenIds.add(entry.identifier);
    }
    if (typeof entry.url === 'string') {
      if (!entry.url.startsWith('https://') || !toLocalRelativePath(entry.url)) {
        errors.push(`${tag}: entry.url must be HTTPS and resolve locally in site/: ${entry.url}`);
      }
    }
    if (typeof entry.updatedAt === 'string' && Number.isNaN(Date.parse(entry.updatedAt))) {
      errors.push(`${tag}: invalid ISO updatedAt "${entry.updatedAt}"`);
    }
    for (const arrField of ['tags', 'capabilities', 'representativeQueries']) {
      if (!Array.isArray(entry[arrField]) || entry[arrField].length === 0) {
        errors.push(`${tag}: ${arrField} must be a non-empty array`);
      }
    }
    if (!entry.trustManifest || !String(entry.trustManifest.identity || '').startsWith('https://') || entry.trustManifest.identityType !== 'https') {
      errors.push(`${tag}: missing valid trustManifest`);
    }
  }
}

/**
 * Validate every generated HTML, XML, JSON, TXT, and MD artifact in `siteDir`.
 */
export function runSeoCheck({
  siteDir = 'site',
  siteUrl: rawSiteUrl = DEFAULT_SITE_URL,
  dataPath = 'data/entries.json',
} = {}) {
  const errors = [];
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const { siteOrigin, toLocalRelativePath, fileToRouteUrl } = makeSiteResolver(siteDir, siteUrl);

  const allFiles = walkFiles(siteDir);
  if (allFiles.length === 0) {
    return { ok: false, errors: [`${siteDir}: directory missing or empty`], stats: {} };
  }

  for (const requiredRel of [
    'index.html',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'llms-full.txt',
    '.well-known/ai-catalog.json',
    'index.json',
    'count.json',
    'site.webmanifest',
  ]) {
    if (!fs.existsSync(path.join(siteDir, requiredRel))) {
      errors.push(`missing required generated artifact: ${path.join(siteDir, requiredRel)}`);
    }
  }

  const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
  const xmlFiles = allFiles.filter((f) => f.endsWith('.xml'));
  const jsonFiles = allFiles.filter((f) => f.endsWith('.json') || f.endsWith('.webmanifest'));
  const txtFiles = allFiles.filter((f) => f.endsWith('.txt'));
  const mdFiles = allFiles.filter((f) => f.endsWith('.md'));

  const indexablePages = [];
  const expectedPagesByUrl = new Map();
  const referencedMdFiles = new Set();
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const descriptionsByLang = { en: [], zh: [] };

  // 1. Validate all HTML files
  for (const filePath of htmlFiles) {
    const relPath = path.relative('.', filePath).split(path.sep).join('/');
    const siteRel = path.relative(siteDir, filePath).split(path.sep).join('/');
    const html = fs.readFileSync(filePath, 'utf8');

    const htmlAttrs = extractTags(html, 'html')[0];
    const lang = htmlAttrs?.get('lang') || '';
    const isZhRoute = siteRel.startsWith('zh/');
    const expectedLang = isZhRoute ? 'zh-Hans' : 'en';
    if (!lang || (lang !== 'en' && lang !== 'zh-Hans') || lang !== expectedLang) {
      errors.push(`${relPath}: expected <html lang="${expectedLang}">, got "${lang}"`);
    }

    const metas = extractTags(html, 'meta');
    const links = extractTags(html, 'link');
    const scripts = extractTags(html, 'script');
    const imgs = extractTags(html, 'img');
    const anchors = extractTags(html, 'a');

    const viewport = metas.find((m) => (m.get('name') || '').toLowerCase() === 'viewport')?.get('content') || '';
    if (!viewport.includes('width=device-width') || !viewport.includes('initial-scale=1')) {
      errors.push(`${relPath}: missing valid <meta name="viewport">`);
    }

    const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (!mainMatch) {
      errors.push(`${relPath}: missing <main> element`);
    } else {
      checkHeadingHierarchy(mainMatch[1], `${relPath} <main>`, errors);
    }
    checkHeadingHierarchy(html, relPath, errors);

    // Internal resource integrity for every HTML page (including 404.html)
    const internalLinksToCheck = [
      ...links.map((l) => l.get('href')),
      ...anchors.map((a) => a.get('href')),
      ...scripts.map((s) => s.get('src')),
      ...imgs.map((img) => img.get('src')),
    ].filter(Boolean);

    for (const ref of internalLinksToCheck) {
      const trimmed = ref.trim();
      const isInternal =
        trimmed.startsWith('/') ||
        trimmed.startsWith(siteOrigin) ||
        (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !trimmed.startsWith('#'));
      if (isInternal) {
        const resolved = toLocalRelativePath(trimmed);
        if (!resolved || resolved === '__INVALID_URL__') {
          errors.push(`${relPath}: broken internal link/asset reference "${trimmed}"`);
        }
      }
    }

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = decodeHtmlEntities(titleMatch?.[1] || '').replace(/\s+/g, ' ').trim();
    const description = (
      metas.find((m) => (m.get('name') || '').toLowerCase() === 'description')?.get('content') || ''
    )
      .replace(/\s+/g, ' ')
      .trim();

    const robotsMeta = metas.find((m) => (m.get('name') || '').toLowerCase() === 'robots')?.get('content') || '';
    const isNoindex = /\bnoindex\b/i.test(robotsMeta) || siteRel === '404.html';
    const mainText = mainMatch ? stripTagsAndText(mainMatch[1]) : '';

    if (siteRel === '404.html') {
      if (!/\bnoindex\b/i.test(robotsMeta)) {
        errors.push(`${relPath}: 404.html must include <meta name="robots" content="noindex">`);
      }
      if (!title || !description) {
        errors.push(`${relPath}: 404.html must declare non-empty <title> and <meta name="description">`);
      }
      if (mainText.length < 80) {
        errors.push(`${relPath}: 404.html <main> content is too thin`);
      }
      continue;
    }

    if (isNoindex) {
      errors.push(`${relPath}: unexpected noindex directive on indexable route`);
      continue;
    }

    // SSR content depth checks
    if (lang === 'en') {
      const words = mainText.split(/\s+/).filter(Boolean).length;
      if (words < 250) {
        errors.push(`${relPath}: SSR <main> English word count too low (${words} < 250)`);
      }
    } else {
      const cjkCount = (mainText.match(/[\u4e00-\u9fff]/g) || []).length;
      if (cjkCount < 300) {
        errors.push(`${relPath}: SSR <main> Chinese character count too low (${cjkCount} < 300)`);
      }
    }

    // Title length & uniqueness
    const [minTitleLen, maxTitleLen] = lang === 'zh-Hans' ? [15, 55] : [25, 65];
    if (!title || title.length < minTitleLen || title.length > maxTitleLen) {
      errors.push(`${relPath}: <title> length ${title.length} outside [${minTitleLen}, ${maxTitleLen}] ("${title}")`);
    }
    const normTitle = title.toLowerCase();
    if (seenTitles.has(normTitle)) {
      errors.push(`${relPath}: duplicate <title> matching ${seenTitles.get(normTitle)}`);
    } else {
      seenTitles.set(normTitle, relPath);
    }

    // Meta description length, uniqueness & anti-template checks
    const [minDescLen, maxDescLen] = lang === 'zh-Hans' ? [45, 130] : [100, 165];
    if (!description || description.length < minDescLen || description.length > maxDescLen) {
      errors.push(
        `${relPath}: meta description length ${description.length} outside [${minDescLen}, ${maxDescLen}]`,
      );
    }
    const normDesc = description.toLowerCase();
    if (normDesc === normTitle || (normTitle && normDesc.includes(normTitle) && normTitle.length > normDesc.length * 0.8)) {
      errors.push(`${relPath}: meta description duplicates <title>`);
    }
    if (seenDescriptions.has(normDesc)) {
      errors.push(`${relPath}: duplicate meta description matching ${seenDescriptions.get(normDesc)}`);
    } else {
      seenDescriptions.set(normDesc, relPath);
    }
    descriptionsByLang[lang === 'zh-Hans' ? 'zh' : 'en'].push({ relPath, description });

    // Canonical & Open Graph
    const canonicalLinks = links.filter((l) => (l.get('rel') || '').toLowerCase() === 'canonical');
    if (canonicalLinks.length !== 1) {
      errors.push(`${relPath}: expected exactly 1 canonical link, found ${canonicalLinks.length}`);
    }
    const expectedCanonical = fileToRouteUrl(filePath);
    const canonical = canonicalLinks[0]?.get('href') || '';
    if (canonical !== expectedCanonical || !canonical.startsWith('https://')) {
      errors.push(`${relPath}: canonical "${canonical}" must self-reference "${expectedCanonical}"`);
    }

    const ogProp = (prop) => metas.find((m) => m.get('property') === prop)?.get('content') || '';
    const metaName = (name) => metas.find((m) => (m.get('name') || '').toLowerCase() === name)?.get('content') || '';

    const ogUrl = ogProp('og:url');
    if (!ogUrl || ogUrl !== canonical) {
      errors.push(`${relPath}: og:url "${ogUrl}" must match canonical "${canonical}"`);
    }
    if (!ogProp('og:title') || !ogProp('og:description') || !ogProp('og:type') || !metaName('twitter:card')) {
      errors.push(`${relPath}: missing required Open Graph or Twitter Card tags`);
    }

    const ogImage = ogProp('og:image');
    const ogImgWidth = Number(ogProp('og:image:width'));
    const ogImgHeight = Number(ogProp('og:image:height'));
    if (!ogImage || !ogImage.startsWith(siteUrl) || !ogImage.toLowerCase().endsWith('.png')) {
      errors.push(`${relPath}: og:image must be an absolute HTTPS PNG URL on ${siteUrl}, got "${ogImage}"`);
    } else {
      const localImg = toLocalRelativePath(ogImage);
      if (!localImg) {
        errors.push(`${relPath}: og:image target missing locally: ${ogImage}`);
      } else {
        const dims = readPngDimensions(localImg);
        if (!dims) {
          errors.push(`${relPath}: og:image file is not a valid PNG: ${localImg}`);
        } else if (ogImgWidth !== dims.width || ogImgHeight !== dims.height) {
          errors.push(
            `${relPath}: og:image dimensions (${ogImgWidth}x${ogImgHeight}) mismatch actual PNG (${dims.width}x${dims.height})`,
          );
        }
      }
    }

    // Hreflang collection
    const hreflangs = new Map();
    for (const l of links) {
      if ((l.get('rel') || '').toLowerCase() !== 'alternate') continue;
      if ((l.get('type') || '').toLowerCase() === 'text/markdown') continue;
      const code = l.get('hreflang');
      const href = l.get('href');
      if (!code || !href) continue;
      if (hreflangs.has(code)) {
        errors.push(`${relPath}: duplicate hreflang "${code}"`);
      }
      hreflangs.set(code, href);
      if (!href.startsWith(siteUrl) || !toLocalRelativePath(href)) {
        errors.push(`${relPath}: hreflang "${code}" points to missing or off-origin URL "${href}"`);
      }
    }
    for (const reqCode of ['en', 'zh-Hans', 'x-default']) {
      if (!hreflangs.has(reqCode)) {
        errors.push(`${relPath}: missing <link rel="alternate" hreflang="${reqCode}">`);
      }
    }
    const selfCode = lang === 'zh-Hans' ? 'zh-Hans' : 'en';
    if (hreflangs.get(selfCode) !== canonical) {
      errors.push(`${relPath}: hreflang "${selfCode}" (${hreflangs.get(selfCode)}) must match canonical (${canonical})`);
    }
    if (hreflangs.get('x-default') !== hreflangs.get('en')) {
      errors.push(`${relPath}: hreflang "x-default" must match "en"`);
    }

    // Agentic head links
    const aiCatalogHref = links.find((l) => (l.get('rel') || '').toLowerCase() === 'ai-catalog')?.get('href') || '';
    if (!aiCatalogHref || toLocalRelativePath(aiCatalogHref) !== path.join(siteDir, '.well-known', 'ai-catalog.json')) {
      errors.push(`${relPath}: missing or invalid <link rel="ai-catalog">`);
    }
    const mdAltHref =
      links.find(
        (l) =>
          (l.get('rel') || '').toLowerCase() === 'alternate' &&
          (l.get('type') || '').toLowerCase() === 'text/markdown',
      )?.get('href') || '';
    const resolvedMd = toLocalRelativePath(mdAltHref);
    if (!resolvedMd || !resolvedMd.endsWith('.md')) {
      errors.push(`${relPath}: missing or broken Markdown alternate link "${mdAltHref}"`);
    } else {
      referencedMdFiles.add(resolvedMd);
    }

    // JSON-LD validation
    const ldBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    if (ldBlocks.length === 0) {
      errors.push(`${relPath}: missing JSON-LD <script type="application/ld+json">`);
    }
    for (let idx = 0; idx < ldBlocks.length; idx += 1) {
      let parsedLd;
      try {
        parsedLd = JSON.parse(ldBlocks[idx][1]);
      } catch (err) {
        errors.push(`${relPath}: invalid JSON-LD block[${idx}]: ${err.message}`);
        continue;
      }
      const ctx = parsedLd?.['@context'];
      if (ctx !== 'https://schema.org' && ctx !== 'https://schema.org/') {
        errors.push(`${relPath}: JSON-LD block[${idx}] missing valid @context "https://schema.org"`);
      }
      validateJsonLdValue(parsedLd, `${relPath} JSON-LD[${idx}]`, errors);
    }

    const pageRecord = { filePath, relPath, url: canonical, hreflangs, anchors };
    indexablePages.push(pageRecord);
    expectedPagesByUrl.set(canonical, pageRecord);
  }

  // 2. Pairwise description similarity check (anti-templating)
  for (const [langKey, list] of Object.entries(descriptionsByLang)) {
    const isZh = langKey === 'zh';
    for (let i = 0; i < list.length; i += 1) {
      const a = list[i];
      const tokA = tokenizeDescription(a.description, isZh);
      for (let j = i + 1; j < list.length; j += 1) {
        const b = list[j];
        const tokB = tokenizeDescription(b.description, isZh);
        const sim = jaccardSimilarity(tokA, tokB);
        const prefixRatio = sharedPrefixRatio(a.description.toLowerCase(), b.description.toLowerCase());
        if (sim >= 0.65 || prefixRatio >= 0.65) {
          errors.push(
            `templated meta descriptions (${langKey}) between ${a.relPath} and ${b.relPath} (similarity=${sim.toFixed(2)}, prefix=${prefixRatio.toFixed(2)})`,
          );
        }
      }
    }
  }

  // 3. Closed-loop bidirectional hreflang verification
  for (const page of indexablePages) {
    for (const [code, targetUrl] of page.hreflangs.entries()) {
      const targetPage = expectedPagesByUrl.get(targetUrl);
      if (!targetPage) {
        errors.push(`${page.relPath}: hreflang "${code}" target is not an indexable page: ${targetUrl}`);
        continue;
      }
      for (const [expectedCode, expectedHref] of page.hreflangs.entries()) {
        if (targetPage.hreflangs.get(expectedCode) !== expectedHref) {
          errors.push(
            `${page.relPath}: hreflang mesh mismatch on ${targetPage.relPath} for "${expectedCode}" (${targetPage.hreflangs.get(expectedCode)} vs ${expectedHref})`,
          );
        }
      }
    }
  }

  // 4. Orphan-page detection across all indexable HTML <a href> links
  const inboundCounts = new Map(indexablePages.map((p) => [p.url, 0]));
  for (const page of indexablePages) {
    const seenTargetsFromPage = new Set();
    for (const a of page.anchors) {
      const href = a.get('href');
      if (!href) continue;
      const resolved = toLocalRelativePath(href);
      if (!resolved || !resolved.endsWith('.html')) continue;
      const targetUrl = fileToRouteUrl(resolved);
      if (targetUrl !== page.url && inboundCounts.has(targetUrl) && !seenTargetsFromPage.has(targetUrl)) {
        seenTargetsFromPage.add(targetUrl);
        inboundCounts.set(targetUrl, inboundCounts.get(targetUrl) + 1);
      }
    }
  }
  for (const [pageUrl, count] of inboundCounts.entries()) {
    if (count === 0) {
      errors.push(`orphan page (0 inbound internal links): ${pageUrl}`);
    }
  }

  // 5. XML checks (sitemap.xml)
  for (const filePath of xmlFiles) {
    const relPath = path.relative('.', filePath).split(path.sep).join('/');
    const xml = fs.readFileSync(filePath, 'utf8');
    if (path.basename(filePath) === 'sitemap.xml') {
      validateSitemapXmlText(xml, relPath, { siteOrigin, toLocalRelativePath, expectedPagesByUrl }, errors);
    } else if (!xml.trim()) {
      errors.push(`${relPath}: XML file is empty`);
    }
  }

  // 6. TXT checks (robots.txt, llms.txt, llms-full.txt)
  for (const filePath of txtFiles) {
    const relPath = path.relative('.', filePath).split(path.sep).join('/');
    const text = fs.readFileSync(filePath, 'utf8');
    const base = path.basename(filePath);
    if (base === 'robots.txt') {
      validateRobotsTxtText(text, relPath, { siteOrigin, toLocalRelativePath }, errors);
    } else if (base === 'llms.txt') {
      validateLlmsTxtText(text, relPath, { siteOrigin, toLocalRelativePath }, errors);
    } else if (base === 'llms-full.txt') {
      checkMarkdownText(text, relPath, { siteOrigin, toLocalRelativePath, minChars: 500 }, errors);
    } else if (!text.trim()) {
      errors.push(`${relPath}: TXT file is empty`);
    }
  }

  // 7. JSON & WebManifest checks
  let indexJsonDoc = null;
  let countJsonDoc = null;
  for (const filePath of jsonFiles) {
    const relPath = path.relative('.', filePath).split(path.sep).join('/');
    const siteRel = path.relative(siteDir, filePath).split(path.sep).join('/');
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      errors.push(`${relPath}: invalid JSON (${err.message})`);
      continue;
    }

    if (siteRel === '.well-known/ai-catalog.json') {
      validateAiCatalogObject(doc, relPath, { siteUrl, toLocalRelativePath }, errors);
    } else if (siteRel === 'index.json') {
      indexJsonDoc = doc;
      if (doc.format !== 1 || doc.schemaVersion !== 1 || !Array.isArray(doc.entries) || !Array.isArray(doc.nshms)) {
        errors.push(`${relPath}: missing format/schemaVersion/entries/nshms`);
      } else if (
        doc.counts?.total !== doc.entries.length ||
        doc.counts?.installableNshm !== doc.nshms.length
      ) {
        errors.push(`${relPath}: counts mismatch (${JSON.stringify(doc.counts)})`);
      }
    } else if (siteRel === 'count.json') {
      countJsonDoc = doc;
      if (doc.schemaVersion !== 1 || doc.label !== 'nshm' || !/^\d+$/.test(String(doc.message || ''))) {
        errors.push(`${relPath}: invalid Shields.io count.json schema`);
      }
    } else if (siteRel === 'site.webmanifest') {
      if (!doc.name || !doc.short_name || !doc.start_url || !Array.isArray(doc.icons) || doc.icons.length === 0) {
        errors.push(`${relPath}: missing required webmanifest fields`);
      } else {
        for (const icon of doc.icons) {
          if (!icon?.src || !toLocalRelativePath(icon.src)) {
            errors.push(`${relPath}: icon src missing locally: ${icon?.src}`);
          }
        }
      }
    }
  }

  if (indexJsonDoc && countJsonDoc && String(indexJsonDoc.counts?.installableNshm) !== countJsonDoc.message) {
    errors.push(`count.json message "${countJsonDoc.message}" != index.json installableNshm (${indexJsonDoc.counts?.installableNshm})`);
  }
  if (indexJsonDoc && dataPath && fs.existsSync(dataPath)) {
    try {
      const entriesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const expectedTotal = entriesData.entries?.length;
      const expectedNshm = entriesData.entries?.filter((e) => e.installable).length;
      if (indexJsonDoc.counts?.total !== expectedTotal || indexJsonDoc.counts?.installableNshm !== expectedNshm) {
        errors.push(`site/index.json counts out of parity with ${dataPath}`);
      }
    } catch (err) {
      errors.push(`failed to parse ${dataPath}: ${err.message}`);
    }
  }

  // 8. Markdown checks & parity
  for (const filePath of mdFiles) {
    const relPath = path.relative('.', filePath).split(path.sep).join('/');
    const text = fs.readFileSync(filePath, 'utf8');
    checkMarkdownText(text, relPath, { siteOrigin, toLocalRelativePath, minChars: 100 }, errors);
    if (!referencedMdFiles.has(filePath)) {
      errors.push(`${relPath}: Markdown file is not linked as text/markdown alternate from any indexable HTML page`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: {
      totalFiles: allFiles.length,
      html: htmlFiles.length,
      indexableHtml: indexablePages.length,
      xml: xmlFiles.length,
      json: jsonFiles.length,
      txt: txtFiles.length,
      md: mdFiles.length,
      minInboundLinks: inboundCounts.size > 0 ? Math.min(...inboundCounts.values()) : 0,
    },
  };
}

function main() {
  const result = runSeoCheck();
  if (!result.ok) {
    console.error(`seo-check: FAILED with ${result.errors.length} error(s):`);
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
  const s = result.stats;
  console.log(
    `seo-check: OK (${s.totalFiles} files checked: ${s.html} HTML [${s.indexableHtml} indexable, min inbound links=${s.minInboundLinks}], ${s.xml} XML, ${s.json} JSON/webmanifest, ${s.txt} TXT, ${s.md} MD)`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
