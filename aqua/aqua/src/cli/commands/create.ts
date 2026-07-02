import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

interface CreateOptions {
  template?: string;
}

export async function createCommand(projectName: string, _options: CreateOptions): Promise<void> {
  const projectPath = path.resolve(process.cwd(), 'project', projectName);

  logger.header('Creating new AQUA project');

  if (fs.existsSync(projectPath)) {
    logger.error(`Directory "${projectName}" already exists in project/`);
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite it?',
        default: false,
      },
    ]);

    if (!overwrite) {
      logger.info('Aborted');
      return;
    }

    await fs.remove(projectPath);
  }

  logger.info(`Creating project at: ${chalk.gray(projectPath)}`);

  await fs.ensureDir(projectPath);

  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'AI Agent application built with AQUA',
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'LLM Base URL:',
      default: 'https://api.openai.com/v1',
    },
    {
      type: 'input',
      name: 'model',
      message: 'LLM Model:',
      default: 'gpt-4o',
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key (optional, can be set later):',
      mask: '*',
    },
    {
      type: 'input',
      name: 'temperature',
      message: 'Temperature (0.0-2.0):',
      default: '0.7',
    },
  ]);

  const projectConfig = {
    projectName,
    description: config.description,
    version: '0.1.0',
    llm: {
      baseUrl: config.baseUrl,
      model: config.model,
      apiKey: config.apiKey || undefined,
      temperature: parseFloat(config.temperature) || 0.7,
    },
    agents: [] as Array<Record<string, unknown>>,
    skills: [] as Array<Record<string, unknown>>,
    tools: [] as Array<Record<string, unknown>>,
    createdAt: new Date().toISOString(),
  };

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'aqua serve',
      generate: 'aqua generate',
      build: 'aqua generate --force',
    },
    dependencies: {},
  };

  logger.section('Generating files');

  await fs.writeJson(path.join(projectPath, 'aqua.config.json'), projectConfig, {
    spaces: 2,
  });
  logger.success('Created aqua.config.json');

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, {
    spaces: 2,
  });
  logger.success('Created package.json');

  const readme = `# ${projectName}

AI Agent application built with AQUA.

## Getting Started

\`\`\`bash
# Generate Workbench
pnpm run generate

# Start development
pnpm run dev
\`\`\`

## Configuration

Edit \`aqua.config.json\` to configure your agents, skills, and LLM.
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  logger.success('Created README.md');

  logger.section('Summary');
  logger.kv('Project', projectName);
  logger.kv('Path', projectPath);
  logger.kv('LLM Model', config.model);
  logger.kv('Base URL', config.baseUrl);
  logger.kv('Agents', '0 (add with: aqua add agent <name>)');
  logger.kv('Skills', '0 (add with: aqua add skill <name>)');

  logger.header('Project created successfully!');
  logger.info('\nNext steps:');
  logger.bullet(`cd project/${projectName}`);
  logger.bullet('pnpm install');
  logger.bullet('aqua add agent my-agent');
  logger.bullet('aqua add skill calculator');
  logger.bullet('aqua serve');
}