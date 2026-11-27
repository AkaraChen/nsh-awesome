#!/usr/bin/env node
/**
 * Generate and verify `README.md` and `README.zh.md` from `data/entries.json`.
 *
 * The static website (`dist/`) is built separately by Astro (`npm run build`).
 * Note: `scripts/build-seo-assets.mjs` (raster favicon/OG image generator) is a
 * manual-only script and MUST NOT be invoked here or in fast CI loops.
 *
 * Usage:
 *   node scripts/generate.mjs          # write README.md and README.zh.md
 *   node scripts/generate.mjs --check  # fail if README files are out of sync
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubHeadingAnchor, buildReadme } from './lib/readme-feed.mjs';

export { githubHeadingAnchor };

const CHECK = process.argv.includes('--check');
const DATA_PATH = 'data/entries.json';

export function generateAll(data) {
  return new Map([
    ['README.md', buildReadme(data, 'en')],
    ['README.zh.md', buildReadme(data, 'zh')],
  ]);
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const outputs = generateAll(data);

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
      console.error('Generated README files are out of sync with data/entries.json:');
      for (const d of drifted) console.error(`  - ${d}`);
      console.error('Run `node scripts/generate.mjs` and commit the updated files.');
      process.exit(1);
    }
    console.log(`check: all ${outputs.size} README files match data/entries.json`);
    return;
  }

  for (const [relPath, content] of outputs.entries()) {
    fs.mkdirSync(path.dirname(relPath), { recursive: true });
    fs.writeFileSync(relPath, content);
    console.log(`wrote ${relPath}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
