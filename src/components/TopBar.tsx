import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Action {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary";
}

interface TopBarProps {
  title: string;
  subtitle: string;
  query: string;
  syncing: boolean;
  actions: Action[];
  onQueryChange: (value: string) => void;
}

export function TopBar({ title, subtitle, query, syncing, actions, onQueryChange }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <strong>{title}</strong>
        <span>{syncing ? "Syncing mailbox..." : subtitle}</span>
      </div>

      <label className="searchbox">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search sender, subject, labels"
        />
      </label>

      <div className="toolbar" aria-label="Mail actions">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              className={`icon-button ${action.tone === "primary" ? "is-primary" : ""}`}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.label}
              type="button"
            >
              <Icon size={18} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
