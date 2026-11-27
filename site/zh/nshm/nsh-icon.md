# nsh-icon

> 支持按需裁剪的矢量图标渲染器（`<Icon>` 与 `icon()`），配套 5 个可单独安装的图标集 crate（Lucide、Heroicons、Tabler、Phosphor、Remix）。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/nsh-icon/](https://nsh-awesome.vercel.app/zh/nshm/nsh-icon/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/nsh-icon.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `nsh-icon` |
| 分类 | 图标库 (`icons`) |
| 形态 | Rust nshm（crates.io / Git 源码 crate） (`rust-nshm`) |
| 分发来源 | `crates.io` |
| 模块版本 | `0.2.2` |
| 兼容 NSH 版本 | `>=0.7` |
| 支持平台 | macOS、iOS、Android、Windows、Linux、Web |
| 许可证 | Apache-2.0 |
| 最近核验更新 | 2026-11-25 |
| 源码仓库 | [https://github.com/huacnlee/nsh-icon](https://github.com/huacnlee/nsh-icon) |
| crates.io | [https://crates.io/crates/nsh-icon](https://crates.io/crates/nsh-icon) |

## 安装命令与验证说明

```bash
nsh add nsh-icon
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

配合具体图标包使用，例如 `nsh add nsh-icon-lucide`（另有 heroicons、tabler、phosphor、remix 共 5 个子包）。

## 同分类相关模块

- [supernsh-icons](https://nsh-awesome.vercel.app/zh/nshm/supernsh-icons.md) — 基于 Iconify 的强类型 SVG 与字体图标库，覆盖 260 套（约 46.5 万个）图标，并拆分为 35 个可按需安装的 `supernsh-icons-*` 子 crate。
