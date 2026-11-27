# nsh-widgets

> 跨平台桌面/锁屏小组件与 Live Activities 模块，通过统一 Widget Tree IR 在 WidgetKit、Android RemoteViews、KDE Plasma 与 GNOME 原生渲染。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/nsh-widgets/](https://nsh-awesome.vercel.app/zh/nshm/nsh-widgets/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/nsh-widgets.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `nsh-widgets` |
| 分类 | UI 组件与主题 (`ui`) |
| 形态 | Rust + TSX 混合 nshm (`hybrid-nshm`) |
| 分发来源 | `git` |
| 模块版本 | `0.4.1` |
| 兼容 NSH 版本 | `^0.7.1` |
| 支持平台 | iOS、macOS、Android、Linux |
| 许可证 | MIT |
| 最近核验更新 | 2026-11-26 |
| 源码仓库 | [https://github.com/SuperNSH/widgets](https://github.com/SuperNSH/widgets) |
| crates.io | [https://crates.io/crates/nsh-widgets](https://crates.io/crates/nsh-widgets) |

## 安装命令与验证说明

```bash
nsh add https://github.com/SuperNSH/widgets.git --rev master
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

NSH 0.7.1 需通过 Git URL `--rev master` 安装；crates.io 0.4.1 与 v0.4.1 tag 仍锁定 `nsh: ^0.6`。

## 同分类相关模块

- [nsh-omarchy](https://nsh-awesome.vercel.app/zh/nshm/nsh-omarchy.md) — 基于 nsh-base 的 Omarchy 风格原生 UI 组件库，支持自动跟随系统主题切换，在 Rust 与 TSX 中提供表单、浮层、表格与图表。
- [nsh-shadcn](https://nsh-awesome.vercel.app/zh/nshm/nsh-shadcn.md) — 使用 Rust 实现的 shadcn/ui new-york-v4 原生组件库，在桌面、移动与 Web 端以原生视图渲染，同时支持 Rust 与 TSX 调用。
