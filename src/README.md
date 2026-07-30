# ts-agent-kit implementation workspace

This directory contains the TypeScript implementation workspace for the `ts-agent-kit` CLI.

The repository root is the publishable package root because the npm package must include both:

- the built CLI/core implementation from `src/`
- the installable Skill from `skills/ts-agent-kit/`

## Development commands

```bash
pnpm install
pnpm run build
pnpm test
pnpm run smoke
```

## Local CLI usage

```bash
node apps/cli/dist/index.js list presets
node apps/cli/dist/index.js create ../test_project --preset coding-agent --package-manager pnpm --force
node apps/cli/dist/index.js validate ../test_project
node apps/cli/dist/index.js doctor ../test_project
```

## Package verification

Run from the repository root:

```bash
pnpm pack
```

The package must include the built CLI, built core module, root `skills/ts-agent-kit/`, package metadata, README, and LICENSE. It must not include `node_modules`, `.tmp`, generated `test_project`, or source build caches.
