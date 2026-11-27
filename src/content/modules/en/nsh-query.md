---
entryId: nsh-query
lang: en
title: "nsh-query: Pure-TSX TanStack Query Adapter for NSH"
description: "Zero Rust toolchain needed: wires @tanstack/query-core hooks and Storage persistence to NSH lifecycle events via github:Dearest/nsh-query."
h1: "nsh-query: Pure-TSX TanStack Query Adapter for Native Shell"
summary: Pure-TSX community nshm (nsh.json only, no Cargo.toml) adapting unmodified @tanstack/query-core 5.108.4 with solid-query-style hooks, network reconnects, and NSH Storage persistence.
updatedAt: 2026-11-25
platformSupport:
  heading: Universal TSX Support Across All Six Targets
  overview: Because `nsh-query` ships pure TypeScript bundled by `nsh-bundler`, it runs wherever NSH provides QuickJS or Web JS runtimes plus `Storage`, `lifecycle()`, and `network()`.
  matrix:
    - platform: iOS & Android
      status: Supported
      notes: Pauses polling on `lifecycle() === "background"` and refetches stale queries on foreground return.
    - platform: macOS, Windows, Linux
      status: Supported
      notes: Desktop windows share one engine `QueryClient`; `wakeCount()` triggers stale refetches on computer wake; `"inactive"` remains focused by default.
    - platform: Web
      status: Supported
      notes: Bundles via Rolldown alongside `nsh-platform-web` with zero WASM/Rust steps.
securityNote:
  heading: Pure-TSX Build Profile & Runtime Scope
  body: Having no `Cargo.toml` means `nsh-query` executes zero `build.rs` scripts or Rust procedural macros during `nsh add` or builds; its TypeScript source still executes inside your JS runtime with access to app `fetch` and `Storage`, so verify the locked commit hash in `nsh.lock`.
related:
  - id: nsmetry
    path: /nshm/nsmetry/
    name: nsmetry
    reason: Complements data fetching/caching with cookieless batched telemetry events and `<NavStack>` screen tracking.
  - id: nsh-omarchy
    path: /nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: Render loading skeletons, tables, and toast feedback driven by reactive `todo.isPending` / `useMutation` states.
  - id: nsh-extra
    path: /nshm/nsh-extra/
    name: nsh-extra
    reason: Pair `nsh-query` server sync with native device reads like `Location` or `Camera`.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: See TSX nshm Rules & The crates.io nsh-query Collision
---

## Why Solid-Style Hooks & NSH Lifecycle Wiring Matter

Because Native Shell components run once and re-evaluate only where reactive signals are read, React Query's re-render semantics do not apply directly. `nsh-query` wraps unmodified `@tanstack/query-core` behind `solid-query`-shaped APIs (`useQuery`, `useMutation`, `useInfiniteQuery`, `QueryClientProvider`), enforcing thunk options (`useQuery(() => ({ ... }))`) and reactive property reads without destructuring (`todo.data` instead of `const { data } = todo`).

`QueryClientProvider` (or `connectNsh()`) maps NSH platform signals directly into `query-core`: `lifecycle() === "background"` pauses polling while returning from background triggers `refetchOnWindowFocus`, `"inactive"` desktop windows keep polling like visible browser tabs unless customized, `wakeCount()` refetches stale queries on system resume, and `network().online` drives pause/resume refetching. The secondary export `nsh-query/persist` (`createNshStoragePersister`, `PersistQueryClientProvider`) persists caches in NSH's 5 MB `Storage` at most once per second.

## Pure-TSX Simplicity & Crucial Name Collision Warning

As the **only pure-TSX module (`tsx-nshm`)** among the 13 verified `nsh 0.7.1` entries, `nsh-query` contains **no `Cargo.toml` and no Rust code**. TSX applications add it without installing Cargo or triggering native crate recompilations, and on desktop multi-window apps one `QueryClient` shares cached responses across every `<Window>` on the engine.

Watch out for two traps documented upstream and in Discovery: **do not** run `nsh add nsh-query` without `github:Dearest/`—a different, non-nshm crate named `nsh-query` (`0.1.0`) exists on crates.io and fails `nsh add`; also **do not** install `@tanstack/query-core` separately next to `nsh-query`, because `nsh-query` vendors its own wired copy.

- TSX-only NSH applications needing caching, background refetching, optimistic mutations, and offline queue resilience without touching Rust.
- Instant cold-start rendering from persisted NSH `Storage` (`PersistQueryClientProvider` with `gcTime >= maxAge`).
- Multi-window desktop apps sharing one `QueryClient` cache across windows without duplicate HTTP calls.

## GitHub-Only Installation & Avoiding the crates.io Collision

Pure TSX packages without `Cargo.toml` cannot publish to crates.io (`nsh.json` declares `"exports": {"nsh-query": "src/index.ts", "nsh-query/persist": "src/persist/index.ts"}`), and crates.io already holds an unrelated non-nshm `nsh-query` crate. Always specify `github:Dearest/nsh-query`.

- No Rust toolchain required when used in a TSX-only NSH application.
- Requires `nsh >= 0.6` (verified clean on `nsh 0.7.1`; built around `@tanstack/query-core` `5.108.4`).
- When using `PersistQueryClientProvider`, keep `gcTime` at least equal to `maxAge` (default 24 h) so restored queries are not garbage-collected immediately.

## Export Paths & Behavioral Differences from React Query

Documents key differences upstream explicitly flags in `docs/differences.md`.

- **nsh-query:** Exports `QueryClient`, `QueryClientProvider`, `connectNsh`, `useQuery`, `useMutation`, `useQueries`, `useInfiniteQuery` (`use*` names only, no `create*` aliases).
- **nsh-query/persist:** Exports `createNshStoragePersister`, `PersistQueryClientProvider`, and `useIsRestoring()` (throttled `<= 1/sec`, drops oldest queries via `removeOldestQuery` if 5 MB Storage fills).
- **Omitted React/Solid APIs:** No Suspense, SSR/hydration, `reconcile`, `useSuspenseQuery`, or `HydrationBoundary`; `throwOnError` throws on `data` read to `<ErrorBoundary>`.

## nsh 0.7.1 Verification Record

Verified cleanly on `nsh 0.7.1 (f78eace)` via `nsh add github:Dearest/nsh-query`, resolving `nsh-query@0.1.0` (`MIT`, updated `2026-11-25`) at `git+https://github.com/Dearest/nsh-query`.

Scope boundary: Awesome NSH verifies `nsh add` installation and lockfile generation for `github:Dearest/nsh-query`. Upstream's ported solid-query/react-query parity test suite (`tests/PARITY.md`) and `example/` fake API demo were inspected in source rather than executed in Awesome NSH CI.
