import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateNshmManifest, extractTarGzTexts, satisfiesSemver } from './lib/manifest-check.mjs';
import { lintReadmeText, validateEntriesData } from './lint.mjs';

test('evaluateNshmManifest recognizes Rust, TSX, Hybrid, and Platform nshm', () => {
  const rustNshm = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "demo-rust"\nversion = "0.2.0"\n[dependencies]\nnsh-core = "0.7"`,
    libRsText: `use nsh_core::prelude::*;\n#[native_module("demo-rust")]\nfn native(_r: &mut Registry) {}`,
  });
  assert.equal(rustNshm.kind, 'rust-nshm');
  assert.equal(rustNshm.specifier, 'demo-rust');
  assert.equal(rustNshm.cleanCompatible, true);

  const tsxNshm = evaluateNshmManifest({
    nshJsonText: JSON.stringify({
      name: 'demo-tsx',
      version: '0.1.0',
      nsh: '>=0.6',
      exports: { 'demo-tsx': 'src/index.ts' },
    }),
  });
  assert.equal(tsxNshm.kind, 'tsx-nshm');
  assert.equal(tsxNshm.cleanCompatible, true);

  const hybridNshm = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "demo-hybrid"\nversion = "0.1.0"\n[dependencies]\nnsh-core = "0.7.1"`,
    nshJsonText: JSON.stringify({ nsh: '>=0.7', exports: { 'demo-hybrid': 'tsx/index.ts' } }),
    libRsText: `#[native_module("demo-hybrid/native")]\nfn native() {}`,
  });
  assert.equal(hybridNshm.kind, 'hybrid-nshm');
  assert.equal(hybridNshm.cleanCompatible, true);

  const platformNshm = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "demo-plat"\nversion = "0.1.1"`,
    nshJsonText: JSON.stringify({ name: 'demo-plat', version: '0.1.1', platform: 'harmonyos' }),
  });
  assert.equal(platformNshm.kind, 'platform-nshm');
  assert.equal(platformNshm.platform, 'harmonyos');
  assert.equal(platformNshm.cleanCompatible, true);
});

test('evaluateNshmManifest catches 0.6 vs 0.7 mismatch and normalized Cargo quirk', () => {
  const gitPinned06 = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "old-nshm"\nversion = "0.1.0"\n[dependencies]\nnsh-core = "0.6"`,
    libRsText: `#[native_module("old-nshm")]\nfn native() {}`,
  });
  assert.equal(gitPinned06.cliWouldAdd, false);
  assert.equal(gitPinned06.cleanCompatible, false);

  const normalized06 = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "norm-nshm"\nversion = "0.1.0"\n[dependencies.nsh-core]\nversion = "0.6.0"`,
    libRsText: `#[native_module("norm-nshm")]\nfn native() {}`,
  });
  assert.equal(normalized06.cliWouldAdd, true);
  assert.equal(normalized06.coreCompatible, false);
  assert.equal(normalized06.cleanCompatible, false);
});

test('evaluateNshmManifest rejects framework crates without #[native_module]', () => {
  const fw = evaluateNshmManifest({
    cargoTomlText: `[package]\nname = "nsh-core"\nversion = "0.7.1"`,
    libRsText: `pub fn hello() {}`,
  });
  assert.equal(fw.kind, 'not-nshm');
  assert.equal(fw.cliWouldAdd, false);
});

test('satisfiesSemver matches Cargo/nsh constraints accurately', () => {
  assert.equal(satisfiesSemver('0.7.1', '0.7'), true);
  assert.equal(satisfiesSemver('0.7.1', '>=0.7'), true);
  assert.equal(satisfiesSemver('0.7.1', '^0.7.1'), true);
  assert.equal(satisfiesSemver('0.7.1', '0.6'), false);
  assert.equal(satisfiesSemver('0.7.1', '=0.7.0'), false);
  assert.equal(satisfiesSemver('0.7.1', '>=0.6, <0.8'), true);
});

test('lintReadmeText flags skipped headings, bad entry format, and duplicate URLs', () => {
  const bad = [
    '# Title',
    '',
    '## Section',
    '',
    '#### Skipped Heading',
    '',
    '- [one](https://example.com/a) — lowercase start without period',
    '- [two](https://example.com/a) — Duplicate URL.',
    '',
  ].join('\n');
  const res = lintReadmeText(bad, 'en', 'test.md');
  assert.ok(res.errors.some((e) => e.includes('skipped heading level')));
  assert.ok(res.errors.some((e) => e.includes('lowercase') || e.includes('must start uppercase')));
  assert.ok(res.errors.some((e) => e.includes('duplicate entry URL')));
});

test('data/entries.json validates cleanly and extractTarGzTexts is exported', () => {
  assert.equal(typeof extractTarGzTexts, 'function');
  const doc = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  assert.deepEqual(validateEntriesData(doc), []);
});
