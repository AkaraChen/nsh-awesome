/**
 * Shared HTML layout shell, escaping helpers, breadcrumbs, and 404 renderer.
 *
 * Wires Phase 2 modules (`seo-assets.mjs`, `seo-sitemap.mjs`, `seo-schema.mjs`,
 * `seo-agentic.mjs`) cleanly with WCAG 2.2 AA landmarks, skip-links, and zero-FOUC theme init.
 */
import { renderHeadIconsAndManifest, renderSocialMeta } from './seo-assets.mjs';
import { renderHreflangTags } from './seo-sitemap.mjs';
import { renderJsonLdScript } from './seo-schema.mjs';
import { renderAgenticHeadLinks } from './seo-agentic.mjs';

const NAV_ITEMS = Object.freeze([
  Object.freeze({ key: 'nshm', slug: 'nshm', en: 'nshm', zh: 'nshm 模块' }),
  Object.freeze({ key: 'framework', slug: 'framework', en: 'Framework', zh: '框架 Crate' }),
  Object.freeze({ key: 'templates', slug: 'templates', en: 'Templates', zh: '示例模板' }),
  Object.freeze({ key: 'guides', slug: 'guides', en: 'Guides', zh: '指南文档' }),
  Object.freeze({ key: 'discovery', slug: 'discovery', en: 'Discovery', zh: '发现机制' }),
  Object.freeze({ key: 'about', slug: 'about', en: 'About', zh: '关于' }),
]);

const THEME_INIT_SCRIPT = `(function () {
  var params = new URLSearchParams(location.search);
  var qTheme = params.get('theme');
  var stored = null;
  try { stored = localStorage.getItem('nsh_awesome_theme'); } catch (e) {}
  var pref = (qTheme === 'light' || qTheme === 'dark')
    ? qTheme
    : (stored === 'light' || stored === 'dark' ? stored : 'system');
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var root = document.documentElement;
  function applyTheme() {
    var p = root.dataset.themePref;
    var dark = p === 'dark' || (p === 'system' && media.matches);
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
  }
  root.dataset.themePref = pref;
  applyTheme();
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', applyTheme);
  }
  window.__applyAwesomeTheme = applyTheme;
})();`;

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatInlineCode(text) {
  const raw = String(text ?? '');
  const parts = raw.split(/(`[^`]+`)/g);
  return parts
    .map((part) => {
      if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

export function renderBreadcrumbs(items, lang = 'en') {
  const navLabel = lang === 'zh' ? '面包屑导航' : 'Breadcrumb';
  const lis = items
    .map((item, idx) => {
      const isLast = idx === items.length - 1;
      if (isLast || !item.href) {
        return `<li class="breadcrumbs__item" aria-current="page"><span>${escapeHtml(item.label)}</span></li>`;
      }
      return `<li class="breadcrumbs__item"><a class="breadcrumbs__link" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
    })
    .join('');
  return `<nav class="breadcrumbs" aria-label="${escapeHtml(navLabel)}"><ol class="breadcrumbs__list">${lis}</ol></nav>`;
}

export function renderPageShell({
  lang = 'en',
  title,
  description,
  canonicalUrl,
  enUrl,
  zhUrl,
  altPath,
  mdUrl,
  socialType = 'website',
  publishedTime,
  modifiedTime,
  jsonLdGraph = null,
  activeNav = null,
  nshmCount = 13,
  nshVerifiedVersion = '0.7.1',
  siteUrl = 'https://nsh-awesome.vercel.app/',
  bodyHtml,
  noindex = false,
}) {
  const isZh = lang === 'zh';
  const htmlLang = isZh ? 'zh-Hans' : 'en';
  const homeHref = isZh ? '/zh/' : '/';
  const langPrefix = isZh ? '/zh/' : '/';
  const skipText = isZh ? '跳至主要内容' : 'Skip to main content';
  const navLabel = isZh ? '主导航' : 'Primary';
  const footerNavLabel = isZh ? '页脚导航' : 'Footer';
  const langSwitchLabel = isZh ? 'English' : '中文';
  const langSwitchAttr = isZh ? 'en' : 'zh-Hans';
  const themeBtnLabel = isZh ? '浅色模式' : 'Light mode';

  const headSeoTags = noindex
    ? '<meta name="robots" content="noindex">'
    : [
        renderHreflangTags({ enUrl, zhUrl, canonicalUrl }),
        renderSocialMeta({
          title,
          description,
          canonicalUrl,
          lang: htmlLang,
          type: socialType,
          publishedTime,
          modifiedTime,
        }),
        renderAgenticHeadLinks({ siteUrl, markdownUrl: mdUrl }),
        jsonLdGraph ? renderJsonLdScript(jsonLdGraph) : '',
      ]
        .filter(Boolean)
        .join('\n  ');

  const navLinks = NAV_ITEMS.map((item) => {
    const href = `${langPrefix}${item.slug}/`;
    const isCurrent = activeNav === item.key;
    const currentAttr = isCurrent ? ' aria-current="page"' : '';
    const cls = isCurrent ? 'nav__link is-current' : 'nav__link';
    return `<a class="${cls}" href="${href}"${currentAttr}>${escapeHtml(isZh ? item.zh : item.en)}</a>`;
  }).join('\n        ');

  const langSwitchEl = altPath
    ? `<a class="ctrl-btn" id="lang-toggle" href="${escapeHtml(altPath)}" hreflang="${langSwitchAttr}" lang="${langSwitchAttr}">${langSwitchLabel}</a>`
    : `<a class="ctrl-btn" id="lang-toggle" href="${isZh ? '/' : '/zh/'}" hreflang="${langSwitchAttr}" lang="${langSwitchAttr}">${langSwitchLabel}</a>`;

  const footerNote = isZh
    ? `由单一数据源 <code>data/entries.json</code> 与 <code>data/seo-content.json</code> 生成 · 实测基准：<code>nsh ${escapeHtml(nshVerifiedVersion)}</code>。`
    : `Generated from <code>data/entries.json</code> &amp; <code>data/seo-content.json</code> · Verified on <code>nsh ${escapeHtml(nshVerifiedVersion)}</code>.`;

  return `<!doctype html>
<html lang="${htmlLang}" class="dark" data-theme-pref="system">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="#0e1016" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  ${renderHeadIconsAndManifest('/')}
  ${headSeoTags}
  <script>${THEME_INIT_SCRIPT}</script>
  <link rel="stylesheet" href="/assets/app.css">
  <script src="/assets/app.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main-content">${escapeHtml(skipText)}</a>
  <header class="site-header">
    <div class="container nav__inner">
      <a class="brand" href="${homeHref}">
        <svg width="24" height="24" viewBox="14 12 100 100" aria-hidden="true" focusable="false">
          <path d="M30 100 V58 a34 34 0 0 1 68 0 V100" fill="none" stroke="#55800c" stroke-width="20" stroke-linecap="round"/>
          <path d="M30 100 V58 a34 34 0 0 1 68 0 V100" fill="none" stroke="#a9d63f" stroke-width="14" stroke-linecap="round"/>
          <circle cx="64" cy="76" r="10" fill="#f3f5f8"/>
        </svg>
        <span>Awesome NSH</span>
        <span class="brand__tag">${nshmCount} nshm</span>
      </a>
      <nav class="nav__actions" aria-label="${escapeHtml(navLabel)}">
        ${navLinks}
        <a class="nav__link" href="/index.json">index.json</a>
        ${langSwitchEl}
        <button type="button" class="ctrl-btn" id="theme-toggle"><svg class="theme-icon theme-icon--sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><svg class="theme-icon theme-icon--moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg><span data-theme-label>${escapeHtml(themeBtnLabel)}</span></button>
      </nav>
    </div>
  </header>

  <main id="main-content" tabindex="-1">
    ${bodyHtml}
  </main>

  <footer class="site-footer">
    <div class="container footer__inner">
      <p>${footerNote}</p>
      <nav class="footer__links" aria-label="${escapeHtml(footerNavLabel)}">
        <a href="/index.json">index.json</a>
        <a href="/count.json">count.json</a>
        <a href="/badge.svg">badge.svg</a>
        <a href="/llms.txt">llms.txt</a>
        <a href="/sitemap.xml">sitemap.xml</a>
        <a href="/.well-known/ai-catalog.json">ai-catalog.json</a>
        <a href="https://nsh.dev" target="_blank" rel="noopener">nsh.dev</a>
        <a href="https://github.com/AkaraChen/nsh-awesome" target="_blank" rel="noopener">GitHub</a>
      </nav>
      <div id="live-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    </div>
  </footer>
</body>
</html>
`;
}

export function render404Page({ data }) {
  const nshmCount = (data?.entries || []).filter((e) => e.installable).length;
  const bodyHtml = `<section class="hero">
    <div class="container hero__copy">
      <h1>404 · Page Not Found</h1>
      <p class="hero__desc">The requested page does not exist on Awesome NSH. Use the directory links below to browse verified <code>nshm</code> modules, framework crates, or discovery documentation.</p>
    </div>
  </section>
  <div class="container page-body">
    <section class="content-band">
      <h2>Directory Navigation</h2>
      <div class="pill-links">
        <a class="pill-link" href="/">English Home Directory</a>
        <a class="pill-link" href="/zh/">中文目录首页</a>
        <a class="pill-link" href="/nshm/">Installable nshm (${nshmCount})</a>
        <a class="pill-link" href="/framework/">Framework Crates</a>
        <a class="pill-link" href="/templates/">Templates &amp; Examples</a>
        <a class="pill-link" href="/guides/">Guides &amp; Docs</a>
        <a class="pill-link" href="/discovery/">Discovery Methodology</a>
        <a class="pill-link" href="/about/">About &amp; Criteria</a>
        <a class="pill-link" href="/index.json">index.json</a>
      </div>
    </section>
  </div>`;

  return renderPageShell({
    lang: 'en',
    title: '404 · Page Not Found · Awesome NSH',
    description: 'The requested page could not be found in the Awesome NSH static directory.',
    nshmCount,
    nshVerifiedVersion: data?.nshVerifiedVersion || '0.7.1',
    siteUrl: data?.siteUrl || 'https://nsh-awesome.vercel.app/',
    altPath: '/zh/',
    noindex: true,
    bodyHtml,
  });
}
