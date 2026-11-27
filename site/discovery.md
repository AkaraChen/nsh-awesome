# How nshm Modules Are Defined and Discovered

> Empirical findings from inspecting `longbridge/nsh` (`nsh 0.7.1`) manifest rules and scanning 6 external discovery channels.

HTML page: [https://nsh-awesome.vercel.app/discovery/](https://nsh-awesome.vercel.app/discovery/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/discovery.md) · [Raw docs/DISCOVERY.md](https://github.com/AkaraChen/nsh-awesome/blob/main/docs/DISCOVERY.md)

## 1. What Makes a Package an Installable nshm?

Contrary to common assumptions, crates.io keywords (`keywords = ["nshm"]`) and crate names starting with `nsh-` do NOT make a crate installable via `nsh add`. Per `crates/nsh-cli/src/nshm/manifest.rs` in `longbridge/nsh`, `nsh add` accepts a package only when it meets structural manifest rules AND NSH version compatibility (`check_nsh`):

| Kind | Required Manifest Files | Structural Entry Criterion | NSH Version Check |
|---|---|---|---|
| **Rust nshm** | `Cargo.toml` (`[package]`) | `#[native_module("<specifier>")]` in `[lib]` root (`src/lib.rs`) | Checks `nsh-core` in `[dependencies]`/`[workspace.dependencies]` and optional `nsh.json` `"nsh"` |
| **TSX nshm** | `nsh.json` (no `Cargo.toml`) | `"name"`, semver `"version"`, and non-empty `"exports"` mapping existing files | Checks optional `"nsh"` semver requirement |
| **Hybrid nshm** | `Cargo.toml` + `nsh.json` | Both `#[native_module]` and `nsh.json` `"exports"` without specifier collision | Checks both `Cargo.toml` `nsh-core` and `nsh.json` `"nsh"` |
| **Platform nshm** | `Cargo.toml` + `nsh.json` | `nsh.json` declares `"platform": "<target>"` and builds `nsh-platform-<target>` | Checks `Cargo.toml` `nsh-core` and `nsh.json` `"nsh"` |

**Discovered `cargo publish` parser quirk (`nsh-cli 0.7.1`):** `cargo publish` rewrites `[dependencies] nsh-core = "0.6.0"` into a `[dependencies.nsh-core]` sub-table, which `manifest.rs::nsh_core_requirement` skips. As a result, **18 crates.io crates pinned to `0.6`** (17 `SuperNSH/*` crates plus `nsh-platform-miniprogram@0.1.0`) pass `nsh add` technically despite targeting NSH 0.6; this catalog excludes them until updated to `0.7` on crates.io.

## 2. Discovery Channels Tested & Empirical Hit Counts

The `nsh` CLI has no built-in search command. Running `node scripts/discover.mjs` combines **6 external channels**, inspecting **119 unique crates.io crates** and **89 unique GitHub repositories**:

| Channel | Raw Hits | Relevant Hits | Key Findings |
|---|---:|---:|---|
| 1. crates.io `keyword=nshm` | 68 | 68 | Includes 40 icon sub-crates, 17 `0.6`-pinned `SuperNSH/*` crates, and 3 non-nshm helpers. |
| 2. crates.io `nsh-core` reverse dependencies | 107 | 104 | Catches 18 framework crates and untagged platform packages (`nsh-platform-harmonyos`). |
| 3. crates.io `keyword=nsh` & `native-shell` | 95 + 1 | 94 + 1 | Surfaces additional Cargo crates (`nsh-auth`, `nsh-form`, `maplibre-nsh`) that are not nshms. |
| 4. `longbridge/nsh-showcases` | 10 | 10 | Official curated showcase; 6 installable and 4 non-nshm CLIs/apps. |
| 5. GitHub Topic & Code Search | 1+57+7 / 19+56+29 | — | Found `nsh-shadcn` and `nsh-query`; Code Search returned 0 hits for `org:SuperNSH`. |
| 6. Multi-crate GitHub Org Enumeration | 31 (`SuperNSH`) | 31 | Discovered `SuperNSH/webgpu`, `SuperNSH/skia`, and `SuperNSH/widgets`, missed by Code Search. |

## 3. Accepted Installable nshm Modules (13 Verified on nsh 0.7.1)

| Package | Source | Verified Command | Version |
|---|---|---|---|
| [nsh-extra](https://nsh-awesome.vercel.app/nshm/nsh-extra.md) | `crates.io` | `nsh add nsh-extra --features camera` | `0.7.1` |
| [nsh-omarchy](https://nsh-awesome.vercel.app/nshm/nsh-omarchy.md) | `crates.io` | `nsh add nsh-omarchy` | `0.2.0` |
| [nsh-shadcn](https://nsh-awesome.vercel.app/nshm/nsh-shadcn.md) | `github` | `nsh add github:caoxing9/nsh-shadcn` | `0.1.0` |
| [nsh-widgets](https://nsh-awesome.vercel.app/nshm/nsh-widgets.md) | `git` | `nsh add https://github.com/SuperNSH/widgets.git --rev master` | `0.4.1` |
| [nsh-icon](https://nsh-awesome.vercel.app/nshm/nsh-icon.md) | `crates.io` | `nsh add nsh-icon` | `0.2.2` |
| [supernsh-icons](https://nsh-awesome.vercel.app/nshm/supernsh-icons.md) | `crates.io` | `nsh add supernsh-icons` | `0.2.0` |
| [nsh-graph](https://nsh-awesome.vercel.app/nshm/nsh-graph.md) | `crates.io` | `nsh add nsh-graph` | `0.3.0` |
| [nsh-o11y](https://nsh-awesome.vercel.app/nshm/nsh-o11y.md) | `crates.io` | `nsh add nsh-o11y` | `0.1.0` |
| [nsh-webgpu](https://nsh-awesome.vercel.app/nshm/nsh-webgpu.md) | `github` | `nsh add github:SuperNSH/webgpu` | `0.1.0` |
| [nsh-skia](https://nsh-awesome.vercel.app/nshm/nsh-skia.md) | `github` | `nsh add github:SuperNSH/skia` | `0.1.0` |
| [nsh-query](https://nsh-awesome.vercel.app/nshm/nsh-query.md) | `github` | `nsh add github:Dearest/nsh-query` | `0.1.0` |
| [nsmetry](https://nsh-awesome.vercel.app/nshm/nsmetry.md) | `crates.io` | `nsh add nsmetry` | `0.1.0` |
| [nsh-platform-harmonyos](https://nsh-awesome.vercel.app/nshm/nsh-platform-harmonyos.md) | `github` | `nsh add github:huacnlee/nsh-platform-harmonyos` | `0.1.1` |

## 4. Excluded & Deferred Candidates

- **19 official framework crates:** Lack `#[native_module]` and live in the dedicated non-nshm framework section.
- **40 icon-set subcrates + 3 internal data crates:** Documented under parent entries `nsh-icon` (5 packs) and `supernsh-icons` (35 packs).
- **End-user apps (`SuperNSH/starter`, `huacnlee/spotish`, `ryujane/Ferrix`):** Set `publish = false` and use app-level `"root"`/`"id"` keys rather than `"exports"`.
- **Incompatible or unreleased:** `nsh-gpu-lexer` (`0.6`), `honsunrise/nsh-ext` (`=0.7.0` exact pin), 18 normalized `0.6` crates, and `nsh-directories` (in development) are excluded from the `0.7.1` list.
