# 关于 Awesome NSH 与收录标准

> 独立维护的 Native Shell 生态开源目录，单一数据源 `data/entries.json` 驱动全部页面与机器可读索引（最近更新 2026-11-26）。

HTML 页面：[https://nsh-awesome.vercel.app/zh/about/](https://nsh-awesome.vercel.app/zh/about/) · [English Markdown](https://nsh-awesome.vercel.app/about.md) · [发现机制报告](https://nsh-awesome.vercel.app/zh/discovery.md)

## 维护者与项目定位（Who & Why）

本项目由 [AkaraChen](https://github.com/AkaraChen) 维护并基于 MIT 许可证开源（仓库：[AkaraChen/nsh-awesome](https://github.com/AkaraChen/nsh-awesome)）。因 `nsh` CLI 尚无内置包搜索命令，社区难以及时分辨哪些 crate 真正支持 `nsh add`、哪些属于框架内部 crate 或仍停留在旧版本 `0.6`，因此构建了这份经过实测验证的人工 + 自动双语目录与 `index.json` 接口。

## 验证流程与诚实边界（How & Verification Scope）

- **实测基线：** 全量 43 个条目由 `data/entries.json` 统一生成，`scripts/verify-install.mjs` 在隔离临时项目中针对 `nsh 0.7.1` 实测每一个可安装条目的 `nsh add` 命令（当前通过 **13** 个）。
- **诚实边界声明：** 通过验证仅代表包满足 `nsh 0.7.1` 清单规范并可成功执行 `nsh add` 依赖解析，**不声明**已在 iOS、Android、macOS、Windows、Linux、HarmonyOS 或 Web 真机环境完成全量编译与运行时测试。
- **禁止编造：** 所有平台列表、版本号、许可证与限制说明均直接核对上游仓库、Cargo.toml、nsh.json 与 `docs/DISCOVERY.md`。

## 参与贡献与自动化门禁

欢迎通过编辑 `data/entries.json` 并运行 `node scripts/generate.mjs` 提交 Pull Request。CI 会自动运行 schema lint（`scripts/lint.mjs`）、生成物一致性检查（`scripts/generate.mjs --check`）、全量链接可用性校验（`scripts/check-links.mjs`）与 SEO 门禁。详情见 [https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md](https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md)。
