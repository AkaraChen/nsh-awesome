---
pageType: about
pageSlug: about
lang: zh
title: 关于 Awesome NSH：收录标准、验证边界与安全提示
description: 了解项目维护者 AkaraChen、nsh 0.7.1 临时应用实测范围、build.rs 与过程宏供应链安全警示，以及向目录提交模块的方式。
h1: 关于 Awesome NSH：维护者、验证范围边界与安全说明
lead: 透明说明由谁维护 Awesome NSH、目录数据如何通过自动化脚本发现与验证，以及“已通过 nsh 0.7.1 验证”具体涵盖与未涵盖哪些测试环节。
datePublished: 2026-11-26
updatedAt: 2026-11-27
whoHeading: 维护者信息（Who）
how:
  heading: 发现、校验与自动化构建流程（How）
  paragraphs:
    - 目录维护不靠手工拼凑信息，而是依靠 `scripts/` 脚本与 Astro 静态构建流水线：`discover.mjs` 扫描 6 条外部数据源、`lint.mjs` 核验字段格式、Content Collections 一致性与中英文结尾规范、`generate.mjs` 同步生成 `README.md` 与 `README.zh.md`、`npm run build` 编译静态网页与 `index.json` 等端点到 `dist/`、`seo-check.mjs` 执行 SEO/Schema/hreflang 回归门禁、`check-links.mjs` 探测在线链接状态，并由 `verify-install.mjs` 在干净临时应用中用真实 `nsh 0.7.1` CLI 执行每一条 `nsh add` 命令。
    - 每当 `nsh` 发布新版本时，重跑这套工具链即可第一时间发现旧版 tag 锁死或解析规则变动带来的安装断裂。
  pipelineScripts:
    - script: scripts/discover.mjs
      role: 横跨 6 条渠道扫描 crates.io（119 个）与 GitHub（89 个）并核对清单规则。
    - script: scripts/verify-install.mjs
      role: 在干净临时 `nsh.json` 目录执行 `nsh add ...`，检验依赖写入与 `nsh.lock` 生成。
    - script: scripts/lint.mjs
      role: 检查必填字段、中英文格式规范、标题层级与各生成文件条目数一致性。
    - script: scripts/check-links.mjs
      role: 批量校验 `sourceUrl`、`cratesUrl` 与 `homepage` 链接可访问性。
    - script: scripts/generate.mjs --check
      role: 确保手改 README 无法通过 CI，守住 `README.md` 与 `README.zh.md` 同 `data/entries.json` 的字节级一致。
    - script: scripts/seo-check.mjs
      role: 校验 `dist/` 构建产物中全部 HTML、JSON-LD、hreflang 闭环、sitemap 与 Agentic 发现端点。
why:
  heading: 项目创立初衷（Why）
  paragraphs:
    - "`nsh 0.7.1` 命令行专注于根据精确地址安装依赖，未内置 `nsh search` 功能；而在 crates.io 与 GitHub 盲搜又经常踩中不可 `nsh add` 的 19 个官方框架 crate、40 个重复图标子包、带 `#[native_module]` 的完整用户应用，以及利用 Cargo 规范化漏洞绕过检查的 `0.6` 旧包。"
    - Awesome NSH 希望为人类开发者与 AI 编程助手提供一份诚实、结构化且可直接复核源码出处的 `nsh 0.7.1` 生态导航。
criteria:
  heading: 纳入与拒收标准
  inclusion:
    - 必须在当前验证版本（`nsh 0.7.1`）的干净临时应用目录中通过 crates.io、`github:owner/repo` 或显式 Git URL 成功执行 `nsh add`。
    - 必须满足四种合法清单形态之一，且真实依赖 `nsh 0.7`（剔除仅靠 Cargo `[dependencies.nsh-core]` 规范化 quirk 绕过的 `0.6` 包）。
    - 19 个官方框架 crate、4 个应用脚手架与 7 篇官方文档分流到对应独立专栏，并加注醒目“非 nshm”警告，避免误导安装。
  exclusion:
    - 锁定 `nsh-core 0.6` / `0.6.0` 或严格锁定 `=0.7.0` 导致在 `0.7.1` 报错或仅靠 parser quirk 蒙混过关的包。
    - 不含 `#[native_module]` 与 `nsh.json` `"exports"` 的普通 Rust 工具 crate、独立 CLI，或标注 `publish = false` 与 `"root"`/`"id"` 的端到端应用。
    - 40 个图标集配套子 crate 与 3 个内部画廊数据包统一收纳到 `nsh-icon` 与 `supernsh-icons` 详情页中说明，不刷屏平铺。
verificationBoundary:
  heading: 诚实声明：验证范围与未测边界
  summary: 为避免让读者误以为本站担保全平台编译运行无误，特此明确列出“已测项”与“未测项”边界：
  verifiedItems:
    - 在 `nsh 0.7.1` 环境下新建只含 `nsh.json` 与 `App.tsx` 的空白目录，完整执行每条条目的 `installCommand`（`nsh add ...`）。
    - 检查 `nsh.json` `"dependencies"` 与 `nsh.lock` 是否如实记录目标包名、版本号与锁定的源码地址。
    - 逐一核查各模块上游 `Cargo.toml`、`nsh.json`、`src/lib.rs` 与 `README.md`，确保特性名称与平台限制忠实于源码。
  notVerifiedItems:
    - 未在 macOS、iOS、Android、Windows、Linux、Web 或鸿蒙目标环境上执行完整的 Rust/Swift/Kotlin/WASM/ArkUI 原生编译。
    - 未在真机硬件上运行界面渲染测试、手势验证或重跑性能压测（各详情页提及的测试或性能数字均明确标明来自上游仓自身报告）。
    - 未对第三方 crate、预编译二进制产物或 GitHub 提交历史逐行进行安全审计。
securityPolicy:
  heading: "`build.rs` 构建脚本、过程宏与供应链安全提示"
  body: 安装任意 Rust、混合型或平台型 `nshm` 模块，均意味着在本地编译阶段以当前用户完整权限执行其 `build.rs` 构建脚本与过程宏，并在运行时赋予模块同等于宿主应用的系统能力。模块还可通过 `[package.metadata.nsh]` 自动往应用注入 Apple `Info.plist` 隐私说明、macOS 沙盒 entitlements、Android 清单权限/`aar` 库及鸿蒙 `module.json5` 权限条目。交付前请务必审阅上游仓库与 `nsh.lock` 变动。
contributing:
  heading: 参与贡献、纠错与新模块提交流程
  body: 若你发布了新的 `nsh 0.7.1` 兼容模块、发现暂缓清单中的 `0.6` 包已升级，或需要修正平台兼容细节，欢迎前往 `github.com/AkaraChen/nsh-awesome` 修改 `data/entries.json`（及可选的 `src/content/` 双语 Markdown），在本地运行 `node scripts/generate.mjs`、`npm run build`、`node scripts/lint.mjs`、`node scripts/seo-check.mjs`、`npm test` 与 `node scripts/verify-install.mjs` 后提交 PR 或 Issue。
  contributingUrl: https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md
relatedLinks:
  - path: /zh/discovery/
    label: 查看完整发现方法论与拒收账本
    reason: 查阅 6 渠道实测数据、Cargo 0.6 parser quirk 与 11 类排除原因。
  - path: /zh/nshm/
    label: 浏览 13 个已验证可安装 nshm 模块
    reason: 按分类对比已通过 `nsh 0.7.1` 安装检测的模块。
  - path: /zh/
    label: 返回交互式 Awesome NSH 首页目录
    reason: 实时检索全部 43 条目或下载 `index.json`。
---

Awesome NSH（`github.com/AkaraChen/nsh-awesome`）由独立开发者 `AkaraChen` 维护，定位为 Native Shell（`nsh`）生态的社区精选清单、交互式网页目录与机器可读索引站点。站内信息核验自 `longbridge/nsh`、`longbridge/nsh-showcases`、crates.io 与各公开 GitHub 仓库，但不代表 `nsh.dev` 官方发布渠道。

全部双语页面、README 文档、`index.json` 与 `count.json` 均由 Astro 基于仓库内的单一事实源 `data/entries.json` 与 `src/content/` 双语 Markdown 内容集合确定性构建，每一次收录、剔除与版本更新均有公开 Git 提交记录可循。
