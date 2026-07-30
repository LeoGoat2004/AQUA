export {
  createProjectPlan,
  doctorProject,
  listPresets,
  normalizeCreateOptions,
  validateProject,
  writeProject,
} from './project.js';

export type {
  HarnessTarget,
  PackageManager,
  TsAgentKitCreateOptions,
  TsAgentKitDiagnostic,
  TsAgentKitFilePlan,
  TsAgentKitPreset,
  TsAgentKitProjectManifest,
  TsAgentKitProjectPlan,
  TsAgentKitValidationResult,
} from './types.js';
