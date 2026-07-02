import { useAppStore } from '../store/useAppStore';
import { Code, FileJson } from 'lucide-react';

export function Generate() {
  const { config } = useAppStore();

  const outputJson = JSON.stringify({
    projectName: config.projectName,
    version: config.version,
    description: config.description,
    llm: config.llm,
    agents: config.agents,
    skills: config.skills,
    tools: config.tools,
  }, null, 2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Generate Workbench</h2>
        <p className="mt-1 text-sm text-text-secondary">Preview and export your configuration</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-accent-blue" />
            <span className="text-sm font-medium text-text-primary">Agents</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-primary">{config.agents.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-text-primary">Skills</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-primary">{config.skills.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-text-primary">Tools</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-primary">{config.tools.length}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileJson className="h-4 w-4 text-text-tertiary" />
          <h3 className="font-medium text-text-primary">aqua.config.json</h3>
        </div>
        <pre className="rounded-md bg-background p-4 text-xs font-mono text-text-primary overflow-auto max-h-96">
          {outputJson}
        </pre>
        <div className="mt-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(outputJson);
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}