import { access, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getPreset, listPresets } from './presets.js';
import { renderProjectFiles } from './templates.js';
import type {
  AquaCreateOptions,
  AquaDiagnostic,
  AquaProjectManifest,
  AquaProjectPlan,
  AquaValidationResult,
  HarnessTarget,
  PackageManager,
} from './types.js';

export { listPresets };

const PACKAGE_MANAGERS = new Set<PackageManager>(['pnpm', 'npm', 'yarn']);
const HARNESSES = new Set<HarnessTarget>(['standalone', 'codex', 'opencode', 'claude-code']);

export function normalizeCreateOptions(input: Partial<AquaCreateOptions> & Pick<AquaCreateOptions, 'name' | 'directory'>): AquaCreateOptions {
  const preset = input.preset ?? 'minimal';
  const harness = input.harness ?? 'standalone';
  const packageManager = input.packageManager ?? 'pnpm';

  if (!getPreset(preset)) {
    throw new Error(`Unknown preset "${preset}". Available presets: ${listPresets().map((candidate) => candidate.id).join(', ')}`);
  }
  if (!HARNESSES.has(harness)) {
    throw new Error(`Unknown harness "${harness}". Expected one of: ${Array.from(HARNESSES).join(', ')}`);
  }
  if (!PACKAGE_MANAGERS.has(packageManager)) {
    throw new Error(`Unknown package manager "${packageManager}". Expected one of: ${Array.from(PACKAGE_MANAGERS).join(', ')}`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(input.name)) {
    throw new Error('Project name must contain only letters, numbers, dashes, and underscores.');
  }

  return {
    name: input.name,
    directory: path.resolve(input.directory),
    preset,
    harness,
    packageManager,
    force: input.force ?? false,
  };
}

export function createProjectPlan(options: AquaCreateOptions): AquaProjectPlan {
  const preset = getPreset(options.preset);
  if (!preset) {
    throw new Error(`Unknown preset "${options.preset}".`);
  }

  const manifest: AquaProjectManifest = {
    schemaVersion: 1,
    projectName: options.name,
    preset: preset.id,
    harness: options.harness,
    packageManager: options.packageManager,
    modules: {
      agents: preset.agents,
      tools: preset.tools,
      workflows: preset.workflows,
    },
    commands: {
      install: `${options.packageManager} install`,
      typecheck: `${options.packageManager} run typecheck`,
      test: `${options.packageManager} test`,
      smoke: `${options.packageManager} run smoke`,
    },
    capabilities: {
      toolCalling: true,
      localArtifacts: true,
      trace: true,
      verification: true,
      parallelAgents: options.harness === 'standalone' ? 'unsupported' : 'adapter-required',
    },
  };

  return {
    rootDir: options.directory,
    manifest,
    files: renderProjectFiles(manifest),
  };
}

export async function writeProject(plan: AquaProjectPlan, options: Pick<AquaCreateOptions, 'force'>): Promise<void> {
  await ensureWritableTarget(plan.rootDir, options.force);

  if (options.force) {
    await rm(plan.rootDir, { recursive: true, force: true });
  }

  for (const plannedFile of plan.files) {
    const absolutePath = path.join(plan.rootDir, plannedFile.relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, plannedFile.content, 'utf8');
  }
}

export async function validateProject(rootDir: string): Promise<AquaValidationResult> {
  const diagnostics: AquaDiagnostic[] = [];
  const absoluteRoot = path.resolve(rootDir);
  const manifestPath = path.join(absoluteRoot, '.aqua', 'project.json');
  const manifest = await readManifest(manifestPath, diagnostics);

  if (!manifest) {
    return { valid: false, diagnostics };
  }

  await expectFile(absoluteRoot, 'package.json', diagnostics);
  await expectFile(absoluteRoot, 'tsconfig.json', diagnostics);
  await expectFile(absoluteRoot, 'README.md', diagnostics);
  await expectFile(absoluteRoot, 'src/index.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/runner.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/types.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/guardrails.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/permissions.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/verification.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/workflows/plan-execute-verify.ts', diagnostics);
  await expectFile(absoluteRoot, 'tests/smoke.test.ts', diagnostics);

  for (const agent of manifest.modules.agents) {
    await expectFile(absoluteRoot, `src/agents/${agent}.ts`, diagnostics);
  }
  for (const tool of manifest.modules.tools) {
    await expectFile(absoluteRoot, `src/tools/${tool}.ts`, diagnostics);
  }

  return {
    valid: diagnostics.every((diagnostic) => diagnostic.level !== 'error'),
    diagnostics,
  };
}

export async function doctorProject(rootDir: string): Promise<AquaValidationResult> {
  const validation = await validateProject(rootDir);
  const diagnostics: AquaDiagnostic[] = [...validation.diagnostics];
  const manifestPath = path.join(path.resolve(rootDir), '.aqua', 'project.json');

  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as AquaProjectManifest;
    diagnostics.push({
      level: 'info',
      code: 'AQUA_VERIFY_COMMANDS',
      message: `Run: ${manifest.commands.install}; ${manifest.commands.typecheck}; ${manifest.commands.test}; ${manifest.commands.smoke}`,
    });
    if (manifest.capabilities.parallelAgents === 'adapter-required') {
      diagnostics.push({
        level: 'warning',
        code: 'AQUA_ADAPTER_REQUIRED',
        message: 'Parallel agent execution requires a verified target-harness adapter. AQUA does not fake concurrency.',
      });
    }
  } catch {
    // validateProject already reported manifest errors.
  }

  return {
    valid: diagnostics.every((diagnostic) => diagnostic.level !== 'error'),
    diagnostics,
  };
}

async function ensureWritableTarget(rootDir: string, force: boolean): Promise<void> {
  try {
    const targetStat = await stat(rootDir);
    if (!targetStat.isDirectory()) {
      throw new Error(`Target exists and is not a directory: ${rootDir}`);
    }
    const entries = await readdir(rootDir);
    if (entries.length > 0 && !force) {
      throw new Error(`Target directory is not empty: ${rootDir}. Use --force to replace it.`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

async function readManifest(manifestPath: string, diagnostics: AquaDiagnostic[]): Promise<AquaProjectManifest | undefined> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as AquaProjectManifest;
    if (manifest.schemaVersion !== 1) {
      diagnostics.push({
        level: 'error',
        code: 'AQUA_SCHEMA_VERSION',
        message: 'Unsupported AQUA schema version.',
        file: manifestPath,
      });
      return undefined;
    }
    return manifest;
  } catch (error) {
    diagnostics.push({
      level: 'error',
      code: 'AQUA_MANIFEST',
      message: `Cannot read .aqua/project.json: ${error instanceof Error ? error.message : String(error)}`,
      file: manifestPath,
    });
    return undefined;
  }
}

async function expectFile(rootDir: string, relativePath: string, diagnostics: AquaDiagnostic[]): Promise<void> {
  const absolutePath = path.join(rootDir, relativePath);
  try {
    await access(absolutePath);
    diagnostics.push({
      level: 'info',
      code: 'AQUA_FILE_PRESENT',
      message: `Found ${relativePath}`,
      file: absolutePath,
    });
  } catch {
    diagnostics.push({
      level: 'error',
      code: 'AQUA_FILE_MISSING',
      message: `Missing ${relativePath}`,
      file: absolutePath,
    });
  }
}
