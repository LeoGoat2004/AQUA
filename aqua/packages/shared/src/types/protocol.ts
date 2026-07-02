export type ProtocolType = 'mcp' | 'a2a' | 'both';

export interface ProtocolConfig {
  type: ProtocolType;
  mcp?: MCPProtocolConfig;
  a2a?: A2AProtocolConfig;
}

export interface MCPProtocolConfig {
  enabled: boolean;
  port?: number;
  host?: string;
  servers?: string[];
}

export interface A2AProtocolConfig {
  enabled: boolean;
  agentCardUrl?: string;
  discoveryUrl?: string;
}

export interface A2AMessage {
  messageId: string;
  agentId: string;
  type: 'request' | 'response' | 'event';
  action: string;
  payload: unknown;
  timestamp: Date;
  correlationId?: string;
}

export interface A2ARequest {
  action: string;
  parameters?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface A2AResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface A2ATask {
  taskId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  request: A2ARequest;
  response?: A2AResponse;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface A2AAgentInfo {
  agentId: string;
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

export interface A2ADiscoveryResult {
  agents: A2AAgentInfo[];
  timestamp: Date;
}

export interface A2AConnection {
  sourceAgentId: string;
  targetAgentId: string;
  targetAgent?: A2AAgentInfo;
  type: 'skill' | 'delegate' | 'collaborate';
  status: 'connected' | 'disconnected' | 'error';
}

export interface ProtocolCapability {
  name: string;
  description: string;
  version: string;
  supported: boolean;
}

export const PROTOCOL_CAPABILITIES = {
  mcp: {
    name: 'Model Context Protocol',
    description: 'Standard protocol for AI-tool communication',
    version: '1.0',
    features: ['tools', 'resources', 'prompts'],
  },
  a2a: {
    name: 'Agent-to-Agent Protocol',
    description: 'Standard protocol for agent collaboration',
    version: '1.0',
    features: ['agent_discovery', 'task_delegation', 'event_streaming'],
  },
} as const;

export type ProtocolFeature = 'tools' | 'resources' | 'prompts' | 'agent_discovery' | 'task_delegation' | 'event_streaming';
