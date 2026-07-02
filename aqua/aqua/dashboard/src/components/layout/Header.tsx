import { useLocation } from 'react-router-dom';
import { Bell, Search, Command } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/architect': 'Architect',
  '/agents': 'Agents',
  '/skills': 'Skills',
  '/config': 'Configuration',
  '/generate': 'Generate',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'AQUA';

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-md border border-border bg-surface-hover px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border hover:text-text-secondary">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-2 flex h-5 w-5 items-center justify-center rounded bg-background text-xs">
            <Command className="h-3 w-3" />
          </kbd>
          <kbd className="flex h-5 w-5 items-center justify-center rounded bg-background text-xs">K</kbd>
        </button>

        <button className="relative rounded-md p-2 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-secondary">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
        </button>
      </div>
    </header>
  );
}
