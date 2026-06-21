import { Search } from "lucide-react";
import { useState } from "react";
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
  const [languageOpen, setLanguageOpen] = useState(false);
  const activeLanguage = languageOptions.find((option) => option.value === language) ?? languageOptions[0];

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
        <div className="language-control">
          <span>{t("language")}</span>
          <button
            aria-expanded={languageOpen}
            aria-haspopup="menu"
            aria-label={t("language")}
            onClick={() => setLanguageOpen((current) => !current)}
            type="button"
          >
            {t(activeLanguage.labelKey)}
          </button>
          {languageOpen ? (
            <div className="language-menu" role="menu">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  className={option.value === language ? "is-active" : ""}
                  onClick={() => {
                    setLanguage(option.value);
                    setLanguageOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          ) : null}
        </div>

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
