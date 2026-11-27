# nsh-graph

> Interactive network graph component on native `<Canvas>` with force, hierarchical, circular, and grid layouts plus an opt-in Rust backend.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-graph/](https://nsh-awesome.vercel.app/nshm/nsh-graph/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-graph.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-graph` |
| Category | Charts, Graphs & GPU Canvas (`visualization`) |
| Kind | Hybrid Rust + TSX nshm (`hybrid-nshm`) |
| Source Type | `crates.io` |
| Package Version | `0.3.0` |
| NSH Requirement | `>=0.7` |
| Platforms | iOS, Android, macOS, Windows, Linux, GPUI, Web |
| License | Apache-2.0 |
| Updated | 2026-11-25 |
| Source Repository | [https://github.com/JetSquirrel/nsh-graph](https://github.com/JetSquirrel/nsh-graph) |
| crates.io | [https://crates.io/crates/nsh-graph](https://crates.io/crates/nsh-graph) |
| Docs / Demo | [https://jetsquirrel.github.io/nsh-graph/](https://jetsquirrel.github.io/nsh-graph/) |

## Installation & Verification

```bash
nsh add nsh-graph
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

Includes community collapsing, PNG export via `OffscreenCanvas`, and color-blind-safe palettes.

## Related Modules in This Category

- [nsh-o11y](https://nsh-awesome.vercel.app/nshm/nsh-o11y.md) — High-throughput observability charts (`TimeSeriesChart`, `LogView`, `TraceWaterfall`, `FlameGraph`) using M4 pyramid decimation and an optional Rust store.
- [nsh-webgpu](https://nsh-awesome.vercel.app/nshm/nsh-webgpu.md) — WebGPU (`navigator.gpu`, `GPUDevice`, `<Canvas getContext("webgpu")>`) for NSH apps ported from react-native-webgpu onto wgpu 29.
- [nsh-skia](https://nsh-awesome.vercel.app/nshm/nsh-skia.md) — Skia 2D canvas and drawing primitives (`<Canvas>`, `<Circle>`, `<Path>`, `Skia.RuntimeEffect`) backed by `skia-safe` for macOS and Linux.
