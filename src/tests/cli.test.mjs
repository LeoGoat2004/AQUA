import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const cli = path.resolve('apps/cli/dist/index.js');

test('cli creates and validates a research assistant project', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ts-agent-kit-cli-'));
  const target = path.join(root, 'research_app');
  try {
    const create = spawnSync(process.execPath, [cli, 'create', target, '--preset', 'research-assistant', '--force'], {
      encoding: 'utf8',
    });
    assert.equal(create.status, 0, create.stderr);
    assert.match(create.stdout, /Created TypeScript agent app/);

    const validate = spawnSync(process.execPath, [cli, 'validate', target], {
      encoding: 'utf8',
    });
    assert.equal(validate.status, 0, validate.stderr);
    assert.match(validate.stdout, /valid/);
    assert.doesNotMatch(validate.stdout, /echo/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
