---
entryId: nsh-webgpu
lang: en
title: "nsh-webgpu: Native wgpu 29 WebGPU API for NSH"
description: Exposes navigator.gpu, GPUDevice, and WebGPU <Canvas> in Native Shell via wgpu 29; marked publish = false in Cargo.toml so install from GitHub.
h1: "nsh-webgpu: WebGPU Specification Port on wgpu 29 for NSH"
summary: Hybrid Rust + TSX port of react-native-webgpu onto wgpu 29 by SuperNSH, exposing navigator.gpu, GPUDevice, WGSL pipelines, and <Canvas getContext("webgpu")> across six platforms.
updatedAt: 2026-11-25
platformSupport:
  heading: Upstream Verification & Adapter Matrix (0.1.0)
  overview: Upstream `SuperNSH/webgpu` documents exact GPU adapter coverage and explicit exclusions per platform.
  matrix:
    - platform: macOS & Mac Catalyst
      status: Verified on Apple Silicon Metal
      notes: Runs `cargo test`, 89 headless tests, onscreen Triangle/Cube CI, and 44/45 gallery tests.
    - platform: iOS
      status: Verified on iOS 27 simulator (Metal)
      notes: Triangle, rotating Cube, and 44 gallery tests verified on simulator; physical iPhone untested.
    - platform: Android
      status: 38/44 gallery tests on GLES emulator
      notes: 6 tests fail due to GLES 3.1/GLSL limits; opaque GL surfaces prevent transparent canvas compositing and surface `COPY_SRC`; physical Android untested.
    - platform: Windows
      status: CI verified on DX12 WARP
      notes: Passes `cargo test` and onscreen window CI on WARP software adapter; hardware GPU untested; optional `static-dxc` downloads DXC binary.
    - platform: Linux
      status: CI verified on Vulkan lavapipe
      notes: Runs headless and windowed in CI (arm64/x86_64) via software Vulkan; Import External Texture unsupported on Vulkan; hardware GPU untested.
    - platform: Web
      status: Verified in Chromium WebGPU
      notes: 44 gallery tests and tour verified via browser WebGPU.
securityNote:
  heading: Rust 1.97 Toolchain & `static-dxc` Binary Download Note
  body: Compiling `nsh-webgpu` pulls `wgpu 29` with `metal`, `dx12`, `vulkan`, and `gles` backends plus `pollster` and `serde`. Enabling `static-dxc` on Windows downloads a multi-megabyte DXC library verified by SHA-256 at build time.
related:
  - id: nsh-skia
    path: /nshm/nsh-skia/
    name: nsh-skia
    reason: Choose Skia when you need `react-native-skia` 2D drawing primitives and gradients rather than raw WebGPU/WGSL.
  - id: nsh-graph
    path: /nshm/nsh-graph/
    name: nsh-graph
    reason: Built-in `<Canvas>` graph component if you only need network topology diagrams without managing GPU buffers.
  - id: nsh-o11y
    path: /nshm/nsh-o11y/
    name: nsh-o11y
    reason: Prebuilt `<Canvas>` telemetry charts when custom WGSL shaders would be overkill.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: How GitHub Org Enumeration Found SuperNSH/webgpu
---

## WebGPU Spec Classes Backed by wgpu 29 Instead of Dawn

`nsh-webgpu` ports `react-native-webgpu` to Native Shell by replacing Google Dawn with `wgpu 29`—the same GPU abstraction layer NSH itself uses internally. Inside Rust (`src/lib.rs`), `#[module]` APIs and a handle registry manage `wgpu` instances, buffers, textures, encoders, and per-platform native surface components (`#[native_components(<platform>)]`), while `tsx/index.tsx` exposes spec classes (`GPU`, `GPUDevice`, `GPUBuffer`, `GPUOffscreenCanvas`), `navigator.gpu`, `requestAnimationFrame`, `createImageBitmap`, and hooks (`useDevice`, `useCanvasRef`, `useSurface`, `GPUDeviceProvider`, `useMainDevice`).

Where `wgpu 29` lacks a Dawn-specific upstream extension—such as Dawn device import, platform hardware buffers, or video texture import—the TypeScript exports retain their names and throw structured `ERR_WEBGPU_UNSUPPORTED` errors (`docs/parity.md` lists each case explicitly).

## Comparing nsh-webgpu vs nsh-skia & Platform Caveats

Choose `nsh-webgpu` when writing WGSL compute/render shaders, 3D graphics, or porting existing `react-native-webgpu` codebases across desktop, mobile, and browser WebGPU. Unlike `nsh-skia`, `nsh-webgpu` does run on NSH's Web target (delegating to the browser's native WebGPU) and supports GPU canvas surfaces on mobile emulators.

Be mindful of upstream's candid platform notes: Windows and Linux CI tested software adapters (DX12 on WARP and Vulkan on lavapipe, where `wgpu 29` lacks Import External Texture), Android GLES emulators pass 38 of 44 gallery tests with opaque black clearing (no `alphaMode: "premultiplied"` compositing or `COPY_SRC` surface readback), and physical iPhone, Android, or hardware Windows/Linux GPUs remain explicitly unverified upstream.

- Custom 3D scenes, compute shaders, and WGSL post-processing shared between NSH desktop/mobile hosts and WebGPU browsers.
- Porting `react-native-webgpu` hooks (`useDevice`, `useCanvasRef`) directly into Native Shell TSX applications.
- Headless offscreen GPU rendering (`GPUOffscreenCanvas`) and image bitmap decoding in Rust + TSX workflows.

## Why nsh-webgpu Is GitHub-Only (`publish = false`)

`Cargo.toml` explicitly sets `publish = false` at the repository root (referencing temporary Git packaging considerations), so `nsh-webgpu` returns 404 on crates.io. Installing via `nsh add github:SuperNSH/webgpu` reads the root `Cargo.toml` and `nsh.json` directly.

- Requires `nsh >= 0.7.1` and Rust toolchain `rust-version = "1.97"` (`edition = "2024"`).
- Windows `x86_64` MSVC projects can enable the `static-dxc` Cargo feature so `wgpu` uses DXC instead of system FXC for strict WGSL shaders.
- Browser target relies on the client browser supporting the WebGPU API.

## Cargo Features & Native Surface Exports

Single hybrid package exporting `nsh-webgpu` in TSX and `nsh_webgpu::api` in Rust.

- **static-dxc (Windows feature):** Turns on `wgpu/static-dxc` on x86_64 MSVC so `wgpu` fetches and SHA-256 checks DXC during build instead of failing on system FXC.
- **nsh.json export ("nsh-webgpu"):** Exposes WebGPU DOM classes, `navigator.gpu`, `GPUOffscreenCanvas`, and React-style hooks from `tsx/index.tsx`.
- **nsh_webgpu::api (Rust):** Allows native Rust modules to interact directly with the `wgpu 29` object registry.

## nsh 0.7.1 Verification Record

Automated CI verified `nsh add github:SuperNSH/webgpu` on `nsh 0.7.1 (f78eace)`, resolving `0.1.0` (`MIT`, updated `2026-11-25`) at `git+https://github.com/SuperNSH/webgpu`.

Scope boundary: Awesome NSH verifies scratch-app `nsh add` installation only. The 44-test gallery figures, WARP/lavapipe CI notes, and GLES limitations summarize upstream `SuperNSH/webgpu` documentation rather than local Awesome NSH GPU runs.
