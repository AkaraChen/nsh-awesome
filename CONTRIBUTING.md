# Contributing to Awesome NSH · 贡献指南

Thank you for helping grow the [Native Shell (NSH)](https://nsh.dev) ecosystem!

## Single Source of Truth & Astro Architecture

- **[`data/entries.json`](data/entries.json)** is the canonical source of truth for all curated entries, categories, install commands, and platform targets. It feeds the Astro `entries` Content Collection (`src/content.config.ts`), `README.md`, `README.zh.md`, `dist/index.json`, `dist/count.json`, `dist/badge.svg`, and verification scripts (`scripts/discover.mjs`, `scripts/verify-install.mjs`).
- **[`src/content/`](src/content/)** stores bilingual Markdown Content Collections with strict Zod validation:
  - `src/content/pages/{en,zh}/*.md`: Home copy/FAQs, 4 section hubs (`nshm`, `framework`, `templates`, `guides`), `/discovery/`, and `/about/`.
  - `src/content/modules/{en,zh}/<id>.md`: Deep-dive bilingual documentation for installable `nshm` modules. **Adding a new `nshm` only requires editing `data/entries.json`** — any installable `nshm` without a dedicated `.md` file automatically renders with deterministic fallback metadata and facts.
- **Native `astro:i18n`** (`astro.config.mjs`, `src/i18n/ui.ts`): Builds 40 bilingual static HTML pages (`/` + `/zh/` and sub-routes with `trailingSlash: 'always'`) plus `404.html`, 40 `.md` alternates, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, and `/.well-known/ai-catalog.json` into `dist/` (gitignored).

> [!NOTE]
> `README.md` and `README.zh.md` are still generated from [`data/entries.json`](data/entries.json) via `node scripts/generate.mjs`. **Do not edit the README files by hand** — CI checks byte-for-byte parity via `node scripts/generate.mjs --check`.

> [!NOTE]
> Raster brand icons and OG social images (`public/favicon.ico`, `public/apple-touch-icon.png`, `public/og-image.png`, `public/og-image-zh.png`) are generated on demand by running `node scripts/build-seo-assets.mjs` manually. That asset script is intentionally excluded from `scripts/generate.mjs`, `npm run build`, and CI.

> [!NOTE]
> Production deployments on Vercel (`vercel.json`: `"framework": "astro"`, `"buildCommand": "npm run build"`, `"outputDirectory": "dist"`) and GitHub Pages (`.github/workflows/pages.yml`) build `dist/` from committed sources on every push to `main` with locked `package-lock.json` dependencies.

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

1. Edit [`data/entries.json`](data/entries.json) (and optionally add or update bilingual Markdown under `src/content/modules/{en,zh}/<id>.md` or `src/content/pages/{en,zh}/*.md`).
2. Regenerate READMEs, build Astro `dist/`, and run local checks:
   ```sh
   npm ci
   node scripts/generate.mjs
   npm run build
   node scripts/generate.mjs --check
   node scripts/lint.mjs
   node scripts/seo-check.mjs
   npm test
   node scripts/verify-install.mjs
   node scripts/check-links.mjs
   ```
3. Preview locally with `npm run dev` or `npm run preview`, then open a pull request against `main`.
