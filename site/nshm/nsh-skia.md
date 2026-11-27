# nsh-skia

> Skia 2D canvas and drawing primitives (`<Canvas>`, `<Circle>`, `<Path>`, `Skia.RuntimeEffect`) backed by `skia-safe` for macOS and Linux.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-skia/](https://nsh-awesome.vercel.app/nshm/nsh-skia/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-skia.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-skia` |
| Category | Charts, Graphs & GPU Canvas (`visualization`) |
| Kind | Hybrid Rust + TSX nshm (`hybrid-nshm`) |
| Source Type | `github` |
| Package Version | `0.1.0` |
| NSH Requirement | `>=0.7.1` |
| Platforms | macOS, Linux |
| License | MIT |
| Updated | 2026-11-25 |
| Source Repository | [https://github.com/SuperNSH/skia](https://github.com/SuperNSH/skia) |

## Installation & Verification

```bash
nsh add github:SuperNSH/skia
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

GitHub-only; hardware GPU views verified on macOS and Linux (Web unsupported; mobile/Windows fall back to in-memory images).

## Related Modules in This Category

- [nsh-graph](https://nsh-awesome.vercel.app/nshm/nsh-graph.md) — Interactive network graph component on native `<Canvas>` with force, hierarchical, circular, and grid layouts plus an opt-in Rust backend.
- [nsh-o11y](https://nsh-awesome.vercel.app/nshm/nsh-o11y.md) — High-throughput observability charts (`TimeSeriesChart`, `LogView`, `TraceWaterfall`, `FlameGraph`) using M4 pyramid decimation and an optional Rust store.
- [nsh-webgpu](https://nsh-awesome.vercel.app/nshm/nsh-webgpu.md) — WebGPU (`navigator.gpu`, `GPUDevice`, `<Canvas getContext("webgpu")>`) for NSH apps ported from react-native-webgpu onto wgpu 29.
