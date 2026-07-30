# AQUA Skill

This directory is the user-installable AQUA Skill.

## Install

Copy this directory into the target agent's skills directory and keep the directory name stable, for example:

```text
skills/
  aqua-project/
    SKILL.md
```

If the target agent expects a single skill folder, copy this `skill/` directory and rename it to `aqua-project`.

## Expected behavior

The Skill should use the AQUA CLI and `.aqua/project.json` contract to create, inspect, validate, and evolve generated TypeScript agent harness projects.

It must not:

- fake agent success;
- add hidden LLM clients or credentials;
- claim MCP, A2A, or parallel dispatch support without a verified adapter.

Newly generated projects should fail honestly with `MODEL_PROVIDER_NOT_CONFIGURED` until the user implements or injects a real model provider.
