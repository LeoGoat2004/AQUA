import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

interface ListOptions {
  type?: string;
  json?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const configPath = path.resolve(process.cwd(), 'aqua.config.json');

  if (!fs.existsSync(configPath)) {
    logger.error('Not an AQUA project. Run "aqua create" first.');
    return;
  }

  const config = await fs.readJson(configPath);
  const filterType = options.type;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          agents: config.agents || [],
          skills: config.skills || [],
          tools: config.tools || [],
        },
        null,
        2
      )
    );
    return;
  }

  logger.header('Installed Modules');

  const showAll = !filterType;

  if (showAll || filterType === 'agents') {
    const agents = (config.agents as unknown[]) || [];
    logger.section('Agents');
    if (agents.length === 0) {
      logger.dim('No agents installed');
    } else {
      agents.forEach((agent: unknown) => {
        const a = agent as Record<string, unknown>;
        const status = a.enabled ? chalk.green('●') : chalk.gray('○');
        logger.bullet(`${status} ${a.name} (${a.id})`);
        logger.dim(`  Type: ${a.type}`);
      });
    }
  }

  if (showAll || filterType === 'skills') {
    const skills = (config.skills as unknown[]) || [];
    logger.section('Skills');
    if (skills.length === 0) {
      logger.dim('No skills installed');
    } else {
      skills.forEach((skill: unknown) => {
        const s = skill as Record<string, unknown>;
        const status = s.enabled ? chalk.green('●') : chalk.gray('○');
        logger.bullet(`${status} ${s.name} (${s.id})`);
      });
    }
  }

  if (showAll || filterType === 'tools') {
    const tools = (config.tools as unknown[]) || [];
    logger.section('Tools');
    if (tools.length === 0) {
      logger.dim('No tools installed');
    } else {
      tools.forEach((tool: unknown) => {
        const t = tool as Record<string, unknown>;
        const status = t.enabled ? chalk.green('●') : chalk.gray('○');
        logger.bullet(`${status} ${t.name} (${t.id})`);
        logger.dim(`  Type: ${t.type || 'unknown'}`);
      });
    }
  }

  const total =
    ((config.agents as unknown[]) || []).length +
    ((config.skills as unknown[]) || []).length +
    ((config.tools as unknown[]) || []).length;

  logger.dim(`\nTotal: ${total} modules`);
}
