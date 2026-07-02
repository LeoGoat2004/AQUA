export interface MemoryEntry {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface MemoryOptions {
  maxEntries?: number;
  sessionId?: string;
}

export class Memory {
  private entries: MemoryEntry[] = [];
  private maxEntries: number;
  private sessionId?: string;

  constructor(options: MemoryOptions = {}) {
    this.maxEntries = options.maxEntries || 100;
    this.sessionId = options.sessionId;
  }

  add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const memoryEntry: MemoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.entries.push(memoryEntry);

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    return memoryEntry;
  }

  addUserMessage(content: string, metadata?: Record<string, unknown>): MemoryEntry {
    return this.add({ role: 'user', content, metadata });
  }

  addAssistantMessage(content: string, metadata?: Record<string, unknown>): MemoryEntry {
    return this.add({ role: 'assistant', content, metadata });
  }

  addSystemMessage(content: string, metadata?: Record<string, unknown>): MemoryEntry {
    return this.add({ role: 'system', content, metadata });
  }

  getHistory(limit?: number): MemoryEntry[] {
    if (limit) {
      return this.entries.slice(-limit);
    }
    return [...this.entries];
  }

  getRecentMessages(count: number): MemoryEntry[] {
    return this.entries.slice(-count);
  }

  clear(): void {
    this.entries = [];
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  getCount(): number {
    return this.entries.length;
  }

  search(query: string): MemoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter((entry) =>
      entry.content.toLowerCase().includes(lowerQuery)
    );
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class MemoryManager {
  private memories: Map<string, Memory> = new Map();

  getOrCreate(sessionId: string, options?: MemoryOptions): Memory {
    let memory = this.memories.get(sessionId);
    if (!memory) {
      memory = new Memory({ ...options, sessionId });
      this.memories.set(sessionId, memory);
    }
    return memory;
  }

  delete(sessionId: string): boolean {
    const memory = this.memories.get(sessionId);
    if (memory) {
      memory.clear();
      return this.memories.delete(sessionId);
    }
    return false;
  }

  clear(): void {
    for (const memory of this.memories.values()) {
      memory.clear();
    }
    this.memories.clear();
  }

  listSessions(): string[] {
    return Array.from(this.memories.keys());
  }

  getMemory(sessionId: string): Memory | undefined {
    return this.memories.get(sessionId);
  }
}
