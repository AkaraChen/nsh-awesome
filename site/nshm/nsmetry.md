# nsmetry

> Privacy-first event analytics client SDK for NSH apps with batching and retries targeting a self-hosted NsMetry Cloudflare Worker.

HTML page: [https://nsh-awesome.vercel.app/nshm/nsmetry/](https://nsh-awesome.vercel.app/nshm/nsmetry/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/nshm/nsmetry.md) · [All installable nshm](https://nsh-awesome.vercel.app/nshm/)

## Module Facts

| Field | Value |
|---|---|
| ID | `nsmetry` |
| Category | Data & Analytics (`data`) |
| Kind | Hybrid Rust + TSX nshm (`hybrid-nshm`) |
| Source Type | `crates.io` |
| Package Version | `0.1.0` |
| NSH Requirement | `>=0.7` |
| Platforms | macOS, Windows, Linux, Android, iOS, Web |
| License | MIT |
| Updated | 2026-11-26 |
| Source Repository | [https://github.com/huacnlee/nsmetry](https://github.com/huacnlee/nsmetry) |
| crates.io | [https://crates.io/crates/nsmetry](https://crates.io/crates/nsmetry) |

## Installation & Verification

```bash
nsh add nsmetry
```

Verified with `nsh add` in a clean scratch app on `nsh 0.7.1` (install resolution only; does not claim full cross-platform on-device compilation).

## Implementation Notes

Monorepo contains both the Cloudflare Worker dashboard app and the root nshm SDK crate.

## Related Modules in This Category

- [nsh-query](https://nsh-awesome.vercel.app/nshm/nsh-query.md) — Pure-TSX TanStack Query adapter (`useQuery`, `useMutation`, persistence) wired to NSH app lifecycle, network status, and `Storage`.
