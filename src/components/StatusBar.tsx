import type { Account } from "../types";
import { useI18n } from "../i18n";

interface StatusBarProps {
  platform: string;
  accounts: Account[];
  scopeLabel: string;
  messageCount: number;
  syncing: boolean;
}

export function StatusBar({ platform, accounts, scopeLabel, messageCount, syncing }: StatusBarProps) {
  const { t } = useI18n();
  const connectedCount = accounts.filter((account) => account.status === "connected").length;

  return (
    <footer className="statusbar">
      <span>{scopeLabel}</span>
      <span>{t("visibleCount", { count: messageCount })}</span>
      <span>{t("connectedAccounts", { connected: connectedCount, total: accounts.length })}</span>
      <span>{syncing ? t("syncActive") : t("idle")}</span>
      <span>{platform}</span>
    </footer>
  );
}
