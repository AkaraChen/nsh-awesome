---
entryId: nsh-omarchy
lang: zh
title: nsh-omarchy：自动跟随系统主题的 NSH 原生 UI 组件库
description: 基于 nsh-base 构建，在 Rust 与 TSX 中提供表单、浮层、表格与图表，未检测到 Omarchy 配置时自动回退 Tokyo Night 或 Flexoki 浅色。
h1: nsh-omarchy：支持实时跟随系统主题的原生 UI 组件库
summary: 由 huacnlee 将 gpui-omarchy 移植至 Native Shell 的通用组件库，基于 nsh-base 提供 9 大类组件，支持 Rust 与 TSX 同构调用并随系统主题即时切换配色。
updatedAt: 2026-11-25
platformSupport:
  heading: 跨平台运行与主题回退矩阵
  overview: 依托 Native Shell 原生后端覆盖桌面、移动与 Web 六端，同时在有无 Omarchy 配置的环境下平滑降级。
  matrix:
    - platform: Linux（Omarchy）
      status: 完整支持 + 实时监听
      notes: 读取 `~/.local/state/omarchy/current/theme/colors.toml` 并随系统主题切换即时重绘。
    - platform: macOS / Windows
      status: 完整支持（内置回退）
      notes: 未检测到 Omarchy 主题文件时自动采用 Tokyo Night 或 Flexoki Light。
    - platform: iOS / Android
      status: 完整支持（内置回退）
      notes: 按移动原生视图渲染并沿用内置深浅色主题回退策略。
    - platform: Web
      status: 完整支持（官方已上线演示）
      notes: 作者已通过 NSH Web 后端在 `huacnlee.github.io/nsh-omarchy/` 部署可交互演示站。
securityNote:
  heading: 编译依赖与本地主题读取说明
  body: '`nsh-omarchy` 通过 Cargo 引入 `nsh-base`、`toml` 与 `chrono` 并编译 `#[native_module("nsh-omarchy")]` 过程宏；非 WASM 目标下会在启用系统跟随时读取用户主目录下的 Omarchy 主题文件。'
related:
  - id: nsh-shadcn
    path: /zh/nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: 同属 Rust 实现的跨端 UI 组件库，对照 shadcn/ui new-york-v4 样式并附带 Chat 组件。
  - id: nsh-icon
    path: /zh/nshm/nsh-icon/
    name: nsh-icon
    reason: 同一作者（huacnlee）维护的矢量图标库，常与 `nsh-omarchy` 表单与菜单搭配使用。
  - id: nsh-platform-harmonyos
    path: /zh/nshm/nsh-platform-harmonyos/
    name: nsh-platform-harmonyos
    reason: 通过社区 ArkUI 平台后端将基于 `nsh-omarchy` 的界面打包运行至鸿蒙设备。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/framework/
    label: 在框架 Crate 页查看 `nsh-base` 定位
---

## 基于 nsh-base 的组件体系与实时主题追踪

`nsh-omarchy` 把 Omarchy 桌面设计语言——直角边框、单一强调色、清晰焦点框、紧凑排版与键盘优先交互——带入 Native Shell。底层由 `nsh-base` 负责焦点管理、弹窗与无障碍行为，`nsh-omarchy` 专注于视觉呈现与一致的 Builder/JSX API。

在 Rust 中调用 `om::init()` 或在 TSX 中调用 `Omarchy.followSystem()` 后，组件库会读取 `~/.local/state/omarchy/current/theme/colors.toml` 并监听系统主题变化；在 macOS、Windows、移动端或 Web 等非 Omarchy 环境中，会自动回退至内置的 Tokyo Night（深色）与 Flexoki Light（浅色）双主题，也支持显式锁定预设调色板。

## 9 大组件家族与同品类选型比较

组件覆盖 Actions（按钮、Toggle）、Choices（开关、滑块、单选框）、Fields（输入、数字/OTP、日历、颜色选择）、Navigation（标签页、侧边栏、手风琴、标题栏）、Overlays（对话框、Toast）、Data（表格、`DataTable`、树形视图、可调分栏）、Display（Markdown、代码块、快捷键徽章）与 Charts（折线、面积、柱状、饼图）。

相较同分类仍处于早期 `0.1.0` 阶段（初期上架 crates.io 下载量为 `0`，且 `Navigation Menu` 与 `Sidebar` 仍有部分缺口）的 `nsh-shadcn`，`nsh-omarchy`（`0.2.0`）已稳定发布在 crates.io 并默认开启 `nsh-base/plot` 图表支持，整体偏桌面高密度效率工具风格；仅当项目明确需要 `new-york-v4` 类名习惯或内置 Chat 对话组件时再评估 `nsh-shadcn`。

- 需要键盘友好、高密度表格（`DataTable`）与可拖拽分栏（`ResizablePanelGroup`）的跨端效率应用。
- 同一套代码在 Omarchy Linux 原生融入系统配色，在 macOS/Windows/Web 自动切换 Tokyo Night 与 Flexoki Light。
- 使用少量组件即可在面板中内嵌基础折线图与柱状图，无需额外安装专业可观测性图表包。

## crates.io 安装方法与主题 JSON 配置

`nsh-omarchy@0.2.0` 所依赖的 `nsh-core = "0.7.0"` 与 `nsh-base = "0.7.0"` 均已在 crates.io 就绪，因此直接运行 `nsh add nsh-omarchy` 即可稳定解析安装。

- 需 `nsh >= 0.7` 与本地 Rust 工具链，打包 Web 版需安装 `wasm32-unknown-unknown` 目标。
- Cargo 默认开启 `chart` 特性（启用 `nsh-base/plot`），纯 Rust 引入若不需要图表可设为 `default-features = false`。
- 若要在自定义 TSX 视图里使用 `bg-surface`、`border-omarchy-accent` 等扩展主题类名，需复制仓库 `themes/omarchy.json` 并在 `nsh.json` 配置 `"theme": "omarchy.json"`。

## 特性开关与主题控制接口

精简的 Cargo 特性与 Rust/TSX 双端主题 API 保持一致命名规范。

- **chart（默认特性）:** 映射 `nsh-base/plot`，提供 `LineChart`、`AreaChart`、`BarChart` 与 `PieChart`。
- **Omarchy / Theme 接口:** 提供 `followSystem()`、`stopFollowing()`、`applyTheme("tokyo-night" | "flexoki-light")`、`onChange` 与 `shortcutLabel`。
- **nsh_omarchy::tokens:** 在 Rust 中通过闭包传入 `.bg(move || tokens::surface())` 等响应式 Token 实现零刷新主题联动。

## nsh 0.7.1 实测验证记录

在 `nsh 0.7.1 (f78eace)` 临时工程中运行 `nsh add nsh-omarchy` 顺利通过，从 `crates.io` 锁定 `0.2.0` 版本（`MIT` 许可证，更新于 `2026-11-25`）。

验证边界声明：CI 仅验证了干净应用目录的 `nsh add` 依赖写入与 `nsh.lock` 解析，未在六端逐一运行上游 `examples/tsx-gallery`。
