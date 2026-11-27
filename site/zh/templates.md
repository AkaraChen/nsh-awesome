# 示例与模板

> 使用 Native Shell 构建的官方示例、工程脚手架、Showcase 目录以及可参考的真实应用。

HTML 专题页：[https://nsh-awesome.vercel.app/zh/templates/](https://nsh-awesome.vercel.app/zh/templates/) · [English](https://nsh-awesome.vercel.app/templates.md) · [返回目录首页](https://nsh-awesome.vercel.app/zh/index.md)

本分类共收录 **4** 个条目，全部来自单一数据源 `data/entries.json`（验证基准：`nsh 0.7.1`）。

## 脚手架与参考应用 (4)

- [longbridge/nsh Examples](https://github.com/longbridge/nsh/tree/main/examples) — 官方示例集合，涵盖 TSX、纯 Rust（`tasks-rs`）、混合导出 `rust-exports`、系统托盘、宿主嵌入与 `nsh-extra` 用法。
  - 类型：`examples` · 来源：`github` · 版本：`0.7.1` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：Apache-2.0 · 更新：2026-11-26 · [源码仓库](https://github.com/longbridge/nsh/tree/main/examples) · [文档 / 演示](https://nsh.dev/gallery)
- [SuperNSH/starter](https://github.com/SuperNSH/starter) — 基于 NSH 0.7.1 的生产级应用脚手架模板，完整演示导航、表单、虚拟列表、动画、与签名远程 TSX 包加载。
  - 类型：`template` · 来源：`github` · 版本：`0.1.0` · 平台：macOS、iOS、Android、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/SuperNSH/starter)
  - 说明：属于应用工程模板（`publish = false` 且 `nsh.json` 含 `"root": "App"`），非可复用库。
- [longbridge/nsh-showcases](https://github.com/longbridge/nsh-showcases) — 驱动 `nsh.dev/apps` 与 `nsh.dev/directory` 的官方社区展示仓库，收录真实应用案例与生态项目清单。
  - 类型：`directory` · 来源：`github` · 平台：macOS、iOS、Android、Windows、Linux、Web · 许可证：MIT · 更新：2026-11-26 · [源码仓库](https://github.com/longbridge/nsh-showcases) · [文档 / 演示](https://nsh.dev/apps)
- [huacnlee/disktree](https://github.com/huacnlee/disktree) — 原生磁盘空间分析应用，也是官方 `ext/` 混合模式（TSX UI + Rust 扫描器）教程中的代表案例。
  - 类型：`reference-app` · 来源：`github` · 平台：macOS、Linux · 许可证：MIT · 更新：2026-11-25 · [源码仓库](https://github.com/huacnlee/disktree) · [文档 / 演示](https://huacnlee.github.io/disktree/)
