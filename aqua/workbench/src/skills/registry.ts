import fs from 'fs';
import path from 'path';
import type { SkillDefinition, SkillExecutionContext, SkillResult, SkillParameter } from '@aqua/shared';

export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private handlers: Map<string, (params: Record<string, unknown>) => Promise<unknown>> = new Map();

  register(definition: SkillDefinition, handler?: (params: Record<string, unknown>) => Promise<unknown>): void {
    this.skills.set(definition.id, definition);
    if (handler) {
      this.handlers.set(definition.id, handler);
    }
  }

  unregister(id: string): boolean {
    this.handlers.delete(id);
    return this.skills.delete(id);
  }

  get(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  list(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  search(category?: string): SkillDefinition[] {
    const all = this.list();
    if (!category) return all;
    return all.filter((skill) => skill.category === category);
  }

  has(id: string): boolean {
    return this.skills.has(id);
  }

  async execute(
    skillId: string,
    params: Record<string, unknown>,
    context?: Partial<SkillExecutionContext>
  ): Promise<SkillResult> {
    const startTime = Date.now();
    const definition = this.skills.get(skillId);

    if (!definition) {
      return {
        success: false,
        error: `Skill not found: ${skillId}`,
        executionTime: 0,
      };
    }

    const handler = this.handlers.get(skillId);

    if (!handler) {
      return {
        success: false,
        error: `No handler registered for skill: ${skillId}`,
        executionTime: 0,
      };
    }

    try {
      const validatedParams = this.validateParams(definition, params);
      const output = await handler(validatedParams);

      return {
        success: true,
        output,
        executionTime: Date.now() - startTime,
        metadata: {
          skillId,
          context,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  private validateParams(definition: SkillDefinition, params: Record<string, unknown>): Record<string, unknown> {
    const validated: Record<string, unknown> = {};

    for (const param of definition.parameters) {
      const value = params[param.name];

      if (param.required && value === undefined) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }

      if (value !== undefined) {
        if (!this.validateParamType(param, value)) {
          throw new Error(
            `Invalid type for parameter ${param.name}: expected ${param.type}, got ${typeof value}`
          );
        }
        validated[param.name] = value;
      } else if (param.default !== undefined) {
        validated[param.name] = param.default;
      }
    }

    return validated;
  }

  private validateParamType(param: SkillParameter, value: unknown): boolean {
    switch (param.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  registerBuiltInSkills(): void {
    this.register({
      id: 'calculator',
      name: 'Calculator',
      version: '1.0.0',
      description: 'Perform mathematical calculations',
      category: 'calculation',
      parameters: [
        {
          name: 'expression',
          type: 'string',
          description: 'Mathematical expression to evaluate',
          required: true,
        },
      ],
      returns: {
        type: 'number',
        description: 'Result of the calculation',
      },
    }, async (params) => {
      const expression = params.expression as string;
      const sanitized = expression.replace(/[^0-9+\-*/.()% ]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      return { expression, result };
    });

    this.register({
      id: 'search',
      name: 'Search',
      version: '1.0.0',
      description: 'Search the web or internal knowledge base',
      category: 'search',
      parameters: [
        {
          name: 'query',
          type: 'string',
          description: 'Search query',
          required: true,
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of results',
          required: false,
          default: 5,
        },
      ],
      returns: {
        type: 'array',
        description: 'Search results',
      },
    }, async (params) => {
      const query = (params.query as string).toLowerCase();
      const limit = (params.limit as number) || 5;
      const results: Array<{ path: string; name: string; type: string; size: number }> = [];

      function searchDir(dir: string, depth: number): void {
        if (results.length >= limit || depth > 3) return;
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (results.length >= limit) break;
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.name.toLowerCase().includes(query)) {
              try {
                const stat = fs.statSync(fullPath);
                results.push({
                  path: fullPath,
                  name: entry.name,
                  type: entry.isDirectory() ? 'directory' : 'file',
                  size: stat.size,
                });
              } catch { /* skip inaccessible files */ }
            }
            if (entry.isDirectory() && results.length < limit) {
              searchDir(fullPath, depth + 1);
            }
          }
        } catch { /* skip inaccessible directories */ }
      }

      searchDir(process.cwd(), 0);

      return {
        query: params.query,
        results,
        total: results.length,
        searchedIn: process.cwd(),
      };
    });

    this.register({
      id: 'file_ops',
      name: 'File Operations',
      version: '1.0.0',
      description: 'Read, write, and manipulate files',
      category: 'file',
      parameters: [
        {
          name: 'operation',
          type: 'string',
          description: 'Operation to perform (read, write, list)',
          required: true,
          enum: ['read', 'write', 'list'],
        },
        {
          name: 'path',
          type: 'string',
          description: 'File path',
          required: true,
        },
        {
          name: 'content',
          type: 'string',
          description: 'Content to write (for write operation)',
          required: false,
        },
      ],
      returns: {
        type: 'object',
        description: 'Operation result',
      },
    }, async (params) => {
      const operation = params.operation as string;
      const filePath = path.resolve(params.path as string);
      const content = params.content as string | undefined;

      switch (operation) {
        case 'read': {
          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            const entries = fs.readdirSync(filePath, { withFileTypes: true });
            return {
              operation: 'read',
              path: filePath,
              type: 'directory',
              entries: entries.map((e) => ({
                name: e.name,
                type: e.isDirectory() ? 'directory' : 'file',
              })),
            };
          }
          const data = fs.readFileSync(filePath, 'utf-8');
          return {
            operation: 'read',
            path: filePath,
            type: 'file',
            content: data,
            size: stat.size,
          };
        }
        case 'write': {
          if (content === undefined) {
            throw new Error('Content is required for write operation');
          }
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(filePath, content, 'utf-8');
          return {
            operation: 'write',
            path: filePath,
            bytesWritten: Buffer.byteLength(content, 'utf-8'),
          };
        }
        case 'list': {
          const targetPath = filePath;
          if (!fs.existsSync(targetPath)) {
            throw new Error(`Path not found: ${targetPath}`);
          }
          const stat = fs.statSync(targetPath);
          if (!stat.isDirectory()) {
            return {
              operation: 'list',
              path: targetPath,
              type: 'file',
              name: path.basename(targetPath),
              size: stat.size,
              modified: stat.mtime.toISOString(),
            };
          }
          const entries = fs.readdirSync(targetPath, { withFileTypes: true });
          return {
            operation: 'list',
            path: targetPath,
            type: 'directory',
            entries: entries.map((e) => {
              let size = 0;
              try { size = fs.statSync(path.join(targetPath, e.name)).size; } catch { /* skip */ }
              return {
                name: e.name,
                type: e.isDirectory() ? 'directory' : 'file',
                size,
              };
            }),
          };
        }
        default:
          throw new Error(`Unknown operation: ${operation}. Supported: read, write, list`);
      }
    });
  }
}
