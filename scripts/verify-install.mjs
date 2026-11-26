#!/usr/bin/env node
/**
 * Verify every `installable: true` entry in `data/entries.json` by running
 * its exact `installCommand` (`nsh add ...`) inside a fresh scratch app.
 *
 * Env:
 *   NSH_BIN   Path to `nsh` binary (defaults to `nsh` on PATH)
 *   NSH_HOME  Optional isolated `~/.nsh` directory
 *
 * Usage:
 *   node scripts/verify-install.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const NSH_BIN = process.env.NSH_BIN || 'nsh';
const TIMEOUT_MS = 120_000;

function runNsh(args, cwd) {
  return execFileSync(NSH_BIN, args, {
    cwd,
    env: process.env,
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function main() {
  const versionOut = runNsh(['--version'], process.cwd()).trim();
  console.log(`verify-install: using ${versionOut} (${NSH_BIN})`);

  const data = JSON.parse(fs.readFileSync('data/entries.json', 'utf8'));
  const entries = data.entries.filter((e) => e.installable);
  if (entries.length === 0) {
    throw new Error('no installable entries found in data/entries.json');
  }

  const scratchRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nsh-awesome-verify-'));
  let failures = 0;

  try {
    for (const entry of entries) {
      const cmd = String(entry.installCommand || '').trim();
      const parts = cmd.split(/\s+/);
      if (parts[0] !== 'nsh' || parts[1] !== 'add') {
        console.error(`FAIL ${entry.id}: invalid installCommand "${cmd}"`);
        failures++;
        continue;
      }
      const addArgs = parts.slice(1); // ['add', ...]

      const appDir = path.join(scratchRoot, entry.id);
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, 'nsh.json'),
        JSON.stringify({ name: 'scratch', version: '0.1.0' }, null, 2) + '\n',
      );
      fs.writeFileSync(path.join(appDir, 'App.tsx'), 'export default function App() { return null; }\n');

      const t0 = Date.now();
      try {
        runNsh(addArgs, appDir);
        const updatedCfg = JSON.parse(fs.readFileSync(path.join(appDir, 'nsh.json'), 'utf8'));
        const lockPath = path.join(appDir, 'nsh.lock');
        if (!fs.existsSync(lockPath)) {
          throw new Error('nsh.lock was not generated');
        }
        const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        const depsCount = Object.keys(updatedCfg.dependencies || {}).length;
        const pkg = (lock.packages || []).find((p) => p.name === entry.name);
        if (depsCount === 0 || !pkg) {
          throw new Error(`package "${entry.name}" missing from nsh.json dependencies or nsh.lock`);
        }
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`  PASS ${entry.id.padEnd(24)} ${pkg.version.padEnd(7)} (${elapsed}s) -> ${pkg.source}`);
      } catch (err) {
        failures++;
        const stderr = err.stderr ? String(err.stderr).trim() : err.message;
        console.error(`  FAIL ${entry.id}: ${cmd}\n       ${stderr}`);
      }
    }
  } finally {
    fs.rmSync(scratchRoot, { recursive: true, force: true });
  }

  console.log(`\nverify-install: ${entries.length - failures}/${entries.length} passed`);
  if (failures > 0) process.exit(1);
}

main();
