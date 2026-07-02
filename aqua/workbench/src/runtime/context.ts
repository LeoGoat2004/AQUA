export interface ExecutionContext {
  requestId: string;
  agentId: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface ExecutionRequest {
  agentId: string;
  input: unknown;
  context?: Partial<ExecutionContext>;
}

export interface ExecutionResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
  context: ExecutionContext;
}

export class ContextManager {
  private contexts: Map<string, ExecutionContext> = new Map();

  create(requestId: string, agentId: string, overrides?: Partial<ExecutionContext>): ExecutionContext {
    const context: ExecutionContext = {
      requestId,
      agentId,
      sessionId: overrides?.sessionId,
      userId: overrides?.userId,
      timestamp: new Date(),
      metadata: overrides?.metadata || {},
    };

    this.contexts.set(requestId, context);
    return context;
  }

  get(requestId: string): ExecutionContext | undefined {
    return this.contexts.get(requestId);
  }

  update(requestId: string, updates: Partial<ExecutionContext>): ExecutionContext | undefined {
    const context = this.contexts.get(requestId);
    if (!context) return undefined;

    const updated = { ...context, ...updates };
    this.contexts.set(requestId, updated);
    return updated;
  }

  delete(requestId: string): boolean {
    return this.contexts.delete(requestId);
  }

  clear(): void {
    this.contexts.clear();
  }

  list(): ExecutionContext[] {
    return Array.from(this.contexts.values());
  }

  getByAgent(agentId: string): ExecutionContext[] {
    return this.list().filter((c) => c.agentId === agentId);
  }

  getBySession(sessionId: string): ExecutionContext[] {
    return this.list().filter((c) => c.sessionId === sessionId);
  }
}
