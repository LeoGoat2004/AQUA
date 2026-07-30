# AQUA Product Vision

AQUA is a CLI plus companion Skill for creating modular TypeScript agent harness project bases.

The product is not a general hosted agent platform. It generates practical source code that users can immediately own, inspect, typecheck, test, and extend for a chosen application scenario.

## First release scope

- `aqua create` creates a complete TypeScript project base.
- `aqua validate` checks the project contract and expected files.
- `aqua doctor` explains verification commands and adapter caveats.
- `aqua list presets` lists supported project presets.
- `aqua-project` Skill lets coding agents create and evolve projects using the same contract.
- Generated applications fail with `MODEL_PROVIDER_NOT_CONFIGURED` until a real provider is injected.

## Non-goals for the first release

- No dashboard.
- No hosted registry.
- No fake MCP, A2A, or parallel-agent implementation.
- No embedded LLM provider client or stored credentials.
- No placeholder agent success path.

## Quality bar

Generated projects must be understandable, modular, and directly useful for second-stage application development. Success requires real files, a machine-readable manifest, strict TypeScript, smoke tests, explicit capability limits, and honest failure when a required provider is not configured.
