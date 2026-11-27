---
entryId: nsh-graph
lang: en
title: "nsh-graph: Interactive Canvas Network Graphs in NSH"
description: Force, hierarchical, circular, and grid layouts on native <Canvas> with community collapsing, OffscreenCanvas PNG export, and an optional Rust backend.
h1: "nsh-graph: Interactive Network Graph Views for Native Shell"
summary: Hybrid TSX + optional Rust network-graph module by JetSquirrel running on NSH's native <Canvas> across desktop, mobile, GPUI, and Web, drawing from gpui-graph and Neo4j NVL.
updatedAt: 2026-11-25
platformSupport:
  heading: Cross-Platform `<Canvas>` Coverage Including GPUI
  overview: Draws on NSH's built-in `<Canvas>` primitive rather than platform-specific GPU shaders, enabling identical support across seven targets.
  matrix:
    - platform: macOS, Windows, Linux
      status: Supported
      notes: Upstream tests include headless engine/layout suites plus real host input checks (`nsh test example/input.test.tsx`).
    - platform: iOS & Android
      status: Supported
      notes: Supports single-tap selection, double-tap activation, touch pan, and two-finger pinch zoom.
    - platform: GPUI
      status: Supported
      notes: Explicitly listed alongside desktop/mobile/Web targets through NSH `<Canvas>`.
    - platform: Web
      status: Supported (demo published)
      notes: Interactive gallery published at `jetsquirrel.github.io/nsh-graph/` via `wasm32-unknown-unknown`.
securityNote:
  heading: Rust Compilation & Reduce Motion Behavior
  body: Even if an app never calls `setNativeBackend`, adding `nsh-graph` includes `native/src/lib.rs` in the Rust build graph (`nsh-core = "0.7.0"`). At runtime, when OS Reduce Motion is active, the layout automatically settles in 10 ms slices and renders only the final settled state.
related:
  - id: nsh-o11y
    path: /nshm/nsh-o11y/
    name: nsh-o11y
    reason: Built by the same author (`JetSquirrel`) using the same color-blind palette and `<Canvas>` + optional Rust architecture.
  - id: nsh-webgpu
    path: /nshm/nsh-webgpu/
    name: nsh-webgpu
    reason: Choose WebGPU compute/render pipelines when custom 3D visualization or massive GPU point clouds exceed `<Canvas>` 2D.
  - id: nsh-skia
    path: /nshm/nsh-skia/
    name: nsh-skia
    reason: Alternative 2D GPU canvas if you need custom Skia shaders, blurs, and `react-native-skia` primitives.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /templates/
    label: Browse NSH Example & Reference Apps
---

## Four Animated Layouts & Opt-In Rust Force Simulation

Authored by `JetSquirrel`, `nsh-graph` renders interactive node-link graphs onto NSH's native `<Canvas>` via `<GraphView>`, `<GraphLegend>`, `createGraphController()`, and `mergeGraphData()`. It implements four layouts—Barnes-Hut force-directed (d3-force style with collision, gravity, and group clustering), four-direction cycle-safe hierarchical, circular, and grid—along with animated transitions when switching layouts.

By default, the TypeScript engine handles smaller interactive graphs smoothly inside QuickJS. When node counts scale into the thousands, apps opt into `nsh-graph/native` (`setNativeBackend(native)`), moving `ForceLayout` simulation state and `GraphPainter` batched `Path2D` edge/node tracing into Rust (`native/src/lib.rs`) so QuickJS avoids per-frame array marshalling.

## Rich Interaction Model, Accessibility & Local Checkout Tip

Built-in UX covers pan, wheel/pinch zoom, Shift-box multi-selection, neighbor hover tooltips, right-click context menus, arrow-key graph walking (`+`/`-`/`0`/`p`/`Esc`), community hull collapsing into `×N` super-nodes with bundled edges, an 8-category color-blind-validated palette, id-diffed `data` updates that preserve pinned positions, and PNG export via `controller.toImage()` on `OffscreenCanvas`.

Note an important optimization detail from upstream: crates.io and Git releases build the Rust backend optimized, whereas a local `--path` checkout inherits the app's debug profile unless `.cargo/config.toml` sets `[profile.dev.package.nsh-graph] opt-level = 3`. Upstream also notes `nsh-graph` relies on `onKeyDown`, `onPinch`, and `captureKeys` introduced in NSH 0.6+.

- Knowledge graphs, entity relationship explorers, and Neo4j-style dependency inspectors with neighbor expansion (`mergeGraphData`).
- Clustered service or community topologies using collapsible group super-nodes (`×N`) and edge bundling.
- Desktop/GPUI graph viewers scaling to 1,500–5,000+ nodes via opt-in `nsh-graph/native` Rust force layout and `GraphPainter`.

## crates.io Installation & Opt-In Native Backend Wiring

`nsh-graph@0.3.0` (`nsh.json` `"nsh": ">=0.7"`, `Cargo.toml` `nsh-core = "0.7.0"`) is published directly on crates.io and also tagged on GitHub (`JetSquirrel/nsh-graph`). Install directly with `nsh add nsh-graph`.

- Requires `nsh >= 0.7` and a local Rust toolchain (plus `wasm32-unknown-unknown` for Web builds).
- The pure TSX view runs out of the box from `"nsh-graph"`; call `setNativeBackend(native)` once at startup with `import * as native from "nsh-graph/native"` to activate Rust acceleration.
- For local `--path` development, add `[profile.dev.package.nsh-graph] opt-level = 3` in `.cargo/config.toml`.

## Package Exports & Upstream Performance Notes

Splits TSX layout/UI controls from optional Rust simulation while sharing one `data` prop model.

- **nsh-graph (TSX):** `GraphView`, `GraphLegend`, `createGraphController`, `mergeGraphData`, and `setNativeBackend`.
- **nsh-graph/native (Rust):** Opt-in `ForceLayout` and `GraphPainter` SVG path batching; `Cargo.toml` sets `[profile.dev] opt-level = 2`.
- **Upstream benchmarks (JetSquirrel):** Upstream README reports QuickJS tick+draw timings and Rust acceleration comparisons in `nsh test perf` (up to 5,000 nodes / 9,997 edges) and `docs/comparison.md`.

## nsh 0.7.1 Verification Record

Verified cleanly on `nsh 0.7.1 (f78eace)` via `nsh add nsh-graph`, resolving `0.3.0` (`Apache-2.0`, updated `2026-11-25`) from `crates.io`.

Scope boundary: Awesome NSH verifies `nsh add` installation on `nsh 0.7.1` only. All tick/draw timing figures cited from `JetSquirrel/nsh-graph` README were measured by upstream in its own `perf` suite and were not re-benchmarked by Awesome NSH.
