import zlib from 'node:zlib';

/**
 * Extract files from an in-memory `.crate` (`.tar.gz`) buffer.
 * Returns a Map from relative path inside the crate root (e.g. `Cargo.toml`, `src/lib.rs`) to UTF-8 text.
 */
export function extractTarGzTexts(gzBuffer, wantedPaths = null) {
  const tar = zlib.gunzipSync(gzBuffer);
  const files = new Map();
  let offset = 0;

  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    // Two consecutive zero blocks mark end-of-archive.
    if (header.every((b) => b === 0)) break;

    const rawName = readTarString(header, 0, 100);
    const sizeStr = readTarString(header, 124, 12);
    const typeFlag = String.fromCharCode(header[156] || 48);
    const prefix = readTarString(header, 345, 155);
    const size = parseInt(sizeStr.trim() || '0', 8) || 0;
    const fullName = prefix ? `${prefix}/${rawName}` : rawName;

    offset += 512;
    const dataEnd = offset + size;
    const paddedSize = Math.ceil(size / 512) * 512;

    if ((typeFlag === '0' || typeFlag === '\0') && size >= 0) {
      const slashIdx = fullName.indexOf('/');
      const relPath = slashIdx >= 0 ? fullName.slice(slashIdx + 1) : fullName;
      if (!wantedPaths || wantedPaths.has(relPath)) {
        files.set(relPath, tar.subarray(offset, dataEnd).toString('utf8'));
      }
    }

    offset += paddedSize;
  }

  return files;
}

function readTarString(buf, start, len) {
  const slice = buf.subarray(start, start + len);
  const nul = slice.indexOf(0);
  return slice.subarray(0, nul === -1 ? len : nul).toString('utf8');
}

/**
 * Minimal TOML scanner tailored to Cargo.toml fields read by `nsh-cli`:
 * `[package]`, `[workspace.package]`, `[lib]`, `[dependencies]`, `[dependencies.nsh-core]`,
 * and `[workspace.dependencies]`.
 */
export function parseCargoTomlLite(text) {
  if (!text) return null;

  let currentTable = '';
  const result = {
    hasPackage: false,
    hasWorkspace: false,
    name: null,
    version: null,
    versionWorkspace: false,
    license: null,
    licenseWorkspace: false,
    repository: null,
    repositoryWorkspace: false,
    description: null,
    publish: null,
    keywords: [],
    libPath: 'src/lib.rs',
    nshCoreReq: null,
    nshCoreWorkspace: false,
    nshCliCoreReq: null,
    nshCliCoreWorkspace: false,
    workspacePackage: { version: null, license: null, repository: null },
    workspaceNshCoreReq: null,
  };

  const lines = text.split(/\r?\n/);
  let inKeywordsArray = false;
  let keywordsBuf = '';

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (inKeywordsArray) {
      keywordsBuf += ' ' + stripTomlComment(trimmed);
      if (keywordsBuf.includes(']')) {
        result.keywords = parseStringArray(keywordsBuf);
        inKeywordsArray = false;
        keywordsBuf = '';
      }
      continue;
    }

    if (trimmed.startsWith('[') && !trimmed.startsWith('[[')) {
      const end = trimmed.indexOf(']');
      if (end > 0) {
        currentTable = trimmed.slice(1, end).trim();
        if (currentTable === 'package') result.hasPackage = true;
        if (currentTable === 'workspace' || currentTable.startsWith('workspace.')) {
          result.hasWorkspace = true;
        }
      }
      continue;
    }
    if (trimmed.startsWith('[[')) {
      currentTable = trimmed;
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = stripTomlComment(trimmed.slice(eqIdx + 1)).trim();

    if (currentTable === 'package') {
      if (key === 'name') result.name = parseTomlString(val);
      else if (key === 'version') {
        if (val.replace(/\s+/g, '') === '{workspace=true}') result.versionWorkspace = true;
        else result.version = parseTomlString(val);
      } else if (key === 'version.workspace' && val === 'true') {
        result.versionWorkspace = true;
      } else if (key === 'license') {
        if (val.replace(/\s+/g, '') === '{workspace=true}') result.licenseWorkspace = true;
        else result.license = parseTomlString(val);
      } else if (key === 'license.workspace' && val === 'true') {
        result.licenseWorkspace = true;
      } else if (key === 'repository') {
        if (val.replace(/\s+/g, '') === '{workspace=true}') result.repositoryWorkspace = true;
        else result.repository = parseTomlString(val);
      } else if (key === 'repository.workspace' && val === 'true') {
        result.repositoryWorkspace = true;
      } else if (key === 'description') {
        result.description = parseTomlString(val);
      } else if (key === 'publish') {
        result.publish = val === 'false' ? false : val === 'true' ? true : null;
      } else if (key === 'keywords') {
        if (val.includes(']')) {
          result.keywords = parseStringArray(val);
        } else {
          inKeywordsArray = true;
          keywordsBuf = val;
        }
      }
    } else if (currentTable === 'workspace.package') {
      if (key === 'version') result.workspacePackage.version = parseTomlString(val);
      else if (key === 'license') result.workspacePackage.license = parseTomlString(val);
      else if (key === 'repository') result.workspacePackage.repository = parseTomlString(val);
    } else if (currentTable === 'lib') {
      if (key === 'path') {
        const p = parseTomlString(val);
        if (p) result.libPath = p;
      }
    } else if (currentTable === 'dependencies') {
      if (key === 'nsh-core.workspace' && val === 'true') {
        result.nshCoreWorkspace = true;
        result.nshCliCoreWorkspace = true;
      } else if (key === 'nsh-core') {
        if (!val.startsWith('{')) {
          const req = parseTomlString(val);
          result.nshCoreReq = req;
          result.nshCliCoreReq = req;
        } else if (val.replace(/\s+/g, '').includes('workspace=true')) {
          result.nshCoreWorkspace = true;
          result.nshCliCoreWorkspace = true;
        } else {
          const m = val.match(/\bversion\s*=\s*"([^"]+)"/);
          if (m) {
            result.nshCoreReq = m[1];
            result.nshCliCoreReq = m[1];
          }
        }
      }
    } else if (currentTable === 'dependencies.nsh-core') {
      // Cargo normalizes `[dependencies]` into `[dependencies.nsh-core]` on publish.
      // Note: nsh-cli <= 0.7.1 `nsh_core_requirement` only scans `[dependencies]`, not `[dependencies.nsh-core]`.
      if (key === 'version') {
        result.nshCoreReq = parseTomlString(val);
      } else if (key === 'workspace' && val === 'true') {
        result.nshCoreWorkspace = true;
      }
    } else if (currentTable === 'workspace.dependencies') {
      if (key === 'nsh-core') {
        if (!val.startsWith('{')) result.workspaceNshCoreReq = parseTomlString(val);
        else {
          const m = val.match(/\bversion\s*=\s*"([^"]+)"/);
          if (m) result.workspaceNshCoreReq = m[1];
        }
      }
    }
  }

  return result;
}

function stripTomlComment(s) {
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuote) {
      if (ch === '\\') {
        i++;
      } else if (ch === quoteChar) {
        inQuote = false;
      }
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === '#') {
        return s.slice(0, i);
      }
    }
  }
  return s;
}

function parseTomlString(val) {
  const m = val.match(/^"([^"]*)"/) || val.match(/^'([^']*)'/);
  return m ? m[1] : null;
}

function parseStringArray(val) {
  const out = [];
  for (const m of val.matchAll(/"([^"]+)"|'([^']+)'/g)) {
    out.push(m[1] ?? m[2]);
  }
  return out;
}

/**
 * Mirrors `crates/nsh-cli/src/rust_app.rs::specifier_of`.
 */
export function extractNativeModuleSpecifier(libRsText) {
  if (!libRsText) return null;
  for (const line of libRsText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('#[')) continue;
    const attr = trimmed.slice(2);
    const idx = attr.indexOf('native_module');
    if (idx < 0) continue;
    const rest = attr.slice(idx + 'native_module'.length).trimStart();
    if (!rest.startsWith('(')) continue;
    const afterParen = rest.slice(1).trimStart();
    if (!afterParen.startsWith('"')) continue;
    const endQuote = afterParen.indexOf('"', 1);
    if (endQuote < 0) continue;
    return afterParen.slice(1, endQuote);
  }
  return null;
}

/**
 * Evaluates Cargo/semver version requirement `req` against `target` (e.g. "0.7.1").
 */
export function satisfiesSemver(version, req) {
  if (!req || req.trim() === '*') return true;
  const ver = parseSemverTuple(version);
  if (!ver) return false;

  const clauses = req.split(',').map((s) => s.trim()).filter(Boolean);
  if (clauses.length === 0) return false;

  return clauses.every((clause) => matchClause(ver, clause));
}

function parseSemverTuple(v) {
  const clean = String(v).trim().replace(/^v/, '').split('-')[0];
  const parts = clean.split('.').map((x) => Number(x));
  if (parts.some((n) => !Number.isInteger(n) || n < 0)) return null;
  if (parts.length === 1) return [parts[0], 0, 0];
  if (parts.length === 2) return [parts[0], parts[1], 0];
  if (parts.length === 3) return parts;
  return null;
}

function cmpTuple(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function matchClause(ver, rawClause) {
  const c = rawClause.trim();
  if (c === '*') return true;
  if (c.startsWith('>=')) {
    const t = parseSemverTuple(c.slice(2));
    return t ? cmpTuple(ver, t) >= 0 : false;
  }
  if (c.startsWith('<=')) {
    const t = parseSemverTuple(c.slice(2));
    return t ? cmpTuple(ver, t) <= 0 : false;
  }
  if (c.startsWith('>')) {
    const t = parseSemverTuple(c.slice(1));
    return t ? cmpTuple(ver, t) > 0 : false;
  }
  if (c.startsWith('<')) {
    const t = parseSemverTuple(c.slice(1));
    return t ? cmpTuple(ver, t) < 0 : false;
  }
  if (c.startsWith('=')) {
    const raw = c.slice(1).trim();
    const parts = raw.split('.').map(Number);
    if (parts.length === 1) return ver[0] === parts[0];
    if (parts.length === 2) return ver[0] === parts[0] && ver[1] === parts[1];
    if (parts.length === 3) return ver[0] === parts[0] && ver[1] === parts[1] && ver[2] === parts[2];
    return false;
  }

  // Caret (`^x.y.z` or bare Cargo `x.y.z`) or tilde (`~x.y.z`).
  const isTilde = c.startsWith('~');
  const bare = (c.startsWith('^') || isTilde ? c.slice(1) : c).trim();
  const rawParts = bare.split('.');
  if (rawParts.some((x) => !/^\d+$/.test(x))) return false;
  const nums = rawParts.map(Number);
  const low = [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0];
  if (cmpTuple(ver, low) < 0) return false;

  let upper;
  if (isTilde) {
    upper = nums.length === 1 ? [low[0] + 1, 0, 0] : [low[0], low[1] + 1, 0];
  } else {
    // Cargo caret rules: first non-zero component defines upper bound.
    if (low[0] > 0) upper = [low[0] + 1, 0, 0];
    else if (low[1] > 0 || nums.length === 2) upper = [0, low[1] + 1, 0];
    else upper = [0, 0, low[2] + 1];
  }
  return cmpTuple(ver, upper) < 0;
}

/**
 * Evaluates whether a package directory/archive satisfies `nsh add` manifest rules
 * from `crates/nsh-cli/src/nshm/manifest.rs` against `targetNshVersion` (default `0.7.1`).
 */
export function evaluateNshmManifest({
  cargoTomlText = null,
  workspaceCargoTomlText = null,
  nshJsonText = null,
  libRsText = null,
  targetNshVersion = '0.7.1',
}) {
  const cargo = parseCargoTomlLite(cargoTomlText);
  const ws = workspaceCargoTomlText ? parseCargoTomlLite(workspaceCargoTomlText) : cargo?.hasWorkspace ? cargo : null;

  let nshJson = null;
  let nshJsonError = null;
  if (nshJsonText !== null) {
    try {
      nshJson = JSON.parse(nshJsonText);
    } catch (err) {
      nshJsonError = `nsh.json is not valid JSON: ${err.message}`;
    }
  }

  // Per manifest.rs: if Cargo.toml is present, nsh.json is only an nshm manifest
  // when it declares `"exports"` or `"platform"`.
  const activeConfig =
    nshJson && (!cargo || nshJson.exports !== undefined || nshJson.platform !== undefined)
      ? nshJson
      : null;

  let name = cargo?.name ?? activeConfig?.name ?? null;
  let version = cargo?.version ?? null;
  if (!version && cargo?.versionWorkspace && ws?.workspacePackage.version) {
    version = ws.workspacePackage.version;
  }
  if (!version && !cargo && activeConfig?.version) {
    version = activeConfig.version;
  }

  const specifier = cargo ? extractNativeModuleSpecifier(libRsText) : null;
  const platform = typeof activeConfig?.platform === 'string' ? activeConfig.platform : null;
  const exportsMap =
    activeConfig?.exports && typeof activeConfig.exports === 'object' && !Array.isArray(activeConfig.exports)
      ? activeConfig.exports
      : {};
  const exportKeys = Object.keys(exportsMap);

  let nshCoreReq = cargo?.nshCoreReq ?? null;
  if (!nshCoreReq && cargo?.nshCoreWorkspace && ws?.workspaceNshCoreReq) {
    nshCoreReq = ws.workspaceNshCoreReq;
  }
  let nshCliCoreReq = cargo?.nshCliCoreReq ?? null;
  if (!nshCliCoreReq && cargo?.nshCliCoreWorkspace && ws?.workspaceNshCoreReq) {
    nshCliCoreReq = ws.workspaceNshCoreReq;
  }
  const nshJsonReq = typeof activeConfig?.nsh === 'string' ? activeConfig.nsh : null;

  const reasons = [];
  if (nshJsonError) reasons.push(nshJsonError);
  if (!cargo && !activeConfig) {
    reasons.push('not an nshm: neither Cargo.toml nor nsh.json');
  } else if (cargo && !cargo.hasPackage) {
    reasons.push('Cargo.toml has no [package] section (virtual workspace root)');
  } else if (cargo && !specifier && !platform) {
    reasons.push('no #[native_module("...")] at the crate root');
  } else if (!cargo && activeConfig && exportKeys.length === 0) {
    reasons.push('nsh.json has no "exports" (not a TSX nshm)');
  }

  const isPackageName = typeof name === 'string' && /^[a-z0-9][a-z0-9_-]*$/.test(name);
  if ((cargo?.hasPackage || activeConfig) && !isPackageName) {
    reasons.push(`package name ${JSON.stringify(name)} is missing or invalid`);
  }

  // Semver checks against targetNshVersion.
  const coreCompatible = nshCoreReq ? satisfiesSemver(targetNshVersion, nshCoreReq) : true;
  const cliCoreCompatible = nshCliCoreReq ? satisfiesSemver(targetNshVersion, nshCliCoreReq) : true;
  const nshJsonCompatible = nshJsonReq ? satisfiesSemver(targetNshVersion, nshJsonReq) : true;

  if (!cliCoreCompatible) {
    reasons.push(`Cargo.toml nsh-core ${nshCliCoreReq} does not match nsh ${targetNshVersion}`);
  } else if (!coreCompatible) {
    reasons.push(`normalized Cargo.toml [dependencies.nsh-core] ${nshCoreReq} targets another nsh major version (bypassed by nsh-cli 0.7.1 parser)`);
  }
  if (!nshJsonCompatible) {
    reasons.push(`nsh.json "nsh": "${nshJsonReq}" does not match nsh ${targetNshVersion}`);
  }

  let kind = 'not-nshm';
  if (!cargo && activeConfig && exportKeys.length > 0 && isPackageName) {
    kind = 'tsx-nshm';
  } else if (cargo?.hasPackage && platform) {
    kind = 'platform-nshm';
  } else if (cargo?.hasPackage && specifier && exportKeys.length > 0) {
    kind = 'hybrid-nshm';
  } else if (cargo?.hasPackage && specifier) {
    kind = 'rust-nshm';
  }

  const cliWouldAdd =
    kind !== 'not-nshm' &&
    isPackageName &&
    Boolean(version) &&
    cliCoreCompatible &&
    nshJsonCompatible &&
    !nshJsonError;

  const cleanCompatible = cliWouldAdd && coreCompatible;

  const isApp = Boolean(
    cargo?.hasPackage &&
      ((nshJson && (nshJson.root !== undefined || nshJson.id !== undefined)) ||
        (cargo.publish === false && exportKeys.length === 0 && !platform && !cargo.keywords.includes('nshm'))),
  );

  return {
    name,
    version,
    kind,
    specifier,
    platform,
    exports: exportKeys,
    nshCoreReq,
    nshCliCoreReq,
    nshJsonReq,
    coreCompatible,
    cliCoreCompatible,
    nshJsonCompatible,
    cliWouldAdd,
    cleanCompatible,
    isApp,
    reasons,
    license: cargo?.license ?? null,
    keywords: cargo?.keywords ?? [],
    publish: cargo?.publish ?? null,
  };
}
