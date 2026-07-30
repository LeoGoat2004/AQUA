import { access, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getPreset, listPresets } from './presets.js';
import { renderProjectFiles } from './templates.js';
import type {
  HarnessTarget,
  PackageManager,
  TsAgentKitCreateOptions,
  TsAgentKitDiagnostic,
  TsAgentKitProjectManifest,
  TsAgentKitProjectPlan,
  TsAgentKitValidationResult,
} from './types.js';

export { listPresets };

const PACKAGE_MANAGERS = new Set<PackageManager>(['pnpm', 'npm', 'yarn']);
const HARNESSES = new Set<HarnessTarget>(['standalone', 'codex', 'opencode', 'claude-code']);

export function normalizeCreateOptions(input: Partial<TsAgentKitCreateOptions> & Pick<TsAgentKitCreateOptions, 'name' | 'directory'>): TsAgentKitCreateOptions {
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

export function createProjectPlan(options: TsAgentKitCreateOptions): TsAgentKitProjectPlan {
  const preset = getPreset(options.preset);
  if (!preset) {
    throw new Error(`Unknown preset "${options.preset}".`);
  }

  const manifest: TsAgentKitProjectManifest = {
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

export async function writeProject(plan: TsAgentKitProjectPlan, options: Pick<TsAgentKitCreateOptions, 'force'>): Promise<void> {
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

export async function validateProject(rootDir: string): Promise<TsAgentKitValidationResult> {
  const diagnostics: TsAgentKitDiagnostic[] = [];
  const absoluteRoot = path.resolve(rootDir);
  const manifestPath = path.join(absoluteRoot, '.ts-agent-kit', 'project.json');
  const manifest = await readManifest(manifestPath, diagnostics);

  if (!manifest) {
    return { valid: false, diagnostics };
  }

  validateManifestShape(manifest, manifestPath, diagnostics);
  validateManifestSemantics(manifest, manifestPath, diagnostics);

  await expectFile(absoluteRoot, 'package.json', diagnostics);
  await expectFile(absoluteRoot, 'tsconfig.json', diagnostics);
  await expectFile(absoluteRoot, '.env.example', diagnostics);
  await expectFile(absoluteRoot, 'README.md', diagnostics);
  await expectFile(absoluteRoot, 'src/index.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/config/runtime-config.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/runner.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/types.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/harness/guardrails.ts', diagnostics);
  await expectFile(absoluteRoot, 'src/providers/model-provider.ts', diagnostics);
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

export async function doctorProject(rootDir: string): Promise<TsAgentKitValidationResult> {
  const validation = await validateProject(rootDir);
  const diagnostics: TsAgentKitDiagnostic[] = [...validation.diagnostics];
  const manifestPath = path.join(path.resolve(rootDir), '.ts-agent-kit', 'project.json');

  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as TsAgentKitProjectManifest;
    diagnostics.push({
      level: 'info',
      code: 'TS_AGENT_KIT_VERIFY_COMMANDS',
      message: `Run: ${manifest.commands.install}; ${manifest.commands.typecheck}; ${manifest.commands.test}; ${manifest.commands.smoke}`,
    });
    if (manifest.capabilities.parallelAgents === 'adapter-required') {
      diagnostics.push({
        level: 'warning',
        code: 'TS_AGENT_KIT_ADAPTER_REQUIRED',
        message: 'Parallel agent execution requires a verified target-harness adapter. ts-agent-kit does not fake concurrency.',
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

async function readManifest(manifestPath: string, diagnostics: TsAgentKitDiagnostic[]): Promise<TsAgentKitProjectManifest | undefined> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as TsAgentKitProjectManifest;
    if (manifest.schemaVersion !== 1) {
      diagnostics.push({
        level: 'error',
        code: 'TS_AGENT_KIT_SCHEMA_VERSION',
        message: 'Unsupported ts-agent-kit schema version.',
        file: manifestPath,
      });
      return undefined;
    }
  return manifest;
  } catch (error) {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_MANIFEST',
      message: `Cannot read .ts-agent-kit/project.json: ${error instanceof Error ? error.message : String(error)}`,
      file: manifestPath,
    });
    return undefined;
  }
}

function validateManifestShape(manifest: TsAgentKitProjectManifest, manifestPath: string, diagnostics: TsAgentKitDiagnostic[]): void {
  if (!manifest.projectName || typeof manifest.projectName !== 'string') {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_PROJECT_NAME',
      message: 'Manifest projectName must be a non-empty string.',
      file: manifestPath,
    });
  }

  if (!Array.isArray(manifest.modules?.agents) || manifest.modules.agents.length === 0) {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_AGENTS',
      message: 'Manifest must declare at least one agent.',
      file: manifestPath,
    });
  }

  if (!Array.isArray(manifest.modules?.tools)) {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_TOOLS',
      message: 'Manifest modules.tools must be an array.',
      file: manifestPath,
    });
  }

  if (!Array.isArray(manifest.modules?.workflows) || !manifest.modules.workflows.includes('plan-execute-verify')) {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_WORKFLOWS',
      message: 'Manifest must declare the plan-execute-verify workflow.',
      file: manifestPath,
    });
  }
}

function validateManifestSemantics(manifest: TsAgentKitProjectManifest, manifestPath: string, diagnostics: TsAgentKitDiagnostic[]): void {
  if (manifest.modules.tools.includes('echo')) {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_FAKE_TOOL',
      message: 'The obsolete echo tool is not allowed. Generated projects must not fake agent success.',
      file: manifestPath,
    });
  }

  if (manifest.capabilities.parallelAgents === 'adapter-required' && manifest.harness === 'standalone') {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_PARALLEL_CAPABILITY',
      message: 'Standalone harness cannot require a parallel-agent adapter.',
      file: manifestPath,
    });
  }
}

async function expectFile(rootDir: string, relativePath: string, diagnostics: TsAgentKitDiagnostic[]): Promise<void> {
  const absolutePath = path.join(rootDir, relativePath);
  try {
    await access(absolutePath);
    diagnostics.push({
      level: 'info',
      code: 'TS_AGENT_KIT_FILE_PRESENT',
      message: `Found ${relativePath}`,
      file: absolutePath,
    });
  } catch {
    diagnostics.push({
      level: 'error',
      code: 'TS_AGENT_KIT_FILE_MISSING',
      message: `Missing ${relativePath}`,
      file: absolutePath,
    });
  }
}
