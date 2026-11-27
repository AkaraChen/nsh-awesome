# nsh-o11y

> High-throughput observability charts (`TimeSeriesChart`, `LogView`, `TraceWaterfall`, `FlameGraph`) using M4 pyramid decimation and an optional Rust store.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-o11y/](https://nsh-awesome.vercel.app/nshm/nsh-o11y/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-o11y.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-o11y` |
| Category | Charts, Graphs & GPU Canvas (`visualization`) |
| Kind | Hybrid Rust + TSX nshm (`hybrid-nshm`) |
| Source Type | `crates.io` |
| Package Version | `0.1.0` |
| NSH Requirement | `>=0.7` |
| Platforms | iOS, Android, macOS, Windows, Linux, GPUI, Web |
| License | Apache-2.0 |
| Updated | 2026-11-25 |
| Source Repository | [https://github.com/JetSquirrel/nsh-o11y](https://github.com/JetSquirrel/nsh-o11y) |
| crates.io | [https://crates.io/crates/nsh-o11y](https://crates.io/crates/nsh-o11y) |
| Docs / Demo | [https://jetsquirrel.github.io/nsh-o11y/](https://jetsquirrel.github.io/nsh-o11y/) |

## Installation & Verification

```bash
nsh add nsh-o11y
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

Supports synchronized crosshairs across panels (`createChartSync`) and live streaming appends.

## Related Modules in This Category

- [nsh-graph](https://nsh-awesome.vercel.app/nshm/nsh-graph.md) — Interactive network graph component on native `<Canvas>` with force, hierarchical, circular, and grid layouts plus an opt-in Rust backend.
- [nsh-webgpu](https://nsh-awesome.vercel.app/nshm/nsh-webgpu.md) — WebGPU (`navigator.gpu`, `GPUDevice`, `<Canvas getContext("webgpu")>`) for NSH apps ported from react-native-webgpu onto wgpu 29.
- [nsh-skia](https://nsh-awesome.vercel.app/nshm/nsh-skia.md) — Skia 2D canvas and drawing primitives (`<Canvas>`, `<Circle>`, `<Path>`, `Skia.RuntimeEffect`) backed by `skia-safe` for macOS and Linux.
