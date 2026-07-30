# AQUA

AQUA is a CLI plus companion Skill for generating clean, modular TypeScript agent harness project bases.

It is intentionally practical:

- no fake protocol support;
- no hidden LLM client or credentials;
- no dashboard in the first release;
- generated projects include strict TypeScript, a manifest contract, harness seams, and smoke tests.

## Current status

Implemented:

- `@aqua/core` as the single deep module for project planning, writing, and validation.
- `aqua` CLI commands: `create`, `validate`, `doctor`, and `list presets`.
- Presets: `minimal`, `research-assistant`, and `coding-agent`.
- Companion Skill at `packages/skill-pack/aqua-project/SKILL.md`.
- Generated TypeScript harness seams:
  - `Agent`
  - `Tool`
  - `Workflow`
  - `TraceSink`
  - `ArtifactStore`
  - `PermissionPolicy`
  - `Verifier`
- Generated project contract at `.aqua/project.json`.
- Generated project smoke test and strict TypeScript config.

Not implemented yet:

- dashboard;
- MCP / A2A runtime adapters;
- parallel agent dispatch;
- embedded LLM client or credential storage.

Those capabilities are intentionally not faked.

## Build

```bash
pnpm install
node_modules/.bin/tsc -b packages/core apps/cli --pretty false
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

## Skill

The companion Skill is at `packages/skill-pack/aqua-project/SKILL.md`.

Install or copy that skill into a coding-agent environment, then ask it to create or evolve AQUA projects using the CLI and `.aqua/project.json` contract.

## Notes

The current Codex runtime pnpm wrapper may fail before running package scripts if registry supply-chain metadata cannot be fetched. In that environment, direct `tsc` plus `node --test` is the reliable source-code verification path.
