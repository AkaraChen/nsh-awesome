# nsh-webgpu

> WebGPU (`navigator.gpu`, `GPUDevice`, `<Canvas getContext("webgpu")>`) for NSH apps ported from react-native-webgpu onto wgpu 29.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-webgpu/](https://nsh-awesome.vercel.app/nshm/nsh-webgpu/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-webgpu.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-webgpu` |
| Category | Charts, Graphs & GPU Canvas (`visualization`) |
| Kind | Hybrid Rust + TSX nshm (`hybrid-nshm`) |
| Source Type | `github` |
| Package Version | `0.1.0` |
| NSH Requirement | `>=0.7.1` |
| Platforms | macOS, iOS, Android, Windows, Linux, Web |
| License | MIT |
| Updated | 2026-11-25 |
| Source Repository | [https://github.com/SuperNSH/webgpu](https://github.com/SuperNSH/webgpu) |

## Installation & Verification

```bash
nsh add github:SuperNSH/webgpu
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

GitHub-only (`publish = false` in Cargo.toml).

## Related Modules in This Category

- [nsh-graph](https://nsh-awesome.vercel.app/nshm/nsh-graph.md) — Interactive network graph component on native `<Canvas>` with force, hierarchical, circular, and grid layouts plus an opt-in Rust backend.
- [nsh-o11y](https://nsh-awesome.vercel.app/nshm/nsh-o11y.md) — High-throughput observability charts (`TimeSeriesChart`, `LogView`, `TraceWaterfall`, `FlameGraph`) using M4 pyramid decimation and an optional Rust store.
- [nsh-skia](https://nsh-awesome.vercel.app/nshm/nsh-skia.md) — Skia 2D canvas and drawing primitives (`<Canvas>`, `<Circle>`, `<Path>`, `Skia.RuntimeEffect`) backed by `skia-safe` for macOS and Linux.
