# Contributing to Awesome NSH · 贡献指南

Thank you for helping grow the [Native Shell (NSH)](https://nsh.dev) ecosystem!

## Single Source of Truth

All lists (`README.md`, `README.zh.md`), the static website (`site/`), and the machine-readable catalog (`site/index.json`, `site/count.json`) are generated from [`data/entries.json`](data/entries.json). **Do not edit the generated files by hand** — CI checks byte-for-byte consistency via `node scripts/generate.mjs --check`.

## Requirements for Installable `nshm` Submissions

1. **Must install cleanly via `nsh add`** on the current stable `nsh` release (`nsh 0.7.1`) in a fresh scratch app (using `crates.io`, `github:owner/repo`, or a Git URL).
2. **Must satisfy `nsh` manifest rules** (a Rust crate with `#[native_module("...")]`, a TSX package with `nsh.json` `"exports"`, a hybrid of both, or a platform nshm declaring `"platform"`). See [`docs/DISCOVERY.md`](docs/DISCOVERY.md) for details.
3. **Must not be an ordinary library crate, CLI tool, or end-user app** (`publish = false` app roots belong under **Examples & Templates**, and ordinary Cargo crates without `#[native_module]` are not `nshm`).
4. **Formatting rules enforced by `node scripts/lint.mjs`**:
   - Provide both English (`description.en`) and Chinese (`description.zh`) one-line descriptions stating what the package actually does.
   - English descriptions must start with an uppercase letter or digit and end with a period (`.`).
   - Chinese descriptions must end with a Chinese full stop (`。`).
   - Include accurate `platforms`, `license` (SPDX ID), `updatedAt` (`YYYY-MM-DD`), and working URLs (`sourceUrl`, optional `cratesUrl` / `homepage`).

## Workflow

1. Edit [`data/entries.json`](data/entries.json).
2. Regenerate all outputs and run local checks:
   ```sh
   node scripts/generate.mjs
   node scripts/lint.mjs
   node --test scripts/verify.test.mjs
   node scripts/verify-install.mjs
   node scripts/check-links.mjs
   ```
3. Open a pull request against `main`.
