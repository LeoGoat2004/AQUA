export type PackageManager = 'pnpm' | 'npm' | 'yarn';

export type HarnessTarget = 'standalone' | 'codex' | 'opencode' | 'claude-code';

export interface TsAgentKitPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly agents: readonly string[];
  readonly tools: readonly string[];
  readonly workflows: readonly string[];
}

export interface TsAgentKitCreateOptions {
  readonly name: string;
  readonly directory: string;
  readonly preset: string;
  readonly harness: HarnessTarget;
  readonly packageManager: PackageManager;
  readonly force: boolean;
}

export interface TsAgentKitProjectManifest {
  readonly schemaVersion: 1;
  readonly projectName: string;
  readonly preset: string;
  readonly harness: HarnessTarget;
  readonly packageManager: PackageManager;
  readonly modules: {
    readonly agents: readonly string[];
    readonly tools: readonly string[];
    readonly workflows: readonly string[];
  };
  readonly commands: {
    readonly install: string;
    readonly typecheck: string;
    readonly test: string;
    readonly smoke: string;
  };
  readonly capabilities: {
    readonly toolCalling: boolean;
    readonly localArtifacts: boolean;
    readonly trace: boolean;
    readonly verification: boolean;
    readonly parallelAgents: 'unsupported' | 'adapter-required';
  };
}

export interface TsAgentKitFilePlan {
  readonly relativePath: string;
  readonly content: string;
}

export interface TsAgentKitProjectPlan {
  readonly rootDir: string;
  readonly manifest: TsAgentKitProjectManifest;
  readonly files: readonly TsAgentKitFilePlan[];
}

export interface TsAgentKitDiagnostic {
  readonly level: 'error' | 'warning' | 'info';
  readonly code: string;
  readonly message: string;
  readonly file?: string;
}

export interface TsAgentKitValidationResult {
  readonly valid: boolean;
  readonly diagnostics: readonly TsAgentKitDiagnostic[];
}
