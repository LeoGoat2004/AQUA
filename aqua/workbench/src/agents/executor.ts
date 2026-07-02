import { AgentBase, type AgentOptions } from './base.js';
import type { SkillExecutionContext } from '@aqua/shared';

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  skillsUsed: string[];
  steps: Array<{
    skillId: string;
    success: boolean;
    result?: unknown;
    error?: string;
  }>;
}

export class ExecutorAgent extends AgentBase {
  constructor(options: AgentOptions) {
    super(options);
  }

  async run(input: unknown): Promise<ExecutionResult> {
    this.status = 'running';

    try {
      const result = await this.execute(input);
      this.status = 'idle';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async execute(input: unknown): Promise<ExecutionResult> {
    const steps: ExecutionResult['steps'] = [];
    const skillsUsed: string[] = [];

    if (this.skills.length === 0) {
      return {
        success: false,
        error: 'No skills available for execution',
        skillsUsed: [],
        steps: [],
      };
    }

    const primarySkill = this.skills[0];
    skillsUsed.push(primarySkill);

    try {
      const context: Partial<SkillExecutionContext> = {
        agentId: this.id,
        metadata: { originalInput: input },
      };

      const skillResult = await this.executeSkill(
        primarySkill,
        typeof input === 'string' ? { input } : (input as Record<string, unknown>),
        context
      );

      steps.push({
        skillId: primarySkill,
        success: skillResult.success,
        result: skillResult.output,
        error: skillResult.error,
      });

      return {
        success: skillResult.success,
        output: skillResult.output,
        error: skillResult.error,
        skillsUsed,
        steps,
      };
    } catch (error) {
      steps.push({
        skillId: primarySkill,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        skillsUsed,
        steps,
      };
    }
  }
}
