import { AgentBase, type AgentOptions } from './base.js';

export interface RouteResult {
  targetAgent?: string;
  targetSkill?: string;
  intent: string;
  confidence: number;
  reasoning: string;
}

export class RouterAgent extends AgentBase {
  private defaultSystemPrompt = `You are a router agent responsible for analyzing user input and determining:
1. Which agent should handle the request
2. Which skill should be used
3. The intent and confidence of the routing decision

You have access to the following skills:
{skills}

Respond with a JSON object containing:
- targetAgent: The ID of the agent to delegate to (if needed)
- targetSkill: The ID of the skill to use
- intent: A brief description of the user's intent
- confidence: A number between 0 and 1 indicating confidence
- reasoning: Brief explanation of the routing decision`;

  constructor(options: AgentOptions) {
    super(options);
  }

  async run(input: unknown): Promise<RouteResult> {
    this.status = 'running';

    try {
      const result = await this.route(input as string);
      this.status = 'idle';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async route(input: string): Promise<RouteResult> {
    const skillsList = this.skills.join(', ') || 'No skills available';

    const messages = [
      {
        role: 'system' as const,
        content: this.systemPrompt || this.defaultSystemPrompt.replace('{skills}', skillsList),
      },
      {
        role: 'user' as const,
        content: input,
      },
    ];

    try {
      const response = await this.callLLM(messages);
      return this.parseRouteResponse(response);
    } catch (error) {
      return {
        intent: 'fallback',
        confidence: 0,
        reasoning: `Routing failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private parseRouteResponse(response: string): RouteResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          targetAgent: parsed.targetAgent,
          targetSkill: parsed.targetSkill,
          intent: parsed.intent || 'unknown',
          confidence: parsed.confidence ?? 0.5,
          reasoning: parsed.reasoning || 'No reasoning provided',
        };
      }
    } catch {
      // Fall through to default
    }

    return {
      intent: 'general',
      confidence: 0.5,
      reasoning: 'Could not parse LLM response, using default routing',
    };
  }
}
