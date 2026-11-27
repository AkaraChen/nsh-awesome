---
entryId: nsh-graph
lang: zh
title: nsh-graph：基于原生 Canvas 的 NSH 网络关系图谱组件
description: 内置力导向、分层、环形与网格四种布局，支持社区折叠、OffscreenCanvas 导出 PNG、色盲友好配色及可选 Rust 加速。
h1: nsh-graph：基于原生 Canvas 的交互式网络图谱模块
summary: JetSquirrel 出品的混合型可视化 nshm，借鉴 gpui-graph 与 Neo4j NVL 设计，在 NSH 原生 `<Canvas>` 上运行，并提供可选开启的 Rust 物理布局与路径批处理后端。
updatedAt: 2026-11-25
platformSupport:
  heading: 覆盖桌面、移动、GPUI 与 Web 的原生 Canvas 支持
  overview: 基于 NSH 统一的 `<Canvas>` 原生绘图接口实现，不绑定特定显卡 API，可跑通全系列官方与 GPUI 后端。
  matrix:
    - platform: macOS / Windows / Linux
      status: 完整支持
      notes: 上游测试涵盖无头引擎测试与真实桌面宿主的鼠标/键盘输入验证。
    - platform: iOS / Android
      status: 完整支持
      notes: 支持单指拖拽、双击触发与双指捏合缩放手势。
    - platform: GPUI
      status: 完整支持
      notes: 通过 NSH `<Canvas>` 在 GPUI 桌面窗口中同样可用。
    - platform: Web
      status: 完整支持（含线上演示）
      notes: 上游已在 `jetsquirrel.github.io/nsh-graph/` 部署可交互图谱演示画廊。
securityNote:
  heading: Rust 链接与 Reduce Motion 降动效说明
  body: 即使未调用 `setNativeBackend`，安装 `nsh-graph` 后工程仍会编译 `native/src/lib.rs`。运行期当系统开启 Reduce Motion（减弱动态效果）时，图谱会在后台以 10 ms 切片完成布局后再一次性呈现最终位置。
related:
  - id: nsh-o11y
    path: /zh/nshm/nsh-o11y/
    name: nsh-o11y
    reason: 同作者 JetSquirrel 开发的观测图表套件，沿用同一套架构规范与色盲安全配色。
  - id: nsh-webgpu
    path: /zh/nshm/nsh-webgpu/
    name: nsh-webgpu
    reason: 面对超大规模粒子/3D 图谱需要自定义 WGSL 着色器时可评估迁移底层 GPU 渲染。
  - id: nsh-skia
    path: /zh/nshm/nsh-skia/
    name: nsh-skia
    reason: 需要自定义 2D 滤镜、高斯模糊或 `react-native-skia` 画布 API 时的备选图形库。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/templates/
    label: 查看 NSH 示例与参考工程
---

## 四大动画布局与按需启用的 Rust 加速路径

`nsh-graph` 导出 `<GraphView>`、`<GraphLegend>`、`createGraphController()` 与 `mergeGraphData()`，内置 Barnes-Hut 力导向（含碰撞、引力与分组聚集）、四方向防环分层布局、环形布局与网格布局，切换布局时具备平滑过渡动画。

小规模图谱默认在 QuickJS 中直接运行；节点数达到数千级时，只需在启动阶段调用 `setNativeBackend(native)` 引入 `"nsh-graph/native"`，即可把耗时的 `ForceLayout` 迭代状态和 `GraphPainter` 分色 `Path2D` 批处理迁移到 Rust（`native/src/lib.rs`），显著降低每帧 JS 与原生层的通信开销。

## 交互特性完备性与本地路径调试提醒

组件内建拖拽平移、滚轮/双指捏合缩放、Shift 框选、邻接节点悬停提示、右键菜单、键盘漫游（方向键/`+`/`-`/`0`/`p`/`Esc`）、社区超节点折叠（`×N` 聚合边）、8 色色盲友好调色板、按节点 ID 差量保留固定位置的 `data` 更新，以及基于 `OffscreenCanvas` 的 `controller.toImage()` PNG 导出。

若通过本地 `--path` 调试源码而非使用 crates.io 版本，务必按上游提示在 `.cargo/config.toml` 配置 `[profile.dev.package.nsh-graph] opt-level = 3`，否则 debug 模式会让力布局速度下降约一个数量级。

- 知识图谱、调用链路或类 Neo4j 关系网浏览，结合 `mergeGraphData` 增量展开相邻节点。
- 带分组/社区划分的大型拓扑图，通过双击超节点展开或折叠 `×N` 社区簇。
- 兼顾 QuickJS 轻量模式与数千节点高性能需求的跨端桌面/GPUI 应用。

## crates.io 安装方法与 Rust 后端开启方式

`nsh-graph@0.3.0` 已在 crates.io 发布并兼容 `nsh >= 0.7`（`Cargo.toml` 依赖 `nsh-core = "0.7.0"`），直接使用 `nsh add nsh-graph` 即可安装。

- 需 `nsh >= 0.7` 与本机 Rust 工具链（打包 Web 需 `wasm32-unknown-unknown`）。
- 默认启用 TS 布局；若开启 Rust 加速，需在应用启动时从 `"nsh-graph/native"` 导入并调用 `setNativeBackend`。
- 如使用 `--path` 挂载本地修改版，请在应用 `.cargo/config.toml` 单独调高该 crate 优化等级。

## 导出模块划分与上游基准参考

同一包内同时交付 TSX 组件层与可按需接入的 `nsh-graph/native` Rust 层。

- **nsh-graph（TSX 主入口）:** 导出 `GraphView`、`GraphLegend`、`createGraphController`、`mergeGraphData` 与 `setNativeBackend`。
- **nsh-graph/native（Rust 后端）:** 提供状态常驻 Rust 的 `ForceLayout` 与批量生成 SVG 路径的 `GraphPainter`。
- **上游性能测试说明:** 作者在 `JetSquirrel/nsh-graph` README 中披露了 34 至 5,000 节点下 TypeScript 与 Rust 后端在 QuickJS 中的 tick/draw 对比数据。

## nsh 0.7.1 实测验证记录

CI 在 `nsh 0.7.1 (f78eace)` 临时应用中运行 `nsh add nsh-graph` 验证通过，从 `crates.io` 锁定 `0.3.0`（`Apache-2.0`，更新于 `2026-11-25`）。

验证边界声明：本站 CI 仅确认 `nsh add` 依赖安装正确；上游文档中的帧耗与竞品布局对比基准均出自 `JetSquirrel/nsh-graph` 自身测试环境，本站未复测。
