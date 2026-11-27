---
pageType: section
pageSlug: framework
entriesSection: framework
lang: en
title: Native Shell Framework Crates (Not nshm) Reference
description: Review all 19 official longbridge/nsh runtime, macro, bundler, and platform backend crates—and why cargo add or the CLI links them instead of nsh add.
h1: Framework & Official Crates (Not nshm)
lead: Reference index of all 19 official crates maintained inside `longbridge/nsh` at version `0.7.1`—explaining their architectural roles across Apple, Android, Windows, Linux, Web, GPUI, and TUI targets and why none install via `nsh add`.
updatedAt: 2026-11-25
technicalCallout:
  heading: Why `nsh add` Rejects All 19 Official Framework Crates
  body: Inside `crates/nsh-cli/src/nshm/manifest.rs`, `Manifest::read` accepts a package only when it provides a Rust `[lib]` exporting `#[native_module("<specifier>")]`, a `Cargo.toml`-free `nsh.json` with `"exports"`, or a `nsh.json` declaring `"platform"` alongside a `nsh-platform-<target>` binary. Core libraries such as `nsh-core` (`0.7.1`) and `nsh-base` (`0.7.1`) supply Rust traits, reactive signals, layout shadow trees, and unstyled UI behavior instead of JS/TSX module bridges, while the `8` official platform backends compile directly through the CLI host pipeline rather than external `"platform"` manifests like `nsh-platform-harmonyos`.
comparisonTable:
  heading: "Architectural Split: 11 Core Crates vs 8 Official Platform Backends"
  intro: The `19` official `0.7.1` crates divide into `11` Core Runtime & Tooling crates (`macOS`, `Linux`, `Windows`, plus cross-target libraries) and `8` Official Platform Backends.
  columns:
    - Group
    - Crates (0.7.1)
    - Primary Responsibility
    - How Apps Use Them
  rows:
    - - CLI, Bundler & Testing (3)
      - nsh-cli, nsh-bundler, nsh-testing
      - Official `nsh` CLI (`init`, `check`, `run`, `package`, `sign`), Rolldown Bundler & JSX compiler, and headless windowless driver for `nsh test`.
      - Installed via the `nsh` binary (`0.7.1`) or referenced automatically during `nsh test` and Rust integration tests.
    - - Core UI, Macros & QuickJS Engine (5)
      - nsh-core, nsh-base, nsh-engine, nsh-macros, nsh-js
      - Shadow tree, reactive signals, layout engine (`nsh-core`), unstyled `nsh/base` primitives (`nsh-base`), Engine thread mount batches, `#[native_module]` procedural macros, and QuickJS Runtime host.
      - Managed automatically by `nsh 0.7.1` builds or added to Rust `[dependencies]` via `cargo add`.
    - - Packaging, Updater & Localization (3)
      - nsh-package, nsh-updater, nsh-i18n
      - Signed `.nshpkg` archive format with Ed25519 key hierarchy and trust store, signed self-update client, and `rust-i18n` locale tables.
      - Linked into packaged apps (`macOS`, `Windows`, `Linux`, mobile, Web) or imported in Rust.
    - - Apple, Android, Windows & Linux Backends (5)
      - nsh-platform-macos, nsh-platform-ios, nsh-platform-android, nsh-platform-windows, nsh-platform-linux
      - Apple AppKit with CoreText, Apple UIKit with Swift embedding ABI, Android JNI with StaticLayout, Windows Win32 with Direct2D and DirectWrite, and Linux GTK 4 with Pango.
      - Selected automatically via `nsh run --target <os>` or `nsh package --target <os>`.
    - - Web, GPUI & Terminal Backends (3)
      - nsh-platform-web, nsh-platform-gpui, nsh-platform-tui
      - WebAssembly DOM rendering for static sites (`Web`), embedding Native Shell views inside GPUI desktop apps, and terminal cell-grid TUI rendering.
      - Activated via `--target web`, GPUI desktop embedding, or terminal host targets.
selectionAdvice:
  heading: Common Misconceptions When Reading crates.io Search Results
  items:
    - title: Do not confuse `nsh-base` (0.7.1) with an installable UI theme
      body: "`nsh-base` supplies unstyled focus, keyboard navigation, dialogs, code editor, and accessibility primitives (`nsh/base`) consumed by UI libraries like `nsh-omarchy` and `nsh-shadcn`, plus Cargo features (`plot`, `editor`, `term`, `math`). TSX apps access `nsh/base` directly from the framework rather than `nsh add nsh-base`."
    - title: Official platform crates vs community `"platform"` nshms
      body: All `8` official `nsh-platform-*` crates (`macos`, `ios`, `android`, `windows`, `linux`, `web`, `gpui`, `tui`) ship inside `longbridge/nsh`. Only external targets built on Native Shell extension points—such as `nsh-platform-harmonyos` (`0.1.1`)—declare `"platform"` in `nsh.json` and install via `nsh add`.
    - title: Why `nsh-extra` (0.7.1) lives in `/nshm/` instead of `/framework/`
      body: Even though `nsh-extra` lives inside `longbridge/nsh` alongside these `19` crates, `crates/nsh-extra/src/lib.rs` explicitly defines `#[native_module("nsh-extra")]` so apps opt into `camera`, `location`, `photos`, `push`, and `speech` via `nsh add nsh-extra --features ...`.
relatedLinks:
  - path: /nshm/
    label: Browse the 13 modules that DO work with `nsh add`
    reason: Return to installable extensions such as `nsh-extra`, `nsh-omarchy`, and `nsh-platform-harmonyos`.
  - path: /discovery/
    label: See how `discover.mjs` separates framework crates from nshms
    reason: Inspect reverse-dependency counts (`107` total, `18` `nsh-core`-dependent framework crates).
  - path: /guides/
    label: Read `Building with Rust` & `Platform Extensions` docs
    reason: Official `nsh.dev` specifications explaining `nsh-core` and custom platform architecture.
---

Developers auditing `nsh-core` reverse dependencies on `crates.io` (`107` raw crates returned, `18` official framework crates) frequently mistake the `19` official `longbridge/nsh` crates for installable `nshm` modules. Every crate listed in this section is strictly **not** an `nshm`: running `nsh add nsh-core` or `nsh add nsh-base` fails immediately on `nsh 0.7.1` with `no #[native_module("...")] at the crate's root`.

In Native Shell `0.7.1`, the `nsh` CLI automatically manages and links these `19` Apache-2.0 crates when building host targets for TypeScript TSX or Rust applications. Rust-first applications and `nshm` library authors declare crates such as `nsh-core`, `nsh-base`, `nsh-i18n`, or `nsh-testing` directly in `Cargo.toml` via Cargo (`cargo add nsh-core`) rather than inside `nsh.json` dependencies.
