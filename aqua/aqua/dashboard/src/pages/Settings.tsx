import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Save, RotateCcw } from 'lucide-react';

export function Settings() {
  const { config, dispatch } = useAppStore();
  const [projectName, setProjectName] = useState(config.projectName);
  const [version, setVersion] = useState(config.version);
  const [description, setDescription] = useState(config.description);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({
      type: 'SET_PROJECT',
      payload: { name: projectName.trim(), version: version.trim(), description: description.trim() },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setProjectName('my-ai-app');
    setVersion('0.1.0');
    setDescription('AI Agent application built with AQUA');
  };

  const hasChanges =
    projectName !== config.projectName ||
    version !== config.version ||
    description !== config.description;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Settings</h2>
          <p className="mt-1 text-sm text-text-secondary">Manage project settings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue-hover disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-medium text-text-primary">Project Information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Version</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-medium text-text-primary">Application Stats</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div className="text-2xl font-semibold text-text-primary">{config.agents.length}</div>
            <div className="mt-1 text-xs text-text-tertiary">Agents</div>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div className="text-2xl font-semibold text-text-primary">{config.skills.length}</div>
            <div className="mt-1 text-xs text-text-tertiary">Skills</div>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <div className="text-2xl font-semibold text-text-primary">{config.tools.length}</div>
            <div className="mt-1 text-xs text-text-tertiary">Tools</div>
          </div>
        </div>
      </div>
    </div>
  );
}