# nsh-extra

> Official optional device modules for NSH apps gated by Cargo features: camera, location, photos, push, and speech.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-extra/](https://nsh-awesome.vercel.app/nshm/nsh-extra/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-extra.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-extra` |
| Category | Official Modules (`official`) |
| Kind | Rust nshm (`rust-nshm`) |
| Source Type | `crates.io` |
| Package Version | `0.7.1` |
| NSH Requirement | `0.7.1` |
| Platforms | iOS, Android, macOS, Windows, Web |
| License | Apache-2.0 |
| Updated | 2026-11-25 |
| Source Repository | [https://github.com/longbridge/nsh/tree/main/crates/nsh-extra](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) |
| crates.io | [https://crates.io/crates/nsh-extra](https://crates.io/crates/nsh-extra) |
| Docs / Demo | [https://nsh.dev/docs/nshm#nsh-extra](https://nsh.dev/docs/nshm#nsh-extra) |

## Installation & Verification

```bash
nsh add nsh-extra --features camera
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

Per-feature platform availability: camera (iOS, Android), location (macOS, iOS, Web), photos (iOS), push (iOS, Android), speech (macOS, iOS, Android, Windows, Web).
