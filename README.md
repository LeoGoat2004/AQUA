# AQUA

AQUA is a CLI plus companion Skill for generating clean, modular TypeScript agent harness project bases in a user-selected directory.

This repository is under active hardening. The current generator is no longer allowed to fake agent success: generated applications fail with `MODEL_PROVIDER_NOT_CONFIGURED` until the developer injects a real `ModelProvider`.

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
- Installable companion Skill at `skill/SKILL.md`.
- Presets:
  - `minimal`
  - `research-assistant`
  - `coding-agent`
- Generated TypeScript agent harness seams:
  - `ModelProvider`
  - `Agent`
  - `Tool`
  - `Workflow`
  - `TraceSink`
  - `ArtifactStore`
  - `PermissionPolicy`
  - `Verifier`
- Generated project contract at `.aqua/project.json`.
- Generated project TypeScript config and smoke test.
- Honest default runtime behavior: `start` fails until a real model provider is configured.

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

Run the generated application:

```bash
pnpm run start -- "your input"
```

Expected first-run behavior is failure with `MODEL_PROVIDER_NOT_CONFIGURED`. That is intentional. The generated project is a real harness base, not a fake agent app. Implement or inject a real `ModelProvider` before treating the generated project as an application.

## Development verification

From `src/`:

```bash
node_modules/.bin/tsc -b packages/core apps/cli --force --pretty false
node --test tests/*.test.mjs
```

Note: in the current Codex runtime, the pnpm wrapper may fail before running package scripts if registry supply-chain metadata cannot be fetched. In that environment, direct `tsc` plus `node --test` is the reliable source-code verification path.

## Documentation

- Product vision: `src/docs/product/vision.md`
- Project contract: `src/docs/contracts/project-contract.md`
- Skill: `skill/SKILL.md`

## Engineering bar

AQUA must not pass tests by pretending that a placeholder agent solved a task. Smoke tests may use an explicit test model provider to verify harness wiring; production runtime must fail loudly when no real provider is configured.

## License

MIT
