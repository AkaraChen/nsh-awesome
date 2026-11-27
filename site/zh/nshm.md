# 可安装 nshm

> 以下模块均已在 nsh 0.7.1 全新临时应用中实测通过 `nsh add` 安装验证（涵盖 crates.io、`github:owner/repo` 与 Git URL）。

HTML 专题页：[https://nsh-awesome.vercel.app/zh/nshm/](https://nsh-awesome.vercel.app/zh/nshm/) · [English](https://nsh-awesome.vercel.app/nshm.md) · [返回目录首页](https://nsh-awesome.vercel.app/zh/index.md)

本分类共收录 **13** 个条目，全部来自单一数据源 `data/entries.json`（验证基准：`nsh 0.7.1`）。

## 官方扩展模块 (1)

- [nsh-extra](https://nsh-awesome.vercel.app/zh/nshm/nsh-extra/) — NSH 官方按 Cargo feature 按需开启的设备能力模块集合，涵盖 camera、location、photos、push 与 speech。
  - 安装命令：`nsh add nsh-extra --features camera` · 类型：`rust-nshm` · 来源：`crates.io` · 版本：`0.7.1` · 平台：iOS、Android、macOS、Windows、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) · [crates.io](https://crates.io/crates/nsh-extra) · [文档 / 演示](https://nsh.dev/docs/nshm#nsh-extra)
  - 说明：各 feature 平台支持不同：camera（iOS、Android）、location（macOS、iOS、Web）、photos（iOS）、push（iOS、Android）、speech（macOS、iOS、Android、Windows、Web）。

## UI 组件与主题 (3)

- [nsh-omarchy](https://nsh-awesome.vercel.app/zh/nshm/nsh-omarchy/) — 基于 nsh-base 的 Omarchy 风格原生 UI 组件库，支持自动跟随系统主题切换，在 Rust 与 TSX 中提供表单、浮层、表格与图表。
  - 安装命令：`nsh add nsh-omarchy` · 类型：`rust-nshm` · 来源：`crates.io` · 版本：`0.2.0` · 平台：macOS、Linux、Windows、iOS、Android、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/huacnlee/nsh-omarchy) · [crates.io](https://crates.io/crates/nsh-omarchy) · [文档 / 演示](https://huacnlee.github.io/nsh-omarchy/)
  - 说明：未检测到 Omarchy 主题配置时自动回退为 Tokyo Night（深色）或 Flexoki Light（浅色）。
- [nsh-shadcn](https://nsh-awesome.vercel.app/zh/nshm/nsh-shadcn/) — 使用 Rust 实现的 shadcn/ui new-york-v4 原生组件库，在桌面、移动与 Web 端以原生视图渲染，同时支持 Rust 与 TSX 调用。
  - 安装命令：`nsh add github:caoxing9/nsh-shadcn` · 类型：`rust-nshm` · 来源：`github` · 版本：`0.1.0` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/caoxing9/nsh-shadcn)
  - 说明：仅托管于 GitHub，尚未发布到 crates.io。
- [nsh-widgets](https://nsh-awesome.vercel.app/zh/nshm/nsh-widgets/) — 跨平台桌面/锁屏小组件与 Live Activities 模块，通过统一 Widget Tree IR 在 WidgetKit、Android RemoteViews、KDE Plasma 与 GNOME 原生渲染。
  - 安装命令：`nsh add https://github.com/SuperNSH/widgets.git --rev master` · 类型：`hybrid-nshm` · 来源：`git` · 版本：`0.4.1` · 平台：iOS、macOS、Android、Linux · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/SuperNSH/widgets) · [crates.io](https://crates.io/crates/nsh-widgets)
  - 说明：NSH 0.7.1 需通过 Git URL `--rev master` 安装；crates.io 0.4.1 与 v0.4.1 tag 仍锁定 `nsh: ^0.6`。

## 图标库 (2)

- [nsh-icon](https://nsh-awesome.vercel.app/zh/nshm/nsh-icon/) — 支持按需裁剪的矢量图标渲染器（`<Icon>` 与 `icon()`），配套 5 个可单独安装的图标集 crate（Lucide、Heroicons、Tabler、Phosphor、Remix）。
  - 安装命令：`nsh add nsh-icon` · 类型：`rust-nshm` · 来源：`crates.io` · 版本：`0.2.2` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-25 · [源码仓库](https://github.com/huacnlee/nsh-icon) · [crates.io](https://crates.io/crates/nsh-icon)
  - 说明：配合具体图标包使用，例如 `nsh add nsh-icon-lucide`（另有 heroicons、tabler、phosphor、remix 共 5 个子包）。
- [supernsh-icons](https://nsh-awesome.vercel.app/zh/nshm/supernsh-icons/) — 基于 Iconify 的强类型 SVG 与字体图标库，覆盖 260 套（约 46.5 万个）图标，并拆分为 35 个可按需安装的 `supernsh-icons-*` 子 crate。
  - 安装命令：`nsh add supernsh-icons` · 类型：`hybrid-nshm` · 来源：`crates.io` · 版本：`0.2.0` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/SuperNSH/icons) · [crates.io](https://crates.io/crates/supernsh-icons) · [文档 / 演示](https://supernsh.github.io/icons/)
  - 说明：35 个 `supernsh-icons-*` 图标集子 crate 均归并在此条目下，避免清单被重复子包刷屏。

## 图表、图谱与 GPU 画布 (4)

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

## 数据请求与分析 (2)

- [nsh-query](https://nsh-awesome.vercel.app/zh/nshm/nsh-query/) — 纯 TSX 实现的 TanStack Query 适配模块（`useQuery`、`useMutation` 与持久化缓存），已接入 NSH 应用生命周期与存储。
  - 安装命令：`nsh add github:Dearest/nsh-query` · 类型：`tsx-nshm` · 来源：`github` · 版本：`0.1.0` · 平台：iOS、Android、macOS、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/Dearest/nsh-query)
  - 说明：纯 TSX nshm（无需 Rust 工具链即可打包）；仅托管于 GitHub。
- [nsmetry](https://nsh-awesome.vercel.app/zh/nshm/nsmetry/) — 面向 NSH 应用的隐私优先事件分析客户端 SDK，支持批量上报与重试，对接自托管 NsMetry Cloudflare Worker 服务。
  - 安装命令：`nsh add nsmetry` · 类型：`hybrid-nshm` · 来源：`crates.io` · 版本：`0.1.0` · 平台：macOS、Windows、Linux、Android、iOS、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/huacnlee/nsmetry) · [crates.io](https://crates.io/crates/nsmetry)
  - 说明：仓库同时包含服务端分析面板应用与根目录的 nshm 客户端 SDK。

## 社区平台后端 (1)

- [nsh-platform-harmonyos](https://nsh-awesome.vercel.app/zh/nshm/nsh-platform-harmonyos/) — 社区维护的鸿蒙平台 nshm，安装后可使用 `--target harmonyos` 将 NSH 应用以 ArkUI 原生视图运行与打包至 HarmonyOS / OpenHarmony。
  - 安装命令：`nsh add github:huacnlee/nsh-platform-harmonyos` · 类型：`platform-nshm` · 来源：`github` · 版本：`0.1.1` · 平台：HarmonyOS、OpenHarmony · 许可证：Apache-2.0 · 更新：2026-11-26 · [源码仓库](https://github.com/huacnlee/nsh-platform-harmonyos) · [crates.io](https://crates.io/crates/nsh-platform-harmonyos)
  - 说明：需使用 `github:huacnlee/nsh-platform-harmonyos`（0.1.1）安装；crates.io 上的 0.1.0 缺少 `nsh.json` `"platform"` 字段会导致 `nsh add` 报错。
