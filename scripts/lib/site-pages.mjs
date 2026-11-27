/**
 * Bilingual SSR page body renderers for Home, Section Hubs, Module Details,
 * Discovery Methodology, and About pages.
 *
 * Consumes `data/entries.json`, `data/seo-content.json`, and `seo-schema.mjs`.
 */
import {
  buildHomeSchema,
  buildSectionSchema,
  buildModuleSchema,
  buildArticleSchema,
} from './seo-schema.mjs';
import { escapeHtml, formatInlineCode, renderBreadcrumbs, renderPageShell } from './site-layout.mjs';
import {
  renderCallout,
  renderDataTable,
  renderEntryCard,
  renderHomeSearchControls,
  renderRelatedLinks,
} from './site-components.mjs';

function buildInstallableLinkMap(data, lang) {
  const prefix = lang === 'zh' ? '/zh' : '';
  const map = new Map();
  for (const e of data?.entries || []) {
    if (e.installable) {
      map.set(e.name, `${prefix}/nshm/${e.id}/`);
    }
  }
  return map;
}

const SECTION_SLUG_FOR_ID = Object.freeze({
  nshm: 'nshm',
  framework: 'framework',
  templates: 'templates',
  articles: 'guides',
});

export function renderHomePage({ route, data, seoContent }) {
  const lang = route.lang;
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const home = seoContent?.home?.[lang] || {};
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const installableCount = entries.filter((e) => e.installable).length;
  const frameworkCount = entries.filter((e) => e.section === 'framework').length;
  const templateCount = entries.filter((e) => e.section === 'templates').length;
  const articleCount = entries.filter((e) => e.section === 'articles').length;
  const siteUrl = data?.siteUrl || 'https://nsh-awesome.vercel.app/';
  const indexUrl = `${siteUrl}index.json`;

  const statsHtml = [
    `<span class="stat-pill stat-pill--accent">${installableCount} ${isZh ? '个可安装 nshm' : 'installable nshm'}</span>`,
    `<span class="stat-pill">${frameworkCount} ${isZh ? '个框架 Crate' : 'framework crates'}</span>`,
    `<span class="stat-pill">${templateCount} ${isZh ? '个示例模板' : 'examples & templates'}</span>`,
    `<span class="stat-pill">${articleCount} ${isZh ? '篇文档教程' : 'guides'}</span>`,
    `<span class="stat-pill">${isZh ? `实测兼容 nsh ${escapeHtml(data.nshVerifiedVersion)}` : `verified on nsh ${escapeHtml(data.nshVerifiedVersion)}`}</span>`,
  ].join('\n        ');

  const catalogSectionsHtml = sections
    .map((sec) => {
      const secEntries = entries.filter((e) => e.section === sec.id);
      if (secEntries.length === 0) return '';
      const hubSlug = SECTION_SLUG_FOR_ID[sec.id] || sec.id;
      const hubHref = `${langPrefix}/${hubSlug}/`;
      const noteCls = sec.id === 'framework' ? 'section-note section-note--warn' : 'section-note';
      return `<section class="section-block" id="sec-${escapeHtml(sec.id)}">
  <div class="section-head">
    <h2><a class="section-head__link" href="${escapeHtml(hubHref)}">${escapeHtml(sec.title[lang])}</a></h2>
    <span class="section-count">${secEntries.length}</span>
  </div>
  <p class="${noteCls}">${formatInlineCode(sec.description[lang])}</p>
  <div class="grid">
    ${secEntries.map((entry) => renderEntryCard(entry, lang)).join('\n    ')}
  </div>
</section>`;
    })
    .join('\n');

  const installSourcesHtml = home.installSourcesTable
    ? renderDataTable({
        heading: home.installSourcesTable.heading,
        intro: home.installSourcesTable.intro,
        columns: home.installSourcesTable.columns,
        rows: home.installSourcesTable.rows,
      })
    : '';

  const metricsHtml = home.ecosystemStats
    ? `<section class="content-band">
  <h2>${escapeHtml(home.ecosystemStats.heading)}</h2>
  <p>${formatInlineCode(home.ecosystemStats.summary)}</p>
  <dl class="metrics-grid">
    ${(home.ecosystemStats.metrics || [])
      .map(
        (m) => `<div class="subcard">
      <dt class="fact-item__dt"><strong>${escapeHtml(m.label)}</strong></dt>
      <dd class="metric-value">${escapeHtml(m.value)}</dd>
      <dd class="card__desc">${formatInlineCode(m.detail)}</dd>
    </div>`,
      )
      .join('\n    ')}
  </dl>
</section>`
    : '';

  const navHighlightsHtml = home.navigationHighlights
    ? renderRelatedLinks(home.navigationHighlights.items, home.navigationHighlights.heading, 2)
    : '';

  const faqsHtml = home.faqs
    ? `<section class="content-band">
  <h2>${escapeHtml(home.faqs.heading)}</h2>
  <div class="faq-list">
    ${(home.faqs.items || [])
      .map(
        (item) => `<article class="faq-item">
      <h3>${formatInlineCode(item.question)}</h3>
      <p>${formatInlineCode(item.answer)}</p>
    </article>`,
      )
      .join('\n    ')}
  </div>
</section>`
    : '';

  const bodyHtml = `<section class="hero">
    <div class="container hero__copy">
      <h1>${escapeHtml(home.h1 || (isZh ? 'Awesome Native Shell 模块精选' : 'Awesome Native Shell Modules'))}</h1>
      <p class="hero__desc">${formatInlineCode(home.lead || data.description[lang])}</p>
      <div class="hero__stats">${statsHtml}</div>
      <div class="endpoint-box">
        <span class="endpoint-box__label">${isZh ? '索引 JSON 地址：' : 'Market index URL:'}</span>
        <span class="endpoint-box__url">${escapeHtml(indexUrl)}</span>
        <button type="button" class="copy-btn" data-copy="${escapeHtml(indexUrl)}" id="copy-index-btn"><span data-copy-label>${isZh ? '复制' : 'Copy'}</span><span class="sr-only"> — ${escapeHtml(indexUrl)}</span></button>
      </div>
    </div>
  </section>

  <div class="container page-body">
    ${
      home.definitionBlock
        ? `<section class="content-band">
      <h2>${escapeHtml(home.definitionBlock.heading)}</h2>
      <p>${formatInlineCode(home.definitionBlock.body)}</p>
    </section>`
        : ''
    }
    ${installSourcesHtml}
    ${navHighlightsHtml}
    <section class="content-band" id="directory-catalog">
      <h2>${isZh ? `全量目录（${entries.length} 条资源）` : `Full Curated Directory (${entries.length} Entries)`}</h2>
      ${renderHomeSearchControls({ data, lang })}
      <div class="results-meta">
        <span id="results-summary" aria-live="polite">${isZh ? `当前展示 ${entries.length} / ${entries.length} 个条目` : `Showing ${entries.length} of ${entries.length} entries`}</span>
        <button type="button" class="ctrl-btn" id="clear-filters" hidden>${isZh ? '重置筛选' : 'Clear filters'}</button>
      </div>
      <div class="empty-state" id="empty-state" hidden>${isZh ? '没有符合当前搜索或筛选条件的条目。' : 'No entries match the current search or filters.'}</div>
      <div id="catalog-root">
        ${catalogSectionsHtml}
      </div>
    </section>
    ${metricsHtml}
    ${
      home.securityNotice
        ? renderCallout({
            heading: home.securityNotice.heading,
            body: home.securityNotice.body,
            variant: 'warn',
          })
        : ''
    }
    ${faqsHtml}
  </div>`;

  const jsonLdGraph = buildHomeSchema({
    siteUrl,
    lang,
    data,
    pageUrl: route.url,
    title: route.title,
    description: route.description,
    updatedAt: route.lastmod,
  });

  return renderPageShell({
    lang,
    title: route.title,
    description: route.description,
    canonicalUrl: route.url,
    enUrl: route.enUrl,
    zhUrl: route.zhUrl,
    altPath: route.altPath,
    mdUrl: route.mdUrl,
    socialType: 'website',
    modifiedTime: route.lastmod,
    jsonLdGraph,
    activeNav: 'home',
    nshmCount: installableCount,
    nshVerifiedVersion: data.nshVerifiedVersion,
    siteUrl,
    bodyHtml,
  });
}

export function renderSectionPage({ route, data, seoContent }) {
  const lang = route.lang;
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const slug = route.slug;
  const secSeo = seoContent?.sections?.[slug]?.[lang] || {};
  const secMeta = (data?.sections || []).find((s) => s.id === route.entriesSection);
  const secEntries = (data?.entries || []).filter((e) => e.section === route.entriesSection);
  const categories = (data?.categories || []).filter(
    (c) => c.section === route.entriesSection && secEntries.some((e) => e.category === c.id),
  );
  const linkMap = buildInstallableLinkMap(data, lang);
  const installableCount = (data?.entries || []).filter((e) => e.installable).length;
  const siteUrl = data?.siteUrl || 'https://nsh-awesome.vercel.app/';

  const breadcrumbs = renderBreadcrumbs(
    [
      { label: isZh ? '首页' : 'Home', href: `${langPrefix}/` },
      { label: secMeta?.title?.[lang] || slug },
    ],
    lang,
  );

  const categoryBlocks = categories
    .map((cat) => {
      const items = secEntries.filter((e) => e.category === cat.id);
      return `<section class="section-block" id="cat-${escapeHtml(cat.id)}">
  <div class="section-head">
    <h2>${escapeHtml(cat.title[lang])}</h2>
    <span class="section-count">${items.length}</span>
  </div>
  <div class="grid">
    ${items.map((e) => renderEntryCard(e, lang)).join('\n    ')}
  </div>
</section>`;
    })
    .join('\n');

  const adviceHtml = secSeo.selectionAdvice
    ? `<section class="content-band">
  <h2>${escapeHtml(secSeo.selectionAdvice.heading)}</h2>
  <div class="two-col">
    ${(secSeo.selectionAdvice.items || [])
      .map(
        (item) => `<article class="subcard">
      <h3 class="card__title">${formatInlineCode(item.title)}</h3>
      <p class="card__desc">${formatInlineCode(item.body)}</p>
    </article>`,
      )
      .join('\n    ')}
  </div>
</section>`
    : '';

  const bodyHtml = `<section class="hero hero--compact">
    <div class="container hero__copy">
      ${breadcrumbs}
      <h1>${escapeHtml(secSeo.h1 || secMeta?.title?.[lang] || slug)}</h1>
      <p class="hero__desc">${formatInlineCode(secSeo.lead || secMeta?.description?.[lang] || '')}</p>
      <div class="action-row">
        <a class="pill-link" href="${escapeHtml(route.mdPath)}">${isZh ? 'Markdown 版本' : 'Markdown Edition'}</a>
        <a class="pill-link" href="${langPrefix}/">${isZh ? '返回目录首页' : 'Back to Home Directory'}</a>
      </div>
    </div>
  </section>

  <div class="container page-body">
    ${
      Array.isArray(secSeo.intro) && secSeo.intro.length
        ? `<section class="content-band">
      <h2>${isZh ? '板块概述' : 'Section Overview'}</h2>
      ${secSeo.intro.map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
    </section>`
        : ''
    }
    ${
      secSeo.technicalCallout
        ? renderCallout({
            heading: secSeo.technicalCallout.heading,
            body: secSeo.technicalCallout.body,
            variant: slug === 'framework' ? 'warn' : 'info',
          })
        : ''
    }
    ${
      secSeo.comparisonTable
        ? renderDataTable({
            heading: secSeo.comparisonTable.heading,
            intro: secSeo.comparisonTable.intro,
            columns: secSeo.comparisonTable.columns,
            rows: secSeo.comparisonTable.rows,
            linkModuleMap: slug === 'nshm' ? linkMap : null,
          })
        : ''
    }
    ${categoryBlocks}
    ${adviceHtml}
    ${renderRelatedLinks(secSeo.relatedLinks, isZh ? '延伸阅读与关联板块' : 'Related Directory Hubs & Guides')}
  </div>`;

  const jsonLdGraph = buildSectionSchema({
    siteUrl,
    lang,
    section: secMeta || route.entriesSection,
    entries: secEntries,
    pageUrl: route.url,
    title: route.title,
    description: route.description,
    updatedAt: route.lastmod,
  });

  return renderPageShell({
    lang,
    title: route.title,
    description: route.description,
    canonicalUrl: route.url,
    enUrl: route.enUrl,
    zhUrl: route.zhUrl,
    altPath: route.altPath,
    mdUrl: route.mdUrl,
    socialType: 'website',
    modifiedTime: route.lastmod,
    jsonLdGraph,
    activeNav: slug,
    nshmCount: installableCount,
    nshVerifiedVersion: data.nshVerifiedVersion,
    siteUrl,
    bodyHtml,
  });
}

export function renderModulePage({ route, data, seoContent }) {
  const lang = route.lang;
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const entry = route.entry;
  const modSeo = seoContent?.modules?.[entry.id]?.[lang] || {};
  const catMeta = (data?.categories || []).find((c) => c.id === entry.category);
  const installableCount = (data?.entries || []).filter((e) => e.installable).length;
  const siteUrl = data?.siteUrl || 'https://nsh-awesome.vercel.app/';

  const breadcrumbs = renderBreadcrumbs(
    [
      { label: isZh ? '首页' : 'Home', href: `${langPrefix}/` },
      { label: isZh ? '可安装 nshm' : 'Installable nshm', href: `${langPrefix}/nshm/` },
      { label: entry.name },
    ],
    lang,
  );

  const externalButtons = [
    `<a class="pill-link" href="${escapeHtml(entry.sourceUrl)}" target="_blank" rel="noopener">${isZh ? '源码仓库' : 'Source Repository'}</a>`,
  ];
  if (entry.cratesUrl && entry.cratesUrl !== entry.sourceUrl) {
    externalButtons.push(
      `<a class="pill-link" href="${escapeHtml(entry.cratesUrl)}" target="_blank" rel="noopener">crates.io</a>`,
    );
  }
  if (entry.homepage && entry.homepage !== entry.sourceUrl) {
    externalButtons.push(
      `<a class="pill-link" href="${escapeHtml(entry.homepage)}" target="_blank" rel="noopener">${isZh ? '文档 / 演示' : 'Docs / Demo'}</a>`,
    );
  }
  externalButtons.push(
    `<a class="pill-link" href="${escapeHtml(route.mdPath)}">${isZh ? 'Markdown 版本' : 'Markdown'}</a>`,
  );

  const factsHtml = `<section class="content-band">
  <h2>${isZh ? '模块档案' : 'Module Facts'}</h2>
  <dl class="facts-grid">
    <div class="fact-item"><dt>${isZh ? '分类' : 'Category'}</dt><dd>${escapeHtml(catMeta?.title?.[lang] || entry.category)}</dd></div>
    <div class="fact-item"><dt>${isZh ? '模块形态' : 'Kind'}</dt><dd><code>${escapeHtml(entry.kind)}</code></dd></div>
    <div class="fact-item"><dt>${isZh ? '安装来源' : 'Source Type'}</dt><dd><code>${escapeHtml(entry.sourceType)}</code></dd></div>
    <div class="fact-item"><dt>${isZh ? '版本' : 'Version'}</dt><dd><code>${escapeHtml(entry.version || 'N/A')}</code></dd></div>
    <div class="fact-item"><dt>${isZh ? '兼容 NSH' : 'NSH Target'}</dt><dd><code>${escapeHtml(entry.nshVersion || data.nshVerifiedVersion)}</code></dd></div>
    <div class="fact-item"><dt>${isZh ? '许可证' : 'License'}</dt><dd>${escapeHtml(entry.license)}</dd></div>
    <div class="fact-item"><dt>${isZh ? '最近核验' : 'Updated'}</dt><dd>${escapeHtml(entry.updatedAt)}</dd></div>
    <div class="fact-item"><dt>${isZh ? '声明平台' : 'Platforms'}</dt><dd>${escapeHtml((entry.platforms || []).join(isZh ? '、' : ', '))}</dd></div>
  </dl>
</section>`;

  const platformMatrix = modSeo.platformSupport
    ? renderDataTable({
        heading: modSeo.platformSupport.heading,
        intro: modSeo.platformSupport.overview,
        columns: isZh ? ['平台', '支持状态', '技术备注'] : ['Platform', 'Status', 'Technical Notes'],
        rows: (modSeo.platformSupport.matrix || []).map((m) => [m.platform, m.status, m.notes]),
      })
    : '';

  const companionsHtml = modSeo.companionsOrFeatures
    ? `<section class="content-band">
  <h2>${escapeHtml(modSeo.companionsOrFeatures.heading)}</h2>
  <p>${formatInlineCode(modSeo.companionsOrFeatures.summary)}</p>
  <ul class="prose-list">
    ${(modSeo.companionsOrFeatures.items || [])
      .map((item) => `<li><strong>${formatInlineCode(item.name)}:</strong> ${formatInlineCode(item.detail)}</li>`)
      .join('\n    ')}
  </ul>
</section>`
    : '';

  const relatedItems = Array.isArray(modSeo.relatedModules)
    ? modSeo.relatedModules.map((m) => ({
        path: m.path,
        label: m.name,
        reason: m.reason,
      }))
    : (data?.entries || [])
        .filter((e) => e.installable && e.id !== entry.id)
        .slice(0, 3)
        .map((e) => ({
          path: `${langPrefix}/nshm/${e.id}/`,
          label: e.name,
          reason: e.description[lang],
        }));

  const parentLinksHtml =
    Array.isArray(modSeo.parentLinks) && modSeo.parentLinks.length
      ? `<section class="content-band">
  <h2>${isZh ? '返回专题与关联目录' : 'Parent Hubs & Cross-Links'}</h2>
  <div class="pill-links">
    ${modSeo.parentLinks
      .map((p) => `<a class="pill-link" href="${escapeHtml(p.path)}">${formatInlineCode(p.label)}</a>`)
      .join('\n    ')}
  </div>
</section>`
      : '';

  const bodyHtml = `<section class="hero hero--compact">
    <div class="container hero__copy">
      ${breadcrumbs}
      <h1>${escapeHtml(modSeo.h1 || entry.name)}</h1>
      <p class="hero__desc">${formatInlineCode(modSeo.summary || entry.description[lang])}</p>
      <div class="endpoint-box">
        <span class="endpoint-box__label">${isZh ? '安装命令：' : 'Install command:'}</span>
        <code class="install-cmd">${escapeHtml(entry.installCommand)}</code>
        <button type="button" class="copy-btn" data-copy="${escapeHtml(entry.installCommand)}"><span data-copy-label>${isZh ? '复制' : 'Copy'}</span><span class="sr-only"> — ${escapeHtml(entry.installCommand)}</span></button>
      </div>
      <div class="action-row">${externalButtons.join('\n        ')}</div>
    </div>
  </section>

  <div class="container page-body">
    ${factsHtml}
    ${
      modSeo.corePurpose
        ? `<section class="content-band">
      <h2>${escapeHtml(modSeo.corePurpose.heading)}</h2>
      ${(modSeo.corePurpose.paragraphs || []).map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
    </section>`
        : ''
    }
    ${
      modSeo.useCasesAndTradeoffs
        ? `<section class="content-band">
      <h2>${escapeHtml(modSeo.useCasesAndTradeoffs.heading)}</h2>
      ${(modSeo.useCasesAndTradeoffs.paragraphs || []).map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
      ${
        Array.isArray(modSeo.useCasesAndTradeoffs.scenarios) &&
        modSeo.useCasesAndTradeoffs.scenarios.length
          ? `<ul class="prose-list">${modSeo.useCasesAndTradeoffs.scenarios
              .map((s) => `<li>${formatInlineCode(s)}</li>`)
              .join('')}</ul>`
          : ''
      }
    </section>`
        : ''
    }
    ${
      modSeo.installationAndSource
        ? `<section class="content-band">
      <h2>${escapeHtml(modSeo.installationAndSource.heading)}</h2>
      <p>${formatInlineCode(modSeo.installationAndSource.sourceRationale)}</p>
      ${
        Array.isArray(modSeo.installationAndSource.prerequisites) &&
        modSeo.installationAndSource.prerequisites.length
          ? `<ul class="prose-list">${modSeo.installationAndSource.prerequisites
              .map((s) => `<li>${formatInlineCode(s)}</li>`)
              .join('')}</ul>`
          : ''
      }
    </section>`
        : ''
    }
    ${platformMatrix}
    ${companionsHtml}
    ${
      modSeo.verificationRecord
        ? `<section class="content-band">
      <h2>${escapeHtml(modSeo.verificationRecord.heading)}</h2>
      <p>${formatInlineCode(modSeo.verificationRecord.summary)}</p>
      <p>${formatInlineCode(modSeo.verificationRecord.scopeDisclaimer)}</p>
    </section>`
        : ''
    }
    ${
      modSeo.buildAndSecurityNote
        ? renderCallout({
            heading: modSeo.buildAndSecurityNote.heading,
            body: modSeo.buildAndSecurityNote.body,
            variant: 'warn',
          })
        : ''
    }
    ${renderRelatedLinks(relatedItems, isZh ? '同分类及关联 nshm 模块' : 'Related nshm Modules')}
    ${parentLinksHtml}
  </div>`;

  const jsonLdGraph = buildModuleSchema({
    siteUrl,
    lang,
    entry,
    pageUrl: route.url,
    title: route.title,
    description: route.description,
    updatedAt: route.lastmod,
  });

  return renderPageShell({
    lang,
    title: route.title,
    description: route.description,
    canonicalUrl: route.url,
    enUrl: route.enUrl,
    zhUrl: route.zhUrl,
    altPath: route.altPath,
    mdUrl: route.mdUrl,
    socialType: 'website',
    modifiedTime: route.lastmod,
    jsonLdGraph,
    activeNav: 'nshm',
    nshmCount: installableCount,
    nshVerifiedVersion: data.nshVerifiedVersion,
    siteUrl,
    bodyHtml,
  });
}

export function renderDiscoveryPage({ route, data, seoContent }) {
  const lang = route.lang;
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const disc = seoContent?.pillars?.discovery?.[lang] || {};
  const linkMap = buildInstallableLinkMap(data, lang);
  const installableCount = (data?.entries || []).filter((e) => e.installable).length;
  const siteUrl = data?.siteUrl || 'https://nsh-awesome.vercel.app/';

  const breadcrumbs = renderBreadcrumbs(
    [
      { label: isZh ? '首页' : 'Home', href: `${langPrefix}/` },
      { label: isZh ? '发现机制' : 'Discovery Methodology' },
    ],
    lang,
  );

  const bodyHtml = `<section class="hero hero--compact">
    <div class="container hero__copy">
      ${breadcrumbs}
      <h1>${escapeHtml(disc.h1 || (isZh ? 'nshm 发现机制与验证方法论' : 'How nshm Discovery Works'))}</h1>
      <p class="hero__desc">${formatInlineCode(disc.lead || '')}</p>
      <div class="action-row">
        <a class="pill-link" href="${escapeHtml(route.mdPath)}">${isZh ? 'Markdown 版本' : 'Markdown Edition'}</a>
        <a class="pill-link" href="https://github.com/AkaraChen/nsh-awesome/blob/main/docs/DISCOVERY.md" target="_blank" rel="noopener">${isZh ? 'GitHub 原始 DISCOVERY.md' : 'Raw docs/DISCOVERY.md'}</a>
      </div>
    </div>
  </section>

  <div class="container page-body">
    ${
      Array.isArray(disc.intro) && disc.intro.length
        ? `<section class="content-band">
      <h2>${isZh ? '调研背景与源码依据' : 'Methodology Overview'}</h2>
      ${disc.intro.map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
    </section>`
        : ''
    }
    ${
      disc.manifestRules
        ? `<section class="content-band">
      <h2>${escapeHtml(disc.manifestRules.heading)}</h2>
      <p>${formatInlineCode(disc.manifestRules.intro)}</p>
      <div class="table-scroll" tabindex="0" role="region" aria-label="${escapeHtml(disc.manifestRules.heading)}">
        <table class="data-table">
          <thead><tr>${disc.manifestRules.columns.map((c) => `<th scope="col">${formatInlineCode(c)}</th>`).join('')}</tr></thead>
          <tbody>${disc.manifestRules.rows
            .map((r) => `<tr>${r.map((cell) => `<td>${formatInlineCode(cell)}</td>`).join('')}</tr>`)
            .join('')}</tbody>
        </table>
      </div>
      <ul class="prose-list">${(disc.manifestRules.nuances || [])
        .map((n) => `<li>${formatInlineCode(n)}</li>`)
        .join('')}</ul>
    </section>`
        : ''
    }
    ${
      disc.cargoPublishQuirk
        ? `<section class="content-band">
      <h2>${escapeHtml(disc.cargoPublishQuirk.heading)}</h2>
      <p>${formatInlineCode(disc.cargoPublishQuirk.explanation)}</p>
      ${
        disc.cargoPublishQuirk.snippet
          ? `<pre tabindex="0"><code>${escapeHtml(disc.cargoPublishQuirk.snippet)}</code></pre>`
          : ''
      }
    </section>`
        : ''
    }
    ${
      disc.channelsTable
        ? renderDataTable({
            heading: disc.channelsTable.heading,
            intro: disc.channelsTable.intro,
            columns: disc.channelsTable.columns,
            rows: disc.channelsTable.rows,
          })
        : ''
    }
    ${
      disc.acceptedTable
        ? renderDataTable({
            heading: disc.acceptedTable.heading,
            intro: disc.acceptedTable.intro,
            columns: disc.acceptedTable.columns,
            rows: disc.acceptedTable.rows,
            linkModuleMap: linkMap,
          })
        : ''
    }
    ${
      disc.exclusionsTable
        ? renderDataTable({
            heading: disc.exclusionsTable.heading,
            intro: disc.exclusionsTable.intro,
            columns: disc.exclusionsTable.columns,
            rows: disc.exclusionsTable.rows,
          })
        : ''
    }
    ${renderRelatedLinks(disc.relatedLinks, isZh ? '关联目录与标准说明' : 'Related Catalog Sections')}
  </div>`;

  const jsonLdGraph = buildArticleSchema({
    siteUrl,
    lang,
    pageUrl: route.url,
    title: route.title,
    description: route.description,
    datePublished: '2026-11-26',
    dateModified: route.lastmod,
    kind: 'discovery',
  });

  return renderPageShell({
    lang,
    title: route.title,
    description: route.description,
    canonicalUrl: route.url,
    enUrl: route.enUrl,
    zhUrl: route.zhUrl,
    altPath: route.altPath,
    mdUrl: route.mdUrl,
    socialType: 'article',
    publishedTime: '2026-11-26',
    modifiedTime: route.lastmod,
    jsonLdGraph,
    activeNav: 'discovery',
    nshmCount: installableCount,
    nshVerifiedVersion: data.nshVerifiedVersion,
    siteUrl,
    bodyHtml,
  });
}

export function renderAboutPage({ route, data, seoContent }) {
  const lang = route.lang;
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const about = seoContent?.pillars?.about?.[lang] || {};
  const installableCount = (data?.entries || []).filter((e) => e.installable).length;
  const siteUrl = data?.siteUrl || 'https://nsh-awesome.vercel.app/';

  const breadcrumbs = renderBreadcrumbs(
    [
      { label: isZh ? '首页' : 'Home', href: `${langPrefix}/` },
      { label: isZh ? '关于与标准' : 'About & Criteria' },
    ],
    lang,
  );

  const bodyHtml = `<section class="hero hero--compact">
    <div class="container hero__copy">
      ${breadcrumbs}
      <h1>${escapeHtml(about.h1 || (isZh ? '关于 Awesome NSH' : 'About Awesome NSH'))}</h1>
      <p class="hero__desc">${formatInlineCode(about.lead || '')}</p>
      <div class="action-row">
        <a class="pill-link" href="${escapeHtml(route.mdPath)}">${isZh ? 'Markdown 版本' : 'Markdown Edition'}</a>
        <a class="pill-link" href="https://github.com/AkaraChen/nsh-awesome/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">CONTRIBUTING.md</a>
      </div>
    </div>
  </section>

  <div class="container page-body">
    ${
      about.who
        ? `<section class="content-band">
      <h2>${escapeHtml(about.who.heading)}</h2>
      ${(about.who.paragraphs || []).map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
    </section>`
        : ''
    }
    ${
      about.how
        ? `<section class="content-band">
      <h2>${escapeHtml(about.how.heading)}</h2>
      ${(about.how.paragraphs || []).map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
      ${
        Array.isArray(about.how.pipelineScripts) && about.how.pipelineScripts.length
          ? `<div class="table-scroll" tabindex="0" role="region" aria-label="${escapeHtml(about.how.heading)}">
        <table class="data-table">
          <thead><tr><th scope="col">${isZh ? '自动化脚本' : 'Pipeline Script'}</th><th scope="col">${isZh ? '职责' : 'Role'}</th></tr></thead>
          <tbody>${about.how.pipelineScripts
            .map((s) => `<tr><td><code>${escapeHtml(s.script)}</code></td><td>${formatInlineCode(s.role)}</td></tr>`)
            .join('')}</tbody>
        </table>
      </div>`
          : ''
      }
    </section>`
        : ''
    }
    ${
      about.why
        ? `<section class="content-band">
      <h2>${escapeHtml(about.why.heading)}</h2>
      ${(about.why.paragraphs || []).map((p) => `<p>${formatInlineCode(p)}</p>`).join('\n      ')}
    </section>`
        : ''
    }
    ${
      about.criteria
        ? `<section class="content-band">
      <h2>${escapeHtml(about.criteria.heading)}</h2>
      <div class="two-col">
        <article class="subcard">
          <h3>${isZh ? '准入条件' : 'Inclusion Criteria'}</h3>
          <ul class="prose-list">${(about.criteria.inclusion || []).map((i) => `<li>${formatInlineCode(i)}</li>`).join('')}</ul>
        </article>
        <article class="subcard">
          <h3>${isZh ? '拒收与合并条件' : 'Exclusion & Grouping Rules'}</h3>
          <ul class="prose-list">${(about.criteria.exclusion || []).map((i) => `<li>${formatInlineCode(i)}</li>`).join('')}</ul>
        </article>
      </div>
    </section>`
        : ''
    }
    ${
      about.verificationBoundary
        ? `<section class="content-band">
      <h2>${escapeHtml(about.verificationBoundary.heading)}</h2>
      <p>${formatInlineCode(about.verificationBoundary.summary)}</p>
      <div class="two-col">
        <article class="subcard">
          <h3>${isZh ? '已实测验证范围' : 'What IS Verified'}</h3>
          <ul class="prose-list">${(about.verificationBoundary.verifiedItems || []).map((i) => `<li>${formatInlineCode(i)}</li>`).join('')}</ul>
        </article>
        <article class="subcard">
          <h3>${isZh ? '未声称范围' : 'What Is NOT Claimed'}</h3>
          <ul class="prose-list">${(about.verificationBoundary.notVerifiedItems || []).map((i) => `<li>${formatInlineCode(i)}</li>`).join('')}</ul>
        </article>
      </div>
    </section>`
        : ''
    }
    ${
      about.securityPolicy
        ? renderCallout({
            heading: about.securityPolicy.heading,
            body: about.securityPolicy.body,
            variant: 'warn',
          })
        : ''
    }
    ${
      about.contributing
        ? `<section class="content-band">
      <h2>${escapeHtml(about.contributing.heading)}</h2>
      <p>${formatInlineCode(about.contributing.body)}</p>
      ${
        about.contributing.contributingUrl
          ? `<div class="pill-links"><a class="pill-link" href="${escapeHtml(about.contributing.contributingUrl)}" target="_blank" rel="noopener">${isZh ? '阅读 CONTRIBUTING.md' : 'Read CONTRIBUTING.md'}</a></div>`
          : ''
      }
    </section>`
        : ''
    }
    ${renderRelatedLinks(about.relatedLinks, isZh ? '关联目录与方法论' : 'Related Directory & Methodology')}
  </div>`;

  const jsonLdGraph = buildArticleSchema({
    siteUrl,
    lang,
    pageUrl: route.url,
    title: route.title,
    description: route.description,
    datePublished: '2026-11-26',
    dateModified: route.lastmod,
    kind: 'about',
  });

  return renderPageShell({
    lang,
    title: route.title,
    description: route.description,
    canonicalUrl: route.url,
    enUrl: route.enUrl,
    zhUrl: route.zhUrl,
    altPath: route.altPath,
    mdUrl: route.mdUrl,
    socialType: 'website',
    modifiedTime: route.lastmod,
    jsonLdGraph,
    activeNav: 'about',
    nshmCount: installableCount,
    nshVerifiedVersion: data.nshVerifiedVersion,
    siteUrl,
    bodyHtml,
  });
}
