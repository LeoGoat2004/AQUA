#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { createCommand } from './commands/create.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { listCommand } from './commands/list.js';
import { configCommand } from './commands/config.js';
import { generateCommand } from './commands/generate.js';
import { serveCommand } from './commands/serve.js';
import { logger } from './utils/logger.js';

const program = new Command();

program
  .name('aqua')
  .description(chalk.cyan('AQUA - Agent Application Workbench'))
  .version('0.1.0')
  .hook('preAction', (thisCommand) => {
    const debug = thisCommand.opts().debug;
    if (debug) {
      console.log(chalk.gray('Debug mode enabled'));
    }
  });

program
  .option('-d, --debug', 'Enable debug mode', false);

program
  .command('create')
  .description('Create a new AQUA project')
  .argument('<project-name>', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(createCommand);

program
  .command('add')
  .description('Add a module (agent, skill, or tool)')
  .addCommand(
    new Command('agent')
      .description('Add an agent')
      .argument('<name>', 'Agent name')
      .option('-t, --template <template>', 'Agent template', 'basic')
      .action((name, opts) => addCommand('agent', name, opts))
  )
  .addCommand(
    new Command('skill')
      .description('Add a skill')
      .argument('<name>', 'Skill name')
      .option('-f, --from <source>', 'Source (registry, local, or npm)', 'registry')
      .action((name, opts) => addCommand('skill', name, opts))
  )
  .addCommand(
    new Command('tool')
      .description('Add a tool')
      .argument('<name>', 'Tool name')
      .option('-t, --type <type>', 'Tool type (mcp, builtin, custom)', 'mcp')
      .action((name, opts) => addCommand('tool', name, opts))
  );

program
  .command('remove')
  .description('Remove a module')
  .argument('<type>', 'Module type (agent, skill, or tool)')
  .argument('<name>', 'Module name')
  .action(removeCommand);

program
  .command('list')
  .description('List all installed modules')
  .option('-t, --type <type>', 'Filter by type (agents, skills, tools)')
  .option('-j, --json', 'Output as JSON')
  .action(listCommand);

const configCmd = program
  .command('config')
  .description('Manage configuration');

configCmd
  .command('get')
  .description('Get a configuration value')
  .argument('<key>', 'Configuration key')
  .action((key) => configCommand('get', key));

configCmd
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Configuration key')
  .argument('<value>', 'Configuration value')
  .action((key, value) => configCommand('set', key, value));

configCmd
  .command('edit')
  .description('Edit configuration in interactive mode')
  .action(() => configCommand('edit'));

configCmd
  .command('list')
  .description('List all configuration')
  .option('-j, --json', 'Output as JSON')
  .action((opts) => configCommand('list', undefined, undefined, opts));

program
  .command('generate')
  .description('Generate Workbench code')
  .option('-o, --output <dir>', 'Output directory', './workbench')
  .option('-f, --force', 'Overwrite existing files', false)
  .action(generateCommand);

program
  .command('serve')
  .description('Start the AQUA dashboard')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-h, --host <host>', 'Host to bind to', 'localhost')
  .action(serveCommand);

program
  .command('init')
  .description('Initialize AQUA in an existing project')
  .action(async () => {
    const configPath = path.resolve(process.cwd(), 'aqua.config.json');

    if (fs.existsSync(configPath)) {
      logger.warn('aqua.config.json already exists.');
      return;
    }

    logger.header('Initializing AQUA');

    const config = {
      projectName: path.basename(process.cwd()),
      version: '0.1.0',
      description: 'AI Agent application',
      llm: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        apiKey: '',
      },
      agents: [],
      skills: [],
      tools: [],
      createdAt: new Date().toISOString(),
    };

    await fs.writeJson(configPath, config, { spaces: 2 });
    logger.success('Created aqua.config.json');
    logger.info('\nNext steps:');
    logger.bullet('aqua add agent <name>');
    logger.bullet('aqua add skill <name>');
    logger.bullet('aqua serve');
  });

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.gray('Run "aqua --help" for available commands'));
  process.exit(1);
});

program.parse();