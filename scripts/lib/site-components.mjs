/**
 * Reusable semantic SSR UI components for Awesome NSH pages.
 *
 * Ensures accessible headings (h2/h3 hierarchy), WCAG 2.5.3 Label-in-Name
 * consistency, explicit `<label for>` + WebMCP `toolparamdescription` on search
 * form controls, keyboard-focusable scrollable regions, and zero duplicate ARIA IDs.
 */
import { escapeHtml, formatInlineCode } from './site-layout.mjs';

export function renderEntryCard(entry, lang = 'en') {
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/zh' : '';
  const desc = entry.description?.[lang] || entry.description?.en || '';
  const note = entry.notes?.[lang] || entry.notes?.en || '';
  const detailHref = entry.installable ? `${langPrefix}/nshm/${entry.id}/` : null;
  const titleHref = detailHref || entry.sourceUrl;
  const titleExternal = detailHref ? '' : ' target="_blank" rel="noopener"';

  const badges = [];
  if (entry.section === 'framework') {
    badges.push(`<span class="badge badge--warn">${isZh ? '非 nshm' : 'NOT nshm'}</span>`);
  } else {
    badges.push(`<span class="badge badge--citrus">${escapeHtml(entry.kind)}</span>`);
  }
  badges.push(`<span class="badge badge--sky">${escapeHtml(entry.sourceType)}</span>`);
  if (entry.version) {
    badges.push(`<span class="badge">v${escapeHtml(entry.version)}</span>`);
  }

  const installBlock =
    entry.installable && entry.installCommand
      ? `<div class="install-row"><code class="install-cmd">${escapeHtml(entry.installCommand)}</code><button type="button" class="copy-btn" data-copy="${escapeHtml(entry.installCommand)}"><span data-copy-label>${isZh ? '复制' : 'Copy'}</span><span class="sr-only"> — ${escapeHtml(entry.installCommand)}</span></button></div>`
      : '';

  const noteBlock = note ? `<p class="card__note">${formatInlineCode(note)}</p>` : '';
  const platTags = (entry.platforms || [])
    .map((p) => `<span class="plat-tag">${escapeHtml(p)}</span>`)
    .join('');

  const links = [];
  if (detailHref) {
    links.push(
      `<a href="${escapeHtml(detailHref)}">${isZh ? '详情' : 'Details'}<span class="sr-only"> — ${escapeHtml(entry.name)}</span></a>`,
    );
  }
  links.push(
    `<a href="${escapeHtml(entry.sourceUrl)}" target="_blank" rel="noopener">${isZh ? '源码' : 'Source'}<span class="sr-only"> — ${escapeHtml(entry.name)}</span></a>`,
  );
  if (entry.cratesUrl && entry.cratesUrl !== entry.sourceUrl) {
    links.push(
      `<a href="${escapeHtml(entry.cratesUrl)}" target="_blank" rel="noopener">crates.io<span class="sr-only"> — ${escapeHtml(entry.name)}</span></a>`,
    );
  }
  if (entry.homepage && entry.homepage !== entry.sourceUrl) {
    links.push(
      `<a href="${escapeHtml(entry.homepage)}" target="_blank" rel="noopener">${isZh ? '文档' : 'Docs'}<span class="sr-only"> — ${escapeHtml(entry.name)}</span></a>`,
    );
  }

  const searchText = [
    entry.id,
    entry.name,
    entry.kind,
    entry.sourceType,
    entry.installCommand || '',
    entry.description?.en || '',
    entry.description?.zh || '',
    entry.notes?.en || '',
    entry.notes?.zh || '',
    (entry.platforms || []).join(' '),
    entry.license || '',
  ]
    .join(' ')
    .toLowerCase();

  return `<article class="card" data-section="${escapeHtml(entry.section)}" data-category="${escapeHtml(entry.category)}" data-source="${escapeHtml(entry.sourceType)}" data-installable="${entry.installable ? 'true' : 'false'}" data-search="${escapeHtml(searchText)}">
  <div class="card__top">
    <h3 class="card__title"><a href="${escapeHtml(titleHref)}"${titleExternal}>${escapeHtml(entry.name)}</a></h3>
    <div class="card__badges">${badges.join('')}</div>
  </div>
  <p class="card__desc">${formatInlineCode(desc)}</p>
  ${installBlock}
  ${noteBlock}
  <div class="card__meta">
    <div class="card__platforms">${platTags}</div>
    <div class="card__links"><span>${escapeHtml(entry.license)}</span><span>${escapeHtml(entry.updatedAt)}</span>${links.join('')}</div>
  </div>
</article>`;
}

export function renderDataTable({
  heading,
  intro = '',
  columns = [],
  rows = [],
  headingLevel = 2,
  linkModuleMap = null,
}) {
  const hTag = `h${headingLevel}`;
  const ths = columns.map((col) => `<th scope="col">${formatInlineCode(col)}</th>`).join('');
  const trs = rows
    .map((row) => {
      const tds = row
        .map((cell, idx) => {
          const text = String(cell ?? '');
          if (idx === 0 && linkModuleMap && linkModuleMap.has(text)) {
            const href = linkModuleMap.get(text);
            return `<td><a href="${escapeHtml(href)}"><strong>${escapeHtml(text)}</strong></a></td>`;
          }
          return `<td>${formatInlineCode(text)}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n          ');

  return `<section class="content-band">
  <${hTag}>${escapeHtml(heading)}</${hTag}>
  ${intro ? `<p>${formatInlineCode(intro)}</p>` : ''}
  <div class="table-scroll" tabindex="0" role="region" aria-label="${escapeHtml(heading)}">
    <table class="data-table">
      <thead>
        <tr>${ths}</tr>
      </thead>
      <tbody>
        ${trs}
      </tbody>
    </table>
  </div>
</section>`;
}

export function renderCallout({ heading, body, variant = 'info', headingLevel = 2 }) {
  const hTag = `h${headingLevel}`;
  const cls = variant === 'warn' ? 'callout callout--warn' : 'callout';
  return `<section class="${cls}">
  <${hTag}>${escapeHtml(heading)}</${hTag}>
  <p>${formatInlineCode(body)}</p>
</section>`;
}

export function renderRelatedLinks(items = [], heading = 'Related Pages', headingLevel = 2) {
  if (!Array.isArray(items) || items.length === 0) return '';
  const hTag = `h${headingLevel}`;
  const subTag = `h${Math.min(6, headingLevel + 1)}`;
  const cards = items
    .map(
      (item) => `<article class="subcard">
  <${subTag} class="card__title"><a href="${escapeHtml(item.path)}">${formatInlineCode(item.label || item.title)}</a></${subTag}>
  <p class="card__desc">${formatInlineCode(item.reason || item.summary || '')}</p>
</article>`,
    )
    .join('\n  ');
  return `<section class="content-band">
  <${hTag}>${escapeHtml(heading)}</${hTag}>
  <div class="two-col">
    ${cards}
  </div>
</section>`;
}

export function renderHomeSearchControls({ data, lang = 'en' }) {
  const isZh = lang === 'zh';
  const actionUrl = isZh ? '/zh/' : '/';
  const formLabel = isZh ? '搜索并筛选目录' : 'Search and filter directory';
  const searchLabel = isZh ? '按关键词搜索模块、Crate、平台或许可证' : 'Search catalog by module name, crate, platform, or license';
  const searchPlaceholder = isZh
    ? '搜索 nshm、crate、平台、许可证...'
    : 'Search nshm, crate, platform, license...';
  const sourceLabel = isZh ? '按安装来源筛选' : 'Filter by distribution source';
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];

  const secButtons = [
    `<button type="button" class="chip is-active" data-section="all" aria-pressed="true">${isZh ? '全部' : 'All'} (${entries.length})</button>`,
    ...sections.map((s) => {
      const cnt = entries.filter((e) => e.section === s.id).length;
      return `<button type="button" class="chip" data-section="${escapeHtml(s.id)}" aria-pressed="false">${escapeHtml(s.title[lang])} (${cnt})</button>`;
    }),
  ].join('\n        ');

  const catButtons = [
    `<button type="button" class="chip chip--sub is-active" data-category="all" data-owner-section="all" aria-pressed="true">${isZh ? '全部分类' : 'All categories'}</button>`,
    ...categories
      .filter((c) => entries.some((e) => e.category === c.id))
      .map(
        (c) =>
          `<button type="button" class="chip chip--sub" data-category="${escapeHtml(c.id)}" data-owner-section="${escapeHtml(c.section)}" aria-pressed="false">${escapeHtml(c.title[lang])}</button>`,
      ),
  ].join('\n        ');

  const toolDescription = isZh
    ? '按关键词和分发来源筛选 Awesome NSH 收录的可安装 nshm 模块、框架 crate、模板与文档。'
    : 'Filter the Awesome NSH catalog of installable nshm modules, framework crates, templates, and guides by keyword and distribution source.';
  const queryParamDesc = isZh
    ? '用于匹配模块名称、ID、描述、支持平台、许可证或安装命令的关键词。'
    : 'Keyword matching module name, ID, description, platform, license, or install command.';
  const sourceParamDesc = isZh
    ? '按分发来源筛选条目：all、crates.io、github、git 或 web。'
    : 'Filter catalog entries by distribution source: all, crates.io, github, git, or web.';

  return `<section class="controls" aria-label="${escapeHtml(formLabel)}">
  <form id="catalog-search-form" class="controls__form" role="search" action="${actionUrl}" method="get" toolname="filter_catalog_entries" tooldescription="${escapeHtml(toolDescription)}">
    <div class="search-wrap">
      <label id="search-input-label" class="sr-only" for="search-input">${escapeHtml(searchLabel)}</label>
      <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input id="search-input" name="q" class="search-input" type="search" aria-labelledby="search-input-label" placeholder="${escapeHtml(searchPlaceholder)}" autocomplete="off" toolparamtitle="Search Query" toolparamdescription="${escapeHtml(queryParamDesc)}">
      <span class="search-kbd" aria-hidden="true">/</span>
    </div>
    <label class="sr-only" for="source-filter">${escapeHtml(sourceLabel)}</label>
    <select id="source-filter" name="source" class="select-filter" toolparamtitle="Distribution Source" toolparamdescription="${escapeHtml(sourceParamDesc)}">
      <option value="all">${isZh ? '全部来源' : 'All sources'}</option>
      <option value="crates.io">crates.io</option>
      <option value="github">github:</option>
      <option value="git">${isZh ? 'Git URL' : 'Git URL'}</option>
      <option value="web">${isZh ? '网页 / 文档' : 'Web / Docs'}</option>
    </select>
    <button type="submit" class="ctrl-btn ctrl-btn--primary">${isZh ? '筛选' : 'Filter'}</button>
  </form>
  <div class="chips" id="section-chips" role="group" aria-label="${isZh ? '按板块筛选' : 'Filter by section'}">
    ${secButtons}
  </div>
  <div class="chips chips--sub" id="category-chips" role="group" aria-label="${isZh ? '按分类筛选' : 'Filter by category'}">
    ${catButtons}
  </div>
</section>`;
}
