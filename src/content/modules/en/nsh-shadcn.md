---
entryId: nsh-shadcn
lang: en
title: "nsh-shadcn: Native Rust shadcn/ui Views for NSH"
description: Porting shadcn/ui new-york-v4 components (except form) to native desktop, mobile, and web views in Rust and TSX; install directly via GitHub.
h1: "nsh-shadcn: Native Rust shadcn/ui new-york-v4 for NSH"
summary: A Rust-backed component library by caoxing9 bringing shadcn/ui new-york-v4 components, Tailwind token classes, and AI chat primitives to both Rust and TSX NSH apps.
updatedAt: 2026-11-26
platformSupport:
  heading: Cross-Platform Rendering & Known Partial Controls
  overview: Built on `nsh-core` and `nsh-base`, `nsh-shadcn` targets macOS, iOS, Android, Windows, Linux, and Web, with minor desktop/mobile navigation nuances.
  matrix:
    - platform: macOS / Windows / Linux
      status: Supported
      notes: Renders native platform views; `Navigation Menu` triggers on press instead of mouse hover.
    - platform: iOS & Android
      status: Supported (with Sidebar note)
      notes: Upstream notes `Sidebar` currently lacks mobile sheet behavior and rail mode.
    - platform: Web
      status: Supported (live gallery)
      notes: Compiled via `nsh package --target web` into `caoxing9.github.io/nsh-shadcn/` using LLVM wasm32.
securityNote:
  heading: Git Dependency & Rust Macro Execution Note
  body: Because `nsh-shadcn` is installed from GitHub rather than an immutable crates.io checksum, inspect the pinned Git commit recorded inside `nsh.lock` before upgrading (`nsh upgrade`). Compiling the crate executes upstream Rust code and `nsh-core` procedural macros with full build permissions.
related:
  - id: nsh-omarchy
    path: /nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: Crates.io UI alternative with Omarchy desktop theme sync and Tokyo Night/Flexoki palettes.
  - id: nsh-icon
    path: /nshm/nsh-icon/
    name: nsh-icon
    reason: Use standalone tree-shaken Lucide/Phosphor/Tabler packs when you need more icons beyond bundled primitives.
  - id: supernsh-icons
    path: /nshm/supernsh-icons/
    name: supernsh-icons
    reason: Access 260 Iconify icon packs, full-color logos, or icon fonts inside shadcn cards and menus.
parentLinks:
  - path: /nshm/
    label: Back to Installable nshm Catalog
  - path: /discovery/
    label: Why GitHub Modules Appear in Awesome NSH
---

## Faithful new-york-v4 Primitives Rendered as Native Views

Rather than running React DOM or a WebView, `nsh-shadcn` implements shadcn/ui's `new-york-v4` registry directly in Rust atop `nsh-core = "0.7.1"` and `nsh-base = "0.7.1"` (with `plot` enabled for `Chart`). Each component preserves shadcn's Tailwind class strings alongside upstream source notes in `src/ui/*.rs` and exposes both Rust builder syntax (`ui::button("Save").outline()`) and TSX elements (`<Button variant="outline" size="sm" />`).

The component inventory spans seven groups: Actions (`Button`, `Button Group`, `Toggle`, `Toggle Group`), Basics (`Alert`, `Card`, `Kbd`, `Skeleton`, `Table`), Forms (`Checkbox`, `Field`, `Input`, `Input OTP`, `Radio Group`, `Switch`), Overlays (`Dialog`, `Drawer`, `Sheet`, `Sonner`, `Tooltip`), Menus (`Command`, `Combobox`, `Dropdown Menu`, `Select`), Layout (`Accordion`, `Calendar`, `Carousel`, `Chart`, `Resizable`, `Tabs`), and Chat (`Attachment`, `Bubble`, `Marker`, `Message`, `Message Scroller`, `Direction`). Upstream checks every component in light and dark mode against shadcn rendering and documents any intentional omissions (`form` is omitted in favor of `Field`).

## Early 0.1.0 Status, Caveats & Comparing with nsh-omarchy

As an early `0.1.0` release (just published initially on crates.io on `2026-11-27` with `0` downloads at check time, following the `2026-11-26` GitHub audit), `nsh-shadcn` targets adopters testing shadcn/ui `new-york-v4` variants, `.app_class(...)` tail-override customization on Rust elements, and Chat UI elements (`Bubble`, `Message Scroller`, `Attachment`). For established desktop/mobile production use with built-in charts, `nsh-omarchy` (`0.2.0`) is further along.

Note two explicit upstream caveats documented in the README: `Navigation Menu` opens on press rather than hover and omits shared viewports/indicators, and `Sidebar` omits mobile sheets, collapsed-state tooltips, sub-menus, badges/actions, and icon rails. Additionally, `Calendar` re-exports `chrono::NaiveDate` directly.

- Early prototyping of AI assistant or chat interfaces using `Bubble`, `Message`, `Message Scroller`, `Attachment`, and `Command`.
- Teams experimenting with `new-york-v4` proportions and Tailwind class overrides inside native macOS, iOS, Android, Windows, or Linux hosts.
- Mixed Rust/TSX evaluation against the live browser gallery (`caoxing9.github.io/nsh-shadcn/`) compiled via NSH's Web target.

## Verified GitHub Install Command & Initial crates.io Timeline

On `2026-11-26`, when `nsh-awesome` ran scratch-app verification, `nsh-shadcn` had not yet appeared on crates.io, so `data/entries.json` records and locks the verified `nsh add github:caoxing9/nsh-shadcn` command. An initial `0.1.0` crate was subsequently uploaded to crates.io on `2026-11-27` (`0` downloads observed at check time); keep using the verified GitHub command until a future catalog sweep validates the crates.io tarball directly.

- Requires `nsh >= 0.7.1` (`Cargo.toml` explicitly pins `nsh-core = "0.7.1"` and `nsh-base = "0.7.1"`).
- Building the web gallery or targeting `--target web` requires LLVM with `wasm32` support on `PATH` (such as `brew install llvm` on macOS).

## Crate Structure & Bundled Utilities

Ships as a self-contained root library crate with bundled icons and date types; `gallery` and screenshots are excluded from packaged builds.

- **Built-in icon & date re-exports:** Exposes `nsh_shadcn::icon::{IconName, icon, labeled_icon}` and `chrono::NaiveDate` so apps do not need a separate `chrono` dependency.
- **`.app_class(...)` customization:** Rust builders append custom classes last so app theme tokens override default shadcn styling.
- **DESIGN.md parity notes:** Upstream repository keeps `DESIGN.md` and per-module rustdocs documenting differences from browser shadcn/ui.

## nsh 0.7.1 Verification Record

Verified cleanly on `nsh 0.7.1 (f78eace)` via `nsh add github:caoxing9/nsh-shadcn`, resolving version `0.1.0` (`MIT`, updated `2026-11-26`) from `git+https://github.com/caoxing9/nsh-shadcn`.

Scope boundary: automated CI tests `nsh add` installation and lockfile generation in a minimal scratch app; visual fidelity across all seven component families and `Sidebar`/`Navigation Menu` edge cases were not rendered in Awesome NSH CI.
