import { CheckCircle2, Cloud, DownloadCloud, FolderSync, GitBranch, Power, RefreshCcw, ServerCog } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { createCloudSyncStrategy, listCloudSyncStrategies } from "../lib/cloudSyncStrategies";
import { useI18n } from "../i18n";
import type { CloudSyncConfig, CloudSyncStrategyId } from "../types";
import { appVersion } from "../version";

interface SettingsPanelProps {
  configs: Record<CloudSyncStrategyId, CloudSyncConfig>;
  onConfigChange: (strategyId: CloudSyncStrategyId, config: CloudSyncConfig) => void;
}

const strategyIcons = {
  git: GitBranch,
  webdav: ServerCog,
  local: FolderSync
};

const autoCheckKey = "mailgui233.autoCheckUpdates";

function compareVersion(left: string, right: string) {
  const leftParts = left.replace(/^v/, "").split(".").map(Number);
  const rightParts = right.replace(/^v/, "").split(".").map(Number);

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

export function SettingsPanel({ configs, onConfigChange }: SettingsPanelProps) {
  const { t } = useI18n();
  const strategies = useMemo(() => listCloudSyncStrategies(), []);
  const [activeStrategyId, setActiveStrategyId] = useState<CloudSyncStrategyId>("git");
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(() => window.localStorage.getItem(autoCheckKey) === "true");
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(t("updatesIdle"));
  const [downloadUrl, setDownloadUrl] = useState("");
  const [autoStart, setAutoStart] = useState(false);
  const activeStrategy = createCloudSyncStrategy(activeStrategyId);
  const config = configs[activeStrategyId];
  const validation = activeStrategy.validate(config);

  useEffect(() => {
    async function loadAutoStart() {
      try {
        const { invoke, isTauri } = await import("@tauri-apps/api/core");
        if (isTauri()) {
          setAutoStart(await invoke<boolean>("get_auto_start"));
        }
      } catch {
        setAutoStart(window.localStorage.getItem("mailgui233.autoStart") === "true");
      }
    }

    loadAutoStart();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(autoCheckKey, String(autoCheckUpdates));

    if (autoCheckUpdates) {
      checkForUpdates();
    }
  }, [autoCheckUpdates]);

  async function checkForUpdates() {
    setCheckingUpdate(true);
    setUpdateMessage(t("checkingUpdates"));

    try {
      const response = await fetch("https://api.github.com/repos/neko233-com/MailGUI233/releases/latest", {
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status}`);
      }

      const release = (await response.json()) as {
        tag_name: string;
        html_url: string;
        assets?: Array<{ browser_download_url: string; name: string }>;
      };
      const latestVersion = release.tag_name.replace(/^v/, "");
      const installer = release.assets?.find((asset) => asset.name.endsWith(".exe"));
      setDownloadUrl(installer?.browser_download_url ?? release.html_url);

      if (compareVersion(latestVersion, appVersion) > 0) {
        setUpdateMessage(t("updateAvailable", { version: latestVersion }));
      } else {
        setUpdateMessage(t("upToDate", { version: appVersion }));
      }
    } catch {
      setUpdateMessage(t("updateCheckFailed"));
    } finally {
      setCheckingUpdate(false);
    }
  }

  async function toggleAutoStart(enabled: boolean) {
    setAutoStart(enabled);

    try {
      const { invoke, isTauri } = await import("@tauri-apps/api/core");
      if (isTauri()) {
        setAutoStart(await invoke<boolean>("set_auto_start", { enabled }));
        return;
      }
    } catch {
      // Browser preview stores the toggle locally; the desktop app uses the native command.
    }

    window.localStorage.setItem("mailgui233.autoStart", String(enabled));
  }

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

        <section className="app-settings-card" aria-label={t("appSettings")}>
          <div className="app-settings-head">
            <div>
              <strong>{t("appSettings")}</strong>
              <p>{t("appVersion", { version: appVersion })}</p>
            </div>
            <button className="verify-button" onClick={checkForUpdates} disabled={checkingUpdate} type="button">
              <RefreshCcw size={17} className={checkingUpdate ? "is-spinning" : ""} />
              {t("checkUpdates")}
            </button>
          </div>

          <div className="settings-toggle-grid">
            <label className="settings-toggle">
              <input
                checked={autoCheckUpdates}
                onChange={(event) => setAutoCheckUpdates(event.target.checked)}
                type="checkbox"
              />
              <span>
                <Power size={16} />
                {t("autoCheckUpdates")}
              </span>
            </label>
            <label className="settings-toggle">
              <input checked={autoStart} onChange={(event) => toggleAutoStart(event.target.checked)} type="checkbox" />
              <span>
                <Power size={16} />
                {t("autoStart")}
              </span>
            </label>
          </div>

          <div className="update-status">
            <CheckCircle2 size={16} />
            <span>{updateMessage}</span>
            {downloadUrl ? (
              <button onClick={() => window.open(downloadUrl, "_blank", "noopener,noreferrer")} type="button">
                <DownloadCloud size={16} />
                {t("downloadUpdate")}
              </button>
            ) : null}
          </div>
        </section>

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
