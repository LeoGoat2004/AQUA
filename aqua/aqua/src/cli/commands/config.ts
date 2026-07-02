import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';

interface ConfigOptions {
  json?: boolean;
}

export async function configCommand(
  action: string,
  key?: string,
  value?: string,
  options?: ConfigOptions
): Promise<void> {
  const configPath = path.resolve(process.cwd(), 'aqua.config.json');

  if (!fs.existsSync(configPath)) {
    logger.error('Not an AQUA project. Run "aqua create" first.');
    return;
  }

  const config = await fs.readJson(configPath);

  switch (action) {
    case 'get':
      await getConfig(config, key as string);
      break;
    case 'set':
      await setConfig(configPath, config, key as string, value as string);
      break;
    case 'list':
      await listConfig(config, options);
      break;
    case 'edit':
      await editConfig(configPath, config);
      break;
  }
}

async function getConfig(config: Record<string, unknown>, key: string): Promise<void> {
  const keys = key.split('.');
  let value: unknown = config;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      logger.error(`Config key "${key}" not found.`);
      return;
    }
  }

  if (typeof value === 'object' && value !== null) {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(value);
  }
}

async function setConfig(
  configPath: string,
  config: Record<string, unknown>,
  key: string,
  value: string
): Promise<void> {
  const keys = key.split('.');
  let current: Record<string, unknown> = config;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current)) {
      current[k] = {};
    }
    if (typeof current[k] !== 'object' || current[k] === null) {
      logger.error(`Cannot set nested key: "${key}" - "${k}" is not an object`);
      return;
    }
    current = current[k] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];

  let parsedValue: unknown = value;
  try {
    parsedValue = JSON.parse(value);
  } catch {
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (value === 'null') parsedValue = null;
    else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
  }

  current[lastKey] = parsedValue;

  await fs.writeJson(configPath, config, { spaces: 2 });
  logger.success(`Set ${key} = ${JSON.stringify(parsedValue)}`);
}

async function listConfig(config: Record<string, unknown>, options?: ConfigOptions): Promise<void> {
  if (options?.json) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  logger.header('Configuration');

  logger.section('Project');
  logger.kv('Project Name', config.projectName as string);
  logger.kv('Version', config.version as string);
  logger.kv('Description', (config.description as string) || '-');

  logger.section('LLM');
  const llm = config.llm as Record<string, unknown>;
  if (llm) {
    logger.kv('Base URL', (llm.baseUrl as string) || 'not set');
    logger.kv('Model', (llm.model as string) || 'not set');
    logger.kv('API Key', llm.apiKey ? '***' + (llm.apiKey as string).slice(-4) : 'not set');
  }

  logger.section('Agents');
  const agents = (config.agents as Array<Record<string, unknown>>) || [];
  logger.kv('Count', agents.length.toString());
  if (agents.length > 0) {
    agents.forEach((a) => logger.bullet(`${a.name} (${a.id}) - ${a.enabled ? 'enabled' : 'disabled'}`));
  }

  logger.section('Skills');
  const skills = (config.skills as Array<Record<string, unknown>>) || [];
  logger.kv('Count', skills.length.toString());
  if (skills.length > 0) {
    skills.forEach((s) => logger.bullet(`${s.name} (${s.id}) - ${s.enabled ? 'enabled' : 'disabled'}`));
  }

  logger.section('Tools');
  const tools = (config.tools as Array<Record<string, unknown>>) || [];
  logger.kv('Count', tools.length.toString());
  if (tools.length > 0) {
    tools.forEach((t) => logger.bullet(`${t.name} (${t.id}) - ${t.enabled ? 'enabled' : 'disabled'}`));
  }
}

async function editConfig(configPath: string, config: Record<string, unknown>): Promise<void> {
  logger.info('Opening interactive config editor...');

  const llm = config.llm as Record<string, unknown> || {};

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: config.projectName as string,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: config.description as string,
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'LLM Base URL:',
      default: (llm.baseUrl as string) || 'https://api.openai.com/v1',
    },
    {
      type: 'input',
      name: 'model',
      message: 'LLM Model:',
      default: (llm.model as string) || 'gpt-4o',
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key (leave empty to keep current):',
      mask: '*',
    },
  ]);

  config.projectName = answers.projectName;
  config.description = answers.description;
  (config.llm as Record<string, unknown>).baseUrl = answers.baseUrl;
  (config.llm as Record<string, unknown>).model = answers.model;
  if (answers.apiKey) {
    (config.llm as Record<string, unknown>).apiKey = answers.apiKey;
  }

  await fs.writeJson(configPath, config, { spaces: 2 });
  logger.success('Configuration updated!');
}