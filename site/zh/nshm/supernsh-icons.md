# supernsh-icons

> 基于 Iconify 的强类型 SVG 与字体图标库，覆盖 260 套（约 46.5 万个）图标，并拆分为 35 个可按需安装的 `supernsh-icons-*` 子 crate。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/supernsh-icons/](https://nsh-awesome.vercel.app/zh/nshm/supernsh-icons/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/supernsh-icons.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `supernsh-icons` |
| 分类 | 图标库 (`icons`) |
| 形态 | Rust + TSX 混合 nshm (`hybrid-nshm`) |
| 分发来源 | `crates.io` |
| 模块版本 | `0.2.0` |
| 兼容 NSH 版本 | `>=0.7` |
| 支持平台 | macOS、iOS、Android、Windows、Linux、Web |
| 许可证 | MIT |
| 最近核验更新 | 2026-11-25 |
| 源码仓库 | [https://github.com/SuperNSH/icons](https://github.com/SuperNSH/icons) |
| crates.io | [https://crates.io/crates/supernsh-icons](https://crates.io/crates/supernsh-icons) |
| 文档 / 演示 | [https://supernsh.github.io/icons/](https://supernsh.github.io/icons/) |

## 安装命令与验证说明

```bash
nsh add supernsh-icons
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

35 个 `supernsh-icons-*` 图标集子 crate 均归并在此条目下，避免清单被重复子包刷屏。

## 同分类相关模块

- [nsh-icon](https://nsh-awesome.vercel.app/zh/nshm/nsh-icon.md) — 支持按需裁剪的矢量图标渲染器（`<Icon>` 与 `icon()`），配套 5 个可单独安装的图标集 crate（Lucide、Heroicons、Tabler、Phosphor、Remix）。
