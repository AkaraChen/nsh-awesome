---
entryId: nsh-icon
lang: zh
title: nsh-icon：支持按需裁剪的 Native Shell 矢量图标库
description: 提供 <Icon> 与 icon() 渲染接口，并可按需搭配 Lucide、Heroicons、Tabler、Phosphor 或 Remix 五套独立图标包 crate 使用。
h1: nsh-icon：可按需裁剪的模块化矢量图标渲染器
summary: 由 huacnlee 维护的 Apache-2.0 图标渲染库，将核心 `<Icon>`/`icon()` 渲染器与 5 套主流图标包拆分为独立 crate，只把实际引用的矢量图标打入应用包。
updatedAt: 2026-11-25
platformSupport:
  heading: 跨平台 SVG 矢量渲染支持
  overview: 只要平台后端启用了 `nsh-core` 的 `svg` 渲染能力，所有六大主流平台均可一致呈现。
  matrix:
    - platform: macOS / Windows / Linux
      status: 完整支持
      notes: 高分屏下矢量清晰无锯齿，自动继承当前文字前景色（`currentColor`）。
    - platform: iOS / Android
      status: 完整支持
      notes: 消除各手机系统内置符号字体不一致问题，支持系统读屏标签。
    - platform: Web
      status: 完整支持
      notes: 经由 NSH WebAssembly DOM 后端直接渲染裁剪后的 SVG 元素。
securityNote:
  heading: 构建体积与无障碍实践提示
  body: 模块按常量按需链接，不会把未引用的上万个 SVG 塞进应用；为按钮中的纯图标提供 `label`（TSX）或使用 `labeled_icon`（Rust），可防止辅助功能跳过关键操作按钮。
related:
  - id: supernsh-icons
    path: /zh/nshm/supernsh-icons/
    name: supernsh-icons
    reason: 若需要彩色 Logo、国旗、260 套 Iconify 或 `.ttf` 字体模式，可对比选用。
  - id: nsh-omarchy
    path: /zh/nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: 同作者作品，常用作 `nsh-omarchy` 界面按钮与导航栏的标准图标来源。
  - id: nsh-shadcn
    path: /zh/nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: 在 `nsh-shadcn` 界面中补充任意 Lucide、Tabler 或 Phosphor 变体图标。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 查看图标子包归并与发现策略
---

## 渲染器与图标数据分离，按图标粒度 Tree-Shaking

用普通字符或 Emoji 当作界面图标会受系统字体差异影响，也无法随主题改变线条粗细或被屏幕阅读器正确处理。`nsh-icon` 通过原生 SVG 矢量解决这一问题：它自身不包含任何图标，仅负责提供 `Icon` 类型、Rust 端 `icon()` / `labeled_icon()` / `icon_set!` 以及 TSX 端 `<Icon>`（支持 `size`、`strokeWidth` 与 `label`）渲染接口。

图标数据拆分为 `nsh-icon-lucide`、`nsh-icon-heroicons`、`nsh-icon-tabler`、`nsh-icon-phosphor` 与 `nsh-icon-remix` 五个独立子 crate。应用只下载用到的图标集，且在编译和打包阶段仅保留被导入使用的矢量图标；未设置 `label` 的装饰性图标会自动对屏幕阅读器隐藏。

## 与 supernsh-icons 的定位差异与场景取舍

如果应用主要使用上述五大主流单色线性/填充图标库，希望构建轻量、许可证统一为 Apache-2.0，且需要通过 `strokeWidth` 或 `src_with_stroke_width(...)` 精细调整描边粗细，`nsh-icon` 非常契合。

若项目中必须用到多色品牌 Logo、国旗、260 套 Iconify 里的冷门图标集或希望生成 `.ttf` 图标字体，建议选择同分类的 `supernsh-icons`。

- 在 Rust（`Lucide::Search`）和 TSX（`<Icon icon={Search} />`）中共用同一套跟随 `text-*` 主题色变化的矢量图标。
- 使用 `labeled_icon(Lucide::X, "Close")` 或 `<Icon label="Settings" />` 为纯图标按钮补充无障碍朗读标签。
- 直接把响应式信号传给图标函数（`icon(move || if dark.get() { Lucide::Moon } else { Lucide::Sun })`），随状态切换图标。

## crates.io 两步安装（主渲染器 + 所需图标集）

`nsh-icon@0.2.2` 与 5 个 `nsh-icon-*` 子包均以 `nsh-core = "0.7.0"` 发布在 crates.io，安装主包后再按需添加具体图标集 crate（如 `nsh add nsh-icon-lucide`）。

- 必须至少安装一个 `nsh-icon-*` 子 crate，单独安装 `nsh-icon` 不含任何内置图标。
- 依赖 `nsh-core` 的 `svg` 特性（主包已默认开启，但如在平台后端手动关闭默认特性需确保保留 `svg`）。
- 打包应用时需本机 Rust 工具链（Web 目标另需 `wasm32-unknown-unknown`）。

## 5 个配套可安装图标集 Crate 明细

以下 5 个子 crate 统一归并在本条目下展示；图标数量与上游版本引自 `huacnlee/nsh-icon` 仓库。

- **nsh-icon-lucide:** Lucide 1.43.0 — 1,818 个线性图标（`Lucide::Search` / `"nsh-icon-lucide"`）。
- **nsh-icon-heroicons:** Heroicons 2.2.0 — 1,288 个图标，含 outline、solid、mini、micro 四种变体。
- **nsh-icon-tabler:** Tabler Icons 3.53.0 — 6,563 个图标，提供 outline 与 filled 样式。
- **nsh-icon-phosphor:** Phosphor 2.1.1 — 9,072 个图标，覆盖 6 种字重与填充/双色调。
- **nsh-icon-remix:** Remix Icon 4.8.0 — 3,188 个图标，支持 line 与 fill 后缀命名。

## nsh 0.7.1 实测验证记录

在 `nsh 0.7.1 (f78eace)` 临时应用中执行 `nsh add nsh-icon` 成功，解析到 `crates.io` 的 `0.2.2` 版本（`Apache-2.0`，更新于 `2026-11-25`）。

验证边界声明：CI 实测覆盖 `nsh-icon` 主包的 `nsh add` 解析与锁文件生成；5 个同工作区 `0.2.2` 子包未逐一在六端执行像素渲染测试。
