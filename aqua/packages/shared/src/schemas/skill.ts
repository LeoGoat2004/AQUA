import { z } from 'zod';

export const SkillParameterSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  description: z.string(),
  required: z.boolean(),
  default: z.unknown().optional(),
  enum: z.array(z.string()).optional(),
  schema: z.record(z.unknown()).optional(),
});

export const SkillDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().min(1),
  category: z.enum(['search', 'calculation', 'file', 'http', 'database', 'custom']),
  parameters: z.array(SkillParameterSchema),
  returns: z.object({
    type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
    description: z.string(),
  }),
  examples: z
    .array(
      z.object({
        input: z.record(z.unknown()),
        output: z.unknown(),
      }),
    )
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const SkillExecutionContextSchema = z.object({
  skillId: z.string().min(1),
  parameters: z.record(z.unknown()),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const SkillResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  executionTime: z.number().nonnegative(),
  tokensUsed: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const SkillInstanceSchema = z.object({
  id: z.string().min(1),
  definition: SkillDefinitionSchema,
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SkillTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: SkillDefinitionSchema.shape.category,
  templateCode: z.string().min(1),
  parameters: z.array(SkillParameterSchema),
});

export const SkillExecutionLogSchema = z.object({
  id: z.string().min(1),
  skillId: z.string().min(1),
  agentId: z.string().optional(),
  status: z.enum(['idle', 'running', 'success', 'error']),
  input: z.record(z.unknown()),
  output: z.unknown().optional(),
  error: z.string().optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number().nonnegative().optional(),
});

export type SkillParameter = z.infer<typeof SkillParameterSchema>;
export type SkillDefinitionInput = z.infer<typeof SkillDefinitionSchema>;
export type SkillExecutionContextInput = z.infer<typeof SkillExecutionContextSchema>;
export type SkillResultInput = z.infer<typeof SkillResultSchema>;
export type SkillInstanceInput = z.infer<typeof SkillInstanceSchema>;
export type SkillTemplateInput = z.infer<typeof SkillTemplateSchema>;
export type SkillExecutionLogInput = z.infer<typeof SkillExecutionLogSchema>;
