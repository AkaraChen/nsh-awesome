---
entryId: nsh-skia
lang: en
title: "nsh-skia: Skia 2D Canvas & Shaders for Native Shell"
description: Implements react-native-skia primitives and RuntimeEffect on skia-safe with verified macOS Metal and Linux OpenGL GPU views; Web is unsupported.
h1: "nsh-skia: Skia 2D Drawing & RuntimeEffect Shaders for NSH"
summary: Hybrid Rust + TSX port of react-native-skia onto skia-safe (rust-skia 0.157.0) by SuperNSH, featuring hardware GPU canvas views verified on macOS Metal and Linux OpenGL.
updatedAt: 2026-11-25
platformSupport:
  heading: Platform GPU Verification Matrix
  overview: GPU canvas views exist and are verified only on macOS and Linux in `0.1.0`; other targets either fall back in memory or are excluded.
  matrix:
    - platform: macOS
      status: Verified (Ganesh on Metal)
      notes: Dedicated render thread; headless tests and windowed gallery verified on Apple Silicon.
    - platform: Linux
      status: Verified (Ganesh GL in GtkGLArea)
      notes: Tested on arm64 X11 and Wayland (weston) with `llvmpipe` software GL; real Linux GPUs and x86-64 windows untested upstream.
    - platform: iOS, Android, Windows
      status: In-memory fallback (unverified)
      notes: No GPU view yet; draws in memory to an image. Upstream notes these targets were not built or run.
    - platform: Web
      status: Unsupported
      notes: Skia has no build for NSH's WebAssembly target.
securityNote:
  heading: Vendored Crate, Binary Download & Linux Symbol Note
  body: Installing `nsh-skia` fetches `vendor/skia-safe` (`rust-skia 0.157.0`) and triggers `skia-bindings` build scripts that download prebuilt C++ Skia archives during `cargo build` (adding 17–20 MB to app size). Keep feature sets aligned with upstream `Cargo.toml` so Cargo does not fall back to compiling Skia from C++ source.
related:
  - id: nsh-webgpu
    path: /nshm/nsh-webgpu/
    name: nsh-webgpu
    reason: Choose WebGPU instead if you need Web support, iOS/Android GPU canvases, or WGSL compute shaders.
  - id: nsh-graph
    path: /nshm/nsh-graph/
    name: nsh-graph
    reason: Runs on NSH's built-in `<Canvas>` across all targets without a 17–20 MB Skia binary footprint.
  - id: nsh-o11y
    path: /nshm/nsh-o11y/
    name: nsh-o11y
    reason: Lighter `<Canvas>` telemetry charts that work identically on mobile, desktop, and Web.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: Read How GitHub Org Enumeration Found SuperNSH/skia
---

## Declarative Skia Scene Nodes Without a React Reconciler

`nsh-skia` exposes the familiar `react-native-skia` declarative JSX components (`<Canvas>`, `<Circle>`, `<Path>`, `<Fill>`, `<Group>`, `<LinearGradient>`, `<BlurMask>`, `<Mask>`, `<Repeat>`) alongside imperative APIs (`Skia.Path`, `Skia.Paint()`, `Skia.RuntimeEffect`, `Skia.Surface.MakeOffscreen`) and `useClock()` for NSH apps.

Because Native Shell is signal-based rather than React-reconciled, each TSX component instantiates a retained Rust scene node (`scene.rs`). Reactive expressions (`r={r()}`) or accessors update individual node properties directly, and Rust records the Skia frame—exposing native `#[native_module("nsh-skia/native")]` bindings backed by vendored `rust-skia 0.157.0` (`vendor/skia-safe` renames HarfBuzz and `libwebp` symbols on Linux to avoid clashes).

## Pixel Parity, Prebuilt Binary Size & Strict Platform Scope

Upstream compares 48 scenes rendered by `nsh-skia` and upstream `react-native-skia` (on CanvasKit): the 46 non-text scenes drawable in CanvasKit match within at most 2 of 255 in any RGB/alpha channel (`docs/evidence/parity`). Use `<Repeat>` instead of `<Each>` inside `<Canvas>` when scenes exceed 32 rows so every element stays rendered.

Unlike `nsh-webgpu`, `nsh-skia` carries explicit platform boundaries: **Web is completely unsupported** (Skia has no build for NSH's web target), and **iOS, Android, and Windows currently have no GPU canvas view** (they fall back to in-memory snapshots shown as images and were neither built nor run upstream).

- macOS and Linux desktop apps requiring Skia gradients, `BlurMask`, clipping masks, rich vector paths, or `Skia.RuntimeEffect` shaders.
- Server/CLI or desktop offscreen image rendering (`Skia.Surface.MakeOffscreen(256, 256)!.makeImageSnapshot().encode()`).
- Porting existing `react-native-skia` 2D artwork to NSH desktop targets using signals/computed in place of Reanimated shared values.

## GitHub-Only Installation & Linux System Library Prerequisites

`Cargo.toml` marks `publish = false` at the repository root and vendors two `rust-skia` crates under `/vendor`, so `nsh-skia` is not on crates.io and installs via `nsh add github:SuperNSH/skia`.

- Requires Rust `1.97` (`edition = "2024"`), `nsh >= 0.7.1`, and network access during the first Cargo build to download prebuilt `rust-skia` binaries (~18 MB on macOS, ~26 MB on Linux), adding roughly 17–20 MB to packaged app binaries.
- Linux builds require glibc `2.35+` and system dev packages: `libgl-dev libegl-dev libgles-dev libwayland-dev libx11-dev libfontconfig1-dev libfreetype-dev`.
- Do not target `--target web`; Skia compilation is disabled on `wasm32` (`#[cfg(not(target_arch = "wasm32"))]`).

## Architecture Modules & Upstream Limitations

Combines `tsx/` API exports with `src/` engine bindings and vendored `rust-skia`.

- **tsx/ ("nsh-skia"):** Declarative `<Canvas>` primitives, `useClock()`, `Skia.*` imperative classes, and `<Repeat>`.
- **src/view/ & scene.rs:** Native `GtkGLArea` (Linux) and Metal (macOS) canvas views (`#[native_module("nsh-skia/native")]`).
- **Known untested areas upstream:** Text parity across system fonts, physical Linux GPUs, x86-64 Linux windows, resizing under load, and long-run leak testing.

## nsh 0.7.1 Verification Record

Verified cleanly on `nsh 0.7.1 (f78eace)` with `nsh add github:SuperNSH/skia`, resolving `0.1.0` (`MIT`, updated `2026-11-25`) from `git+https://github.com/SuperNSH/skia`.

Scope boundary: Awesome NSH CI verifies `nsh add` manifest parsing and `nsh.lock` entry creation only; it does not download prebuilt `skia-safe` archives or run macOS Metal / Linux `GtkGLArea` window tests.
