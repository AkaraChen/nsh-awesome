# About Awesome NSH & Curation Standards

> Community-curated Native Shell ecosystem directory driven by `data/entries.json` as a single source of truth (updated 2026-11-26).

HTML page: [https://nsh-awesome.vercel.app/about/](https://nsh-awesome.vercel.app/about/) · [中文 Markdown](https://nsh-awesome.vercel.app/zh/about.md) · [Discovery Methodology](https://nsh-awesome.vercel.app/discovery.md)

## Maintainer & Purpose (Who & Why)

Maintained by [AkaraChen](https://github.com/AkaraChen) under the MIT license ([AkaraChen/nsh-awesome](https://github.com/AkaraChen/nsh-awesome)). Because the `nsh` CLI has no built-in package search command, Awesome NSH separates verified `nsh add`-compatible `nshm` modules from official framework crates, templates, and legacy `0.6` packages.

## Verification Process & Honest Boundaries (How)

- **Empirical baseline:** All 43 entries generate from `data/entries.json`. `scripts/verify-install.mjs` runs real `nsh add` commands in clean scratch projects on `nsh 0.7.1` for every installable module (**13** passing).
- **Honest verification boundary:** Inclusion verifies manifest conformance and `nsh add` resolution on `nsh 0.7.1`; it does **not** claim full on-device compilation or runtime testing across every listed OS target.
- **Zero fabrication:** Platforms, versions, licenses, and caveats come directly from upstream repositories, `Cargo.toml`, `nsh.json`, and `docs/DISCOVERY.md`.

## Contributing & Automated Checks

Contributions are welcome via pull requests editing `data/entries.json` and running `node scripts/generate.mjs`. CI validates schema linting (`scripts/lint.mjs`), generated file parity (`scripts/generate.mjs --check`), live link checks (`scripts/check-links.mjs`), and automated SEO checks. See [https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md](https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md).
