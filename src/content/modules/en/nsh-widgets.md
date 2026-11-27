---
entryId: nsh-widgets
lang: en
title: "nsh-widgets: Home Widgets & Live Activities for NSH"
description: One Widget Tree IR renders natively via WidgetKit, RemoteViews, KDE Plasma, and GNOME; use Git --rev master on nsh 0.7.1 instead of crates.io 0.4.1.
h1: "nsh-widgets: Cross-Platform Home Widgets & Live Activities"
summary: Hybrid Rust + TSX nshm by SuperNSH that defines home-screen widgets, iOS Live Activities, Control Center controls, and Quick Settings tiles once in Widget Tree IR v1.
updatedAt: 2026-11-26
platformSupport:
  heading: Native Widget Host Matrix & Upstream Verification Notes
  overview: Upstream `README.md` distinguishes carefully between simulator/VM checks and unverified hardware/OS targets.
  matrix:
    - platform: iOS
      status: Verified on iOS 27 simulator
      notes: Home screen, lock screen, Live Activities / Dynamic Island, edit sheet, and iOS 18 Control Center; physical iPhone untested.
    - platform: Android
      status: Verified on API 37 emulator
      notes: RemoteViews, API 31+ scrolling lists, configure screen, and Quick Settings tiles; physical device untested.
    - platform: Linux (KDE / GNOME / Cinnamon / X11 / Wayland)
      status: Verified across VMs/probes
      notes: KDE Plasma 5.27 & 6.3, GNOME 45–51 probe, Cinnamon 6.0–6.6, Xfce, and layer-shell (sway/KWin/labwc); Hyprland/COSMIC untested.
    - platform: macOS
      status: 0.2.0 builds unrendered
      notes: 0.1.0 widgets rendered on macOS; 0.2.0+ extension builds with options but Mac runtime rendering was unverified upstream.
    - platform: Windows & Web
      status: No native widget host
      notes: No Windows widget host in `0.4.1`; `nsh-widgets show` supports terminal text and Waybar JSON.
securityNote:
  heading: Build Script, AAR Binary & Extension Packaging Notice
  body: "`nsh-widgets` ships `build.rs`, JNI bindings on Android, a prebuilt `android/nsh-widgets.aar` injected via `[package.metadata.nsh.android]`, and requires running `nsh-widgets build` to emit Swift/QML/JS extension files. Inspect the AAR checksum script (`scripts/check-aar.sh`) and pinned `?rev=master` commit before production builds."
related:
  - id: nsh-omarchy
    path: /nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: Build main desktop/mobile app windows while `nsh-widgets` owns home-screen and desktop panel widgets.
  - id: nsh-shadcn
    path: /nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: Alternative in-app UI layer pairing naturally with native OS widgets.
  - id: nsh-extra
    path: /nshm/nsh-extra/
    name: nsh-extra
    reason: Shares the `[package.metadata.nsh]` packaging pattern for bundling OS extensions and manifests.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: Inspect Why crates.io 0.4.1 Fails on nsh 0.7.1
---

## One Declarative Widget Tree IR Across Four Native Widget Hosts

Native OS widgets cannot execute an application's main JS runtime inside home-screen extensions. `nsh-widgets` solves this with Widget Tree IR v1: apps describe widget UI once in TSX (`nsh-widgets/base`, `nsh-widgets/kit`) or Rust JSON (`nsh_widgets::update_data`), and shared native renderers draw the tree inside each OS extension model.

On iOS and macOS, `crates/nsh-widgets-cli` compiles a single Swift renderer (`NshWidgets.swift`) into WidgetKit extensions, covering home-screen families, lock-screen widgets, Live Activities (Dynamic Island), edit sheets, and iOS 18 Control Center controls. On Android, the crate bundles `android/nsh-widgets.aar` via `[package.metadata.nsh.android]` to drive RemoteViews, scrolling lists (API 31+), configure screens, and Quick Settings tiles. On Linux, the companion CLI generates KDE Plasma 5/6 QML plasmoids, GNOME Shell 45–51 extensions, Cinnamon 6 desklets, X11/Wayland `gtk-layer-shell` windows, and Waybar JSON output.

## Interactive Actions, Companion CLI & Current Gaps

Widget buttons update shared store data even when the main app process is closed—via App Intents on Apple platforms and non-exported broadcast receivers on Android—and apps drain queued user actions through `take_actions`, `next_change`, or `Widgets.onChange(...)`.

According to upstream `README.md` (`0.4.1`, verified 23–24 Nov 2026 on emulators/VMs), Windows widget hosts, COSMIC applets, Wayland compositors without layer-shell, and physical iPhone/Android devices are NOT covered in `0.4.1` (use `nsh-widgets show --format waybar` for terminal or status-bar fallback).

- Shipping iOS Live Activities (compact/expanded Dynamic Island and lock screen) alongside Android Quick Settings tiles from one TypeScript tree.
- Generating KDE Plasma plasmoids and GNOME Shell top-bar/popup widgets from the same store without writing separate QML or GJS extensions by hand.
- Previewing multi-size widget layouts locally on desktop with `nsh-widgets preview --simulator` before building mobile extensions.

## Why You Must Pass `--rev master` on nsh 0.7.1

Even though `nsh-widgets 0.4.1` exists on crates.io and as git tag `v0.4.1`, both still carry `"nsh": "^0.6"` in their published `nsh.json`, causing `nsh add nsh-widgets` and `nsh add github:SuperNSH/widgets` to fail on `nsh 0.7.1` (`nsh.json requires nsh ^0.6; this is nsh 0.7.1`). Passing the full HTTPS Git URL with `--rev master` pulls the updated `"nsh": "^0.7.1"` manifest.

- Requires `nsh 0.7.1+` (uses `ios.extensions`, `macos.extensions`, `android.libraries`, and AAR manifest merging) and the companion `nsh-widgets` CLI (`cargo install nsh-widgets-cli` or GitHub releases).
- Apple extensions require macOS with Xcode 26+ (`appintentsmetadataprocessor`); Live Activities need iOS 16.2+ and Control Center controls need iOS 18+.
- Android builds require API 26+ (API 31+ for switches, rounded corners, and scrolling lists); Linux desktops require `kpackagetool5`/`6` or GNOME/Cinnamon/GTK 3 with `nsh-widgets` installed on the target machine.

## Package Exports & Companion CLI Subcommands

Exposes three TSX module paths alongside the Rust store and external `nsh-widgets-cli` binary.

- **nsh-widgets:** `Widgets` runtime API (`setUi`, `update`, `onChange`, `startActivity`, store sync).
- **nsh-widgets/base & nsh-widgets/kit:** Low-level IR primitives and styled components (`Card`, `Stat`, `ActionButton`, `ButtonRow`).
- **nsh-widgets-cli:** External helper (`init`, `build`, `preview`, `show`, `plasmoid`, `gnome`, `cinnamon`, `window`, `doctor`).

## nsh 0.7.1 Verification Record

Verified cleanly in CI using `nsh add https://github.com/SuperNSH/widgets.git --rev master`, resolving `nsh-widgets@0.4.1` (`MIT`, updated `2026-11-26`) to `git+https://github.com/SuperNSH/widgets.git?rev=master`.

Scope boundary: Awesome NSH verifies `nsh add` manifest acceptance and lockfile generation only. Upstream's 10 store tests, 21 CLI tests, 15 TS tests, and simulator screenshots are self-reported by `SuperNSH/widgets` and not re-run by Awesome NSH CI.
