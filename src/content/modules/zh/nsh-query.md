---
entryId: nsh-query
lang: zh
title: nsh-query：免 Rust 工具链的纯 TSX TanStack Query 适配
description: 将 useQuery、useMutation 与持久化存储接入 NSH 应用生命周期与网络状态，纯 TSX 模块无需编译 Rust 即可从 GitHub 安装。
h1: nsh-query：纯 TSX 的 TanStack Query 生命周期适配器
summary: 社区维护的纯 TSX 类型 nshm（无 Cargo.toml），将未改动的 @tanstack/query-core 5.108.4 封装为 solid-query 风格 Hooks，并与 NSH 生命周期、网络状态及 Storage 持久化打通。
updatedAt: 2026-11-25
platformSupport:
  heading: 六端一致的纯 TSX 支持状态
  overview: 随 NSH 内置 Rolldown 打包器打包至 QuickJS 或 Web JS 环境，在提供 `lifecycle()`、`network()` 与 `Storage` 的全端运行一致。
  matrix:
    - platform: iOS / Android
      status: 完整支持
      notes: 退入 `"background"` 自动暂停定时轮询，切回前台自动刷新陈旧数据。
    - platform: macOS / Windows / Linux
      status: 完整支持
      notes: 全窗口共享单实例缓存；设备休眠唤醒（`wakeCount()`）自动触发过期刷新；`"inactive"` 默认视为仍可见。
    - platform: Web
      status: 完整支持
      notes: 随前端束打包运行，无需 WASM Rust 编译。
securityNote:
  heading: 无构建脚本风险与运行期作用域说明
  body: 因为没有 `Cargo.toml`，`nsh-query` 在安装和构建阶段不运行任何 `build.rs` 或过程宏；作为 JS 运行时代码它仍会访问应用 `fetch` 与 `Storage`，更新版本时注意核对 `nsh.lock` 中的 Git 提交哈希。
related:
  - id: nsmetry
    path: /zh/nshm/nsmetry/
    name: nsmetry
    reason: 与服务端状态缓存互补，负责隐私友好的客户端事件与页面切换遥测上报。
  - id: nsh-omarchy
    path: /zh/nshm/nsh-omarchy/
    name: nsh-omarchy
    reason: 搭配表格、表单与 Toast 反馈承载 `useQuery`/`useMutation` 的加载与错误态展示。
  - id: nsh-extra
    path: /zh/nshm/nsh-extra/
    name: nsh-extra
    reason: 将相机、定位等设备端采集流程与异步状态管理和本地持久化结合。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 查看纯 TSX 清单规则与 crates.io 重名案例
---

## 适配 NSH 信号模型与平台生命周期

由于 Native Shell 组件函数只运行一次、仅在读取信号处局部重计算，React Query 的整树重渲染模型并不适用。`nsh-query` 对 `@tanstack/query-core` 采用 `solid-query` 风格封装：配置项必须为函数（`useQuery(() => ({ ... }))`），结果必须按属性访问而不可解构（读取 `todo.data` 而非 `const { data } = todo`）。

`QueryClientProvider`（或 `connectNsh()`）直接桥接 NSH 原生信号：当 `lifecycle()` 进入 `"background"` 时暂停轮询、回到前台重新拉取过期查询；桌面端非焦点可见窗口（`"inactive"`）默认视作可见继续轮询；系统休眠唤醒（`wakeCount()` 增长）和网络重连（`network().online`）自动触发刷新；子路径 `nsh-query/persist` 则可按每秒最多一次写入 5 MB 应用 `Storage`。

## 纯 TSX 优势与必须注意的 crates.io 同名冲突

在全部 13 个通过 `0.7.1` 实测的模块中，`nsh-query` 是**唯一一个纯 TSX（`tsx-nshm`）模块**，仓库没有 `Cargo.toml`，因此纯 TSX 项目安装它完全不需要配置 Rust 编译器。桌面多窗口应用中，整个引擎共享单一 `QueryClient` 缓存。

安装时务必避开两个关键坑点：第一，**绝对不要**省略 `github:Dearest/` 而运行 `nsh add nsh-query`——crates.io 上存在一个同名但并非 nshm 的 `nsh-query` Rust crate，直接安装必然失败；第二，不要额外手动安装 `@tanstack/query-core`，`nsh-query` 已内置绑定好上下文的版本，重复安装会导致生命周期信号失效。

- 纯 TSX 开发的跨端应用需要成熟的请求去重、后台自动刷新、乐观更新与离线持久化，同时希望保持零 Rust 构建开销。
- 利用 `PersistQueryClientProvider` 在应用重启冷启动首帧即刻展示上次缓存数据（注意确保 `gcTime >= maxAge`）。
- 桌面多窗口场景共用统一缓存，避免跨窗口重复请求。

## 为何仅托管 GitHub 及防同名碰撞指南

纯 TSX 包不包含 `Cargo.toml`，无法上架 Cargo 仓库（由根目录 `nsh.json` 的 `"exports"` 定义 `"nsh-query"` 与 `"nsh-query/persist"`）；且 crates.io 同名 crate 属于其他非 nshm 项目，故必须执行 `nsh add github:Dearest/nsh-query`。

- 纯 TSX 项目无需 Rust 工具链即可打包运行。
- 兼容 `nsh >= 0.6`（已在 `nsh 0.7.1` 验证通过，内部绑定 `query-core 5.108.4`）。
- 启用持久化时若缓存数据结构变更，请调整 `buster` 参数以失效旧缓存；若 5 MB 空间写满将通过 `removeOldestQuery` 淘汰最旧查询。

## 导出路径与相较 React Query 的差异

上游在 `docs/differences.md` 明确列出了精简后的 API 范围。

- **nsh-query:** 导出 `QueryClient`、`QueryClientProvider`、`connectNsh`、`useQuery`、`useMutation`、`useQueries`、`useInfiniteQuery`（统一 `use*` 前缀，无 `create*` 别名）。
- **nsh-query/persist:** 导出 `createNshStoragePersister`、`PersistQueryClientProvider` 与 `useIsRestoring()`。
- **不支持的 API:** 不含 Suspense、SSR/Hydration、`reconcile` 或 `useSuspenseQuery`；`throwOnError` 在读取 `.data` 时抛给最近的 `<ErrorBoundary>`。

## nsh 0.7.1 实测验证记录

CI 已在 `nsh 0.7.1 (f78eace)` 临时应用中运行 `nsh add github:Dearest/nsh-query` 通过，锁定 `0.1.0`（`MIT`，更新于 `2026-11-25`，源 `git+https://github.com/Dearest/nsh-query`）。

验证边界声明：本站 CI 仅确认 `nsh add` 正确写入了 `nsh.json` 与 `nsh.lock`；上游 `tests/PARITY.md` 与 `example/` 假接口演示未在本站 CI 中运行。
