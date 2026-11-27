import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SCHEMA_CONTEXT,
  DEFAULT_SITE_URL,
  DEPRECATED_SCHEMA_TYPES,
  SECTION_SLUGS,
  buildHomeSchema,
  buildSectionSchema,
  buildModuleSchema,
  buildArticleSchema,
  renderJsonLdScript,
  serializeJsonLd,
  assertNoDeprecatedTypes,
  computeLatestDate,
  resolveHomeUrl,
  resolveSectionUrl,
  resolveModuleUrl,
} from './lib/seo-schema.mjs';
import {
  SITEMAP_NS,
  XHTML_NS,
  renderHreflangTags,
  buildSitemapXml,
  computePageLastmod,
  normalizeW3cDate,
  isValidHreflangCode,
  isExcludedSitemapPage,
} from './lib/seo-sitemap.mjs';

const entriesData = JSON.parse(
  fs.readFileSync(new URL('../data/entries.json', import.meta.url), 'utf8'),
);
const SITE_URL = entriesData.siteUrl;
const INSTALLABLE_ENTRIES = entriesData.entries.filter((e) => e.installable);

/**
 * Build the 40 bilingual page descriptors (20 EN + 20 ZH) from `data/entries.json`.
 */
function buildBilingualCatalogPages() {
  const latestAll = computeLatestDate(entriesData.entries);
  const pages = [];

  for (const lang of ['en', 'zh']) {
    const enUrl = resolveHomeUrl(SITE_URL, 'en');
    const zhUrl = resolveHomeUrl(SITE_URL, 'zh');
    pages.push({
      kind: 'home',
      lang,
      url: lang === 'en' ? enUrl : zhUrl,
      enUrl,
      zhUrl,
      lastmod: latestAll,
      title:
        lang === 'en'
          ? 'Awesome NSH — Native Shell Modules & Crate Directory'
          : 'Awesome NSH — Native Shell 模块与 Crate 目录',
      description: entriesData.description[lang],
    });
  }

  for (const section of entriesData.sections) {
    const sectionEntries = entriesData.entries.filter((e) => e.section === section.id);
    const sectionLastmod = computePageLastmod(sectionEntries.map((e) => e.updatedAt));
    const enUrl = resolveSectionUrl(SITE_URL, 'en', section.id);
    const zhUrl = resolveSectionUrl(SITE_URL, 'zh', section.id);
    for (const lang of ['en', 'zh']) {
      pages.push({
        kind: 'section',
        section,
        sectionEntries,
        lang,
        url: lang === 'en' ? enUrl : zhUrl,
        enUrl,
        zhUrl,
        lastmod: sectionLastmod,
        title: section.title[lang],
        description: section.description[lang],
      });
    }
  }

  for (const entry of INSTALLABLE_ENTRIES) {
    const enUrl = resolveModuleUrl(SITE_URL, 'en', entry.id);
    const zhUrl = resolveModuleUrl(SITE_URL, 'zh', entry.id);
    for (const lang of ['en', 'zh']) {
      pages.push({
        kind: 'module',
        entry,
        lang,
        url: lang === 'en' ? enUrl : zhUrl,
        enUrl,
        zhUrl,
        lastmod: entry.updatedAt,
        title: `${entry.name} — Awesome NSH`,
        description: entry.description[lang],
      });
    }
  }

  const pillars = [
    {
      slug: 'discovery',
      schemaKind: 'TechArticle',
      lastmod: '2026-11-26',
      enTitle: 'How nshm Discovery & nsh add Verification Work',
      zhTitle: 'nshm 发现机制与 nsh add 实测验证方法论',
      enDesc:
        'Empirical findings from auditing 119 crates.io crates and 89 GitHub repos: manifest rules, the Cargo 0.6 quirk, 6 discovery channels, and exclusion logs.',
      zhDesc:
        '基于 119 个 crates.io crate 与 89 个 GitHub 仓库的 6 渠道扫描实测：详述四类合法清单规则、0.6 规范化 quirks 与排除名单。',
    },
    {
      slug: 'about',
      schemaKind: 'AboutPage',
      lastmod: '2026-11-25',
      enTitle: 'About Awesome NSH — Verification & Safety Policy',
      zhTitle: '关于 Awesome NSH — 收录标准、验证边界与安全提示',
      enDesc:
        'Learn who curates Awesome NSH, how nsh 0.7.1 scratch-app install checks are executed, security considerations for build.rs macros, and how to contribute.',
      zhDesc:
        '了解项目维护者 AkaraChen、nsh 0.7.1 临时应用实测范围、build.rs 与过程宏供应链安全警示，以及向目录提交模块的方式。',
    },
  ];

  for (const pillar of pillars) {
    const enUrl = `${SITE_URL}${pillar.slug}/`;
    const zhUrl = `${SITE_URL}zh/${pillar.slug}/`;
    for (const lang of ['en', 'zh']) {
      pages.push({
        kind: 'article',
        schemaKind: pillar.schemaKind,
        lang,
        url: lang === 'en' ? enUrl : zhUrl,
        enUrl,
        zhUrl,
        lastmod: pillar.lastmod,
        datePublished: '2026-11-25',
        title: lang === 'en' ? pillar.enTitle : pillar.zhTitle,
        description: lang === 'en' ? pillar.enDesc : pillar.zhDesc,
      });
    }
  }

  return pages;
}

/**
 * Parse `<url>...</url>` blocks from sitemap XML for structural assertions.
 */
function parseSitemapUrlBlocks(xml) {
  const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  return blocks.map((block) => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    const links = [...block.matchAll(/<xhtml:link\s+([^>]+?)\s*\/>/g)].map((lm) => {
      const attrs = {};
      for (const am of lm[1].matchAll(/([a-zA-Z0-9_-]+)="([^"]*)"/g)) {
        attrs[am[1]] = am[2];
      }
      return attrs;
    });
    return {
      loc: locMatch?.[1],
      lastmod: lastmodMatch?.[1],
      links,
    };
  });
}

/**
 * Recursively verify that all URL-bearing fields in a JSON-LD object are absolute `https://` URLs.
 */
function assertEveryUrlIsAbsoluteHttps(node, pathLabel = 'root') {
  if (Array.isArray(node)) {
    node.forEach((item, index) => assertEveryUrlIsAbsoluteHttps(item, `${pathLabel}[${index}]`));
    return;
  }
  if (!node || typeof node !== 'object') return;

  const urlKeys = new Set([
    'url',
    '@id',
    'item',
    'codeRepository',
    'contentUrl',
    'license',
    'urlTemplate',
    'identifier',
  ]);

  for (const [key, value] of Object.entries(node)) {
    if (urlKeys.has(key) && typeof value === 'string') {
      const parsed = new URL(value);
      assert.equal(parsed.protocol, 'https:', `${pathLabel}.${key} must use https:// (got ${value})`);
    } else if (key === 'sameAs' && Array.isArray(value)) {
      for (const item of value) {
        const parsed = new URL(item);
        assert.equal(parsed.protocol, 'https:', `${pathLabel}.sameAs must use https:// (got ${item})`);
      }
    } else if (value && typeof value === 'object') {
      assertEveryUrlIsAbsoluteHttps(value, `${pathLabel}.${key}`);
    }
  }
}

test('buildSitemapXml builds 40-page bilingual mesh with 3 xhtml:link tags per url and x-default -> EN', () => {
  const pages = buildBilingualCatalogPages();
  assert.equal(pages.length, 40);

  const xml = buildSitemapXml(pages);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n'));
  assert.ok(xml.includes(`xmlns="${SITEMAP_NS}"`));
  assert.ok(xml.includes(`xmlns:xhtml="${XHTML_NS}"`));

  const parsedUrls = parseSitemapUrlBlocks(xml);
  assert.equal(parsedUrls.length, 40);

  const expectedByLoc = new Map(pages.map((p) => [p.url, p]));
  const seenLocs = new Set();
  const lastmodCounts = {};

  for (const entry of parsedUrls) {
    assert.ok(entry.loc && !seenLocs.has(entry.loc), `Unexpected or duplicate loc: ${entry.loc}`);
    seenLocs.add(entry.loc);

    const spec = expectedByLoc.get(entry.loc);
    assert.ok(spec, `Unknown loc emitted: ${entry.loc}`);
    assert.match(entry.lastmod, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(entry.lastmod, spec.lastmod);
    lastmodCounts[entry.lastmod] = (lastmodCounts[entry.lastmod] || 0) + 1;

    assert.equal(entry.links.length, 3, `${entry.loc} must have exactly 3 xhtml:link alternates`);
    const byLang = new Map();
    for (const link of entry.links) {
      assert.equal(link.rel, 'alternate');
      byLang.set(link.hreflang, link.href);
    }

    assert.deepEqual([...byLang.keys()].sort(), ['en', 'x-default', 'zh-Hans']);
    assert.equal(byLang.get('en'), spec.enUrl);
    assert.equal(byLang.get('zh-Hans'), spec.zhUrl);
    assert.equal(byLang.get('x-default'), spec.enUrl, `${entry.loc} x-default must point to EN URL`);
    assert.ok(
      byLang.get('en') === entry.loc || byLang.get('zh-Hans') === entry.loc,
      `${entry.loc} must include a self-referencing xhtml:link`,
    );
  }

  assert.deepEqual(lastmodCounts, { '2026-11-25': 22, '2026-11-26': 18 });
});

test('renderHreflangTags renders canonical + bidirectional en/zh-Hans/x-default pointing to EN', () => {
  const enUrl = 'https://nsh-awesome.vercel.app/nshm/nsh-omarchy/';
  const zhUrl = 'https://nsh-awesome.vercel.app/zh/nshm/nsh-omarchy/';

  const zhHtml = renderHreflangTags({ enUrl, zhUrl, canonicalUrl: zhUrl });
  assert.deepEqual(zhHtml.split('\n'), [
    `<link rel="canonical" href="${zhUrl}">`,
    `<link rel="alternate" hreflang="en" href="${enUrl}">`,
    `<link rel="alternate" hreflang="zh-Hans" href="${zhUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}">`,
  ]);

  const enHtml = renderHreflangTags({ enUrl, zhUrl, canonicalUrl: enUrl });
  assert.ok(enHtml.includes(`<link rel="canonical" href="${enUrl}">`));
  assert.ok(enHtml.includes(`<link rel="alternate" hreflang="x-default" href="${enUrl}">`));

  assert.throws(
    () =>
      renderHreflangTags({
        enUrl,
        zhUrl,
        canonicalUrl: 'https://nsh-awesome.vercel.app/nshm/nsh-omarchy',
      }),
    /must exactly match/,
  );
  assert.throws(
    () => renderHreflangTags({ enUrl, zhUrl: enUrl, canonicalUrl: enUrl }),
    /distinct URLs/,
  );
});

test('buildSitemapXml rejects duplicate loc values', () => {
  assert.throws(
    () =>
      buildSitemapXml([
        { url: 'https://nsh-awesome.vercel.app/', lastmod: '2026-11-26' },
        { url: 'https://nsh-awesome.vercel.app/', lastmod: '2026-11-25' },
      ]),
    /Duplicate sitemap URL/,
  );

  assert.throws(
    () =>
      buildSitemapXml([
        { url: 'https://nsh-awesome.vercel.app', lastmod: '2026-11-26' },
        { url: 'https://nsh-awesome.vercel.app/', lastmod: '2026-11-26' },
      ]),
    /Duplicate sitemap URL/,
  );
});

test('buildSitemapXml strictMesh rejects missing /zh/ target, missing return link, and missing self link', () => {
  // Missing /zh/ page completely
  assert.throws(
    () =>
      buildSitemapXml([
        {
          url: 'https://nsh-awesome.vercel.app/',
          lastmod: '2026-11-26',
          enUrl: 'https://nsh-awesome.vercel.app/',
          zhUrl: 'https://nsh-awesome.vercel.app/zh/',
        },
      ]),
    /Broken hreflang target/,
  );

  // /zh/ exists but does not link back to EN
  assert.throws(
    () =>
      buildSitemapXml([
        {
          url: 'https://nsh-awesome.vercel.app/',
          lastmod: '2026-11-26',
          enUrl: 'https://nsh-awesome.vercel.app/',
          zhUrl: 'https://nsh-awesome.vercel.app/zh/',
        },
        {
          url: 'https://nsh-awesome.vercel.app/zh/',
          lastmod: '2026-11-26',
          alternates: [{ hreflang: 'zh-Hans', href: 'https://nsh-awesome.vercel.app/zh/' }],
        },
      ]),
    /Missing hreflang return link/,
  );

  // Alternates omit self-reference
  assert.throws(
    () =>
      buildSitemapXml([
        {
          url: 'https://nsh-awesome.vercel.app/',
          lastmod: '2026-11-26',
          alternates: [{ hreflang: 'zh-Hans', href: 'https://nsh-awesome.vercel.app/zh/' }],
        },
      ]),
    /missing a self-referencing hreflang/,
  );
});

test('buildSitemapXml and normalizeW3cDate reject non-YYYY-MM-DD and invalid calendar dates', () => {
  const badDates = [
    '',
    null,
    undefined,
    '2026/11/26',
    '26-11-2026',
    '2026-11',
    'Nov 26, 2026',
    '2026-02-30',
    '2026-13-01',
    '2026-04-31',
  ];

  for (const bad of badDates) {
    assert.throws(() => normalizeW3cDate(bad), TypeError, `Expected normalizeW3cDate(${JSON.stringify(bad)}) to throw`);
    assert.throws(
      () => buildSitemapXml([{ url: 'https://nsh-awesome.vercel.app/', lastmod: bad }]),
      TypeError,
      `Expected buildSitemapXml with lastmod=${JSON.stringify(bad)} to throw`,
    );
  }
});

test('http:// and malformed URLs throw across seo-sitemap and seo-schema builders', () => {
  const badUrls = [
    'http://nsh-awesome.vercel.app/',
    '/relative/path/',
    'not a valid url',
    'https://nsh-awesome.vercel.app/#fragment',
    'ftp://nsh-awesome.vercel.app/',
  ];

  for (const bad of badUrls) {
    assert.throws(
      () =>
        renderHreflangTags({
          enUrl: bad,
          zhUrl: 'https://nsh-awesome.vercel.app/zh/',
          canonicalUrl: bad,
        }),
      TypeError,
      `renderHreflangTags should reject "${bad}"`,
    );

    assert.throws(
      () => buildSitemapXml([{ url: bad, lastmod: '2026-11-26' }]),
      TypeError,
      `buildSitemapXml should reject "${bad}"`,
    );
  }

  for (const badScheme of ['http://nsh-awesome.vercel.app/', 'ftp://nsh-awesome.vercel.app/', 'not-a-url']) {
    assert.throws(
      () => buildHomeSchema({ siteUrl: badScheme, data: entriesData }),
      TypeError,
      `buildHomeSchema should reject siteUrl "${badScheme}"`,
    );
    assert.throws(
      () => buildSectionSchema({ siteUrl: badScheme, section: 'nshm', entries: INSTALLABLE_ENTRIES }),
      TypeError,
      `buildSectionSchema should reject siteUrl "${badScheme}"`,
    );
    assert.throws(
      () => buildModuleSchema({ siteUrl: badScheme, entry: INSTALLABLE_ENTRIES[0] }),
      TypeError,
      `buildModuleSchema should reject siteUrl "${badScheme}"`,
    );
    assert.throws(
      () => buildArticleSchema({ siteUrl: badScheme, kind: 'TechArticle', title: 'Test' }),
      TypeError,
      `buildArticleSchema should reject siteUrl "${badScheme}"`,
    );
  }

  assert.throws(
    () =>
      buildSectionSchema({
        siteUrl: '',
        section: 'nshm',
        entries: INSTALLABLE_ENTRIES,
      }),
    TypeError,
  );

  assert.throws(
    () =>
      buildModuleSchema({
        siteUrl: SITE_URL,
        entry: { ...INSTALLABLE_ENTRIES[0], sourceUrl: 'http://github.com/longbridge/nsh' },
      }),
    TypeError,
  );
  assert.throws(
    () =>
      buildHomeSchema({
        siteUrl: SITE_URL,
        pageUrl: 'http://nsh-awesome.vercel.app/',
        data: entriesData,
      }),
    TypeError,
  );
});

test('buildSitemapXml never emits <priority> or <changefreq> even when supplied in input', () => {
  const xml = buildSitemapXml([
    {
      url: 'https://nsh-awesome.vercel.app/',
      lastmod: '2026-11-26',
      enUrl: 'https://nsh-awesome.vercel.app/',
      zhUrl: 'https://nsh-awesome.vercel.app/zh/',
      priority: '1.0',
      changefreq: 'daily',
    },
    {
      url: 'https://nsh-awesome.vercel.app/zh/',
      lastmod: '2026-11-26',
      enUrl: 'https://nsh-awesome.vercel.app/',
      zhUrl: 'https://nsh-awesome.vercel.app/zh/',
      priority: 0.8,
      changefreq: 'weekly',
    },
  ]);

  assert.equal(/<priority\b/i.test(xml), false);
  assert.equal(/<changefreq\b/i.test(xml), false);
});

test('buildSitemapXml excludes 404 and noindex pages', () => {
  const validPages = buildBilingualCatalogPages();
  const withExcluded = [
    ...validPages,
    { url: `${SITE_URL}404.html`, lastmod: '2026-11-26' },
    { url: `${SITE_URL}404/`, lastmod: '2026-11-26' },
    { url: `${SITE_URL}missing/`, lastmod: '2026-11-26', is404: true },
    { url: `${SITE_URL}gone/`, lastmod: '2026-11-26', status: 404 },
    { url: `${SITE_URL}not-found/`, lastmod: '2026-11-26', statusCode: 404 },
    { url: `${SITE_URL}hidden-flag/`, lastmod: '2026-11-26', noindex: true },
    { url: `${SITE_URL}hidden-meta/`, lastmod: '2026-11-26', robots: 'noindex, nofollow' },
    { url: `${SITE_URL}skip-me/`, lastmod: '2026-11-26', excludeFromSitemap: true },
  ];

  const xml = buildSitemapXml(withExcluded);
  const parsed = parseSitemapUrlBlocks(xml);
  assert.equal(parsed.length, 40);

  for (const excludedPath of [
    '404.html',
    '/404/',
    '/missing/',
    '/gone/',
    '/not-found/',
    '/hidden-flag/',
    '/hidden-meta/',
    '/skip-me/',
  ]) {
    assert.equal(xml.includes(excludedPath), false, `Excluded path ${excludedPath} leaked into sitemap.xml`);
  }

  assert.equal(isExcludedSitemapPage({ url: `${SITE_URL}404.html` }), true);
  assert.equal(isExcludedSitemapPage({ url: `${SITE_URL}nshm/`, robots: 'index, follow' }), false);
  assert.equal(isValidHreflangCode('zh-Hans'), true);
  assert.equal(isValidHreflangCode('en-uk'), false);
  assert.equal(isValidHreflangCode('eng'), false);
});

test('assertNoDeprecatedTypes and renderJsonLdScript reject retired Schema.org types and escape <', () => {
  const retiredRequired = ['FAQPage', 'HowTo', 'SpecialAnnouncement', 'CourseInfo'];
  const allRetired = [...new Set([...retiredRequired, ...DEPRECATED_SCHEMA_TYPES])];

  for (const retiredType of allRetired) {
    // Direct object
    assert.throws(
      () => assertNoDeprecatedTypes({ '@type': retiredType, name: 'Bad' }),
      /Deprecated or retired Schema\.org @type is forbidden/,
    );
    // Inside @graph
    assert.throws(
      () =>
        assertNoDeprecatedTypes({
          '@context': SCHEMA_CONTEXT,
          '@graph': [{ '@type': 'WebPage' }, { '@type': retiredType }],
        }),
      /Deprecated or retired Schema\.org @type is forbidden/,
    );
    // Multi-type array & nested object
    assert.throws(
      () =>
        assertNoDeprecatedTypes({
          '@context': SCHEMA_CONTEXT,
          '@type': ['WebPage', retiredType],
        }),
      /Deprecated or retired Schema\.org @type is forbidden/,
    );
    // Through renderJsonLdScript
    assert.throws(
      () => renderJsonLdScript({ '@context': SCHEMA_CONTEXT, '@type': retiredType, name: 'Bad' }),
      /Deprecated or retired Schema\.org @type is forbidden/,
    );
  }

  // Script-tag breakout escaping
  const dangerous = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebPage',
    name: '</script><script>alert(1)</script>',
    url: DEFAULT_SITE_URL,
  };
  const tag = renderJsonLdScript(dangerous);
  assert.ok(tag.startsWith('<script type="application/ld+json">'));
  assert.ok(tag.endsWith('</script>'));
  const inner = tag.slice('<script type="application/ld+json">'.length, -'</script>'.length);
  assert.equal(inner.includes('<'), false, 'raw "<" must be escaped as \\u003c');
  assert.ok(inner.includes('\\u003c/script>'));
  assert.deepEqual(JSON.parse(serializeJsonLd(dangerous)), dangerous);

  // Real nsh-webgpu description contains `<Canvas getContext("webgpu")>`
  const webgpu = INSTALLABLE_ENTRIES.find((e) => e.id === 'nsh-webgpu');
  const webgpuScript = renderJsonLdScript(buildModuleSchema({ siteUrl: SITE_URL, lang: 'en', entry: webgpu }));
  const webgpuInner = webgpuScript.slice('<script type="application/ld+json">'.length, -'</script>'.length);
  assert.equal(webgpuInner.includes('<'), false);
  assert.ok(webgpuInner.includes('\\u003cCanvas'));
});

test('all 4 schema builders produce absolute https:// URLs and zh-Hans inLanguage on zh pages', () => {
  const pages = buildBilingualCatalogPages();
  assert.equal(pages.length, 40);
  assert.equal(SECTION_SLUGS.articles, 'guides');

  for (const page of pages) {
    let schema;
    if (page.kind === 'home') {
      schema = buildHomeSchema({
        siteUrl: SITE_URL,
        lang: page.lang,
        data: entriesData,
        pageUrl: page.url,
        title: page.title,
        description: page.description,
        updatedAt: page.lastmod,
      });
      const types = schema['@graph'].map((n) => n['@type']);
      assert.deepEqual(types, ['WebSite', 'Person', 'CollectionPage', 'ItemList', 'Dataset']);
      const ws = schema['@graph'][0];
      assert.equal(
        ws.potentialAction.target.urlTemplate,
        page.lang === 'zh'
          ? 'https://nsh-awesome.vercel.app/zh/?q={search_term_string}'
          : 'https://nsh-awesome.vercel.app/?q={search_term_string}',
      );
      assert.equal(schema['@graph'][1].name, 'AkaraChen');
      assert.deepEqual(schema['@graph'][1].sameAs, ['https://github.com/AkaraChen']);
      assert.equal(schema['@graph'][3].numberOfItems, 43);
      assert.equal(schema['@graph'][4].url, 'https://nsh-awesome.vercel.app/index.json');
      assert.equal(schema['@graph'][4].distribution[0]['@type'], 'DataDownload');
    } else if (page.kind === 'section') {
      schema = buildSectionSchema({
        siteUrl: SITE_URL,
        lang: page.lang,
        section: page.section,
        entries: page.sectionEntries,
        pageUrl: page.url,
        title: page.title,
        description: page.description,
        updatedAt: page.lastmod,
      });
      assert.deepEqual(
        schema['@graph'].map((n) => n['@type']),
        ['WebSite', 'Person', 'CollectionPage', 'ItemList', 'BreadcrumbList'],
      );
      if (page.section.id === 'articles') {
        assert.ok(page.url.endsWith('/guides/'));
      }
    } else if (page.kind === 'module') {
      schema = buildModuleSchema({
        siteUrl: SITE_URL,
        lang: page.lang,
        entry: page.entry,
        pageUrl: page.url,
        title: page.title,
        description: page.description,
      });
      assert.deepEqual(
        schema['@graph'].map((n) => n['@type']),
        ['WebSite', 'Person', 'WebPage', 'SoftwareSourceCode', 'BreadcrumbList'],
      );
      const sw = schema['@graph'][3];
      assert.equal(sw.codeRepository, page.entry.sourceUrl);
      assert.equal(sw.targetProduct['@type'], 'SoftwareApplication');
      assert.equal(sw.dateModified, page.entry.updatedAt);
      assert.equal(schema['@graph'][4].itemListElement.length, 3);
    } else {
      schema = buildArticleSchema({
        siteUrl: SITE_URL,
        lang: page.lang,
        pageUrl: page.url,
        title: page.title,
        description: page.description,
        datePublished: page.datePublished,
        dateModified: page.lastmod,
        kind: page.schemaKind,
      });
      if (page.schemaKind === 'TechArticle') {
        assert.deepEqual(
          schema['@graph'].map((n) => n['@type']),
          ['WebSite', 'Person', 'WebPage', 'TechArticle', 'BreadcrumbList'],
        );
      } else {
        assert.deepEqual(
          schema['@graph'].map((n) => n['@type']),
          ['WebSite', 'Person', 'AboutPage', 'BreadcrumbList'],
        );
      }
    }

    assert.equal(schema['@context'], SCHEMA_CONTEXT);
    assertNoDeprecatedTypes(schema);
    assertEveryUrlIsAbsoluteHttps(schema, page.url);

    // Every single-language page/entity node must declare exact `zh-Hans` on zh pages and `en` on en pages
    const expectedLang = page.lang === 'zh' ? 'zh-Hans' : 'en';
    const pageScopedTypes = new Set([
      'CollectionPage',
      'WebPage',
      'SoftwareSourceCode',
      'TechArticle',
      'AboutPage',
    ]);
    const scopedNodes = schema['@graph'].filter((n) => pageScopedTypes.has(n['@type']));
    assert.ok(scopedNodes.length >= 1);
    for (const node of scopedNodes) {
      assert.equal(
        node.inLanguage,
        expectedLang,
        `${page.url} (${node['@type']}) expected inLanguage="${expectedLang}", got "${node.inLanguage}"`,
      );
    }
  }

  // Also verify zh-CN / zh-Hans normalization produces `inLanguage: 'zh-Hans'` across all 4 builders
  const sampleEntry = INSTALLABLE_ENTRIES[0];
  for (const tag of ['zh-CN', 'zh-Hans']) {
    const homeZh = buildHomeSchema({ siteUrl: SITE_URL, lang: tag, data: entriesData });
    const secZh = buildSectionSchema({
      siteUrl: SITE_URL,
      lang: tag,
      section: 'nshm',
      entries: INSTALLABLE_ENTRIES,
    });
    const modZh = buildModuleSchema({ siteUrl: SITE_URL, lang: tag, entry: sampleEntry });
    const artZh = buildArticleSchema({ siteUrl: SITE_URL, lang: tag, kind: 'TechArticle', title: '发现' });
    const aboutZh = buildArticleSchema({ siteUrl: SITE_URL, lang: tag, kind: 'AboutPage', title: '关于' });

    assert.equal(homeZh['@graph'][2].inLanguage, 'zh-Hans');
    assert.equal(secZh['@graph'][2].inLanguage, 'zh-Hans');
    assert.equal(modZh['@graph'][2].inLanguage, 'zh-Hans');
    assert.equal(modZh['@graph'][3].inLanguage, 'zh-Hans');
    assert.equal(artZh['@graph'][2].inLanguage, 'zh-Hans');
    assert.equal(artZh['@graph'][3].inLanguage, 'zh-Hans');
    assert.equal(aboutZh['@graph'][2].inLanguage, 'zh-Hans');
  }
});
