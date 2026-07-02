import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Bot,
  Sparkles,
  Settings,
  FileCode,
  Cog,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/architect', icon: Network, label: 'Architect' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/skills', icon: Sparkles, label: 'Skills' },
  { to: '/config', icon: Settings, label: 'Config' },
  { to: '/generate', icon: FileCode, label: 'Generate' },
  { to: '/settings', icon: Cog, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-blue">
            <Network className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-text-primary">AQUA</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-surface-hover text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-md bg-surface-hover p-3">
          <p className="text-xs font-medium text-text-primary">v0.1.0</p>
          <p className="mt-0.5 text-xs text-text-tertiary">AQUA</p>
        </div>
      </div>
    </aside>
  );
}
