#!/usr/bin/env node
/**
 * Discover candidate Native Shell (NSH) modules (`nshm`) across crates.io,
 * GitHub code/topic search, and the official `longbridge/nsh-showcases` directory,
 * then validate each candidate statically against `nsh-cli`'s manifest rules.
 *
 * Usage:
 *   node scripts/discover.mjs [--json] [--out <file>] [--skip-tarballs] [--skip-github] [--target-nsh 0.7.1]
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { evaluateNshmManifest, extractTarGzTexts, parseCargoTomlLite } from './lib/manifest-check.mjs';

const args = process.argv.slice(2);
const flagJson = args.includes('--json');
const skipTarballs = args.includes('--skip-tarballs');
const skipGithub = args.includes('--skip-github');
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
const verIdx = args.indexOf('--target-nsh');
const targetNshVersion = verIdx >= 0 ? args[verIdx + 1] : '0.7.1';

const UA = 'nsh-awesome-discover/1.0 (https://github.com/AkaraChen/nsh-awesome)';
const OFFICIAL_REPO = 'https://github.com/longbridge/nsh';
const DATA_CRATES = new Set(['supernsh-icons-data-1', 'supernsh-icons-data-2', 'supernsh-icons-data-3']);
const UNRELATED_NAMES = new Set(['nsh', 'packet-dissector-nsh', 'bamboo-tui', 'json-schema-editor']);

function resolveGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const GH_TOKEN = skipGithub ? '' : resolveGithubToken();

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, ...headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}: ${body.slice(0, 160)}`);
  }
  return res.json();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function ghHeaders(raw = false) {
  const h = {
    Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GH_TOKEN) h.Authorization = `Bearer ${GH_TOKEN}`;
  return h;
}

async function ghRaw(repo, filePath) {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: ghHeaders(true),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return null;
  return res.text();
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function queryCratesKeyword(keyword) {
  const all = [];
  let page = 1;
  let total = 0;
  while (true) {
    const data = await fetchJson(
      `https://crates.io/api/v1/crates?keyword=${encodeURIComponent(keyword)}&per_page=100&page=${page}`,
    );
    total = data.meta?.total ?? all.length;
    const batch = data.crates ?? [];
    all.push(...batch);
    if (batch.length < 100 || all.length >= total) break;
    page++;
  }
  return { total, crates: all };
}

async function queryReverseDeps(crateName) {
  const names = [];
  let page = 1;
  let total = 0;
  while (true) {
    const data = await fetchJson(
      `https://crates.io/api/v1/crates/${encodeURIComponent(crateName)}/reverse_dependencies?per_page=100&page=${page}`,
    );
    total = data.meta?.total ?? names.length;
    const versions = data.versions ?? [];
    for (const v of versions) names.push({ name: v.crate, num: v.num });
    if (versions.length < 100 || names.length >= total) break;
    page++;
  }
  return { total, items: names };
}

function normUrl(u) {
  return String(u || '')
    .trim()
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

function loadExistingEntries() {
  if (!fs.existsSync('data/entries.json')) return { byName: new Set(), bySource: new Set() };
  const doc = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  const byName = new Set();
  const bySource = new Set();
  for (const e of doc.entries ?? []) {
    byName.add(e.name);
    byName.add(e.id);
    if (e.sourceUrl) bySource.add(normUrl(e.sourceUrl));
    if (e.cratesUrl) bySource.add(normUrl(e.cratesUrl));
  }
  return { byName, bySource };
}

function isIconPackSubcrate(name) {
  return (
    (name.startsWith('nsh-icon-') && name !== 'nsh-icon') ||
    (name.startsWith('supernsh-icons-') && name !== 'supernsh-icons')
  );
}

async function main() {
  const existing = loadExistingEntries();
  const channels = {};
  const crateMap = new Map();

  // Channel 1 & 3: crates.io keyword queries
  for (const kw of ['nshm', 'nsh', 'native-shell']) {
    const res = await queryCratesKeyword(kw);
    channels[`crates_keyword_${kw.replaceAll('-', '_')}`] = {
      totalReported: res.total,
      fetched: res.crates.length,
    };
    for (const c of res.crates) {
      if (UNRELATED_NAMES.has(c.id)) continue;
      const prev = crateMap.get(c.id) ?? { sources: new Set(), crate: c };
      prev.sources.add(`crates:keyword=${kw}`);
      prev.crate = c;
      crateMap.set(c.id, prev);
    }
  }

  // Channel 2: crates.io reverse dependencies of nsh-core
  const rev = await queryReverseDeps('nsh-core');
  channels.crates_reverse_deps_nsh_core = {
    totalReported: rev.total,
    fetched: rev.items.length,
  };
  const missingMeta = [];
  for (const item of rev.items) {
    if (UNRELATED_NAMES.has(item.name)) continue;
    const prev = crateMap.get(item.name);
    if (prev) {
      prev.sources.add('crates:revdep=nsh-core');
    } else {
      missingMeta.push(item.name);
    }
  }
  await mapLimit(missingMeta, 4, async (name) => {
    try {
      const data = await fetchJson(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`);
      crateMap.set(name, { sources: new Set(['crates:revdep=nsh-core']), crate: data.crate });
    } catch (err) {
      if (!flagJson) console.warn(`warn: failed metadata for ${name}: ${err.message}`);
    }
  });

  // Channel 4 & 5: GitHub searches + longbridge/nsh-showcases
  const githubCandidates = new Map(); // owner/repo -> { sources: Set, meta? }
  const addGhRepo = (fullName, sourceLabel) => {
    if (!fullName || !fullName.includes('/')) return;
    if (fullName === 'longbridge/nsh' || fullName === 'longbridge/nsh-compat') return;
    const entry = githubCandidates.get(fullName) ?? { fullName, sources: new Set() };
    entry.sources.add(sourceLabel);
    githubCandidates.set(fullName, entry);
  };

  // Channel 5 works even without GH_TOKEN (unless rate-limited).
  if (!skipGithub) {
    try {
      const tree = await fetchJson(
        'https://api.github.com/repos/longbridge/nsh-showcases/git/trees/HEAD?recursive=1',
        ghHeaders(),
      );
      const manifests = (tree.tree ?? [])
        .map((t) => t.path)
        .filter((p) => p.startsWith('directory/') && p.endsWith('/manifest.json'));
      channels.nsh_showcases_directory = { totalReported: manifests.length };
      await mapLimit(manifests, 4, async (p) => {
        const raw = await ghRaw('longbridge/nsh-showcases', p);
        if (!raw) return;
        try {
          const m = JSON.parse(raw);
          const match = String(m.source || '').match(/^https:\/\/github\.com\/([^/]+\/[^/]+)/);
          if (match) addGhRepo(match[1].replace(/\.git$/, ''), 'nsh.dev/directory');
        } catch {
          // ignore malformed manifest
        }
      });
    } catch (err) {
      channels.nsh_showcases_directory = { error: err.message };
    }
  }

  if (!skipGithub && GH_TOKEN) {
    // Topic searches
    for (const topic of ['nshm', 'nsh', 'native-shell']) {
      try {
        const res = await fetchJson(
          `https://api.github.com/search/repositories?q=topic:${topic}&per_page=100`,
          ghHeaders(),
        );
        const items = res.items ?? [];
        const nshFiltered = items.filter((r) => {
          if (topic !== 'nsh') return true;
          const text = `${r.full_name} ${r.description || ''}`;
          return /\b(nsh|nshm|native shell)\b/i.test(text) && !/rfc\s*8300/i.test(text);
        });
        channels[`github_topic_${topic.replaceAll('-', '_')}`] = {
          totalReported: res.total_count ?? items.length,
          filteredNshRelated: nshFiltered.length,
        };
        for (const r of nshFiltered) addGhRepo(r.full_name, `gh:topic=${topic}`);
      } catch (err) {
        channels[`github_topic_${topic.replaceAll('-', '_')}`] = { error: err.message };
      }
    }

    // Code searches
    const codeQueries = [
      { key: 'github_code_nsh_json_exports', q: 'filename:nsh.json "exports"' },
      { key: 'github_code_nsh_json_platform', q: 'filename:nsh.json "platform"' },
      { key: 'github_code_cargo_nshm', q: '"keywords" "nshm" filename:Cargo.toml' },
    ];
    for (const cq of codeQueries) {
      try {
        const res = await fetchJson(
          `https://api.github.com/search/code?q=${encodeURIComponent(cq.q)}&per_page=100`,
          ghHeaders(),
        );
        const items = res.items ?? [];
        const repos = new Set();
        for (const it of items) {
          // Filter out obvious false positives (xonsh.json, *ansh.json, etc.)
          if (cq.key.includes('nsh_json') && !it.path.endsWith('/nsh.json') && it.path !== 'nsh.json') {
            continue;
          }
          repos.add(it.repository.full_name);
          addGhRepo(it.repository.full_name, `gh:code=${cq.key}`);
        }
        channels[cq.key] = {
          totalReported: res.total_count ?? items.length,
          exactPathRepos: repos.size,
        };
      } catch (err) {
        channels[cq.key] = { error: err.message };
      }
    }
  } else if (!skipGithub) {
    channels.github_search = { skipped: 'Set GITHUB_TOKEN or authenticate gh CLI to run GitHub code/topic searches' };
  }

  // Channel 6: Enumerate public repos of GitHub organizations discovered from crates.io
  // (critical because GitHub Code Search does not index newly created orgs like SuperNSH).
  if (!skipGithub) {
    const ownerCounts = new Map();
    for (const { crate } of crateMap.values()) {
      const m = String(crate.repository || '').match(/^https:\/\/github\.com\/([^/]+)\/[^/]+/i);
      if (!m) continue;
      const owner = m[1];
      if (owner.toLowerCase() === 'longbridge') continue;
      ownerCounts.set(owner, (ownerCounts.get(owner) ?? 0) + 1);
    }
    const orgReposDiscovered = [];
    for (const [owner, count] of ownerCounts.entries()) {
      if (count < 2) continue;
      try {
        const ownerInfo = await fetchJson(`https://api.github.com/users/${owner}`, ghHeaders());
        if (ownerInfo.type !== 'Organization') continue;
        const repos = await fetchJson(
          `https://api.github.com/orgs/${owner}/repos?per_page=100`,
          ghHeaders(),
        );
        for (const r of repos) {
          if (r.archived || r.fork) continue;
          addGhRepo(r.full_name, `gh:org=${owner}`);
          orgReposDiscovered.push(r.full_name);
        }
      } catch {
        // ignore org lookup errors
      }
    }
    channels.github_crates_orgs = {
      orgsChecked: [...ownerCounts.entries()].filter(([, c]) => c >= 2).map(([o]) => o),
      reposDiscovered: orgReposDiscovered.length,
    };
  }

  // Inspect crates.io candidates
  const cratesToInspect = [...crateMap.entries()].map(([name, info]) => ({ name, ...info }));
  const crateFindings = await mapLimit(cratesToInspect, 6, async ({ name, sources, crate }) => {
    const repo = crate.repository || '';
    const isOfficial = normUrl(repo) === normUrl(OFFICIAL_REPO);
    const baseRecord = {
      sourceRegistry: 'crates.io',
      name,
      version: crate.max_version,
      repository: repo || null,
      cratesUrl: `https://crates.io/crates/${name}`,
      updatedAt: (crate.updated_at || '').slice(0, 10),
      downloads: crate.downloads ?? 0,
      keywords: crate.keywords ?? [],
      discoveredVia: [...sources].sort(),
      isOfficialRepo: isOfficial,
      isIconPackSubcrate: isIconPackSubcrate(name),
      isDataCrate: DATA_CRATES.has(name),
      alreadyListed: existing.byName.has(name) || existing.bySource.has(normUrl(repo)),
    };

    if (DATA_CRATES.has(name)) {
      return { ...baseRecord, classification: 'data-crate', cliWouldAdd: false, cleanCompatible: false };
    }
    if (isOfficial && name !== 'nsh-extra') {
      return { ...baseRecord, classification: 'framework-crate', cliWouldAdd: false, cleanCompatible: false };
    }
    if (skipTarballs) {
      return { ...baseRecord, classification: 'unchecked-tarball' };
    }

    try {
      const url = `https://static.crates.io/crates/${name}/${name}-${crate.max_version}.crate`;
      const gz = await fetchBuffer(url);
      const texts = extractTarGzTexts(gz);
      const cargoTomlText = texts.get('Cargo.toml') ?? null;
      const cargoLite = parseCargoTomlLite(cargoTomlText);
      const libPath = cargoLite?.libPath || 'src/lib.rs';
      const libRsText = texts.get(libPath) ?? null;
      const nshJsonText = texts.get('nsh.json') ?? null;
      const evaluation = evaluateNshmManifest({
        cargoTomlText,
        nshJsonText,
        libRsText,
        targetNshVersion,
      });

      const classification = evaluation.kind === 'not-nshm'
        ? 'not-nshm'
        : baseRecord.isIconPackSubcrate
          ? 'icon-pack-subcrate'
          : evaluation.kind;

      return {
        ...baseRecord,
        classification,
        specifier: evaluation.specifier,
        platform: evaluation.platform,
        exports: evaluation.exports,
        nshCoreReq: evaluation.nshCoreReq,
        nshCliCoreReq: evaluation.nshCliCoreReq,
        nshJsonReq: evaluation.nshJsonReq,
        coreCompatible: evaluation.coreCompatible,
        cliWouldAdd: evaluation.cliWouldAdd,
        cleanCompatible: evaluation.cleanCompatible,
        reasons: evaluation.reasons,
        license: evaluation.license,
      };
    } catch (err) {
      return { ...baseRecord, classification: 'tarball-error', error: err.message };
    }
  });

  // Inspect GitHub repo candidates (root manifest check)
  const ghList = [...githubCandidates.values()];
  const ghFindings = await mapLimit(ghList, 4, async ({ fullName, sources }) => {
    const [cargoTomlText, nshJsonText] = await Promise.all([
      ghRaw(fullName, 'Cargo.toml'),
      ghRaw(fullName, 'nsh.json'),
    ]);
    const cargoLite = parseCargoTomlLite(cargoTomlText);
    const libPath = cargoLite?.libPath || 'src/lib.rs';
    const libRsText = cargoLite?.hasPackage ? await ghRaw(fullName, libPath) : null;
    const evaluation = evaluateNshmManifest({
      cargoTomlText,
      nshJsonText,
      libRsText,
      targetNshVersion,
    });

    let repoMeta = null;
    try {
      repoMeta = await fetchJson(`https://api.github.com/repos/${fullName}`, ghHeaders());
    } catch {
      repoMeta = null;
    }

    const repoUrl = `https://github.com/${fullName}`;
    return {
      sourceRegistry: 'github',
      fullName,
      name: evaluation.name || fullName.split('/')[1],
      version: evaluation.version,
      repository: repoUrl,
      discoveredVia: [...sources].sort(),
      stars: repoMeta?.stargazers_count ?? null,
      archived: repoMeta?.archived ?? false,
      license: evaluation.license || repoMeta?.license?.spdx_id || null,
      updatedAt: (repoMeta?.pushed_at || '').slice(0, 10) || null,
      classification: evaluation.kind,
      specifier: evaluation.specifier,
      platform: evaluation.platform,
      exports: evaluation.exports,
      nshCoreReq: evaluation.nshCoreReq,
      nshJsonReq: evaluation.nshJsonReq,
      coreCompatible: evaluation.coreCompatible,
      cliWouldAdd: evaluation.cliWouldAdd,
      cleanCompatible: evaluation.cleanCompatible,
      isApp: evaluation.isApp,
      publish: evaluation.publish,
      reasons: evaluation.reasons,
      alreadyListed:
        existing.bySource.has(normUrl(repoUrl)) ||
        (evaluation.name ? existing.byName.has(evaluation.name) : false),
    };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    targetNshVersion,
    channels,
    cratesSummary: {
      totalUnique: crateFindings.length,
      cleanInstallableNshm: crateFindings.filter((c) => c.cleanCompatible && !c.isIconPackSubcrate).length,
      iconPackSubcrates: crateFindings.filter((c) => c.isIconPackSubcrate).length,
      cliBypass06Crates: crateFindings.filter((c) => c.cliWouldAdd && !c.coreCompatible).length,
      incompatibleNshm: crateFindings.filter((c) => c.classification !== 'not-nshm' && c.classification !== 'framework-crate' && c.classification !== 'data-crate' && !c.cliWouldAdd).length,
      frameworkCrates: crateFindings.filter((c) => c.classification === 'framework-crate').length,
      notNshmOrHelperCrates: crateFindings.filter((c) => c.classification === 'not-nshm').length,
    },
    githubSummary: {
      totalUniqueRepos: ghFindings.length,
      cleanInstallableNshm: ghFindings.filter((g) => g.cleanCompatible && !g.isApp).length,
      incompatibleVersionNshm: ghFindings.filter((g) => g.classification !== 'not-nshm' && !g.isApp && !g.cliWouldAdd).length,
      appOrTemplateWithNativeModule: ghFindings.filter((g) => g.classification !== 'not-nshm' && g.isApp).length,
      notNshmRoot: ghFindings.filter((g) => g.classification === 'not-nshm').length,
    },
  };

  const report = { summary, crates: crateFindings, github: ghFindings };
  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  }

  if (flagJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`NSH Module Discovery Report (target nsh ${targetNshVersion})`);
  console.log('='.repeat(62));
  console.log('\nDiscovery Channels:');
  for (const [k, v] of Object.entries(channels)) {
    console.log(`  - ${k}: ${JSON.stringify(v)}`);
  }
  console.log('\ncrates.io Breakdown:');
  console.log(`  Unique crates inspected:         ${summary.cratesSummary.totalUnique}`);
  console.log(`  Clean 0.7-compatible nshm:       ${summary.cratesSummary.cleanInstallableNshm}`);
  console.log(`  Icon-set companion nshms:        ${summary.cratesSummary.iconPackSubcrates}`);
  console.log(`  0.6-pinned (normalized Cargo):   ${summary.cratesSummary.cliBypass06Crates}`);
  console.log(`  Version-incompatible nshm:       ${summary.cratesSummary.incompatibleNshm}`);
  console.log(`  Official framework crates:       ${summary.cratesSummary.frameworkCrates}`);
  console.log(`  Helper/non-nshm crates:          ${summary.cratesSummary.notNshmOrHelperCrates}`);

  console.log('\nClean 0.7-compatible crates.io nshms (excluding icon-pack subcrates):');
  for (const c of crateFindings.filter((x) => x.cleanCompatible && !x.isIconPackSubcrate)) {
    console.log(`  + ${c.name}@${c.version} [${c.classification}] nsh-core=${c.nshCoreReq ?? '-'} listed=${c.alreadyListed}`);
  }

  console.log('\nGitHub Repos Breakdown:');
  console.log(`  Unique repos inspected:          ${summary.githubSummary.totalUniqueRepos}`);
  console.log(`  Clean 0.7-compatible nshms:      ${summary.githubSummary.cleanInstallableNshm}`);
  console.log(`  Version-incompatible nshms:      ${summary.githubSummary.incompatibleVersionNshm}`);
  console.log(`  App/starter (publish=false):     ${summary.githubSummary.appOrTemplateWithNativeModule}`);
  console.log(`  Non-nshm roots (apps/tools):     ${summary.githubSummary.notNshmRoot}`);

  console.log('\nClean 0.7-compatible GitHub nshms:');
  for (const g of ghFindings.filter((x) => x.cleanCompatible && !x.isApp)) {
    console.log(`  + ${g.fullName} -> ${g.name}@${g.version ?? '?'} [${g.classification}] nsh-core=${g.nshCoreReq ?? '-'} nsh=${g.nshJsonReq ?? '-'} listed=${g.alreadyListed}`);
  }

  if (outPath) console.log(`\nWrote full JSON report to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
