import { useAppStore } from '../store/useAppStore';
import { ArrowRight, GitBranch, Cpu, Zap } from 'lucide-react';

export function Architect() {
  const { config } = useAppStore();

  const activeAgents = config.agents.filter((a) => a.enabled);
  const activeSkills = config.skills.filter((s) => s.enabled);
  const activeTools = config.tools.filter((t) => t.enabled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Architect</h2>
        <p className="mt-1 text-sm text-text-secondary">Visual overview of your agent system architecture</p>
      </div>

      {activeAgents.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-text-tertiary">No active agents. Add and enable agents to see the architecture.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="font-medium text-text-primary flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-accent-blue" />
              Agent Pipeline
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {activeAgents.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2">
                  <div className="rounded-lg border border-accent-blue/30 bg-accent-blue/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-accent-blue" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{a.name}</p>
                        <p className="text-xs text-text-tertiary">{a.type}</p>
                      </div>
                    </div>
                    {a.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {a.skills.map((s) => (
                          <span key={s} className="rounded bg-background px-1.5 py-0.5 text-xs text-text-tertiary">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {i < activeAgents.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-text-tertiary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="font-medium text-text-primary flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                Skills ({activeSkills.length})
              </h3>
              {activeSkills.length === 0 ? (
                <p className="mt-4 text-sm text-text-tertiary">No active skills.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {activeSkills.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-text-primary">{s.name}</span>
                        <span className="ml-2 text-xs text-text-tertiary">{s.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="font-medium text-text-primary flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                Tools ({activeTools.length})
              </h3>
              {activeTools.length === 0 ? (
                <p className="mt-4 text-sm text-text-tertiary">No active tools.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {activeTools.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-text-primary">{t.name}</span>
                        <span className="ml-2 text-xs text-text-tertiary">{t.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}