import { rm } from 'node:fs/promises';

await Promise.all([
  rm('packages/core/dist', { recursive: true, force: true }),
  rm('apps/cli/dist', { recursive: true, force: true }),
  rm('.tmp', { recursive: true, force: true }),
]);
