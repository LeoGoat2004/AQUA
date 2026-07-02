import type { MCPTool, MCPResource, MCPToolCall, MCPToolResult } from '@aqua/shared';

export class MCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private toolHandlers: Map<string, (args: Record<string, unknown>) => Promise<unknown>> = new Map();

  registerTool(tool: MCPTool, handler: (args: Record<string, unknown>) => Promise<unknown>): void {
    this.tools.set(tool.name, tool);
    this.toolHandlers.set(tool.name, handler);
  }

  unregisterTool(name: string): boolean {
    this.toolHandlers.delete(name);
    return this.tools.delete(name);
  }

  registerResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource);
  }

  unregisterResource(uri: string): boolean {
    return this.resources.delete(uri);
  }

  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  listResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  async callTool(call: MCPToolCall): Promise<MCPToolResult> {
    const handler = this.toolHandlers.get(call.tool);

    if (!handler) {
      return {
        tool: call.tool,
        success: false,
        error: `Tool not found: ${call.tool}`,
      };
    }

    try {
      const result = await handler(call.arguments);
      return {
        tool: call.tool,
        success: true,
        result,
      };
    } catch (error) {
      return {
        tool: call.tool,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  getResource(uri: string): MCPResource | undefined {
    return this.resources.get(uri);
  }

  async getResourceContent(uri: string): Promise<string | undefined> {
    const resource = this.resources.get(uri);
    return resource?.content;
  }
}

export function createMCPServer(): MCPServer {
  return new MCPServer();
}
