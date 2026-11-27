---
pageType: section
pageSlug: guides
entriesSection: articles
lang: zh
title: Native Shell 官方文档、nshm 开发与对比指南
description: 汇集 nsh.dev 入门教程、#[native_module] 混合扩展、nsh.json 配置、自定义平台规范及框架架构评测路线。
h1: Native Shell 官方文档与模块开发指南路线
lead: 将 `nsh.dev` 官方收录的 `7` 篇核心文档与目录页梳理为“入门基础 → 原生与平台扩展 → 架构评估”三条学习路线，直接衔接站内可安装模块实测信息。
updatedAt: 2026-11-26
technicalCallout:
  heading: "`nsh.dev` 官方文档与 Awesome NSH 的互补定位"
  body: "`nsh.dev/docs/*` 详述运行时架构、`nsh.json` 字段与 `#[native_module]` 语法，`nsh.dev/directory` 展示来自 `longbridge/nsh-showcases` 的 `10` 项精选；本目录站则逐条实测 `nsh 0.7.1` 兼容状态，明确剔除 `19` 个不可 `nsh add` 的官方框架 crate（`NOT nshm`），说明为何 `6` 个模块需通过 GitHub 或 Git `--rev` 安装，并开放 `index.json` 机器索引。"
comparisonTable:
  heading: 7 篇官方参考文档学习路线对照表
  intro: 按照当前阶段挑选对应教程——快速上手 `0.7.1`、编写 Rust / 平台扩展，或评估对比 Electron、Tauri、React Native、Flutter、GPUI、Qt 与 Slint。
  columns:
    - 学习路线
    - 官方文档标题
    - 核心内容摘要
    - 适用读者
  rows:
    - - 路线 1：快速入门
      - Getting Started with Native Shell
      - 从零创建、运行、`nsh check` 类型检查、`nsh test` 无头测试并打包首个 TSX 或 Rust 应用。
      - 初次接触 NSH 的开发者
    - - 路线 1：快速入门
      - Project Structure & nsh.json Reference
      - 系统解析 `nsh.json` 配置字段、`.nsh/types` 自动声明生成、资源宏与模块解析规则。
      - 全栈 / 应用开发者
    - - 路线 2：生态扩展
      - nshm Guide (Official Docs)
      - 权威解释 `nsh add`、`nsh.lock`、`nsh-extra` 特性、本地 `ext/`、平台 nshm 与模块发布。
      - 应用开发者与模块作者
    - - 路线 2：生态扩展
      - Building with Rust
      - 编写纯 Rust 界面并通过 `#[native_module]` 向 TSX 导出带 `.d.ts` 类型声明的原生模块。
      - Rust 与混合开发作者
    - - 路线 2：生态扩展
      - Platform Extensions Guide
      - 基于公共扩展点在 `longbridge/nsh` 之外实现外部平台二进制可执行文件与 `"platform"` nshm 封装。
      - 目标平台维护者
    - - 路线 3：技术选型
      - Comparing Approaches
      - 从架构与实测指标对比 NSH 与 Electron、Tauri、React Native、Flutter、GPUI、Qt 及 Slint。
      - 架构师与技术负责人
    - - 路线 3：技术选型
      - Official NSH Directory
      - 基于 `longbridge/nsh-showcases` PR 审核的官方社区展示项目列表。
      - 全体 NSH 用户
selectionAdvice:
  heading: 文档与站内实测页搭配阅读建议
  items:
    - title: 发布自己的 `nshm` 前：结合阅读 `nshm Guide` 与 `/zh/discovery/`
      body: 参考 `nsh.dev/docs/nshm` 编写清单后，再对照本站“发现机制”页避开 `nsh-cli 0.7.1` 实测陷阱：Cargo 虚拟工作区根目录报缺 `[package] name`、`nsh.json` 忘写 `"exports"`，或 `0.6` 依赖被 `cargo publish` 改写成子表后误绕过版本校验。
    - title: 开发自定义目标后端前：结合阅读 `Platform Extensions Guide` 与鸿蒙后端详情
      body: '`nsh-platform-harmonyos`（`0.1.1`）是目前最完整的公开社区 `"platform"` nshm 实例，可直观印证 `nsh.json` `"platform": "harmonyos"`、`[[bin]]` 宿主程序与 `[package.metadata.nsh.harmonyos]` 元数据合并机制。'
    - title: 评估团队是否采用 NSH：同时核对 `Comparing Approaches` 与 `/zh/about/`
      body: 阅读框架对比指标的同时，查看 `/zh/nshm/` 当前 `13` 个可用三方库覆盖面以及 `/zh/about/` 对测试范围边界与 `build.rs` 供应链安全的透明说明。
relatedLinks:
  - path: /zh/discovery/
    label: 查看基于 `nsh-cli 0.7.1` 源码的实测发现规则
    reason: 获取 `manifest.rs` 与六渠道扫描的完整一手验证依据。
  - path: /zh/templates/
    label: 搭配官方示例与 `SuperNSH/starter` 上手练手
    reason: 把入门文档中的工程结构对照真实代码运行理解。
  - path: /zh/nshm/
    label: 浏览 13 个已验证 `nshm` 实战案例
    reason: 从公开源码库学习各类 `#[native_module]` 与 `nsh.json` 的真实写法。
---

`nsh.dev` 官方文档（CC-BY-4.0）定义了 `nsh 0.7.1` 的核心规范、命令行语义与跨端架构；Awesome NSH 则在生态检索层面补充了跨 `crates.io`（`119` 个 crate）与 `GitHub`（`89` 个仓库）的六渠道扫描、官方框架 crate 隔离与 CI 实测 `nsh add` 验证。

为了避免把 `7` 条外部参考链接平铺成简单清单，本页面按开发者上手与模块发布流程将其组织为渐进式学习路径，并标注出每篇官方规范对应的站内实操入口与源码避坑要点。
