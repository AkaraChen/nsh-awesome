---
pageType: discovery
pageSlug: discovery
lang: zh
title: Native Shell nshm 发现机制与 nsh add 实测方法论
description: 基于 119 个 crates.io crate 与 89 个 GitHub 仓库的 NSH 0.7.1 六渠道实测：详述四类合法清单规则、0.6 规范化 quirks 与排除名单。
h1: nshm 模块定义规则、6 渠道发现机制与 0.7.1 实测账本
lead: 系统梳理 Awesome NSH 基于 `longbridge/nsh` 源码与 `nsh 0.7.1 (f78eace)` 真机命令行实测的发现方法：四类合法清单形态、Cargo 0.6 规范化 parser quirk、六渠道命中数与完整拒收账本。
datePublished: 2026-11-26
updatedAt: 2026-11-27
manifestRules:
  heading: 一、`nsh add` 认可的四种合法 nshm 清单结构
  intro: 一个包必须同时满足下方“结构入场规则”与“NSH 语义化版本校验（`check_nsh`）”，才能被 `nsh 0.7.1` 正常添加：
  columns:
    - 模块形态
    - 必备清单文件
    - 结构入口判断标准
    - NSH 版本兼容检查（check_nsh）
  rows:
    - - Rust nshm
      - Cargo.toml ([package])
      - '[lib] path（默认 src/lib.rs）某行包含 #[native_module("<specifier>")] 属性宏'
      - 检查 [dependencies]（或通过 nsh-core.workspace = true 引用 [workspace.dependencies]）中的 nsh-core 及可选 nsh.json "nsh"
    - - TSX nshm
      - nsh.json（无 Cargo.toml）
      - 声明 "name"、semver "version"，且非空 "exports" 将 <name> 或 <name>/* 映射到真实存在的 TSX/TS 文件
      - 检查可选 "nsh" semver 要求
    - - Hybrid nshm（Rust + TSX）
      - Cargo.toml + nsh.json
      - 'Rust crate 导出 #[native_module("<specifier>")] 且 nsh.json 声明 "exports"（若重复写 name/version 须与 Cargo 一致，且导出名不可与 Rust specifier 碰撞）'
      - 同时校验 Cargo.toml 的 nsh-core 与 nsh.json 的 "nsh"
    - - Platform nshm
      - Cargo.toml + nsh.json
      - 'nsh.json 声明 "platform": "<target>" 且 crate 构建二进制 nsh-platform-<target>（#[native_module] 可选）'
      - 同时校验 Cargo.toml 的 nsh-core 与 nsh.json 的 "nsh"
  nuances:
    - 存在 `Cargo.toml` 时，除非 `nsh.json` 显式声明了 `"exports"` 或 `"platform"`，否则 `nsh.json` 会被判定为普通应用配置而忽略。
    - "`Cargo.toml` 为虚拟工作区（virtual workspace root）会在 `nsh add` 时直接报错 `Cargo.toml has no [package] name`（实测见于 `github:SuperNSH/biometrics`）。多 crate 仓库必须把子 crate 发布到 crates.io，或将主 nshm `[package]` 放到仓库根目录（如 `SuperNSH/webgpu`、`SuperNSH/skia`、`SuperNSH/widgets`、`SuperNSH/icons`）。"
    - 采用混合模式的终端用户应用（如 `huacnlee/spotish`、`ryujane/Ferrix`、`SuperNSH/starter`）在 `src/lib.rs` 中同样写了 `#[native_module("...")]`，结构极易混淆，但它们在 `Cargo.toml` 标注 `publish = false` 并在 `nsh.json` 声明 `"root"`/`"id"` 而非 `"exports"`，需人工/规则筛除。
cargoPublishQuirk:
  heading: 二、发现 `nsh-cli 0.7.1` 中 Cargo 发布规范化解析绕过现象
  explanation: 当开发者运行 `cargo publish` 打包上传 crate 时，Cargo 会把平写形式 `[dependencies] nsh-core = "0.6.0"` 规范化改写成 TOML 子表（如 `[dependencies.nsh-core] version = "0.6.0"`）。然而 `nsh-cli 0.7.1` 的 `manifest.rs::nsh_core_requirement` 只扫描 `[dependencies]` 与 `[workspace.dependencies]`，遇到子表形式会误判 `nsh-core` 约束为 `None`。因此 crates.io 上 **18 个仍锁定 `nsh-core 0.6` / `0.6.0` 的 crate**（17 个 `SuperNSH/*` `0.1.0`/`0.0.1` 包及 `nsh-platform-miniprogram@0.1.0`）在 `nsh 0.7.1` 下竟然能绕过检查；而同样的源码从 GitHub 拉取未规范化写法时则会立刻被 `check_nsh` 拒绝。Awesome NSH 坚持按真实约束将其归为 0.6 目标暂缓收录。
  snippet: |-
    [dependencies.nsh-core]
    version = "0.6.0"
channelsTable:
  heading: 三、6 大发现渠道与实测命中统计
  intro: 运行 `node scripts/discover.mjs` 横跨 6 条渠道共检视了 119 个去重 crates.io crate 与 89 个去重 GitHub 仓库，最终确认 7 个干净兼容 `0.7.1` 的 crates.io 模块（外加 40 个图标子包与 3 个内部数据包）、6 个干净兼容 `0.7.1` 的 GitHub/Git 模块、18 个 0.6 规范化绕过 crate，以及 3 个明确 `0.6`/`=0.7.0` 不兼容 GitHub 模块。
  columns:
    - 发现渠道
    - 查询方式
    - 原始命中数
    - NSH 相关命中
    - 实测分析说明
  rows:
    - - 1. crates.io keyword=nshm
      - crates?keyword=nshm
      - "68"
      - "68"
      - 信噪比高，但混杂 35 个 supernsh-icons-* + 5 个 nsh-icon-* 图标子包、17 个锁定 0.6 的 SuperNSH/* crate、3 个非 nshm 辅助库及 crates.io 旧版 nsh-widgets。
    - - 2. crates.io 反向依赖
      - crates/nsh-core/reverse_dependencies
      - "107"
      - "104"
      - 捕获 18 个依赖 nsh-core 的官方框架 crate、早期未标 keyword 的 nshm（如 nsh-platform-harmonyos/miniprogram 0.1.0）以及 3 个无关 crate。
    - - 3. crates.io keyword=nsh / native-shell
      - crates?keyword=nsh, native-shell
      - 95 + 1
      - 94 + 1
      - 补充发现 nsh-auth、nsh-form、nsh-query（SuperNSH）、nsh-http、nsh-firebase-* 与 maplibre-nsh（大多为普通 Cargo 库）。
    - - 4. longbridge/nsh-showcases
      - directory/*/manifest.json
      - "10"
      - "10"
      - 官方 nsh.dev/directory 数据源：6 个可安装（nsh-graph、nsh-o11y、nsh-omarchy、nsh-icon、鸿蒙 GitHub 版、小程序 0.6 版）与 4 个非 nshm CLI/库项目。
    - - 5a. GitHub Topic 搜索
      - topic:nshm, topic:nsh, topic:native-shell
      - 1 + 57 + 7
      - 0 + 34 + 7
      - topic:nshm 仅返回 1 个无关地震研究仓；topic:nsh 发现 caoxing9/nsh-shadcn、Dearest/nsh-query 与大量应用；topic:native-shell 多为应用仓。
    - - 5b. GitHub Code 搜索
      - filename:nsh.json "exports" / "platform" / Cargo.toml "nshm"
      - 19 + 56 + 29
      - 7 + 6 + 21
      - 必须按精确文件名过滤 xonsh.json 干扰。关键盲区：GitHub 代码搜索对新建组织 org:SuperNSH 返回 0 条结果！
    - - 6. crates.io 反推 GitHub 组织枚举
      - orgs/<owner>/repos（SuperNSH、JetSquirrel、huacnlee、honsunrise）
      - 31 (SuperNSH)
      - "31"
      - 成功打捞出被 GitHub 代码与主题搜索完全遗漏的 SuperNSH/webgpu、SuperNSH/skia 与 SuperNSH/widgets（master 分支）。
acceptedTable:
  heading: 四、实测收录：13 个通过 nsh 0.7.1 验证的可用模块
  intro: 以下 13 个模块均已在 `nsh 0.7.1 (f78eace)` 全新临时工程执行 `nsh add` 通过并验证 `nsh.lock` 解析目标：
  columns:
    - 模块名称
    - 安装来源
    - 验证命令
    - 锁文件解析目标
  rows:
    - - nsh-extra
      - crates.io
      - nsh add nsh-extra --features camera
      - 0.7.1 (crates.io)
    - - nsh-omarchy
      - crates.io
      - nsh add nsh-omarchy
      - 0.2.0 (crates.io)
    - - nsh-icon（+5 图标集）
      - crates.io
      - nsh add nsh-icon
      - 0.2.2 (crates.io)
    - - supernsh-icons（+35 图标集）
      - crates.io
      - nsh add supernsh-icons
      - 0.2.0 (crates.io)
    - - nsh-graph
      - crates.io
      - nsh add nsh-graph
      - 0.3.0 (crates.io)
    - - nsh-o11y
      - crates.io
      - nsh add nsh-o11y
      - 0.1.0 (crates.io)
    - - nsmetry
      - crates.io
      - nsh add nsmetry
      - 0.1.0 (crates.io)
    - - nsh-query
      - GitHub (github:)
      - nsh add github:Dearest/nsh-query
      - 0.1.0 (git+https://github.com/Dearest/nsh-query)
    - - nsh-shadcn
      - GitHub (github:)
      - nsh add github:caoxing9/nsh-shadcn
      - 0.1.0 (git+https://github.com/caoxing9/nsh-shadcn)
    - - nsh-platform-harmonyos
      - GitHub (github:)
      - nsh add github:huacnlee/nsh-platform-harmonyos
      - 0.1.1 (git+https://github.com/huacnlee/nsh-platform-harmonyos)
    - - nsh-webgpu
      - GitHub (github:)
      - nsh add github:SuperNSH/webgpu
      - 0.1.0 (git+https://github.com/SuperNSH/webgpu)
    - - nsh-skia
      - GitHub (github:)
      - nsh add github:SuperNSH/skia
      - 0.1.0 (git+https://github.com/SuperNSH/skia)
    - - nsh-widgets
      - Git URL (--rev)
      - nsh add https://github.com/SuperNSH/widgets.git --rev master
      - 0.4.1 (git+https://github.com/SuperNSH/widgets.git?rev=master)
exclusionsTable:
  heading: 五、拒收、排除与暂缓名单（附 0.7.1 实测报错）
  intro: 所有未收录候选包均未私自抹除，也未为其制造凑页数的空白跳转页，全部集中在本账本公开原因：
  columns:
    - 候选包 / 仓库
    - nsh 0.7.1 实测报错或行为
    - 处理结论
  rows:
    - - github:AkaraChen/nsh-gpu-lexer
      - "nsh 0.7.1 报错：Cargo.toml: nsh-core requires nsh 0.6; this is nsh 0.7.1（0.6.0-nightly 可通过）。"
      - 暂缓至升级 NSH 0.7
    - - nsh-directories
      - 仍在开发阶段（审计时尚无公开 crate 或 GitHub 仓库）。
      - 暂不可用
    - - nsh-platform-harmonyos (crates.io 0.1.0)
      - "报错：no #[native_module(\"...\")] at the crate's root（0.1.0 缺失 \"platform\" 字段）。"
      - 改用 github:huacnlee/nsh-platform-harmonyos (0.1.1) 收录
    - - nsh-widgets (crates.io 0.4.1 / tag v0.4.1)
      - '报错：nsh-widgets: nsh.json: "nsh" requires nsh ^0.6; this is nsh 0.7.1。'
      - 改用 https://github.com/SuperNSH/widgets.git --rev master 收录
    - - github:honsunrise/nsh-ext (crates.io 0.6.0 / GitHub 0.7.0)
      - "0.7.1 报错：nsh-core requires nsh =0.7.0；crates.io 0.6.0 缺少 #[native_module]。"
      - 拒收（严格锁定 =0.7.0）
    - - 17 个 SuperNSH/* crate（如 nsh-biometrics/camera）与 nsh-platform-miniprogram@0.1.0
      - crates.io 归档仍锁定 nsh-core 0.6 / 0.6.0（仅靠规范化 [dependencies.nsh-core] 解析 quirk 绕过；github:SuperNSH/biometrics 报虚拟工作区错误）。
      - 暂缓至发布 0.7 版
    - - nsh-core 与其余 18 个官方框架 crate
      - "报错：no #[native_module(\"...\")] at the crate's root。"
      - 归入 /zh/framework/（非 nshm）
    - - nsh-native-deps、nsh-frameworks、nsh-maven、nsh-widgets-cli、nsh-firebase-*、nsh-http、nsh-auth、nsh-form、nsh-query (SuperNSH)、nsh-bluetooth、nsh-wake-lock、maplibre-nsh
      - '实测为普通 Rust Cargo 库或 CLI，不含 #[native_module] 或 nsh.json "exports"。'
      - 拒收（not-nshm）
    - - github:aningdev/shadcn-nsh、c-w-xiaohei/hero-nsh、yerlytech/a2ui-nsh、native-shell-with-ns
      - 报错：not an nshm（既无 nsh.json 也无 Cargo.toml，或 a2ui-nsh 为独立 TSX 应用无 "exports"）。
      - 拒收（非 nsh add 模块）
    - - github:SuperNSH/starter、huacnlee/spotish、ryujane/Ferrix
      - 应用脚手架或终端应用（publish = false 且 nsh.json 含 "root"/"id"），非可复用扩展库。
      - SuperNSH/starter 归入 /zh/templates/
    - - 40 个图标集子 crate（nsh-icon-*、supernsh-icons-*）及 3 个内部数据包
      - 分别为 nsh-icon（5 个）与 supernsh-icons（35 个）的配套子包与内部画廊数据 crate。
      - 统一收纳于对应父模块详情页
relatedLinks:
  - path: /zh/nshm/
    label: 浏览 13 个通过审核的 nshm 模块
    reason: 查看每个已收录模块的深入用法、平台矩阵与安装背景。
  - path: /zh/framework/
    label: 核对 19 个官方框架与平台后端 Crate
    reason: 了解为何 `nsh-core` 等内部 crate 应走 Cargo 或由 CLI 管理。
  - path: /zh/about/
    label: 查看维护者说明、测试边界与安全提示
    reason: 确认自动化验证覆盖到哪一步，以及构建脚本权限的合规检查要点。
---

直接审阅 `longbridge/nsh` 中的 `crates/nsh-cli/src/nshm/manifest.rs`（`Manifest::read`）、`crates/nsh-cli/src/rust_app.rs`（`specifier_of`）、官方 `nsh.dev/docs/nshm` 文档并在独立临时应用中执行 `nsh add` 后可以确认：**crates.io 上的 `keywords = ["nshm"]` 或 `nsh-` 命名前缀并不能让包具备安装资格**。

由于 `nsh 0.7.1` CLI 本身未内置包搜索或列出目录子命令（`nsh add` 仅支持显式 crate 名、`github:owner/repo`、Git URL 或 `--path`），Awesome NSH 的 `scripts/discover.mjs` 通过整合六条外部发现渠道，再结合清单静态分析与真实 `nsh add` 命令给出可复现结果。
