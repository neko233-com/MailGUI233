import type { Account } from "../types";

interface StatusBarProps {
  platform: string;
  account: Account;
  messageCount: number;
  syncing: boolean;
}

export function StatusBar({ platform, account, messageCount, syncing }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span>{account.address}</span>
      <span>{messageCount} visible</span>
      <span>{syncing ? "Sync active" : "Idle"}</span>
      <span>{platform}</span>
    </footer>
  );
}
