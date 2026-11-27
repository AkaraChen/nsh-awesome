---
pageType: section
pageSlug: templates
entriesSection: templates
lang: en
title: Native Shell Starter Templates & Reference Apps
description: Evaluate official longbridge/nsh examples, SuperNSH/starter, huacnlee/disktree, and nsh-showcases when bootstrapping TSX, Rust, or mixed ext/ projects.
h1: Native Shell Starter Templates, Examples & Reference Apps
lead: "Curated starting points for Native Shell (`nsh 0.7.1`): official multi-mode examples, a production-style boilerplate, a mixed `ext/` Rust+TSX reference app, and the community showcase registry."
updatedAt: 2026-11-26
technicalCallout:
  heading: App Boilerplate vs Installable `nshm` Manifest Signatures
  body: 'An installable library declares `"exports"` (for `tsx-nshm` or `hybrid-nshm`) or `"platform"` (for `platform-nshm`) in `nsh.json` without claiming an application `"id"` or `"root"` component. By contrast, application templates carry `"entry"` or `"root"` keys (`"root": "App"` in `SuperNSH/starter`), bundle identifiers, and app-local `ext/` Rust crates compiled inside the project itself rather than locked via `nsh.lock`.'
comparisonTable:
  heading: Comparing the 4 Curated Templates, Examples & Showcases
  intro: Choose the repository whose architecture matches how you structure TSX views, pure Rust UI (`tasks-rs`), or local `ext/` Rust modules across macOS, iOS, Android, Windows, Linux, and Web.
  columns:
    - Repository
    - Type
    - NSH Target
    - Platforms Listed
    - What You Learn From It
  rows:
    - - longbridge/nsh Examples
      - Official examples
      - 0.7.1
      - macOS, iOS, Android, Windows, Linux, Web
      - Canonical TSX apps, Rust-only (`tasks-rs`), mixed `rust-exports`, system tray, host embedding, and `nsh-extra` usage (Apache-2.0, Gallery at `nsh.dev/gallery`).
    - - SuperNSH/starter
      - Template
      - 0.7.1
      - macOS, iOS, Android, Web
      - 'Production-style navigation, forms, virtualized lists, animations, and loading signed remote TSX packages (`0.1.0`, MIT, `nsh.json` `"root": "App"`).'
    - - huacnlee/disktree
      - Reference app
      - 0.7.x
      - macOS, Linux
      - Native disk-space treemap explorer featured in NSH's official `ext/` Rust-in-TSX tutorial (MIT, docs at `huacnlee.github.io/disktree/`).
    - - longbridge/nsh-showcases
      - Directory
      - 0.7.x
      - macOS, iOS, Android, Windows, Linux, Web
      - Official manifest repository (`directory/*/manifest.json`) backing `nsh.dev/apps` and `nsh.dev/directory` with app stories and curated submissions (MIT).
selectionAdvice:
  heading: Picking the Right Starting Point for Your Project
  items:
    - title: "Learning core Native Shell idioms: start with `longbridge/nsh Examples`"
      body: Because official examples live directly inside `longbridge/nsh/examples` at `0.7.1`, every pattern—from pure Rust `tasks-rs` to mixed `rust-exports`, tray menus, host embedding, and `nsh-extra` integration—stays synchronized with the `0.7.1` CLI release and `nsh.dev/gallery`.
    - title: "Bootstrapping a multi-screen TSX app: inspect `SuperNSH/starter`"
      body: "`SuperNSH/starter` (`0.1.0`) targets `nsh 0.7.1` across `macOS`, `iOS`, `Android`, and `Web`, showing how multi-screen navigation, form inputs, virtualized lists, native animations, and signed `.nshpkg` remote TSX packages fit together cleanly."
    - title: "Adding app-specific Rust code without publishing an `nshm`: study `huacnlee/disktree`"
      body: Not every Rust helper belongs on `crates.io`. `huacnlee/disktree` (`macOS`, `Linux`) pairs a responsive TSX treemap interface with a fast local Rust disk scanner via `ext/`, serving as the official reference for mixed app projects.
    - title: "Exploring shipped apps and official submissions: browse `longbridge/nsh-showcases`"
      body: Reviewing `longbridge/nsh-showcases` reveals how `nsh.dev/apps` and `nsh.dev/directory` structure project metadata (`directory/*/manifest.json`), complementing Awesome NSH's `13` verified `0.7.1` installable packages.
relatedLinks:
  - path: /guides/
    label: Follow the `Getting Started` and `Building with Rust` docs
    reason: Pair template code with official explanations of `nsh.json`, `ext/`, and `.nsh/types`.
  - path: /nshm/
    label: Add verified `nshm` modules to your starter
    reason: Drop `nsh-omarchy`, `nsh-icon`, or `nsh-query` into a freshly cloned project.
  - path: /discovery/
    label: See why apps like `SuperNSH/starter` are curated out of `/nshm/`
    reason: Read the empirical distinction between `nsh.json` `"exports"` and `"root"`/`"id"`.
---

End-user Native Shell applications built in mixed Rust and TypeScript TSX mode look remarkably similar to Rust `nshm` crates on disk because their `src/lib.rs` also exports `#[native_module("...")]` symbols. However, inspection on `nsh 0.7.1` confirms that repositories such as `SuperNSH/starter`, `huacnlee/spotish`, and `ryujane/Ferrix` configure `publish = false` in `Cargo.toml` and declare `"root"` or `"id"` in `nsh.json` instead of `"exports"`—meaning they are complete applications to clone and adapt rather than libraries to add with `nsh add`.

Awesome NSH isolates these `4` starter, example, reference-app, and showcase repositories (`longbridge/nsh Examples`, `SuperNSH/starter`, `longbridge/nsh-showcases`, and `huacnlee/disktree`) into a dedicated hub so newcomers can bootstrap desktop, mobile, or Web projects without mistaking full app templates for installable `nshm` dependencies.
