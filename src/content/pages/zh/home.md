---
pageType: home
pageSlug: home
lang: zh
title: "Awesome NSH: Native Shell 模块与 Crate 目录"
description: 收录 13 个通过 nsh 0.7.1 实测的可安装 Native Shell (nshm) 模块、19 个官方框架 crate、脚手架模板与文档指南，提供 index.json 机器索引。
h1: Awesome Native Shell 模块（nshm）与 Crate 目录
lead: 面向 Native Shell（nsh 0.7.1）的精选目录与机器可读索引：覆盖实测可安装的 nshm 扩展包、官方核心框架 crate、工程模板与文档指南。
updatedAt: 2026-11-27
definitionHeading: 什么是 Native Shell（nsh）与 nshm 模块？
securityNotice:
  heading: 构建脚本与供应链安全提示
  body: 安装 Rust、混合模式或平台 nshm 时，其 build.rs 构建脚本、过程宏与运行时代码会以当前应用的完整权限执行；crate 还可通过 [package.metadata.nsh] 注入系统权限声明、Info.plist 文案、macOS entitlements 或鸿蒙权限配置。交付生产前务必核查上游源码仓库与 nsh.lock 变更。
installSourcesTable:
  heading: nsh 0.7.1 三种远程安装来源对比
  intro: nsh 0.7.1 命令行支持 crates.io、github:owner/repo 与 Git URL 三种远程来源及本地 --path 路径。不同来源对应的锁文件格式与维护背景各有差异。
  columns:
    - 来源类型
    - CLI 命令格式
    - 实测收录数
    - nsh.lock 解析目标
    - 常见使用原因
  rows:
    - - crates.io
      - nsh add <crate> [--features ...]
      - 7（另附 40 个图标子 crate）
      - <version> (crates.io)
      - 已在 Cargo 官方仓库发布兼容 nsh-core 0.7.x 的稳定版本（nsh-extra、nsh-omarchy、nsh-icon、supernsh-icons、nsh-graph、nsh-o11y、nsmetry）。
    - - github:owner/repo
      - nsh add github:<owner>/<repo>
      - "5"
      - git+https://github.com/<owner>/<repo>
      - Cargo.toml 显式标注 publish = false（nsh-webgpu、nsh-skia）、经 GitHub 实测验证的早期或纯 TSX 包（纯 TSX 的 nsh-query；早期 0.1.0 的 nsh-shadcn 于 2026-11-26 通过 GitHub 验证，早于其 2026-11-27 crates.io 初始上传），或 crates.io 旧版缺失字段而 GitHub 已修复（nsh-platform-harmonyos 0.1.1）。
    - - Git URL + --rev
      - nsh add <https-git-url> --rev <branch>
      - "1"
      - git+https://github.com/SuperNSH/widgets.git?rev=master
      - crates.io 发行版与版本 tag 仍锁定旧版 nsh ^0.6，而仓库默认分支已升级 ^0.7.1（例如 nsh-widgets 需加 --rev master）。
ecosystemStats:
  heading: 生态覆盖统计（基于 nsh 0.7.1 实测）
  summary: 由于 nsh 0.7.1 CLI 自身未内置搜索或模块列表命令，Awesome NSH 联合六条外部发现渠道（crates.io keyword=nshm、nsh-core 反向依赖、keyword=nsh/native-shell、longbridge/nsh-showcases、GitHub 主题/代码搜索与 GitHub 组织仓库枚举）持续扫描，并在干净临时应用中逐条运行 nsh add 验证。
  metrics:
    - label: 目录收录总条目
      value: "43"
      detail: 13 个可安装 nshm、19 个框架 crate、4 个模板示例、7 篇指南
    - label: 实测 crates.io Crate
      value: "119"
      detail: 7 个干净 0.7.1 nshm + 40 图标子包 + 3 数据包 + 18 个 0.6 规范化绕过包 + 19 官方 crate 等
    - label: 实测 GitHub 仓库
      value: "89"
      detail: 额外检出 6 个干净 0.7.1 GitHub/Git nshm、3 个不兼容模块、应用脚手架与非 nshm 工具
    - label: 机器可读索引端点
      value: index.json / count.json
      detail: 由单一数据源 data/entries.json 自动生成
faqs:
  heading: Native Shell 与 nshm 常见问题
  items:
    - question: 内置模块 nsh/*、可安装 nshm 与官方框架 crate 有何区别？
      answer: '从 "nsh" 导入的内置模块随运行时附带，无需额外安装；nshm 是通过 nsh add 写入 nsh.json 与 nsh.lock 的第三方或可选扩展模块；而 nsh-core、nsh-base、nsh-platform-macos 等 19 个官方 crate 属于框架内部组件，缺少 #[native_module] 与 exports，不能执行 nsh add，由 nsh 自动管理或在 Rust 项目中用 cargo add 引入。'
    - question: 为什么 nsh 0.7.1 没有内置 nsh search 命令？
      answer: nsh 0.7.1 的命令行聚焦于从明确标识安装模块：crates.io crate 名、github:owner/repo 简写、带分支/修订号的 Git URL 或本地 --path，暂未提供中央包搜索接口。因此本站点通过自动化脚本汇总六大渠道并开放 index.json 供人与 AI 工具检索。
    - question: 为何 13 个已验证模块中有 6 个通过 GitHub 或 Git URL 安装？
      answer: '0.7 生态尚处快速迭代阶段：nsh-webgpu 与 nsh-skia 在 Cargo.toml 中标明了 publish = false；纯 TSX 的 nsh-query 不含 Cargo.toml；早期 0.1.0 版本的 nsh-shadcn 于 2026-11-26 验证时尚未发布至 crates.io（初始 0.1.0 于 2026-11-27 上传），当前目录仍保留已验证的 github:caoxing9/nsh-shadcn 安装指令；nsh-platform-harmonyos 在 crates.io 的 0.1.0 缺少 "platform" 字段导致 nsh add 报错，必须装 GitHub 0.1.1；nsh-widgets 的 crates.io 0.4.1 与 tag v0.4.1 仍锁定 nsh: ^0.6，需要用 --rev master 安装。'
    - question: 所有 nshm 模块在打包应用时都需要安装 Rust 工具链吗？
      answer: 不一定。包含 Rust crate 的 rust-nshm、hybrid-nshm 与 platform-nshm 需要本地 Cargo 与 rustc（Web 目标通常还需 wasm32-unknown-unknown，部分图形库还需 LLVM clang/llvm-ar）；而像 nsh-query 这样的纯 TSX 模块不含 Cargo.toml，可直接由 nsh 打包。
    - question: Awesome NSH 的自动验证具体测了什么、没测什么？
      answer: 仓库 CI 会在全新临时应用的 nsh.json 目录下使用 nsh 0.7.1 逐条运行 nsh add 并校验 nsh.lock 生成结果。它没有在真机或全平台环境下实际编译与运行 UI 界面，原生运行验证边界已在 /zh/about/ 页面明确说明。
navigationHighlights:
  heading: 浏览目录分区与技术支柱页面
  items:
    - path: /zh/nshm/
      title: 可安装 nshm 模块清单（13）
      summary: 按 UI、图标、图表画布、数据请求与鸿蒙平台对比 13 个已验证可安装模块。
    - path: /zh/framework/
      title: 框架与官方平台后端 Crate（19）
      summary: 完整梳理 longbridge/nsh 下的 11 个核心运行时 crate 与 8 个平台后端，厘清不可 nsh add 的原因。
    - path: /zh/templates/
      title: 脚手架模板与参考应用（4）
      summary: 对比官方示例、SuperNSH/starter 工程模板、nsh-showcases 与 huacnlee/disktree。
    - path: /zh/guides/
      title: 官方文档与学习路线（7）
      summary: 按快速上手、原生扩展开发与跨框架对比三条路线组织 nsh.dev 权威文档。
    - path: /zh/discovery/
      title: nshm 发现机制与验证实录
      summary: 深入解读 4 种合法清单格式、Cargo 0.6 规范化 parser quirk、6 渠道命中数与排除账本。
    - path: /zh/about/
      title: 关于站点、验证边界与安全策略
      summary: 了解维护者 AkaraChen、CI 验证范围限制、供应链安全提示与贡献指南。
---

Native Shell（nsh）是以 Rust 为核心的跨平台原生 UI 框架，开发者用 TSX 或 Rust 编写界面，即可在桌面、移动端、GPUI、终端与 Web 上挂载原生视图。可通过 nsh add 安装的扩展包称为 nshm。Awesome NSH 基于 nsh 0.7.1 实测收录 13 个 nshm、19 个框架 crate、模板与教程，并提供 index.json。
