export type ToolProvider = 'mcp' | 'builtin' | 'custom';

export type ToolConfigFieldType = 'string' | 'number' | 'boolean' | 'select' | 'secret' | 'url';

export interface ToolConfigField {
  key: string;
  type: ToolConfigFieldType;
  label: string;
  description?: string;
  required: boolean;
  default?: unknown;
  options?: string[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ToolDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  provider: ToolProvider;
  category: 'search' | 'calculation' | 'file' | 'http' | 'database' | 'custom';
  configFields: ToolConfigField[];
  capabilities: string[];
  authentication?: {
    type: 'api_key' | 'oauth' | 'basic' | 'bearer';
    required: boolean;
  };
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  metadata?: Record<string, unknown>;
}

export interface ToolConfig {
  toolId: string;
  enabled: boolean;
  config: Record<string, unknown>;
  auth?: {
    type: string;
    credentials: Record<string, string>;
  };
}

export interface ToolInstance {
  id: string;
  definition: ToolDefinition;
  config: ToolConfig;
  status: 'idle' | 'active' | 'error' | 'disabled';
  lastUsed?: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
  autoStart: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  config: MCPServerConfig;
  status: 'stopped' | 'running' | 'error';
  tools: MCPTool[];
  resources: {
    uri: string;
    name: string;
    description: string;
    mimeType?: string;
  }[];
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
  content?: string;
}

export interface MCPToolCall {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  tool: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export const TOOL_PROVIDERS: Record<ToolProvider, string> = {
  mcp: 'Model Context Protocol',
  builtin: 'Built-in Tool',
  custom: 'Custom Implementation',
};

export const TOOL_CATEGORIES = [
  { value: 'search', label: 'Search', icon: 'search' },
  { value: 'calculation', label: 'Calculation', icon: 'calculator' },
  { value: 'file', label: 'File Operations', icon: 'file' },
  { value: 'http', label: 'HTTP Request', icon: 'globe' },
  { value: 'database', label: 'Database', icon: 'database' },
  { value: 'custom', label: 'Custom', icon: 'settings' },
] as const;
