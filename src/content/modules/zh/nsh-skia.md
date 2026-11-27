---
entryId: nsh-skia
lang: zh
title: nsh-skia：兼容 RN Skia API 的 NSH 2D GPU 绘图模块
description: 基于 skia-safe 提供 <Canvas>、<Path> 与 RuntimeEffect 着色器，已在 macOS Metal 与 Linux OpenGL 验证硬件视图。
h1: nsh-skia：兼容 react-native-skia 的 2D 画布与着色器模块
summary: SuperNSH 基于 vendored rust-skia（skia-safe 0.157.0）实现的 Skia 2D 图形库，已在 macOS Metal 与 Linux OpenGL 验证原生 GPU 画布，当前暂不支持 Web 端。
updatedAt: 2026-11-25
platformSupport:
  heading: 平台 GPU 画布验证状态矩阵
  overview: 目前仅 macOS 与 Linux 实现了原生硬件加速视图并经过窗口实测，其余平台均受限或未支持。
  matrix:
    - platform: macOS
      status: 已验证（Metal + Ganesh）
      notes: 独立渲染线程运行；已在 Apple Silicon 完成无头测试与窗口画廊实测。
    - platform: Linux
      status: 已验证（GtkGLArea + GL）
      notes: 已在 arm64 X11 与 Wayland（weston）配合 `llvmpipe` 软件 GL 验证；真实 Linux 显卡与 x86-64 开窗未测。
    - platform: iOS / Android / Windows
      status: 仅内存图像回退（未验证）
      notes: 暂无 GPU 视图，回退为内存绘制转图片；上游尚未在这三端编译运行。
    - platform: Web
      status: 不支持
      notes: Skia 不支持 NSH WebAssembly 目标，源码在 `wasm32` 下跳过编译。
securityNote:
  heading: 预编译 C++ 下载与二进制体积提示
  body: 引入 `nsh-skia` 会在首次 `cargo build` 时通过 `skia-bindings` 构建脚本下载数十 MB 的预编译 Skia 静态库，并使应用体积增加 17–20 MB；请勿随意增删 `Cargo.toml` 中的 `skia-safe` feature，以免触发从头编译 C++ Skia 源码。
related:
  - id: nsh-webgpu
    path: /zh/nshm/nsh-webgpu/
    name: nsh-webgpu
    reason: 若需要覆盖 Web 端或 iOS/Android GPU 画布与 WGSL 计算管线，应选择 `nsh-webgpu`。
  - id: nsh-graph
    path: /zh/nshm/nsh-graph/
    name: nsh-graph
    reason: 基于 NSH 原生 `<Canvas>` 实现全端图谱渲染，无需额外承载 17–20 MB Skia 体积。
  - id: nsh-o11y
    path: /zh/nshm/nsh-o11y/
    name: nsh-o11y
    reason: 轻量级全端可观测性图表方案，在移动端与 Web 端同样开箱即用。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 了解如何从组织枚举中发现 `SuperNSH/skia`
---

## 信号驱动的 Rust 保留场景树，而非 React 协调器

`nsh-skia` 向 TSX 提供了与 `react-native-skia` 一致的声明式组件（`<Canvas>`、`<Circle>`、`<Path>`、`<LinearGradient>`、`<BlurMask>`、`<Mask>`、`useClock`）以及命令式工具对象（`Skia.Path`、`Skia.Paint()`、`Skia.RuntimeEffect`、`Skia.Surface.MakeOffscreen`）。

由于 NSH 采用细粒度信号而非 React 虚拟 DOM，每个图形标签在挂载时会在 Rust 侧（`scene.rs`、`#[native_module("nsh-skia/native")]`）创建对应节点，表达式变化直接更新单个节点属性并由 Rust 录制绘制帧。仓库还在 `vendor/skia-safe` 对 Linux 版 HarfBuzz 与 `libwebp` 符号做了重命名隔离。

## 像素一致性验证、二进制体积与严格平台边界

上游使用 48 个测试场景与基于 CanvasKit 的 `react-native-skia` 对比像素，Web 端可绘制的 46 个非文本场景任意像素通道误差不超过 2/255。需要注意的是，在 `<Canvas>` 内循环超过 32 项图形时请使用 `<Repeat>` 替代 `<Each>`。

相较全端运行的 `nsh-webgpu`，`nsh-skia` 平台边界非常明确：**完全不支持 NSH Web 目标**（Skia 未针对该目标构建），且 **iOS、Android 与 Windows 尚无原生 GPU 视图**（回退至内存离屏图像绘制，上游亦尚未在这三端执行编译与运行）。

- 主要面向 macOS 与 Linux 桌面端，需要复杂渐变、阴影模糊（`BlurMask`）、矢量遮罩与 `RuntimeEffect` 2D 着色器的应用。
- 通过 `Skia.Surface.MakeOffscreen` 生成高质量圆角图形并编码导出 PNG 图像。
- 将原有 `react-native-skia` 图形组件迁移至 NSH，把 Reanimated 共享值替换为 `signal`/`computed`。

## GitHub 安装方式与 Linux 构建前置依赖

`Cargo.toml` 标注了 `publish = false` 且自带 `vendor/` 子 crate 补丁，未发布到 crates.io，须通过 `nsh add github:SuperNSH/skia` 从源码库根目录安装。

- 要求 Rust `1.97`（2024 edition）与 `nsh >= 0.7.1`；首次构建会联网拉取 `rust-skia` 预编译产物（macOS 约 18 MB、Linux 约 26 MB），应用打包体积约增加 17–20 MB。
- Linux 编译环境须满足 glibc `2.35+` 并安装 `libgl-dev libegl-dev libgles-dev libwayland-dev libx11-dev libfontconfig1-dev libfreetype-dev`。
- 不可用于 `--target web` 目标。

## 核心源码布局与上游未测范围

融合 TSX API 层、Rust 场景引擎与隔离修补后的 `rust-skia`。

- **tsx/（"nsh-skia"）:** 提供 `<Canvas>` 声明式图形原语、`useClock()`、`Skia.*` 命令式接口与 `<Repeat>`。
- **src/view/ 与 scene.rs:** 负责 macOS Metal 与 Linux `GtkGLArea` 画布宿主注册。
- **上游明确未测项目:** 跨端系统字体文本比对、Linux 物理显卡、x86-64 Linux 窗口、高负载缩放与长时运行内存泄漏。

## nsh 0.7.1 实测验证记录

CI 已在 `nsh 0.7.1 (f78eace)` 临时应用中实测通过 `nsh add github:SuperNSH/skia`，锁定 `0.1.0`（`MIT`，更新于 `2026-11-25`）。

验证边界声明：本站 CI 仅核验了 `nsh add` 的清单写入与 `nsh.lock` 生成，未在构建机拉取 `skia-safe` 预编译二进制或开启 Metal/GTK 窗口渲染。
