---
entryId: nsh-extra
lang: en
title: "nsh-extra: Official Device Modules for Native Shell"
description: Opt into camera, location, photos, push, and speech via Cargo features in Native Shell 0.7.1, paying only the permissions and binary size you enable.
h1: "nsh-extra: Official Optional Device Modules for NSH"
summary: Official Cargo-feature-gated device capability package maintained in longbridge/nsh, exporting Camera, Location, Photos/PhotosPicker, Push, and Speech to TSX and Rust apps.
updatedAt: 2026-11-25
platformSupport:
  heading: Per-Feature Platform Matrix
  overview: Unlike uniform cross-platform UI crates, `nsh-extra` deliberately scopes each Cargo feature to the platforms that implement its underlying OS bridge in `0.7.1`.
  matrix:
    - platform: camera
      status: iOS, Android
      notes: Desktop and Web are not implemented; Android adds an `IMAGE_CAPTURE` intent query rather than runtime camera permission.
    - platform: location
      status: macOS, iOS, Web
      notes: Uses Apple CoreLocation on macOS/iOS and browser `navigator.geolocation` on Web; adds macOS `personal-information.location` entitlement.
    - platform: photos
      status: iOS only
      notes: Provides recent library reads (`Photos`) and layout-embedded `PhotosPicker` via `#[native_components(ios)]`.
    - platform: push
      status: iOS, Android
      notes: Installs `UIBackgroundModes = ["remote-notification"]` on iOS; Android delegates manifest entries to your chosen push SDK.
    - platform: speech
      status: macOS, iOS, Android, Windows, Web
      notes: "Broadest feature: Apple Speech, Android `RecognitionService` + `RECORD_AUDIO`, Windows `Media_SpeechRecognition`, and Web Speech API."
securityNote:
  heading: Build & System Permission Implications
  body: Because `nsh-extra` automatically merges `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, macOS sandbox entitlements, and Android permissions from `[package.metadata.nsh.features.*]` into your app manifest, enabling unused features can cause mobile app-store reviewers to ask why your binary requests restricted hardware access.
related:
  - id: nsh-platform-harmonyos
    path: /nshm/nsh-platform-harmonyos/
    name: nsh-platform-harmonyos
    reason: Implements companion HarmonyOS permission merging (`[package.metadata.nsh.features.<name>.harmonyos]`) and optional HMS speech hooks.
  - id: nsh-widgets
    path: /nshm/nsh-widgets/
    name: nsh-widgets
    reason: Another module leveraging `[package.metadata.nsh]` to merge platform-native assets (`android/nsh-widgets.aar`) into packaged builds.
  - id: nsh-query
    path: /nshm/nsh-query/
    name: nsh-query
    reason: Pair device/location reads with lifecycle-aware TSX caching without adding another Rust crate.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /framework/
    label: Compare with 19 Non-Installable Framework Crates
  - path: /guides/
    label: Open Official nshm Guide
---

## Modular Device APIs Without Bloating Every App

Rather than bundling camera, geolocation, photo library, push notification, and speech recognition bindings into every Native Shell binary, `longbridge/nsh` places them in `crates/nsh-extra` behind Cargo features with `default = []`. The crate root registers `#[native_module("nsh-extra")]` so TSX code imports PascalCase namespaces such as `Camera` or `Location` from `"nsh-extra"`, while Rust apps call `nsh_extra::camera::take_photo` directly.

Each feature automatically activates only the OS frameworks and app-store declarations it needs. Inside `Cargo.toml`, `[package.metadata.nsh.features.<name>]` specifies per-feature `Info.plist` usage descriptions (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`), macOS sandbox entitlements, `UIBackgroundModes`, and Android manifest queries or `RECORD_AUDIO` permissions that `nsh` merges into the final app bundle.

## When to Use nsh-extra & Feature Trade-offs

Choose `nsh-extra` whenever an application needs first-party camera capture, foreground geolocation, iOS photo library access, remote push delegate hooks, or streaming speech-to-text with official `nsh 0.7.1` parity and built-in test fakes (such as `speech::FakeSpeech`).

Because all five features start disabled by default, passing `--features` at install or editing `nsh.json` `"dependencies.nsh-extra.features"` prevents unused Apple privacy strings or Android permissions from triggering unnecessary App Store or Play Store review disclosures.

- Capturing photos with `Camera.takePhoto({ maxDimension: 2048 })` on iOS and Android without maintaining custom native camera bridges.
- Embedding the native iOS photo picker view (`PhotosPicker` registered via `#[native_components(ios)]`) alongside reactive TSX screens.
- Streaming interim speech transcripts on macOS, iOS, Android, Windows WinRT dictation, and the Web Speech API through one TypeScript interface.

## Installation on nsh 0.7.1 & Source Details

Maintained in `longbridge/nsh` and published alongside the `0.7.1` framework release on crates.io, `nsh-extra` resolves straight from crates.io without Git URLs. Adjust `--features` to match only the capabilities your app enables (for example `--features camera,speech`).

- Requires `nsh 0.7.1` and a local Rust toolchain matching the workspace edition.
- Push on Android expects an external push service SDK binding alongside the iOS `remote-notification` background mode hook.
- Community platform targets like `nsh-platform-harmonyos` may expose matching optional Cargo features (such as HarmonyOS HMS `speech`) when an `nsh-extra` feature is enabled.

## Available Cargo Features & Exported Modules

Five independent features map 1:1 from Rust modules under `nsh_extra::*` to TSX namespaces in `"nsh-extra"`.

- **camera (Camera):** System camera capture on iOS and Android (`tokio` optional dependency).
- **location (Location):** One-shot or watched foreground location (`CoreLocation` on Apple, `web-sys` Geolocation on Web).
- **photos (Photos, PhotosPicker):** Recent photo reads and embedded native `PhotosPicker` UI component on iOS.
- **push (Push):** App delegate registration (`push::install`) and remote notification delivery hooks.
- **speech (Speech):** Live speech recognition with interim transcripts across Apple, Android, WinRT, and Web.

## nsh 0.7.1 Verification Record

Running `nsh add nsh-extra --features camera` in a clean scratch app on `nsh 0.7.1 (f78eace)` resolves `nsh-extra@0.7.1` from `crates.io` (`Apache-2.0`, updated `2026-11-25`) and records the enabled feature flag in `nsh.json` and `nsh.lock`.

Scope boundary: automated CI checks `nsh add nsh-extra --features camera` manifest resolution and lockfile creation only. Actual camera hardware, CoreLocation prompts, WinRT dictation, and iOS `PhotosPicker` behavior require native device builds on target operating systems.
