import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {
  SITE_URL,
  CONTENT_SIGNAL_POLICY,
  WEBMCP_TOOLS_META,
  buildRobotsTxt,
  buildLlmsTxt,
  buildLlmsFullTxt,
  buildAiCatalogJson,
  renderAiCatalogJson,
  buildPageMarkdown,
  renderAgenticHeadLinks,
  buildWebMcpSnippet,
} from './lib/seo-agentic.mjs';

const realData = JSON.parse(fs.readFileSync(new URL('../data/entries.json', import.meta.url), 'utf8'));
const vercelConfig = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

function cloneData(source = realData) {
  return JSON.parse(JSON.stringify(source));
}

function parseRobotsGroups(text) {
  const groups = [];
  const orphanSignals = [];
  const sitemaps = [];
  const agentmaps = [];
  let current = null;
  let inUaBlock = false;

  for (const rawLine of text.split(/\r\n|\n|\r/)) {
    const line = rawLine.split('#', 1)[0].trim();
    if (!line || !line.includes(':')) continue;
    const idx = line.indexOf(':');
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === 'user-agent') {
      if (!current || !inUaBlock) {
        current = { agents: [], signals: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value);
      inUaBlock = true;
      continue;
    }

    if (field === 'allow' || field === 'disallow') {
      inUaBlock = false;
    }

    if (field === 'sitemap') {
      sitemaps.push(value);
    } else if (field === 'agentmap') {
      agentmaps.push(value);
    } else if (!current) {
      if (field === 'content-signal') orphanSignals.push(value);
    } else if (field === 'content-signal') {
      current.signals.push(value);
    } else if (field === 'allow' || field === 'disallow') {
      current.rules.push([field, value]);
    }
  }

  return { groups, orphanSignals, sitemaps, agentmaps };
}

function assertCleanMarkdownStructure(md, label) {
  assert.ok(md.length > 80, `${label}: expected non-empty markdown`);
  assert.ok(!/\bundefined\b/.test(md), `${label}: leaked undefined`);
  assert.ok(!/\[object Object\]/.test(md), `${label}: leaked [object Object]`);

  const lines = md.split(/\r?\n/);
  let openFence = null;
  let h1Count = 0;
  let prevHeading = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const fenceMatch = trimmed.match(/^(`{3,})/);
    if (fenceMatch) {
      const tickLen = fenceMatch[1].length;
      if (openFence === null) {
        openFence = tickLen;
      } else if (trimmed === '`'.repeat(openFence)) {
        openFence = null;
      }
      continue;
    }
    if (openFence !== null) continue;

    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      if (level === 1) h1Count += 1;
      assert.ok(
        prevHeading === 0 || level <= prevHeading + 1,
        `${label}: skipped heading level H${prevHeading} -> H${level} at line ${i + 1}: ${line}`,
      );
      prevHeading = level;
    }
  }

  assert.equal(openFence, null, `${label}: unclosed code fence`);
  assert.equal(h1Count, 1, `${label}: expected exactly 1 H1, got ${h1Count}`);
}

function countUnescapedPipes(row) {
  let count = 0;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '|' && row[i - 1] !== '\\') count += 1;
  }
  return count;
}

function assertTablesBalanced(md, label) {
  const lines = md.split(/\r?\n/);
  let inTable = false;
  let expectedCols = 0;
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (line.startsWith('|')) {
      const cols = countUnescapedPipes(line);
      if (!inTable) {
        inTable = true;
        expectedCols = cols;
      } else {
        assert.equal(
          cols,
          expectedCols,
          `${label}: GFM table pipe mismatch on line ${i + 1} (expected ${expectedCols}, got ${cols}): ${line}`,
        );
      }
    } else {
      inTable = false;
      expectedCols = 0;
    }
  }
}

test('buildRobotsTxt declares RFC 9309 groups with Content-Signal and Allow: / in every group', () => {
  const robots = buildRobotsTxt({ siteUrl: 'https://nsh-awesome.vercel.app' });
  const parsed = parseRobotsGroups(robots);

  assert.deepEqual(parsed.orphanSignals, []);
  assert.deepEqual(parsed.sitemaps, [`${SITE_URL}sitemap.xml`]);
  assert.deepEqual(parsed.agentmaps, [`${SITE_URL}.well-known/ai-catalog.json`]);

  const expectedTokens = [
    '*',
    'Googlebot',
    'Applebot',
    'OAI-SearchBot',
    'Claude-SearchBot',
    'PerplexityBot',
    'ChatGPT-User',
    'Claude-User',
    'GPTBot',
    'ClaudeBot',
    'Google-Extended',
    'Applebot-Extended',
  ];

  const seenTokens = [];
  for (const group of parsed.groups) {
    assert.ok(group.agents.length > 0);
    for (const agent of group.agents) {
      assert.match(agent, /^\*$|^[A-Za-z_-]+$/, `Invalid RFC 9309 product token: ${agent}`);
      seenTokens.push(agent);
    }
    assert.deepEqual(
      group.signals,
      [CONTENT_SIGNAL_POLICY],
      `Group [${group.agents.join(', ')}] missing expected Content-Signal`,
    );
    assert.ok(
      group.rules.some(([field, val]) => field === 'allow' && val === '/'),
      `Group [${group.agents.join(', ')}] missing Allow: /`,
    );
  }

  for (const token of expectedTokens) {
    assert.ok(seenTokens.includes(token), `Missing User-agent group for ${token}`);
  }
  assert.equal(parsed.groups.length, expectedTokens.length);
});

test('buildLlmsTxt and buildLlmsFullTxt reflect baseline counts and stay synchronized with entries.json mutations', () => {
  const llmsBase = buildLlmsTxt({ siteUrl: SITE_URL, data: realData });
  const llmsFullBase = buildLlmsFullTxt({ siteUrl: SITE_URL, data: realData });

  assert.ok(llmsBase.startsWith('# Awesome NSH\n'));
  assert.ok(llmsBase.length >= 50 && Buffer.byteLength(llmsBase, 'utf8') < 100 * 1024);
  assert.ok(llmsFullBase.startsWith('# Awesome NSH — Full Reference\n'));
  assert.ok(llmsFullBase.length >= 50 && Buffer.byteLength(llmsFullBase, 'utf8') < 100 * 1024);

  // Baseline counts: 43 entries, 13 installable nshm, 19 framework crates, 7 crates.io / 5 github: / 1 Git rev
  assert.match(llmsBase, /catalog of 43 Native Shell \(nsh\) resources, including 13 installable nshm modules/);
  assert.match(llmsBase, /The 19 official `longbridge\/nsh` framework crates/);
  assert.match(llmsBase, /7 via crates\.io, 5 via `github:owner\/repo`, and 1 via Git URL `--rev`/);
  assert.match(llmsBase, /covering all 43 catalog entries/);
  assert.match(llmsBase, /not cross-platform on-device runtime builds/);

  assert.match(llmsFullBase, /\*\*Total curated entries:\*\* 43 \(13 installable `nshm`, 19 non-nshm framework crates, 4 examples\/templates, 7 guides\/docs\)/);
  assert.match(llmsFullBase, /\| `crates\.io` \| 7 \|/);
  assert.match(llmsFullBase, /\| `github:owner\/repo` \| 5 \|/);
  assert.match(llmsFullBase, /\| `Git URL --rev` \| 1 \|/);

  // Verify llmstxt.org H2 bullet hygiene & zero duplicate URLs
  const seenUrls = new Set();
  const sectionLines = llmsBase.split('\n');
  let inSections = false;
  for (const line of sectionLines) {
    if (line.startsWith('## ')) {
      inSections = true;
      continue;
    }
    if (!inSections || !line.trim()) continue;
    const match = line.match(/^- \[[^\]]+\]\((https?:\/\/[^)]+)\): .+$/);
    assert.ok(match, `Invalid llms.txt section item line: ${line}`);
    assert.equal(seenUrls.has(match[1]), false, `Duplicate URL in llms.txt: ${match[1]}`);
    seenUrls.add(match[1]);
  }

  // Mutation A: add 1 synthetic installable github nshm -> 44 total, 14 nshm, 19 framework, 7/6/1
  const addedData = cloneData();
  addedData.entries.push({
    id: 'nsh-synthetic-test',
    name: 'nsh-synthetic-test',
    section: 'nshm',
    category: 'ui',
    kind: 'rust-nshm',
    installable: true,
    sourceType: 'github',
    installCommand: 'nsh add github:example/nsh-synthetic-test',
    version: '0.1.0',
    nshVersion: '0.7.1',
    description: {
      en: 'Synthetic test nshm module for verifying dynamic count synchronization.',
      zh: '用于验证动态计数联动的测试 nshm 模块。',
    },
    sourceUrl: 'https://github.com/example/nsh-synthetic-test',
    cratesUrl: null,
    homepage: null,
    platforms: ['macOS', 'Linux'],
    license: 'MIT',
    updatedAt: '2026-11-27',
    notes: null,
  });

  const llmsAdded = buildLlmsTxt({ siteUrl: SITE_URL, data: addedData });
  const llmsFullAdded = buildLlmsFullTxt({ siteUrl: SITE_URL, data: addedData });
  assert.match(llmsAdded, /catalog of 44 Native Shell \(nsh\) resources, including 14 installable nshm modules/);
  assert.match(llmsAdded, /7 via crates\.io, 6 via `github:owner\/repo`, and 1 via Git URL `--rev`/);
  assert.match(llmsAdded, /covering all 44 catalog entries/);
  assert.ok(llmsAdded.includes('https://nsh-awesome.vercel.app/nshm/nsh-synthetic-test.md'));
  assert.ok(llmsAdded.includes('nsh add github:example/nsh-synthetic-test'));
  assert.match(llmsFullAdded, /\*\*Total curated entries:\*\* 44 \(14 installable `nshm`, 19 non-nshm framework crates/);
  assert.match(llmsFullAdded, /\| `github:owner\/repo` \| 6 \|/);

  // Mutation B: remove 1 crates.io nshm and 1 framework crate -> 41 total, 12 nshm, 18 framework, 6/5/1
  const removedData = cloneData();
  removedData.entries = removedData.entries.filter(
    (e) => e.id !== 'nsh-omarchy' && e.id !== 'crate-nsh-core',
  );

  const llmsRemoved = buildLlmsTxt({ siteUrl: SITE_URL, data: removedData });
  const llmsFullRemoved = buildLlmsFullTxt({ siteUrl: SITE_URL, data: removedData });
  assert.match(llmsRemoved, /catalog of 41 Native Shell \(nsh\) resources, including 12 installable nshm modules/);
  assert.match(llmsRemoved, /The 18 official `longbridge\/nsh` framework crates/);
  assert.match(llmsRemoved, /6 via crates\.io, 5 via `github:owner\/repo`, and 1 via Git URL `--rev`/);
  assert.match(llmsRemoved, /covering all 41 catalog entries/);
  assert.equal(llmsRemoved.includes('/nshm/nsh-omarchy.md'), false);
  assert.match(llmsFullRemoved, /\*\*Total curated entries:\*\* 41 \(12 installable `nshm`, 18 non-nshm framework crates/);
  assert.match(llmsFullRemoved, /\| `crates\.io` \| 6 \|/);
});

test('buildAiCatalogJson and renderAiCatalogJson produce valid ARD 1.0 JSON synchronized with entries.json', () => {
  const raw = renderAiCatalogJson({ siteUrl: SITE_URL, data: realData });
  const parsed = JSON.parse(raw);
  const built = buildAiCatalogJson({ siteUrl: SITE_URL, data: realData });

  assert.deepEqual(parsed, built);
  assert.deepEqual(Object.keys(parsed).sort(), ['entries', 'host', 'specVersion']);
  assert.equal(parsed.specVersion, '1.0');
  assert.equal('collections' in parsed, false);
  assert.equal(parsed.entries.length, 4);

  const installableCount = realData.entries.filter((e) => e.installable).length;
  assert.equal(installableCount, 13);

  const indexEntry = parsed.entries.find((e) => e.url === `${SITE_URL}index.json`);
  assert.ok(indexEntry);
  assert.ok(indexEntry.description.includes(`${realData.entries.length} Native Shell entries`));
  assert.ok(indexEntry.description.includes(`${installableCount} verified installable nshm modules`));

  const urnPattern = /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/;
  for (const item of parsed.entries) {
    assert.match(item.identifier, urnPattern);
    assert.ok(typeof item.displayName === 'string' && item.displayName.length > 0);
    assert.ok(typeof item.type === 'string' && item.type.includes('/'));
    assert.ok(typeof item.url === 'string' && item.url.startsWith('https://'));
    assert.equal('data' in item, false);
    assert.ok(Array.isArray(item.representativeQueries));
    assert.ok(item.representativeQueries.length >= 2 && item.representativeQueries.length <= 5);
    assert.match(item.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.deepEqual(item.trustManifest, { identity: SITE_URL, identityType: 'https' });
  }

  // Mutation: add 1 installable nshm & bump version -> catalog counts & version update
  const mutated = cloneData();
  mutated.nshVerifiedVersion = '0.8.0';
  mutated.entries.push({
    ...realData.entries[1],
    id: 'nsh-extra-test',
    name: 'nsh-extra-test',
    sourceUrl: 'https://github.com/example/nsh-extra-test',
    updatedAt: '2026-11-28',
  });
  const mutatedCatalog = JSON.parse(renderAiCatalogJson({ siteUrl: SITE_URL, data: mutated }));
  const mutatedIndex = mutatedCatalog.entries.find((e) => e.url === `${SITE_URL}index.json`);
  assert.ok(mutatedIndex.description.includes('44 Native Shell entries'));
  assert.ok(mutatedIndex.description.includes('14 verified installable nshm modules'));
  assert.ok(mutatedIndex.description.includes('nsh 0.8.0'));
  assert.ok(mutatedIndex.representativeQueries[0].includes('nsh 0.8.0'));
  assert.equal(mutatedIndex.updatedAt, '2026-11-28T00:00:00Z');
});

test('buildPageMarkdown emits well-formed bilingual Markdown and safely handles backticks, Chinese text, brackets, and pipes', () => {
  for (const lang of ['en', 'zh']) {
    const home = buildPageMarkdown({ siteUrl: SITE_URL, lang, pageType: 'home', data: realData });
    assertCleanMarkdownStructure(home, `home-${lang}`);
    assertTablesBalanced(home, `home-${lang}`);

    for (const sec of ['nshm', 'framework', 'templates', 'articles', 'guides']) {
      const hub = buildPageMarkdown({
        siteUrl: SITE_URL,
        lang,
        pageType: 'section',
        section: sec,
        data: realData,
      });
      assertCleanMarkdownStructure(hub, `section-${sec}-${lang}`);
      assertTablesBalanced(hub, `section-${sec}-${lang}`);
    }

    for (const entry of realData.entries.filter((e) => e.installable)) {
      const mod = buildPageMarkdown({
        siteUrl: SITE_URL,
        lang,
        pageType: 'module',
        entry,
        data: realData,
      });
      assertCleanMarkdownStructure(mod, `module-${entry.id}-${lang}`);
      assertTablesBalanced(mod, `module-${entry.id}-${lang}`);
    }

    const disc = buildPageMarkdown({ siteUrl: SITE_URL, lang, pageType: 'discovery', data: realData });
    assertCleanMarkdownStructure(disc, `discovery-${lang}`);
    assertTablesBalanced(disc, `discovery-${lang}`);

    const about = buildPageMarkdown({ siteUrl: SITE_URL, lang, pageType: 'about', data: realData });
    assertCleanMarkdownStructure(about, `about-${lang}`);
    assertTablesBalanced(about, `about-${lang}`);
  }

  // Adversarial titles & fields containing backticks, Chinese characters, brackets, pipes, and newlines
  const adversarial = cloneData();
  const trickyEntry = {
    id: 'nsh-tricky-title',
    name: '中文模块 `nsh-tricky` [实验版] | v1\n换行标题',
    section: 'nshm',
    category: 'ui',
    kind: 'rust-nshm',
    installable: true,
    sourceType: 'github',
    installCommand: 'nsh add github:example/tricky --features "`alpha`|beta"\n```fence```',
    version: '0.1.0-`beta`|1',
    nshVersion: '>=0.7.1',
    description: {
      en: 'Supports `backticks`, [brackets], and pipes | safely.',
      zh: '支持中文标题、`反引号`、[方括号] 与 | 管道符。',
    },
    sourceUrl: 'https://github.com/example/nsh-tricky',
    cratesUrl: null,
    homepage: null,
    platforms: ['macOS', 'Linux'],
    license: 'MIT | Apache-2.0',
    updatedAt: '2026-11-27',
    notes: {
      en: 'Includes `inline` code and | pipe.',
      zh: '包含 `内联代码` 与 | 管道符。',
    },
  };
  adversarial.entries.push(trickyEntry);
  adversarial.sections[0].title.zh = '可安装 `nshm` [精选] | 列表';

  for (const lang of ['en', 'zh']) {
    const modMd = buildPageMarkdown({
      siteUrl: SITE_URL,
      lang,
      pageType: 'module',
      entry: trickyEntry,
      data: adversarial,
    });
    assertCleanMarkdownStructure(modMd, `adversarial-module-${lang}`);
    assertTablesBalanced(modMd, `adversarial-module-${lang}`);
    assert.ok(modMd.startsWith('# 中文模块 `nsh-tricky` [实验版] | v1 换行标题\n'));
    assert.ok(modMd.includes('````bash\n'));

    const homeMd = buildPageMarkdown({
      siteUrl: SITE_URL,
      lang,
      pageType: 'home',
      data: adversarial,
    });
    assertCleanMarkdownStructure(homeMd, `adversarial-home-${lang}`);
    assertTablesBalanced(homeMd, `adversarial-home-${lang}`);
    assert.ok(
      homeMd.includes('[中文模块 `nsh-tricky` \\[实验版\\] | v1 换行标题]('),
      `Expected escaped link label in home-${lang}`,
    );
    assert.ok(
      homeMd.includes(
        '```` nsh add github:example/tricky --features "`alpha`|beta" ```fence``` ````',
      ),
      `Expected safely wrapped backtick command in home-${lang}`,
    );

    const discMd = buildPageMarkdown({
      siteUrl: SITE_URL,
      lang,
      pageType: 'discovery',
      data: adversarial,
    });
    assertCleanMarkdownStructure(discMd, `adversarial-discovery-${lang}`);
    assertTablesBalanced(discMd, `adversarial-discovery-${lang}`);
  }
});

test('renderAgenticHeadLinks and buildWebMcpSnippet behave cleanly across static and runtime VM checks', async () => {
  const head = renderAgenticHeadLinks({
    siteUrl: SITE_URL,
    markdownUrl: `${SITE_URL}index.md`,
  });
  assert.equal(
    head,
    '<link rel="ai-catalog" href="https://nsh-awesome.vercel.app/.well-known/ai-catalog.json">\n<link rel="alternate" type="text/markdown" href="https://nsh-awesome.vercel.app/index.md">',
  );

  const snippet = buildWebMcpSnippet();
  const wrapped = buildWebMcpSnippet({ wrapInScriptTag: true });
  assert.ok(wrapped.startsWith('<script>\n') && wrapped.endsWith('\n</script>'));
  assert.equal(WEBMCP_TOOLS_META.length, 2);
  assert.equal(/skip confirmation|no need to confirm|bypass/i.test(snippet), false);

  const registered = [];
  const mockWindow = {
    __NSH_AWESOME_CATALOG__: {
      nshVerifiedVersion: realData.nshVerifiedVersion,
      entries: realData.entries,
    },
    addEventListener() {},
  };
  const mockDocument = {
    modelContext: {
      registerTool(toolDef, opts) {
        registered.push({ toolDef, opts });
        return Promise.resolve();
      },
    },
    getElementById() {
      return null;
    },
  };
  const ctx = vm.createContext({
    window: mockWindow,
    document: mockDocument,
    navigator: {},
    AbortController,
    Promise,
    JSON,
    Array,
    Boolean,
    String,
  });
  vm.runInContext(snippet, ctx);

  assert.equal(registered.length, 2);
  for (const { toolDef, opts } of registered) {
    assert.equal(toolDef.annotations.readOnlyHint, true);
    assert.equal(toolDef.annotations.untrustedContentHint, false);
    assert.ok(opts?.signal instanceof AbortSignal);
    assert.equal(opts.signal.aborted, false);
    for (const paramSchema of Object.values(toolDef.inputSchema.properties)) {
      assert.ok(paramSchema.type && paramSchema.title && paramSchema.description);
    }
  }

  const searchTool = registered.find((r) => r.toolDef.name === 'search_nshm_modules').toolDef;
  const cmdTool = registered.find((r) => r.toolDef.name === 'get_nshm_install_command').toolDef;

  const searchOut = JSON.parse(
    (await searchTool.execute({ query: 'omarchy', installableOnly: true })).content[0].text,
  );
  assert.equal(searchOut.totalMatches, 1);
  assert.equal(searchOut.results[0].installCommand, 'nsh add nsh-omarchy');

  const coreOut = JSON.parse(
    (await cmdTool.execute({ idOrName: 'nsh-core' })).content[0].text,
  );
  assert.equal(coreOut.found, true);
  assert.equal(coreOut.installable, false);
  assert.match(coreOut.reason, /NOT an installable nshm/);

  mockWindow.__nshAwesomeWebMcp.dispose();
  assert.ok(registered.every((r) => r.opts.signal.aborted === true));
});

test('vercel.json enforces Astro static build, trailingSlash, security headers, CORS, and immutable _astro rules', () => {
  assert.equal(vercelConfig.framework, 'astro');
  assert.equal(vercelConfig.buildCommand, 'npm run build');
  assert.equal(vercelConfig.outputDirectory, 'dist');
  assert.equal(vercelConfig.trailingSlash, true);
  assert.equal(vercelConfig.rewrites, undefined);

  const astroAssetRule = vercelConfig.headers.find((r) => r.source === '/_astro/(.*)');
  assert.ok(astroAssetRule, 'Missing cache header rule for /_astro/(.*)');
  assert.ok(
    astroAssetRule.headers.some(
      (h) =>
        h.key.toLowerCase() === 'cache-control' &&
        h.value === 'public, max-age=31536000, immutable',
    ),
  );

  const globalRule = vercelConfig.headers.find((r) => r.source === '/(.*)');
  assert.ok(globalRule);
  const globalHeaders = new Map(globalRule.headers.map((h) => [h.key.toLowerCase(), h.value]));
  assert.equal(
    globalHeaders.get('strict-transport-security'),
    'max-age=63072000; includeSubDomains; preload',
  );
  assert.equal(globalHeaders.get('x-content-type-options'), 'nosniff');
  assert.equal(globalHeaders.get('x-frame-options'), 'DENY');
  assert.equal(globalHeaders.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(
    globalHeaders.get('permissions-policy'),
    'camera=(), microphone=(), geolocation=()',
  );

  const csp = globalHeaders.get('content-security-policy');
  assert.ok(csp);
  assert.match(csp, /script-src 'self' 'unsafe-inline'/);
  assert.match(csp, /connect-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);

  for (const rule of vercelConfig.headers) {
    assert.ok(!/:[a-zA-Z0-9_]+/.test(rule.source), `Avoid named params in header source: ${rule.source}`);
  }

  for (const corsPath of ['/index.json', '/count.json', '/.well-known/ai-catalog.json']) {
    const rule = vercelConfig.headers.find((r) => r.source === corsPath);
    assert.ok(rule, `Missing header rule for ${corsPath}`);
    assert.ok(
      rule.headers.some(
        (h) => h.key.toLowerCase() === 'access-control-allow-origin' && h.value === '*',
      ),
      `Missing CORS header on ${corsPath}`,
    );
  }

  const mdRule = vercelConfig.headers.find((r) => r.source === '/(.*)\\.md');
  assert.ok(mdRule);
  assert.ok(
    mdRule.headers.some(
      (h) =>
        h.key.toLowerCase() === 'content-type' && h.value === 'text/markdown; charset=utf-8',
    ),
  );

  for (const homePath of ['/', '/zh/']) {
    const rule = vercelConfig.headers.find((r) => r.source === homePath);
    assert.ok(rule);
    assert.ok(
      rule.headers.some(
        (h) =>
          h.key.toLowerCase() === 'link' &&
          h.value === '<https://nsh-awesome.vercel.app/.well-known/ai-catalog.json>; rel="ai-catalog"',
      ),
    );
  }
});
