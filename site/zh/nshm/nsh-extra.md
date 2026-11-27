# nsh-extra

> NSH 官方按 Cargo feature 按需开启的设备能力模块集合，涵盖 camera、location、photos、push 与 speech。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/nsh-extra/](https://nsh-awesome.vercel.app/zh/nshm/nsh-extra/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/nsh-extra.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `nsh-extra` |
| 分类 | 官方扩展模块 (`official`) |
| 形态 | Rust nshm（crates.io / Git 源码 crate） (`rust-nshm`) |
| 分发来源 | `crates.io` |
| 模块版本 | `0.7.1` |
| 兼容 NSH 版本 | `0.7.1` |
| 支持平台 | iOS、Android、macOS、Windows、Web |
| 许可证 | Apache-2.0 |
| 最近核验更新 | 2026-11-25 |
| 源码仓库 | [https://github.com/longbridge/nsh/tree/main/crates/nsh-extra](https://github.com/longbridge/nsh/tree/main/crates/nsh-extra) |
| crates.io | [https://crates.io/crates/nsh-extra](https://crates.io/crates/nsh-extra) |
| 文档 / 演示 | [https://nsh.dev/docs/nshm#nsh-extra](https://nsh.dev/docs/nshm#nsh-extra) |

## 安装命令与验证说明

```bash
nsh add nsh-extra --features camera
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

各 feature 平台支持不同：camera（iOS、Android）、location（macOS、iOS、Web）、photos（iOS）、push（iOS、Android）、speech（macOS、iOS、Android、Windows、Web）。
