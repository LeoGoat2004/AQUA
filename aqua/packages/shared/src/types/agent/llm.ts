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
  stop?: string[];
  timeout?: number;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface LLMStreamResponse {
  content: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMError {
  code: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export type LLMProvider = 'openai' | 'anthropic' | 'local' | 'custom';

export interface LLMProviderConfig {
  provider: LLMProvider;
  models: string[];
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  maxContextLength: number;
}

export const LLM_PROVIDERS: Record<LLMProvider, LLMProviderConfig> = {
  openai: {
    provider: 'openai',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    maxContextLength: 128000,
  },
  anthropic: {
    provider: 'anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    maxContextLength: 200000,
  },
  local: {
    provider: 'local',
    models: ['llama2', 'codellama', 'mistral'],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    maxContextLength: 8192,
  },
  custom: {
    provider: 'custom',
    models: [],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    maxContextLength: 4096,
  },
};
