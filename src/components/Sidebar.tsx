import {
  Archive,
  CalendarDays,
  FileText,
  Inbox,
  MailPlus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Star,
  Trash2
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "../i18n";
import { accountDisplayName } from "../lib/displayNames";
import { LogoMark } from "./LogoMark";
import type { Account, AccountScope, Folder, FolderId, MailboxTabId, MailMessage } from "../types";

const tabIcons: Record<MailboxTabId, LucideIcon> = {
  inbox: Inbox,
  timetable: CalendarDays,
  starred: Star,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2,
  channels: Settings,
  settings: SlidersHorizontal
};

const primaryTabs: MailboxTabId[] = [
  "inbox",
  "timetable",
  "starred",
  "sent",
  "drafts",
  "archive",
  "trash",
  "channels",
  "settings"
];
const tabLabels: Record<MailboxTabId, ReturnType<typeof labelKey>> = {
  archive: "archive",
  channels: "channels",
  drafts: "drafts",
  inbox: "inbox",
  sent: "sent",
  settings: "settings",
  starred: "starred",
  timetable: "timetable",
  trash: "trash"
};

function labelKey(value: MailboxTabId) {
  return value;
}

interface SidebarProps {
  accounts: Account[];
  folders: Folder[];
  activeAccountId: AccountScope;
  activeTab: MailboxTabId;
  messages: MailMessage[];
  onAccountChange: (accountId: AccountScope) => void;
  onTabChange: (tabId: MailboxTabId) => void;
  onAccountAdd: () => void;
  onAccountDelete: () => void;
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
  onTabChange,
  onAccountAdd,
  onAccountDelete
}: SidebarProps) {
  const { resolvedLanguage, t } = useI18n();
  const [accountQuery, setAccountQuery] = useState("");
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  const activeAccount = activeAccountId === "all" ? undefined : accounts.find((account) => account.id === activeAccountId);
  const accountCountLabel = activeAccount ? activeAccount.address : t("mailboxes", { count: accounts.length });
  const activeAccountName = activeAccount ? accountDisplayName(activeAccount, resolvedLanguage) : t("allMailboxes");
  const filteredAccounts = useMemo(() => {
    const normalized = accountQuery.trim().toLowerCase();

    if (!normalized) {
      return accounts;
    }

    return accounts.filter((account) =>
      [
        accountDisplayName(account, resolvedLanguage),
        account.name,
        account.address,
        account.provider
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [accountQuery, accounts, resolvedLanguage]);

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
    <aside className="sidebar" aria-label={t("mailNavigation")}>
      <section className="mailbox-column" aria-label={t("mailboxList")}>
        <div className="mailbox-brand" aria-hidden="true">
          <LogoMark />
          <span>Mail233</span>
        </div>

        <div className="mailbox-tools">
          <label className="mailbox-search">
            <Search size={15} />
            <input
              value={accountQuery}
              onChange={(event) => setAccountQuery(event.target.value)}
              placeholder={t("searchMailboxes")}
            />
          </label>
          <button onClick={onAccountAdd} title={t("addMailbox")} type="button">
            <MailPlus size={16} />
          </button>
          <button onClick={onAccountDelete} disabled={activeAccountId === "all"} title={t("deleteMailbox")} type="button">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="account-tablist" role="tablist" aria-orientation="vertical" aria-label={t("mailboxList")}>
          <button
            className={`account-tab ${activeAccountId === "all" ? "is-active" : ""}`}
            onClick={() => onAccountChange("all")}
            role="tab"
            aria-selected={activeAccountId === "all"}
            aria-label={`${t("allMailboxes")}, ${unreadForScope("all")} unread`}
            type="button"
          >
            <span className="account-glyph all-glyph">All</span>
            <strong>{t("allMailboxes")}</strong>
            <em>{unreadForScope("all")}</em>
          </button>

          {filteredAccounts.map((account) => {
            const displayName = accountDisplayName(account, resolvedLanguage);

            return (
              <button
                key={account.id}
                className={`account-tab status-${account.status} ${activeAccountId === account.id ? "is-active" : ""}`}
                onClick={() => onAccountChange(account.id)}
                role="tab"
                aria-selected={activeAccountId === account.id}
                aria-label={`${displayName}, ${account.provider.toUpperCase()}, ${account.status.replace("-", " ")}`}
                style={{ "--account-accent": account.accent } as CSSProperties}
                type="button"
              >
                <span className="account-glyph">{accountInitials(displayName)}</span>
                <strong>{displayName}</strong>
                <em>{unreadForScope(account.id)}</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="function-column" aria-label={t("mailboxFunctions")}>
        <header className="function-header">
          <span>{t("mailbox")}</span>
          <strong>{activeAccountName}</strong>
          <small>{accountCountLabel}</small>
        </header>

        <nav className="function-tablist" role="tablist" aria-orientation="vertical" aria-label={t("mailboxFunctions")}>
          {primaryTabs.map((tabId) => {
            const Icon = tabIcons[tabId];
            const folder = folderById.get(tabId as FolderId);
            const label = t(tabLabels[tabId]);
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
