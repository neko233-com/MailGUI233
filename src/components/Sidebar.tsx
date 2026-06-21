import {
  Archive,
  CalendarDays,
  FileText,
  Inbox,
  Send,
  Settings,
  Star,
  Trash2
} from "lucide-react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import type { Account, AccountScope, Folder, FolderId, MailboxTabId, MailMessage } from "../types";

const tabIcons: Record<MailboxTabId, LucideIcon> = {
  inbox: Inbox,
  timetable: CalendarDays,
  starred: Star,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2,
  channels: Settings
};

const primaryTabs: MailboxTabId[] = ["inbox", "timetable", "starred", "sent", "drafts", "archive", "trash", "channels"];

interface SidebarProps {
  accounts: Account[];
  folders: Folder[];
  activeAccountId: AccountScope;
  activeTab: MailboxTabId;
  messages: MailMessage[];
  onAccountChange: (accountId: AccountScope) => void;
  onTabChange: (tabId: MailboxTabId) => void;
}

function accountInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function scopeMatches(message: MailMessage, accountId: AccountScope) {
  return accountId === "all" || message.accountId === accountId;
}

export function Sidebar({
  accounts,
  folders,
  activeAccountId,
  activeTab,
  messages,
  onAccountChange,
  onTabChange
}: SidebarProps) {
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  const activeAccount = activeAccountId === "all" ? undefined : accounts.find((account) => account.id === activeAccountId);
  const accountCountLabel = activeAccount ? activeAccount.address : `${accounts.length} mailboxes`;

  const unreadForScope = (accountId: AccountScope) =>
    messages.filter((message) => scopeMatches(message, accountId) && message.unread && message.folder !== "trash").length;

  const unreadByFolder = (folderId: FolderId) =>
    messages.filter(
      (message) =>
        scopeMatches(message, activeAccountId) &&
        message.unread &&
        (folderId === "starred" ? message.starred : message.folder === folderId)
    ).length;

  return (
    <aside className="sidebar" aria-label="Mail navigation">
      <section className="mailbox-column" aria-label="Mailboxes">
        <div className="mailbox-brand" aria-hidden="true">
          <span>M</span>
        </div>

        <div className="account-tablist" role="tablist" aria-orientation="vertical" aria-label="Mailbox list">
          <button
            className={`account-tab ${activeAccountId === "all" ? "is-active" : ""}`}
            onClick={() => onAccountChange("all")}
            role="tab"
            aria-selected={activeAccountId === "all"}
            aria-label={`All mailboxes, ${unreadForScope("all")} unread`}
            type="button"
          >
            <span className="account-glyph all-glyph">All</span>
            <strong>All</strong>
            <em>{unreadForScope("all")}</em>
          </button>

          {accounts.map((account) => (
            <button
              key={account.id}
              className={`account-tab status-${account.status} ${activeAccountId === account.id ? "is-active" : ""}`}
              onClick={() => onAccountChange(account.id)}
              role="tab"
              aria-selected={activeAccountId === account.id}
              aria-label={`${account.name}, ${account.provider.toUpperCase()}, ${account.status.replace("-", " ")}`}
              style={{ "--account-accent": account.accent } as CSSProperties}
              type="button"
            >
              <span className="account-glyph">{accountInitials(account.name)}</span>
              <strong>{account.name.replace(" Mail", "")}</strong>
              <em>{unreadForScope(account.id)}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="function-column" aria-label="Mailbox functions">
        <header className="function-header">
          <span>Mailbox</span>
          <strong>{activeAccount?.name ?? "All mailboxes"}</strong>
          <small>{accountCountLabel}</small>
        </header>

        <nav className="function-tablist" role="tablist" aria-orientation="vertical" aria-label="Mailbox tabs">
          {primaryTabs.map((tabId) => {
            const Icon = tabIcons[tabId];
            const folder = folderById.get(tabId as FolderId);
            const label =
              tabId === "timetable" ? "Timetable" : tabId === "channels" ? "Channels" : folder?.label ?? tabId;
            const unread = folder ? unreadByFolder(folder.id) : 0;

            return (
              <button
                key={tabId}
                className={`function-tab ${activeTab === tabId ? "is-active" : ""}`}
                onClick={() => onTabChange(tabId)}
                role="tab"
                aria-selected={activeTab === tabId}
                type="button"
              >
                <Icon size={18} />
                <span>{label}</span>
                {unread > 0 ? <em>{unread}</em> : null}
              </button>
            );
          })}
        </nav>
      </section>
    </aside>
  );
}
