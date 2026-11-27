#!/usr/bin/env node
/**
 * Lint `data/entries.json`, `src/content/`, `README.md`, `README.zh.md`,
 * `dist/index.json`, `dist/count.json`, and `dist/.well-known/ai-catalog.json`:
 * - Schema & field completeness in `data/entries.json`
 * - Content Collection frontmatter integrity in `src/content/{pages,modules}`
 * - Single H1, sequential heading hierarchy (no skipped heading levels)
 * - Every TOC `#anchor` matches an actual heading in the README
 * - Entry formatting `- [Name](url) — Description.` (EN uppercase start + `.`, ZH ends with `。`)
 * - Duplicate entry URLs / IDs / names / SEO titles / meta descriptions rejected
 * - Exact entry-count parity across JSON, READMEs, index.json, and count.json
 *
 * Usage:
 *   node scripts/lint.mjs [--dir dist]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
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

const REQUIRED_PAGE_SLUGS = ['home', 'nshm', 'framework', 'templates', 'guides', 'discovery', 'about'];

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

function normalizeYamlDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '').trim();
}

function parseFrontmatterFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`missing YAML frontmatter in ${filePath}`);
  }
  const frontmatter = YAML.parse(match[1]);
  const body = match[2].trim();
  return { frontmatter, body };
}

export function validateContentCollections(entriesData, contentDir = 'src/content') {
  const errors = [];
  if (!fs.existsSync(contentDir)) {
    return [`${contentDir}: Content Collections directory is missing`];
  }

  const seenTitles = new Map();
  const seenDescs = new Map();

  function checkTitleAndDesc(fm, label) {
    const title = String(fm?.title || '').trim();
    const desc = String(fm?.description || '').trim();
    if (!title) errors.push(`${label}: frontmatter title is empty`);
    if (!desc) errors.push(`${label}: frontmatter description is empty`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizeYamlDate(fm?.updatedAt))) {
      errors.push(`${label}: invalid updatedAt "${fm?.updatedAt}"`);
    }
    if (title) {
      const key = title.toLowerCase();
      if (seenTitles.has(key)) {
        errors.push(`${label}: duplicate title (matches ${seenTitles.get(key)})`);
      } else {
        seenTitles.set(key, label);
      }
    }
    if (desc) {
      const key = desc.toLowerCase();
      if (seenDescs.has(key)) {
        errors.push(`${label}: duplicate description (matches ${seenDescs.get(key)})`);
      } else {
        seenDescs.set(key, label);
      }
    }
  }

  for (const lang of ['en', 'zh']) {
    for (const slug of REQUIRED_PAGE_SLUGS) {
      const filePath = path.join(contentDir, 'pages', lang, `${slug}.md`);
      const label = `pages/${lang}/${slug}.md`;
      if (!fs.existsSync(filePath)) {
        errors.push(`${label}: missing required page content file`);
        continue;
      }
      try {
        const { frontmatter, body } = parseFrontmatterFile(filePath);
        if (frontmatter?.lang !== lang) {
          errors.push(`${label}: frontmatter lang "${frontmatter?.lang}" != "${lang}"`);
        }
        if (frontmatter?.pageSlug !== slug) {
          errors.push(`${label}: frontmatter pageSlug "${frontmatter?.pageSlug}" != "${slug}"`);
        }
        if (!body) {
          errors.push(`${label}: Markdown body is empty`);
        }
        checkTitleAndDesc(frontmatter, label);
      } catch (err) {
        errors.push(`${label}: ${err.message}`);
      }
    }
  }

  const installableIds = new Set(
    (entriesData?.entries || []).filter((e) => e.installable).map((e) => e.id),
  );
  for (const lang of ['en', 'zh']) {
    const modDir = path.join(contentDir, 'modules', lang);
    if (!fs.existsSync(modDir)) continue;
    for (const fileName of fs.readdirSync(modDir).sort()) {
      if (!fileName.endsWith('.md')) continue;
      const slugId = fileName.slice(0, -'.md'.length);
      const filePath = path.join(modDir, fileName);
      const label = `modules/${lang}/${fileName}`;
      if (!installableIds.has(slugId)) {
        errors.push(`${label}: orphan module entry "${slugId}" not in installable entries`);
      }
      try {
        const { frontmatter, body } = parseFrontmatterFile(filePath);
        if (frontmatter?.lang !== lang) {
          errors.push(`${label}: frontmatter lang "${frontmatter?.lang}" != "${lang}"`);
        }
        if (frontmatter?.entryId !== slugId) {
          errors.push(`${label}: frontmatter entryId "${frontmatter?.entryId}" != "${slugId}"`);
        }
        if (!body) {
          errors.push(`${label}: Markdown body is empty`);
        }
        checkTitleAndDesc(frontmatter, label);
      } catch (err) {
        errors.push(`${label}: ${err.message}`);
      }
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

function resolveSiteDirFromArgv(argv) {
  const dirIdx = argv.indexOf('--dir');
  if (dirIdx >= 0 && argv[dirIdx + 1]) return argv[dirIdx + 1];
  const positional = argv.find((a) => !a.startsWith('-'));
  return positional || 'dist';
}

function main() {
  const siteDir = resolveSiteDirFromArgv(process.argv.slice(2));
  const data = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  const errors = [...validateEntriesData(data), ...validateContentCollections(data, 'src/content')];

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

  const installableCount = data.entries.filter((e) => e.installable).length;
  const indexPath = path.join(siteDir, 'index.json');
  const countPath = path.join(siteDir, 'count.json');
  const catalogPath = path.join(siteDir, '.well-known', 'ai-catalog.json');

  for (const reqFile of [indexPath, countPath, catalogPath]) {
    if (!fs.existsSync(reqFile)) {
      errors.push(`missing built output ${reqFile} (run npm run build first)`);
    }
  }

  if (fs.existsSync(indexPath) && fs.existsSync(countPath) && fs.existsSync(catalogPath)) {
    const indexJson = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const countJson = JSON.parse(fs.readFileSync(countPath, 'utf8'));
    const aiCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

    if (indexJson.counts?.installableNshm !== installableCount || indexJson.nshms?.length !== installableCount) {
      errors.push(`${indexPath} installable count mismatch (expected ${installableCount})`);
    }
    if (indexJson.entries?.length !== data.entries.length) {
      errors.push(`${indexPath} entries count mismatch (${indexJson.entries?.length} vs ${data.entries.length})`);
    }
    if (countJson.schemaVersion !== 1 || countJson.message !== String(installableCount)) {
      errors.push(`${countPath} mismatch (expected message "${installableCount}", got "${countJson.message}")`);
    }
    if (aiCatalog.specVersion !== '1.0' || !Array.isArray(aiCatalog.entries) || aiCatalog.entries.length === 0) {
      errors.push(`${catalogPath} invalid ARD 1.0 payload`);
    }
  }

  if (errors.length > 0) {
    console.error(`Lint failed with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `lint: OK (${data.entries.length} total entries, ${installableCount} installable nshms; README.md, README.zh.md, src/content, ${siteDir}/{index.json,count.json,ai-catalog.json} in sync)`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
