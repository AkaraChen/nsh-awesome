---
pageType: section
pageSlug: nshm
entriesSection: nshm
lang: zh
title: 可安装 nshm 模块清单（实测兼容 Native Shell 0.7.1）
description: 按 UI 组件、图标、图表画布、数据请求与鸿蒙后端分类对比 13 个已验证可通过 nsh add 安装的 Native Shell 模块，含 crates.io 与 GitHub 安装说明。
h1: 已验证可安装 nshm 模块目录（nsh 0.7.1）
lead: 汇集全部 13 个在 `nsh 0.7.1` 全新临时应用中通过 `nsh add` 实测的可复用 Native Shell 扩展模块，覆盖六大功能分区。
updatedAt: 2026-11-26
technicalCallout:
  heading: 图标子包归并规则与 GitHub 来源背景
  body: 为避免目录页被 40 个图标子 crate 重复刷屏，`nsh-icon` 的 5 个图标集 crate 与 `supernsh-icons` 的 35 个 Iconify 子 crate 均收纳在各自详情页中集中列出。此外，`nsh-widgets` 与 `nsh-platform-harmonyos` 当前须通过 GitHub 源安装（分别使用 `--rev master` 与 `github:huacnlee/nsh-platform-harmonyos`），以避开 crates.io 上锁定 `^0.6` 或缺少 `"platform"` 字段的旧版问题。
comparisonTable:
  heading: 13 个已验证 nshm 模块跨分类选型总表
  intro: 同一功能方向下的模块在来源渠道、依赖工具链与目标平台上各有侧重，可按实际项目需求横向对照。
  columns:
    - 模块名称
    - 所属分类
    - 模块形态
    - 安装来源
    - 适用场景
  rows:
    - - nsh-extra
      - 官方扩展模块
      - rust-nshm
      - crates.io
      - 按 Cargo feature 按需开启相机、定位、相册、推送与语音识别等系统设备能力。
    - - nsh-omarchy
      - UI 组件与主题
      - rust-nshm
      - crates.io
      - 自动跟随 Omarchy 系统配色并支持 Tokyo Night/Flexoki 回退的跨端 UI 组件库。
    - - nsh-shadcn
      - UI 组件与主题
      - rust-nshm
      - "github:"
      - Rust 原生实现的 shadcn/ui new-york-v4 早期 0.1.0 移植版（含聊天界面组件，Navigation Menu 与 Sidebar 存在部分实现缺口）。
    - - nsh-widgets
      - UI 组件与主题
      - hybrid-nshm
      - git --rev master
      - 基于统一 Widget Tree IR 生成 iOS WidgetKit/灵动岛、Android RemoteViews、KDE 与 GNOME 小组件。
    - - nsh-icon
      - 图标库
      - rust-nshm
      - crates.io
      - 轻量按需裁剪 SVG 图标渲染器，配套 Lucide、Heroicons、Tabler、Phosphor、Remix 五套独立 crate。
    - - supernsh-icons
      - 图标库
      - hybrid-nshm
      - crates.io
      - 覆盖 260 套约 46.5 万个 Iconify 图标、35 个子 crate，并支持生成 `.ttf` 图标字体。
    - - nsh-graph
      - 图表、图谱与 GPU 画布
      - hybrid-nshm
      - crates.io
      - 支持力导向、分层、环形与网格布局的交互式网络图谱组件，可选 Rust 加速布局与绘制。
    - - nsh-o11y
      - 图表、图谱与 GPU 画布
      - hybrid-nshm
      - crates.io
      - 面向百万级采样的高吞吐可观测性图表套件（M4 金字塔降采样时序图、日志、Trace 瀑布图与火焰图）。
    - - nsh-webgpu
      - 图表、图谱与 GPU 画布
      - hybrid-nshm
      - "github:"
      - 基于 wgpu 29 移植 `react-native-webgpu`，向 NSH 提供标准 `navigator.gpu` 与 WGSL 管线。
    - - nsh-skia
      - 图表、图谱与 GPU 画布
      - hybrid-nshm
      - "github:"
      - 基于 `skia-safe` 实现兼容 `react-native-skia` 的 2D 画布与 `RuntimeEffect` 着色器（验证 macOS/Linux）。
    - - nsh-query
      - 数据请求与分析
      - tsx-nshm
      - "github:"
      - 纯 TSX 实现的 TanStack Query 适配器，无需 Rust 工具链，原生对接 NSH 生命周期与 Storage 持久化。
    - - nsmetry
      - 数据请求与分析
      - hybrid-nshm
      - crates.io
      - 隐私优先的事件与页面流埋点 SDK，批量重试上报至自托管 Cloudflare Worker + D1 看板。
    - - nsh-platform-harmonyos
      - 社区平台后端
      - platform-nshm
      - "github:"
      - 提供 `--target harmonyos` 的鸿蒙 ArkUI 社区平台后端，支持 HarmonyOS 与 OpenHarmony。
selectionAdvice:
  heading: 同类模块选型建议
  items:
    - title: UI 组件库选型：nsh-omarchy vs nsh-shadcn
      body: 若追求已有 `0.2.0` 发布与使用积累、系统主题自动切换与图表组件内置，`nsh-omarchy` 更稳妥；`nsh-shadcn` 仍处于早期 `0.1.0` 阶段（`Navigation Menu` 与 `Sidebar` 尚有部分缺口），仅在明确偏好 `new-york-v4` 类名习惯或需要内置 Chat 对话组件时作为早期尝鲜对比选项。
    - title: 图标方案选型：nsh-icon vs supernsh-icons
      body: 常规应用仅需 5 套主流单色矢量图标且希望最小化依赖体积时，优先 `nsh-icon`；当项目需要品牌彩色 Logo、国旗、260 套 Iconify 图标或 `.ttf` 图标字体时选用 `supernsh-icons`（注意其 Web 打包需准备 LLVM `clang` 与 `llvm-ar`）。
    - title: 图形与可视化选型：Canvas 套件 vs GPU 底层接口
      body: 业务图表与网络拓扑优先使用 `nsh-graph` 与 `nsh-o11y`；需要自定义 3D/计算着色器且跨端运行选用 `nsh-webgpu`；而熟悉 `react-native-skia` 声明式 2D 滤镜且主要面向 macOS 与 Linux 桌面 GPU 时可考虑 `nsh-skia`。
relatedLinks:
  - path: /zh/discovery/
    label: 查看四类清单准入规则与 0.6 绕过现象
    reason: 了解为何仅看 crates.io nshm 标签会混入大量无法或不应直接安装到 0.7.1 的包。
  - path: /zh/framework/
    label: 区分 19 个不可 nsh add 的官方框架 crate
    reason: 避免把 `nsh-core` 或 `nsh-base` 当作普通模块执行 `nsh add`。
  - path: /zh/about/
    label: 查看验证覆盖边界与安全提示
    reason: 确认 CI 的临时应用安装验证边界及 `build.rs` 权限说明。
---

并非 crates.io 上所有带 `nsh-` 前缀或 `keywords = ["nshm"]` 标签的包都能被 `nsh add` 安装。根据 `longbridge/nsh` 源码中的清单解析逻辑（`crates/nsh-cli/src/nshm/manifest.rs`），只有满足 Rust（`#[native_module("...")]`）、纯 TSX（`nsh.json` `"exports"`）、混合型（两者兼备）或平台型（`"platform": "<target>"`）四种结构规则之一，且通过 `nsh 0.7.1` 语义化版本校验的包，才属于合法的可安装 nshm。

本专题页汇总了 13 个干净兼容 `nsh 0.7.1` 的模块，涵盖 crates.io（7 个主模块及归并的 40 个图标包子 crate）、`github:owner/repo`（5 个）与 Git 分支指定（1 个）。18 个仅因 Cargo 发布时将依赖改写为 `[dependencies.nsh-core]` 子表而绕过解析器的 `0.6` 旧包未在此列，相关详情集中记录于“发现机制”专题页。
