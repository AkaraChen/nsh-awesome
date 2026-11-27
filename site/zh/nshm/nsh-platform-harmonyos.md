# nsh-platform-harmonyos

> 社区维护的鸿蒙平台 nshm，安装后可使用 `--target harmonyos` 将 NSH 应用以 ArkUI 原生视图运行与打包至 HarmonyOS / OpenHarmony。

HTML 详情页：[https://nsh-awesome.vercel.app/zh/nshm/nsh-platform-harmonyos/](https://nsh-awesome.vercel.app/zh/nshm/nsh-platform-harmonyos/) · [English Markdown](https://nsh-awesome.vercel.app/nshm/nsh-platform-harmonyos.md) · [全部可安装 nshm](https://nsh-awesome.vercel.app/zh/nshm/)

## 模块档案

| 字段 | 值 |
|---|---|
| ID | `nsh-platform-harmonyos` |
| 分类 | 社区平台后端 (`platforms`) |
| 形态 | 社区平台后端 nshm (`platform-nshm`) |
| 分发来源 | `github` |
| 模块版本 | `0.1.1` |
| 兼容 NSH 版本 | `>=0.7` |
| 支持平台 | HarmonyOS、OpenHarmony |
| 许可证 | Apache-2.0 |
| 最近核验更新 | 2026-11-26 |
| 源码仓库 | [https://github.com/huacnlee/nsh-platform-harmonyos](https://github.com/huacnlee/nsh-platform-harmonyos) |
| crates.io | [https://crates.io/crates/nsh-platform-harmonyos](https://crates.io/crates/nsh-platform-harmonyos) |

## 安装命令与验证说明

```bash
nsh add github:huacnlee/nsh-platform-harmonyos
```

该模块已在干净临时应用中于 `nsh 0.7.1` 实测通过 `nsh add` 解析安装（不代表已在全部目标平台完成真机编译运行）。

## 补充说明

需使用 `github:huacnlee/nsh-platform-harmonyos`（0.1.1）安装；crates.io 上的 0.1.0 缺少 `nsh.json` `"platform"` 字段会导致 `nsh add` 报错。
