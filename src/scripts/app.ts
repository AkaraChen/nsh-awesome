// Progressive enhancement for Awesome NSH static SSR pages

declare global {
  interface Window {
    __applyAwesomeTheme?: () => void;
    __NSH_AWESOME_CATALOG__?: any;
    __nshAwesomeWebMcp?: {
      controller: AbortController;
      dispose: () => void;
    };
  }
}

const isZh = (document.documentElement.lang || '').toLowerCase().startsWith('zh');
const liveEl = document.getElementById('live-status');

function announce(msg: string) {
  if (!liveEl) return;
  liveEl.textContent = '';
  setTimeout(() => {
    liveEl.textContent = msg;
  }, 20);
}

function updateThemeBtn() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.classList.contains('dark');
  const labelEl = btn.querySelector('[data-theme-label]');
  if (labelEl) {
    labelEl.textContent = isZh
      ? isDark
        ? '浅色模式'
        : '深色模式'
      : isDark
        ? 'Light mode'
        : 'Dark mode';
  }
  btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
}

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  updateThemeBtn();
  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.dataset.themePref = next;
    try {
      localStorage.setItem('nsh_awesome_theme', next);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    if (typeof window.__applyAwesomeTheme === 'function') {
      window.__applyAwesomeTheme();
    }
    updateThemeBtn();
  });
}

function fallbackCopy(text: string, cb: () => void) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    // Ignore fallback copy failure.
  }
  document.body.removeChild(ta);
  cb();
}

function handleCopy(btn: HTMLElement) {
  const text = btn.getAttribute('data-copy');
  if (!text) return;
  const labelEl = btn.querySelector('[data-copy-label]') || btn;
  const original = labelEl.textContent;
  const done = () => {
    labelEl.textContent = isZh ? '已复制' : 'Copied';
    btn.classList.add('is-copied');
    announce((isZh ? '已复制：' : 'Copied: ') + text);
    setTimeout(() => {
      labelEl.textContent = original;
      btn.classList.remove('is-copied');
    }, 1400);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

document.addEventListener('click', (ev) => {
  const target = ev.target as Element | null;
  const copyBtn = target?.closest<HTMLElement>('[data-copy]');
  if (copyBtn) {
    handleCopy(copyBtn);
  }
});

// Home catalog progressive filtering over SSR-rendered cards (zero initial fetch)
const catalogRoot = document.getElementById('catalog-root');
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const sourceSelect = document.getElementById('source-filter') as HTMLSelectElement | null;
const secWrap = document.getElementById('section-chips');
const catWrap = document.getElementById('category-chips');
const summaryEl = document.getElementById('results-summary');
const clearBtn = document.getElementById('clear-filters') as HTMLButtonElement | null;
const emptyEl = document.getElementById('empty-state');
const searchForm = document.getElementById('catalog-search-form') as HTMLFormElement | null;

if (catalogRoot && searchInput && sourceSelect) {
  const cards = Array.from(catalogRoot.querySelectorAll<HTMLElement>('article.card'));
  const sections = Array.from(catalogRoot.querySelectorAll<HTMLElement>('section.section-block'));
  const params = new URLSearchParams(location.search);
  const state = {
    section: 'all',
    category: 'all',
    source: params.get('source') || 'all',
    query: (params.get('q') || '').trim().toLowerCase(),
  };

  if (state.query) searchInput.value = (params.get('q') || '').trim();
  if (sourceSelect.querySelector(`option[value="${state.source.replace(/"/g, '')}"]`)) {
    sourceSelect.value = state.source;
  } else {
    state.source = 'all';
  }

  const syncUrl = () => {
    if (typeof history === 'undefined' || !history.replaceState) return;
    const nextParams = new URLSearchParams(location.search);
    if (state.query) nextParams.set('q', state.query);
    else nextParams.delete('q');
    if (state.source && state.source !== 'all') nextParams.set('source', state.source);
    else nextParams.delete('source');
    const qs = nextParams.toString();
    const nextUrl = location.pathname + (qs ? `?${qs}` : '') + location.hash;
    history.replaceState(null, '', nextUrl);
  };

  const applyFilters = (shouldSyncUrl: boolean) => {
    let visibleTotal = 0;

    for (const card of cards) {
      const sec = card.getAttribute('data-section') || '';
      const cat = card.getAttribute('data-category') || '';
      const src = card.getAttribute('data-source') || '';
      const hay = card.getAttribute('data-search') || '';
      let ok = true;
      if (state.section !== 'all' && sec !== state.section) ok = false;
      if (ok && state.category !== 'all' && cat !== state.category) ok = false;
      if (ok && state.source !== 'all' && src !== state.source) ok = false;
      if (ok && state.query && !hay.includes(state.query)) ok = false;
      card.hidden = !ok;
      if (ok) visibleTotal++;
    }

    for (const secEl of sections) {
      const secCards = secEl.querySelectorAll<HTMLElement>('article.card');
      let secVisible = 0;
      secCards.forEach((c) => {
        if (!c.hidden) secVisible++;
      });
      secEl.hidden = secVisible === 0;
      const countEl = secEl.querySelector('.section-count');
      if (countEl) countEl.textContent = String(secVisible);
    }

    if (secWrap) {
      secWrap.querySelectorAll<HTMLElement>('[data-section]').forEach((btn) => {
        const active = btn.getAttribute('data-section') === state.section;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    if (catWrap) {
      catWrap.querySelectorAll<HTMLElement>('[data-category]').forEach((btn) => {
        const catVal = btn.getAttribute('data-category');
        const ownerSec = btn.getAttribute('data-owner-section') || 'all';
        const allowed = catVal === 'all' || state.section === 'all' || ownerSec === state.section;
        btn.hidden = !allowed;
        const active = catVal === state.category;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    if (summaryEl) {
      summaryEl.textContent = isZh
        ? `当前展示 ${visibleTotal} / ${cards.length} 个条目`
        : `Showing ${visibleTotal} of ${cards.length} entries`;
    }

    if (emptyEl) emptyEl.hidden = visibleTotal > 0;
    if (clearBtn) {
      clearBtn.hidden = !(
        state.section !== 'all' ||
        state.category !== 'all' ||
        state.source !== 'all' ||
        state.query !== ''
      );
    }

    if (shouldSyncUrl) syncUrl();
  };

  secWrap?.addEventListener('click', (ev) => {
    const btn = (ev.target as Element | null)?.closest<HTMLElement>('[data-section]');
    if (!btn) return;
    state.section = btn.getAttribute('data-section') || 'all';
    state.category = 'all';
    applyFilters(false);
  });

  catWrap?.addEventListener('click', (ev) => {
    const btn = (ev.target as Element | null)?.closest<HTMLElement>('[data-category]');
    if (!btn) return;
    state.category = btn.getAttribute('data-category') || 'all';
    applyFilters(false);
  });

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim().toLowerCase();
    applyFilters(true);
  });

  sourceSelect.addEventListener('change', () => {
    state.source = sourceSelect.value || 'all';
    applyFilters(true);
  });

  searchForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    state.query = searchInput.value.trim().toLowerCase();
    state.source = sourceSelect.value || 'all';
    applyFilters(true);
  });

  clearBtn?.addEventListener('click', () => {
    state.section = 'all';
    state.category = 'all';
    state.source = 'all';
    state.query = '';
    searchInput.value = '';
    sourceSelect.value = 'all';
    applyFilters(true);
  });

  document.addEventListener('keydown', (ev) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (
      ev.key === '/' &&
      document.activeElement !== searchInput &&
      activeTag !== 'INPUT' &&
      activeTag !== 'TEXTAREA' &&
      activeTag !== 'SELECT' &&
      !ev.metaKey &&
      !ev.ctrlKey
    ) {
      ev.preventDefault();
      searchInput.focus();
    } else if (ev.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      state.query = '';
      searchInput.blur();
      applyFilters(true);
    }
  });

  applyFilters(false);
}

// Progressive-enhancement WebMCP read-only tools (lazy loads /index.json only when invoked)
(function registerWebMcpTools() {
  const docMc = (document as any).modelContext;
  const navMc = (navigator as any).modelContext;
  const mc = docMc || navMc;
  if (!mc || typeof mc.registerTool !== 'function') return;

  if (window.__nshAwesomeWebMcp?.dispose) {
    try {
      window.__nshAwesomeWebMcp.dispose();
    } catch {
      // Ignore cleanup failures.
    }
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const signal = controller ? controller.signal : undefined;

  if (controller) {
    window.__nshAwesomeWebMcp = {
      controller,
      dispose: () => controller.abort(),
    };
    window.addEventListener('pagehide', () => controller.abort(), { once: true });
  }

  function loadCatalog(): Promise<any> {
    if (window.__NSH_AWESOME_CATALOG__ && Array.isArray(window.__NSH_AWESOME_CATALOG__.entries)) {
      return Promise.resolve(window.__NSH_AWESOME_CATALOG__);
    }
    const embedded = document.getElementById('nsh-index-data');
    if (embedded?.textContent) {
      try {
        const parsed = JSON.parse(embedded.textContent);
        if (parsed && Array.isArray(parsed.entries)) {
          window.__NSH_AWESOME_CATALOG__ = parsed;
          return Promise.resolve(parsed);
        }
      } catch {
        // Ignore malformed inline data.
      }
    }
    if (typeof fetch === 'function') {
      return fetch('/index.json', { cache: 'default' })
        .then((res) => (res && res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.entries)) {
            window.__NSH_AWESOME_CATALOG__ = data;
            return data;
          }
          return null;
        })
        .catch(() => null);
    }
    return Promise.resolve(null);
  }

  function formatEntry(entry: any, lang: string) {
    const zh = typeof lang === 'string' && lang.toLowerCase().startsWith('zh');
    return {
      id: entry.id,
      name: entry.name,
      section: entry.section,
      category: entry.category,
      kind: entry.kind,
      installable: Boolean(entry.installable),
      sourceType: entry.sourceType,
      installCommand: entry.installCommand || null,
      version: entry.version || null,
      nshVersion: entry.nshVersion || null,
      platforms: Array.isArray(entry.platforms) ? entry.platforms : [],
      license: entry.license || null,
      updatedAt: entry.updatedAt || null,
      sourceUrl: entry.sourceUrl || null,
      cratesUrl: entry.cratesUrl || null,
      homepage: entry.homepage || null,
      description:
        (entry.description && (entry.description[zh ? 'zh' : 'en'] || entry.description.en)) || '',
      notes: (entry.notes && (entry.notes[zh ? 'zh' : 'en'] || entry.notes.en)) || null,
    };
  }

  const registerOpts = signal ? { signal } : undefined;

  Promise.resolve(
    mc.registerTool(
      {
        name: 'search_nshm_modules',
        title: 'Search Native Shell Modules',
        description:
          'Search and filter the curated Awesome NSH catalog of installable nshm modules, framework crates, templates, and documentation. Read-only lookup over static site catalog data.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              title: 'Search Query',
              description:
                'Optional keyword to match module name, ID, description, platform, license, or install command.',
            },
            section: {
              type: 'string',
              title: 'Catalog Section',
              description: 'Filter by top-level catalog section.',
              enum: ['all', 'nshm', 'framework', 'templates', 'articles'],
            },
            sourceType: {
              type: 'string',
              title: 'Distribution Source',
              description: 'Filter by package source type.',
              enum: ['all', 'crates.io', 'github', 'git', 'web'],
            },
            platform: {
              type: 'string',
              title: 'Target Platform',
              description:
                'Optional platform name filter such as macOS, iOS, Android, Linux, Windows, Web, GPUI, or HarmonyOS.',
            },
            installableOnly: {
              type: 'boolean',
              title: 'Installable Only',
              description: 'When true, return only modules verified as installable via nsh add.',
            },
            lang: {
              type: 'string',
              title: 'Language',
              description: 'Preferred language for descriptions and notes.',
              enum: ['en', 'zh'],
            },
          },
        },
        annotations: {
          readOnlyHint: true,
          untrustedContentHint: false,
        },
        execute: (input: any) => {
          const args = input && typeof input === 'object' ? input : {};
          const q = typeof args.query === 'string' ? args.query.trim().toLowerCase() : '';
          const section =
            typeof args.section === 'string' && args.section !== 'all' ? args.section : null;
          const sourceType =
            typeof args.sourceType === 'string' && args.sourceType !== 'all'
              ? args.sourceType
              : null;
          const platform = typeof args.platform === 'string' ? args.platform.trim().toLowerCase() : '';
          const installableOnly = Boolean(args.installableOnly);
          const lang = args.lang === 'zh' ? 'zh' : 'en';

          return loadCatalog().then((catalog) => {
            if (!catalog || !Array.isArray(catalog.entries)) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: 'Catalog data is unavailable on this page.',
                      results: [],
                    }),
                  },
                ],
              };
            }
            const matches = catalog.entries.filter((entry: any) => {
              if (installableOnly && !entry.installable) return false;
              if (section && entry.section !== section) return false;
              if (sourceType && entry.sourceType !== sourceType) return false;
              if (platform) {
                const plats = (entry.platforms || []).map((p: string) => String(p).toLowerCase());
                if (!plats.includes(platform) && !plats.includes('all')) return false;
              }
              if (q) {
                const hay = [
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
                if (!hay.includes(q)) return false;
              }
              return true;
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      nshVerifiedVersion: catalog.nshVerifiedVersion || '0.7.1',
                      totalMatches: matches.length,
                      results: matches.slice(0, 25).map((item: any) => formatEntry(item, lang)),
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          });
        },
      },
      registerOpts,
    ),
  ).catch(() => {});

  Promise.resolve(
    mc.registerTool(
      {
        name: 'get_nshm_install_command',
        title: 'Get Native Shell Module Install Command',
        description:
          'Return the verified nsh add install command and package metadata for a specific Awesome NSH entry by ID or package name, distinguishing installable nshm modules from non-installable framework crates.',
        inputSchema: {
          type: 'object',
          properties: {
            idOrName: {
              type: 'string',
              title: 'Module ID or Name',
              description:
                'Exact entry ID or package name (for example "nsh-omarchy", "nsh-widgets", or "nsh-core").',
            },
            lang: {
              type: 'string',
              title: 'Language',
              description: 'Preferred language for status notes and descriptions.',
              enum: ['en', 'zh'],
            },
          },
          required: ['idOrName'],
        },
        annotations: {
          readOnlyHint: true,
          untrustedContentHint: false,
        },
        execute: (input: any) => {
          const args = input && typeof input === 'object' ? input : {};
          const target = typeof args.idOrName === 'string' ? args.idOrName.trim().toLowerCase() : '';
          const lang = args.lang === 'zh' ? 'zh' : 'en';

          return loadCatalog().then((catalog) => {
            if (!catalog || !Array.isArray(catalog.entries)) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      found: false,
                      error: 'Catalog data is unavailable on this page.',
                    }),
                  },
                ],
              };
            }
            const found = catalog.entries.find(
              (entry: any) =>
                entry.id.toLowerCase() === target ||
                entry.name.toLowerCase() === target ||
                entry.id.toLowerCase() === `crate-${target}`,
            );
            if (!found) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        found: false,
                        query: args.idOrName || '',
                        message: 'No matching entry found in Awesome NSH catalog.',
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }
            const payload: Record<string, any> = formatEntry(found, lang);
            payload.found = true;
            payload.nshVerifiedVersion = catalog.nshVerifiedVersion || '0.7.1';
            if (!found.installable) {
              payload.reason =
                found.section === 'framework'
                  ? 'Official framework crate — NOT an installable nshm and cannot be installed with nsh add.'
                  : 'Template or documentation entry — not an installable nshm package.';
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(payload, null, 2),
                },
              ],
            };
          });
        },
      },
      registerOpts,
    ),
  ).catch(() => {});
})();
