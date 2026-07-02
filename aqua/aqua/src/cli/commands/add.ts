import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

interface AddOptions {
  template?: string;
  from?: string;
  type?: string;
}

export async function addCommand(
  moduleType: 'agent' | 'skill' | 'tool',
  name: string,
  options: AddOptions
): Promise<void> {
  const configPath = path.resolve(process.cwd(), 'aqua.config.json');

  if (!fs.existsSync(configPath)) {
    logger.error('Not an AQUA project. Run "aqua create" first.');
    return;
  }

  const config = await fs.readJson(configPath);

  logger.header(`Adding ${moduleType}: ${name}`);

  switch (moduleType) {
    case 'agent':
      await addAgent(config, name, options);
      break;
    case 'skill':
      await addSkill(config, name, options);
      break;
    case 'tool':
      await addTool(config, name, options);
      break;
  }

  await fs.writeJson(configPath, config, { spaces: 2 });
  logger.success(`${moduleType} "${name}" added successfully!`);
}

async function addAgent(
  config: Record<string, unknown>,
  name: string,
  _options: AddOptions
): Promise<void> {
  const agentConfig = {
    id: name,
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, (x) => x[1].toUpperCase()),
    type: 'executor',
    enabled: true,
    systemPrompt: `You are a ${name} agent.`,
    skills: [] as string[],
  };

  const agents = (config.agents as Array<Record<string, unknown>>) || [];
  const existing = agents.find((a) => a.id === name);

  if (existing) {
    logger.warn(`Agent "${name}" already exists, skipping.`);
    return;
  }

  agents.push(agentConfig as unknown as Record<string, unknown>);
  config.agents = agents;

  logger.success(`Added agent: ${agentConfig.name}`);
}

async function addSkill(
  config: Record<string, unknown>,
  name: string,
  _options: AddOptions
): Promise<void> {
  const skillConfig = {
    id: name,
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    category: 'custom',
    enabled: true,
    description: `Skill: ${name}`,
    config: {} as Record<string, unknown>,
  };

  const skills = (config.skills as Array<Record<string, unknown>>) || [];
  const existing = skills.find((s) => s.id === name);

  if (existing) {
    logger.warn(`Skill "${name}" already exists, skipping.`);
    return;
  }

  skills.push(skillConfig as unknown as Record<string, unknown>);
  config.skills = skills;

  logger.success(`Added skill: ${skillConfig.name}`);
}

async function addTool(
  config: Record<string, unknown>,
  name: string,
  options: AddOptions
): Promise<void> {
  const toolType = options.type || 'mcp';

  logger.info(`Adding ${toolType} tool: ${name}`);

  const toolConfig = {
    id: name,
    name: name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    type: toolType,
    enabled: true,
    description: `Tool: ${name}`,
    config: {} as Record<string, unknown>,
  };

  const tools = (config.tools as Array<Record<string, unknown>>) || [];
  const existing = tools.find((t) => t.id === name);

  if (existing) {
    logger.warn(`Tool "${name}" already exists, skipping.`);
    return;
  }

  tools.push(toolConfig as unknown as Record<string, unknown>);
  config.tools = tools;

  logger.success(`Added tool: ${toolConfig.name}`);
}