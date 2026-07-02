export type AgentCapability =
  | 'routing'
  | 'execution'
  | 'reasoning'
  | 'coding'
  | 'search'
  | 'analysis'
  | 'creative'
  | 'custom';

export interface AgentMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: AgentCapability[];
  skills: string[];
  endpoints?: {
    a2a?: string;
    mcp?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  agentId: string;
  llm: import('./agent/llm').LLMConfig;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
  skills: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentInstance {
  id: string;
  metadata: AgentMetadata;
  config: AgentConfig;
  status: 'idle' | 'running' | 'error' | 'stopped';
}

export interface AgentExecutionResult {
  agentId: string;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
  skillsUsed: string[];
}

export interface AgentCard {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  skills: string[];
  endpoints: {
    a2a?: string;
    mcp?: string;
  };
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
}

export interface AgentConnection {
  sourceAgentId: string;
  targetAgentId: string;
  skillId?: string;
  type: 'skill' | 'delegate' | 'collaborate';
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'router' | 'executor' | 'researcher' | 'coder' | 'custom';
  defaultConfig: Partial<AgentConfig>;
  requiredCapabilities: AgentCapability[];
  recommendedSkills: string[];
}

export * from './agent/llm';
