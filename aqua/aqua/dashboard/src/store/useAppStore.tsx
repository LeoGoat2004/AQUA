import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';

export interface LLMConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  systemPrompt: string;
  skills: string[];
}

export interface SkillConfig {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  description: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  description: string;
}

export interface AppConfig {
  projectName: string;
  version: string;
  description: string;
  llm: LLMConfig;
  agents: AgentConfig[];
  skills: SkillConfig[];
  tools: ToolConfig[];
}

const DEFAULT_CONFIG: AppConfig = {
  projectName: 'my-ai-app',
  version: '0.1.0',
  description: 'AI Agent application built with AQUA',
  llm: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    apiKey: '',
  },
  agents: [],
  skills: [],
  tools: [],
};

function loadConfig(): AppConfig {
  try {
    const stored = localStorage.getItem('aqua-dashboard-config');
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_CONFIG;
}

type Action =
  | { type: 'SET_PROJECT'; payload: { name: string; version: string; description: string } }
  | { type: 'SET_LLM'; payload: LLMConfig }
  | { type: 'ADD_AGENT'; payload: AgentConfig }
  | { type: 'UPDATE_AGENT'; payload: { id: string; data: Partial<AgentConfig> } }
  | { type: 'DELETE_AGENT'; payload: string }
  | { type: 'ADD_SKILL'; payload: SkillConfig }
  | { type: 'UPDATE_SKILL'; payload: { id: string; data: Partial<SkillConfig> } }
  | { type: 'DELETE_SKILL'; payload: string }
  | { type: 'ADD_TOOL'; payload: ToolConfig }
  | { type: 'UPDATE_TOOL'; payload: { id: string; data: Partial<ToolConfig> } }
  | { type: 'DELETE_TOOL'; payload: string }
  | { type: 'RESET' };

function reducer(state: AppConfig, action: Action): AppConfig {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, ...action.payload };
    case 'SET_LLM':
      return { ...state, llm: action.payload };
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.payload] };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.data } : a
        ),
      };
    case 'DELETE_AGENT':
      return { ...state, agents: state.agents.filter((a) => a.id !== action.payload) };
    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, action.payload] };
    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.data } : s
        ),
      };
    case 'DELETE_SKILL':
      return { ...state, skills: state.skills.filter((s) => s.id !== action.payload) };
    case 'ADD_TOOL':
      return { ...state, tools: [...state.tools, action.payload] };
    case 'UPDATE_TOOL':
      return {
        ...state,
        tools: state.tools.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.data } : t
        ),
      };
    case 'DELETE_TOOL':
      return { ...state, tools: state.tools.filter((t) => t.id !== action.payload) };
    case 'RESET':
      return DEFAULT_CONFIG;
    default:
      return state;
  }
}

interface AppStoreContextValue {
  config: AppConfig;
  dispatch: Dispatch<Action>;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [config, dispatch] = useReducer(reducer, null, loadConfig);

  useEffect(() => {
    localStorage.setItem('aqua-dashboard-config', JSON.stringify(config));
  }, [config]);

  return (
    <AppStoreContext.Provider value={{ config, dispatch }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}