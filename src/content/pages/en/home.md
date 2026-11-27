---
pageType: home
pageSlug: home
lang: en
title: "Awesome NSH: Native Shell Modules & Crate Directory"
description: Explore 13 verified Native Shell (nshm) packages, 19 core framework crates, starter templates, and official guides with nsh 0.7.1 checks and index.json.
h1: Awesome Native Shell Modules (nshm) & Crate Directory
lead: "Curated catalog and machine-readable index for Native Shell (nsh 0.7.1): verified nshm packages, core runtime crates, starter templates, and official documentation."
updatedAt: 2026-11-27
definitionHeading: What is Native Shell (nsh) and nshm?
securityNotice:
  heading: Supply-Chain & Build Permission Notice
  body: Installing a Rust, hybrid, or platform nshm runs its build.rs build script, procedural macros, and runtime code with your application's full local and runtime permissions. Crates can also contribute OS permissions, Info.plist descriptions, macOS entitlements, and HarmonyOS module entries through [package.metadata.nsh]. Review upstream source repositories and nsh.lock diffs before shipping any dependency.
installSourcesTable:
  heading: Comparing nsh add Installation Sources on nsh 0.7.1
  intro: The nsh 0.7.1 CLI supports three remote package sources alongside local --path checkouts. Each source resolves differently in nsh.lock and reflects how maintainers publish 0.7-compatible releases.
  columns:
    - Source Type
    - CLI Command Form
    - Verified Count
    - Lock Target Shape
    - When Upstream Uses It
  rows:
    - - crates.io
      - nsh add <crate> [--features ...]
      - 7 (+ 40 icon sub-crates)
      - <version> (crates.io)
      - Published releases targeting nsh-core 0.7.x directly on Cargo's registry (nsh-extra, nsh-omarchy, nsh-icon, supernsh-icons, nsh-graph, nsh-o11y, nsmetry).
    - - github:owner/repo
      - nsh add github:<owner>/<repo>
      - "5"
      - git+https://github.com/<owner>/<repo>
      - Modules with publish = false in Cargo.toml (nsh-webgpu, nsh-skia), repos verified on GitHub ahead of or without crates.io adoption (pure-TSX nsh-query; early 0.1.0 nsh-shadcn was verified via GitHub on 2026-11-26 prior to its initial 2026-11-27 crates.io upload), or newer GitHub heads ahead of stale crates.io tags (nsh-platform-harmonyos 0.1.1).
    - - Git URL with --rev
      - nsh add <https-git-url> --rev <branch>
      - "1"
      - git+https://github.com/SuperNSH/widgets.git?rev=master
      - Repositories whose latest crates.io release or version tag still pins nsh ^0.6 while the default branch already targets ^0.7.1 (nsh-widgets on --rev master).
ecosystemStats:
  heading: Empirical Catalog Coverage (Audited on nsh 0.7.1)
  summary: Because nsh 0.7.1 ships without a built-in search or registry listing subcommand, Awesome NSH combines six automated discovery channels (crates.io keyword=nshm, nsh-core reverse dependencies, keyword=nsh/native-shell, longbridge/nsh-showcases, GitHub topic/code search, and GitHub organization enumeration) and tests every installable candidate inside a fresh scratch app.
  metrics:
    - label: Total Catalog Entries
      value: "43"
      detail: 13 installable nshm, 19 framework crates, 4 templates, 7 guides
    - label: crates.io Crates Inspected
      value: "119"
      detail: 7 clean 0.7.1 nshm + 40 icon sub-crates + 3 data crates + 18 normalized 0.6 bypasses + 19 official crates + helpers
    - label: GitHub Repos Inspected
      value: "89"
      detail: 6 additional clean 0.7.1 GitHub/Git nshm, 3 incompatible 0.6/=0.7.0 modules, app boilerplates, and non-nshm tools
    - label: Machine-Readable Endpoints
      value: index.json / count.json
      detail: Single source of truth generated from data/entries.json
faqs:
  heading: Frequently Asked Questions About Native Shell & nshm
  items:
    - question: How do built-in nsh/* modules, installable nshm packages, and official framework crates differ?
      answer: 'Built-in runtime modules imported from "nsh" ship directly inside the Native Shell engine and require no installation. Installable nshm modules are third-party or optional first-party packages added to nsh.json and nsh.lock with nsh add. Official framework crates like nsh-core, nsh-base, and nsh-platform-macos live inside longbridge/nsh, lack #[native_module] or nsh.json exports, and cannot be added with nsh add—either nsh manages them automatically or Rust applications depend on them via cargo add.'
    - question: Why does nsh 0.7.1 not provide a built-in nsh search command?
      answer: "In nsh 0.7.1, the CLI focuses on explicit package coordinates: crate names on crates.io, github:owner/repo shorthands, Git URLs with optional --rev/--tag/--branch flags, and local --path directories. There is no central package registry index built into the CLI, which is why Awesome NSH runs six-channel discovery and publishes both human pages and index.json."
    - question: Why do 6 of the 13 verified nshm packages install from GitHub or a Git URL instead of crates.io?
      answer: 'Several fast-moving 0.7 packages remain pinned to GitHub or Git URLs in this catalog: nsh-webgpu and nsh-skia explicitly set publish = false in Cargo.toml, pure-TSX nsh-query has no Cargo.toml, early-stage 0.1.0 nsh-shadcn was verified via github:caoxing9/nsh-shadcn on 2026-11-26 prior to its initial 2026-11-27 crates.io upload, nsh-platform-harmonyos 0.1.0 on crates.io predated the "platform" manifest field required by nsh add (fixed in GitHub 0.1.1), and nsh-widgets 0.4.1 on crates.io and tag v0.4.1 still pins nsh: ^0.6 while its master branch updates to ^0.7.1.'
    - question: Do all nshm packages require a Rust toolchain during app builds?
      answer: No—only packages backed by Rust crates (rust-nshm, hybrid-nshm, and platform-nshm) require Cargo and rustc when building native hosts, plus wasm32-unknown-unknown (and sometimes LLVM clang/llvm-ar) for web builds. Pure TSX packages such as nsh-query have no Cargo.toml and ship TypeScript source bundled directly by nsh.
    - question: What does Awesome NSH verification test—and what does it not test?
      answer: Automated CI runs `nsh add ...` for every installable entry inside a clean scratch nsh.json app on nsh 0.7.1, confirming manifest resolution and nsh.lock generation. It does NOT compile native binaries across physical iOS, Android, macOS, Windows, Linux, or HarmonyOS hardware, nor does it run upstream runtime UI test suites.
navigationHighlights:
  heading: Explore Directory Sections & Methodology Pillars
  items:
    - path: /nshm/
      title: Installable nshm Catalog (13)
      summary: Side-by-side comparison of verified UI kits, icon sets, canvas visualizations, telemetry adapters, and HarmonyOS support.
    - path: /framework/
      title: Framework & Platform Crates (19)
      summary: Reference for all 11 core runtime/tooling crates and 8 official backends maintained in longbridge/nsh.
    - path: /templates/
      title: Starter Templates & Reference Apps (4)
      summary: Official examples, SuperNSH/starter boilerplate, nsh-showcases, and huacnlee/disktree.
    - path: /guides/
      title: Official Documentation Tracks (7)
      summary: "Structured reading path across nsh.dev guides, #[native_module] tutorials, and framework benchmarks."
    - path: /discovery/
      title: nshm Discovery Methodology
      summary: Four valid manifest types, the Cargo 0.6 normalization parser quirk, channel hit counts, and full exclusion ledger.
    - path: /about/
      title: About, Verification Scope & Safety
      summary: Maintainer AkaraChen, automated verification scripts, security boundaries, and pull-request workflow.
---

Native Shell (nsh) is a Rust-first cross-platform framework where apps built in TSX or Rust render through native platform backends across desktop, mobile, GPUI, terminal, and web. Installable extensions, called nshm modules, plug into apps via nsh add. Awesome NSH curates verified nsh 0.7.1 packages, core crates, templates, and docs with index.json.
