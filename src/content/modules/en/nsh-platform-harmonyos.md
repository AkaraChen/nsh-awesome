---
entryId: nsh-platform-harmonyos
lang: en
title: "nsh-platform-harmonyos: ArkUI Target Backend for NSH"
description: Compile and package Native Shell apps for HarmonyOS and OpenHarmony with --target harmonyos; install v0.1.1 via GitHub to avoid crates.io 0.1.0 manifest errors.
h1: "nsh-platform-harmonyos: HarmonyOS & OpenHarmony ArkUI Target"
summary: Community platform nshm maintained by huacnlee (built on ArkUI work originally by @richerfu), enabling `nsh run/package/test --target harmonyos` for HarmonyOS NEXT and OpenHarmony.
updatedAt: 2026-11-26
platformSupport:
  heading: Target OS & Architecture Matrix
  overview: Focuses exclusively on HarmonyOS and OpenHarmony stage-model targets rather than desktop or browser environments.
  matrix:
    - platform: OpenHarmony (`--runtime-os openharmony`)
      status: Verified on API 26 emulator
      notes: Builds, debug-signs without DevEco Studio, installs via `hdc`, and runs TSX gallery + Rust counter.
    - platform: HarmonyOS NEXT (`--runtime-os harmonyos`)
      status: Supported (API 20+)
      notes: 'Generates DevEco project (`runtimeOS: "HarmonyOS"`); ran on phone in earlier `longbridge/nsh#475`; requires Huawei signing configs for HAP install.'
    - platform: Architectures (`--arch`)
      status: arm64, armv7a, x86_64
      notes: "`nsh package` defaults to `arm64`; `run`/`dev`/`test` match connected device architecture."
securityNote:
  heading: Host Runner Binary & HarmonyOS Manifest Merging
  body: Running `--target harmonyos` compiles the `nsh-platform-harmonyos` host program locally into `.nsh/platforms/harmonyos` and links every `nsh.lock` crate into `libnsh_platform_harmonyos.so`. Review crate-contributed `[package.metadata.nsh.harmonyos]` permissions and `.har` dependencies before distributing signed HAP packages.
related:
  - id: nsh-extra
    path: /nshm/nsh-extra/
    name: nsh-extra
    reason: Integrates optional `speech` recognition hooks directly via `nsh-platform-harmonyos`'s `speech` Cargo feature.
  - id: nsh-omarchy
    path: /nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: Cross-platform UI controls running cleanly atop HarmonyOS ArkUI surface views.
  - id: nsh-widgets
    path: /nshm/nsh-widgets/
    name: nsh-widgets
    reason: Compare another module extending NSH beyond built-in official platform targets.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /framework/
    label: Contrast with 8 Official Built-In Platform Backends
  - path: /discovery/
    label: See Why crates.io 0.1.0 Fails `nsh add`
---

## External Platform Extension Point Rendering Native ArkUI Views

Rather than shipping inside `longbridge/nsh`, `nsh-platform-harmonyos` is implemented on NSH's public platform extension points (`nsh.json` `"platform": "harmonyos"`). It builds both a host runner CLI (`[[bin]] nsh-platform-harmonyos`) and an N-API ArkUI backend library (`libnsh_platform_harmonyos.so` on `OH_ArkUI_*` and `OH_Drawing_Typography`), rendering Rust, TSX, and mixed Rust+TSX NSH apps inside a stage-model `EntryAbility` + `NshSurface`.

Inside app code, `platform.name === "harmonyos"` while `platform.os === "android"` so Android mobile conventions—such as system back gestures, `android={{...}}` props, and `platform.select({ android })`—apply cleanly. The runner also reads `[package.metadata.nsh.harmonyos]` and feature-scoped `[package.metadata.nsh.features.<name>.harmonyos]` entries (`permissions`, `querySchemes`, `abilities`, `dependencies`, `strings`) from linked crates and merges them into `module.json5` and `oh-package.json5`.

## Community Support Boundary & Device/Emulator Status

Upstream explicitly emphasizes that HarmonyOS is **a community platform outside `longbridge/nsh`**: NSH itself does not ship, test, or support this target, so issues and pull requests belong on `huacnlee/nsh-platform-harmonyos`. On an OpenHarmony 7.0 (API 26) emulator, upstream confirms the TSX gallery and Rust counter build, sign (debug keys), and run via `nsh run --target harmonyos --runtime-os openharmony`, while Huawei phones require DevEco Studio debug or release signing configs (HarmonyOS NEXT 5.0+ shares OpenHarmony's ArkUI C API, NDK, and `aarch64-unknown-linux-ohos` ABI).

Apps delivering dynamic modules at runtime should review AppGallery rules beforehand, and keep in mind that future `nsh` versions may add new mount items skipped until the backend implements them.

- Extending existing Rust or TSX NSH 0.7 applications to Huawei HarmonyOS NEXT (API 20+ / HarmonyOS 6.0+) and OpenHarmony devices.
- Running device UI tests on emulators or phones via `nsh test --target harmonyos --device <ID>` (JUnit XML supported).
- Embedding `NshSurface` views inside an existing HarmonyOS ArkTS app via `@nsh/harmonyos` (`docs/embedding.md`).

## Why You Must Install v0.1.1 from GitHub Instead of crates.io 0.1.0

On `crates.io`, `nsh-platform-harmonyos` currently sits at `0.1.0`, which predates the `"platform": "harmonyos"` manifest key in `nsh.json` and causes `nsh add nsh-platform-harmonyos` to fail with `no #[native_module("...")] at the crate's root: is this an nshm?`. Installing via `nsh add github:huacnlee/nsh-platform-harmonyos` pulls `0.1.1`, which includes `"platform": "harmonyos"`.

- Requires `nsh 0.7`+, Rust target `rustup target add aarch64-unknown-linux-ohos`, and OpenHarmony NDK API 20+ (`OHOS_NDK_HOME` or DevEco Studio).
- HAP packaging/running requires either DevEco Studio tools (`hvigorw`, `ohpm`, `hdc`) or standalone OpenHarmony SDK (`OHOS_BASE_SDK_HOME`), npm `@ohos/hvigor` + `@ohos/hvigor-ohos-plugin` (`HVIGOR_HOME`), and Java.
- Huawei phone deployments require configuring a developer signing certificate in DevEco Studio once per generated project.

## Backend Cargo Features & HarmonyOS Metadata Keys

Host CLI compiles with `default = []`, while the on-device runner enables `backend` (`editor`, `plot`, `term`, `math`, `zlib`, `crypto`, `websocket`, etc.).

- **speech (optional feature):** Registers HarmonyOS HMS speech recognizer with `nsh-extra` when an app activates `nsh-extra` `speech`.
- **api-23 / api-26 & dev:** Enables ArkUI accessibility providers and `nsh dev` hot reload (`nsh-dev` + `nsh-testing`).
- **[package.metadata.nsh.harmonyos]:** Allows third-party crates to contribute OHOS `permissions`, `querySchemes`, `abilities`, `extensionAbilities`, `.har` `dependencies`, and `strings`.

## nsh 0.7.1 Verification Record

CI cleanly ran `nsh add github:huacnlee/nsh-platform-harmonyos` against `nsh 0.7.1 (f78eace)`, resolving `0.1.1` (`Apache-2.0`, updated `2026-11-26`) at `git+https://github.com/huacnlee/nsh-platform-harmonyos`.

Scope boundary: Awesome NSH CI confirms `nsh add` recognizes the `"platform": "harmonyos"` manifest on `0.7.1` and records `nsh.lock`. Cross-compiling `aarch64-unknown-linux-ohos` with OpenHarmony NDK, building HAP packages, and booting emulators were not run in CI.
