# Framework & Official Crates

> NOT nshm — cannot be installed with `nsh add`. Core framework, runtime, bundler, and platform backend crates maintained in `longbridge/nsh` (`cargo add` or managed automatically by `nsh`).

HTML hub: [https://nsh-awesome.vercel.app/framework/](https://nsh-awesome.vercel.app/framework/) · [中文](https://nsh-awesome.vercel.app/zh/framework.md) · [Back to home](https://nsh-awesome.vercel.app/index.md)

This section includes **19** curated entries sourced from `data/entries.json` (verified against `nsh 0.7.1`).

> **Important distinction:** Every crate below is an official framework or backend crate maintained in `longbridge/nsh`. They are **NOT `nshm` packages** and cannot be installed with `nsh add`.

## Core Runtime & Tooling (11)

- [nsh-cli](https://crates.io/crates/nsh-cli) — NOT nshm (cannot `nsh add`) — Official `nsh` CLI tool for initializing, checking, running, packaging, and signing apps.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-cli) · [Docs / Demo](https://nsh.dev)
- [nsh-core](https://crates.io/crates/nsh-core) — NOT nshm (cannot `nsh add`) — Platform-independent shadow tree, reactive signals, layout engine, and mount instructions.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-core) · [Docs / Demo](https://nsh.dev)
- [nsh-base](https://crates.io/crates/nsh-base) — NOT nshm (cannot `nsh add`) — Unstyled UI primitives (`nsh/base`) providing focus, navigation, dialogs, editor, and accessibility behavior.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-base) · [Docs / Demo](https://nsh.dev)
- [nsh-engine](https://crates.io/crates/nsh-engine) — NOT nshm (cannot `nsh add`) — Engine thread driving the JS host and `nsh-core` while emitting native mount batches.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-engine) · [Docs / Demo](https://nsh.dev)
- [nsh-macros](https://crates.io/crates/nsh-macros) — NOT nshm (cannot `nsh add`) — Procedural derive macros for NSH Rust components, props, events, and `#[native_module]` exports.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-macros) · [Docs / Demo](https://nsh.dev)
- [nsh-js](https://crates.io/crates/nsh-js) — NOT nshm (cannot `nsh add`) — QuickJS runtime host handling JS evaluation, native bridge op decoding, and bytecode execution.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-js) · [Docs / Demo](https://nsh.dev)
- [nsh-bundler](https://crates.io/crates/nsh-bundler) — NOT nshm (cannot `nsh add`) — Rolldown-based JS/TSX bundler and JSX compiler used by the NSH toolchain.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-bundler) · [Docs / Demo](https://nsh.dev)
- [nsh-testing](https://crates.io/crates/nsh-testing) — NOT nshm (cannot `nsh add`) — Headless testing driver that runs NSH apps without a window for `nsh test` and Rust integration tests.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-testing) · [Docs / Demo](https://nsh.dev)
- [nsh-updater](https://crates.io/crates/nsh-updater) — NOT nshm (cannot `nsh add`) — Self-update client supporting signed update manifests, verification, and binary replacement.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-updater) · [Docs / Demo](https://nsh.dev)
- [nsh-package](https://crates.io/crates/nsh-package) — NOT nshm (cannot `nsh add`) — Signed `.nshpkg` archive format, Ed25519 key hierarchy, revocation lists, and trust store.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-package) · [Docs / Demo](https://nsh.dev)
- [nsh-i18n](https://crates.io/crates/nsh-i18n) — NOT nshm (cannot `nsh add`) — Locale formatting tables and `rust-i18n` translation loader for NSH apps.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, iOS, Android, Windows, Linux, Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-i18n) · [Docs / Demo](https://nsh.dev)

## Official Platform Backends (8)

- [nsh-platform-macos](https://crates.io/crates/nsh-platform-macos) — NOT nshm (cannot `nsh add`) — Official macOS AppKit backend with CoreText rendering, native view mounting, and window hosting.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-macos) · [Docs / Demo](https://nsh.dev/docs/macos)
- [nsh-platform-ios](https://crates.io/crates/nsh-platform-ios) — NOT nshm (cannot `nsh add`) — Official iOS UIKit backend and NativeShell Swift embedding ABI.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: iOS · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-ios) · [Docs / Demo](https://nsh.dev/docs/ios)
- [nsh-platform-android](https://crates.io/crates/nsh-platform-android) — NOT nshm (cannot `nsh add`) — Official Android JNI glue, StaticLayout text measurement, and native animation driver.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Android · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-android) · [Docs / Demo](https://nsh.dev/docs/android)
- [nsh-platform-windows](https://crates.io/crates/nsh-platform-windows) — NOT nshm (cannot `nsh add`) — Official Windows Win32, Direct2D, and DirectWrite native backend.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-windows) · [Docs / Demo](https://nsh.dev/docs/windows)
- [nsh-platform-linux](https://crates.io/crates/nsh-platform-linux) — NOT nshm (cannot `nsh add`) — Official Linux GTK 4 and Pango native widget mounting backend.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-linux) · [Docs / Demo](https://nsh.dev/docs/linux)
- [nsh-platform-web](https://crates.io/crates/nsh-platform-web) — NOT nshm (cannot `nsh add`) — Official WebAssembly DOM rendering backend for deploying NSH apps as static web sites.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: Web · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-web) · [Docs / Demo](https://nsh.dev/docs/web)
- [nsh-platform-gpui](https://crates.io/crates/nsh-platform-gpui) — NOT nshm (cannot `nsh add`) — Official GPUI rendering backend for embedding NSH surfaces inside GPUI desktop apps.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Windows, Linux · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-gpui) · [Docs / Demo](https://nsh.dev/docs/gpui)
- [nsh-platform-tui](https://crates.io/crates/nsh-platform-tui) — NOT nshm (cannot `nsh add`) — Official terminal UI backend rendering NSH views into a terminal cell grid.
  - **Not nshm** (cannot install with `nsh add`) · Kind: `framework-crate` · Source: `crates.io` · Version: `0.7.1` · Platforms: macOS, Linux, Windows · License: Apache-2.0 · Updated: 2026-11-25 · [Source](https://crates.io/crates/nsh-platform-tui) · [Docs / Demo](https://nsh.dev/docs/platforms)
