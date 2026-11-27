---
pageType: discovery
pageSlug: discovery
lang: en
title: How Native Shell nshm Discovery & Verification Work
description: "Empirical results from auditing 119 crates.io crates and 89 GitHub repos on NSH 0.7.1: four manifest kinds, the Cargo 0.6 quirk, and rejection logs."
h1: How nshm Modules Are Defined, Discovered & Verified on nsh 0.7.1
lead: "Empirical methodology behind Awesome NSH: exact manifest rules from longbridge/nsh source code, the Cargo 0.6 table-normalization parser quirk, hit counts across six discovery channels, and full acceptance/exclusion ledgers."
datePublished: 2026-11-26
updatedAt: 2026-11-27
manifestRules:
  heading: 1. Four Structural Manifest Kinds Accepted by nsh add
  intro: "An installable `nshm` must satisfy both structural manifest criteria AND NSH semver compatibility (`check_nsh`) against the installed CLI version (`0.7.1`):"
  columns:
    - Kind
    - Manifest Files Required
    - Structural Entry Criterion
    - NSH Version Check (check_nsh)
  rows:
    - - Rust nshm
      - Cargo.toml ([package])
      - '#[native_module("<specifier>")] attribute on a line in [lib] path (defaults to src/lib.rs)'
      - Checks nsh-core in [dependencies] (or [workspace.dependencies] via nsh-core.workspace = true) and optional nsh.json "nsh"
    - - TSX nshm
      - nsh.json (no Cargo.toml)
      - '"name", semver "version", and non-empty "exports" mapping <name> or <name>/* to existing TSX/TS files'
      - Checks optional "nsh" semver requirement
    - - Hybrid nshm (Rust + TSX)
      - Cargo.toml + nsh.json
      - '#[native_module("<specifier>")] in Rust crate + "exports" in nsh.json (matching [package] name & version if repeated; export specifiers must not collide with the Rust module specifier)'
      - Checks both Cargo.toml nsh-core and nsh.json "nsh"
    - - Platform nshm
      - Cargo.toml + nsh.json
      - 'nsh.json declares "platform": "<target>" + crate builds binary nsh-platform-<target> (#[native_module] optional)'
      - Checks Cargo.toml nsh-core and nsh.json "nsh"
  nuances:
    - An app's `nsh.json` is ignored when `Cargo.toml` is present unless `nsh.json` declares `"exports"` or `"platform"`.
    - A `Cargo.toml` virtual workspace root fails `nsh add` with `Cargo.toml has no [package] name` (observed directly on `github:SuperNSH/biometrics`). Multi-crate repositories must publish sub-crates to crates.io or place the nshm `[package]` at the repo root (`SuperNSH/webgpu`, `SuperNSH/skia`, `SuperNSH/widgets`, `SuperNSH/icons`).
    - End-user NSH apps in mixed Rust+TSX mode (`huacnlee/spotish`, `ryujane/Ferrix`, `SuperNSH/starter`) look structurally similar because they also write `#[native_module("...")]` in `src/lib.rs`, yet set `publish = false` and `"root"`/`"id"` instead of `"exports"` in `nsh.json`—so curation must separate them into templates or apps.
cargoPublishQuirk:
  heading: 2. The Cargo Publish Normalization Parser Quirk in nsh-cli 0.7.1
  explanation: When `cargo publish` packages a crate tarball, Cargo rewrites inline `[dependencies] nsh-core = "0.6.0"` into a TOML sub-table (`[dependencies.nsh-core] version = "0.6.0"`). Because `manifest.rs::nsh_core_requirement` in `nsh-cli 0.7.1` only scans the `[dependencies]` and `[workspace.dependencies]` tables, it sees `None` for normalized `nsh-core` entries. Consequently, 18 crates.io packages pinned to `nsh-core 0.6` / `0.6.0` (17 `SuperNSH/*` `0.1.0`/`0.0.1` crates plus `nsh-platform-miniprogram@0.1.0`) pass `nsh add` on `nsh 0.7.1` purely due to parser omission, whereas identical GitHub checkouts with un-normalized `[dependencies] nsh-core = "0.6"` are rejected by `check_nsh`. Awesome NSH treats those 18 crates as targeting NSH 0.6 until updated to 0.7 on crates.io.
  snippet: |-
    [dependencies.nsh-core]
    version = "0.6.0"
channelsTable:
  heading: 3. Six Discovery Channels & Empirical Hit Counts
  intro: Running `node scripts/discover.mjs` across all six channels inspected 119 unique crates.io crates and 89 unique GitHub repositories, surfacing 7 clean `0.7.1` crates.io nshms (plus 40 icon-set sub-crates and 3 internal data crates), 6 clean `0.7.1` GitHub/Git nshms, 18 normalized `0.6` crates, and 3 explicitly `0.6`/`=0.7.0` incompatible GitHub nshms.
  columns:
    - Channel
    - Query
    - Raw Hits
    - NSH-Relevant Hits
    - Key Observations
  rows:
    - - 1. crates.io keyword=nshm
      - crates?keyword=nshm
      - "68"
      - "68"
      - High signal, but includes 35 supernsh-icons-* + 5 nsh-icon-* companion crates, 17 0.6-pinned SuperNSH/* crates, 3 non-nshm helpers (nsh-frameworks, nsh-native-deps, nsh-maven), and nsh-widgets (0.6 on crates.io).
    - - 2. crates.io reverse_dependencies
      - crates/nsh-core/reverse_dependencies
      - "107"
      - "104"
      - Catches 18 nsh-core-dependent framework crates, untagged nshms (nsh-platform-harmonyos, nsh-platform-miniprogram lacked nshm keyword in 0.1.0), nsh-ext*, nsh-auth*, nsh-firebase-*, and 3 unrelated crates (bamboo-tui, json-schema-editor, nsh-ui-mobile).
    - - 3. crates.io keyword=nsh & native-shell
      - crates?keyword=nsh, native-shell
      - 95 + 1
      - 94 + 1
      - Surfaces nsh-auth, nsh-form, nsh-query (SuperNSH), nsh-http, nsh-firebase-*, maplibre-nsh—mostly plain Cargo libraries or helpers rather than nshms.
    - - 4. longbridge/nsh-showcases
      - directory/*/manifest.json
      - "10"
      - "10"
      - "Official curated directory powering nsh.dev/directory: 6 installable (nsh-graph, nsh-o11y, nsh-omarchy, nsh-icon, nsh-platform-harmonyos via GitHub, nsh-platform-miniprogram for 0.6) and 4 non-nshm CLI/library repos (shadcn-nsh, hero-nsh, a2ui-nsh, native-shell-with-ns)."
    - - 5a. GitHub Repo Topic Search
      - topic:nshm, topic:nsh, topic:native-shell
      - 1 + 57 + 7
      - 0 + 34 + 7
      - topic:nshm returned only 1 unrelated seismic repo; topic:nsh surfaced caoxing9/nsh-shadcn, Dearest/nsh-query, and NSH apps; topic:native-shell returned mostly apps.
    - - 5b. GitHub Code Search
      - filename:nsh.json "exports", "platform", Cargo.toml "nshm"
      - 19 + 56 + 29
      - 7 + 6 + 21
      - "Requires exact filename filtering to avoid xonsh.json noise. Critical gap: GitHub Code Search returned 0 results for newly created org:SuperNSH!"
    - - 6. GitHub Org Enumeration
      - orgs/<owner>/repos (SuperNSH, JetSquirrel, huacnlee, honsunrise)
      - 31 (SuperNSH)
      - "31"
      - Uncovered SuperNSH/webgpu, SuperNSH/skia, and SuperNSH/widgets (master), all missed completely by GitHub Code and Topic Search.
acceptedTable:
  heading: "4. Accepted: 13 Cleanly Verified Entries on nsh 0.7.1"
  intro: "Each entry below succeeded in an isolated scratch app running `nsh 0.7.1 (f78eace)` and produced a valid `nsh.lock` entry:"
  columns:
    - Package
    - Source
    - Verified Command
    - Resolved Lock Target
  rows:
    - - nsh-extra
      - crates.io
      - nsh add nsh-extra --features camera
      - 0.7.1 (crates.io)
    - - nsh-omarchy
      - crates.io
      - nsh add nsh-omarchy
      - 0.2.0 (crates.io)
    - - nsh-icon (+ 5 packs)
      - crates.io
      - nsh add nsh-icon
      - 0.2.2 (crates.io)
    - - supernsh-icons (+ 35 packs)
      - crates.io
      - nsh add supernsh-icons
      - 0.2.0 (crates.io)
    - - nsh-graph
      - crates.io
      - nsh add nsh-graph
      - 0.3.0 (crates.io)
    - - nsh-o11y
      - crates.io
      - nsh add nsh-o11y
      - 0.1.0 (crates.io)
    - - nsmetry
      - crates.io
      - nsh add nsmetry
      - 0.1.0 (crates.io)
    - - nsh-query
      - GitHub (github:)
      - nsh add github:Dearest/nsh-query
      - 0.1.0 (git+https://github.com/Dearest/nsh-query)
    - - nsh-shadcn
      - GitHub (github:)
      - nsh add github:caoxing9/nsh-shadcn
      - 0.1.0 (git+https://github.com/caoxing9/nsh-shadcn)
    - - nsh-platform-harmonyos
      - GitHub (github:)
      - nsh add github:huacnlee/nsh-platform-harmonyos
      - 0.1.1 (git+https://github.com/huacnlee/nsh-platform-harmonyos)
    - - nsh-webgpu
      - GitHub (github:)
      - nsh add github:SuperNSH/webgpu
      - 0.1.0 (git+https://github.com/SuperNSH/webgpu)
    - - nsh-skia
      - GitHub (github:)
      - nsh add github:SuperNSH/skia
      - 0.1.0 (git+https://github.com/SuperNSH/skia)
    - - nsh-widgets
      - Git URL (--rev)
      - nsh add https://github.com/SuperNSH/widgets.git --rev master
      - 0.4.1 (git+https://github.com/SuperNSH/widgets.git?rev=master)
exclusionsTable:
  heading: 5. Rejected, Excluded & Deferred Candidates (Observed Reasons)
  intro: "Rather than silently dropping failing packages or generating doorway stubs for them, Awesome NSH records every exclusion and the exact error observed on `nsh 0.7.1`:"
  columns:
    - Candidate
    - Observed Behavior / Error on nsh 0.7.1
    - Disposition
  rows:
    - - github:AkaraChen/nsh-gpu-lexer
      - "Fails nsh 0.7.1: Cargo.toml: nsh-core requires nsh 0.6; this is nsh 0.7.1 (passes on 0.6.0-nightly)."
      - Deferred until updated to NSH 0.7
    - - nsh-directories
      - In active development (no published crate or public GitHub repo at audit time).
      - Not yet available
    - - nsh-platform-harmonyos (crates.io 0.1.0)
      - "Fails: no #[native_module(\"...\")] at the crate's root: is this an nshm? (lacks \"platform\" in 0.1.0)."
      - Listed via github:huacnlee/nsh-platform-harmonyos (0.1.1)
    - - nsh-widgets (crates.io 0.4.1 / tag v0.4.1)
      - 'Fails: nsh-widgets: nsh.json: "nsh" requires nsh ^0.6; this is nsh 0.7.1.'
      - Listed via https://github.com/SuperNSH/widgets.git --rev master
    - - github:honsunrise/nsh-ext (crates.io 0.6.0 / GitHub 0.7.0)
      - "Fails 0.7.1: Cargo.toml: nsh-core requires nsh =0.7.0; this is nsh 0.7.1; crates.io 0.6.0 lacks #[native_module]."
      - Rejected (strict =0.7.0 pin)
    - - 17 SuperNSH/* crates (nsh-biometrics, nsh-camera, etc.) & nsh-platform-miniprogram@0.1.0
      - crates.io tarballs pin nsh-core 0.6 / 0.6.0 (only pass via normalized [dependencies.nsh-core] quirk; github:SuperNSH/biometrics fails with no [package] name).
      - Deferred until 0.7 crates publish
    - - nsh-core & 18 other official framework crates
      - "Fail nsh add: no #[native_module(\"...\")] at the crate's root."
      - Listed in /framework/ (non-installable)
    - - nsh-native-deps, nsh-frameworks, nsh-maven, nsh-widgets-cli, nsh-firebase-*, nsh-http, nsh-auth, nsh-form, nsh-query (SuperNSH), nsh-bluetooth, nsh-wake-lock, maplibre-nsh
      - 'Fail nsh add: ordinary Rust crates or CLIs without #[native_module] or nsh.json "exports".'
      - Rejected (not-nshm)
    - - github:aningdev/shadcn-nsh, github:c-w-xiaohei/hero-nsh, github:yerlytech/a2ui-nsh, native-shell-with-ns
      - 'Fail nsh add: not an nshm (neither nsh.json nor Cargo.toml, or nsh.json has no "exports" in a2ui-nsh).'
      - Rejected (not nsh add modules)
    - - github:SuperNSH/starter, huacnlee/spotish, ryujane/Ferrix
      - End-user apps / boilerplates (publish = false, nsh.json "root"/"id") rather than reusable libraries.
      - SuperNSH/starter placed in /templates/
    - - 40 icon-set sub-crates (nsh-icon-*, supernsh-icons-*) + 3 supernsh-icons-data-*
      - Companion sub-crates under nsh-icon (5) and supernsh-icons (35) plus internal gallery data crates.
      - Grouped inside parent module pages
relatedLinks:
  - path: /nshm/
    label: Explore the 13 Accepted Installable nshm Modules
    reason: Inspect detailed pages and installation instructions for each verified package.
  - path: /framework/
    label: Review the 19 Non-Installable Framework Crates
    reason: Understand why `nsh-core` and official backends belong in `Cargo.toml`, not `nsh add`.
  - path: /about/
    label: Read Verification Scope & Security Disclosure
    reason: See who runs Awesome NSH, how CI automates these checks, and what remains outside scope.
---

Inspection of `crates/nsh-cli/src/nshm/manifest.rs` (`Manifest::read`), `crates/nsh-cli/src/rust_app.rs` (`specifier_of`), official `nsh.dev/docs/nshm` specs, and live `nsh add` executions in clean scratch apps against `nsh 0.7.1 (f78eace)` shows that crates.io keywords (`keywords = ["nshm"]`) and `nsh-` crate name prefixes do NOT make a package installable.

Because `nsh 0.7.1` includes no built-in package search or directory listing subcommand (`nsh --help` only accepts explicit crate names, `github:owner/repo`, Git URLs, or `--path`), automated catalog curation in `scripts/discover.mjs` must combine six independent upstream channels and verify manifests statically and empirically.
