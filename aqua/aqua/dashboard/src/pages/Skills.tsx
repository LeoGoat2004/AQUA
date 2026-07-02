import { useState } from 'react';
import { useAppStore, SkillConfig } from '../store/useAppStore';
import { Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY_SKILL: SkillConfig = {
  id: '',
  name: '',
  category: '',
  enabled: true,
  description: '',
};

export function Skills() {
  const { config, dispatch } = useAppStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<SkillConfig>(EMPTY_SKILL);

  const startAdd = () => {
    setForm({ ...EMPTY_SKILL, id: crypto.randomUUID() });
    setAdding(true);
  };

  const startEdit = (s: SkillConfig) => {
    setForm({ ...s });
    setEditing(s.id);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
    setForm(EMPTY_SKILL);
  };

  const saveAdd = () => {
    if (!form.name.trim()) return;
    dispatch({ type: 'ADD_SKILL', payload: form });
    cancelForm();
  };

  const saveEdit = () => {
    if (!editing || !form.name.trim()) return;
    dispatch({ type: 'UPDATE_SKILL', payload: { id: editing, data: form } });
    cancelForm();
  };

  const toggleSkill = (id: string) => {
    const s = config.skills.find((sk) => sk.id === id);
    if (s) dispatch({ type: 'UPDATE_SKILL', payload: { id, data: { enabled: !s.enabled } } });
  };

  const deleteSkill = (id: string) => {
    dispatch({ type: 'DELETE_SKILL', payload: id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Skills</h2>
          <p className="mt-1 text-sm text-text-secondary">{config.skills.length} skill(s) configured</p>
        </div>
        <button
          onClick={startAdd}
          disabled={adding}
          className="flex items-center gap-2 rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue-hover disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {(adding || editing) && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="font-medium text-text-primary mb-4">{adding ? 'New Skill' : 'Edit Skill'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. code-generation"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. coding, search, analysis"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this skill do?"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
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

      {config.skills.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-text-tertiary">No skills configured yet. Click "Add Skill" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {config.skills.map((s) => (
            <div key={s.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{s.name}</h3>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-text-tertiary">{s.category || 'uncategorized'}</span>
                    {s.enabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-2 py-0.5 text-xs text-green-400">Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-400/10 px-2 py-0.5 text-xs text-gray-400">Disabled</span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-2 text-sm text-text-secondary">{s.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => toggleSkill(s.id)}
                    className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-background hover:text-text-primary"
                    title={s.enabled ? 'Disable' : 'Enable'}
                  >
                    {s.enabled ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(s)}
                    className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-background hover:text-accent-blue"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSkill(s.id)}
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