# ts-agent-kit

`ts-agent-kit` is a CLI plus installable Agent Skill for generating production-oriented TypeScript agent application bases.

It is for users who want to start a real TypeScript agent app quickly, not for users who want to clone this repository and run internal development commands.

## Current release status

The repository and package layout are ready for a user-facing release, but the package must be published to npm before `pnpm dlx ts-agent-kit` or `npx ts-agent-kit` works for ordinary users from the public registry.

Until npm publication, the Skill can be installed from GitHub and the CLI can be verified from the local packed tarball by maintainers.

## User flow after npm publication

Users have two independent entry points:

1. Use the CLI directly.
2. Install the Skill into their agent client, then ask the agent to create the project.

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

Install the companion Skill with the standard skills CLI, not with a custom installer. Do not hard-code a target agent in the command; the installer can prompt the user for scope and agent selection:

```bash
npx skills add https://github.com/LeoGoat2004/ts-agent-kit --skill ts-agent-kit
```

For non-interactive install across supported agents, users may choose their own flags, for example:

```bash
npx skills add https://github.com/LeoGoat2004/ts-agent-kit --skill ts-agent-kit --all
```

After the Skill is installed, restart or refresh the agent client if needed, then ask:

```text
Use $ts-agent-kit to create a TypeScript coding agent app in ./my-agent-app.
```

The Skill still needs a runnable CLI. It resolves the CLI in this order:

1. existing `ts-agent-kit` command
2. `pnpm dlx ts-agent-kit`
3. `npx ts-agent-kit`

After npm publication, this means users do not need to clone the repository. The Skill can call the package through `pnpm dlx` or `npx`.

## What gets installed when

- `npx skills add ... --skill ts-agent-kit` installs only the agent Skill into the user's selected agent environment. It does not install generated project dependencies.
- `pnpm dlx ts-agent-kit create ...` downloads and runs the CLI package transiently.
- The generated project is a normal TypeScript project. It still needs its own package install, such as `pnpm install`, before `typecheck`, `test`, `smoke`, or runtime execution.
- The first runtime execution should fail with `MODEL_PROVIDER_NOT_CONFIGURED` until the user implements or injects a real `ModelProvider`.

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
ts-agent-kit create <dir> [--preset minimal|research-assistant|coding-agent] [--harness standalone|agent-client] [--package-manager pnpm|npm|yarn] [--force]
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
