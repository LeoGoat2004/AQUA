# AQUA

AQUA is a CLI plus companion Skill for generating clean, modular TypeScript agent harness project bases in a user-selected directory.

The repository root is this directory. The implementation lives under `src/`.

## Current status

Implemented:

- Clean TypeScript workspace under `src/`.
- `@aqua/core` as the single project planning, writing, and validation module.
- `aqua` CLI commands:
  - `create`
  - `validate`
  - `doctor`
  - `list presets`
- Companion Skill at `src/packages/skill-pack/aqua-project/SKILL.md`.
- Presets:
  - `minimal`
  - `research-assistant`
  - `coding-agent`
- Generated TypeScript agent harness seams:
  - `Agent`
  - `Tool`
  - `Workflow`
  - `TraceSink`
  - `ArtifactStore`
  - `PermissionPolicy`
  - `Verifier`
- Generated project contract at `.aqua/project.json`.
- Generated project TypeScript config and smoke test.

Not implemented yet:

- dashboard;
- MCP / A2A runtime adapters;
- parallel agent dispatch;
- embedded LLM client or credential storage.

Those capabilities are intentionally not faked. They should be added only after a real adapter or runtime implementation is available and verified.

## Quick start

```bash
cd src
pnpm install
node apps/cli/dist/index.js create ../my-agent-app --preset minimal --package-manager pnpm
node apps/cli/dist/index.js validate ../my-agent-app
node apps/cli/dist/index.js doctor ../my-agent-app
```

Then verify the generated project:

```bash
cd ../my-agent-app
pnpm install
pnpm run typecheck
pnpm test
pnpm run smoke
```

## Development verification

From `src/`:

```bash
node_modules/.bin/tsc -b packages/core apps/cli --pretty false
node --test tests/*.test.mjs
```

Note: in the current Codex runtime, the pnpm wrapper may fail before running package scripts if registry supply-chain metadata cannot be fetched. In that environment, direct `tsc` plus `node --test` is the reliable source-code verification path.

## Documentation

- Product vision: `src/docs/product/vision.md`
- Project contract: `src/docs/contracts/project-contract.md`
- Skill: `src/packages/skill-pack/aqua-project/SKILL.md`

## License

MIT
