---
pageType: section
pageSlug: nshm
entriesSection: nshm
lang: en
title: Installable nshm Modules for Native Shell 0.7.1
description: Compare 13 verified nsh add packages across UI kits, icons, canvas graphs, analytics, and HarmonyOS, with crates.io versus GitHub source guidance.
h1: Verified Installable nshm Modules (nsh 0.7.1)
lead: All 13 reusable Native Shell (nsh) modules verified with clean scratch-app `nsh add` runs on `nsh 0.7.1`, grouped across six functional categories.
updatedAt: 2026-11-26
technicalCallout:
  heading: Grouped Icon Companion Crates & Version-Pin Workarounds
  body: "To keep the directory readable instead of flooding listings with 40 repetitive sub-crates, the 5 icon packs under `nsh-icon` and the 35 Iconify set crates under `supernsh-icons` are documented inside their parent module pages. Note also that `nsh-widgets` and `nsh-platform-harmonyos` currently require GitHub sources (`--rev master` and `github:huacnlee/nsh-platform-harmonyos` respectively) because their published crates.io versions either pin `nsh: ^0.6` or lack the `platform` key."
comparisonTable:
  heading: Category Selection Matrix Across 13 Verified nshm Packages
  intro: Compare package architecture, source channel, and primary use case before choosing between overlapping modules in the same category.
  columns:
    - Module
    - Category
    - Kind
    - Install Source
    - Best Fit
  rows:
    - - nsh-extra
      - Official Modules
      - rust-nshm
      - crates.io
      - Opt-in OS device APIs (camera, location, photos, push, speech) gated per Cargo feature.
    - - nsh-omarchy
      - UI Components & Themes
      - rust-nshm
      - crates.io
      - Omarchy-styled desktop/mobile components with live theme tracking and Tokyo Night/Flexoki fallbacks.
    - - nsh-shadcn
      - UI Components & Themes
      - rust-nshm
      - "github:"
      - Early 0.1.0 port of shadcn/ui new-york-v4 primitives (including Chat components) with documented Navigation Menu/Sidebar gaps.
    - - nsh-widgets
      - UI Components & Themes
      - hybrid-nshm
      - git --rev master
      - Shared Widget Tree IR for iOS WidgetKit/Live Activities, Android RemoteViews, KDE Plasma, and GNOME.
    - - nsh-icon
      - Icons
      - rust-nshm
      - crates.io
      - Lightweight tree-shaken SVG icons across 5 curated sets (Lucide, Heroicons, Tabler, Phosphor, Remix).
    - - supernsh-icons
      - Icons
      - hybrid-nshm
      - crates.io
      - Large Iconify coverage (260 sets, ~465,000 icons), 35 pre-packaged crates, plus .ttf icon-font builder.
    - - nsh-graph
      - Charts, Graphs & GPU Canvas
      - hybrid-nshm
      - crates.io
      - Interactive network/node-link graphs with force/hierarchical/circular/grid layouts and Rust acceleration.
    - - nsh-o11y
      - Charts, Graphs & GPU Canvas
      - hybrid-nshm
      - crates.io
      - High-throughput telemetry (TimeSeriesChart M4 pyramid, LogView, TraceWaterfall, FlameGraph).
    - - nsh-webgpu
      - Charts, Graphs & GPU Canvas
      - hybrid-nshm
      - "github:"
      - Standard WebGPU API (`navigator.gpu`, `GPUDevice`, WGSL compute/render) backed by `wgpu 29`.
    - - nsh-skia
      - Charts, Graphs & GPU Canvas
      - hybrid-nshm
      - "github:"
      - Declarative/imperative `react-native-skia` 2D drawing and `RuntimeEffect` shaders on macOS & Linux.
    - - nsh-query
      - Data & Analytics
      - tsx-nshm
      - "github:"
      - Pure-TSX TanStack Query hooks with zero Rust compilation and NSH Storage persistence.
    - - nsmetry
      - Data & Analytics
      - hybrid-nshm
      - crates.io
      - Cookieless batched event & `<NavStack>` screen telemetry targeting self-hosted Cloudflare Workers.
    - - nsh-platform-harmonyos
      - Platform Targets
      - platform-nshm
      - "github:"
      - Community ArkUI platform backend enabling `nsh run/package --target harmonyos` for HarmonyOS/OpenHarmony.
selectionAdvice:
  heading: Practical Module Selection Guidance
  items:
    - title: "UI Kits: nsh-omarchy vs nsh-shadcn"
      body: Pick `nsh-omarchy` (`0.2.0`) when you want an established crates.io release with Omarchy desktop theme synchronization, Tokyo Night or Flexoki Light defaults, and built-in charts. Consider `nsh-shadcn` as an early `0.1.0` option if your team specifically wants `new-york-v4` styling, Chat UI primitives, or `.app_class(...)` overrides while accepting its partial `Navigation Menu` and `Sidebar` caveats.
    - title: "Icons: nsh-icon vs supernsh-icons"
      body: Choose `nsh-icon` when one of the five major MIT/Apache sets covers your app with minimal dependencies. Choose `supernsh-icons` when you need brand logos, country flags, specialty Iconify packs from 260 sets, or compiled `.ttf` glyph fonts—remembering that `--target web` needs LLVM `clang` and `llvm-ar`.
    - title: "Graphics & Telemetry: nsh-graph, nsh-o11y, nsh-webgpu, nsh-skia"
      body: Use `nsh-graph` for topology diagrams and `nsh-o11y` for metrics, logs, traces, and flame graphs on NSH's built-in `<Canvas>`. Reach for `nsh-webgpu` when porting WebGPU shaders across desktop/mobile/web, or `nsh-skia` when you specifically need `react-native-skia` 2D paths and shaders on macOS and Linux.
relatedLinks:
  - path: /discovery/
    label: Read the 4 manifest rules & 0.6 quirk analysis
    reason: Understand why crates.io keyword=nshm alone returned 68 hits but only 7 clean 0.7.1 root crates.
  - path: /framework/
    label: Inspect the 19 official framework crates
    reason: Avoid running `nsh add` on core crates like `nsh-core` or `nsh-base`.
  - path: /about/
    label: Review verification boundaries & security notes
    reason: Check what clean scratch-app testing validates and what `build.rs` permissions entail.
---

An installable nshm is not merely any crate prefixed with `nsh-` or tagged with `keywords = ["nshm"]` on crates.io. According to `crates/nsh-cli/src/nshm/manifest.rs` in `longbridge/nsh`, `nsh add` accepts a package only when it matches one of four structural manifest layouts—Rust (`#[native_module("...")]`), pure TSX (`nsh.json` `"exports"`), Hybrid (both), or Platform (`"platform": "<target>"`)—and satisfies semver checks against `nsh 0.7.1`.

This hub consolidates the 13 cleanly compatible modules verified across crates.io (7 modules plus 40 grouped icon-pack companion crates), `github:owner/repo` checkouts (5 modules), and Git branch pins (1 module). Unverified 0.6-era crates that only slip through `nsh add` because of Cargo's `[dependencies.nsh-core]` table normalization parser quirk are intentionally excluded here and documented on the Discovery page.
