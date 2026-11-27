---
entryId: nsh-platform-harmonyos
lang: zh
title: nsh-platform-harmonyos：NSH 鸿蒙 ArkUI 社区后端
description: 安装后可用 --target harmonyos 运行与打包 Native Shell 鸿蒙应用；须从 GitHub 装 0.1.1，避开 crates.io 0.1.0 缺 platform 字段报错。
h1: nsh-platform-harmonyos：面向鸿蒙与 OpenHarmony 的 ArkUI 平台后端
summary: 由 huacnlee 基于公共平台扩展点维护的社区平台 nshm（ArkUI 实现最初由 @richerfu 贡献），为 Native Shell 增加 `--target harmonyos` 运行、测试与 HAP 打包能力。
updatedAt: 2026-11-26
platformSupport:
  heading: 鸿蒙版本与指令集架构支持表
  overview: 专注于 HarmonyOS NEXT 与 OpenHarmony Stage 模型设备构建与真机调试。
  matrix:
    - platform: OpenHarmony（`--runtime-os openharmony`）
      status: 已测 API 26 模拟器
      notes: 支持免 DevEco 构建并使用 SDK 调试密钥签名安装，跑通 TSX 画廊与 Rust counter。
    - platform: HarmonyOS NEXT（`--runtime-os harmonyos`）
      status: 支持（API 20+）
      notes: '生成 `runtimeOS: "HarmonyOS"` 工程；早期版本曾在真机验证（longbridge/nsh#475）；需配置华为开发者签名。'
    - platform: CPU 架构（`--arch`）
      status: arm64、armv7a、x86_64
      notes: "`package` 默认产 `arm64`，`run`/`dev`/`test` 自动匹配所连设备架构。"
securityNote:
  heading: 宿主程序编译与权限自动合并提示
  body: 首次执行 `--target harmonyos` 会在项目 `.nsh/platforms/harmonyos` 编译后端宿主二进制，并将依赖的 Rust 模块全部链接进 `.so`；发布签名 HAP 前请审阅三方库通过 `[package.metadata.nsh.harmonyos]` 合并进 `module.json5` 的权限与 `.har` 依赖。
related:
  - id: nsh-extra
    path: /zh/nshm/nsh-extra/
    name: nsh-extra
    reason: 与鸿蒙后端的 `speech` 特性联动接入系统级语音识别，也是元数据合并的典型上游模块。
  - id: nsh-omarchy
    path: /zh/nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: 在鸿蒙 ArkUI 表面上渲染统一的桌面/移动端交互组件。
  - id: nsh-widgets
    path: /zh/nshm/nsh-widgets/
    name: nsh-widgets
    reason: 对比另一款基于 NSH 扩展机制打破官方默认平台边界的跨系统模块。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/framework/
    label: 对照 8 个官方内置平台后端 Crate
  - path: /zh/discovery/
    label: 查看为何 crates.io 0.1.0 无法通过 `nsh add`
---

## 基于 NSH 公共平台扩展点对接 ArkUI 原生节点

`nsh-platform-harmonyos` 并非内置于官方主仓，而是通过 `nsh.json` 声明 `"platform": "harmonyos"` 实现的独立外部平台扩展。包内同时包含桌面宿主机调用的二进制 CLI（`[[bin]] nsh-platform-harmonyos`）和基于 `OH_ArkUI_*`、`OH_Drawing_Typography` 与 N-API 构建的 `libnsh_platform_harmonyos.so` 渲染后端，支持纯 Rust、纯 TSX 及混合应用在鸿蒙 Stage 模型 `EntryAbility` 的 `NshSurface` 中原生绘制。

在业务代码判断中，`platform.name === "harmonyos"` 且 `platform.os === "android"`，因此系统返回手势、`android={{...}}` 属性以及 `platform.select({ android })` 均可复用。构建器还会读取各依赖 crate 中的 `[package.metadata.nsh.harmonyos]` 与按特性分组的权限、`abilities`、`.har` 依赖和字符串资源并合并进 DevEco 工程。

## 社区维护边界与设备实测说明

仓库明确声明鸿蒙后端属于 `longbridge/nsh` 之外的社区平台扩展，NSH 官方不负责内置分发与支持，相关问题需提交至 `huacnlee/nsh-platform-harmonyos`。上游已在 OpenHarmony 7.0（API 26）模拟器中跑通 NSH TSX 画廊与 Rust counter 示例的编译、调试签名与安装；华为 HarmonyOS NEXT（5.0+ 与 OpenHarmony 共享 ArkUI C API、NDK 及 `aarch64-unknown-linux-ohos` ABI）真机安装则需在 DevEco Studio 配置华为开发者签名。

若应用涉及动态下发模块，需提前核对 AppGallery 上架审核规范；此外若升级到包含新挂载指令的未来版 NSH，需等待本后端同步适配（未识别指令在同步前会被跳过）。

- 将现有基于 NSH 0.7 的 Rust 或 TSX 应用一键交叉编译并打包发布到鸿蒙 NEXT 手机与 OpenHarmony 设备。
- 使用 `nsh test --target harmonyos --device <ID>` 在已连接设备或模拟器上执行 UI 自动化测试并输出 JUnit XML 报告。
- 通过 `@nsh/harmonyos` 在现有 ArkTS 鸿蒙工程中按需嵌入 `NshSurface` 页面组件（详见仓库 `docs/embedding.md`）。

## 为何必须装 GitHub 0.1.1（而非 crates.io 0.1.0）

crates.io 上当前的 `0.1.0` 发布于 NSH 引入 `"platform"` 清单规范之前，缺少 `"platform": "harmonyos"` 字段，执行 `nsh add nsh-platform-harmonyos` 会报 `no #[native_module("...")]` 错误。改用 `nsh add github:huacnlee/nsh-platform-harmonyos` 拉取仓库 `0.1.1` 即可识别为合法平台 nshm。

- 需 `nsh 0.7+`、Rust 目标 `rustup target add aarch64-unknown-linux-ohos` 以及 OpenHarmony NDK API 20+（配置 `OHOS_NDK_HOME` 或 DevEco Studio）。
- 打包 HAP 需 DevEco Studio 命令行工具（`hvigorw`、`ohpm`、`hdc`），或独立配置 `OHOS_BASE_SDK_HOME` + npm `@ohos/hvigor`（`HVIGOR_HOME`）与 Java 运行时。
- 部署至华为真机需提前在生成的工程内通过 DevEco Studio Signing Configs 配置调试或发布证书。

## 后端特性与鸿蒙元数据合并能力

桌面宿主 CLI 零默认特性编译，真机库开启全套 `backend` 能力集。

- **speech（可选特性）:** 当应用开启 `nsh-extra` 的 `speech` 时，自动向鸿蒙端注册 HMS 语音识别器。
- **api-23 / api-26 与 dev:** 启用对应 API 级别的 ArkUI 无障碍支持与 `nsh dev` 热重载调试能力。
- **[package.metadata.nsh.harmonyos]:** 支持依赖库声明鸿蒙 `permissions`、`querySchemes`、`abilities`、`.har` 依赖与多语言 `strings`。

## nsh 0.7.1 实测验证记录

CI 已在 `nsh 0.7.1 (f78eace)` 临时应用中通过 `nsh add github:huacnlee/nsh-platform-harmonyos` 验证，锁定 `0.1.1`（`Apache-2.0`，更新于 `2026-11-26`）。

验证边界声明：本站 CI 仅确认 `nsh add` 在 `0.7.1` 下正确识别 `"platform": "harmonyos"` 清单并生成 `nsh.lock`，未在 CI 环境配置 OpenHarmony NDK 交叉编译 HAP 或启动鸿蒙模拟器。
