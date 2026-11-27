# Contributing to Awesome NSH · 贡献指南

Thank you for helping grow the [Native Shell (NSH)](https://nsh.dev) ecosystem!

## Single Source of Truth

All lists (`README.md`, `README.zh.md`), the 40-page bilingual static website (`site/` + `site/404.html` + `site/assets/app.{css,js}` + `.md` alternates), agentic discovery artifacts (`site/robots.txt`, `site/sitemap.xml`, `site/llms.txt`, `site/llms-full.txt`, `site/.well-known/ai-catalog.json`), and the machine-readable catalog (`site/index.json`, `site/count.json`) are generated from [`data/entries.json`](data/entries.json) and [`data/seo-content.json`](data/seo-content.json). **Do not edit the generated files by hand** — CI checks byte-for-byte consistency via `node scripts/generate.mjs --check`.

> [!NOTE]
> Production deployments on Vercel (`vercel.json`: `"buildCommand": ""`, `"outputDirectory": "site"`) publish the committed `site/` directory directly on every push to `main` without a build step. Always run `node scripts/generate.mjs` and commit the updated `site/` files together with `data/entries.json` and `data/seo-content.json` — CI checks parity, but does not block Vercel from deploying a stale `site/`.

> [!NOTE]
> Raster brand icons and OG social images (`site/favicon.ico`, `site/apple-touch-icon.png`, `site/og-image.png`, `site/og-image-zh.png`) are generated on demand by running `node scripts/build-seo-assets.mjs` manually. That asset script is intentionally excluded from `scripts/generate.mjs` and CI so `--check` stays fast.

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

1. Edit [`data/entries.json`](data/entries.json) (and [`data/seo-content.json`](data/seo-content.json) when adding or updating bilingual page copy).
2. Regenerate all outputs and run local checks:
   ```sh
   node scripts/generate.mjs
   node scripts/generate.mjs --check
   node scripts/lint.mjs
   npm test
   node scripts/verify-install.mjs
   node scripts/check-links.mjs
   ```
3. Open a pull request against `main`.

## Static Site Architecture & Astro Migration Thresholds

At the current catalog size (43 entries / 40 bilingual SSR HTML pages + `404.html`), `nsh-awesome` intentionally uses a zero-dependency Node SSR generator (`scripts/generate.mjs` + `scripts/lib/*`) so `committed === deployed` holds on Vercel and GitHub Pages without external npm build toolchains or `node_modules`.

Based on the feasibility benchmark in `#461` (§5.2), re-evaluate migrating to Astro if the repository crosses **any** of the following five thresholds (**跨过任一条就重开 Astro 评估**):

1. **长文 MDX ≥ 20–30 篇**：站内新增 20–30 篇以上手写 MDX 深度教程、周报或专栏文章，需要 Shiki 语法高亮、目录提取与内容集合管理。
2. **需要 Island 状态机**：网页从“静态目录 + 渐进搜索/复制”升级为需要 React/Solid 等状态机驱动的交互 Island（例如在线 NSH TSX Playground 或交互式依赖图谱画布）。
3. **页面规模突破 150–300 页**：目录扩展到百余模块（300+ 双语 HTML 页面），继续把生成 HTML 提交进 Git 会造成 PR diff 膨胀与仓库体积负担。
4. **需要 `astro:assets` 转码**：每个模块详情页需要自动化生成多规格 AVIF/WebP 响应式截图或媒体管线（`astro:assets` + Sharp）。
5. **共享模板 > 8–10 套**：手写 HTML 模板变体超过 8–10 套且出现跨模板样式/作用域维护困难。
