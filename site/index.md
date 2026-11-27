# Awesome Native Shell Modules

> A curated list, searchable directory, and machine-readable index of Native Shell (nsh) modules (nshm), framework crates, templates, and guides.

HTML edition: [https://nsh-awesome.vercel.app/](https://nsh-awesome.vercel.app/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/index.md) · [Discovery](https://nsh-awesome.vercel.app/discovery.md) · [About](https://nsh-awesome.vercel.app/about.md) · [index.json](https://nsh-awesome.vercel.app/index.json)

## What Are Awesome NSH and nshm?

**Awesome NSH** is a curated directory and machine-readable index for [Native Shell](https://nsh.dev) (`nsh`), a Rust-first cross-platform native UI framework. It catalogs **43** entries (updated 2026-11-26): **13** installable `nshm` modules verified with `nsh add` on `nsh 0.7.1`, clearly separated from **19** non-installable framework crates.

- **Installable nshm:** 13 (verified on `nsh 0.7.1`)
- **Framework crates (NOT nshm):** 19
- **Examples & templates:** 4
- **Guides & documentation:** 7

## Install Source Comparison

| Source | Count | Command Format | Notes |
|---|---:|---|---|
| crates.io | 7 | `nsh add <crate>` | Published on crates.io with `0.7`-compatible `nsh-core` (including `nsh-extra --features ...`). |
| `github:owner/repo` | 5 | `nsh add github:owner/repo` | GitHub-only packages or newer `0.7` releases ahead of crates.io (`nsh-platform-harmonyos`). |
| Git URL `--rev` | 1 | `nsh add https://github.com/...git --rev master` | Used when crates.io/tag pins `^0.6` while `master` targets `^0.7.1` (`nsh-widgets`). |

> Security warning: Installing a Rust or TSX `nshm` executes `build.rs`, procedural macros, and runtime code with full app permissions, and crates can contribute entitlements via `[package.metadata.nsh]`. Inspect repositories and `nsh.lock` before shipping.

## Installable nshm (13)

Modules verified with `nsh add` in a clean scratch app on nsh 0.7.1 (from crates.io, `github:owner/repo`, or Git URL). ([Section hub](https://nsh-awesome.vercel.app/nshm/))

### Official Modules

- [nsh-extra](https://nsh-awesome.vercel.app/nshm/nsh-extra/) — Official optional device modules for NSH apps gated by Cargo features: camera, location, photos, push, and speech.
  - Install: `nsh add nsh-extra --features camera` · Kind: `rust-nshm` · Source: `crates.io` · Version: `0.7.1` · Platforms: iOS, Android, macOS, Windows, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) · [crates.io](https://crates.io/crates/nsh-extra) · [Docs / Demo](https://nsh.dev/docs/nshm#nsh-extra)
  - Note: Per-feature platform availability: camera (iOS, Android), location (macOS, iOS, Web), photos (iOS), push (iOS, Android), speech (macOS, iOS, Android, Windows, Web).

### UI Components & Themes

- [nsh-omarchy](https://nsh-awesome.vercel.app/nshm/nsh-omarchy/) — Omarchy-themed UI component set built on nsh-base with live system theme following, forms, overlays, tables, and charts for Rust and TSX.
  - Install: `nsh add nsh-omarchy` · Kind: `rust-nshm` · Source: `crates.io` · Version: `0.2.0` · Platforms: macOS, Linux, Windows, iOS, Android, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/huacnlee/nsh-omarchy) · [crates.io](https://crates.io/crates/nsh-omarchy) · [Docs / Demo](https://huacnlee.github.io/nsh-omarchy/)
  - Note: Falls back to Tokyo Night (dark) or Flexoki Light when Omarchy theme files are absent.
- [nsh-shadcn](https://nsh-awesome.vercel.app/nshm/nsh-shadcn/) — Rust-backed shadcn/ui new-york-v4 component port drawn with native views across desktop, mobile, and web for both Rust and TSX.
  - Install: `nsh add github:caoxing9/nsh-shadcn` · Kind: `rust-nshm` · Source: `github` · Version: `0.1.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/caoxing9/nsh-shadcn)
  - Note: GitHub-only; not published on crates.io yet.
- [nsh-widgets](https://nsh-awesome.vercel.app/nshm/nsh-widgets/) — Cross-platform home-screen widgets and Live Activities using one shared Widget Tree IR rendered natively via WidgetKit, RemoteViews, Plasma, and GNOME.
  - Install: `nsh add https://github.com/SuperNSH/widgets.git --rev master` · Kind: `hybrid-nshm` · Source: `git` · Version: `0.4.1` · Platforms: iOS, macOS, Android, Linux · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/SuperNSH/widgets) · [crates.io](https://crates.io/crates/nsh-widgets)
  - Note: Use the Git URL `--rev master` on NSH 0.7.1; crates.io 0.4.1 and tag v0.4.1 still pin `nsh: ^0.6`.

### Icons

- [nsh-icon](https://nsh-awesome.vercel.app/nshm/nsh-icon/) — Tree-shaken vector icon renderer (`<Icon>` and `icon()`) paired with five installable icon-set crates (Lucide, Heroicons, Tabler, Phosphor, Remix).
  - Install: `nsh add nsh-icon` · Kind: `rust-nshm` · Source: `crates.io` · Version: `0.2.2` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://github.com/huacnlee/nsh-icon) · [crates.io](https://crates.io/crates/nsh-icon)
  - Note: Install companion icon packs alongside it, e.g. `nsh add nsh-icon-lucide`, `nsh-icon-heroicons`, `nsh-icon-tabler`, `nsh-icon-phosphor`, `nsh-icon-remix`.
- [supernsh-icons](https://nsh-awesome.vercel.app/nshm/supernsh-icons/) — Typed SVG and font-glyph icon library covering 260 Iconify sets (~465,000 icons) with 35 installable companion set crates.
  - Install: `nsh add supernsh-icons` · Kind: `hybrid-nshm` · Source: `crates.io` · Version: `0.2.0` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/SuperNSH/icons) · [crates.io](https://crates.io/crates/supernsh-icons) · [Docs / Demo](https://supernsh.github.io/icons/)
  - Note: Companion crates `supernsh-icons-lucide`, `supernsh-icons-mdi`, `supernsh-icons-ph`, etc. are grouped under this entry rather than listed 35 times.

### Charts, Graphs & GPU Canvas

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

### Data & Analytics

- [nsh-query](https://nsh-awesome.vercel.app/nshm/nsh-query/) — Pure-TSX TanStack Query adapter (`useQuery`, `useMutation`, persistence) wired to NSH app lifecycle, network status, and `Storage`.
  - Install: `nsh add github:Dearest/nsh-query` · Kind: `tsx-nshm` · Source: `github` · Version: `0.1.0` · Platforms: iOS, Android, macOS, Windows, Linux, Web · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/Dearest/nsh-query)
  - Note: Pure TSX nshm (requires no Rust toolchain); GitHub-only.
- [nsmetry](https://nsh-awesome.vercel.app/nshm/nsmetry/) — Privacy-first event analytics client SDK for NSH apps with batching and retries targeting a self-hosted NsMetry Cloudflare Worker.
  - Install: `nsh add nsmetry` · Kind: `hybrid-nshm` · Source: `crates.io` · Version: `0.1.0` · Platforms: macOS, Windows, Linux, Android, iOS, Web · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/huacnlee/nsmetry) · [crates.io](https://crates.io/crates/nsmetry)
  - Note: Monorepo contains both the Cloudflare Worker dashboard app and the root nshm SDK crate.

### Platform Targets

- [nsh-platform-harmonyos](https://nsh-awesome.vercel.app/nshm/nsh-platform-harmonyos/) — Community platform nshm providing `--target harmonyos` to run and package NSH apps natively on HarmonyOS and OpenHarmony with ArkUI.
  - Install: `nsh add github:huacnlee/nsh-platform-harmonyos` · Kind: `platform-nshm` · Source: `github` · Version: `0.1.1` · Platforms: HarmonyOS, OpenHarmony · License: Apache-2.0 · Updated: 2026-11-26 · [Source](https://github.com/huacnlee/nsh-platform-harmonyos) · [crates.io](https://crates.io/crates/nsh-platform-harmonyos)
  - Note: Install via `github:huacnlee/nsh-platform-harmonyos` (`0.1.1`); crates.io `0.1.0` predates `nsh.json` `"platform"` and fails `nsh add`.

## Framework & Official Crates (19)

NOT nshm — cannot be installed with `nsh add`. Core framework, runtime, bundler, and platform backend crates maintained in `longbridge/nsh` (`cargo add` or managed automatically by `nsh`). ([Section hub](https://nsh-awesome.vercel.app/framework/))

### Core Runtime & Tooling

- [nsh-cli](https://crates.io/crates/nsh-cli) — NOT nshm (cannot `nsh add`) — Official `nsh` CLI tool for initializing, checking, running, packaging, and signing apps.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-cli) · [Docs / Demo](https://nsh.dev)
- [nsh-core](https://crates.io/crates/nsh-core) — NOT nshm (cannot `nsh add`) — Platform-independent shadow tree, reactive signals, layout engine, and mount instructions.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-core) · [Docs / Demo](https://nsh.dev)
- [nsh-base](https://crates.io/crates/nsh-base) — NOT nshm (cannot `nsh add`) — Unstyled UI primitives (`nsh/base`) providing focus, navigation, dialogs, editor, and accessibility behavior.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-base) · [Docs / Demo](https://nsh.dev)
- [nsh-engine](https://crates.io/crates/nsh-engine) — NOT nshm (cannot `nsh add`) — Engine thread driving the JS host and `nsh-core` while emitting native mount batches.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-engine) · [Docs / Demo](https://nsh.dev)
- [nsh-macros](https://crates.io/crates/nsh-macros) — NOT nshm (cannot `nsh add`) — Procedural derive macros for NSH Rust components, props, events, and `#[native_module]` exports.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-macros) · [Docs / Demo](https://nsh.dev)
- [nsh-js](https://crates.io/crates/nsh-js) — NOT nshm (cannot `nsh add`) — QuickJS runtime host handling JS evaluation, native bridge op decoding, and bytecode execution.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-js) · [Docs / Demo](https://nsh.dev)
- [nsh-bundler](https://crates.io/crates/nsh-bundler) — NOT nshm (cannot `nsh add`) — Rolldown-based JS/TSX bundler and JSX compiler used by the NSH toolchain.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-bundler) · [Docs / Demo](https://nsh.dev)
- [nsh-testing](https://crates.io/crates/nsh-testing) — NOT nshm (cannot `nsh add`) — Headless testing driver that runs NSH apps without a window for `nsh test` and Rust integration tests.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-testing) · [Docs / Demo](https://nsh.dev)
- [nsh-updater](https://crates.io/crates/nsh-updater) — NOT nshm (cannot `nsh add`) — Self-update client supporting signed update manifests, verification, and binary replacement.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-updater) · [Docs / Demo](https://nsh.dev)
- [nsh-package](https://crates.io/crates/nsh-package) — NOT nshm (cannot `nsh add`) — Signed `.nshpkg` archive format, Ed25519 key hierarchy, revocation lists, and trust store.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-package) · [Docs / Demo](https://nsh.dev)
- [nsh-i18n](https://crates.io/crates/nsh-i18n) — NOT nshm (cannot `nsh add`) — Locale formatting tables and `rust-i18n` translation loader for NSH apps.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-i18n) · [Docs / Demo](https://nsh.dev)

### Official Platform Backends

- [nsh-platform-macos](https://crates.io/crates/nsh-platform-macos) — NOT nshm (cannot `nsh add`) — Official macOS AppKit backend with CoreText rendering, native view mounting, and window hosting.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-macos) · [Docs / Demo](https://nsh.dev/docs/macos)
- [nsh-platform-ios](https://crates.io/crates/nsh-platform-ios) — NOT nshm (cannot `nsh add`) — Official iOS UIKit backend and NativeShell Swift embedding ABI.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: iOS · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-ios) · [Docs / Demo](https://nsh.dev/docs/ios)
- [nsh-platform-android](https://crates.io/crates/nsh-platform-android) — NOT nshm (cannot `nsh add`) — Official Android JNI glue, StaticLayout text measurement, and native animation driver.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Android · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-android) · [Docs / Demo](https://nsh.dev/docs/android)
- [nsh-platform-windows](https://crates.io/crates/nsh-platform-windows) — NOT nshm (cannot `nsh add`) — Official Windows Win32, Direct2D, and DirectWrite native backend.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-windows) · [Docs / Demo](https://nsh.dev/docs/windows)
- [nsh-platform-linux](https://crates.io/crates/nsh-platform-linux) — NOT nshm (cannot `nsh add`) — Official Linux GTK 4 and Pango native widget mounting backend.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-linux) · [Docs / Demo](https://nsh.dev/docs/linux)
- [nsh-platform-web](https://crates.io/crates/nsh-platform-web) — NOT nshm (cannot `nsh add`) — Official WebAssembly DOM rendering backend for deploying NSH apps as static web sites.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-web) · [Docs / Demo](https://nsh.dev/docs/web)
- [nsh-platform-gpui](https://crates.io/crates/nsh-platform-gpui) — NOT nshm (cannot `nsh add`) — Official GPUI rendering backend for embedding NSH surfaces inside GPUI desktop apps.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-gpui) · [Docs / Demo](https://nsh.dev/docs/gpui)
- [nsh-platform-tui](https://crates.io/crates/nsh-platform-tui) — NOT nshm (cannot `nsh add`) — Official terminal UI backend rendering NSH views into a terminal cell grid.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-tui) · [Docs / Demo](https://nsh.dev/docs/platforms)

## Examples & Templates (4)

Starter boilerplates, official examples, showcase catalogs, and production reference applications built with Native Shell. ([Section hub](https://nsh-awesome.vercel.app/templates/))

### Starters & Reference Apps

- [longbridge/nsh Examples](https://github.com/longbridge/nsh/tree/main/examples) — Official NSH example apps covering TSX, Rust-only (`tasks-rs`), mixed `rust-exports`, tray, embedding, and `nsh-extra`.
  - Kind: `examples` · Source: `github` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-26 · [Source](https://github.com/longbridge/nsh/tree/main/examples) · [Docs / Demo](https://nsh.dev/gallery)
- [SuperNSH/starter](https://github.com/SuperNSH/starter) — Production-style NSH 0.7.1 application boilerplate demonstrating navigation, forms, virtualized lists, animations, and signed remote TSX packages.
  - Kind: `template` · Source: `github` · Version: `0.1.0` · Platforms: macOS, iOS, Android, Web · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/SuperNSH/starter)
  - Note: App boilerplate (`publish = false`, `nsh.json` `"root": "App"`), not a library nshm.
- [longbridge/nsh-showcases](https://github.com/longbridge/nsh-showcases) — Official community showcase repository backing `nsh.dev/apps` and `nsh.dev/directory` with app stories and project manifests.
  - Kind: `directory` · Source: `github` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: MIT · Updated: 2026-11-26 · [Source](https://github.com/longbridge/nsh-showcases) · [Docs / Demo](https://nsh.dev/apps)
- [huacnlee/disktree](https://github.com/huacnlee/disktree) — Native disk-space treemap explorer featured in NSH's official `ext/` Rust-in-TSX tutorial.
  - Kind: `reference-app` · Source: `github` · Platforms: macOS, Linux · License: MIT · Updated: 2026-11-25 · [Source](https://github.com/huacnlee/disktree) · [Docs / Demo](https://huacnlee.github.io/disktree/)

## Articles & Tutorials (7)

Official documentation, architecture guides, and module authoring references for Native Shell. ([Section hub](https://nsh-awesome.vercel.app/guides/))

### Documentation & Guides

- [nshm Guide (Official Docs)](https://nsh.dev/docs/nshm) — Authoritative NSH modules specification covering `nsh add`, `nsh.lock`, `nsh-extra`, `ext/` crates, platform nshms, and publishing.
  - Kind: `documentation` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25 · [Source](https://nsh.dev/docs/nshm)
- [Getting Started with Native Shell](https://nsh.dev/docs/getting-started) — Step-by-step walkthrough for creating, running, checking, testing, and packaging your first TSX or Rust NSH application.
  - Kind: `tutorial` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25 · [Source](https://nsh.dev/docs/getting-started)
- [Building with Rust](https://nsh.dev/docs/rust) — Guide to writing Rust-first apps and extending TSX apps with `#[native_module]` crates and generated TypeScript declarations.
  - Kind: `tutorial` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25 · [Source](https://nsh.dev/docs/rust)
- [Platform Extensions Guide](https://nsh.dev/docs/platform-extensions) — Specification for implementing custom target backends as external executables or installable `"platform"` nshms.
  - Kind: `documentation` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25 · [Source](https://nsh.dev/docs/platform-extensions)
- [Project Structure & nsh.json Reference](https://nsh.dev/docs/project-structure) — Complete reference for `nsh.json` manifest keys, `.nsh/types`, asset macros, and module resolution rules.
  - Kind: `documentation` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25 · [Source](https://nsh.dev/docs/project-structure)
- [Comparing Approaches (Electron, Tauri, RN, Flutter, GPUI)](https://nsh.dev/docs/comparison) — Architecture and measured benchmark comparison between Native Shell and Electron, Tauri, React Native, Flutter, GPUI, Qt, and Slint.
  - Kind: `article` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-25 · [Source](https://nsh.dev/docs/comparison)
- [Official NSH Directory](https://nsh.dev/directory) — Official Native Shell community showcase directory listing curated components, libraries, and platforms from `longbridge/nsh-showcases`.
  - Kind: `directory` · Source: `web` · Platforms: All · License: CC-BY-4.0 · Updated: 2026-11-26 · [Source](https://nsh.dev/directory)

## Machine-Readable Feeds

- [index.json](https://nsh-awesome.vercel.app/index.json)
- [count.json](https://nsh-awesome.vercel.app/count.json)
- [llms.txt](https://nsh-awesome.vercel.app/llms.txt)
- [llms-full.txt](https://nsh-awesome.vercel.app/llms-full.txt)
- [ai-catalog.json](https://nsh-awesome.vercel.app/.well-known/ai-catalog.json)
