---
entryId: nsh-omarchy
lang: en
title: "nsh-omarchy: Theme-Following UI Kit for Native Shell"
description: Built on nsh-base for Rust and TSX apps, this Omarchy-styled library tracks system colors live and falls back to Tokyo Night dark or Flexoki Light.
h1: "nsh-omarchy: Live System-Themed UI Components for NSH"
summary: A port of gpui-omarchy built atop nsh-base 0.7.0, offering nine UI families—from inputs and overlays to data tables and charts—for both Rust and TSX Native Shell apps.
updatedAt: 2026-11-25
platformSupport:
  heading: Cross-Platform Behavior & Fallback Notes
  overview: Components run across all six standard desktop, mobile, and web NSH targets, with live filesystem theme watching active where Omarchy theme files exist.
  matrix:
    - platform: Linux (Omarchy)
      status: Supported + live file watch
      notes: Reads `~/.local/state/omarchy/current/theme/colors.toml` and updates reactive color tokens when the system theme switches.
    - platform: macOS & Windows
      status: Supported (palette fallback)
      notes: Uses Tokyo Night (dark) or Flexoki Light automatically when no Omarchy state file is present.
    - platform: iOS & Android
      status: Supported (palette fallback)
      notes: Desktop-dense controls render via native mobile views; non-Omarchy targets use built-in dark/light fallbacks.
    - platform: Web
      status: Supported (live demo published)
      notes: Upstream publishes a live TSX gallery built with NSH WebAssembly DOM backend at `huacnlee.github.io/nsh-omarchy/`.
securityNote:
  heading: Build & Runtime File-Access Note
  body: Compiling `nsh-omarchy` pulls `nsh-base`, `toml`, and `chrono` through Cargo, executing upstream Rust and procedural macros (`#[native_module("nsh-omarchy")]`). On non-WASM targets it enables `chrono` clock features and inspects `~/.local/state/omarchy/current/theme/colors.toml` when theme following is active.
related:
  - id: nsh-shadcn
    path: /nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: Alternative Rust-backed UI kit porting shadcn/ui new-york-v4 classes and adding Chat components.
  - id: nsh-icon
    path: /nshm/nsh-icon/
    name: nsh-icon
    reason: Same author (`huacnlee`), cleanly supplying `<Icon>` vectors alongside `nsh-omarchy` buttons and menus.
  - id: nsh-platform-harmonyos
    path: /nshm/nsh-platform-harmonyos/
    name: nsh-platform-harmonyos
    reason: Community ArkUI backend extending NSH UI apps built with `nsh-omarchy` onto HarmonyOS and OpenHarmony.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /framework/
    label: Inspect `nsh-base` in Framework Crates
---

## System Palette Tracking & Dual Rust/TSX Components

Authored by `huacnlee`, `nsh-omarchy` brings the Omarchy desktop aesthetic—square corners, a single accent color, foreground-tinted interaction states, clear focus rings, and compact keyboard-first controls—to Native Shell. `nsh-base` handles accessibility, focus routing, popups, and keyboard behavior, while `nsh-omarchy` renders the visual presentation.

At startup (`om::init()` in Rust or `Omarchy.followSystem()` in TSX), the library reads `~/.local/state/omarchy/current/theme/colors.toml` and subscribes to changes live. When running outside an Omarchy desktop environment—such as macOS, Windows, mobile, or Web—it falls back cleanly to built-in Tokyo Night (dark) or Flexoki Light palettes, or lets apps lock a palette via `Theme::tokyo_night().apply()` and `applyTheme(...)`.

## Component Scope & Comparing with nsh-shadcn

Nine families cover Actions (`Button`, `Toggle`), Choices (`Checkbox`, `Switch`, `Slider`), Fields (`Input`, `NumberInput`, `OtpInput`, `Calendar`, `DatePicker`, `ColorPicker`), Navigation (`Tabs`, `Sidebar`, `Accordion`, `Menu`, `TitleBar`), Overlays (`Dialog`, `Sheet`, `Toaster`), Data (`DataTable`, `Tree`, `ResizablePanelGroup`), Display (`Markdown`, `Code`, `Keycap`), Charts (`LineChart`, `AreaChart`, `BarChart`, `PieChart` via `nsh-base/plot`), and Theme utilities.

Compared with `nsh-shadcn`, `nsh-omarchy` is at `0.2.0` on crates.io with `nsh-base/plot` charts enabled by default and Omarchy theme file watching, whereas `nsh-shadcn` is an early `0.1.0` port (with `0` crates.io downloads on initial upload and documented `Navigation Menu` and `Sidebar` caveats) aimed at developers who specifically want shadcn/ui `new-york-v4` styling or built-in Chat primitives.

- Desktop settings panels, developer utilities, and keyboard-centric tools built with `Sidebar`, `DataTable`, `Tree`, and `Keycap`.
- Cross-platform apps sharing identical Rust and TSX theme tokens (`nsh_omarchy::tokens` or `themes/omarchy.json`) across light and dark modes.
- Compact dashboards combining native forms with built-in line, area, bar, and pie charts without adding a separate charting dependency.

## crates.io Installation & Optional Theme File Setup

`nsh-omarchy@0.2.0` depends on published `nsh-core = "0.7.0"` and `nsh-base = "0.7.0"` on crates.io, so `nsh add nsh-omarchy` resolves straight from crates.io without GitHub flags. Rust apps can alternatively specify `nsh-omarchy = "0.2"` in `Cargo.toml`.

- Requires `nsh >= 0.7` and a local Rust toolchain to compile the crate (plus `wasm32` target for `--target web`).
- Default `chart` feature enables `nsh-base/plot` (`default-features = false` in Rust can omit charts if unused).
- To use extra Omarchy theme roles (`bg-surface`, `border-omarchy-accent`) in custom TSX views, copy `themes/omarchy.json` from upstream into your project and set `"theme": "omarchy.json"` in `nsh.json`.

## Theme API & Cargo Feature Structure

Minimal feature surface paired with explicit Rust/TSX theme controls.

- **chart (default feature):** Enables `nsh-base/plot` for `LineChart`, `AreaChart`, `BarChart`, and `PieChart`.
- **Omarchy / Theme API:** Exposes `followSystem()`, `stopFollowing()`, `applyTheme("tokyo-night" | "flexoki-light")`, `onChange`, and `shortcutLabel`.
- **nsh_omarchy::tokens:** Reactive color and spacing tokens (`surface()`, `accent()`, `CONTROL_MD`, `SPACE_4`, `DURATION_FAST`) designed for closure-backed Rust props.

## nsh 0.7.1 Verification Record

Scratch-app verification on `nsh 0.7.1 (f78eace)` resolved `nsh add nsh-omarchy` to `0.2.0` (`crates.io`, `MIT`, updated `2026-11-25`) cleanly without extra Cargo flags.

Verification covers clean dependency addition into `nsh.json` and `nsh.lock` only; Awesome NSH CI does not compile the full TSX gallery or test live Omarchy `colors.toml` reloading on Linux desktops.
