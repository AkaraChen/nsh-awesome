---
entryId: nsmetry
lang: en
title: "nsmetry: Cookieless Event Analytics SDK for NSH"
description: Batch and retry app telemetry from Native Shell clients to a self-hosted Cloudflare Worker and D1 dashboard via the crates.io sdk/nsh package.
h1: "nsmetry: Privacy-First Event & Screen Analytics SDK for NSH"
summary: MIT-licensed client telemetry SDK by huacnlee that batches NSH events and <NavStack> screen views with backoff retries toward a self-hosted NsMetry Cloudflare Worker.
updatedAt: 2026-11-26
platformSupport:
  heading: Client SDK Behavior Across All Six Platforms
  overview: Shares core queue logic (`sdk/js/src/core.ts`) across desktop, mobile, and Web with platform-tailored `User-Agent` formatting.
  matrix:
    - platform: iOS & Android
      status: Supported
      notes: '`useNsMetry` flushes when `lifecycle()` becomes `"background"`; `describePlatform` reports mobile UA strings.'
    - platform: macOS, Windows, Linux
      status: Supported
      notes: Avoids flushing on `"inactive"` Cmd-Tab focus changes; performs 200 ms best-effort flush on desktop quit.
    - platform: Web
      status: Supported
      notes: "`describePlatform` yields `undefined` on Web so the browser's native `User-Agent` header is used."
securityNote:
  heading: Empty Native Crate Stub & Privacy Disclosure Note
  body: While `nsmetry` carries an empty `native/src/lib.rs` crate (`nsh-core = "0.7.0"`) purely for crates.io packaging, it enables network telemetry requests to your configured Worker `endpoint` (requiring network capability permissions in `nsh.json`). Also note upstream's dashboard app shares optional anonymous self-telemetry described in its README.
related:
  - id: nsh-query
    path: /nshm/nsh-query/
    name: nsh-query
    reason: Complement client analytics with structured API fetching and offline query persistence.
  - id: nsh-o11y
    path: /nshm/nsh-o11y/
    name: nsh-o11y
    reason: Render custom client-side operational charts if building internal monitoring tools.
  - id: nsh-icon
    path: /nshm/nsh-icon/
    name: nsh-icon
    reason: Used directly inside NsMetry's own NSH reference client (`nsh-icon-lucide`).
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: Why Subdirectory Packages Need crates.io Publishing
---

## Batched App & Screen Telemetry Without Cookies or Crash Risk

NsMetry is an open-source, self-hosted analytics stack running on Cloudflare Workers' free plan with a D1 database—using no cookies, storing no personal data at rest, and hashing optional anonymous install IDs per site on the server. Inside `huacnlee/nsmetry`, the `sdk/nsh/` subdirectory publishes the `nsmetry` client SDK for Native Shell apps alongside an NSH-built client viewer app at the repository root.

The SDK exports `createNsMetry`, `useNsMetry` (flushing automatically when `lifecycle()` moves to `"background"` and best-effort within NSH's 200 ms desktop quit window), `useScreenTracking`, `navStackPath`, and `describePlatform(platform)`. Queued events batch up to `maxBatch: 50` every `flushInterval: 300_000` ms (`maxQueue: 1000` offline cap), retry with backoff, never reject or throw into the host application, and skip redundant `"inactive"` desktop focus changes.

## Monorepo Layout Caveat (`app/` vs `sdk/nsh/`) & Packaging Nuance

Pay close attention to the repository layout when inspecting `huacnlee/nsmetry`: the **repository root** is the full NsMetry viewer/dashboard NSH application (`nsh.json` has `"entry": "app/App.tsx"` and `"id": "dev.nsmetry.app"`), whereas the installable nshm crate lives in `sdk/nsh/`. As a result, **`nsh add nsmetry` works from crates.io**, while `nsh add github:huacnlee/nsmetry` would see the dashboard app root instead of `sdk/nsh`.

Inside `sdk/nsh/Cargo.toml`, the author ships an intentionally empty `native/src/lib.rs` stub (`nsh-core = "0.7.0"`) purely so Cargo can distribute the TypeScript `src/` SDK (`nsh.json` `"exports": {"nsmetry": "src/index.ts"}`) through crates.io.

- Tracking daily/weekly/monthly active installs, retention, custom events (up to 10 scalar properties), and `<NavStack>` screen transitions without third-party SaaS tracking.
- Deploying one Cloudflare Worker + D1 backend (`ADMIN_EMAIL` login, optional OAuth MCP server) serving both NSH mobile/desktop apps and ~2 KB web script sites.
- Honoring user opt-outs immediately via `client.setEnabled(false)` (which drops queued events) and `identify(null)`.

## Install from crates.io (Not Root GitHub URL)

`sdk/nsh` is published on crates.io as `nsmetry@0.1.0` specifically so `nsh add nsmetry` works seamlessly without hitting the viewer app's root `nsh.json` in `huacnlee/nsmetry`. Always install via `nsh add nsmetry` rather than the GitHub repo root.

- Requires `nsh >= 0.7` and a self-hosted NsMetry Cloudflare Worker endpoint configured with `ADMIN_EMAIL` (avoid `*.workers.dev` hostnames in production since ad blockers block them wholesale).
- Because `sdk/nsh` wraps an empty Rust target (`native/src/lib.rs`), Rust toolchains build the stub once cleanly with no runtime native hooks.
- Keep dynamic entity IDs out of `useScreenTracking` paths (log `/message` rather than `/message/8812`) so dashboard breakdowns remain clean.

## SDK Methods & Companion Server Stack

Lightweight TSX API paired with the self-hosted Cloudflare Worker + D1 repository.

- **createNsMetry & client methods:** `track(name, props?)`, `screen(path, props?)`, `identify(userId)`, `flush()`, `shutdown()`, and `setEnabled(bool)`.
- **useNsMetry & useScreenTracking:** Lifecycle flush hook plus reactive route tracking paired with `navStackPath(stack, mapper)`.
- **Self-hosted Cloudflare Worker + MCP:** Monorepo root deploys the D1 worker dashboard, ~2 KB web analytics script, and an OAuth-scoped MCP server.

## nsh 0.7.1 Verification Record

Verified cleanly on `nsh 0.7.1 (f78eace)` with `nsh add nsmetry`, resolving `0.1.0` (`MIT`, updated `2026-11-26`) from `crates.io`.

Scope boundary: Awesome NSH CI confirms `nsh add nsmetry` pulls the crates.io package (`sdk/nsh`) and writes `nsh.lock`; live Cloudflare Worker ingestion and D1 persistence were not deployed or tested in CI.
