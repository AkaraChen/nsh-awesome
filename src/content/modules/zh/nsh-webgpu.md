---
entryId: nsh-webgpu
lang: zh
title: nsh-webgpu：基于 wgpu 29 的 NSH 原生 WebGPU 模块
description: 为 Native Shell 应用提供 navigator.gpu 与 GPUDevice 原生加速渲染能力，因 publish = false 暂仅支持从 GitHub 安装。
h1: nsh-webgpu：基于 wgpu 29 移植的 NSH WebGPU 模块
summary: SuperNSH 基于 wgpu 29 从 react-native-webgpu 移植而来的混合模块，向 Native Shell 应用提供 navigator.gpu、GPUDevice 与 `<Canvas getContext("webgpu")>` 能力。
updatedAt: 2026-11-25
platformSupport:
  heading: 上游 `0.1.0` 平台实测状态与适配器矩阵
  overview: 引用自 `SuperNSH/webgpu` README 的模拟器、软件适配器 CI 测试结论与未覆盖硬件清单。
  matrix:
    - platform: macOS / Mac Catalyst
      status: 已测 Apple Silicon Metal
      notes: 跑通 `cargo test`、89 项无头测试、CI 开窗三角形/立方体与全部 44 项画廊测试。
    - platform: iOS
      status: 已测 iOS 27 模拟器（Metal）
      notes: 模拟器通过基础示例与 44 项画廊测试；未在实体 iPhone 测试。
    - platform: Android
      status: 模拟器 GLES 通过 38/44 项
      notes: 其余 6 项受限于 GLES 3.1/GLSL 规范；透明画布合成回退不透明且不支持 `COPY_SRC` 抓帧；真机未测。
    - platform: Windows
      status: CI 已测 DX12 WARP
      notes: WARP 软件适配器下窗口 CI 通过；物理显卡未测；开启 `static-dxc` 会在编译期下载 DXC。
    - platform: Linux
      status: CI 已测 Vulkan lavapipe
      notes: 软件 Vulkan 下无头与开窗 CI 通过，不支持 Vulkan 外部纹理导入；物理显卡未测。
    - platform: Web
      status: 已测 Chromium WebGPU
      notes: 在浏览器原生 WebGPU 下跑通 44 项画廊测试。
securityNote:
  heading: Rust 1.97 工具链与构建下载提示
  body: 编译 `nsh-webgpu` 将引入启用 `metal`/`dx12`/`vulkan`/`gles` 特性的 `wgpu 29`；在 Windows 启用 `static-dxc` 会于构建阶段自动拉取数 MB 级的 DXC 库，请注意内网或离线构建环境配置。
related:
  - id: nsh-skia
    path: /zh/nshm/nsh-skia/
    name: nsh-skia
    reason: 当需求偏向 2D 矢量路径、阴影模糊与 `react-native-skia` API 而非 WebGPU 管线时选用。
  - id: nsh-graph
    path: /zh/nshm/nsh-graph/
    name: nsh-graph
    reason: 若只需现成网络拓扑图谱而无须手写着色器，可直接使用内置 `<Canvas>` 组件。
  - id: nsh-o11y
    path: /zh/nshm/nsh-o11y/
    name: nsh-o11y
    reason: 业务监控图表推荐直接使用现成的 `nsh-o11y`，免去底层 GPU 封装工作。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 查看如何通过组织仓库枚举发现 `SuperNSH/webgpu`
---

## 以 wgpu 29 替代 Dawn 提供标准 WebGPU 接口

`nsh-webgpu` 复用了 Native Shell 自身采用的 `wgpu 29` 引擎来承载 `react-native-webgpu` 规范，而非重新引入体量庞大的 Google Dawn。Rust 侧通过句柄注册表与 `#[native_components(<platform>)]` 管理各类 GPU 对象与各端渲染表面，TSX 侧（`tsx/index.tsx`）则导出 `navigator.gpu`、标准 `GPU*` 类、`GPUOffscreenCanvas`、`requestAnimationFrame` 以及 `useDevice`、`useCanvasRef`、`useSurface` 等 Hooks。

针对 `wgpu 29` 目前无法对应的 Dawn 专属接口（如外部设备导入、特定平台硬件缓冲与视频纹理导入），模块保留了同名导出并在调用时抛出规范错误码 `ERR_WEBGPU_UNSUPPORTED`，完整边界列在仓库 `docs/parity.md`。

## 与 nsh-skia 对比及各端实际边界

当应用需要编写 WGSL 计算/渲染着色器、搭建 3D 视图或直接迁移现有 `react-native-webgpu` 代码并在桌面、移动端与 Web 浏览器上运行时，应选 `nsh-webgpu`。相较不支持 Web 端的 `nsh-skia`，`nsh-webgpu` 在 Web 端可直接对接浏览器原生 WebGPU。

需注意上游披露的多项平台实测细节：Windows 与 Linux CI 均运行于软件渲染适配器（WARP 与 lavapipe，Vulkan 下暂不支持外部纹理导入）；Android 模拟器 GLES 3.1 通过了 44 项画廊测试中的 38 项且画布透明合成会回退为不透明黑底；实体 iPhone/Android 与真实独显桌面机尚未由上游实测。

- 跨桌面、移动与浏览器统一运行自研 WGSL 着色器或 3D 渲染管线。
- 复用 `react-native-webgpu` 现有 Hook 与 `GPUOffscreenCanvas` 离屏计算代码。
- 配合 Rust 侧 `api::buffer::WgpuBuffer` 与 TSX 界面共享 GPU 资源句柄。

## 为什么仅支持从 GitHub 安装（`publish = false`）

仓库根目录 `Cargo.toml` 显式设置了 `publish = false`，因此在 crates.io 查询返回 404。通过 `nsh add github:SuperNSH/webgpu` 可直接从仓库根目录的 `Cargo.toml` 与 `nsh.json` 拉取安装。

- 需要 `nsh >= 0.7.1` 及 Rust `rust-version = "1.97"`（2024 edition）。
- 在 Windows x86_64 MSVC 环境若遇到系统 FXC 拒编合法 WGSL，可开启 `static-dxc` 特性自动获取 DXC 编译器。
- Web 端部署要求用户浏览器自身支持 WebGPU。

## Cargo 特性开关与双端导出接口

单一混合模块同时导出 TSX WebGPU 标准类与 Rust API。

- **static-dxc（Windows 可选特性）:** 激活 `wgpu/static-dxc`，在构建期校验 SHA-256 下载静态 DXC 替代系统 FXC。
- **nsh.json 导出（"nsh-webgpu"）:** 向 TSX 应用提供 `navigator.gpu`、标准 `GPU*` 类及 `useDevice` 等 Hooks。
- **nsh_webgpu::api（Rust）:** 供应用本地 Rust 代码直接按句柄操作 `wgpu` 资源。

## nsh 0.7.1 实测验证记录

CI 已在 `nsh 0.7.1 (f78eace)` 临时应用中验证 `nsh add github:SuperNSH/webgpu` 成功，锁定 `0.1.0`（`MIT`，更新于 `2026-11-25`，源 `git+https://github.com/SuperNSH/webgpu`）。

验证边界声明：本站 CI 仅确认 `nsh add` 安装与锁文件生成无误；各操作系统适配器下的 44 项画廊测试结果均为上游 `SuperNSH/webgpu` 报告，本站未实机编译运行。
