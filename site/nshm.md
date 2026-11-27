# Installable nshm

> Modules verified with `nsh add` in a clean scratch app on nsh 0.7.1 (from crates.io, `github:owner/repo`, or Git URL).

HTML hub: [https://nsh-awesome.vercel.app/nshm/](https://nsh-awesome.vercel.app/nshm/) · [中文](https://nsh-awesome.vercel.app/zh/nshm.md) · [Back to home](https://nsh-awesome.vercel.app/index.md)

This section includes **13** curated entries sourced from `data/entries.json` (verified against `nsh 0.7.1`).

## Official Modules (1)

- [nsh-extra](https://nsh-awesome.vercel.app/nshm/nsh-extra/) — Official optional device modules for NSH apps gated by Cargo features: camera, location, photos, push, and speech.
  - Install: `nsh add nsh-extra --features camera` · Kind: `rust-nshm` · Source: `crates.io` · Version: `0.7.1` · Platforms: iOS, Android, macOS, Windows, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) · [crates.io](https://crates.io/crates/nsh-extra) · [Docs / Demo](https://nsh.dev/docs/nshm#nsh-extra)
  - Note: Per-feature platform availability: camera (iOS, Android), location (macOS, iOS, Web), photos (iOS), push (iOS, Android), speech (macOS, iOS, Android, Windows, Web).

## UI Components & Themes (3)

- [nsh-omarchy](https://nsh-awesome.vercel.app/nshm/nsh-omarchy/) — Omarchy-themed UI component set built on nsh-base with live system theme following, forms, overlays, tables, and charts for Rust and TSX.
  - Install: `nsh add nsh-omarchy` · Kind: `rust-nshm` · Source: `crates.io` · Version: `0.2.0` · Platforms: macOS, Linux, Windows, iOS, Android, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/huacnlee/nsh-omarchy) · [crates.io](https://crates.io/crates/nsh-omarchy) · [Docs / Demo](https://huacnlee.github.io/nsh-omarchy/)
  - Note: Falls back to Tokyo Night (dark) or Flexoki Light when Omarchy theme files are absent.
- [nsh-shadcn](https://nsh-awesome.vercel.app/nshm/nsh-shadcn/) — Rust-backed shadcn/ui new-york-v4 component port drawn with native views across desktop, mobile, and web for both Rust and TSX.
  - Install: `nsh add github:caoxing9/nsh-shadcn` · Kind: `rust-nshm` · Source: `github` · Version: `0.1.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/caoxing9/nsh-shadcn)
  - Note: GitHub-only; not published on crates.io yet.
- [nsh-widgets](https://nsh-awesome.vercel.app/nshm/nsh-widgets/) — Cross-platform home-screen widgets and Live Activities using one shared Widget Tree IR rendered natively via WidgetKit, RemoteViews, Plasma, and GNOME.
  - Install: `nsh add https://github.com/SuperNSH/widgets.git --rev master` · Kind: `hybrid-nshm` · Source: `git` · Version: `0.4.1` · Platforms: iOS, macOS, Android, Linux · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/SuperNSH/widgets) · [crates.io](https://crates.io/crates/nsh-widgets)
  - Note: Use the Git URL `--rev master` on NSH 0.7.1; crates.io 0.4.1 and tag v0.4.1 still pin `nsh: ^0.6`.

## Icons (2)

- [nsh-icon](https://nsh-awesome.vercel.app/nshm/nsh-icon/) — Tree-shaken vector icon renderer (`<Icon>` and `icon()`) paired with five installable icon-set crates (Lucide, Heroicons, Tabler, Phosphor, Remix).
  - Install: `nsh add nsh-icon` · Kind: `rust-nshm` · Source: `crates.io` · Version: `0.2.2` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://github.com/huacnlee/nsh-icon) · [crates.io](https://crates.io/crates/nsh-icon)
  - Note: Install companion icon packs alongside it, e.g. `nsh add nsh-icon-lucide`, `nsh-icon-heroicons`, `nsh-icon-tabler`, `nsh-icon-phosphor`, `nsh-icon-remix`.
- [supernsh-icons](https://nsh-awesome.vercel.app/nshm/supernsh-icons/) — Typed SVG and font-glyph icon library covering 260 Iconify sets (~465,000 icons) with 35 installable companion set crates.
  - Install: `nsh add supernsh-icons` · Kind: `hybrid-nshm` · Source: `crates.io` · Version: `0.2.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/SuperNSH/icons) · [crates.io](https://crates.io/crates/supernsh-icons) · [Docs / Demo](https://supernsh.github.io/icons/)
  - Note: Companion crates `supernsh-icons-lucide`, `supernsh-icons-mdi`, `supernsh-icons-ph`, etc. are grouped under this entry rather than listed 35 times.

## Charts, Graphs & GPU Canvas (4)

- [nsh-graph](https://nsh-awesome.vercel.app/nshm/nsh-graph/) — Interactive network graph component on native `<Canvas>` with force, hierarchical, circular, and grid layouts plus an opt-in Rust backend.
  - Install: `nsh add nsh-graph` · Kind: `hybrid-nshm` · Source: `crates.io` · Version: `0.3.0` · Platforms: iOS, Android, macOS, Windows, Linux, GPUI, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://github.com/JetSquirrel/nsh-graph) · [crates.io](https://crates.io/crates/nsh-graph) · [Docs / Demo](https://jetsquirrel.github.io/nsh-graph/)
  - Note: Includes community collapsing, PNG export via `OffscreenCanvas`, and color-blind-safe palettes.
- [nsh-o11y](https://nsh-awesome.vercel.app/nshm/nsh-o11y/) — High-throughput observability charts (`TimeSeriesChart`, `LogView`, `TraceWaterfall`, `FlameGraph`) using M4 pyramid decimation and an optional Rust store.
  - Install: `nsh add nsh-o11y` · Kind: `hybrid-nshm` · Source: `crates.io` · Version: `0.1.0` · Platforms: iOS, Android, macOS, Windows, Linux, GPUI, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://github.com/JetSquirrel/nsh-o11y) · [crates.io](https://crates.io/crates/nsh-o11y) · [Docs / Demo](https://jetsquirrel.github.io/nsh-o11y/)
  - Note: Supports synchronized crosshairs across panels (`createChartSync`) and live streaming appends.
- [nsh-webgpu](https://nsh-awesome.vercel.app/nshm/nsh-webgpu/) — WebGPU (`navigator.gpu`, `GPUDevice`, `<Canvas getContext("webgpu")>`) for NSH apps ported from react-native-webgpu onto wgpu 29.
  - Install: `nsh add github:SuperNSH/webgpu` · Kind: `hybrid-nshm` · Source: `github` · Version: `0.1.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/SuperNSH/webgpu)
  - Note: GitHub-only (`publish = false` in Cargo.toml).
- [nsh-skia](https://nsh-awesome.vercel.app/nshm/nsh-skia/) — Skia 2D canvas and drawing primitives (`<Canvas>`, `<Circle>`, `<Path>`, `Skia.RuntimeEffect`) backed by `skia-safe` for macOS and Linux.
  - Install: `nsh add github:SuperNSH/skia` · Kind: `hybrid-nshm` · Source: `github` · Version: `0.1.0` · Platforms: macOS, Linux · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/SuperNSH/skia)
  - Note: GitHub-only; hardware GPU views verified on macOS and Linux (Web unsupported; mobile/Windows fall back to in-memory images).

## Data & Analytics (2)

- [nsh-query](https://nsh-awesome.vercel.app/nshm/nsh-query/) — Pure-TSX TanStack Query adapter (`useQuery`, `useMutation`, persistence) wired to NSH app lifecycle, network status, and `Storage`.
  - Install: `nsh add github:Dearest/nsh-query` · Kind: `tsx-nshm` · Source: `github` · Version: `0.1.0` · Platforms: iOS, Android, macOS, Windows, Linux, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/Dearest/nsh-query)
  - Note: Pure TSX nshm (requires no Rust toolchain); GitHub-only.
- [nsmetry](https://nsh-awesome.vercel.app/nshm/nsmetry/) — Privacy-first event analytics client SDK for NSH apps with batching and retries targeting a self-hosted NsMetry Cloudflare Worker.
  - Install: `nsh add nsmetry` · Kind: `hybrid-nshm` · Source: `crates.io` · Version: `0.1.0` · Platforms: macOS, Windows, Linux, Android, iOS, Web · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/huacnlee/nsmetry) · [crates.io](https://crates.io/crates/nsmetry)
  - Note: Monorepo contains both the Cloudflare Worker dashboard app and the root nshm SDK crate.

## Platform Targets (1)

- [nsh-platform-harmonyos](https://nsh-awesome.vercel.app/nshm/nsh-platform-harmonyos/) — Community platform nshm providing `--target harmonyos` to run and package NSH apps natively on HarmonyOS and OpenHarmony with ArkUI.
  - Install: `nsh add github:huacnlee/nsh-platform-harmonyos` · Kind: `platform-nshm` · Source: `github` · Version: `0.1.1` · Platforms: HarmonyOS, OpenHarmony · License: Apache-2.0 · Updated: 2026-11-26 · [Source](https://github.com/huacnlee/nsh-platform-harmonyos) · [crates.io](https://crates.io/crates/nsh-platform-harmonyos)
  - Note: Install via `github:huacnlee/nsh-platform-harmonyos` (`0.1.1`); crates.io `0.1.0` predates `nsh.json` `"platform"` and fails `nsh add`.
