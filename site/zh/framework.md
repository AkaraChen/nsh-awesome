# 框架与官方 Crate

> 注意：本节 crate 并非 nshm，不可使用 `nsh add` 安装。它们是 `longbridge/nsh` 官方维护的核心框架、运行时、打包器与平台后端 crate（供 Rust `cargo add` 或由 `nsh` 自动构建链接）。

HTML 专题页：[https://nsh-awesome.vercel.app/zh/framework/](https://nsh-awesome.vercel.app/zh/framework/) · [English](https://nsh-awesome.vercel.app/framework.md) · [返回目录首页](https://nsh-awesome.vercel.app/zh/index.md)

本分类共收录 **19** 个条目，全部来自单一数据源 `data/entries.json`（验证基准：`nsh 0.7.1`）。

> **重要区分：** 以下均为 `longbridge/nsh` 维护的框架与平台核心 Crate，**并非 `nshm` 模块**，无法通过 `nsh add` 安装。

## 核心运行时与工具链 (11)

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

## 官方平台后端 (8)

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
