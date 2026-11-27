---
entryId: nsh-shadcn
lang: zh
title: nsh-shadcn：Rust 驱动的 NSH 原生 shadcn/ui 组件库
description: 将 shadcn/ui new-york-v4 风格以原生视图带入桌面、移动与 Web 端，支持 Rust 与 TSX，现阶段需通过 GitHub 仓库安装。
h1: nsh-shadcn：面向 Native Shell 的 Rust 原生 shadcn/ui 组件库
summary: 由 caoxing9 基于 nsh-core 0.7.1 与 nsh-base 构建，将 shadcn/ui new-york-v4 规范（含 Chat 对话界面家族）移植为桌面、移动与 Web 原生视图组件。
updatedAt: 2026-11-26
platformSupport:
  heading: 多端支持与部分组件限制说明
  overview: 基于 `nsh-base` 跨端运行，主要差异集中在桌面悬停交互与移动端侧边栏形态。
  matrix:
    - platform: macOS / Windows / Linux
      status: 已支持
      notes: 以各端原生控件绘制；`Navigation Menu` 为点击触发而非悬停展开。
    - platform: iOS / Android
      status: 已支持（含限制说明）
      notes: 上游说明 `Sidebar` 目前未提供移动端 Sheet 抽屉及收缩态悬浮提示。
    - platform: Web
      status: 已支持（在线可预览）
      notes: 作者已通过 `nsh package --target web` 发布全组件实时演示站点。
securityNote:
  heading: GitHub 源码依赖与锁定校验提示
  body: 从 GitHub 拉取的 Git 依赖不会经过 crates.io 不可变归档校验，升级前请留意 `nsh.lock` 中的 commit 修订变化，并评估外部 Rust 源码与过程宏的构建权限。
related:
  - id: nsh-omarchy
    path: /zh/nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: 已上架 crates.io 的同类 UI 库，主推 Omarchy 系统主题随动与 Tokyo Night 配色。
  - id: nsh-icon
    path: /zh/nshm/nsh-icon/
    name: nsh-icon
    reason: 需要更丰富的 Lucide/Phosphor/Tabler 图标集时可独立按需引入。
  - id: supernsh-icons
    path: /zh/nshm/supernsh-icons/
    name: supernsh-icons
    reason: 可在 shadcn 卡片、菜单与聊天附件中引入 260 套 Iconify 图标与彩色品牌标。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 了解 GitHub 来源模块的筛选标准
---

## 保留 shadcn 类名体系与原生视图渲染

`nsh-shadcn` 并非套壳 WebView，而是用 Rust 直接在 `nsh-core` 与 `nsh-base`（开启 `plot` 特性）之上逐一复刻 `new-york-v4` 组件。源码 `src/ui/*.rs` 对照保留了 shadcn 的 Tailwind 类名结构，并在 Rust 构建器（如 `ui::button("Save").outline()`）和 TSX 标签（`<Button variant="outline" size="sm" />`）之间提供对称体验。

组件库覆盖 7 大家族：Actions（按钮组、切换开关）、Basics（警告框、卡片、快捷键、骨架屏、表格）、Forms（输入、OTP 验证码、滑块、多选）、Overlays（弹窗、抽屉、Sheet、Sonner 轻提示）、Menus（Command 命令面板、Combobox、下拉菜单）、Layout（手风琴、日历、轮播、图表、分栏）以及 Chat（附件、气泡、Marker、消息流滚动器等）。除基于 react-hook-form 的 `form`（由 `Field` 替代）外，其余均已在明暗主题下对照原版检查。

## 早期 0.1.0 定位、已知差异及与 nsh-omarchy 的对比

`nsh-shadcn` 仍处于早期 `0.1.0` 阶段（`2026-11-26` 仅以 GitHub 形式存在，初始 `0.1.0` 于 `2026-11-27` 才刚上传 crates.io 且核查时下载量为 `0`），主要适合偏好 shadcn/ui `new-york-v4` 变体、`.app_class(...)` 覆盖写法及自带 Chat 组件（`Bubble`、`Message Scroller`、`Attachment`）的早期试用场景；若需更成熟的组件沉淀与内置图表，优先考虑 `nsh-omarchy`（`0.2.0`）。

需要留意上游 README 明确列出的两处部分实现限制：`Navigation Menu` 仅支持点击展开（不支持悬停打开、共享视口与指示器）；`Sidebar` 尚不支持移动端 Sheet 抽屉、折叠态提示、子菜单、操作角标及 icon rail。此外库内直接重导出了 `chrono::NaiveDate` 供日历使用。

- 早期原型验证 AI 对话或消息列表界面，试用内置的 `Bubble`、`Message`、`Message Scroller` 与 `Command` 面板。
- 熟悉 Tailwind / shadcn 的团队试验 `new-york-v4` 类名与原生宿主样式对齐效果。
- 结合 NSH Web 后端的在线演示画廊（`caoxing9.github.io/nsh-shadcn/`）逐个核对现有组件的交互完成度。

## 已验证的 GitHub 安装方式与 crates.io 发布时间线

在 `2026-11-26` 执行目录实测时 `nsh-shadcn` 尚未上架 crates.io，因此 `data/entries.json` 收录并验证的是 `nsh add github:caoxing9/nsh-shadcn`。其初始 `0.1.0` crate 随后于 `2026-11-27` 上传至 crates.io（核查时下载量为 `0`）；在后续目录全量重测 crates.io 归档包之前，请继续以已实测通过的 GitHub 命令为准。

- 要求 `nsh >= 0.7.1`（`Cargo.toml` 显式依赖 `nsh-core = "0.7.1"` 与 `nsh-base = "0.7.1"`）。
- 若本地编译 `--target web` 静态站点或运行组件文档构建脚本，需在 `PATH` 中安装支持 `wasm32` 的 LLVM 工具链。

## 内置导出与仓库附属文档

包内自包含常用图标辅助函数与日期类型，同时仓库保留了与原版的差异说明书。

- **内置图标与 `NaiveDate` 重导出:** 直接暴露 `nsh_shadcn::icon` 与 `chrono::NaiveDate`，无需额外手动声明 `chrono`。
- **`.app_class(...)` 尾置覆盖:** 在 Rust 组件调用链追加项目自定义 Tailwind 类名即可优先覆盖默认外观。
- **`DESIGN.md` 与模块文档:** 上游仓记录了组件移植准则以及各组件相较浏览器版 shadcn/ui 的具体行为取舍。

## nsh 0.7.1 实测验证记录

在 `nsh 0.7.1 (f78eace)` 临时工程中执行 `nsh add github:caoxing9/nsh-shadcn` 成功，锁定 `0.1.0` 版本（`MIT` 许可证，更新于 `2026-11-26`，源 `git+https://github.com/caoxing9/nsh-shadcn`）。

验证边界声明：CI 仅实测了 `nsh add` 从 GitHub 拉取清单及写入 `nsh.lock`，尚未在多端桌面或移动模拟器下自动化验证全部组件渲染效果。
