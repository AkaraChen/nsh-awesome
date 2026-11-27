---
pageType: about
pageSlug: about
lang: en
title: "About Awesome NSH: Verification & Safety Policy"
description: Maintainer details for AkaraChen, how scratch-app nsh 0.7.1 install checks work, build.rs and proc-macro security boundaries, and contribution rules.
h1: "About Awesome NSH: Maintainer, Verification Scope & Safety Policy"
lead: Transparent documentation of who curates Awesome NSH, how entries are discovered and tested against nsh 0.7.1, and where verification boundaries stop.
datePublished: 2026-11-26
updatedAt: 2026-11-27
whoHeading: Who Maintains Awesome NSH
how:
  heading: How Discovery, Generation & CI Verification Work
  paragraphs:
    - "Rather than compiling entries by hand from memory, Awesome NSH operates an automated pipeline inside `scripts/` and Astro: `discover.mjs` scans six upstream crates.io and GitHub channels; `lint.mjs` enforces schema completeness, Content Collection parity, bilingual English/Chinese formatting, and exact entry counts; `generate.mjs` keeps `README.md` and `README.zh.md` synchronized with `data/entries.json`; `npm run build` compiles the static Astro site, `index.json`, feeds, and `.md` endpoints into `dist/`; `seo-check.mjs` validates Schema, hreflang, and link graphs; `check-links.mjs` validates upstream URLs; and `verify-install.mjs` creates a clean scratch `nsh.json` project per module and runs the exact `nsh add ...` command on `nsh 0.7.1`."
    - Whenever `nsh` publishes a new minor or patch release, re-running `verify-install.mjs` and `discover.mjs` surfaces broken version pins (such as crates.io tags still pointing to `^0.6`) before users encounter them.
  pipelineScripts:
    - script: scripts/discover.mjs
      role: Scans 6 external channels (119 crates.io crates, 89 GitHub repos) and checks manifest rules.
    - script: scripts/verify-install.mjs
      role: Runs `nsh add ...` in clean scratch apps on `nsh 0.7.1` and inspects `nsh.json` + `nsh.lock`.
    - script: scripts/lint.mjs
      role: Validates entry schema fields, heading hierarchy, URL uniqueness, and file parity.
    - script: scripts/check-links.mjs
      role: Verifies HTTP reachability for `sourceUrl`, `cratesUrl`, and `homepage` links.
    - script: scripts/generate.mjs --check
      role: Guards byte-level sync for `README.md` and `README.zh.md` against `data/entries.json`.
    - script: scripts/seo-check.mjs
      role: Validates every built HTML page, JSON-LD graph, hreflang mesh, sitemap, and agentic endpoint in `dist/`.
why:
  heading: Why This Directory Exists
  paragraphs:
    - Native Shell `0.7.1` intentionally keeps its CLI focused on resolving explicit coordinates (`nsh add <crate>`, `github:owner/repo`, or Git URL) without shipping a built-in search registry. Meanwhile, searching `crates.io` or `GitHub` blindly turns up official non-installable framework crates, 40 sub-crates for icon sets, end-user apps with `#[native_module]`, and 0.6-era packages bypassing semver due to Cargo table normalization.
    - Awesome NSH bridges that gap for developers and coding agents alike by exposing curated human comparisons alongside clean JSON and Markdown endpoints.
criteria:
  heading: Inclusion & Exclusion Criteria
  inclusion:
    - Must install cleanly with `nsh add` inside a fresh scratch app on the current verified `nsh` release (`0.7.1`) from crates.io, `github:owner/repo`, or an explicit Git URL.
    - Must satisfy `nsh` manifest rules (`#[native_module]` in Rust, `nsh.json` `"exports"` for TSX/Hybrid, or `"platform"` for target backends) and genuinely target `0.7` (excluding normalized `0.6` parser bypasses).
    - Non-installable official framework crates (`19`), notable templates/apps (`4`), and official documentation tracks (`7`) are segregated into dedicated hubs with explicit `NOT nshm` warnings rather than mixed into `/nshm/`.
  exclusion:
    - Packages pinned to `nsh-core 0.6` / `0.6.0` or strict `=0.7.0` pins that fail or only bypass via Cargo's `[dependencies.nsh-core]` normalization quirk.
    - Ordinary Rust helper crates, CLI binaries, and standalone applications with `publish = false` and `nsh.json` `"root"`/`"id"` keys.
    - Companion icon-set sub-crates (`40`) and internal gallery data crates (`3`) are documented inside `nsh-icon` and `supernsh-icons` rather than listed individually.
verificationBoundary:
  heading: "Honest Verification Boundary: What Is NOT Tested"
  summary: "To prevent misleading claims of universal runtime certification, Awesome NSH explicitly limits its verification badge (`Verified on nsh 0.7.1`) to package installation:"
  verifiedItems:
    - Running exact `installCommand` (`nsh add ...`) inside a fresh temporary `nsh.json` + `App.tsx` scratch directory on `nsh 0.7.1`.
    - Checking that `nsh.json` updates `"dependencies"` and `nsh.lock` records the expected package name, version, and source.
    - Inspecting upstream `Cargo.toml`, `nsh.json`, `src/lib.rs`, and `README.md` directly for manifest semantics and reported platform caveats.
  notVerifiedItems:
    - Full native Rust/Swift/Kotlin/WASM/ArkUI compilation across macOS, iOS, Android, Windows, Linux, Web, or HarmonyOS targets.
    - Physical hardware execution, UI rendering checks, performance benchmarks, or upstream test suites (all runtime/benchmark numbers quoted on module pages explicitly cite upstream documentation).
    - Manual line-by-line cryptographic or security audits of third-party crate code or prebuilt binary artifacts.
securityPolicy:
  heading: Security Notice for `build.rs`, Proc Macros & Permissions
  body: Installing any Rust, Hybrid, or Platform `nshm` executes its `build.rs` build script, procedural macros (`#[native_module]`), and native libraries with full developer-machine privileges during build and full app permissions at runtime. Crates can also merge Apple `Info.plist` privacy prompts, macOS entitlements, Android manifest permissions/AAR libraries, and HarmonyOS `module.json5` entries via `[package.metadata.nsh]`. Inspect source code, lockfile commit hashes (`nsh.lock`), and generated manifest diffs before shipping.
contributing:
  heading: How to Submit Updates, Corrections, or New Modules
  body: Maintainers and community contributors can add verified modules, report stale pins (such as when a `0.6` crate upgrades to `0.7` on crates.io), or correct platform caveats by editing `data/entries.json` (and optional Markdown files under `src/content/`), running `node scripts/generate.mjs`, `npm run build`, `node scripts/lint.mjs`, `node scripts/seo-check.mjs`, `npm test`, and `node scripts/verify-install.mjs`, and opening a pull request or issue on `github.com/AkaraChen/nsh-awesome`.
  contributingUrl: https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md
relatedLinks:
  - path: /discovery/
    label: Read Full Discovery Findings & Rejection Ledger
    reason: Inspect empirical channel numbers and every excluded candidate.
  - path: /nshm/
    label: Browse Verified Installable nshm Packages
    reason: Filter the 13 packages passing clean `nsh 0.7.1` checks.
  - path: /
    label: Return to Interactive Awesome NSH Directory
    reason: Search all 43 entries or download `index.json`.
---

Awesome NSH (`github.com/AkaraChen/nsh-awesome`) is curated and maintained by `AkaraChen` as an independent community catalog and machine-readable index for the Native Shell (`nsh`) ecosystem. While it mirrors and verifies packages from `longbridge/nsh`, `longbridge/nsh-showcases`, `crates.io`, and public GitHub repositories, it is not operated as an official `nsh.dev` product.

All directory pages, README files, `index.json`, and `count.json` are built deterministically by Astro from committed repository sources (`data/entries.json` and bilingual Markdown Content Collections under `src/content/`), making every inclusion, exclusion, and version update inspectable in Git history.
