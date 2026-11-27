# nshm 模块发现机制与验证方法论

> 基于 `longbridge/nsh`（`nsh 0.7.1`）源码审计与 6 大外部渠道实测扫描的 `nshm` 准入规则与验证记录。

HTML 报告：[https://nsh-awesome.vercel.app/zh/discovery/](https://nsh-awesome.vercel.app/zh/discovery/) · [English Markdown](https://nsh-awesome.vercel.app/discovery.md) · [原始报告 docs/DISCOVERY.md](https://github.com/AkaraChen/nsh-awesome/blob/main/docs/DISCOVERY.md)

## 1. 什么样的包才是可安装的 nshm？

仅仅在 crates.io 添加 `keywords = ["nshm"]` 或以 `nsh-` 命名并**不能**让包被 `nsh add` 安装。依据 `longbridge/nsh` 中 `crates/nsh-cli/src/nshm/manifest.rs` 源码，`nsh add` 仅接受同时满足**结构化清单规则**与**NSH 版本兼容检查（`check_nsh`）**的 4 类形态：

| 类型 | 必需清单文件 | 结构入口规则 | 版本兼容检查 |
|---|---|---|---|
| **Rust nshm** | `Cargo.toml` (`[package]`) | crate 根（默认 `src/lib.rs`）含 `#[native_module("<specifier>")]` | 检查 `[dependencies]`/`[workspace.dependencies]` 的 `nsh-core` 与可选 `nsh.json` `"nsh"` |
| **TSX nshm** | `nsh.json`（无 `Cargo.toml`） | 含 `"name"`、semver `"version"` 及非空 `"exports"` 映射现有 TS/TSX | 检查可选 `"nsh"` semver 约束 |
| **Hybrid nshm** | `Cargo.toml` + `nsh.json` | 同时具备 `#[native_module]` 与 `"exports"` 且导出名不冲突 | 同时检查 `Cargo.toml` `nsh-core` 与 `nsh.json` `"nsh"` |
| **Platform nshm** | `Cargo.toml` + `nsh.json` | `nsh.json` 声明 `"platform": "<target>"` 且构建 `nsh-platform-<target>` | 检查 `Cargo.toml` `nsh-core` 与 `nsh.json` `"nsh"` |

**`cargo publish` 解析边界发现：** `cargo publish` 会把 `[dependencies] nsh-core = "0.6.0"` 规范化改写为 `[dependencies.nsh-core]` 子表，而 `nsh-cli 0.7.1` 的 `nsh_core_requirement` 仅扫描 `[dependencies]`/`[workspace.dependencies]` 表，导致 **18 个锁定 `0.6` 的 crates.io crate**（17 个 `SuperNSH/*` 与 `nsh-platform-miniprogram@0.1.0`）技术上能绕过检查。本目录将这 18 个 `0.6` crate 暂不列入 `0.7.1` 清洁可安装清单。

## 2. 6 大发现渠道与实测命中数

`nsh` CLI 本身无内置搜索命令。`scripts/discover.mjs` 联合扫描 **119 个 crates.io crate** 与 **89 个 GitHub 仓库**：

| 发现渠道 | 原始命中 | NSH 相关 | 关键观察 |
|---|---:|---:|---|
| 1. crates.io `keyword=nshm` | 68 | 68 | 含 40 个图标子包、17 个 `0.6` `SuperNSH/*` crate 与 3 个非 nshm 辅助 crate。 |
| 2. crates.io `nsh-core` 反向依赖 | 107 | 104 | 捕获 18 个官方框架 crate 及未打 `nshm` 标签的平台包（如 `nsh-platform-harmonyos`）。 |
| 3. crates.io `keyword=nsh` & `native-shell` | 95 + 1 | 94 + 1 | 补充发现 `nsh-auth`、`nsh-form`、`maplibre-nsh` 等非 nshm Rust crate。 |
| 4. `longbridge/nsh-showcases` | 10 | 10 | 官方 Showcase 目录；6 个可安装、4 个为非 nshm CLI/独立应用。 |
| 5. GitHub Topic & Code Search | 1+57+7 / 19+56+29 | — | 发现 `nsh-shadcn`、`nsh-query`；GitHub Code Search 对 `org:SuperNSH` 返回 0 结果。 |
| 6. 已知 NSH 组织仓库枚举 | 31 (`SuperNSH`) | 31 | 补全了代码搜索遗漏的 `SuperNSH/webgpu`、`SuperNSH/skia`、`SuperNSH/widgets`。 |

## 3. 当前 13 个已验证可安装 nshm 清单（nsh 0.7.1）

| 模块 | 来源 | 实测安装命令 | 版本 |
|---|---|---|---|
| [nsh-extra](https://nsh-awesome.vercel.app/zh/nshm/nsh-extra.md) | `crates.io` | `nsh add nsh-extra --features camera` | `0.7.1` |
| [nsh-omarchy](https://nsh-awesome.vercel.app/zh/nshm/nsh-omarchy.md) | `crates.io` | `nsh add nsh-omarchy` | `0.2.0` |
| [nsh-shadcn](https://nsh-awesome.vercel.app/zh/nshm/nsh-shadcn.md) | `github` | `nsh add github:caoxing9/nsh-shadcn` | `0.1.0` |
| [nsh-widgets](https://nsh-awesome.vercel.app/zh/nshm/nsh-widgets.md) | `git` | `nsh add https://github.com/SuperNSH/widgets.git --rev master` | `0.4.1` |
| [nsh-icon](https://nsh-awesome.vercel.app/zh/nshm/nsh-icon.md) | `crates.io` | `nsh add nsh-icon` | `0.2.2` |
| [supernsh-icons](https://nsh-awesome.vercel.app/zh/nshm/supernsh-icons.md) | `crates.io` | `nsh add supernsh-icons` | `0.2.0` |
| [nsh-graph](https://nsh-awesome.vercel.app/zh/nshm/nsh-graph.md) | `crates.io` | `nsh add nsh-graph` | `0.3.0` |
| [nsh-o11y](https://nsh-awesome.vercel.app/zh/nshm/nsh-o11y.md) | `crates.io` | `nsh add nsh-o11y` | `0.1.0` |
| [nsh-webgpu](https://nsh-awesome.vercel.app/zh/nshm/nsh-webgpu.md) | `github` | `nsh add github:SuperNSH/webgpu` | `0.1.0` |
| [nsh-skia](https://nsh-awesome.vercel.app/zh/nshm/nsh-skia.md) | `github` | `nsh add github:SuperNSH/skia` | `0.1.0` |
| [nsh-query](https://nsh-awesome.vercel.app/zh/nshm/nsh-query.md) | `github` | `nsh add github:Dearest/nsh-query` | `0.1.0` |
| [nsmetry](https://nsh-awesome.vercel.app/zh/nshm/nsmetry.md) | `crates.io` | `nsh add nsmetry` | `0.1.0` |
| [nsh-platform-harmonyos](https://nsh-awesome.vercel.app/zh/nshm/nsh-platform-harmonyos.md) | `github` | `nsh add github:huacnlee/nsh-platform-harmonyos` | `0.1.1` |

## 4. 排除与暂缓说明

- **官方框架 Crate（19 个）：** 不含 `#[native_module]`，单独列于框架分类并明确标为「非 nshm」。
- **40 个图标集子 crate + 3 个内部数据 crate：** 归并在父条目 `nsh-icon`（5 个）与 `supernsh-icons`（35 个）下说明。
- **端用户应用与模板（`SuperNSH/starter`、`spotish`、`Ferrix`）：** `publish = false` 且 `nsh.json` 含 `"root"`/`"id"`，不属于可复用库。
- **版本不兼容或尚在开发：** `nsh-gpu-lexer`（`0.6`）、`honsunrise/nsh-ext`（严格 `=0.7.0`）、18 个 `0.6` 规范化 crate 与 `nsh-directories` 暂未列入 `0.7.1` 可安装列表。
