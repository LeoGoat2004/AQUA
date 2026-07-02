import { z } from 'zod';
import { LLMConfigSchema } from './agent';

export const MCPResourceConfigSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string(),
  mimeType: z.string().optional(),
});

export const MCPServerConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  command: z.string().min(1),
  args: z.array(z.string()),
  env: z.record(z.string()).optional(),
  enabled: z.boolean(),
  autoStart: z.boolean(),
});

export const MCPConfigSchema = z.object({
  servers: z.array(MCPServerConfigSchema),
  resources: z.array(MCPResourceConfigSchema),
});

export const AgentConfigBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['router', 'executor', 'custom']),
  enabled: z.boolean(),
  llm: LLMConfigSchema,
  systemPrompt: z.string().optional(),
  skills: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
});

export const SkillConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

export const ToolConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  config: z.record(z.unknown()),
});

export const RegistryConfigSchema = z.object({
  type: z.enum(['local', 'remote']),
  url: z.string().url().optional(),
  authToken: z.string().optional(),
});

export const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']),
  format: z.enum(['json', 'text']),
  output: z.enum(['console', 'file', 'both']),
  filePath: z.string().optional(),
});

export const SecurityConfigSchema = z.object({
  enableAuth: z.boolean(),
  allowedOrigins: z.array(z.string()).optional(),
  apiKeyHeader: z.string().optional(),
  rateLimit: z
    .object({
      windowMs: z.number().positive(),
      maxRequests: z.number().int().positive(),
    })
    .optional(),
});

export const HarnessConfigSchema = z.object({
  projectName: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().optional(),
  llm: LLMConfigSchema,
  mcp: MCPConfigSchema,
  agents: z.array(AgentConfigBaseSchema),
  skills: z.array(SkillConfigSchema),
  tools: z.array(ToolConfigSchema),
  registry: RegistryConfigSchema.optional(),
  logging: LoggingConfigSchema.optional(),
  security: SecurityConfigSchema.optional(),
});

export const WorkbenchConfigSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().optional(),
  runtime: z.object({
    type: z.enum(['node', 'browser']),
    entryPoint: z.string().min(1),
    exports: z.array(z.string()),
  }),
  agents: z.array(AgentConfigBaseSchema),
  skills: z.array(SkillConfigSchema),
  tools: z.array(ToolConfigSchema),
});

export type MCPResourceConfigInput = z.infer<typeof MCPResourceConfigSchema>;
export type MCPServerConfigInput = z.infer<typeof MCPServerConfigSchema>;
export type MCPConfigInput = z.infer<typeof MCPConfigSchema>;
export type AgentConfigBaseInput = z.infer<typeof AgentConfigBaseSchema>;
export type SkillConfigInput = z.infer<typeof SkillConfigSchema>;
export type ToolConfigInput = z.infer<typeof ToolConfigSchema>;
export type RegistryConfigInput = z.infer<typeof RegistryConfigSchema>;
export type LoggingConfigInput = z.infer<typeof LoggingConfigSchema>;
export type SecurityConfigInput = z.infer<typeof SecurityConfigSchema>;
export type HarnessConfigInput = z.infer<typeof HarnessConfigSchema>;
export type WorkbenchConfigInput = z.infer<typeof WorkbenchConfigSchema>;
