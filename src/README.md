# AQUA

AQUA is a CLI plus companion Skill for generating clean, modular TypeScript agent harness project bases.

It is intentionally practical:

- no fake protocol support;
- no fake agent success path;
- no hidden LLM client or credentials;
- no dashboard in the first release;
- generated projects include strict TypeScript, a manifest contract, harness seams, and smoke tests.

## Current status

Implemented:

- `@aqua/core` as the single deep module for project planning, writing, and validation.
- `aqua` CLI commands: `create`, `validate`, `doctor`, and `list presets`.
- Presets: `minimal`, `research-assistant`, and `coding-agent`.
- Installable companion Skill at `../skill/SKILL.md`.
- Generated TypeScript harness seams:
  - `ModelProvider`
  - `Agent`
  - `Tool`
  - `Workflow`
  - `TraceSink`
  - `ArtifactStore`
  - `PermissionPolicy`
  - `Verifier`
- Generated project contract at `.aqua/project.json`.
- Generated project smoke test and strict TypeScript config.
- Honest default runtime behavior: generated apps fail with `MODEL_PROVIDER_NOT_CONFIGURED` until a real provider is injected.

Not implemented yet:

- dashboard;
- MCP / A2A runtime adapters;
- parallel agent dispatch;
- embedded LLM client or credential storage.

Those capabilities are intentionally not faked.

## Build

```bash
pnpm install
node_modules/.bin/tsc -b packages/core apps/cli --force --pretty false
node --test tests/*.test.mjs
```

## Use

```bash
node apps/cli/dist/index.js create ../my-agent-app --preset minimal
node apps/cli/dist/index.js validate ../my-agent-app
node apps/cli/dist/index.js doctor ../my-agent-app
```

Available presets:

```bash
node apps/cli/dist/index.js list presets
```

Generated projects should verify with:

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run smoke
```

Generated projects should fail honestly until configured:

```bash
pnpm run start -- "your input"
```

The expected first-run error is `MODEL_PROVIDER_NOT_CONFIGURED`. Do not replace this with a placeholder success response.

## Skill

The companion Skill is at `../skill/SKILL.md`.

Install or copy that skill into a coding-agent environment, then ask it to create or evolve AQUA projects using the CLI and `.aqua/project.json` contract.

The Skill is user-facing and intentionally stored at repository root, not in the TypeScript workspace.

## Notes

The current Codex runtime pnpm wrapper may fail before running package scripts if registry supply-chain metadata cannot be fetched. In that environment, direct `tsc` plus `node --test` is the reliable source-code verification path.
