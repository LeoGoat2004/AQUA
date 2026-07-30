export {
  createProjectPlan,
  doctorProject,
  listPresets,
  normalizeCreateOptions,
  validateProject,
  writeProject,
} from './project.js';

export type {
  AquaCreateOptions,
  AquaDiagnostic,
  AquaFilePlan,
  AquaPreset,
  AquaProjectManifest,
  AquaProjectPlan,
  AquaValidationResult,
  HarnessTarget,
  PackageManager,
} from './types.js';
