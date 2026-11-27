---
pageType: section
pageSlug: templates
entriesSection: templates
lang: zh
title: Native Shell 应用脚手架模板与参考案例精选
description: 对比官方 longbridge/nsh 示例库、SuperNSH/starter 工程模板、huacnlee/disktree 混合应用与 nsh-showcases 目录，快速启动 TSX 或 Rust 原生项目。
h1: Native Shell 示例集合、脚手架模板与参考应用
lead: 面向 `nsh 0.7.1` 的工程起点导航：汇总官方示例、生产风格 TSX 应用模板、本地 `ext/` 混合模式真实案例以及官方社区 Showcase 仓库。
updatedAt: 2026-11-26
technicalCallout:
  heading: 应用模板与可安装 `nshm` 库的清单区别
  body: '可复用 `nshm` 库会在 `nsh.json` 暴露 `"exports"`（`tsx-nshm` / `hybrid-nshm`）或 `"platform"`（`platform-nshm`），不携带应用级 `"id"` 与 `"root"`；而应用模板在 `nsh.json` 定义入口组件（如 `SuperNSH/starter` 中的 `"root": "App"`）、应用包名以及随工程一起编译的本地 `ext/` 目录，直接用 `git clone` 获取即可运行。'
comparisonTable:
  heading: 4 个工程模板、官方示例与参考项目对比
  intro: 根据你的目标模式（纯 Rust `tasks-rs`、纯 TSX、远程签名 TSX 包或本地 `ext/` 混合扩展）选择最贴近的参考工程。
  columns:
    - 项目名称
    - 条目类型
    - 适配 NSH
    - 支持平台
    - 主要参考价值
  rows:
    - - longbridge/nsh Examples
      - 官方示例
      - 0.7.1
      - macOS、iOS、Android、Windows、Linux、Web
      - 覆盖纯 TSX、纯 Rust（`tasks-rs`）、混合 `rust-exports`、系统托盘、宿主嵌入与 `nsh-extra`（Apache-2.0，配套 `nsh.dev/gallery`）。
    - - SuperNSH/starter
      - 工程模板
      - 0.7.1
      - macOS、iOS、Android、Web
      - '完整演示多页导航、表单、虚拟列表、动画及已签名远程 TSX 包加载（`0.1.0`，MIT，含 `"root": "App"`）。'
    - - huacnlee/disktree
      - 参考应用
      - 0.7.x
      - macOS、Linux
      - 原生磁盘空间可视化工具，官方 `ext/` 教程重点解析的 Rust 扫描 + TSX UI 实战案例（MIT，`huacnlee.github.io/disktree/`）。
    - - longbridge/nsh-showcases
      - 生态目录
      - 0.7.x
      - macOS、iOS、Android、Windows、Linux、Web
      - 驱动 `nsh.dev/apps` 与 `nsh.dev/directory` 的官方展示仓库（`directory/*/manifest.json`，MIT 协议）。
selectionAdvice:
  heading: 工程起步路线建议
  items:
    - title: 对照框架基准写法：先看 `longbridge/nsh Examples`
      body: 官方示例随 `longbridge/nsh` `0.7.1` 同步更新，适合核对纯 Rust `tasks-rs`、混合 `rust-exports`、系统托盘与宿主嵌入等标准用法。
    - title: 搭建多页面 TSX 应用脚手架：参考 `SuperNSH/starter`
      body: 需要导航栈、长列表虚拟化、表单交互与已签名 `.nshpkg` 远程 TSX 加载实践时，可直接对照 `SuperNSH/starter` 的目录结构组织代码。
    - title: 项目内嵌专用 Rust 逻辑：参考 `huacnlee/disktree`
      body: 并非所有 Rust 代码都要拆成公开发布的 `nshm`；`disktree` 展示了如何在 `macOS` 与 `Linux` 应用内部通过 `ext/` 让 TSX 直接调用本地高性能 Rust 扫描模块。
    - title: 浏览社区已发布案例与官方目录清单：查看 `longbridge/nsh-showcases`
      body: 通过 `longbridge/nsh-showcases` 可参考进入 `nsh.dev/apps` 与 `nsh.dev/directory` 的项目元数据格式，与本站 `13` 个已验证模块形成互补。
relatedLinks:
  - path: /zh/guides/
    label: 结合官方 `Getting Started` 与 `Building with Rust` 教程阅读
    reason: 深入理解模板背后的 `nsh.json` 配置、`.nsh/types` 与 `ext/` 约定。
  - path: /zh/nshm/
    label: 为新建项目挑选可安装 `nshm` 扩展
    reason: 可在模板工程中按需加入 `nsh-omarchy`、`nsh-icon`、`nsh-query` 等模块。
  - path: /zh/discovery/
    label: 查看为何 `SuperNSH/starter` 等应用未列入 `/zh/nshm/`
    reason: 阅读 `docs/DISCOVERY.md` 对 `"root"`/`"id"` 与 `"exports"` 的精确界定。
---

采用“TSX 界面 + 本地 Rust 扩展”混合架构的端到端 Native Shell 应用，在 `src/lib.rs` 中同样经常包含 `#[native_module("...")]` 导出宏，表面结构与独立 `nshm` 库非常接近。但基于 `nsh 0.7.1` 核验后可知，像 `SuperNSH/starter`、`huacnlee/spotish`、`ryujane/Ferrix` 这类项目配置了 `publish = false` 并在 `nsh.json` 中声明 `"root"` 或 `"id"` 而非 `"exports"`，它们属于可直接克隆改写的完整应用模板，不能作为库通过 `nsh add` 安装。

因此 Awesome NSH 将 `4` 个模板、示例与参考应用（`longbridge/nsh Examples`、`SuperNSH/starter`、`huacnlee/disktree` 与 `longbridge/nsh-showcases`）单列为独立分区，既方便开发者迅速起步，也防止初学者误对整站应用仓库执行 `nsh add`。
