export interface HarnessConfig {
  projectName: string;
  version: string;
  description?: string;
  llm: LLMConfig;
  mcp: MCPConfig;
  agents: WorkbenchAgentConfig[];
  skills: SkillConfig[];
  tools: ToolConfig[];
  registry?: RegistryConfig;
  logging?: LoggingConfig;
  security?: SecurityConfig;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface MCPConfig {
  servers: MCPServerConfig[];
  resources: MCPResourceConfig[];
}

export interface MCPServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
  autoStart: boolean;
}

export interface MCPResourceConfig {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export interface WorkbenchAgentConfig {
  id: string;
  name: string;
  type: 'router' | 'executor' | 'custom';
  enabled: boolean;
  llm: LLMConfig;
  systemPrompt?: string;
  skills: string[];
  metadata?: Record<string, unknown>;
}

export interface SkillConfig {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface ToolConfig {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface RegistryConfig {
  type: 'local' | 'remote';
  url?: string;
  authToken?: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  filePath?: string;
}

export interface SecurityConfig {
  enableAuth: boolean;
  allowedOrigins?: string[];
  apiKeyHeader?: string;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface WorkbenchConfig {
  name: string;
  version: string;
  description?: string;
  runtime: RuntimeConfig;
  agents: WorkbenchAgentConfig[];
  skills: SkillConfig[];
  tools: ToolConfig[];
}

export interface RuntimeConfig {
  type: 'node' | 'browser';
  entryPoint: string;
  exports: string[];
}

export type ConfigKey = keyof HarnessConfig;
export type ConfigValidator = (value: unknown) => boolean;
