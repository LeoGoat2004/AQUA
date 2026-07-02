import { useAppStore } from '../store/useAppStore';
import { Activity, Cpu, Zap, Layers } from 'lucide-react';

export function Dashboard() {
  const { config } = useAppStore();
  const enabledAgents = config.agents.filter((a) => a.enabled).length;
  const enabledSkills = config.skills.filter((s) => s.enabled).length;
  const enabledTools = config.tools.filter((t) => t.enabled).length;

  const stats = [
    { label: 'Agents', value: config.agents.length, active: enabledAgents, icon: Cpu, color: 'text-blue-400' },
    { label: 'Skills', value: config.skills.length, active: enabledSkills, icon: Zap, color: 'text-green-400' },
    { label: 'Tools', value: config.tools.length, active: enabledTools, icon: Layers, color: 'text-purple-400' },
    { label: 'Total Modules', value: config.agents.length + config.skills.length + config.tools.length, active: enabledAgents + enabledSkills + enabledTools, icon: Activity, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{config.projectName}</h2>
        <p className="mt-1 text-sm text-text-secondary">{config.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="mt-2 text-2xl font-semibold text-text-primary">{s.value}</div>
            <div className="mt-0.5 text-xs text-text-tertiary">{s.active} active</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="font-medium text-text-primary">Agents</h3>
          {config.agents.length === 0 ? (
            <p className="mt-3 text-sm text-text-tertiary">No agents configured. Go to Agents page to add one.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {config.agents.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{a.name}</span>
                    <span className="ml-2 text-xs text-text-tertiary">{a.type}</span>
                  </div>
                  <span className={`inline-flex h-2 w-2 rounded-full ${a.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="font-medium text-text-primary">LLM Configuration</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Base URL</span>
              <span className="text-text-primary font-mono text-xs">{config.llm.baseUrl || '(not set)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Model</span>
              <span className="text-text-primary font-mono text-xs">{config.llm.model || '(not set)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">API Key</span>
              <span className="text-text-primary font-mono text-xs">{config.llm.apiKey ? '***configured***' : '(not set)'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h3 className="font-medium text-text-primary">Skills & Tools</h3>
        {(config.skills.length === 0 && config.tools.length === 0) ? (
          <p className="mt-3 text-sm text-text-tertiary">No skills or tools configured.</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase mb-2">Skills</p>
              {config.skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{s.name}</span>
                    <span className="ml-2 text-xs text-text-tertiary">{s.category}</span>
                  </div>
                  <span className={`inline-flex h-2 w-2 rounded-full ${s.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase mb-2">Tools</p>
              {config.tools.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{t.name}</span>
                    <span className="ml-2 text-xs text-text-tertiary">{t.type}</span>
                  </div>
                  <span className={`inline-flex h-2 w-2 rounded-full ${t.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}