import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { languageOptions, useI18n } from "../i18n";

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
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="topbar">
      <div className="topbar-title">
        <strong>{title}</strong>
        <span>{syncing ? t("syncingMailbox") : subtitle}</span>
      </div>

      <label className="searchbox">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
        />
      </label>

      <div className="toolbar" aria-label={t("mailActions")}>
        <label className="language-control">
          <span>{t("language")}</span>
          <select
            aria-label={t("language")}
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>

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
