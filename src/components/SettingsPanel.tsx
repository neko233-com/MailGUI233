import { CheckCircle2, Cloud, DownloadCloud, FolderSync, GitBranch, Mail, Power, RefreshCcw, ServerCog } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { createCloudSyncStrategy, listCloudSyncStrategies } from "../lib/cloudSyncStrategies";
import { useI18n, type TranslationKey } from "../i18n";
import type { Account, CloudSyncConfig, CloudSyncStrategyId } from "../types";
import { appVersion } from "../version";

interface SettingsPanelProps {
  accounts: Account[];
  configs: Record<CloudSyncStrategyId, CloudSyncConfig>;
  customThemeCssUrl: string;
  onAccountChange: (accountId: string, patch: Partial<Account>) => void;
  onConfigChange: (strategyId: CloudSyncStrategyId, config: CloudSyncConfig) => void;
  onThemeCssUrlChange: (url: string) => void;
}

const strategyIcons = {
  git: GitBranch,
  webdav: ServerCog,
  local: FolderSync
};

const autoCheckKey = "mailgui233.autoCheckUpdates";
const mailboxSettingTabs = ["account", "write", "receive", "other"] as const;
type MailboxSettingTab = (typeof mailboxSettingTabs)[number];
const mailboxSettingTabLabels: Record<MailboxSettingTab, TranslationKey> = {
  account: "mailboxTabAccount",
  other: "mailboxTabOther",
  receive: "mailboxTabReceive",
  write: "mailboxTabWrite"
};

function compareVersion(left: string, right: string) {
  const leftParts = left.replace(/^v/, "").split(".").map(Number);
  const rightParts = right.replace(/^v/, "").split(".").map(Number);

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

export function SettingsPanel({
  accounts,
  configs,
  customThemeCssUrl,
  onAccountChange,
  onConfigChange,
  onThemeCssUrlChange
}: SettingsPanelProps) {
  const { t } = useI18n();
  const strategies = useMemo(() => listCloudSyncStrategies(), []);
  const [activeStrategyId, setActiveStrategyId] = useState<CloudSyncStrategyId>("git");
  const [activeAccountId, setActiveAccountId] = useState(() => accounts[0]?.id ?? "");
  const [activeMailboxTab, setActiveMailboxTab] = useState<MailboxSettingTab>("account");
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(() => window.localStorage.getItem(autoCheckKey) === "true");
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(t("updatesIdle"));
  const [downloadUrl, setDownloadUrl] = useState("");
  const [autoStart, setAutoStart] = useState(false);
  const activeStrategy = createCloudSyncStrategy(activeStrategyId);
  const config = configs[activeStrategyId];
  const validation = activeStrategy.validate(config);
  const activeAccount = accounts.find((account) => account.id === activeAccountId) ?? accounts[0];

  useEffect(() => {
    if (!activeAccountId || !accounts.some((account) => account.id === activeAccountId)) {
      setActiveAccountId(accounts[0]?.id ?? "");
    }
  }, [accounts, activeAccountId]);

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

        <section className="mailbox-settings-card" aria-label={t("mailboxSettings")}>
          <header className="mailbox-settings-head">
            <span>
              <Mail size={17} />
            </span>
            <div>
              <strong>{t("mailboxSettings")}</strong>
              <p>{t("mailboxSettingsIntro")}</p>
            </div>
          </header>

          {accounts.length === 0 ? (
            <div className="mailbox-settings-empty">{t("noAccountsHint")}</div>
          ) : (
            <div className="mailbox-settings-layout">
              <nav className="mailbox-settings-list" aria-label={t("mailboxList")}>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    className={activeAccount?.id === account.id ? "is-active" : ""}
                    onClick={() => setActiveAccountId(account.id)}
                    type="button"
                  >
                    <strong>{account.address}</strong>
                    <span>{account.provider.toUpperCase()} / {account.status}</span>
                  </button>
                ))}
              </nav>

              {activeAccount ? (
                <article className="mailbox-settings-detail">
                  <div className="mailbox-settings-tabs" role="tablist" aria-label={t("mailboxSettingsTabs")}>
                    {mailboxSettingTabs.map((tab) => (
                      <button
                        key={tab}
                        className={activeMailboxTab === tab ? "is-active" : ""}
                        onClick={() => setActiveMailboxTab(tab)}
                        role="tab"
                        aria-selected={activeMailboxTab === tab}
                        type="button"
                      >
                        {t(mailboxSettingTabLabels[tab])}
                      </button>
                    ))}
                  </div>

                  <div className="mailbox-settings-fields">
                    {activeMailboxTab === "account" ? (
                      <>
                        <label>
                          <span>{t("mailboxAddress")}</span>
                          <input value={activeAccount.address} readOnly />
                        </label>
                        <label>
                          <span>{t("mailboxRemark")}</span>
                          <input
                            value={activeAccount.name}
                            onChange={(event) => onAccountChange(activeAccount.id, { name: event.target.value })}
                          />
                        </label>
                        <label>
                          <span>{t("mailboxProvider")}</span>
                          <input value={activeAccount.provider.toUpperCase()} readOnly />
                        </label>
                        <label>
                          <span>{t("mailboxProtocol")}</span>
                          <input value={activeAccount.capabilities.includes("imap") ? "IMAP" : activeAccount.auth} readOnly />
                        </label>
                      </>
                    ) : null}

                    {activeMailboxTab === "write" ? (
                      <>
                        <label className="field-wide">
                          <span>SMTP</span>
                          <input
                            value={activeAccount.outgoing}
                            onChange={(event) => onAccountChange(activeAccount.id, { outgoing: event.target.value })}
                          />
                        </label>
                        <label className="field-wide">
                          <span>{t("authorizationCode")}</span>
                          <input value={activeAccount.auth} onChange={(event) => onAccountChange(activeAccount.id, { auth: event.target.value })} />
                        </label>
                      </>
                    ) : null}

                    {activeMailboxTab === "receive" ? (
                      <>
                        <label className="field-wide">
                          <span>IMAP</span>
                          <input
                            value={activeAccount.incoming}
                            onChange={(event) => onAccountChange(activeAccount.id, { incoming: event.target.value })}
                          />
                        </label>
                        <label className="field-wide">
                          <span>POP3</span>
                          <input
                            value={activeAccount.pop3 ?? ""}
                            onChange={(event) => onAccountChange(activeAccount.id, { pop3: event.target.value })}
                          />
                        </label>
                      </>
                    ) : null}

                    {activeMailboxTab === "other" ? (
                      <>
                        <label>
                          <span>{t("mailboxIncoming")}</span>
                          <input value={activeAccount.incoming} readOnly />
                        </label>
                        <label>
                          <span>{t("mailboxOutgoing")}</span>
                          <input value={activeAccount.outgoing} readOnly />
                        </label>
                        <label className="field-wide">
                          <span>{t("mailboxCapabilities")}</span>
                          <input value={activeAccount.capabilities.join(", ")} readOnly />
                        </label>
                      </>
                    ) : null}
                  </div>
                </article>
              ) : null}
            </div>
          )}
        </section>

        <section className="app-settings-card theme-settings-card" aria-label={t("themeSettings")}>
          <div className="app-settings-head">
            <div>
              <strong>{t("themeSettings")}</strong>
              <p>{t("themeSettingsIntro")}</p>
            </div>
            <button className="verify-button" onClick={() => onThemeCssUrlChange("")} disabled={!customThemeCssUrl} type="button">
              {t("resetTheme")}
            </button>
          </div>

          <label className="theme-css-field">
            <span>{t("customThemeCssUrl")}</span>
            <input
              value={customThemeCssUrl}
              onChange={(event) => onThemeCssUrlChange(event.target.value)}
              placeholder="https://example.com/mailgui233-theme.css"
              type="url"
            />
          </label>
          <p className="theme-css-note">{t("customThemeCssNote")}</p>
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
                    <div className="cloud-option-list" role="group" aria-label={field.label}>
                      {(field.options ?? []).map((option) => (
                        <button
                          key={option}
                          className={(config.values[field.key] ?? "") === option ? "is-active" : ""}
                          onClick={() => updateValue(field.key, option)}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
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
