---
entryId: supernsh-icons
lang: zh
title: supernsh-icons：覆盖 260 套 Iconify 的 NSH 图标库
description: 聚合约 46.5 万个强类型 SVG 与字体图标，按需拆分为 35 个 supernsh-icons-* 独立子 crate，兼顾 Rust 与 TSX 跨端使用。
h1: supernsh-icons：覆盖 260 套 Iconify 的 SVG 与图标字体库
summary: SuperNSH 推出的混合型图标系统，囊括 260 套约 46.5 万个 Iconify 图标；35 套高频图标拆分为 crates.io 独立子 crate，并支持彩色 Logo/国旗及 `.ttf` 图标字体构建。
updatedAt: 2026-11-25
platformSupport:
  heading: 全平台编译与官方 Release 构建矩阵
  overview: 上游 GitHub Actions 覆盖六端编译交叉检查，并在 Release 中为多端提供 `examples/gallery` 预编译体验包。
  matrix:
    - platform: macOS（arm64 / x86_64）
      status: 完整支持
      notes: Release 提供 ad-hoc 签名体验包（macOS 14+），支持下载后去隔离属性运行。
    - platform: Linux / Windows（x86_64 / arm64）
      status: 完整支持
      notes: 上游 CI 覆双架构编译、Clippy 与示例测试。
    - platform: iOS / Android
      status: 完整支持
      notes: CI 执行 iOS 模拟器与 Android 交叉校验并提供 APK/模拟器压缩包。
    - platform: Web
      status: 完整支持（需 LLVM）
      notes: 在线演示站部署于 `supernsh.github.io/icons/`；本地打包 Web 目标须配置 `clang` 与 `llvm-ar`。
securityNote:
  heading: Rust 二进制体积与开源署名提醒
  body: 在 Rust 代码中若直接引用某图标包的 `set::ALL`，会把整套成千上万个图标编入二进制；请按单个常量名导入以保证裁剪效果，并注意遵循 CC BY 4.0 图标集的署名要求。
related:
  - id: nsh-icon
    path: /zh/nshm/nsh-icon/
    name: nsh-icon
    reason: 只需 5 套经典单色图标且想保持最小依赖与纯 Apache-2.0 协议时的精简选择。
  - id: nsh-omarchy
    path: /zh/nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: 与单色 SVG 图标的 `currentColor` 主题变色无缝配合。
  - id: nsh-shadcn
    path: /zh/nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: 为 shadcn 风格卡片、列表或消息气泡补充彩色品牌标与地区旗帜。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 了解 35 个图标子包与 3 个数据 crate 如何被过滤归并
---

## 全量 Iconify 覆盖、完整 SVG 遮罩与图标字体双模式

`supernsh-icons` 将单一 Rust 渲染实现导出给 Rust（`ui::icon()` 支持完整 SVG mask/filter，`icon()` 返回可套用任意样式的 `Svg` 元素）和 TSX（`<Icon>`、`<Glyph>`、`supernsh-icons/markup` 与 `supernsh-icons/iconify`）。单色图标自动继承外层文字颜色，而品牌 Logo、国旗与 Emoji 保留原生多彩配色。

仓库将 `lucide`、`ph`、`tabler`、`heroicons`、`ri`、`mdi`、`material-symbols`、`simple-icons`、`logos`、`circle-flags`、`fa7-*`、`fluent`、`carbon` 等 35 套最常用图标拆分成独立 `supernsh-icons-<set>` crate 发布在 crates.io（`0.2.0`）；其余约 225 套冷门图标或需要压缩成 `.ttf` 字体的场景，可通过仓库内的 `cli/nsh-icons.ts` 按名称精准提取。

## 生态覆盖优势与使用注意事项

当产品需要展示技术品牌彩标（`logos`、`simple-icons`、`devicon`）、国家地区旗帜（`circle-flags`、`flag`）、UI 动效加载圈（`svg-spinners`）、或者希望借助 `<Glyph>` 加载自构建 `.ttf` 字体文件时，`supernsh-icons` 比仅有 5 套单色集的 `nsh-icon` 更全面。

使用前请留意两项约束：其一，库代码本身为 MIT 协议，但各图标集沿用上游自身许可（例如 Font Awesome、Solar、Streamline、Codicons 为 CC BY 4.0，发布应用时须按 `NOTICE.md` 保留署名）；其二，面向 Web 端构建时系统需安装 LLVM `clang` 与 `llvm-ar`。

- 在一个 `<Icon>` 组件体系下混用跟随主题色的单色操作图标与原色品牌 Logo/国旗。
- 使用 `supernsh-icons font ph:house-fill ...` 为纯色填充风格（Phosphor Fill、MDI、Material Symbols）生成轻量 `.ttf` 图标字体。
- 通过在线画廊（`supernsh.github.io/icons/`）实时搜索 13.3 万图标名称并预览导出图。

## crates.io 安装方式与 CLI 按需提取

`supernsh-icons@0.2.0` 及其 35 个常用子包均以 `nsh-core = "0.7.1"` 上架 crates.io，安装主包后按需执行 `nsh add supernsh-icons-<set>`（如 `supernsh-icons-lucide`）即可。

- 需配套安装至少一个 `supernsh-icons-<set>` 子包，或克隆仓库运行 `node cli/nsh-icons.ts` 从 `@iconify-json/<prefix>` 拉取单个图标（生成字体需在 `cli` 目录 `bun install`）。
- 即使在纯 TSX 项目中也需安装 Rust 工具链，编译 `--target web` 额外要求 LLVM `clang` 与 `llvm-ar`。
- 字体模式（`supernsh-icons font`）不支持描边风格图标（如 Lucide/Tabler 默认描边）及多色图标，这类图标请使用 SVG 模式。

## 归并的 35 个子 Crate 与导出接口

避免主目录被 35 个同构子包和 3 个内部数据包刷屏，全部子 crate 均归入本页说明。

- **35 个 `supernsh-icons-<set>` 子包:** 涵盖 `lucide`、`ph`、`tabler`、`heroicons`、`ri`、`mdi`、`material-symbols`、`logos`、`simple-icons`、`circle-flags`、`fa7-*`、`fluent`、`carbon`、`svg-spinners` 等。
- **supernsh-icons/markup 与 /iconify:** 在 TSX 中提供 `svgMarkup`、`svgDataUri` 及图标名称解析工具函数。
- **3 个内部数据包 `supernsh-icons-data-1..3`:** 供示例画廊使用的内部数据 crate，不属于独立应用安装模块。

## nsh 0.7.1 实测验证记录

CI 已验证在 `nsh 0.7.1 (f78eace)` 临时应用中通过 `nsh add supernsh-icons` 解析锁定 `0.2.0`（`MIT`，更新于 `2026-11-25`，来源 `crates.io`）。

验证边界声明：CI 仅实测主包 `supernsh-icons` 的 `nsh add` 安装流程；35 个图标子 crate 与 CLI 字体打包特性依据上游仓库与 crates.io 元数据核对记录。
