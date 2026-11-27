---
entryId: nsh-extra
lang: zh
title: nsh-extra：Native Shell 官方系统设备能力模块
description: 通过 Cargo feature 按需开启 camera、location、photos、push 与 speech 原生能力，并附各功能跨 iOS、Android、桌面与 Web 支持矩阵。
h1: nsh-extra：官方按需开启设备能力模块
summary: 由 longbridge/nsh 官方仓库同步发布的设备能力扩展包，通过五个默认关闭的 Cargo feature 向 TSX 与 Rust 应用提供相机、定位、相册、推送与语音识别接口。
updatedAt: 2026-11-25
platformSupport:
  heading: 分 Feature 平台支持矩阵
  overview: 与通用跨端 UI 库不同，`nsh-extra` 的五个子模块各自严格对应底层系统已实现的平台后端。
  matrix:
    - platform: camera
      status: iOS、Android
      notes: 暂不支持桌面与 Web；Android 端通过 `IMAGE_CAPTURE` Intent Query 调起系统相机。
    - platform: location
      status: macOS、iOS、Web
      notes: Apple 端基于 Apple CoreLocation 并注入 macOS 定位 entitlement，Web 端调用浏览器 Geolocation API。
    - platform: photos
      status: 仅 iOS
      notes: 提供 Apple PhotoLibrary 近期照片读取（`Photos`）以及嵌入式原生控件 `PhotosPicker`。
    - platform: push
      status: iOS、Android
      notes: iOS 自动写入 `remote-notification` 后台模式；Android 由配套推送 SDK 补全清单声明。
    - platform: speech
      status: macOS、iOS、Android、Windows、Web
      notes: 覆盖面最广：整合 Apple Speech、Android RecognitionService 与 `RECORD_AUDIO`、Windows WinRT 听写与 Web Speech API。
securityNote:
  heading: 构建权限与隐私声明提醒
  body: 由于 `nsh-extra` 会根据所选特性自动往最终应用注入 `Info.plist` 用途文案、macOS 沙盒权限及 Android 权限，请仅勾选实际使用到的 feature，并在发版前检查 `Cargo.toml` 中的 `[package.metadata.nsh]` 声明是否符合应用隐私政策。
related:
  - id: nsh-platform-harmonyos
    path: /zh/nshm/nsh-platform-harmonyos/
    name: nsh-platform-harmonyos
    reason: 演示平台后端如何对接 `[package.metadata.nsh.features.<feature>.harmonyos]` 与 `speech` 特性。
  - id: nsh-widgets
    path: /zh/nshm/nsh-widgets/
    name: nsh-widgets
    reason: 同样利用 `[package.metadata.nsh]` 在打包阶段合并平台原生资源（如 Android AAR）。
  - id: nsh-query
    path: /zh/nshm/nsh-query/
    name: nsh-query
    reason: 纯 TSX 请求状态库，可与设备能力采集数据组合使用且不额外增加 Rust 编译负担。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/framework/
    label: 对比 19 个不可 nsh add 的框架 Crate
  - path: /zh/guides/
    label: 查看官方 nshm 指南路线
---

## 按 Cargo Feature 精细控制体积与系统权限

`nsh-extra` 位于官方仓库 `crates/nsh-extra`，根文件通过 `#[native_module("nsh-extra")]` 导出能力，并将 `default` 特性设为空列表。TSX 端直接从 `"nsh-extra"` 导入对应的大驼峰命名空间（如 `Camera`、`Location`、`PhotosPicker`），Rust 端则可直接调用 `nsh_extra::camera::take_photo` 等模块函数。

每个特性除了引入对应的系统框架依赖外，还在 `Cargo.toml` 的 `[package.metadata.nsh.features.<name>]` 中声明了打包所需的 `Info.plist` 权限提示文案（如 `NSCameraUsageDescription`）、macOS 沙盒 entitlements、后台推送标识及 Android 清单权限，由 `nsh` 构建时自动合并进应用配置。

## 适用场景与按需裁剪取舍

当应用需要调用官方维护、遵循 `nsh 0.7.1` 平台抽象并内置无头测试替身（如 `speech::FakeSpeech`）的原生硬件或系统能力时，`nsh-extra` 是首选方案。

相比把所有设备绑定塞进基础运行时，按 `--features` 按需启用能避免未使用的麦克风、相机或定位权限声明触发应用商店审核质疑，同时减小最终二进制体积。

- 在 iOS 与 Android 端通过 `Camera.takePhoto({ maxDimension: 2048 })` 调用系统相机拍照。
- 借助 `#[native_components(ios)]` 注册的 `PhotosPicker` 组件在 iOS 应用布局内直接嵌入原生相册选择器。
- 通过统一的 `Speech` 接口在 macOS、iOS、Android、Windows WinRT 与 Web 浏览器中实时获取语音识别中间文本。

## 安装命令与发布来源说明

`nsh-extra` 随 `longbridge/nsh` 0.7.1 同步发布在 crates.io，因此可直接使用 crate 名称及 `--features` 参数安装（需要多个能力时可逗号分隔，如 `--features camera,speech`）。

- 依赖 `nsh 0.7.1` 与本地 Rust 工具链，iOS/Android/macOS 需配置相应原生 SDK。
- Android 端 `push` 能力需配合具体第三方推送服务 SDK 提供服务与 Receiver 清单条目。
- 鸿蒙等社区平台后端可通过自身同名 feature（例如 `nsh-platform-harmonyos` 的 `speech` 特性）对接 HMS 语音识别。

## 5 个可选 Cargo Feature 明细

以下特性均默认关闭，可在 `nsh add` 时通过 `--features` 或在 `nsh.json` 中按需启用。

- **camera（Camera）:** 调用 iOS 与 Android 系统相机拍照。
- **location（Location）:** 在前台单次读取或持续监听设备位置（macOS、iOS、Web）。
- **photos（Photos / PhotosPicker）:** 读取用户近期照片并嵌入 iOS 原生照片选择器控件。
- **push（Push）:** 接管应用委托生命周期以接收远程推送通知（iOS、Android）。
- **speech（Speech）:** 支持实时中间结果的语音转文字接口（macOS、iOS、Android、Windows、Web）。

## nsh 0.7.1 实测验证记录

在 `nsh 0.7.1 (f78eace)` 全新临时应用中运行 `nsh add nsh-extra --features camera`，成功从 `crates.io` 解析并锁定 `nsh-extra@0.7.1`（`Apache-2.0`，更新于 `2026-11-25`）。

验证边界声明：CI 仅校验干净工程执行 `nsh add` 的清单解析与 `nsh.lock` 生成，未在真机硬件上实测相机拍摄、定位授权弹窗或语音流式识别效果。
