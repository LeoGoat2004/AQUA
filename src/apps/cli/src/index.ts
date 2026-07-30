#!/usr/bin/env node

import path from 'node:path';
import {
  createProjectPlan,
  doctorProject,
  listPresets,
  normalizeCreateOptions,
  validateProject,
  writeProject,
} from '../../../packages/core/dist/index.js';
import type { HarnessTarget, PackageManager } from '../../../packages/core/dist/index.js';

const VERSION = '0.1.0';

interface ParsedArgs {
  readonly command: string | undefined;
  readonly values: readonly string[];
  readonly flags: ReadonlyMap<string, string | boolean>;
}

async function main(argv: readonly string[]): Promise<number> {
  const parsed = parseArgs(argv);
  if (parsed.command === '--help' || parsed.command === '-h') {
    printHelp();
    return 0;
  }
  if (parsed.command === '--version' || parsed.command === '-v') {
    console.log(VERSION);
    return 0;
  }

  switch (parsed.command) {
    case 'create':
      return createCommand(parsed);
    case 'validate':
      return validateCommand(parsed);
    case 'doctor':
      return doctorCommand(parsed);
    case 'list':
      return listCommand(parsed);
    case 'help':
    case undefined:
      printHelp();
      return 0;
    default:
      console.error(`Unknown command: ${parsed.command}`);
      printHelp();
      return 1;
  }
}

async function createCommand(args: ParsedArgs): Promise<number> {
  const target = args.values[0];
  if (!target) {
    console.error('Missing target directory.');
    return 1;
  }

  const directory = path.resolve(process.cwd(), target);
  const name = String(args.flags.get('name') ?? path.basename(directory));
  const options = normalizeCreateOptions({
    name,
    directory,
    preset: stringFlag(args, 'preset', 'minimal'),
    harness: stringFlag(args, 'harness', 'standalone') as HarnessTarget,
    packageManager: stringFlag(args, 'package-manager', 'pnpm') as PackageManager,
    force: booleanFlag(args, 'force'),
  });
  const plan = createProjectPlan(options);
  await writeProject(plan, options);
  console.log(`Created TypeScript agent app at ${plan.rootDir}`);
  console.log(`Preset: ${plan.manifest.preset}`);
  console.log(`Next: cd ${target} && ${plan.manifest.commands.install} && ${plan.manifest.commands.smoke}`);
  return 0;
}

async function validateCommand(args: ParsedArgs): Promise<number> {
  const rootDir = path.resolve(process.cwd(), args.values[0] ?? '.');
  const result = await validateProject(rootDir);
  printDiagnostics(result.diagnostics);
  console.log(result.valid ? 'ts-agent-kit project contract is valid.' : 'ts-agent-kit project contract is invalid.');
  return result.valid ? 0 : 1;
}

async function doctorCommand(args: ParsedArgs): Promise<number> {
  const rootDir = path.resolve(process.cwd(), args.values[0] ?? '.');
  const result = await doctorProject(rootDir);
  printDiagnostics(result.diagnostics);
  return result.valid ? 0 : 1;
}

function listCommand(args: ParsedArgs): number {
  const subject = args.values[0] ?? 'presets';
  if (subject !== 'presets') {
    console.error(`Unknown list subject: ${subject}`);
    return 1;
  }
  for (const preset of listPresets()) {
    console.log(`${preset.id}\t${preset.description}`);
  }
  return 0;
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const values: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token) {
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = rest[index + 1];
      if (!next || next.startsWith('--')) {
        flags.set(key, true);
      } else {
        flags.set(key, next);
        index += 1;
      }
    } else {
      values.push(token);
    }
  }

  return { command, values, flags };
}

function stringFlag(args: ParsedArgs, name: string, fallback: string): string {
  const value = args.flags.get(name);
  return typeof value === 'string' ? value : fallback;
}

function booleanFlag(args: ParsedArgs, name: string): boolean {
  return args.flags.get(name) === true;
}

function printDiagnostics(diagnostics: readonly { level: string; code: string; message: string; file?: string }[]): void {
  for (const diagnostic of diagnostics) {
    console.log(`[${diagnostic.level}] ${diagnostic.code}: ${diagnostic.message}${diagnostic.file ? ` (${diagnostic.file})` : ''}`);
  }
}

function printHelp(): void {
  console.log(`ts-agent-kit - TypeScript agent application base generator

Usage:
  ts-agent-kit create <dir> [--name <name>] [--preset minimal|research-assistant|coding-agent] [--harness standalone|codex|opencode|claude-code] [--package-manager pnpm|npm|yarn] [--force]
  ts-agent-kit validate [dir]
  ts-agent-kit doctor [dir]
  ts-agent-kit list presets
  ts-agent-kit --version
`);
}

main(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
