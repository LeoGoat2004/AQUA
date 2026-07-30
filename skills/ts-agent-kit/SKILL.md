---
name: ts-agent-kit
description: Create, validate, and evolve modular TypeScript agent application bases with the ts-agent-kit CLI. Use when a user asks to generate a TypeScript agent app, scaffold an agent harness-backed application, create a Codex/OpenCode/Claude Code-ready TS agent project, validate a ts-agent-kit project contract, or adapt a generated project for a concrete application scenario.
---

# ts-agent-kit Skill

Use the ts-agent-kit CLI to create and verify TypeScript agent application bases with built-in harness seams. Treat the CLI as the source of truth for file generation and validation; do not hand-write a replacement scaffold unless the CLI is unavailable and the user explicitly accepts that limitation.

## Contract

A ts-agent-kit project is valid only when it contains `.ts-agent-kit/project.json` and that manifest matches the generated files. Keep CLI output, Skill-driven edits, and manual changes aligned with that manifest.

Do not present a generated project as a finished intelligent application. A new project must fail honestly with `MODEL_PROVIDER_NOT_CONFIGURED` until the user implements or injects a real `ModelProvider`.

## Create workflow

1. Ask for the target directory if the user did not specify one.
2. Infer `preset` from the user request when possible:
   - `minimal`: blank reusable harness base.
   - `research-assistant`: evidence, literature, document, or web-analysis workflows.
   - `coding-agent`: code generation, patching, verification, or review workflows.
3. Infer `harness` only when explicitly requested. Use `standalone` by default.
4. Require an installed or directly runnable `ts-agent-kit` command. Do not ask the user to clone the repository as the normal path.
5. Create new projects with:

   ```bash
   ts-agent-kit create <target-dir> --preset <minimal|research-assistant|coding-agent> --harness <standalone|codex|opencode|claude-code> --package-manager <pnpm|npm|yarn>
   ```

6. After creation or modification, run:

   ```bash
   ts-agent-kit validate <target-dir>
   ts-agent-kit doctor <target-dir>
   ```

7. Verify the generated project with:

   ```bash
   cd <target-dir>
   pnpm install
   pnpm run typecheck
   pnpm test
   pnpm run smoke
   ```

8. Run the generated application once. Treat `MODEL_PROVIDER_NOT_CONFIGURED` as the correct first-run result unless the user supplied a real provider.

## CLI resolution

Use this order:

1. `ts-agent-kit --help`
2. `pnpm dlx ts-agent-kit --help`
3. `npx ts-agent-kit --help`

If none work, stop and report `TS_AGENT_KIT_CLI_UNAVAILABLE` with the attempted commands.

## Modification rules

- Update `.ts-agent-kit/project.json` and source files together.
- Keep public seams stable: model provider, runner, workflow, agent, tool, trace, artifact store.
- Add tests at public seams only: CLI behavior and generated project behavior.
- Run TypeScript typecheck before reporting success.
- Never replace a failing provider seam with a placeholder echo response.
- Do not add hidden LLM clients, credentials, background services, fake model providers, or fake protocol support.
- Do not claim parallel agent dispatch unless the target harness has a verified adapter. If unavailable, state `CAPABILITY_UNAVAILABLE: parallelAgents`.
- Keep harness base code generic. Put application-specific behavior in agents, tools, workflows, providers, or presets.

## Success report

Report the target directory, selected preset and harness, commands run, validation result, test result, and whether the first runtime execution failed honestly with `MODEL_PROVIDER_NOT_CONFIGURED` or used a real provider.
