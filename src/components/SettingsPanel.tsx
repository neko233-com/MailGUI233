import { CheckCircle2, Cloud, FolderSync, GitBranch, ServerCog } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { createCloudSyncStrategy, listCloudSyncStrategies } from "../lib/cloudSyncStrategies";
import { useI18n } from "../i18n";
import type { CloudSyncConfig, CloudSyncStrategyId } from "../types";

interface SettingsPanelProps {
  configs: Record<CloudSyncStrategyId, CloudSyncConfig>;
  onConfigChange: (strategyId: CloudSyncStrategyId, config: CloudSyncConfig) => void;
}

const strategyIcons = {
  git: GitBranch,
  webdav: ServerCog,
  local: FolderSync
};

export function SettingsPanel({ configs, onConfigChange }: SettingsPanelProps) {
  const { t } = useI18n();
  const strategies = useMemo(() => listCloudSyncStrategies(), []);
  const [activeStrategyId, setActiveStrategyId] = useState<CloudSyncStrategyId>("git");
  const activeStrategy = createCloudSyncStrategy(activeStrategyId);
  const config = configs[activeStrategyId];
  const validation = activeStrategy.validate(config);

  function updateValue(key: string, value: string) {
    onConfigChange(activeStrategyId, {
      ...config,
      values: {
        ...config.values,
        [key]: value
      }
    });
  }

  return (
    <section className="settings-workspace" aria-label={t("systemSettings")}>
      <div className="settings-shell">
        <header className="settings-hero">
          <span className="settings-hero-icon">
            <Cloud size={19} />
          </span>
          <div>
            <strong>{t("cloudSync")}</strong>
            <p>{t("cloudSyncIntro")}</p>
          </div>
        </header>

        <div className="cloud-sync-layout">
          <nav className="cloud-sync-tabs" role="tablist" aria-orientation="vertical" aria-label={t("cloudSyncMethods")}>
            {strategies.map((strategy) => {
              const Icon = strategyIcons[strategy.id];
              const strategyConfig = configs[strategy.id];
              const strategyValidation = createCloudSyncStrategy(strategy.id).validate(strategyConfig);

              return (
                <button
                  key={strategy.id}
                  className={`cloud-sync-tab ${activeStrategyId === strategy.id ? "is-active" : ""}`}
                  onClick={() => setActiveStrategyId(strategy.id)}
                  role="tab"
                  aria-selected={activeStrategyId === strategy.id}
                  style={{ "--sync-accent": strategy.accent } as CSSProperties}
                  type="button"
                >
                  <Icon size={18} />
                  <span>
                    <strong>{strategy.name}</strong>
                    <em>{strategyValidation.status === "ready" ? t("syncReady") : t("syncNeedsConfig")}</em>
                  </span>
                </button>
              );
            })}
          </nav>

          <article className="cloud-sync-card" aria-label={`${activeStrategy.definition.name} configuration`}>
            <div className="cloud-sync-card-head">
              <div>
                <strong>{activeStrategy.definition.name}</strong>
                <p>{activeStrategy.definition.summary}</p>
              </div>
              <label className="sync-toggle">
                <input
                  checked={config.enabled}
                  onChange={(event) => onConfigChange(activeStrategyId, { ...config, enabled: event.target.checked })}
                  type="checkbox"
                />
                <span>{t("enabled")}</span>
              </label>
            </div>

            <div className={`sync-status status-${validation.status}`}>
              <CheckCircle2 size={16} />
              <span>{validation.message}</span>
            </div>

            <div className="cloud-sync-form">
              {activeStrategy.definition.fields.map((field) => (
                <label key={field.key} className={validation.missingFields.includes(field.key) ? "is-missing" : ""}>
                  <span>{field.label}</span>
                  {field.kind === "select" ? (
                    <select value={config.values[field.key] ?? ""} onChange={(event) => updateValue(field.key, event.target.value)}>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={config.values[field.key] ?? ""}
                      onChange={(event) => updateValue(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      type={field.kind === "password" ? "password" : "text"}
                    />
                  )}
                </label>
              ))}
            </div>

            <p className="privacy-note">{activeStrategy.definition.privacyNote}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
