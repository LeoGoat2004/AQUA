import { createWorkbench, type WorkbenchConfig } from '@aqua/workbench';

const config: WorkbenchConfig = <%- JSON.stringify({ agents, skills, llm }, null, 2) %>;

export const workbench = createWorkbench(config);

export type { WorkbenchConfig } from '@aqua/workbench';

export async function initialize() {
  await workbench.initialize();
  return workbench;
}

export async function shutdown() {
  await workbench.shutdown();
}

export const agents = {
  list: () => workbench.listAgents(),
  get: (id: string) => workbench.getAgent(id),
  execute: (id: string, input: unknown) => workbench.execute(id, input),
};

export const skills = {
  execute: (id: string, params: Record<string, unknown>) =>
    workbench.executeSkill(id, params),
};
