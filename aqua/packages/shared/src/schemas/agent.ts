import { z } from 'zod';

export const AgentCapabilitySchema = z.enum([
  'routing',
  'execution',
  'reasoning',
  'coding',
  'search',
  'analysis',
  'creative',
  'custom',
]);

export const LLMConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'local', 'custom']),
  model: z.string().min(1),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  organization: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stop: z.array(z.string()).optional(),
  timeout: z.number().positive().optional(),
});

export const AgentMetadataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().min(1),
  capabilities: z.array(AgentCapabilitySchema),
  skills: z.array(z.string()),
  endpoints: z
    .object({
      a2a: z.string().url().optional(),
      mcp: z.string().url().optional(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AgentConfigSchema = z.object({
  agentId: z.string().min(1),
  llm: LLMConfigSchema,
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  enabled: z.boolean(),
  skills: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
});

export const AgentInstanceSchema = z.object({
  id: z.string().min(1),
  metadata: AgentMetadataSchema,
  config: AgentConfigSchema,
  status: z.enum(['idle', 'running', 'error', 'stopped']),
});

export const AgentExecutionResultSchema = z.object({
  agentId: z.string().min(1),
  success: z.boolean(),
  result: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number().nonnegative(),
  skillsUsed: z.array(z.string()),
});

export const AgentCardSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  capabilities: z.array(z.string()),
  skills: z.array(z.string()),
  endpoints: z.object({
    a2a: z.string().url().optional(),
    mcp: z.string().url().optional(),
  }),
  defaultInputModes: z.array(z.string()).optional(),
  defaultOutputModes: z.array(z.string()).optional(),
});

export const AgentConnectionSchema = z.object({
  sourceAgentId: z.string().min(1),
  targetAgentId: z.string().min(1),
  skillId: z.string().optional(),
  type: z.enum(['skill', 'delegate', 'collaborate']),
});

export const AgentTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['router', 'executor', 'researcher', 'coder', 'custom']),
  defaultConfig: AgentConfigSchema.partial(),
  requiredCapabilities: z.array(AgentCapabilitySchema),
  recommendedSkills: z.array(z.string()),
});

export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;
export type LLMConfigInput = z.infer<typeof LLMConfigSchema>;
export type AgentMetadataInput = z.infer<typeof AgentMetadataSchema>;
export type AgentConfigInput = z.infer<typeof AgentConfigSchema>;
export type AgentInstanceInput = z.infer<typeof AgentInstanceSchema>;
export type AgentExecutionResultInput = z.infer<typeof AgentExecutionResultSchema>;
export type AgentCardInput = z.infer<typeof AgentCardSchema>;
export type AgentConnectionInput = z.infer<typeof AgentConnectionSchema>;
export type AgentTemplateInput = z.infer<typeof AgentTemplateSchema>;
