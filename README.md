# ts-agent-kit

`ts-agent-kit` is a CLI plus installable Agent Skill for generating production-oriented TypeScript agent application bases.

It is for users who want to start a real TypeScript agent app quickly, not for users who want to clone this repository and run internal development commands.

## User install

Create a project directly with pnpm:

```bash
pnpm dlx ts-agent-kit create ./my-agent-app --preset coding-agent --package-manager pnpm
```

Or with npm:

```bash
npx ts-agent-kit create ./my-agent-app --preset coding-agent --package-manager npm
```

Then verify the generated project:

```bash
cd ./my-agent-app
pnpm install
pnpm run typecheck
pnpm test
pnpm run smoke
pnpm run start -- "hello"
```

The final command should fail with `MODEL_PROVIDER_NOT_CONFIGURED` until you add a real model provider. That is intentional; the generated app must not fake agent success.

## Install the Skill

Install the companion Skill with the standard skills CLI, not with a custom installer:

```bash
npx skills add https://github.com/LeoGoat2004/ts-agent-kit --skill ts-agent-kit -g -a codex -y
```

For OpenCode:

```bash
npx skills add https://github.com/LeoGoat2004/ts-agent-kit --skill ts-agent-kit -g -a opencode -y
```

After the Skill is installed, restart or refresh the agent client if needed, then ask:

```text
Use $ts-agent-kit to create a TypeScript coding agent app in ./my-agent-app.
```

## What the generated app contains

- strict TypeScript project
- `.ts-agent-kit/project.json` manifest contract
- runtime config loader
- model provider seam
- agents
- deterministic tool interface
- workflow orchestration
- trace sink
- artifact store
- permission policy
- verifier
- smoke tests

## CLI commands

```bash
ts-agent-kit create <dir> [--preset minimal|research-assistant|coding-agent] [--harness standalone|codex|opencode|claude-code] [--package-manager pnpm|npm|yarn] [--force]
ts-agent-kit validate [dir]
ts-agent-kit doctor [dir]
ts-agent-kit list presets
ts-agent-kit --version
```

## What is intentionally not faked

- MCP / A2A adapters
- parallel agent dispatch
- embedded LLM client
- credential storage
- dashboard UI

These features should be added only when backed by real runtime adapters and tests.

## Development

Repository development still uses the local checkout:

```bash
cd <repo>
pnpm --dir src install
pnpm run build
pnpm test
pnpm run smoke
pnpm pack
```

`test_project/` is reserved for local generated-project testing and is ignored by Git.

## License

MIT
