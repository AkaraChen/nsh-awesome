---
pageType: section
pageSlug: guides
entriesSection: articles
lang: en
title: Native Shell Documentation & Authoring Guides
description: "Follow official nsh.dev tutorials on Getting Started, nsh.json manifests, Rust #[native_module] exports, custom platform targets, and framework trade-offs."
h1: Native Shell Documentation, Tutorials & Architecture Guides
lead: Seven official `nsh.dev` specifications and guides organized into three practical learning tracks—from creating your first TSX or Rust app to authoring `nshm` crates, custom platforms, and framework comparisons.
updatedAt: 2026-11-26
technicalCallout:
  heading: How Official `nsh.dev` Docs and Awesome NSH Complement Each Other
  body: "`nsh.dev/docs/*` (CC-BY-4.0) documents the core runtime, `nsh.json` schema, and `#[native_module]` macro conventions, while `nsh.dev/directory` highlights `10` curated manifests submitted via `longbridge/nsh-showcases`. Awesome NSH bridges the discovery gap by testing all `nshm` candidates empirically on `nsh 0.7.1`, isolating the `19` non-installable official framework crates (`NOT nshm`), documenting why `6` verified packages require GitHub or Git `--rev` coordinates, and publishing `index.json` for automated tooling."
comparisonTable:
  heading: Structured Reading Roadmap Across All 7 Official Docs
  intro: Follow the track aligned with your current milestone—onboarding on `0.7.1`, extending apps with Rust or platform binaries, or comparing Native Shell against Electron, Tauri, React Native, Flutter, GPUI, Qt, and Slint.
  columns:
    - Track
    - Guide Entry
    - Key Topics Covered
    - Audience
  rows:
    - - "Track 1: Foundations"
      - Getting Started with Native Shell
      - Creating, running, type-checking (`nsh check`), headless testing (`nsh test`), and packaging your first TSX or Rust application.
      - Newcomers
    - - "Track 1: Foundations"
      - Project Structure & nsh.json Reference
      - All `nsh.json` manifest keys, `.nsh/types` declaration generation, asset macros, and local vs remote module resolution rules.
      - App developers
    - - "Track 2: Extending NSH"
      - nshm Guide (Official Docs)
      - '`nsh add`, `nsh.lock`, official `nsh-extra` Cargo features, local `ext/` crates, `"platform"` nshms, and crates.io publishing rules.'
      - App & module authors
    - - "Track 2: Extending NSH"
      - Building with Rust
      - Writing Rust-first UI components and extending TSX apps via `#[native_module]` crates with generated TypeScript `.d.ts` declarations.
      - Rust & hybrid authors
    - - "Track 2: Extending NSH"
      - Platform Extensions Guide
      - Implementing custom target backends as external executables or installable `"platform"` nshm packages outside `longbridge/nsh`.
      - Backend authors
    - - "Track 3: Evaluation"
      - Comparing Approaches
      - Architecture and measured benchmark trade-offs vs Electron, Tauri, React Native, Flutter, GPUI, Qt, and Slint.
      - Tech leads & evaluators
    - - "Track 3: Evaluation"
      - Official NSH Directory
      - Official community showcase directory rendering curated components, libraries, and platforms from `longbridge/nsh-showcases`.
      - All NSH users
selectionAdvice:
  heading: Connecting Documentation Tracks to Verified Directory Pages
  items:
    - title: Before publishing a new `nshm`, cross-check the `nshm Guide` with `/discovery/`
      body: "Read `nsh.dev/docs/nshm` for official publishing conventions, then inspect Awesome NSH's Discovery page to avoid real-world traps verified in `nsh-cli 0.7.1`: Cargo virtual workspace roots failing with missing `[package] name`, omitted `\"exports\"` in `nsh.json`, or `0.6`-era `Cargo.toml` dependencies slipping past `cargo publish` table normalization."
    - title: Before building a custom target backend, inspect `nsh-platform-harmonyos`
      body: 'Pair the official `Platform Extensions Guide` with the live `nsh-platform-harmonyos` (`0.1.1`) entry on GitHub to see how `"platform": "harmonyos"` in `nsh.json`, binary target `[[bin]] nsh-platform-harmonyos`, and `[package.metadata.nsh.harmonyos]` permissions/HAR merging operate end to end.'
    - title: Evaluating Native Shell for production? Combine `Comparing Approaches` with `/about/`
      body: Use `nsh.dev/docs/comparison` for framework benchmarks, then review Awesome NSH's `/nshm/` catalog (`13` verified `0.7.1` modules) and `/about/` security and verification-boundary disclosures before adopting third-party crates.
relatedLinks:
  - path: /discovery/
    label: Read Awesome NSH empirical `nsh 0.7.1` discovery findings
    reason: Inspect concrete manifest rules verified directly against `crates/nsh-cli/src/nshm/manifest.rs`.
  - path: /templates/
    label: Jump to `longbridge/nsh Examples` and `SuperNSH/starter`
    reason: Run working reference code alongside the `Getting Started` and `Building with Rust` tutorials.
  - path: /nshm/
    label: Explore all 13 verified `nshm` modules
    reason: See live `nsh.json` and `#[native_module]` patterns across published ecosystem packages.
---

Official documentation hosted on `nsh.dev` defines the authoritative API contracts for `nsh 0.7.1`, while Awesome NSH complements those specs with automated six-channel discovery across `crates.io` (`119` crates) and `GitHub` (`89` repos), clean scratch-app `nsh add` install verification, and side-by-side trade-off notes across community modules.

Rather than presenting seven external links in flat alphabetical order, this hub organizes them into three sequential tracks matching how developers adopt Native Shell: project setup and `nsh.json` anatomy first, then `nshm` and Rust `#[native_module]` extension authoring, and finally framework architecture comparisons alongside the official `longbridge/nsh-showcases` directory.
