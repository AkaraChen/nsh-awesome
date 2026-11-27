# Awesome Native Shell 模块精选

> Native Shell（nsh）模块（nshm）、框架 crate、模板示例与文档教程的精选清单、可搜索目录与机器可读索引。

HTML 版本：[https://nsh-awesome.vercel.app/zh/](https://nsh-awesome.vercel.app/zh/) · [English Markdown](https://nsh-awesome.vercel.app/index.md) · [发现机制](https://nsh-awesome.vercel.app/zh/discovery.md) · [关于与标准](https://nsh-awesome.vercel.app/zh/about.md) · [index.json](https://nsh-awesome.vercel.app/index.json)

## 什么是 Awesome NSH 与 nshm？

**Awesome NSH** 是面向跨平台原生 Rust UI 框架 [Native Shell](https://nsh.dev)（`nsh`）的精选模块索引目录。共收录 **43** 条资源（更新至 2026-11-26），其中 **13** 个可安装 `nshm` 已在 `nsh 0.7.1` 实测通过 `nsh add`，而 **19** 个 `longbridge/nsh` 官方框架 crate 不可通过 `nsh add` 安装。

- **可安装 nshm：** 13 个（`nsh 0.7.1` 实测通过）
- **官方框架 Crate（非 nshm）：** 19 个
- **示例与工程模板：** 4 个
- **官方文档与教程：** 7 篇

## 安装来源对比（crates.io vs github: vs Git URL）

| 安装来源 | 数量 | 命令格式 | 说明 |
|---|---:|---|---|
| crates.io | 7 | `nsh add <crate>` | 发布于 crates.io 且依赖兼容 `nsh 0.7`（含 `nsh-extra --features ...`）。 |
| `github:owner/repo` | 5 | `nsh add github:owner/repo` | 仅托管于 GitHub 或 crates.io 版本早于 `0.7.1`（如 `nsh-platform-harmonyos`）。 |
| Git URL `--rev` | 1 | `nsh add https://github.com/...git --rev master` | 当 crates.io 与 tag 仍锁定 `^0.6` 而默认分支支持 `^0.7.1` 时使用（`nsh-widgets`）。 |

> 安全提示：安装 Rust 或 TSX `nshm` 会以应用完整权限执行 `build.rs`、过程宏与运行时代码，并可通过 `[package.metadata.nsh]` 声明系统权限。集成前请审查源码与 `nsh.lock`。

## 可安装 nshm (13)

以下模块均已在 nsh 0.7.1 全新临时应用中实测通过 `nsh add` 安装验证（涵盖 crates.io、`github:owner/repo` 与 Git URL）。 ([查看专题页](https://nsh-awesome.vercel.app/zh/nshm/))

### 官方扩展模块

- [nsh-extra](https://nsh-awesome.vercel.app/zh/nshm/nsh-extra/) — NSH 官方按 Cargo feature 按需开启的设备能力模块集合，涵盖 camera、location、photos、push 与 speech。
  - 安装命令：`nsh add nsh-extra --features camera` · 类型：`rust-nshm` · 来源：`crates.io` · 版本：`0.7.1` · 平台：iOS、Android、macOS、Windows、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) · [crates.io](https://crates.io/crates/nsh-extra) · [文档 / 演示](https://nsh.dev/docs/nshm#nsh-extra)
  - 说明：各 feature 平台支持不同：camera（iOS、Android）、location（macOS、iOS、Web）、photos（iOS）、push（iOS、Android）、speech（macOS、iOS、Android、Windows、Web）。

### UI 组件与主题

- [nsh-omarchy](https://nsh-awesome.vercel.app/zh/nshm/nsh-omarchy/) — 基于 nsh-base 的 Omarchy 风格原生 UI 组件库，支持自动跟随系统主题切换，在 Rust 与 TSX 中提供表单、浮层、表格与图表。
  - 安装命令：`nsh add nsh-omarchy` · 类型：`rust-nshm` · 来源：`crates.io` · 版本：`0.2.0` · 平台：macOS、Linux、Windows、iOS、Android、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/huacnlee/nsh-omarchy) · [crates.io](https://crates.io/crates/nsh-omarchy) · [文档 / 演示](https://huacnlee.github.io/nsh-omarchy/)
  - 说明：未检测到 Omarchy 主题配置时自动回退为 Tokyo Night（深色）或 Flexoki Light（浅色）。
- [nsh-shadcn](https://nsh-awesome.vercel.app/zh/nshm/nsh-shadcn/) — 使用 Rust 实现的 shadcn/ui new-york-v4 原生组件库，在桌面、移动与 Web 端以原生视图渲染，同时支持 Rust 与 TSX 调用。
  - 安装命令：`nsh add github:caoxing9/nsh-shadcn` · 类型：`rust-nshm` · 来源：`github` · 版本：`0.1.0` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/caoxing9/nsh-shadcn)
  - 说明：仅托管于 GitHub，尚未发布到 crates.io。
- [nsh-widgets](https://nsh-awesome.vercel.app/zh/nshm/nsh-widgets/) — 跨平台桌面/锁屏小组件与 Live Activities 模块，通过统一 Widget Tree IR 在 WidgetKit、Android RemoteViews、KDE Plasma 与 GNOME 原生渲染。
  - 安装命令：`nsh add https://github.com/SuperNSH/widgets.git --rev master` · 类型：`hybrid-nshm` · 来源：`git` · 版本：`0.4.1` · 平台：iOS、macOS、Android、Linux · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/SuperNSH/widgets) · [crates.io](https://crates.io/crates/nsh-widgets)
  - 说明：NSH 0.7.1 需通过 Git URL `--rev master` 安装；crates.io 0.4.1 与 v0.4.1 tag 仍锁定 `nsh: ^0.6`。

### 图标库

- [nsh-icon](https://nsh-awesome.vercel.app/zh/nshm/nsh-icon/) — 支持按需裁剪的矢量图标渲染器（`<Icon>` 与 `icon()`），配套 5 个可单独安装的图标集 crate（Lucide、Heroicons、Tabler、Phosphor、Remix）。
  - 安装命令：`nsh add nsh-icon` · 类型：`rust-nshm` · 来源：`crates.io` · 版本：`0.2.2` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://github.com/huacnlee/nsh-icon) · [crates.io](https://crates.io/crates/nsh-icon)
  - 说明：配合具体图标包使用，例如 `nsh add nsh-icon-lucide`（另有 heroicons、tabler、phosphor、remix 共 5 个子包）。
- [supernsh-icons](https://nsh-awesome.vercel.app/zh/nshm/supernsh-icons/) — 基于 Iconify 的强类型 SVG 与字体图标库，覆盖 260 套（约 46.5 万个）图标，并拆分为 35 个可按需安装的 `supernsh-icons-*` 子 crate。
  - 安装命令：`nsh add supernsh-icons` · 类型：`hybrid-nshm` · 来源：`crates.io` · 版本：`0.2.0` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/SuperNSH/icons) · [crates.io](https://crates.io/crates/supernsh-icons) · [文档 / 演示](https://supernsh.github.io/icons/)
  - 说明：35 个 `supernsh-icons-*` 图标集子 crate 均归并在此条目下，避免清单被重复子包刷屏。

### 图表、图谱与 GPU 画布

- [nsh-graph](https://nsh-awesome.vercel.app/zh/nshm/nsh-graph/) — 基于原生 `<Canvas>` 的交互式网络图谱组件，内置力导向、分层、环形与网格布局，并支持可选的 Rust 加速后端。
  - 安装命令：`nsh add nsh-graph` · 类型：`hybrid-nshm` · 来源：`crates.io` · 版本：`0.3.0` · 平台：iOS、Android、macOS、Windows、Linux、GPUI、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://github.com/JetSquirrel/nsh-graph) · [crates.io](https://crates.io/crates/nsh-graph) · [文档 / 演示](https://jetsquirrel.github.io/nsh-graph/)
  - 说明：支持社区折叠、通过 `OffscreenCanvas` 导出 PNG 与色盲友好配色方案。
- [nsh-o11y](https://nsh-awesome.vercel.app/zh/nshm/nsh-o11y/) — 高性能可观测性可视化图表套件（时序折线、日志直方图、Trace 瀑布图与火焰图），采用 M4 金字塔降采样与可选 Rust 存储。
  - 安装命令：`nsh add nsh-o11y` · 类型：`hybrid-nshm` · 来源：`crates.io` · 版本：`0.1.0` · 平台：iOS、Android、macOS、Windows、Linux、GPUI、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://github.com/JetSquirrel/nsh-o11y) · [crates.io](https://crates.io/crates/nsh-o11y) · [文档 / 演示](https://jetsquirrel.github.io/nsh-o11y/)
  - 说明：支持多面板联动十字准星（`createChartSync`）与实时流式数据追加。
- [nsh-webgpu](https://nsh-awesome.vercel.app/zh/nshm/nsh-webgpu/) — 基于 wgpu 29 移植自 react-native-webgpu 的 NSH WebGPU 模块，提供 `navigator.gpu` 与 `<Canvas>` 原生 GPU 渲染。
  - 安装命令：`nsh add github:SuperNSH/webgpu` · 类型：`hybrid-nshm` · 来源：`github` · 版本：`0.1.0` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/SuperNSH/webgpu)
  - 说明：仅托管于 GitHub（`Cargo.toml` 标注 `publish = false`，未发布至 crates.io）。
- [nsh-skia](https://nsh-awesome.vercel.app/zh/nshm/nsh-skia/) — 基于 `skia-safe` 实现的 Skia 2D 绘图与着色器模块（兼容 react-native-skia API），支持 macOS Metal 与 Linux OpenGL。
  - 安装命令：`nsh add github:SuperNSH/skia` · 类型：`hybrid-nshm` · 来源：`github` · 版本：`0.1.0` · 平台：macOS、Linux · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/SuperNSH/skia)
  - 说明：仅托管于 GitHub；已在 macOS 与 Linux 验证 GPU 视图（不支持 Web，移动端与 Windows 仅提供内存图像回退）。

### 数据请求与分析

- [nsh-query](https://nsh-awesome.vercel.app/zh/nshm/nsh-query/) — 纯 TSX 实现的 TanStack Query 适配模块（`useQuery`、`useMutation` 与持久化缓存），已接入 NSH 应用生命周期与存储。
  - 安装命令：`nsh add github:Dearest/nsh-query` · 类型：`tsx-nshm` · 来源：`github` · 版本：`0.1.0` · 平台：iOS、Android、macOS、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/Dearest/nsh-query)
  - 说明：纯 TSX nshm（无需 Rust 工具链即可打包）；仅托管于 GitHub。
- [nsmetry](https://nsh-awesome.vercel.app/zh/nshm/nsmetry/) — 面向 NSH 应用的隐私优先事件分析客户端 SDK，支持批量上报与重试，对接自托管 NsMetry Cloudflare Worker 服务。
  - 安装命令：`nsh add nsmetry` · 类型：`hybrid-nshm` · 来源：`crates.io` · 版本：`0.1.0` · 平台：macOS、Windows、Linux、Android、iOS、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/huacnlee/nsmetry) · [crates.io](https://crates.io/crates/nsmetry)
  - 说明：仓库同时包含服务端分析面板应用与根目录的 nshm 客户端 SDK。

### 社区平台后端

- [nsh-platform-harmonyos](https://nsh-awesome.vercel.app/zh/nshm/nsh-platform-harmonyos/) — 社区维护的鸿蒙平台 nshm，安装后可使用 `--target harmonyos` 将 NSH 应用以 ArkUI 原生视图运行与打包至 HarmonyOS / OpenHarmony。
  - 安装命令：`nsh add github:huacnlee/nsh-platform-harmonyos` · 类型：`platform-nshm` · 来源：`github` · 版本：`0.1.1` · 平台：HarmonyOS、OpenHarmony · 许可证：Apache-2.0 · 更新：2026-11-26 · [源码仓库](https://github.com/huacnlee/nsh-platform-harmonyos) · [crates.io](https://crates.io/crates/nsh-platform-harmonyos)
  - 说明：需使用 `github:huacnlee/nsh-platform-harmonyos`（0.1.1）安装；crates.io 上的 0.1.0 缺少 `nsh.json` `"platform"` 字段会导致 `nsh add` 报错。

## 框架与官方 Crate (19)

注意：本节 crate 并非 nshm，不可使用 `nsh add` 安装。它们是 `longbridge/nsh` 官方维护的核心框架、运行时、打包器与平台后端 crate（供 Rust `cargo add` 或由 `nsh` 自动构建链接）。 ([查看专题页](https://nsh-awesome.vercel.app/zh/framework/))

### 核心运行时与工具链

- [nsh-cli](https://crates.io/crates/nsh-cli) — 非 nshm（不可 `nsh add`）— 官方 `nsh` 命令行工具，负责项目初始化、类型检查、运行、打包与签名发布。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、Linux、Windows · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-cli) · [文档 / 演示](https://nsh.dev)
- [nsh-core](https://crates.io/crates/nsh-core) — 非 nshm（不可 `nsh add`）— 与平台无关的核心 crate，包含影子树、响应式信号、布局引擎与挂载指令。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-core) · [文档 / 演示](https://nsh.dev)
- [nsh-base](https://crates.io/crates/nsh-base) — 非 nshm（不可 `nsh add`）— 无样式基础组件行为层（`nsh/base`），提供焦点管理、导航、对话框、代码编辑器与无障碍逻辑。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-base) · [文档 / 演示](https://nsh.dev)
- [nsh-engine](https://crates.io/crates/nsh-engine) — 非 nshm（不可 `nsh add`）— 驱动 JS 宿主与 `nsh-core` 并输出原生挂载批次的引擎线程 crate。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-engine) · [文档 / 演示](https://nsh.dev)
- [nsh-macros](https://crates.io/crates/nsh-macros) — 非 nshm（不可 `nsh add`）— NSH Rust 组件过程宏 crate，提供 Props、事件与 `#[native_module]` 导出宏。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-macros) · [文档 / 演示](https://nsh.dev)
- [nsh-js](https://crates.io/crates/nsh-js) — 非 nshm（不可 `nsh add`）— QuickJS 运行时宿主 crate，负责 JS 执行、原生桥接操作解码与字节码加载。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-js) · [文档 / 演示](https://nsh.dev)
- [nsh-bundler](https://crates.io/crates/nsh-bundler) — 非 nshm（不可 `nsh add`）— NSH 工具链内置的 Rolldown 打包器与 JSX 编译器。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、Linux、Windows · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-bundler) · [文档 / 演示](https://nsh.dev)
- [nsh-testing](https://crates.io/crates/nsh-testing) — 非 nshm（不可 `nsh add`）— 无头测试驱动，供 `nsh test` 与 Rust 集成测试在无窗口环境下驱动应用。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、Linux、Windows · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-testing) · [文档 / 演示](https://nsh.dev)
- [nsh-updater](https://crates.io/crates/nsh-updater) — 非 nshm（不可 `nsh add`）— 打包应用自更新客户端 crate，支持签名校验与下载替换。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、Windows、Linux · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-updater) · [文档 / 演示](https://nsh.dev)
- [nsh-package](https://crates.io/crates/nsh-package) — 非 nshm（不可 `nsh add`）— `.nshpkg` 签名包格式、二级密钥体系、吊销列表与信任库实现。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-package) · [文档 / 演示](https://nsh.dev)
- [nsh-i18n](https://crates.io/crates/nsh-i18n) — 非 nshm（不可 `nsh add`）— NSH 应用语言本地化数据与 `rust-i18n` 翻译加载支持库。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-i18n) · [文档 / 演示](https://nsh.dev)

### 官方平台后端

- [nsh-platform-macos](https://crates.io/crates/nsh-platform-macos) — 非 nshm（不可 `nsh add`）— 官方 macOS AppKit 平台后端，提供 CoreText 排版、原生控件挂载与窗口宿主。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-macos) · [文档 / 演示](https://nsh.dev/docs/macos)
- [nsh-platform-ios](https://crates.io/crates/nsh-platform-ios) — 非 nshm（不可 `nsh add`）— 官方 iOS UIKit 平台后端及 NativeShell Swift 嵌入接口。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：iOS · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-ios) · [文档 / 演示](https://nsh.dev/docs/ios)
- [nsh-platform-android](https://crates.io/crates/nsh-platform-android) — 非 nshm（不可 `nsh add`）— 官方 Android 平台后端，包含 JNI 胶水、StaticLayout 文本测量与原生动画驱动。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：Android · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-android) · [文档 / 演示](https://nsh.dev/docs/android)
- [nsh-platform-windows](https://crates.io/crates/nsh-platform-windows) — 非 nshm（不可 `nsh add`）— 官方 Windows Win32、Direct2D 与 DirectWrite 原生渲染后端。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：Windows · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-windows) · [文档 / 演示](https://nsh.dev/docs/windows)
- [nsh-platform-linux](https://crates.io/crates/nsh-platform-linux) — 非 nshm（不可 `nsh add`）— 官方 Linux GTK 4 与 Pango 原生控件后端。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：Linux · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-linux) · [文档 / 演示](https://nsh.dev/docs/linux)
- [nsh-platform-web](https://crates.io/crates/nsh-platform-web) — 非 nshm（不可 `nsh add`）— 官方 WebAssembly DOM 后端，将 NSH 应用打包发布为静态网站。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-web) · [文档 / 演示](https://nsh.dev/docs/web)
- [nsh-platform-gpui](https://crates.io/crates/nsh-platform-gpui) — 非 nshm（不可 `nsh add`）— 官方 GPUI 后端，支持将 NSH 界面嵌入 GPUI 桌面应用。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、Windows、Linux · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-gpui) · [文档 / 演示](https://nsh.dev/docs/gpui)
- [nsh-platform-tui](https://crates.io/crates/nsh-platform-tui) — 非 nshm（不可 `nsh add`）— 官方终端（TUI）渲染后端，在终端字符网格中绘制 NSH 界面。
  - **非 nshm**（不可通过 `nsh add` 安装） · 类型：`framework-crate` · 来源：`crates.io` · 版本：`0.7.1` · 平台：macOS、Linux、Windows · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://crates.io/crates/nsh-platform-tui) · [文档 / 演示](https://nsh.dev/docs/platforms)

## 示例与模板 (4)

使用 Native Shell 构建的官方示例、工程脚手架、Showcase 目录以及可参考的真实应用。 ([查看专题页](https://nsh-awesome.vercel.app/zh/templates/))

### 脚手架与参考应用

- [longbridge/nsh Examples](https://github.com/longbridge/nsh/tree/main/examples) — 官方示例集合，涵盖 TSX、纯 Rust（`tasks-rs`）、混合导出 `rust-exports`、系统托盘、宿主嵌入与 `nsh-extra` 用法。
  - 类型：`examples` · 来源：`github` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-26 · [源码仓库](https://github.com/longbridge/nsh/tree/main/examples) · [文档 / 演示](https://nsh.dev/gallery)
- [SuperNSH/starter](https://github.com/SuperNSH/starter) — 基于 NSH 0.7.1 的生产级应用脚手架模板，完整演示导航、表单、虚拟列表、动画、与签名远程 TSX 包加载。
  - 类型：`template` · 来源：`github` · 版本：`0.1.0` · 平台：macOS、iOS、Android、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/SuperNSH/starter)
  - 说明：属于应用工程模板（`publish = false` 且 `nsh.json` 含 `"root": "App"`），非可复用库。
- [longbridge/nsh-showcases](https://github.com/longbridge/nsh-showcases) — 驱动 `nsh.dev/apps` 与 `nsh.dev/directory` 的官方社区展示仓库，收录真实应用案例与生态项目清单。
  - 类型：`directory` · 来源：`github` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/longbridge/nsh-showcases) · [文档 / 演示](https://nsh.dev/apps)
- [huacnlee/disktree](https://github.com/huacnlee/disktree) — 原生磁盘空间分析应用，也是官方 `ext/` 混合模式（TSX UI + Rust 扫描器）教程中的代表案例。
  - 类型：`reference-app` · 来源：`github` · 平台：macOS、Linux · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/huacnlee/disktree) · [文档 / 演示](https://huacnlee.github.io/disktree/)

## 文章与教程 (7)

Native Shell 官方文档、架构指南与 nshm 模块开发参考。 ([查看专题页](https://nsh-awesome.vercel.app/zh/guides/))

### 官方文档与指南

- [nshm Guide (Official Docs)](https://nsh.dev/docs/nshm) — 官方 nshm 模块规范指南，详述 `nsh add`、`nsh.lock`、`nsh-extra`、`ext/` 本地扩展、平台 nshm 与模块发布方式。
  - 类型：`documentation` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-25 · [源码仓库](https://nsh.dev/docs/nshm)
- [Getting Started with Native Shell](https://nsh.dev/docs/getting-started) — 手把手入门教程：使用 `nsh` 创建、运行、类型检查、测试与打包第一个 TSX 或 Rust 原生应用。
  - 类型：`tutorial` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-25 · [源码仓库](https://nsh.dev/docs/getting-started)
- [Building with Rust](https://nsh.dev/docs/rust) — 讲解纯 Rust 应用开发以及如何通过 `#[native_module]` 与自动生成的 TypeScript 声明在 TSX 应用中扩展 Rust 能力。
  - 类型：`tutorial` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-25 · [源码仓库](https://nsh.dev/docs/rust)
- [Platform Extensions Guide](https://nsh.dev/docs/platform-extensions) — 阐述如何基于 NSH 公共平台扩展点实现自定义目标平台后端并打包为 `"platform"` nshm。
  - 类型：`documentation` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-25 · [源码仓库](https://nsh.dev/docs/platform-extensions)
- [Project Structure & nsh.json Reference](https://nsh.dev/docs/project-structure) — 全面解析 `nsh.json` 配置字段、`.nsh/types` 类型生成、静态资源引用与模块解析规则。
  - 类型：`documentation` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-25 · [源码仓库](https://nsh.dev/docs/project-structure)
- [Comparing Approaches (Electron, Tauri, RN, Flutter, GPUI)](https://nsh.dev/docs/comparison) — 从架构原理与实测指标出发，对比 Native Shell 与 Electron、Tauri、React Native、Flutter、GPUI、Qt 及 Slint 的取舍。
  - 类型：`article` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-25 · [源码仓库](https://nsh.dev/docs/comparison)
- [Official NSH Directory](https://nsh.dev/directory) — Native Shell 官方社区项目目录页，展示经 `longbridge/nsh-showcases` PR 审核收录的组件、库与平台项目。
  - 类型：`directory` · 来源：`web` · 平台：All · 许可证：CC-BY-4.0 · 更新：2026-11-26 · [源码仓库](https://nsh.dev/directory)

## 机器可读接口

- [index.json](https://nsh-awesome.vercel.app/index.json)
- [count.json](https://nsh-awesome.vercel.app/count.json)
- [llms.txt](https://nsh-awesome.vercel.app/llms.txt)
- [llms-full.txt](https://nsh-awesome.vercel.app/llms-full.txt)
- [ai-catalog.json](https://nsh-awesome.vercel.app/.well-known/ai-catalog.json)
