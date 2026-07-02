export type SkillParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SkillParameter {
  name: string;
  type: SkillParameterType;
  description: string;
  required: boolean;
  default?: unknown;
  enum?: string[];
  schema?: Record<string, unknown>;
}

export interface SkillDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'search' | 'calculation' | 'file' | 'http' | 'database' | 'custom';
  parameters: SkillParameter[];
  returns: {
    type: SkillParameterType;
    description: string;
  };
  examples?: {
    input: Record<string, unknown>;
    output: unknown;
  }[];
  metadata?: Record<string, unknown>;
}

export interface SkillExecutionContext {
  skillId: string;
  parameters: Record<string, unknown>;
  agentId?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface SkillResult {
  success: boolean;
  output?: unknown;
  error?: string;
  executionTime: number;
  tokensUsed?: number;
  metadata?: Record<string, unknown>;
}

export interface SkillInstance {
  id: string;
  definition: SkillDefinition;
  enabled: boolean;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillRegistry {
  skills: Map<string, SkillDefinition>;
  get(id: string): SkillDefinition | undefined;
  register(definition: SkillDefinition): void;
  unregister(id: string): boolean;
  list(): SkillDefinition[];
  search(category?: string): SkillDefinition[];
}

export interface SkillTemplate {
  id: string;
  name: string;
  description: string;
  category: SkillDefinition['category'];
  templateCode: string;
  parameters: SkillParameter[];
}

export type SkillStatus = 'idle' | 'running' | 'success' | 'error';

export interface SkillExecutionLog {
  id: string;
  skillId: string;
  agentId?: string;
  status: SkillStatus;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface BuiltInSkill {
  id: string;
  name: string;
  description: string;
  execute: (context: SkillExecutionContext) => Promise<SkillResult>;
}

export const BUILT_IN_SKILLS: Record<string, { name: string; description: string }> = {
  search: {
    name: 'Search',
    description: 'Search the web or internal knowledge base',
  },
  calculator: {
    name: 'Calculator',
    description: 'Perform mathematical calculations',
  },
  file_ops: {
    name: 'File Operations',
    description: 'Read, write, and manipulate files',
  },
  http_request: {
    name: 'HTTP Request',
    description: 'Make HTTP requests to external APIs',
  },
  database: {
    name: 'Database',
    description: 'Query and manipulate databases',
  },
};
