import type { LLMConfig, SkillExecutionContext } from '@aqua/shared';
import { SkillRegistry } from '../skills/registry.js';

export interface AgentOptions {
  id: string;
  name: string;
  llm: LLMConfig;
  skills: string[];
  systemPrompt?: string;
  skillRegistry: SkillRegistry;
}

export abstract class AgentBase {
  protected id: string;
  protected name: string;
  protected llm: LLMConfig;
  protected skills: string[];
  protected systemPrompt?: string;
  protected skillRegistry: SkillRegistry;
  protected status: 'idle' | 'running' | 'error' = 'idle';

  constructor(options: AgentOptions) {
    this.id = options.id;
    this.name = options.name;
    this.llm = options.llm;
    this.skills = options.skills;
    this.systemPrompt = options.systemPrompt;
    this.skillRegistry = options.skillRegistry;
  }

  abstract run(input: unknown): Promise<unknown>;

  protected async callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
    const { provider, model, apiKey, baseUrl } = this.llm;

    const response = await fetch(baseUrl || this.getDefaultEndpoint(provider), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM call failed: ${response.statusText}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content || '';
  }

  private getDefaultEndpoint(provider: string): string {
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  protected async executeSkill(
    skillId: string,
    params: Record<string, unknown>,
    context?: Partial<SkillExecutionContext>
  ) {
    return this.skillRegistry.execute(skillId, params, context);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): string {
    return this.status;
  }

  getSkills(): string[] {
    return [...this.skills];
  }
}
