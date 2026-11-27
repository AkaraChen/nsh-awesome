# nsh-webgpu

> 基于 wgpu 29 移植自 react-native-webgpu 的 NSH WebGPU 模块，提供 `navigator.gpu` 与 `<Canvas>` 原生 GPU 渲染。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/nsh-webgpu/](https://nsh-awesome.vercel.app/zh/nshm/nsh-webgpu/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/nsh-webgpu.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `nsh-webgpu` |
| 分类 | 图表、图谱与 GPU 画布 (`visualization`) |
| 形态 | Rust + TSX 混合 nshm (`hybrid-nshm`) |
| 分发来源 | `github` |
| 模块版本 | `0.1.0` |
| 兼容 NSH 版本 | `>=0.7.1` |
| 支持平台 | macOS、iOS、Android、Windows、Linux、Web |
| 许可证 | MIT |
| 最近核验更新 | 2026-11-25 |
| 源码仓库 | [https://github.com/SuperNSH/webgpu](https://github.com/SuperNSH/webgpu) |

## 安装命令与验证说明

```bash
nsh add github:SuperNSH/webgpu
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

仅托管于 GitHub（`Cargo.toml` 标注 `publish = false`，未发布至 crates.io）。

## 同分类相关模块

- [nsh-graph](https://nsh-awesome.vercel.app/zh/nshm/nsh-graph.md) — 基于原生 `<Canvas>` 的交互式网络图谱组件，内置力导向、分层、环形与网格布局，并支持可选的 Rust 加速后端。
- [nsh-o11y](https://nsh-awesome.vercel.app/zh/nshm/nsh-o11y.md) — 高性能可观测性可视化图表套件（时序折线、日志直方图、Trace 瀑布图与火焰图），采用 M4 金字塔降采样与可选 Rust 存储。
- [nsh-skia](https://nsh-awesome.vercel.app/zh/nshm/nsh-skia.md) — 基于 `skia-safe` 实现的 Skia 2D 绘图与着色器模块（兼容 react-native-skia API），支持 macOS Metal 与 Linux OpenGL。
