---
entryId: nsh-o11y
lang: zh
title: nsh-o11y：Native Shell 高吞吐可观测性图表套件
description: 提供时序折线、日志分布、Trace 瀑布图与火焰图，采用 M4 金字塔降采样与 createChartSync 多面板十字准星联动。
h1: nsh-o11y：面向可观测性的高性能图表组件套件
summary: JetSquirrel 基于原生 `<Canvas>` 构建的遥测可视化套件，集成时序折线、日志检索直方图、Trace 瀑布图、调用火焰图与热力图，并支持 Rust 原生存储加速。
updatedAt: 2026-11-25
platformSupport:
  heading: 七端原生 Canvas 支持矩阵
  overview: 沿用与 `nsh-graph` 一致的 NSH `<Canvas>` 方案，覆盖桌面、移动、GPUI 与 Web 静态输出。
  matrix:
    - platform: macOS / Windows / Linux
      status: 完整支持
      notes: 上游测试包含 store 精确度比对、TS 与 Rust 路径一致性校验及深浅色截图测试。
    - platform: iOS / Android
      status: 完整支持
      notes: 支持触摸拖拽平移与双指捏合缩放时序区间。
    - platform: GPUI
      status: 完整支持
      notes: 与 GPUI 嵌入宿主共享 `<Canvas>` 绘图通路。
    - platform: Web
      status: 完整支持（含演示站）
      notes: 官方示例仪表盘已通过 `nsh package --target web` 部署至 `jetsquirrel.github.io/nsh-o11y/`。
securityNote:
  heading: QuickJS 单次调用限制与构建提醒
  body: 解析大型火焰图折叠文件请选用切片异步接口 `profileFromFoldedAsync`，避免单次同步计算超过 QuickJS 2 秒保护阈值；安装本库也会通过 Cargo 编译 `native/src/lib.rs`。
related:
  - id: nsh-graph
    path: /zh/nshm/nsh-graph/
    name: nsh-graph
    reason: 同作者开发的网络拓扑图谱库，风格与配色体系一脉相承。
  - id: nsh-skia
    path: /zh/nshm/nsh-skia/
    name: nsh-skia
    reason: 需要自定义 2D 滤镜特效与手绘路径渲染器时的备选方案。
  - id: nsmetry
    path: /zh/nshm/nsmetry/
    name: nsmetry
    reason: 用于客户端事件埋点上报，与面向监控可视化前端的 `nsh-o11y` 形成数据采集与展示配合。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/guides/
    label: 查看官方文档路线
---

## M4 金字塔降采样与双层原生画布架构

`nsh-o11y` 针对百万级采样与实时数据流场景设计：每个序列维护一套以 8、64、512……分块的最小/最大金字塔，渲染每帧像素列时直接采用 M4 降采样（首、最小、最大、末值）。渲染开销只取决于绘图区像素宽度而不随采样总量线性暴涨，且不会丢失单点尖峰毛刺。

在绘制上采用双 `<Canvas>` 分层：底层承载网格、坐标轴与序列路径，顶层专门绘制十字准星、悬停高亮点与框选缩放框，因此移动鼠标不会重绘整条曲线。除核心 `TimeSeriesChart` 外，库内还提供 `LogView`、`TraceWaterfall` / `TraceComparison`、`ServiceMap`、`FlameGraph` / `SandwichView` 及时间分桶 `Heatmap`。

## TS 存储与可选 Rust 存储（`SeriesBuffer`）取舍

在桌面与移动端使用的 QuickJS Runtime 解释环境中，单个 JS 宿主受限于 256 MB 堆上限且循环执行慢于 V8 引擎。上游实测说明纯 TypeScript 存储可流畅承载约 200 万采样（测试范围涵盖 100k、1M 与 10M 级序列）；若开启 `"nsh-o11y/native"`（`setNativeBackend`），采样点常驻 Rust 侧 `SeriesBuffer` 并由 `lod.rs` 同步执行金字塔与 M4 计算，仅回传整数十分之一点坐标的 SVG 路径给画布，从而绕过 256 MB 内存墙。

多图表联动可通过 `createChartSync()` 共享十字准星与缩放区间，同时内建 SLO 阈值线、发布事件标注、双 Y 轴、色盲安全调色板及键盘与读屏无障碍支持；上游还对比了 uPlot 1.6.32、ECharts 6.1.0、Chart.js 4.6.2、Plotly 4.3.0 与 Dygraphs 2.2.2 在浏览器 Canvas 2D 下的帧耗时表现。

- 自建 APM、日志监控或系统性能分析工具，在一个界面联动指标（`TimeSeriesChart`）、日志（`LogView`）、链路（`TraceWaterfall`）与火焰图（`FlameGraph`）。
- 高频实时写入看板（`append` + `maxPoints` + 滑动 `window`），以批次平移动态维护金字塔避免全量重建。
- 超出 QuickJS 256 MB 堆上限的超大规模时序数据集，开启 `nsh-o11y/native` 交由 Rust 存储处理。

## crates.io 安装方法与 Rust 存储启用

`nsh-o11y@0.1.0` 已在 crates.io 发布并要求 `nsh >= 0.7`（`Cargo.toml` 依赖 `nsh-core = "0.7.0"`），直接使用 `nsh add nsh-o11y` 即可安装。

- 需 `nsh >= 0.7` 与本地 Rust 工具链（打包 Web 版需 `wasm32-unknown-unknown`）。
- 默认可直接运行 TS 存储；若需 Rust 加速，启动时从 `"nsh-o11y/native"` 导入并传给 `setNativeBackend`（须在创建 store 前调用）。
- 若通过 `--path` 本地调试，请复制上游 `.cargo/config.toml` 配置避免 Rust `lod.rs` 以低优化运行。

## 套件内含主要组件与特性

一个模块集成四大可观测性信号（指标、日志、链路、剖析）及辅助引擎。

- **TimeSeriesChart 与 createChartSync:** M4 金字塔时序折线/阶梯/面积图，支持双轴、SLO 阈值、标注与跨面板十字准星联动。
- **LogView、TraceWaterfall 与 ServiceMap:** 带日志量柱状分布的虚拟化日志查看器、Span 瀑布图（含耗时 diff）及服务拓扑图。
- **FlameGraph、SandwichView 与 Heatmap:** 支持折叠栈异步切片解析（`profileFromFoldedAsync`）、单函数上下游三明治视图与时序分桶热力图。

## nsh 0.7.1 实测验证记录

CI 已在 `nsh 0.7.1 (f78eace)` 临时应用中验证 `nsh add nsh-o11y`，锁定 crates.io `0.1.0`（`Apache-2.0`，更新于 `2026-11-25`）。

验证边界声明：本站 CI 仅确认 `nsh add` 依赖解析与锁定成功；上游 README 中与 uPlot/ECharts/Chart.js/Plotly/Dygraphs 的性能表格及 10M 采样耗时均出自 `JetSquirrel/nsh-o11y` 测试环境，本站未独立复跑压测。
