---
entryId: supernsh-icons
lang: en
title: "supernsh-icons: 260 Iconify Sets for Native Shell"
description: Around 465,000 typed SVG and icon-font glyphs organized into 35 installable supernsh-icons-* crates plus CLI fetching for remaining Iconify sets.
h1: "supernsh-icons: 260 Iconify Sets, SVG & Font Glyphs for NSH"
summary: Hybrid Rust + TSX icon system covering roughly 465,000 Iconify icons across 260 sets—with 35 crates.io companion crates, multicolor brand/flag support, and a .ttf icon-font builder.
updatedAt: 2026-11-25
platformSupport:
  heading: Multi-Target Build & Prebuilt Gallery Matrix
  overview: Upstream CI builds and tests across six platforms and distributes standalone `examples/gallery` downloads for desktop, simulator, Android, and web.
  matrix:
    - platform: macOS (arm64 / x86_64)
      status: Supported
      notes: Prebuilt ad-hoc signed gallery available in GitHub releases (macOS 14+).
    - platform: Linux & Windows (x86_64 / arm64)
      status: Supported
      notes: Upstream CI runs formatting, Clippy, tests, and gallery releases on both architectures.
    - platform: iOS & Android
      status: Supported
      notes: Upstream cross-checks iOS, simulator, and Android builds and publishes APK / simulator gallery zips.
    - platform: Web
      status: Supported (LLVM required)
      notes: Live web gallery deployed at `supernsh.github.io/icons/`; web builds require LLVM `clang` and `llvm-ar`.
securityNote:
  heading: Binary Size Tip, Web Toolchain & License Attribution
  body: In Rust, referencing `set::ALL` compiles an entire set into your binary—import individual icon constants instead so unused glyphs drop away. Remember to preserve `NOTICE.md` attributions if using CC BY 4.0 sets like Font Awesome, Solar, Streamline, or Codicons.
related:
  - id: nsh-icon
    path: /nshm/nsh-icon/
    name: nsh-icon
    reason: Minimalist Apache-2.0 alternative focused strictly on 5 curated monotone sets with zero CLI/LLVM extras.
  - id: nsh-omarchy
    path: /nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: Style desktop views cleanly using `text-*` color inheritance on monotone Iconify glyphs.
  - id: nsh-shadcn
    path: /nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: Add full-color brand logos or flags inside shadcn cards, menus, and chat attachments.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: See How 35 Sub-Crates + 3 Data Crates Were Handled
---

## Full Iconify Breadth with Crate Packs, CLI Extraction & Fonts

`supernsh-icons` combines a single Rust-backed `<Icon>` renderer (`ui::icon()` for full SVG masks/filters, or NSH `Svg` via `icon(...)`) with TSX exports (`supernsh-icons/markup`, `supernsh-icons/iconify`) and the full Iconify catalog (~465,000 icons across 260 sets). Monotone icons automatically follow surrounding `currentColor` text styles, whereas logos, country flags, and emoji preserve their multi-color SVG fills.

The 35 most popular collections—including `lucide`, `ph`, `tabler`, `heroicons`, `ri`, `mdi`, `material-symbols`, `simple-icons`, `logos`, `circle-flags`, `fa7-*`, `fluent`, `carbon`, and `codicon`—publish as individual `supernsh-icons-<set>` crates on crates.io (`0.2.0`). For the remaining ~225 sets, or when you want a compact `.ttf` icon font (`<Glyph>` / `Root::font(FONT)`), the repository's `cli/nsh-icons.ts` tool writes only the icons or glyphs you specify.

## Strengths, License Attribution & Web LLVM Requirement

Choose `supernsh-icons` over `nsh-icon` when you need brand logos (`logos`, `simple-icons`, `devicon`), circle/country flags (`circle-flags`, `flag`), UI icons from Material/Fluent/Carbon, SVG mask/filter fidelity (`ui::icon()`), or `.ttf` icon fonts for dense filled glyphs.

Keep two upstream constraints in mind: first, while the `supernsh-icons` library code is MIT, individual Iconify sets retain their upstream licenses (Font Awesome, Solar, Streamline, and Codicons carry CC BY 4.0 attribution terms, tracked in `NOTICE.md` and `docs/sets.md`); second, web builds require LLVM `clang` and `llvm-ar` alongside the Rust toolchain.

- Displaying multi-color tech logos (`logosRust`) and country flags alongside theme-tinted monotone icons in one `<Icon>` API.
- Generating an app-specific `.ttf` glyph bundle (`supernsh-icons font ph:house-fill ph:heart-fill`) for filled Material or Phosphor glyphs.
- Browsing and exporting styled PNG/JPEG/SVG app assets in the offline gallery hosted at `supernsh.github.io/icons/`.

## crates.io Installation & Companion CLI Options

`supernsh-icons@0.2.0` and all 35 `supernsh-icons-*` set crates target `nsh-core = "0.7.1"` and `nsh >= 0.7.1`, installing cleanly from crates.io (for example `nsh add supernsh-icons` followed by `nsh add supernsh-icons-lucide`).

- Add at least one `supernsh-icons-<set>` crate, or run `node cli/nsh-icons.ts` from a checkout (`bun install` in `cli` needed for font generation) to pull icons from `@iconify-json/<prefix>`.
- Requires Rust toolchain (`nsh` compiles the crate even in TSX apps) and LLVM `clang` + `llvm-ar` for `--target web` builds.
- Icon font mode (`supernsh-icons font`) rejects stroked outline icons (Lucide, Tabler) and multi-color icons; use SVG mode for those.

## Grouped 35 Set Crates & TSX/Rust Exports

To prevent listing 35 crates individually in the root catalog, all `supernsh-icons-<set>` companion crates (plus internal `supernsh-icons-data-1..3` crates) are consolidated here.

- **35 `supernsh-icons-<set>` crates:** `akar-icons`, `ant-design`, `bi`, `bx`, `carbon`, `circle-flags`, `codicon`, `devicon`, `fa7-brands`, `fa7-regular`, `fa7-solid`, `fe`, `flag`, `fluent`, `heroicons`, `hugeicons`, `iconoir`, `ion`, `line-md`, `logos`, `lucide`, `majesticons`, `material-symbols`, `mdi`, `mingcute`, `mynaui`, `octicon`, `ph`, `radix-icons`, `ri`, `simple-icons`, `solar`, `streamline`, `svg-spinners`, `tabler`.
- **supernsh-icons/markup & /iconify:** TSX helpers `svgMarkup`, `svgDataUri`, and Iconify lookup/resolution helpers.
- **Internal `supernsh-icons-data-1..3`:** Internal gallery data crates excluded from standalone directory listings.

## nsh 0.7.1 Verification Record

Verified cleanly in CI on `nsh 0.7.1 (f78eace)` with `nsh add supernsh-icons`, locking `0.2.0` (`MIT` crate code; individual icon sets keep upstream licenses, updated `2026-11-25`) from `crates.io`.

Scope boundary: Awesome NSH CI confirms `nsh add supernsh-icons` succeeds in a scratch app on `nsh 0.7.1`. All 35 companion crates are documented from upstream `SuperNSH/icons` metadata and crates.io inspection rather than 35 individual scratch runs.
