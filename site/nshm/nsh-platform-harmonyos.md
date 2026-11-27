# nsh-platform-harmonyos

> Community platform nshm providing `--target harmonyos` to run and package NSH apps natively on HarmonyOS and OpenHarmony with ArkUI.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-platform-harmonyos/](https://nsh-awesome.vercel.app/nshm/nsh-platform-harmonyos/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-platform-harmonyos.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-platform-harmonyos` |
| Category | Platform Targets (`platforms`) |
| Kind | Platform target nshm (`platform-nshm`) |
| Source Type | `github` |
| Package Version | `0.1.1` |
| NSH Requirement | `>=0.7` |
| Platforms | HarmonyOS, OpenHarmony |
| License | Apache-2.0 |
| Updated | 2026-11-26 |
| Source Repository | [https://github.com/huacnlee/nsh-platform-harmonyos](https://github.com/huacnlee/nsh-platform-harmonyos) |
| crates.io | [https://crates.io/crates/nsh-platform-harmonyos](https://crates.io/crates/nsh-platform-harmonyos) |

## Installation & Verification

```bash
nsh add github:huacnlee/nsh-platform-harmonyos
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

Install via `github:huacnlee/nsh-platform-harmonyos` (`0.1.1`); crates.io `0.1.0` predates `nsh.json` `"platform"` and fails `nsh add`.
