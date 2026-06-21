import type { Account } from "../types";

interface StatusBarProps {
  platform: string;
  accounts: Account[];
  scopeLabel: string;
  messageCount: number;
  syncing: boolean;
}

export function StatusBar({ platform, accounts, scopeLabel, messageCount, syncing }: StatusBarProps) {
  const connectedCount = accounts.filter((account) => account.status === "connected").length;

  return (
    <footer className="statusbar">
      <span>{scopeLabel}</span>
      <span>{messageCount} visible</span>
      <span>{connectedCount}/{accounts.length} accounts connected</span>
      <span>{syncing ? "Sync active" : "Idle"}</span>
      <span>{platform}</span>
    </footer>
  );
}
