# nsmetry

> 面向 NSH 应用的隐私优先事件分析客户端 SDK，支持批量上报与重试，对接自托管 NsMetry Cloudflare Worker 服务。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/nsmetry/](https://nsh-awesome.vercel.app/zh/nshm/nsmetry/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/nsmetry.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `nsmetry` |
| 分类 | 数据请求与分析 (`data`) |
| 形态 | Rust + TSX 混合 nshm (`hybrid-nshm`) |
| 分发来源 | `crates.io` |
| 模块版本 | `0.1.0` |
| 兼容 NSH 版本 | `>=0.7` |
| 支持平台 | macOS、Windows、Linux、Android、iOS、Web |
| 许可证 | MIT |
| 最近核验更新 | 2026-11-26 |
| 源码仓库 | [https://github.com/huacnlee/nsmetry](https://github.com/huacnlee/nsmetry) |
| crates.io | [https://crates.io/crates/nsmetry](https://crates.io/crates/nsmetry) |

## 安装命令与验证说明

```bash
nsh add nsmetry
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

仓库同时包含服务端分析面板应用与根目录的 nshm 客户端 SDK。

## 同分类相关模块

- [nsh-query](https://nsh-awesome.vercel.app/zh/nshm/nsh-query.md) — 纯 TSX 实现的 TanStack Query 适配模块（`useQuery`、`useMutation` 与持久化缓存），已接入 NSH 应用生命周期与存储。
