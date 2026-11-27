<!-- GENERATED FILE — DO NOT EDIT DIRECTLY. Edit data/entries.json and run `node scripts/generate.mjs`. -->

# Awesome NSH [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) [![awesome · nsh](https://nsh-awesome.vercel.app/badge.svg)](https://nsh-awesome.vercel.app/) [![nshm count](https://img.shields.io/endpoint?url=https%3A%2F%2Fnsh-awesome.vercel.app%2Fcount.json)](https://nsh-awesome.vercel.app/) [![CI](https://github.com/AkaraChen/nsh-awesome/actions/workflows/ci.yml/badge.svg)](https://github.com/AkaraChen/nsh-awesome/actions/workflows/ci.yml)

English | [中文](README.zh.md)

> A curated list of modules (`nshm`), framework crates, templates, and documentation for [Native Shell](https://nsh.dev) (`nsh`).

Native Shell is a Rust-first native UI framework: build once in TSX or Rust for iOS, Android, macOS, Windows, Linux, GPUI, TUI, and the web, and extend apps with installable packages called **nshm** via `nsh add`.

> 🌐 **Interactive directory:** [https://nsh-awesome.vercel.app/](https://nsh-awesome.vercel.app/) (13 installable `nshm` verified on `nsh 0.7.1`) · 📡 **Machine-readable index:** [`index.json`](https://nsh-awesome.vercel.app/index.json) · 🔍 **Discovery methodology:** [`docs/DISCOVERY.md`](docs/DISCOVERY.md)

> [!WARNING]
> Installing a Rust or TSX `nshm` runs its build scripts (`build.rs`), procedural macros, and runtime code with your app's full permissions, and crates can contribute platform permissions/entitlements via `[package.metadata.nsh]`. Inspect source repositories and `nsh.lock` changes before shipping.

## Contents

- [Installable nshm](#installable-nshm)
  - [Official Modules](#official-modules)
  - [UI Components & Themes](#ui-components--themes)
  - [Icons](#icons)
  - [Charts, Graphs & GPU Canvas](#charts-graphs--gpu-canvas)
  - [Data & Analytics](#data--analytics)
  - [Platform Targets](#platform-targets)
- [Framework & Official Crates](#framework--official-crates)
  - [Core Runtime & Tooling](#core-runtime--tooling)
  - [Official Platform Backends](#official-platform-backends)
- [Examples & Templates](#examples--templates)
- [Articles & Tutorials](#articles--tutorials)
- [Discovery & Verification](#discovery--verification)
- [Contributing](#contributing)

## Installable nshm

Modules verified with `nsh add` in a clean scratch app on nsh 0.7.1 (from crates.io, `github:owner/repo`, or Git URL).

### Official Modules

- [nsh-extra](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) — Official optional device modules for NSH apps gated by Cargo features: camera, location, photos, push, and speech.
  - Install: `nsh add nsh-extra --features camera` · Type: Rust nshm · Version: `0.7.1` · Platforms: iOS, Android, macOS, Windows, Web · License: Apache-2.0 · Updated: 2026-11-25 · [crates.io](https://crates.io/crates/nsh-extra) · [Docs / Demo](https://nsh.dev/docs/nshm#nsh-extra)
  - Note: Per-feature platform availability: camera (iOS, Android), location (macOS, iOS, Web), photos (iOS), push (iOS, Android), speech (macOS, iOS, Android, Windows, Web).

### UI Components & Themes

- [nsh-omarchy](https://github.com/huacnlee/nsh-omarchy) — Omarchy-themed UI component set built on nsh-base with live system theme following, forms, overlays, tables, and charts for Rust and TSX.
  - Install: `nsh add nsh-omarchy` · Type: Rust nshm · Version: `0.2.0` · Platforms: macOS, Linux, Windows, iOS, Android, Web · License: MIT · Updated: 2026-11-25 · [crates.io](https://crates.io/crates/nsh-omarchy) · [Docs / Demo](https://huacnlee.github.io/nsh-omarchy/)
  - Note: Falls back to Tokyo Night (dark) or Flexoki Light when Omarchy theme files are absent.
- [nsh-shadcn](https://github.com/caoxing9/nsh-shadcn) — Rust-backed shadcn/ui new-york-v4 component port drawn with native views across desktop, mobile, and web for both Rust and TSX.
  - Install: `nsh add github:caoxing9/nsh-shadcn` · Type: Rust nshm · Version: `0.1.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-26
  - Note: GitHub-only; not published on crates.io yet.
- [nsh-widgets](https://github.com/SuperNSH/widgets) — Cross-platform home-screen widgets and Live Activities using one shared Widget Tree IR rendered natively via WidgetKit, RemoteViews, Plasma, and GNOME.
  - Install: `nsh add https://github.com/SuperNSH/widgets.git --rev master` · Type: Rust + TSX nshm · Version: `0.4.1` · Platforms: iOS, macOS, Android, Linux · License: MIT · Updated: 2026-11-26 · [crates.io](https://crates.io/crates/nsh-widgets)
  - Note: Use the Git URL `--rev master` on NSH 0.7.1; crates.io 0.4.1 and tag v0.4.1 still pin `nsh: ^0.6`.

### Icons

- [nsh-icon](https://github.com/huacnlee/nsh-icon) — Tree-shaken vector icon renderer (`<Icon>` and `icon()`) paired with five installable icon-set crates (Lucide, Heroicons, Tabler, Phosphor, Remix).
  - Install: `nsh add nsh-icon` · Type: Rust nshm · Version: `0.2.2` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [crates.io](https://crates.io/crates/nsh-icon)
  - Note: Install companion icon packs alongside it, e.g. `nsh add nsh-icon-lucide`, `nsh-icon-heroicons`, `nsh-icon-tabler`, `nsh-icon-phosphor`, `nsh-icon-remix`.
- [supernsh-icons](https://github.com/SuperNSH/icons) — Typed SVG and font-glyph icon library covering 260 Iconify sets (~465,000 icons) with 35 installable companion set crates.
  - Install: `nsh add supernsh-icons` · Type: Rust + TSX nshm · Version: `0.2.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-25 · [crates.io](https://crates.io/crates/supernsh-icons) · [Docs / Demo](https://supernsh.github.io/icons/)
  - Note: Companion crates `supernsh-icons-lucide`, `supernsh-icons-mdi`, `supernsh-icons-ph`, etc. are grouped under this entry rather than listed 35 times.

### Charts, Graphs & GPU Canvas

- [nsh-graph](https://github.com/JetSquirrel/nsh-graph) — Interactive network graph component on native `<Canvas>` with force, hierarchical, circular, and grid layouts plus an opt-in Rust backend.
  - Install: `nsh add nsh-graph` · Type: Rust + TSX nshm · Version: `0.3.0` · Platforms: iOS, Android, macOS, Windows, Linux, GPUI, Web · License: Apache-2.0 · Updated: 2026-11-25 · [crates.io](https://crates.io/crates/nsh-graph) · [Docs / Demo](https://jetsquirrel.github.io/nsh-graph/)
  - Note: Includes community collapsing, PNG export via `OffscreenCanvas`, and color-blind-safe palettes.
- [nsh-o11y](https://github.com/JetSquirrel/nsh-o11y) — High-throughput observability charts (`TimeSeriesChart`, `LogView`, `TraceWaterfall`, `FlameGraph`) using M4 pyramid decimation and an optional Rust store.
  - Install: `nsh add nsh-o11y` · Type: Rust + TSX nshm · Version: `0.1.0` · Platforms: iOS, Android, macOS, Windows, Linux, GPUI, Web · License: Apache-2.0 · Updated: 2026-11-25 · [crates.io](https://crates.io/crates/nsh-o11y) · [Docs / Demo](https://jetsquirrel.github.io/nsh-o11y/)
  - Note: Supports synchronized crosshairs across panels (`createChartSync`) and live streaming appends.
- [nsh-webgpu](https://github.com/SuperNSH/webgpu) — WebGPU (`navigator.gpu`, `GPUDevice`, `<Canvas getContext("webgpu")>`) for NSH apps ported from react-native-webgpu onto wgpu 29.
  - Install: `nsh add github:SuperNSH/webgpu` · Type: Rust + TSX nshm · Version: `0.1.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-25
  - Note: GitHub-only (`publish = false` in Cargo.toml).
- [nsh-skia](https://github.com/SuperNSH/skia) — Skia 2D canvas and drawing primitives (`<Canvas>`, `<Circle>`, `<Path>`, `Skia.RuntimeEffect`) backed by `skia-safe` for macOS and Linux.
  - Install: `nsh add github:SuperNSH/skia` · Type: Rust + TSX nshm · Version: `0.1.0` · Platforms: macOS, Linux · License: MIT · Updated: 2026-11-25
  - Note: GitHub-only; hardware GPU views verified on macOS and Linux (Web unsupported; mobile/Windows fall back to in-memory images).

### Data & Analytics

- [nsh-query](https://github.com/Dearest/nsh-query) — Pure-TSX TanStack Query adapter (`useQuery`, `useMutation`, persistence) wired to NSH app lifecycle, network status, and `Storage`.
  - Install: `nsh add github:Dearest/nsh-query` · Type: TSX nshm · Version: `0.1.0` · Platforms: iOS, Android, macOS, Windows, Linux, Web · License: MIT · Updated: 2026-11-25
  - Note: Pure TSX nshm (requires no Rust toolchain); GitHub-only.
- [nsmetry](https://github.com/huacnlee/nsmetry) — Privacy-first event analytics client SDK for NSH apps with batching and retries targeting a self-hosted NsMetry Cloudflare Worker.
  - Install: `nsh add nsmetry` · Type: Rust + TSX nshm · Version: `0.1.0` · Platforms: macOS, Windows, Linux, Android, iOS, Web · License: MIT · Updated: 2026-11-26 · [crates.io](https://crates.io/crates/nsmetry)
  - Note: Monorepo contains both the Cloudflare Worker dashboard app and the root nshm SDK crate.

### Platform Targets

- [nsh-platform-harmonyos](https://github.com/huacnlee/nsh-platform-harmonyos) — Community platform nshm providing `--target harmonyos` to run and package NSH apps natively on HarmonyOS and OpenHarmony with ArkUI.
  - Install: `nsh add github:huacnlee/nsh-platform-harmonyos` · Type: Platform nshm · Version: `0.1.1` · Platforms: HarmonyOS, OpenHarmony · License: Apache-2.0 · Updated: 2026-11-26 · [crates.io](https://crates.io/crates/nsh-platform-harmonyos)
  - Note: Install via `github:huacnlee/nsh-platform-harmonyos` (`0.1.1`); crates.io `0.1.0` predates `nsh.json` `"platform"` and fails `nsh add`.

## Framework & Official Crates

> [!IMPORTANT]
> NOT nshm — cannot be installed with `nsh add`. Core framework, runtime, bundler, and platform backend crates maintained in `longbridge/nsh` (`cargo add` or managed automatically by `nsh`).

### Core Runtime & Tooling

- [nsh-cli](https://crates.io/crates/nsh-cli) — NOT nshm (cannot `nsh add`) — Official `nsh` CLI tool for initializing, checking, running, packaging, and signing apps.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-core](https://crates.io/crates/nsh-core) — NOT nshm (cannot `nsh add`) — Platform-independent shadow tree, reactive signals, layout engine, and mount instructions.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-base](https://crates.io/crates/nsh-base) — NOT nshm (cannot `nsh add`) — Unstyled UI primitives (`nsh/base`) providing focus, navigation, dialogs, editor, and accessibility behavior.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-engine](https://crates.io/crates/nsh-engine) — NOT nshm (cannot `nsh add`) — Engine thread driving the JS host and `nsh-core` while emitting native mount batches.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-macros](https://crates.io/crates/nsh-macros) — NOT nshm (cannot `nsh add`) — Procedural derive macros for NSH Rust components, props, events, and `#[native_module]` exports.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-js](https://crates.io/crates/nsh-js) — NOT nshm (cannot `nsh add`) — QuickJS runtime host handling JS evaluation, native bridge op decoding, and bytecode execution.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-bundler](https://crates.io/crates/nsh-bundler) — NOT nshm (cannot `nsh add`) — Rolldown-based JS/TSX bundler and JSX compiler used by the NSH toolchain.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-testing](https://crates.io/crates/nsh-testing) — NOT nshm (cannot `nsh add`) — Headless testing driver that runs NSH apps without a window for `nsh test` and Rust integration tests.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-updater](https://crates.io/crates/nsh-updater) — NOT nshm (cannot `nsh add`) — Self-update client supporting signed update manifests, verification, and binary replacement.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-package](https://crates.io/crates/nsh-package) — NOT nshm (cannot `nsh add`) — Signed `.nshpkg` archive format, Ed25519 key hierarchy, revocation lists, and trust store.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)
- [nsh-i18n](https://crates.io/crates/nsh-i18n) — NOT nshm (cannot `nsh add`) — Locale formatting tables and `rust-i18n` translation loader for NSH apps.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev)

### Official Platform Backends

- [nsh-platform-macos](https://crates.io/crates/nsh-platform-macos) — NOT nshm (cannot `nsh add`) — Official macOS AppKit backend with CoreText rendering, native view mounting, and window hosting.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/macos)
- [nsh-platform-ios](https://crates.io/crates/nsh-platform-ios) — NOT nshm (cannot `nsh add`) — Official iOS UIKit backend and NativeShell Swift embedding ABI.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: iOS · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/ios)
- [nsh-platform-android](https://crates.io/crates/nsh-platform-android) — NOT nshm (cannot `nsh add`) — Official Android JNI glue, StaticLayout text measurement, and native animation driver.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: Android · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/android)
- [nsh-platform-windows](https://crates.io/crates/nsh-platform-windows) — NOT nshm (cannot `nsh add`) — Official Windows Win32, Direct2D, and DirectWrite native backend.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/windows)
- [nsh-platform-linux](https://crates.io/crates/nsh-platform-linux) — NOT nshm (cannot `nsh add`) — Official Linux GTK 4 and Pango native widget mounting backend.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/linux)
- [nsh-platform-web](https://crates.io/crates/nsh-platform-web) — NOT nshm (cannot `nsh add`) — Official WebAssembly DOM rendering backend for deploying NSH apps as static web sites.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: Web · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/web)
- [nsh-platform-gpui](https://crates.io/crates/nsh-platform-gpui) — NOT nshm (cannot `nsh add`) — Official GPUI rendering backend for embedding NSH surfaces inside GPUI desktop apps.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/gpui)
- [nsh-platform-tui](https://crates.io/crates/nsh-platform-tui) — NOT nshm (cannot `nsh add`) — Official terminal UI backend rendering NSH views into a terminal cell grid.
  - **Not nshm** (cannot install with `nsh add`) · Type: Framework crate · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Docs / Demo](https://nsh.dev/docs/platforms)

## Examples & Templates

Starter boilerplates, official examples, showcase catalogs, and production reference applications built with Native Shell.

- [longbridge/nsh Examples](https://github.com/longbridge/nsh/tree/main/examples) — Official NSH example apps covering TSX, Rust-only (`tasks-rs`), mixed `rust-exports`, tray, embedding, and `nsh-extra`.
  - Type: Official examples · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-26 · [Docs / Demo](https://nsh.dev/gallery)
- [SuperNSH/starter](https://github.com/SuperNSH/starter) — Production-style NSH 0.7.1 application boilerplate demonstrating navigation, forms, virtualized lists, animations, and signed remote TSX packages.
  - Type: Template · Version: `0.1.0` · Platforms: macOS, iOS, Android, Web · License: MIT · Updated: 2026-11-26
  - Note: App boilerplate (`publish = false`, `nsh.json` `"root": "App"`), not a library nshm.
- [longbridge/nsh-showcases](https://github.com/longbridge/nsh-showcases) — Official community showcase repository backing `nsh.dev/apps` and `nsh.dev/directory` with app stories and project manifests.
  - Type: Directory · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-26 · [Docs / Demo](https://nsh.dev/apps)
- [huacnlee/disktree](https://github.com/huacnlee/disktree) — Native disk-space treemap explorer featured in NSH's official `ext/` Rust-in-TSX tutorial.
  - Type: Reference app · Platforms: macOS, Linux · License: MIT · Updated: 2026-11-25 · [Docs / Demo](https://huacnlee.github.io/disktree/)

## Articles & Tutorials

Official documentation, architecture guides, and module authoring references for Native Shell.

- [nshm Guide (Official Docs)](https://nsh.dev/docs/nshm) — Authoritative NSH modules specification covering `nsh add`, `nsh.lock`, `nsh-extra`, `ext/` crates, platform nshms, and publishing.
  - Type: Docs · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25
- [Getting Started with Native Shell](https://nsh.dev/docs/getting-started) — Step-by-step walkthrough for creating, running, checking, testing, and packaging your first TSX or Rust NSH application.
  - Type: Tutorial · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25
- [Building with Rust](https://nsh.dev/docs/rust) — Guide to writing Rust-first apps and extending TSX apps with `#[native_module]` crates and generated TypeScript declarations.
  - Type: Tutorial · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25
- [Platform Extensions Guide](https://nsh.dev/docs/platform-extensions) — Specification for implementing custom target backends as external executables or installable `"platform"` nshms.
  - Type: Docs · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25
- [Project Structure & nsh.json Reference](https://nsh.dev/docs/project-structure) — Complete reference for `nsh.json` manifest keys, `.nsh/types`, asset macros, and module resolution rules.
  - Type: Docs · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25
- [Comparing Approaches (Electron, Tauri, RN, Flutter, GPUI)](https://nsh.dev/docs/comparison) — Architecture and measured benchmark comparison between Native Shell and Electron, Tauri, React Native, Flutter, GPUI, Qt, and Slint.
  - Type: Guide · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25
- [Official NSH Directory](https://nsh.dev/directory) — Official Native Shell community showcase directory listing curated components, libraries, and platforms from `longbridge/nsh-showcases`.
  - Type: Directory · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-26

## Discovery & Verification

- **Empirical manifest rules:** An installable `nshm` requires `#[native_module("...")]` in its Rust crate root, `nsh.json` `"exports"` for TSX modules, or `nsh.json` `"platform"` for platform targets — not just the `nshm` keyword on crates.io. See [`docs/DISCOVERY.md`](docs/DISCOVERY.md) for hit counts across all 6 discovery channels and why 18 normalized `0.6` crates and 3 `0.6`/`=0.7.0` GitHub modules are currently excluded from the `0.7.1` installable list.
- **Automated discovery & CI checks:** Run `node scripts/discover.mjs` to scan crates.io, GitHub, and `longbridge/nsh-showcases`. CI validates Markdown & schema lint (`scripts/lint.mjs`), generated file parity (`scripts/generate.mjs --check`), live link checks (`scripts/check-links.mjs`), and real `nsh add` installation (`scripts/verify-install.mjs`) for every installable entry.

## Contributing

Contributions are welcome! Edit [`data/entries.json`](data/entries.json), run `node scripts/generate.mjs`, and see [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.
