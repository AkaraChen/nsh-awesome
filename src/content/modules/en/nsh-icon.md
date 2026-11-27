---
entryId: nsh-icon
lang: en
title: "nsh-icon: Tree-Shaken SVG Icons for Native Shell"
description: Pair the <Icon> and icon() renderer with five modular crates—Lucide, Heroicons, Tabler, Phosphor, or Remix—so only referenced vectors ship in builds.
h1: "nsh-icon: Modular Tree-Shaken Vector Icons for NSH"
summary: Apache-2.0 SVG icon renderer (`<Icon>`, `icon()`, `labeled_icon()`, `icon_set!`) paired with five standalone icon-pack crates covering over 21,900 curated vector icons.
updatedAt: 2026-11-25
platformSupport:
  heading: Cross-Platform SVG Vector Support
  overview: Renders natively across all six core Native Shell targets wherever `nsh-core` `svg` support is active.
  matrix:
    - platform: macOS, Windows, Linux
      status: Supported
      notes: Vector SVGs scale crisply across DPI factors and inherit surrounding `text_color` / `text-*` tokens.
    - platform: iOS & Android
      status: Supported
      notes: Avoids platform font glyph inconsistencies and integrates with mobile screen-reader labels.
    - platform: Web
      status: Supported
      notes: Tree-shaken SVG documents render cleanly inside NSH's WebAssembly DOM backend.
securityNote:
  heading: Build Profile & Binary Size Behavior
  body: "`nsh-icon` compiles as a lightweight Rust library with `[profile.release] strip = true` upstream and only links referenced SVG constants (`data_uri()` / `icon_set!`). Always supply `label` on standalone icon-only buttons so screen readers announce the control instead of skipping it."
related:
  - id: supernsh-icons
    path: /nshm/supernsh-icons/
    name: supernsh-icons
    reason: Alternative supporting 260 Iconify sets (flags, logos, brand marks) and `.ttf` icon fonts.
  - id: nsh-omarchy
    path: /nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: Built by the same author; pair Omarchy tokens with Lucide/Phosphor icons.
  - id: nsh-shadcn
    path: /nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: Drop additional Lucide or Tabler icons into shadcn-styled toolbars and menus.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: How Awesome NSH Groups 40 Icon Sub-Crates
---

## Zero-Bloat Vector Rendering Paired with Separate Pack Crates

Authored by `huacnlee`, `nsh-icon` replaces fragile Unicode symbols or emoji with theme-aware SVG vectors rendered in `currentColor`. By design, the `nsh-icon` crate itself holds zero icons; it provides the `Icon` type, Rust helpers (`icon()`, `labeled_icon()`, `icon_set!`), and the TSX `<Icon>` component (`size`, `strokeWidth`, `label`), while relying on `nsh-core` with the `svg` feature enabled.

Actual glyphs live in five dedicated sibling crates—`nsh-icon-lucide`, `nsh-icon-heroicons`, `nsh-icon-tabler`, `nsh-icon-phosphor`, and `nsh-icon-remix`—each named in PascalCase matching upstream conventions. Only the icon constants your code references are linked into the final binary and TSX bundle, keeping build sizes lean while automatically skipping decorative icons (`label` omitted) from screen readers.

## Choosing Between nsh-icon and supernsh-icons

`nsh-icon` shines when a project uses one or two standard monotone UI icon sets and wants Apache-2.0 simplicity, minimal compile overhead, and per-icon tree shaking (`import { Search } from "nsh-icon-lucide"`). It also lets apps swap stroke widths cleanly on Lucide, Heroicons outline, and Tabler outline icons via `src_with_stroke_width(...)` or `strokeWidth`.

If your design requires full-color brand logos, country flags, animated spinners, `.ttf` glyph fonts, or any of ~255 niche Iconify collections beyond these five libraries, look at `supernsh-icons` instead.

- Standardizing UI navigation, toolbars, and button icons across Rust (`Lucide::Search`) and TSX (`<Icon icon={Search} />`) without icon fonts.
- Ensuring accessible icon-only action buttons via `labeled_icon(Lucide::X, "Close")` or `<Icon label="Settings" />`.
- Binding reactive signals directly to icons (`icon(move || if dark.get() { Lucide::Moon } else { Lucide::Sun })`).

## Two-Step crates.io Installation (Renderer + Companion Pack)

Both `nsh-icon@0.2.2` and all five `nsh-icon-*` companion crates depend on `nsh-core = "0.7.0"` and publish directly to crates.io. Install `nsh-icon` first, then run `nsh add` for each icon pack you actually import.

- Install at least one companion crate alongside `nsh-icon`, for example `nsh add nsh-icon-lucide`.
- Requires `nsh-core` with `"svg"` feature active (automatically requested by `nsh-icon`, though `Cargo.toml` warns that disabling default features on `nsh-platform-*` without `svg` prevents rendering).
- Requires Rust toolchain (and `wasm32` target when packaging for `--target web`).

## The 5 Installable Companion Icon-Set Crates

To prevent 5-line directory clutter, all five companion crates are grouped under this `nsh-icon` entry; counts and upstream versions come from `huacnlee/nsh-icon`.

- **nsh-icon-lucide:** Lucide 1.43.0 — 1,818 icons, single stroke style (`Lucide::Search` / `"nsh-icon-lucide"`).
- **nsh-icon-heroicons:** Heroicons 2.2.0 — 1,288 icons across outline, solid, mini, and micro styles.
- **nsh-icon-tabler:** Tabler Icons 3.53.0 — 6,563 icons in outline and filled variants.
- **nsh-icon-phosphor:** Phosphor 2.1.1 — 9,072 icons across 6 weights (Thin, Light, Regular, Bold, Fill, Duotone).
- **nsh-icon-remix:** Remix Icon 4.8.0 — 3,188 icons in line and fill styles.

## nsh 0.7.1 Verification Record

Automated scratch-app verification on `nsh 0.7.1 (f78eace)` confirms `nsh add nsh-icon` resolves `0.2.2` (`Apache-2.0`, updated `2026-11-25`) from `crates.io`.

Scope boundary: CI runs `nsh add nsh-icon` in a clean app directory; it confirms manifest/lockfile resolution for `nsh-icon` (`0.2.2`), while companion pack builds (`nsh-icon-lucide`, etc.) follow the same workspace manifest version.
