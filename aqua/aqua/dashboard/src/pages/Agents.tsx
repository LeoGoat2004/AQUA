import { useState } from 'react';
import { useAppStore, AgentConfig } from '../store/useAppStore';
import { Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY_AGENT: AgentConfig = {
  id: '',
  name: '',
  type: 'executor',
  enabled: true,
  systemPrompt: '',
  skills: [],
};

export function Agents() {
  const { config, dispatch } = useAppStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<AgentConfig>(EMPTY_AGENT);

  const startAdd = () => {
    setForm({ ...EMPTY_AGENT, id: crypto.randomUUID() });
    setAdding(true);
  };

  const startEdit = (a: AgentConfig) => {
    setForm({ ...a });
    setEditing(a.id);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
    setForm(EMPTY_AGENT);
  };

  const saveAdd = () => {
    if (!form.name.trim()) return;
    dispatch({ type: 'ADD_AGENT', payload: form });
    cancelForm();
  };

  const saveEdit = () => {
    if (!editing || !form.name.trim()) return;
    dispatch({ type: 'UPDATE_AGENT', payload: { id: editing, data: form } });
    cancelForm();
  };

  const toggleAgent = (id: string, enabled: boolean) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { id, data: { enabled: !enabled } } });
  };

  const deleteAgent = (id: string) => {
    dispatch({ type: 'DELETE_AGENT', payload: id });
  };

  const availableSkills = config.skills.map((s) => s.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Agents</h2>
          <p className="mt-1 text-sm text-text-secondary">{config.agents.length} agent(s) configured</p>
        </div>
        <button
          onClick={startAdd}
          disabled={adding}
          className="flex items-center gap-2 rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue-hover disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {(adding || editing) && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="font-medium text-text-primary mb-4">{adding ? 'New Agent' : 'Edit Agent'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. code-assistant"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                <option value="executor">Executor</option>
                <option value="router">Router</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">System Prompt</label>
              <textarea
                rows={4}
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant..."
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">Skills (comma-separated)</label>
              <input
                type="text"
                value={form.skills.join(', ')}
                onChange={(e) => setForm({ ...form, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                placeholder="e.g. code-generation, file-search"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
              {availableSkills.length > 0 && (
                <p className="mt-1 text-xs text-text-tertiary">Available skills: {availableSkills.join(', ')}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={adding ? saveAdd : saveEdit}
              className="flex items-center gap-2 rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue-hover"
            >
              <Check className="h-4 w-4" />
              {adding ? 'Add' : 'Save'}
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {config.agents.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-text-tertiary">No agents configured yet. Click "Add Agent" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {config.agents.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{a.name}</h3>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-text-tertiary">{a.type}</span>
                    {a.enabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-2 py-0.5 text-xs text-green-400">Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-400/10 px-2 py-0.5 text-xs text-gray-400">Disabled</span>
                    )}
                  </div>
                  {a.systemPrompt && (
                    <p className="mt-2 text-sm text-text-secondary line-clamp-2">{a.systemPrompt}</p>
                  )}
                  {a.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.skills.map((s) => (
                        <span key={s} className="rounded bg-background px-2 py-0.5 text-xs text-text-tertiary">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => toggleAgent(a.id, a.enabled)}
                    className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-background hover:text-text-primary"
                    title={a.enabled ? 'Disable' : 'Enable'}
                  >
                    {a.enabled ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(a)}
                    className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-background hover:text-accent-blue"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAgent(a.id)}
                    className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-background hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}