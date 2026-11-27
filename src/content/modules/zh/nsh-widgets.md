---
entryId: nsh-widgets
lang: zh
title: nsh-widgets：NSH 跨平台桌面小组件与 Live Activities
description: 一套 Widget Tree IR 原生渲染至 WidgetKit、RemoteViews、Plasma 与 GNOME；在 nsh 0.7.1 须使用 Git --rev master 安装。
h1: nsh-widgets：跨平台桌面小组件与实时活动（Live Activities）
summary: SuperNSH 推出的混合型 nshm 模块，用统一的 Widget Tree IR v1 描述小组件界面，原生渲染至 iOS/macOS WidgetKit、Android RemoteViews、KDE Plasma 与 GNOME Shell。
updatedAt: 2026-11-26
platformSupport:
  heading: 原生小组件宿主兼容与实测记录
  overview: 上游针对不同平台给出了模拟器、虚拟机探针与未测边界的详细区分。
  matrix:
    - platform: iOS
      status: 已测 iOS 27 模拟器
      notes: 覆盖桌面/锁屏小组件、灵动岛、编辑表单与 iOS 18 控制中心；实体 iPhone 未测。
    - platform: Android
      status: 已测 API 37 模拟器
      notes: 覆盖 RemoteViews、API 31+ 滚动列表、配置页与快捷设置磁贴；真机未测。
    - platform: Linux（KDE/GNOME/Cinnamon/Wayland）
      status: 已测多发行版环境
      notes: 验证 Plasma 5.27/6.3、GNOME 45–51 探针、Cinnamon 6.x、Xfce 与 sway/KWin/labwc layer-shell；Hyprland 与 COSMIC 未测。
    - platform: macOS
      status: 0.2.0 可编译但未在 Mac 实机验渲染
      notes: 0.1.0 曾验证桌面渲染；后续扩展构建通过但 Mac 运行期展示待实测。
    - platform: Windows / Web
      status: 无原生桌面宿主
      notes: 不支持 Windows 小组件与 Web；可通过 `nsh-widgets show` 输出终端文本或 Waybar JSON。
securityNote:
  heading: 构建脚本、预编译 AAR 与分支跟踪提示
  body: 本模块带有 `build.rs`、Android JNI 桥与通过 `[package.metadata.nsh.android]` 注入的 `android/nsh-widgets.aar` 二进制归档，且需配合 `nsh-widgets` CLI 生成扩展工程。上线前建议核对 `nsh.lock` 中的 `rev=master` 提交哈希与上游 `check-aar.sh` 一致性说明。
related:
  - id: nsh-omarchy
    path: /zh/nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: 适合搭配构建主应用窗口界面，与桌面/锁屏小组件形成完整体验。
  - id: nsh-shadcn
    path: /zh/nshm/nsh-shadcn/
    name: nsh-shadcn
    reason: 另一套可选主应用原生 UI 组件库。
  - id: nsh-extra
    path: /zh/nshm/nsh-extra/
    name: nsh-extra
    reason: 两者同样借助 `[package.metadata.nsh]` 自动向移动打包产物合并原生清单配置。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 查看为何 crates.io 0.4.1 会在 0.7.1 报错
---

## 统一 Widget Tree IR 桥接四大系统小组件宿主

系统的桌面或锁屏小组件运行在独立扩展进程中，无法直接启动完整的 JS 宿主引擎。`nsh-widgets` 定义了 Widget Tree IR v1：应用在 TSX（`nsh-widgets/base`、`nsh-widgets/kit`）或 Rust JSON 中声明树形结构并喂入数据，再由各端通用原生渲染器完成绘制。

苹果端由配套工具 `nsh-widgets-cli` 将单一 Swift 渲染器（`NshWidgets.swift`）编译进 WidgetKit 扩展，同时支持锁屏小组件、Live Activities 灵动岛与 iOS 18 控制中心控件；Android 端通过 `[package.metadata.nsh.android]` 注入 `android/nsh-widgets.aar` 驱动 RemoteViews、API 31+ 滚动列表与快捷设置磁贴；Linux 端则可生成 KDE Plasma 5/6 QML 插件、GNOME Shell 45–51 扩展、Cinnamon 桌面插件、layer-shell 窗口及 Waybar JSON。

## 无宿主交互机制与版本实测边界

用户点击小组件按钮时，无需唤醒主界面即可通过 App Intent（Apple）或非导出广播接收器（Android）修改共享存储数据，主应用可通过 `take_actions`、`next_change` 或 `Widgets.onChange(...)` 消费变更。

据上游 `README.md` 说明，`0.4.1` 暂不提供 Windows 原生小组件宿主与 COSMIC applet，且未在实体 iPhone/Android 真机验证；纯终端或 Waybar 状态栏环境可使用 `nsh-widgets show --format waybar` 作为轻量输出。

- 希望用同一套数据模型同时覆盖 iOS 灵动岛实时活动、Android 桌面滚动列表与快捷磁贴。
- 为 Linux 桌面应用自动生成 KDE Plasma Plasmoid 与 GNOME 顶栏弹窗，免去手写 QML 与 GJS 扩展代码。
- 利用 `nsh-widgets preview --simulator` 在无真机时预览各尺寸小组件的明暗主题布局。

## 为何在 nsh 0.7.1 必须加 `--rev master` 安装

尽管 crates.io 与 GitHub tag `v0.4.1` 均存在 `0.4.1` 版本，但它们的 `nsh.json` 仍锁定 `"nsh": "^0.6"`，在 `nsh 0.7.1` 下直接运行 `nsh add nsh-widgets` 或 `github:SuperNSH/widgets` 会因版本不匹配被拒绝。使用完整 Git URL 加 `--rev master` 才能拉取已更新为 `"nsh": "^0.7.1"` 的清单。

- 需 `nsh 0.7.1+`（依赖 `ios.extensions`、`android.libraries` 等能力）及配套命令行 `nsh-widgets-cli`（`cargo install nsh-widgets-cli` 或下载 Release）。
- Apple 扩展需 macOS 与 Xcode 26+（含 `appintentsmetadataprocessor`），灵动岛需 iOS 16.2+，控制中心控件需 iOS 18+。
- Android 需 API 26+（滚动列表与开关圆角需 API 31+）；Linux 桌面需安装对应 `kpackagetool` / GTK3 / `nsh-widgets` 二进制。

## 包导出子路径与外部 CLI 套件

除根库外额外提供两个 TSX 构建子路径与独立 CLI 打包器。

- **nsh-widgets:** 运行时接口 `Widgets`（`setUi`、`update`、`onChange`、`startActivity`）。
- **nsh-widgets/base 与 nsh-widgets/kit:** Widget Tree IR 底层原语及预设样式组件（`Card`、`Stat`、`ActionButton` 等）。
- **nsh-widgets-cli:** 外部构建与部署工具，包含 `build`、`preview`、`show`、`plasmoid`、`gnome`、`doctor` 等子命令。

## nsh 0.7.1 实测验证记录

CI 使用 `nsh add https://github.com/SuperNSH/widgets.git --rev master` 在 `nsh 0.7.1 (f78eace)` 临时工程通过验证，锁定 `0.4.1`（`MIT`，更新于 `2026-11-26`）。

验证边界声明：Awesome NSH 仅验证 `nsh add` 在 `0.7.1` 下正常写入依赖与锁文件；上游报告的 10 项 Store 测试、21 项 CLI 测试与模拟器截图均由上游仓库维护，本站未复跑扩展编译。
