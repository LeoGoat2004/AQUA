# ts-agent-kit Project Contract

Every generated project contains `.ts-agent-kit/project.json`. This file is the shared interface between the CLI, the Skill, and future adapters.

## Required fields

- `schemaVersion`: currently `1`.
- `projectName`: safe package/project identifier.
- `preset`: source preset used to create the base.
- `harness`: `standalone`, `codex`, `opencode`, or `claude-code`.
- `packageManager`: `pnpm`, `npm`, or `yarn`.
- `modules`: declared agents, tools, and workflows.
- `commands`: install, typecheck, test, and smoke commands.
- `capabilities`: explicit supported and adapter-required behavior.

## Provider rule

Generated projects must not contain a placeholder agent that pretends to complete user work. Runtime execution must fail with `MODEL_PROVIDER_NOT_CONFIGURED` until a real `ModelProvider` is injected or implemented.

## Capability rule

ts-agent-kit must not fake runtime capabilities. Parallel agent execution is either `unsupported` for standalone projects or `adapter-required` for harness targets that may provide real dispatch.

## Public seams

Generated projects expose these seams for extension and tests:

- `createRunner`
- `ModelProvider`
- `Workflow`
- `Agent`
- `Tool`
- `TraceSink`
- `ArtifactStore`

Application-specific development should add concrete agents, tools, workflows, and tests without changing the harness seam unless the project contract is intentionally revised.
