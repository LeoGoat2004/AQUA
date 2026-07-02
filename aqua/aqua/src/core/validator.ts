import { z } from 'zod';
import { schemas } from '@aqua/shared';

export class ConfigValidator {
  static validate(data: unknown): { success: boolean; errors?: string[]; data?: unknown } {
    try {
      const validData = schemas.HarnessConfigSchema.parse(data);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  static partialValidate(data: unknown): { success: boolean; errors?: string[] } {
    try {
      const partialSchema = schemas.HarnessConfigSchema.partial();
      partialSchema.parse(data);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  static getSchema() {
    return schemas.HarnessConfigSchema;
  }
}
