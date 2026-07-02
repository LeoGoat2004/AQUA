import type { SkillResult, SkillExecutionContext } from '@aqua/shared';
import { SkillRegistry } from '../skills/registry.js';

export interface ExecutionChain {
  id: string;
  steps: ExecutionStep[];
  currentStep: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ExecutionStep {
  stepId: string;
  skillId: string;
  params: Record<string, unknown>;
  result?: SkillResult;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface ExecutorOptions {
  skillRegistry: SkillRegistry;
  maxRetries?: number;
  timeout?: number;
}

export class TaskExecutor {
  private skillRegistry: SkillRegistry;
  private maxRetries: number;
  private timeout: number;

  constructor(options: ExecutorOptions) {
    this.skillRegistry = options.skillRegistry;
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000;
  }

  async executeSkill(
    skillId: string,
    params: Record<string, unknown>,
    context?: Partial<SkillExecutionContext>
  ): Promise<SkillResult> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(skillId, params, context);

        if (result.success) {
          return result;
        }

        lastError = new Error(result.error || 'Skill execution failed');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (attempt < this.maxRetries - 1) {
        await this.delay(100 * Math.pow(2, attempt));
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
      executionTime: 0,
    };
  }

  private async executeWithTimeout(
    skillId: string,
    params: Record<string, unknown>,
    context?: Partial<SkillExecutionContext>
  ): Promise<SkillResult> {
    return Promise.race([
      this.skillRegistry.execute(skillId, params, context),
      this.createTimeout(this.timeout),
    ]);
  }

  private createTimeout(ms: number): Promise<SkillResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timeout after ${ms}ms`));
      }, ms);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeChain(chain: ExecutionChain): Promise<ExecutionChain> {
    chain.status = 'running';

    for (let i = chain.currentStep; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      step.status = 'running';

      try {
        const result = await this.executeSkill(step.skillId, step.params);

        if (result.success) {
          step.result = result;
          step.status = 'completed';
          chain.currentStep = i + 1;
        } else {
          step.error = result.error;
          step.status = 'failed';
          chain.status = 'failed';
          break;
        }
      } catch (error) {
        step.error = error instanceof Error ? error.message : String(error);
        step.status = 'failed';
        chain.status = 'failed';
        break;
      }
    }

    if (chain.currentStep >= chain.steps.length) {
      chain.status = 'completed';
    }

    return chain;
  }

  createChain(steps: Array<{ skillId: string; params: Record<string, unknown> }>): ExecutionChain {
    return {
      id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      steps: steps.map((step, index) => ({
        stepId: `step_${index}`,
        skillId: step.skillId,
        params: step.params,
        status: 'pending' as const,
      })),
      currentStep: 0,
      status: 'pending',
    };
  }
}
