import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';

export async function removeCommand(type: string, name: string): Promise<void> {
  const configPath = path.resolve(process.cwd(), 'aqua.config.json');

  if (!fs.existsSync(configPath)) {
    logger.error('Not an AQUA project. Run "aqua create" first.');
    return;
  }

  const config = await fs.readJson(configPath);
  const validTypes = ['agent', 'skill', 'tool'];

  if (!validTypes.includes(type)) {
    logger.error(`Invalid type: ${type}. Valid types: ${validTypes.join(', ')}`);
    return;
  }

  const collectionKey = `${type}s` as 'agents' | 'skills' | 'tools';
  const collection = (config[collectionKey] as unknown[]) || [];

  const index = collection.findIndex(
    (item: unknown) => (item as Record<string, string>).id === name
  );

  if (index === -1) {
    logger.error(`${type} "${name}" not found.`);
    return;
  }

  logger.header(`Removing ${type}: ${name}`);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove "${name}"?`,
      default: false,
    },
  ]);

  if (!confirm) {
    logger.info('Aborted.');
    return;
  }

  collection.splice(index, 1);
  config[collectionKey] = collection;

  await fs.writeJson(configPath, config, { spaces: 2 });
  logger.success(`${type} "${name}" removed successfully!`);
}
