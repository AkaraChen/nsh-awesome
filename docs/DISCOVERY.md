# How `nshm` Modules Are Defined and Discovered

This document records the empirical findings from inspecting the `nsh 0.7.1` CLI source code in [`longbridge/nsh`](https://github.com/longbridge/nsh), reading the official [nshm documentation](https://nsh.dev/docs/nshm), and running real `nsh add` commands in isolated scratch applications against `nsh 0.7.1 (f78eace)`.

---

## 1. What Makes a Package an Installable `nshm`?

Contrary to common assumptions, **crates.io keywords (`keywords = ["nshm"]`) and crate names starting with `nsh-` do NOT make a crate installable via `nsh add`.**

According to `crates/nsh-cli/src/nshm/manifest.rs` (`Manifest::read`) and `crates/nsh-cli/src/rust_app.rs` (`specifier_of`) in `longbridge/nsh`, `nsh add` accepts a package only when it meets **structural manifest rules** AND **NSH version compatibility (`check_nsh`)**:

| Kind | Manifest files required | Structural entry criterion | NSH version check (`check_nsh`) |
|---|---|---|---|
| **Rust nshm** | `Cargo.toml` (`[package]`) | `#[native_module("<specifier>")]` attribute on a line in `[lib] path` (defaults to `src/lib.rs`) | Checks `nsh-core` in `[dependencies]` (or `[workspace.dependencies]` via `nsh-core.workspace = true`) and optional `nsh.json` `"nsh"` |
| **TSX nshm** | `nsh.json` (no `Cargo.toml`) | `"name"`, semver `"version"`, and non-empty `"exports"` mapping `<name>` or `<name>/*` to existing TSX/TS files | Checks optional `"nsh"` semver requirement |
| **Hybrid nshm (Rust + TSX)** | `Cargo.toml` + `nsh.json` | `#[native_module("<specifier>")]` in Rust crate + `"exports"` in `nsh.json` (matching `[package] name` & `version` if repeated, export specifiers must not collide with the Rust module specifier) | Checks both `Cargo.toml` `nsh-core` and `nsh.json` `"nsh"` |
| **Platform nshm** | `Cargo.toml` + `nsh.json` | `nsh.json` declares `"platform": "<target>"` + crate builds binary `nsh-platform-<target>` (`#[native_module]` optional) | Checks `Cargo.toml` `nsh-core` and `nsh.json` `"nsh"` |

Important nuances verified directly in `manifest.rs` and confirmed with `nsh 0.7.1`:
1. **An app's `nsh.json` is ignored when `Cargo.toml` is present** unless `nsh.json` declares `"exports"` or `"platform"`.
2. **A `Cargo.toml` virtual workspace root fails `nsh add`** with `Cargo.toml has no [package] name` (observed on `github:SuperNSH/biometrics`). Multi-crate repositories must either be fetched from crates.io by sub-crate name or place the nshm `[package]` at the repo root (`SuperNSH/webgpu`, `SuperNSH/skia`, `SuperNSH/widgets`, `SuperNSH/icons`).
3. **Apps with `#[native_module]` are indistinguishable structurally from Rust nshms:** end-user NSH apps written in mixed Rust+TSX mode (such as `huacnlee/spotish`, `ryujane/Ferrix`, `SuperNSH/starter`) also define `#[native_module("...")]` in `src/lib.rs`, but set `publish = false` and have `"root"` / `"id"` in `nsh.json` rather than `"exports"`. They must be curated out of the installable module list.
4. **Discovered `cargo publish` normalization parser quirk in `nsh-cli 0.7.1`:** When `cargo publish` packages a crate, Cargo rewrites `[dependencies] nsh-core = "0.6.0"` into a sub-table:
   ```toml
   [dependencies.nsh-core]
   version = "0.6.0"
   ```
   However, `manifest.rs::nsh_core_requirement` only scans the `[dependencies]` and `[workspace.dependencies]` tables. As a result, **18 crates.io crates pinned to `nsh-core 0.6` / `0.6.0`** (`17` `SuperNSH/*` `0.1.0`/`0.0.1` crates + `nsh-platform-miniprogram@0.1.0`) pass `nsh add` on `nsh 0.7.1` because `nsh-cli` sees `None` for `nsh-core`, even though their `Cargo.toml` pins `0.6` (whereas GitHub checkouts with un-normalized `[dependencies] nsh-core = "0.6"` are rejected by `check_nsh`). Our curation treats those 18 normalized `0.6` crates as targeting NSH 0.6 until updated to `0.7` on crates.io.

---

## 2. Discovery Channels Tested & Empirical Hit Counts

The `nsh` CLI (`nsh 0.7.1`) has **no built-in search or module listing command** (`nsh --help` and `nsh add --help` only install from explicit crate names, `github:owner/repo`, Git URLs, or `--path`).

Automated discovery therefore relies on combining **6 external channels**, implemented in [`scripts/discover.mjs`](../scripts/discover.mjs):

| Channel | Query | Raw Hits | Exact / NSH-Relevant Hits | Notes |
|---|---|---:|---:|---|
| 1. crates.io `keyword=nshm` | `crates?keyword=nshm` | 68 | 68 | High signal, but includes 35 `supernsh-icons-*` + 5 `nsh-icon-*` companion crates, 17 `0.6`-pinned `SuperNSH/*` crates, plus 3 non-nshm helper crates (`nsh-frameworks`, `nsh-native-deps`, `nsh-maven`) and `nsh-widgets` (0.6 on crates.io). |
| 2. crates.io `reverse_dependencies` of `nsh-core` | `crates/nsh-core/reverse_dependencies` | 107 | 104 | Catches **framework crates** (18), **untagged nshms** (`nsh-platform-harmonyos`, `nsh-platform-miniprogram` lacked `nshm` keyword in `0.1.0`), `nsh-ext*`, `nsh-auth*`, `nsh-firebase-*`, plus 3 unrelated crates (`bamboo-tui`, `json-schema-editor`, `nsh-ui-mobile`). |
| 3. crates.io `keyword=nsh` & `keyword=native-shell` | `crates?keyword=nsh`, `native-shell` | 95 + 1 | 94 + 1 | Adds `nsh-auth`, `nsh-form`, `nsh-query`, `nsh-http`, `nsh-firebase-*`, `maplibre-nsh` (mostly non-nshm Rust crates or helpers). |
| 4. `longbridge/nsh-showcases` (`nsh.dev/directory`) | `directory/*/manifest.json` | 10 | 10 | Official curated directory; 6 are installable (`nsh-graph`, `nsh-o11y`, `nsh-omarchy`, `nsh-icon`, `nsh-platform-harmonyos` via GitHub, `nsh-platform-miniprogram` for 0.6) and 4 are non-nshm CLI/library repos (`shadcn-nsh`, `hero-nsh`, `a2ui-nsh`, `native-shell-with-ns`). |
| 5a. GitHub Repo Topic Search | `topic:nshm`, `topic:nsh`, `topic:native-shell` | 1 + 57 + 7 | 0 + 34 + 7 | `topic:nshm` returned only 1 unrelated seismic repo; `topic:nsh` surfaced `caoxing9/nsh-shadcn`, `Dearest/nsh-query`, and many NSH apps; `topic:native-shell` found mostly apps. |
| 5b. GitHub Code Search | `filename:nsh.json "exports"`, `"platform"`, `"keywords" "nshm" filename:Cargo.toml` | 19 + 56 + 29 | 7 + 6 + 21 | High false positives from `xonsh.json` / unrelated JSONs unless filtered to exact `nsh.json` filenames. **Critical gap:** GitHub Code Search returned **0 results** for `org:SuperNSH`! |
| 6. crates.io-Derived GitHub Org Enumeration | `orgs/<owner>/repos` for multi-crate NSH owners (`SuperNSH`, `JetSquirrel`, `huacnlee`, `honsunrise`) | 31 (`SuperNSH`) | 31 | Discovered `SuperNSH/webgpu`, `SuperNSH/skia`, and `SuperNSH/widgets` (`master`), all missed by GitHub Code & Topic Search. |

Running `node scripts/discover.mjs` across all channels inspected **119 unique crates.io crates** and **89 unique GitHub repositories**, surfacing:
- **7 clean `nsh 0.7.1`-compatible crates.io nshms** (plus **43 companion icon-set subcrates** under `nsh-icon` and `supernsh-icons`).
- **6 additional clean `nsh 0.7.1`-compatible GitHub/Git nshms** not cleanly installable from crates.io (`Dearest/nsh-query`, `caoxing9/nsh-shadcn`, `huacnlee/nsh-platform-harmonyos`, `SuperNSH/webgpu`, `SuperNSH/skia`, and `SuperNSH/widgets` on `--rev master`).
- **18 `0.6`-pinned crates.io crates** (normalized `[dependencies.nsh-core]` parser bypass).
- **3 explicitly `0.6` / `=0.7.0` incompatible GitHub nshms** (`AkaraChen/nsh-gpu-lexer`, `huacnlee/nsh-platform-miniprogram`, `honsunrise/nsh-ext`).

---

## 3. Empirical `nsh add` Verification Results (`nsh 0.7.1`)

### Accepted (13 Cleanly Verified Entries)

| Package | Source | Command Verified | Resolved Lock Target |
|---|---|---|---|
| `nsh-extra` | crates.io | `nsh add nsh-extra --features camera` | `0.7.1` (`crates.io`) |
| `nsh-omarchy` | crates.io | `nsh add nsh-omarchy` | `0.2.0` (`crates.io`) |
| `nsh-icon` (+ 5 packs) | crates.io | `nsh add nsh-icon` | `0.2.2` (`crates.io`) |
| `supernsh-icons` (+ 35 packs) | crates.io | `nsh add supernsh-icons` | `0.2.0` (`crates.io`) |
| `nsh-graph` | crates.io | `nsh add nsh-graph` | `0.3.0` (`crates.io`) |
| `nsh-o11y` | crates.io | `nsh add nsh-o11y` | `0.1.0` (`crates.io`) |
| `nsmetry` | crates.io | `nsh add nsmetry` | `0.1.0` (`crates.io`) |
| `nsh-query` | GitHub (`github:`) | `nsh add github:Dearest/nsh-query` | `0.1.0` (`git+https://github.com/Dearest/nsh-query`) |
| `nsh-shadcn` | GitHub (`github:`) | `nsh add github:caoxing9/nsh-shadcn` | `0.1.0` (`git+https://github.com/caoxing9/nsh-shadcn`) |
| `nsh-platform-harmonyos` | GitHub (`github:`) | `nsh add github:huacnlee/nsh-platform-harmonyos` | `0.1.1` (`git+https://github.com/huacnlee/nsh-platform-harmonyos`) |
| `nsh-webgpu` | GitHub (`github:`) | `nsh add github:SuperNSH/webgpu` | `0.1.0` (`git+https://github.com/SuperNSH/webgpu`) |
| `nsh-skia` | GitHub (`github:`) | `nsh add github:SuperNSH/skia` | `0.1.0` (`git+https://github.com/SuperNSH/skia`) |
| `nsh-widgets` | Git URL (`--rev`) | `nsh add https://github.com/SuperNSH/widgets.git --rev master` | `0.4.1` (`git+https://github.com/SuperNSH/widgets.git?rev=master`) |

### Rejected / Excluded / Deferred (Observed Reasons)

| Candidate | Observed Behavior / Error on `nsh 0.7.1` | Disposition |
|---|---|---|
| `github:AkaraChen/nsh-gpu-lexer` | Fails `nsh 0.7.1`: `Cargo.toml: nsh-core requires nsh 0.6; this is nsh 0.7.1` (passes on `0.6.0-nightly`). | Deferred until updated to NSH `0.7` |
| `nsh-directories` | In active development (no published crate or public GitHub repo yet). | Not yet available |
| `nsh-platform-harmonyos` (crates.io `0.1.0`) | Fails: `no #[native_module("...")] at the crate's root: is this an nshm?` (lacks `"platform"` in `0.1.0`). | Listed via `github:huacnlee/nsh-platform-harmonyos` (`0.1.1`) |
| `nsh-widgets` (crates.io `0.4.1` / tag `v0.4.1`) | Fails: `nsh-widgets: nsh.json: "nsh" requires nsh ^0.6; this is nsh 0.7.1`. | Listed via `https://github.com/SuperNSH/widgets.git --rev master` |
| `github:honsunrise/nsh-ext` (crates.io `0.6.0` / GitHub `0.7.0`) | Fails `0.7.1`: `Cargo.toml: nsh-core requires nsh =0.7.0; this is nsh 0.7.1` (exact pin `=0.7.0`); crates.io `0.6.0` lacks `#[native_module]`. | Rejected (strict `=0.7.0` pin) |
| 17 `SuperNSH/*` crates (`nsh-biometrics`, `nsh-camera`, etc.) & `nsh-platform-miniprogram@0.1.0` | crates.io tarballs pin `nsh-core` `0.6` / `0.6.0` (only pass `nsh add` due to normalized `[dependencies.nsh-core]` parser quirk; `github:SuperNSH/biometrics` fails with `no [package] name`). | Deferred until `0.7` crates are published |
| `nsh-core` & 18 official framework crates | Fail `nsh add`: `no #[native_module("...")] at the crate's root`. | Listed in **Framework & Official Crates** (non-installable) |
| `nsh-native-deps`, `nsh-frameworks`, `nsh-maven`, `nsh-widgets-cli`, `nsh-firebase-*`, `nsh-http`, `nsh-auth`, `nsh-form`, `nsh-query` (SuperNSH), `nsh-bluetooth`, `nsh-wake-lock`, `maplibre-nsh` | Fail `nsh add`: ordinary Rust Cargo crates or CLIs without `#[native_module]` or `nsh.json` `"exports"`. | Rejected (`not-nshm`) |
| `github:aningdev/shadcn-nsh`, `github:c-w-xiaohei/hero-nsh`, `github:yerlytech/a2ui-nsh`, `native-shell-with-ns` | Fail `nsh add`: `not an nshm: it has neither nsh.json nor Cargo.toml` (or `nsh.json has no "exports"` for `a2ui-nsh`, which is a standalone TSX app). | Rejected (not `nsh add` nshms) |
| `github:SuperNSH/starter`, `huacnlee/spotish`, `ryujane/Ferrix` | End-user apps / boilerplates (`publish = false`, `nsh.json` `"root"`/`"id"`) rather than reusable nshm packages. | `SuperNSH/starter` placed in **Examples & Templates** |
| 40 icon-set subcrates (`nsh-icon-*`, `supernsh-icons-*`) + 3 `supernsh-icons-data-*` | Sub-crates of `nsh-icon` (5) and `supernsh-icons` (35) plus internal data crates (`data-1..3`). | Documented under parent `nsh-icon` and `supernsh-icons` entries |
