import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Save, Eye, EyeOff } from 'lucide-react';

export function Config() {
  const { config, dispatch } = useAppStore();
  const [baseUrl, setBaseUrl] = useState(config.llm.baseUrl);
  const [model, setModel] = useState(config.llm.model);
  const [apiKey, setApiKey] = useState(config.llm.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'SET_LLM', payload: { baseUrl: baseUrl.trim(), model: model.trim(), apiKey: apiKey.trim() } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = baseUrl !== config.llm.baseUrl || model !== config.llm.model || apiKey !== config.llm.apiKey;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Configuration</h2>
          <p className="mt-1 text-sm text-text-secondary">Configure LLM provider and model settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue-hover disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-medium text-text-primary">LLM Provider</h3>
        <p className="mt-1 text-sm text-text-tertiary">Configure your LLM endpoint with custom base URL, model name, and API key.</p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary font-mono text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
            <p className="mt-1 text-xs text-text-tertiary">The endpoint URL for your LLM API (e.g. OpenAI, DeepSeek, Ollama, custom proxy)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o"
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary font-mono text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
            <p className="mt-1 text-xs text-text-tertiary">The model identifier (e.g. gpt-4o, deepseek-chat, llama3)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">API Key</label>
            <div className="relative mt-1.5">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-text-primary font-mono text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">Your API key for authentication. Stored locally in browser.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-medium text-text-primary">Current Configuration Summary</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-border">
            <span className="text-text-tertiary">Base URL</span>
            <span className="text-text-primary font-mono">{config.llm.baseUrl || '(not set)'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border">
            <span className="text-text-tertiary">Model</span>
            <span className="text-text-primary font-mono">{config.llm.model || '(not set)'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-text-tertiary">API Key</span>
            <span className="text-text-primary font-mono">{config.llm.apiKey ? '***configured***' : '(not set)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}