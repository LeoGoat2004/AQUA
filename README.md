# AQUA

> AI 应用 Agent 工作台 — AI Application Agent Workbench

用于快速构建和配置 AI 应用的 Agent 架构。

## 应用场景

想要快速搭建一个 AI Agent 应用，又不想从零写代码。用 AQUA 的 CLI 创建项目、添加 agent 和 skill，配置好 LLM，一键生成可运行的 Workbench 代码包。也可以打开仪表盘，在可视化界面里管理所有配置，实时看到 agent 架构全貌。

## 特性

- 🚀 **快速开发** - 通过 CLI 和可视化界面快速创建 AI Agent 应用
- 🎨 **模块化设计** - Agent、Skill、Tool 可插拔，易于扩展
- 🔧 **配置驱动** - 基于 Zod Schema 的配置系统，类型安全
- 📦 **代码生成** - 一键生成完整的 Workbench 代码
- 🌐 **协议支持** - 支持 MCP (Model Context Protocol) 和 A2A (Agent-to-Agent) 协议
- 💻 **CLI 工具** - 完整的命令行界面，无 GUI 也能高效工作

## 技术栈

- **包管理**: pnpm workspace (Monorepo)
- **构建**: Turbo
- **CLI**: Node.js + TypeScript + Commander.js
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **协议**: MCP + A2A
- **配置**: Zod Schema

## 快速开始

### 安装

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 启动仪表盘

```bash
node aqua/dist/aqua/src/cli/index.js serve
```

浏览器访问 `http://localhost:3000`，在可视化界面中管理 Agent、Skill、LLM 配置等。

### 使用 CLI 创建项目

```bash
# 创建新项目
node aqua/dist/aqua/src/cli/index.js create my-app

# 进入项目目录
cd project/my-app

# 安装依赖
pnpm install
```

### 添加模块

```bash
# 添加 Agent
node aqua/dist/aqua/src/cli/index.js add agent router

# 添加 Skill
node aqua/dist/aqua/src/cli/index.js add skill calculator

# 查看已安装的模块
node aqua/dist/aqua/src/cli/index.js list
```

### 配置

```bash
# 设置 LLM 配置
node aqua/dist/aqua/src/cli/index.js config set llm.baseUrl https://api.openai.com/v1
node aqua/dist/aqua/src/cli/index.js config set llm.model gpt-4o
node aqua/dist/aqua/src/cli/index.js config set llm.apiKey your-api-key

# 查看配置
node aqua/dist/aqua/src/cli/index.js config list
```

### 生成 Workbench

```bash
# 在项目目录下生成 Workbench
node aqua/dist/aqua/src/cli/index.js generate

# 进入 workbench 目录
cd workbench

# 安装依赖并构建
pnpm install
pnpm run build
```

### 使用 Workbench

```typescript
import { initialize, agents, skills } from './dist/index.js';

async function main() {
  const wb = await initialize();

  // 列出所有 Agent
  const agentList = agents.list();
  console.log('Agents:', agentList);

  // 执行 Agent
  const result = await agents.execute('router', 'Hello, help me search for weather');
  console.log('Result:', result);

  // 执行 Skill
  const skillResult = await skills.execute('calculator', { expression: '2 + 2' });
  console.log('Skill Result:', skillResult);

  await wb.shutdown();
}

main();
```

## CLI 命令

```bash
# 查看帮助
node aqua/dist/aqua/src/cli/index.js -h

# 创建项目
node aqua/dist/aqua/src/cli/index.js create <project-name>

# 添加模块
node aqua/dist/aqua/src/cli/index.js add agent <name>
node aqua/dist/aqua/src/cli/index.js add skill <name>
node aqua/dist/aqua/src/cli/index.js add tool <name>

# 移除模块
node aqua/dist/aqua/src/cli/index.js remove <type> <name>

# 列出模块
node aqua/dist/aqua/src/cli/index.js list
node aqua/dist/aqua/src/cli/index.js list --type agents

# 配置管理
node aqua/dist/aqua/src/cli/index.js config get <key>
node aqua/dist/aqua/src/cli/index.js config set <key> <value>
node aqua/dist/aqua/src/cli/index.js config list
node aqua/dist/aqua/src/cli/index.js config edit

# 生成 Workbench
node aqua/dist/aqua/src/cli/index.js generate
node aqua/dist/aqua/src/cli/index.js generate --force

# 启动仪表盘
node aqua/dist/aqua/src/cli/index.js serve
```

## 项目结构

```
aqua/
├── aqua/                      # CLI 工具
│   ├── src/
│   │   ├── cli/             # CLI 命令 (create, add, config, serve 等)
│   │   ├── core/            # 代码生成器与验证器
│   │   └── dashboard/       # 前端仪表盘 (React)
│   └── package.json
│
├── workbench/                 # 内置 Workbench 运行时
│   ├── src/
│   │   ├── runtime/        # 运行时引擎 (engine, context, memory, executor)
│   │   ├── agents/         # Agent 实现 (Router, Executor)
│   │   ├── skills/         # Skill 注册中心 (calculator, search, file_ops)
│   │   └── protocols/      # 协议实现 (MCP Server)
│   └── package.json
│
├── packages/
│   └── shared/              # 共享类型定义与 Schema
│       ├── src/types/       # TypeScript 类型
│       └── src/schemas/    # Zod Schema 验证
│
└── project/                 # 用户项目目录 (gitignored)
    └── <project-name>/
        ├── aqua.config.json
        ├── package.json
        └── workbench/       # 生成的 Workbench
```

## 内置模块

### Agents

| Agent | 描述 |
|-------|------|
| Router | 路由 Agent，分析输入并决定使用哪个 Skill |
| Executor | 执行 Agent，调用 Skill 执行具体任务 |

### Skills

| Skill | 描述 |
|-------|------|
| Calculator | 数学计算 |
| Search | 本地文件系统搜索 |
| File Operations | 文件读写操作 (read/write/list) |

## 协议支持

### MCP (Model Context Protocol)

MCP 是 Anthropic 推出的标准化协议，用于 AI 模型与外部工具的通信。

### A2A (Agent-to-Agent Protocol)

A2A 是 Google 推出的标准化协议，用于 Agent 之间的协作通信。

## 开发

```bash
# 构建
pnpm build

# 强制重新构建（跳过缓存）
pnpm build --force

# 代码检查
pnpm lint
```

## 许可证

MIT
