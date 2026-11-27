import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from 'astro:i18n';

export type Locale = 'en' | 'zh';

export const NAV_ITEMS = [
  { key: 'nshm', slug: 'nshm', en: 'nshm', zh: 'nshm 模块' },
  { key: 'framework', slug: 'framework', en: 'Framework', zh: '框架 Crate' },
  { key: 'templates', slug: 'templates', en: 'Templates', zh: '示例模板' },
  { key: 'guides', slug: 'guides', en: 'Guides', zh: '指南文档' },
  { key: 'discovery', slug: 'discovery', en: 'Discovery', zh: '发现机制' },
  { key: 'about', slug: 'about', en: 'About', zh: '关于' },
] as const;

export function toHtmlLang(lang: Locale): 'en' | 'zh-Hans' {
  return lang === 'zh' ? 'zh-Hans' : 'en';
}

export function getLocalePath(lang: Locale, subPath = ''): string {
  const clean = subPath.replace(/^\/+|\/+$/g, '');
  const rel = getRelativeLocaleUrl(lang, clean);
  return rel.endsWith('/') ? rel : `${rel}/`;
}

export function getLocaleAbsUrl(lang: Locale, subPath = ''): string {
  const clean = subPath.replace(/^\/+|\/+$/g, '');
  const abs = getAbsoluteLocaleUrl(lang, clean);
  return abs.endsWith('/') ? abs : `${abs}/`;
}

export function getMdPath(lang: Locale, routeSlug: string): string {
  const prefix = lang === 'zh' ? '/zh' : '';
  if (routeSlug === 'home' || routeSlug === '') {
    return `${prefix}/index.md`;
  }
  const clean = routeSlug.replace(/^\/+|\/+$/g, '');
  return `${prefix}/${clean}.md`;
}

export const UI = {
  en: {
    skipToMain: 'Skip to main content',
    primaryNav: 'Primary',
    footerNav: 'Footer',
    breadcrumb: 'Breadcrumb',
    homeLabel: 'Home',
    nshmHubLabel: 'Installable nshm',
    langSwitchLabel: '中文',
    langSwitchAttr: 'zh-Hans',
    themeLightLabel: 'Light mode',
    copy: 'Copy',
    notNshm: 'NOT nshm',
    details: 'Details',
    source: 'Source',
    docs: 'Docs',
    docsDemo: 'Docs / Demo',
    sourceRepo: 'Source Repository',
    markdown: 'Markdown',
    markdownEdition: 'Markdown Edition',
    backHome: 'Back to Home Directory',
    marketIndexUrl: 'Market index URL:',
    installCommandLabel: 'Install command:',
    installableStat: 'installable nshm',
    frameworkStat: 'framework crates',
    templatesStat: 'examples & templates',
    guidesStat: 'guides',
    verifiedOnPrefix: 'verified on nsh',
    fullDirectoryHeading: (n: number) => `Full Curated Directory (${n} Entries)`,
    showingSummary: (visible: number, total: number) => `Showing ${visible} of ${total} entries`,
    clearFilters: 'Clear filters',
    emptyState: 'No entries match the current search or filters.',
    searchFormLabel: 'Search and filter directory',
    searchInputLabel: 'Search catalog by module name, crate, platform, or license',
    searchPlaceholder: 'Search nshm, crate, platform, license...',
    sourceFilterLabel: 'Filter by distribution source',
    allSources: 'All sources',
    gitUrl: 'Git URL',
    webDocs: 'Web / Docs',
    filterSubmit: 'Filter',
    filterBySection: 'Filter by section',
    filterByCategory: 'Filter by category',
    allChip: 'All',
    allCategoriesChip: 'All categories',
    toolDescription:
      'Filter the Awesome NSH catalog of installable nshm modules, framework crates, templates, and guides by keyword and distribution source.',
    queryParamDesc:
      'Keyword matching module name, ID, description, platform, license, or install command.',
    sourceParamDesc:
      'Filter catalog entries by distribution source: all, crates.io, github, git, or web.',
    sectionOverview: 'Section Overview',
    relatedHubs: 'Related Directory Hubs & Guides',
    moduleFacts: 'Module Facts',
    factCategory: 'Category',
    factKind: 'Kind',
    factSourceType: 'Source Type',
    factVersion: 'Version',
    factNshTarget: 'NSH Target',
    factLicense: 'License',
    factUpdated: 'Updated',
    factPlatforms: 'Platforms',
    platformHeaders: ['Platform', 'Status', 'Technical Notes'],
    relatedModulesHeading: 'Related nshm Modules',
    parentHubsHeading: 'Parent Hubs & Cross-Links',
    methodologyOverview: 'Methodology Overview',
    rawDiscovery: 'Raw docs/DISCOVERY.md',
    relatedCatalogSections: 'Related Catalog Sections',
    pipelineHeaders: ['Pipeline Script', 'Role'] as [string, string],
    inclusionCriteria: 'Inclusion Criteria',
    exclusionRules: 'Exclusion & Grouping Rules',
    verifiedScope: 'What IS Verified',
    notClaimedScope: 'What Is NOT Claimed',
    readContributing: 'Read CONTRIBUTING.md',
    relatedDirectoryMethodology: 'Related Directory & Methodology',
    discoveryBreadcrumb: 'Discovery Methodology',
    aboutBreadcrumb: 'About & Criteria',
    notFoundTitle: '404 · Page Not Found · Awesome NSH',
    notFoundDesc: 'The requested page could not be found in the Awesome NSH static directory.',
    notFoundH1: '404 · Page Not Found',
    notFoundLeadPrefix:
      'The requested page does not exist on Awesome NSH. Use the directory links below to browse verified ',
    notFoundLeadMiddle: ' modules, framework crates, or discovery documentation.',
    notFoundHeading: 'Directory Navigation',
  },
  zh: {
    skipToMain: '跳至主要内容',
    primaryNav: '主导航',
    footerNav: '页脚导航',
    breadcrumb: '面包屑导航',
    homeLabel: '首页',
    nshmHubLabel: '可安装 nshm',
    langSwitchLabel: 'English',
    langSwitchAttr: 'en',
    themeLightLabel: '浅色模式',
    copy: '复制',
    notNshm: '非 nshm',
    details: '详情',
    source: '源码',
    docs: '文档',
    docsDemo: '文档 / 演示',
    sourceRepo: '源码仓库',
    markdown: 'Markdown 版本',
    markdownEdition: 'Markdown 版本',
    backHome: '返回目录首页',
    marketIndexUrl: '索引 JSON 地址：',
    installCommandLabel: '安装命令：',
    installableStat: '个可安装 nshm',
    frameworkStat: '个框架 Crate',
    templatesStat: '个示例模板',
    guidesStat: '篇文档教程',
    verifiedOnPrefix: '实测兼容 nsh',
    fullDirectoryHeading: (n: number) => `全量目录（${n} 条资源）`,
    showingSummary: (visible: number, total: number) => `当前展示 ${visible} / ${total} 个条目`,
    clearFilters: '重置筛选',
    emptyState: '没有符合当前搜索或筛选条件的条目。',
    searchFormLabel: '搜索并筛选目录',
    searchInputLabel: '按关键词搜索模块、Crate、平台或许可证',
    searchPlaceholder: '搜索 nshm、crate、平台、许可证...',
    sourceFilterLabel: '按安装来源筛选',
    allSources: '全部来源',
    gitUrl: 'Git URL',
    webDocs: '网页 / 文档',
    filterSubmit: '筛选',
    filterBySection: '按板块筛选',
    filterByCategory: '按分类筛选',
    allChip: '全部',
    allCategoriesChip: '全部分类',
    toolDescription:
      '按关键词和分发来源筛选 Awesome NSH 收录的可安装 nshm 模块、框架 crate、模板与文档。',
    queryParamDesc: '用于匹配模块名称、ID、描述、支持平台、许可证或安装命令的关键词。',
    sourceParamDesc: '按分发来源筛选条目：all、crates.io、github、git 或 web。',
    sectionOverview: '板块概述',
    relatedHubs: '延伸阅读与关联板块',
    moduleFacts: '模块档案',
    factCategory: '分类',
    factKind: '模块形态',
    factSourceType: '安装来源',
    factVersion: '版本',
    factNshTarget: '兼容 NSH',
    factLicense: '许可证',
    factUpdated: '最近核验',
    factPlatforms: '声明平台',
    platformHeaders: ['平台', '支持状态', '技术备注'],
    relatedModulesHeading: '同分类及关联 nshm 模块',
    parentHubsHeading: '返回专题与关联目录',
    methodologyOverview: '调研背景与源码依据',
    rawDiscovery: 'GitHub 原始 DISCOVERY.md',
    relatedCatalogSections: '关联目录与标准说明',
    pipelineHeaders: ['自动化脚本', '职责'] as [string, string],
    inclusionCriteria: '准入条件',
    exclusionRules: '拒收与合并条件',
    verifiedScope: '已实测验证范围',
    notClaimedScope: '未声称范围',
    readContributing: '阅读 CONTRIBUTING.md',
    relatedDirectoryMethodology: '关联目录与方法论',
    discoveryBreadcrumb: '发现机制',
    aboutBreadcrumb: '关于与标准',
    notFoundTitle: '404 · Page Not Found · Awesome NSH',
    notFoundDesc: 'The requested page could not be found in the Awesome NSH static directory.',
    notFoundH1: '404 · Page Not Found',
    notFoundLeadPrefix:
      'The requested page does not exist on Awesome NSH. Use the directory links below to browse verified ',
    notFoundLeadMiddle: ' modules, framework crates, or discovery documentation.',
    notFoundHeading: 'Directory Navigation',
  },
} as const;
