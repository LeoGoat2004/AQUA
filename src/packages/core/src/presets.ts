import type { TsAgentKitPreset } from './types.js';

export const PRESETS: readonly TsAgentKitPreset[] = [
  {
    id: 'minimal',
    name: 'Minimal TypeScript Agent Harness',
    description: 'Smallest useful base with one agent, provider seam, trace, artifact store, workflow, and smoke test.',
    agents: ['assistant'],
    tools: [],
    workflows: ['plan-execute-verify'],
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant Base',
    description: 'Evidence-oriented base for literature, web, or document analysis projects.',
    agents: ['planner', 'researcher', 'verifier'],
    tools: ['artifact-recorder'],
    workflows: ['plan-execute-verify'],
  },
  {
    id: 'coding-agent',
    name: 'Coding Agent Base',
    description: 'Code-oriented base with planning, implementation, verification, and review seams.',
    agents: ['planner', 'implementer', 'reviewer'],
    tools: ['artifact-recorder'],
    workflows: ['plan-execute-verify'],
  },
] as const;

export function getPreset(id: string): TsAgentKitPreset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

export function listPresets(): readonly TsAgentKitPreset[] {
  return PRESETS;
}
