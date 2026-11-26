#!/usr/bin/env node
/**
 * Lint `data/entries.json`, `README.md`, `README.zh.md`, `site/index.json`, and `site/count.json`:
 * - Schema & field completeness in `data/entries.json`
 * - Single H1, sequential heading hierarchy (no skipped heading levels)
 * - Every TOC `#anchor` matches an actual heading in the README
 * - Entry formatting `- [Name](url) — Description.` (EN uppercase start + `.`, ZH ends with `。`)
 * - Duplicate entry URLs / IDs / names rejected
 * - Exact entry-count parity across JSON, READMEs, index.json, and count.json
 *
 * Usage:
 *   node scripts/lint.mjs
 */
import fs from 'node:fs';
import { githubHeadingAnchor } from './generate.mjs';

const REQUIRED_FIELDS = [
  'id',
  'name',
  'section',
  'category',
  'kind',
  'sourceType',
  'sourceUrl',
  'platforms',
  'license',
  'updatedAt',
];

export function validateEntriesData(doc) {
  const errors = [];
  if (!doc || !Array.isArray(doc.entries) || !Array.isArray(doc.sections) || !Array.isArray(doc.categories)) {
    return ['data/entries.json must contain sections, categories, and entries arrays'];
  }

  const sectionIds = new Set(doc.sections.map((s) => s.id));
  const categoryMap = new Map(doc.categories.map((c) => [c.id, c]));
  const seenIds = new Set();
  const seenUrls = new Set();

  for (const entry of doc.entries) {
    const label = entry.id || entry.name || '<unknown>';
    for (const field of REQUIRED_FIELDS) {
      if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
        errors.push(`entry ${label}: missing required field "${field}"`);
      }
    }
    if (seenIds.has(entry.id)) {
      errors.push(`duplicate entry id: ${entry.id}`);
    }
    seenIds.add(entry.id);

    const normUrl = String(entry.sourceUrl || '').replace(/\/+$/, '').toLowerCase();
    if (seenUrls.has(normUrl)) {
      errors.push(`duplicate entry sourceUrl: ${entry.sourceUrl}`);
    }
    seenUrls.add(normUrl);

    if (!sectionIds.has(entry.section)) {
      errors.push(`entry ${label}: unknown section "${entry.section}"`);
    }
    const cat = categoryMap.get(entry.category);
    if (!cat || cat.section !== entry.section) {
      errors.push(`entry ${label}: category "${entry.category}" does not belong to section "${entry.section}"`);
    }

    if (typeof entry.installable !== 'boolean') {
      errors.push(`entry ${label}: installable must be boolean`);
    }
    if (entry.section === 'nshm') {
      if (!entry.installable) errors.push(`entry ${label}: nshm section entries must have installable: true`);
      if (!String(entry.installCommand || '').startsWith('nsh add ')) {
        errors.push(`entry ${label}: installable nshm must have installCommand starting with "nsh add "`);
      }
    } else {
      if (entry.installable) errors.push(`entry ${label}: non-nshm entry cannot have installable: true`);
      if (entry.installCommand !== null) errors.push(`entry ${label}: non-nshm entry must have installCommand: null`);
    }

    if (!Array.isArray(entry.platforms) || entry.platforms.length === 0) {
      errors.push(`entry ${label}: platforms must be a non-empty array`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(entry.updatedAt || ''))) {
      errors.push(`entry ${label}: updatedAt "${entry.updatedAt}" must match YYYY-MM-DD`);
    }

    const enDesc = entry.description?.en || '';
    const zhDesc = entry.description?.zh || '';
    if (!/^[A-Z0-9]/.test(enDesc) || !enDesc.endsWith('.')) {
      errors.push(`entry ${label}: description.en must start with uppercase/digit and end with "."`);
    }
    if (!zhDesc || !zhDesc.endsWith('。')) {
      errors.push(`entry ${label}: description.zh must be non-empty and end with "。"`);
    }
  }

  return errors;
}

export function lintReadmeText(text, lang, fileLabel = 'README.md') {
  const errors = [];
  const lines = text.split(/\r?\n/);

  let h1Count = 0;
  let prevLevel = 0;
  const headingAnchors = new Set();
  const tocLinks = [];
  const entryUrls = new Set();
  const entryNames = new Set();
  let inToc = false;
  let inCodeFence = false;
  let entryCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const title = h[2].trim();
      if (level === 1) h1Count++;
      if (prevLevel > 0 && level > prevLevel + 1) {
        errors.push(`${fileLabel}:${lineNo}: skipped heading level H${prevLevel} -> H${level} ("${title}")`);
      }
      prevLevel = level;
      headingAnchors.add(githubHeadingAnchor(title));
      inToc = level === 2 && (title === 'Contents' || title === '目录');
      continue;
    }

    if (inToc) {
      const tocMatch = line.match(/^\s*-\s+\[.+?\]\(#([^)]+)\)$/);
      if (tocMatch) {
        tocLinks.push({ lineNo, anchor: tocMatch[1] });
      }
      continue;
    }

    // Top-level bullet outside Contents/Discovery/Contributing sections that links a curated entry
    if (line.startsWith('- [')) {
      const m = line.match(/^- \[(.+?)\]\((https?:\/\/[^)]+)\) — (.+)$/);
      if (!m) {
        errors.push(`${fileLabel}:${lineNo}: entry must match "- [Name](url) — Description." (got: ${line})`);
        continue;
      }
      const [, name, url, desc] = m;
      entryCount++;
      const normUrl = url.replace(/\/+$/, '').toLowerCase();
      if (entryUrls.has(normUrl)) {
        errors.push(`${fileLabel}:${lineNo}: duplicate entry URL ${url}`);
      }
      entryUrls.add(normUrl);

      if (entryNames.has(name.toLowerCase())) {
        errors.push(`${fileLabel}:${lineNo}: duplicate entry name "${name}"`);
      }
      entryNames.add(name.toLowerCase());

      if (lang === 'en') {
        if (!/^[A-Z0-9]/.test(desc) || !desc.endsWith('.')) {
          errors.push(`${fileLabel}:${lineNo}: English description for "${name}" must start uppercase/digit and end with "."`);
        }
      } else if (lang === 'zh') {
        if (!desc.endsWith('。')) {
          errors.push(`${fileLabel}:${lineNo}: Chinese description for "${name}" must end with "。"`);
        }
      }
    }
  }

  if (h1Count !== 1) {
    errors.push(`${fileLabel}: expected exactly 1 H1 heading, found ${h1Count}`);
  }
  for (const link of tocLinks) {
    if (!headingAnchors.has(link.anchor)) {
      errors.push(`${fileLabel}:${link.lineNo}: broken TOC anchor #${link.anchor}`);
    }
  }

  return { errors, entryCount };
}

function main() {
  const data = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  const errors = [...validateEntriesData(data)];

  const enReadme = fs.readFileSync('README.md', 'utf8');
  const zhReadme = fs.readFileSync('README.zh.md', 'utf8');
  const enLint = lintReadmeText(enReadme, 'en', 'README.md');
  const zhLint = lintReadmeText(zhReadme, 'zh', 'README.zh.md');
  errors.push(...enLint.errors, ...zhLint.errors);

  if (enLint.entryCount !== data.entries.length) {
    errors.push(`README.md has ${enLint.entryCount} entries, expected ${data.entries.length}`);
  }
  if (zhLint.entryCount !== data.entries.length) {
    errors.push(`README.zh.md has ${zhLint.entryCount} entries, expected ${data.entries.length}`);
  }

  const indexJson = JSON.parse(fs.readFileSync('site/index.json', 'utf8'));
  const countJson = JSON.parse(fs.readFileSync('site/count.json', 'utf8'));
  const installableCount = data.entries.filter((e) => e.installable).length;

  if (indexJson.counts?.installableNshm !== installableCount || indexJson.nshms?.length !== installableCount) {
    errors.push(`site/index.json installable count mismatch (expected ${installableCount})`);
  }
  if (indexJson.entries?.length !== data.entries.length) {
    errors.push(`site/index.json entries count mismatch (${indexJson.entries?.length} vs ${data.entries.length})`);
  }
  if (countJson.schemaVersion !== 1 || countJson.message !== String(installableCount)) {
    errors.push(`site/count.json mismatch (expected message "${installableCount}", got "${countJson.message}")`);
  }

  if (errors.length > 0) {
    console.error(`Lint failed with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `lint: OK (${data.entries.length} total entries, ${installableCount} installable nshms; README.md, README.zh.md, index.json, count.json in sync)`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
