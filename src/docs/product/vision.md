# ts-agent-kit Product Vision

ts-agent-kit is a CLI plus companion Skill for creating modular TypeScript agent application bases with built-in harness seams.

The product is not a hosted agent platform. It generates practical source code that users can immediately own, inspect, typecheck, test, and extend for a chosen application scenario.

## First release scope

- `ts-agent-kit create` creates a complete TypeScript agent app base.
- `ts-agent-kit validate` checks the project contract and expected files.
- `ts-agent-kit doctor` explains verification commands and adapter caveats.
- `ts-agent-kit list presets` lists supported project presets.
- `$ts-agent-kit` Skill lets coding agents create and evolve projects using the same contract.
- Generated applications fail with `MODEL_PROVIDER_NOT_CONFIGURED` until a real provider is injected.

## Non-goals for the first release

- No dashboard.
- No hosted registry.
- No fake MCP, A2A, or parallel-agent implementation.
- No embedded LLM provider client or stored credentials.
- No placeholder agent success path.

## Quality bar

Generated projects must be understandable, modular, and directly useful for second-stage application development. Success requires real files, a machine-readable manifest, strict TypeScript, smoke tests, explicit capability limits, and honest failure when a required provider is not configured.
