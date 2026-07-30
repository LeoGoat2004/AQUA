import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createProjectPlan, normalizeCreateOptions, validateProject, writeProject } from '../packages/core/dist/index.js';

test('core creates a valid minimal project plan and writes contract files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ts-agent-kit-core-'));
  const target = path.join(root, 'demo');
  try {
    const options = normalizeCreateOptions({
      name: 'demo',
      directory: target,
      preset: 'minimal',
      harness: 'standalone',
      packageManager: 'pnpm',
      force: false,
    });
    const plan = createProjectPlan(options);
    await writeProject(plan, options);
    const manifest = JSON.parse(await readFile(path.join(target, '.ts-agent-kit/project.json'), 'utf8'));
    assert.equal(manifest.projectName, 'demo');
    assert.deepEqual(manifest.modules.agents, ['assistant']);
    assert.deepEqual(manifest.modules.tools, []);
    const validation = await validateProject(target);
    assert.equal(validation.valid, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('core rejects unsafe project names', () => {
  assert.throws(() => normalizeCreateOptions({ name: '../bad', directory: 'bad' }), /Project name/);
});
