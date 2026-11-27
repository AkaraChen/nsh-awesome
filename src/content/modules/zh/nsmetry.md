---
entryId: nsmetry
lang: zh
title: nsmetry：对接 Cloudflare Worker 的 NSH 隐私埋点 SDK
description: 提供支持批量上报与失败重试的 NSH 事件分析客户端，搭配自托管 Cloudflare Worker 分析面板仓库，经由 crates.io 直接安装。
h1: nsmetry：面向自托管 Cloudflare Worker 的隐私事件分析 SDK
summary: huacnlee 开源的 MIT 隐私埋点客户端 SDK，支持离线排队、退避重试、应用退后台自动刷新及 `<NavStack>` 页面切换埋点，对接自托管 NsMetry Worker 与 D1 数据库。
updatedAt: 2026-11-26
platformSupport:
  heading: 客户端 SDK 六端运行表现
  overview: 核心排队代码与 Web 端 `sdk/js/src/core.ts` 共享，针对桌面、移动与浏览器适配生命周期与 UA 描述。
  matrix:
    - platform: iOS / Android
      status: 完整支持
      notes: '`useNsMetry` 在退入 `"background"` 时即时冲刷队列，`describePlatform` 上报移动端设备标识。'
    - platform: macOS / Windows / Linux
      status: 完整支持
      notes: 桌面切焦 `"inactive"` 不触发额外请求；应用退出时在 200 ms 宽限内尽力冲刷队列。
    - platform: Web
      status: 完整支持
      notes: "`describePlatform` 返回 `undefined`，直接沿用浏览器标准 `User-Agent` 请求头。"
securityNote:
  heading: 空原生占位 Crate 与网络权限说明
  body: "`nsmetry` 仅出于 crates.io 分发需要在 `sdk/nsh/` 包含空 Rust 库；实际打包应用时别忘了在应用的 `nsh.json` 配置 `capabilities.network.hosts` 允许访问你的统计服务端域名。"
related:
  - id: nsh-query
    path: /zh/nshm/nsh-query/
    name: nsh-query
    reason: 纯 TSX 请求缓存方案，与应用统计埋点一起覆盖网络数据链路。
  - id: nsh-o11y
    path: /zh/nshm/nsh-o11y/
    name: nsh-o11y
    reason: 在自有监控应用内绘制高密度时序图表时的可视化组合选择。
  - id: nsh-icon
    path: /zh/nshm/nsh-icon/
    name: nsh-icon
    reason: NsMetry 官方自身客户端中亦使用了 `nsh-icon-lucide`。
parentLinks:
  - path: /zh/nshm/
    label: 返回可安装 nshm 模块清单
  - path: /zh/discovery/
    label: 查看多 crate 子目录仓库的分发规则
---

## 无 Cookie 批量埋点与安全退避机制

NsMetry 是一套运行在 Cloudflare 免费套餐（单 Worker + D1）上的开源隐私分析系统，不使用 Cookie、不在存储中保留原始个人身份信息，匿名安装 ID 在服务端按站点加盐哈希。仓库 `huacnlee/nsmetry` 的根目录是完整的 NsMetry 仪表盘应用，而面向应用的客户端 SDK 位于子目录 `sdk/nsh/`。

SDK 导出 `createNsMetry`、`useNsMetry`（监听 `lifecycle()` 变为 `"background"` 及桌面端退出前 200 ms 窗口自动刷新）、`useScreenTracking`、`navStackPath` 与 `describePlatform`。事件默认每 5 分钟（`300_000 ms`）或满 50 条批量上报（离线队列上限 1,000 条），出错自动退避且永不向应用抛异常，同时刻意忽略桌面窗口切焦（`"inactive"`）以避免每次 Cmd-Tab 都发网络请求。

## Monorepo 目录结构注意事项（`app/` 与 `sdk/nsh/`）

查看 `huacnlee/nsmetry` 源码时需注意：**仓库根目录**本身是一个 NSH 应用（`nsh.json` 指向 `"entry": "app/App.tsx"`），而可供其他项目安装的 nshm 包位于 `sdk/nsh/`。因此本模块必须从 crates.io 执行 `nsh add nsmetry` 安装，而不能直接传根目录的 `github:huacnlee/nsmetry`。

值得开发者参考的工程技巧是，`sdk/nsh/Cargo.toml` 声明了一个空的 `native/src/lib.rs` 占位目标（依赖 `nsh-core = "0.7.0"`），专门用于借由 crates.io 分发纯 TypeScript 的 `nsmetry` 包。

- 在完全自建、零第三方追踪服务的前提下统计应用日/周/月活、留存、自定义事件及 `<NavStack>` 页面路径分布。
- 搭配根目录仓库一键部署的 Cloudflare Worker + D1 实例（内置邮件验证码登录与带 OAuth 权限控制的 MCP 服务端）。
- 通过 `client.setEnabled(false)` 与 `identify(null)` 立即清空队列并尊重用户退出遥测选择。

## 为何应通过 crates.io 而非 GitHub 根目录安装

`nsmetry@0.1.0` 已由 `sdk/nsh` 单独打包上架 crates.io，让 `nsh add nsmetry` 绕开仓库根目录的分析面板 `nsh.json` 精准提取 SDK，因此请直接使用 crates.io 包名安装。

- 需 `nsh >= 0.7`，并需自行部署一套 NsMetry Cloudflare Worker 服务端（生产环境建议绑定自有域名，避免 `*.workers.dev` 被广告拦截器屏蔽）。
- 占位原生目标只会在首次构建时参与 Cargo 空链接，无额外运行期原生成本。
- 使用 `useScreenTracking` 时建议去除路由中的具体记录 ID（上报 `/message` 而非 `/message/8812`），防止看板维度爆炸。

## 客户端核心 API 与后端生态组件

轻量埋点接口无缝衔接仓库内置的自托管面板。

- **createNsMetry 与上报方法:** 提供 `track(name, props?)`、`screen(path, props?)`、`identify`、`flush`、`shutdown` 与 `setEnabled`。
- **useNsMetry 与 useScreenTracking:** 自动对接前后台生命周期刷新及 `<NavStack>` 顶部路由追踪（`navStackPath`）。
- **自托管 Worker 与 OAuth MCP:** 同仓库包含 Cloudflare Worker + D1 看板应用、约 2 KB Web 埋点脚本及只读分析数据的 MCP 服务。

## nsh 0.7.1 实测验证记录

CI 已在 `nsh 0.7.1 (f78eace)` 临时应用中通过 `nsh add nsmetry` 完成校验，锁定 crates.io `0.1.0`（`MIT`，更新于 `2026-11-26`）。

验证边界声明：本站 CI 仅核验了 `nsh add nsmetry` 从 crates.io 获取包与写入 `nsh.lock` 的正确性，未实际部署 Cloudflare Worker 验证数据写入。
