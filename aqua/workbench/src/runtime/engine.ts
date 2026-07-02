import type {
  AgentInstance,
  WorkbenchAgentConfig,
  AgentExecutionResult,
  SkillResult,
  SkillExecutionContext,
  AgentCapability,
} from '@aqua/shared';
import { SkillRegistry } from '../skills/registry.js';
import { RouterAgent } from '../agents/router.js';
import { ExecutorAgent } from '../agents/executor.js';
import type { AgentBase } from '../agents/base.js';

export interface WorkbenchConfig {
  agents: WorkbenchAgentConfig[];
  skills: Array<{ id: string; enabled: boolean; config?: Record<string, unknown> }>;
  llm: {
    baseUrl?: string;
    model: string;
    apiKey?: string;
    provider?: 'openai' | 'anthropic' | 'local' | 'custom';
  };
}

export interface WorkbenchAgentInstance extends Omit<AgentInstance, 'config'> {
  config: WorkbenchAgentConfig;
  agent: AgentBase;
}

export interface WorkbenchOptions {
  config: WorkbenchConfig;
  skillRegistry?: SkillRegistry;
}

export class WorkbenchEngine {
  private agents: Map<string, WorkbenchAgentInstance> = new Map();
  private skillRegistry: SkillRegistry;
  private config: WorkbenchConfig;
  private initialized = false;

  constructor(options: WorkbenchOptions) {
    this.config = options.config;
    this.skillRegistry = options.skillRegistry || new SkillRegistry();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.skillRegistry.registerBuiltInSkills();

    for (const agentConfig of this.config.agents) {
      if (!agentConfig.enabled) continue;

      const agentInstance = this.createAgent(agentConfig);
      this.agents.set(agentConfig.id, agentInstance);
    }

    this.initialized = true;
  }

  private createAgent(config: WorkbenchAgentConfig): WorkbenchAgentInstance {
    const llmConfig = {
      provider: (config.llm.provider || 'custom') as 'openai' | 'anthropic' | 'local' | 'custom',
      model: config.llm.model,
      apiKey: config.llm.apiKey,
      baseUrl: config.llm.baseUrl,
    };

    let agentImpl: AgentBase;

    switch (config.type) {
      case 'router':
        agentImpl = new RouterAgent({
          id: config.id,
          name: config.name,
          llm: llmConfig,
          skills: config.skills,
          systemPrompt: config.systemPrompt,
          skillRegistry: this.skillRegistry,
        });
        break;

      case 'executor':
        agentImpl = new ExecutorAgent({
          id: config.id,
          name: config.name,
          llm: llmConfig,
          skills: config.skills,
          systemPrompt: config.systemPrompt,
          skillRegistry: this.skillRegistry,
        });
        break;

      default:
        throw new Error(`Unknown agent type: ${config.type}`);
    }

    return {
      id: config.id,
      metadata: {
        id: config.id,
        name: config.name,
        version: '0.1.0',
        description: `Agent: ${config.name}`,
        capabilities: this.getAgentCapabilities(config.type),
        skills: config.skills,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      config,
      agent: agentImpl,
      status: 'idle',
    };
  }

  private getAgentCapabilities(type: string): AgentCapability[] {
    switch (type) {
      case 'router':
        return ['routing', 'reasoning'];
      case 'executor':
        return ['execution', 'reasoning'];
      default:
        return ['custom'];
    }
  }

  async execute(agentId: string, input: unknown): Promise<AgentExecutionResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const startTime = Date.now();
    agent.status = 'running';

    try {
      let result: unknown;

      if (agent.config.type === 'router') {
        const router = agent.agent as RouterAgent;
        result = await router.route(input as string);
      } else if (agent.config.type === 'executor') {
        const executor = agent.agent as ExecutorAgent;
        result = await executor.execute(input);
      } else {
        throw new Error(`Unknown agent type: ${agent.config.type}`);
      }

      agent.status = 'idle';

      return {
        agentId,
        success: true,
        result,
        duration: Date.now() - startTime,
        skillsUsed: agent.config.skills,
      };
    } catch (error) {
      agent.status = 'error';

      return {
        agentId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        skillsUsed: [],
      };
    }
  }

  async executeSkill(
    skillId: string,
    params: Record<string, unknown>,
    context?: Partial<SkillExecutionContext>
  ): Promise<SkillResult> {
    return this.skillRegistry.execute(skillId, params, context);
  }

  getAgent(id: string): WorkbenchAgentInstance | undefined {
    return this.agents.get(id);
  }

  listAgents(): WorkbenchAgentInstance[] {
    return Array.from(this.agents.values());
  }

  getSkillRegistry(): SkillRegistry {
    return this.skillRegistry;
  }

  getConfig(): WorkbenchConfig {
    return this.config;
  }

  async shutdown(): Promise<void> {
    for (const agent of this.agents.values()) {
      agent.status = 'stopped';
    }
    this.agents.clear();
    this.initialized = false;
  }
}

export function createWorkbench(config: WorkbenchConfig): WorkbenchEngine {
  const engine = new WorkbenchEngine({ config });
  return engine;
}
