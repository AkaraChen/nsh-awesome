# nsh-widgets

> Cross-platform home-screen widgets and Live Activities using one shared Widget Tree IR rendered natively via WidgetKit, RemoteViews, Plasma, and GNOME.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsh-widgets/](https://nsh-awesome.vercel.app/nshm/nsh-widgets/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsh-widgets.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsh-widgets` |
| Category | UI Components & Themes (`ui`) |
| Kind | Hybrid Rust + TSX nshm (`hybrid-nshm`) |
| Source Type | `git` |
| Package Version | `0.4.1` |
| NSH Requirement | `^0.7.1` |
| Platforms | iOS, macOS, Android, Linux |
| License | MIT |
| Updated | 2026-11-26 |
| Source Repository | [https://github.com/SuperNSH/widgets](https://github.com/SuperNSH/widgets) |
| crates.io | [https://crates.io/crates/nsh-widgets](https://crates.io/crates/nsh-widgets) |

## Installation & Verification

```bash
nsh add https://github.com/SuperNSH/widgets.git --rev master
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

Use the Git URL `--rev master` on NSH 0.7.1; crates.io 0.4.1 and tag v0.4.1 still pin `nsh: ^0.6`.

## Related Modules in This Category

- [nsh-omarchy](https://nsh-awesome.vercel.app/nshm/nsh-omarchy.md) — Omarchy-themed UI component set built on nsh-base with live system theme following, forms, overlays, tables, and charts for Rust and TSX.
- [nsh-shadcn](https://nsh-awesome.vercel.app/nshm/nsh-shadcn.md) — Rust-backed shadcn/ui new-york-v4 component port drawn with native views across desktop, mobile, and web for both Rust and TSX.
