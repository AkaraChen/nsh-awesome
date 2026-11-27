---
pageType: section
pageSlug: framework
entriesSection: framework
lang: zh
title: Native Shell 官方框架与平台后端 Crate（非 nshm）
description: 解析 longbridge/nsh 维护的 19 个核心运行时、宏、打包器与 AppKit/UIKit/GTK4/GPUI/TUI 平台后端 crate，说明为何不可用 nsh add 安装。
h1: 框架与官方 Crate 参考（非 nshm，不可 nsh add）
lead: 集中梳理 `longbridge/nsh` 官方仓库维护的全部 19 个 `0.7.1` 版本核心框架与平台后端 crate，明确各组件职责与无法使用 `nsh add` 安装的技术原因。
updatedAt: 2026-11-25
technicalCallout:
  heading: 为什么 `nsh add` 会拒绝全部 19 个官方框架 crate？
  body: '`nsh-cli` 的清单校验器（`crates/nsh-cli/src/nshm/manifest.rs`）要求可安装包必须在库入口包含 `#[native_module("<specifier>")]` 宏、提供含 `"exports"` 的纯 TSX `nsh.json`，或在 `nsh.json` 中声明 `"platform"` 目标标识及对应 `nsh-platform-<target>` 二进制。诸如 `nsh-core` 与 `nsh-base` 提供的是 Rust 核心 trait、影子树、布局引擎与无样式交互行为，并不导出 JS/TSX 模块桥；官方 8 大平台后端则内建于 `nsh` 构建管线，只有像 `nsh-platform-harmonyos` 这样的社区扩展后端才走 `"platform"` nshm 机制。'
comparisonTable:
  heading: 11 个核心运行时/工具链 Crate 与 8 个官方平台后端对照
  intro: 将 19 个官方 `0.7.1` crate 按职责划分为工具链、核心引擎、分发安全、原生桌面移动后端及 Web/GPUI/TUI 后端五组，方便排查构建日志与依赖关系。
  columns:
    - 分组
    - 包含 Crate（0.7.1）
    - 核心职责
    - 正确使用方式
  rows:
    - - 命令行、打包与测试（3）
      - nsh-cli、nsh-bundler、nsh-testing
      - 项目初始化/检查/打包/签名 CLI、基于 Rolldown 的 JS/TSX 编译器，以及无窗口无头测试驱动 `nsh test`。
      - 安装 `nsh` 命令（`0.7.1`）后自动调用，或在 Rust 集成测试中自动驱动。
    - - 核心 UI 与 JS 宿主（5）
      - nsh-core、nsh-base、nsh-engine、nsh-macros、nsh-js
      - 影子树/响应式信号/布局引擎、`nsh/base` 无样式行为原语、引擎挂载批次、过程宏与 QuickJS 宿主。
      - 由 `nsh 0.7.1` 自动构建链接，或由 Rust 项目与 nshm 作者在 `Cargo.toml` 声明依赖。
    - - 签名包、更新与国际化（3）
      - nsh-package、nsh-updater、nsh-i18n
      - Ed25519 二级签名 `.nshpkg` 包格式与信任库、自更新客户端及 `rust-i18n` 本地化翻译表。
      - 随官方构建链路或 Rust 依赖自动集成，不通过 `nsh add` 安装。
    - - 桌面与移动原生后端（5）
      - nsh-platform-macos、ios、android、windows、linux
      - 分别对接 Apple AppKit/CoreText、iOS UIKit/Swift ABI、Android JNI/StaticLayout、Windows Win32/Direct2D/DirectWrite 与 Linux GTK 4/Pango 原生控件。
      - 使用 `nsh run/package --target <os>` 自动匹配，无需手装。
    - - Web、GPUI 与终端后端（3）
      - nsh-platform-web、gpui、tui
      - 输出静态网站 WebAssembly DOM、嵌入 GPUI 桌面应用表面，或在终端字符网格渲染 NSH 界面。
      - 通过 `--target web` 或对应宿主嵌入模式启用。
selectionAdvice:
  heading: 常见排查与使用误区说明
  items:
    - title: 区分 `nsh-base`（0.7.1）与带样式 UI 组件库
      body: "`nsh-base` 负责焦点管理、键盘导航、弹窗、代码编辑器与无障碍逻辑，是 `nsh-omarchy` 和 `nsh-shadcn` 共同依赖的基础行为层；TSX 应用直接从框架导入 `nsh/base` 能力，而非执行 `nsh add nsh-base`。"
    - title: 区分官方后端与社区 `"platform"` nshm
      body: 8 个官方 `nsh-platform-*` 随 `longbridge/nsh` 统一发版；只有基于 NSH 公共平台扩展点开发的第三方目标（例如 `nsh-platform-harmonyos`）才会以 `"platform"` nshm 形式供 `nsh add` 安装。
    - title: 为什么同源仓库里的 `nsh-extra`（0.7.1）归入 `/zh/nshm/`
      body: '`nsh-extra` 虽然也在 `longbridge/nsh` 仓库维护，但它的根文件 `crates/nsh-extra/src/lib.rs` 声明了 `#[native_module("nsh-extra")]`，专门供应用按需通过 `nsh add nsh-extra --features ...` 启用相机、定位等系统权限能力。'
relatedLinks:
  - path: /zh/nshm/
    label: 返回 13 个支持 `nsh add` 的可安装模块
    reason: 查看真正可通过 `nsh add` 扩展应用能力的社区与官方模块。
  - path: /zh/discovery/
    label: 了解脚本如何过滤 19 个官方 crate
    reason: 查看 `crates/nsh-core/reverse_dependencies` 的分类过滤实测。
  - path: /zh/guides/
    label: 阅读官方 Rust 与平台扩展点指南
    reason: 深入理解 `nsh-core`、`#[native_module]` 与自定义平台接口。
---

在 crates.io 查询 `nsh-core` 的反向依赖（共返回 107 条结果，其中包含 18 个依赖它的官方框架 crate）时，新手常把官方框架全部 19 个内部 crate 误认为可用 `nsh add` 安装的模块。需要明确的是：**本分区列出的 19 个 Apache-2.0 crate 全都不是 `nshm`**，直接运行 `nsh add nsh-core` 或 `nsh add nsh-base` 会在 `nsh 0.7.1` 立即报错 `no #[native_module("...")] at the crate's root`。

在 Native Shell 0.7.1 架构中，TSX 或纯 Rust 应用构建宿主时由 `nsh` CLI 自动管理并链接这些 crate；若编写纯 Rust 应用或开发 `nshm` 扩展库，则直接在 `Cargo.toml` 中通过 `cargo add` 声明依赖，而非写入 `nsh.json` 的扩展列表。
