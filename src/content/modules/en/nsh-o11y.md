---
entryId: nsh-o11y
lang: en
title: "nsh-o11y: Observability Charts for Native Shell"
description: Render TimeSeriesChart, LogView, TraceWaterfall, and FlameGraph panels with M4 min/max pyramid decimation, createChartSync, and an optional Rust store.
h1: "nsh-o11y: High-Throughput Observability Charts for NSH"
summary: Hybrid TSX + optional Rust telemetry visualization suite by JetSquirrel delivering TimeSeriesChart, LogView, TraceWaterfall, FlameGraph, SandwichView, ServiceMap, and Heatmap.
updatedAt: 2026-11-25
platformSupport:
  heading: Cross-Platform `<Canvas>` Support & Demo Site
  overview: Follows the same `<Canvas>` rendering layout as `nsh-graph` across desktop, mobile, GPUI, and Web targets.
  matrix:
    - platform: macOS, Windows, Linux
      status: Supported
      notes: Upstream tests cover store vs brute-force parity, screenshot/dark mode checks (`nsh test example/screenshot.test.tsx`), and Rust vs TS path equality.
    - platform: iOS & Android
      status: Supported
      notes: Touch pan and pinch-zoom supported on native `<Canvas>` views.
    - platform: GPUI
      status: Supported
      notes: Compatible with GPUI embedding through standard NSH canvas bindings.
    - platform: Web
      status: Supported (live demo)
      notes: Example dashboard compiled with `nsh package --target web` is live at `jetsquirrel.github.io/nsh-o11y/`.
securityNote:
  heading: QuickJS Guard & Rust Crate Build Notice
  body: Large folded flame-graph profiles should use `profileFromFoldedAsync(..., { onProgress })` so parsing yields in slices rather than hitting NSH's 2-second single-JS-call guard. Installing `nsh-o11y` also compiles `native/src/lib.rs` via Cargo (`[profile.dev] opt-level = 2`).
related:
  - id: nsh-graph
    path: /nshm/nsh-graph/
    name: nsh-graph
    reason: Sibling JetSquirrel visualization package sharing `<Canvas>` conventions and color-blind-safe palettes.
  - id: nsh-skia
    path: /nshm/nsh-skia/
    name: nsh-skia
    reason: Use `nsh-skia` when building custom non-O11y 2D drawings or GLSL/SkSL shaders.
  - id: nsmetry
    path: /nshm/nsmetry/
    name: nsmetry
    reason: Collect client app telemetry events and screen transitions while `nsh-o11y` plots metrics/traces inside desktop tools.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /guides/
    label: Read `nshm` & `Building with Rust` Docs
---

## M4 Pyramid Decimation & Two-Layer Native Canvas Architecture

Built specifically for observability dashboards rather than generic business charts, `nsh-o11y` stores columnar time-series samples inside a min/max pyramid (blocks of 8, 64, 512, ...) and renders each pixel column via M4 decimation (first, min, max, and last values). As a result, rendering work scales with screen width rather than raw sample count while never hiding single-sample spikes or dropouts.

Charts separate static grids, axes, and paths onto one `<Canvas>` layer and cursor crosshairs, dots, and zoom boxes onto an overlay `<Canvas>`, so pointer tracking never redraws series data. Beyond `TimeSeriesChart`, the package includes `LogView` (with live running level histograms), `TraceWaterfall` (`TraceComparison`), `ServiceMap`, `FlameGraph` (`SandwichView`, `diffProfiles`), and bucketed `Heatmap`.

## TypeScript Store vs Opt-In Rust Store (`SeriesBuffer`)

On QuickJS—which runs NSH TSX logic outside the browser—JavaScript heap memory caps at 256 MB and interpreted loops cost roughly 7× more than V8. Upstream README measurements note that the pure TypeScript store holds roughly 2 million samples comfortably, whereas registering `nsh-o11y/native` (`SeriesBuffer` + `lod.rs`) keeps samples in Rust, scales past the 256 MB JS heap limit (tested to 10M+ samples upstream), and traces identical SVG path commands back to JS in integer tenths of a point.

Apps targeting only small or moderate datasets in TSX can skip calling `setNativeBackend` while still benefiting from synchronized cross-panel crosshairs and zoom (`createChartSync`), SLO threshold markers, deploy annotations, dual Y axes, and screen-reader/keyboard navigation.

- Live infrastructure, APM, or telemetry consoles correlating metrics (`TimeSeriesChart`), logs (`LogView`), traces (`TraceWaterfall`), and CPU profiles (`FlameGraph`) via `createChartSync`.
- Streaming dashboards (`append`, sliding `window`, `maxPoints`) that avoid rebuilding decimation trees on every incoming sample batch.
- Heavy multi-million-point analysis tools that offload storage from QuickJS's 256 MB heap into Rust `SeriesBuffer`.

## crates.io Installation & Native Store Configuration

`nsh-o11y@0.1.0` targets `nsh >= 0.7` (`nsh-core = "0.7.0"` in `Cargo.toml`) and installs straight from crates.io via `nsh add nsh-o11y`.

- Requires `nsh >= 0.7` and a local Rust toolchain (`wasm32-unknown-unknown` for Web builds).
- Works immediately with TypeScript stores; import `* as native from "nsh-o11y/native"` and call `setNativeBackend(...)` before creating stores to enable Rust-backed `SeriesBuffer`.
- When testing from a local `--path` checkout, copy upstream `.cargo/config.toml` optimization settings so Rust `lod.rs` builds do not run unoptimized.

## Included Panel Components & Exports

Ships seven specialized telemetry visualization components and headless data engines inside one `nsh-o11y` package.

- **TimeSeriesChart & createChartSync:** M4 pyramid line/step/fill charts with dual Y axes, SLO thresholds, annotations, and shared crosshairs/zoom.
- **LogView, TraceWaterfall & ServiceMap:** Virtualized log streams with volume histograms, span trees (`compareTraces` diffing), and service dependency maps.
- **FlameGraph, SandwichView & Heatmap:** Folded-stack flame graphs (`profileFromFoldedAsync` sliced for QuickJS 2s guard), caller/callee sandwich views, and latency heatmaps.

## nsh 0.7.1 Verification Record

Verified cleanly on `nsh 0.7.1 (f78eace)` with `nsh add nsh-o11y`, resolving `0.1.0` (`Apache-2.0`, updated `2026-11-25`) from `crates.io`.

Scope boundary: Awesome NSH CI validates clean `nsh add` installation and lockfile generation only. All benchmark comparisons against uPlot, ECharts, Chart.js, Plotly, and Dygraphs, plus QuickJS/Rust frame timings, are upstream results reported in `JetSquirrel/nsh-o11y` and not independently re-executed by Awesome NSH.
