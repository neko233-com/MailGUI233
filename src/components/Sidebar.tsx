import { Archive, Inbox, Send, Star, Trash2, FileText } from "lucide-react";
import type { Account, Folder, FolderId, MailMessage } from "../types";

const folderIcons = {
  inbox: Inbox,
  starred: Star,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2
};

interface SidebarProps {
  accounts: Account[];
  folders: Folder[];
  activeAccountId: string;
  activeFolder: FolderId;
  messages: MailMessage[];
  onAccountChange: (accountId: string) => void;
  onFolderChange: (folderId: FolderId) => void;
}

export function Sidebar({
  accounts,
  folders,
  activeAccountId,
  activeFolder,
  messages,
  onAccountChange,
  onFolderChange
}: SidebarProps) {
  const unreadByFolder = (folderId: FolderId) =>
    messages.filter(
      (message) =>
        message.accountId === activeAccountId &&
        message.unread &&
        (folderId === "starred" ? message.starred : message.folder === folderId)
    ).length;

  return (
    <aside className="sidebar" aria-label="Mail navigation">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div>
          <h1>MailGUI233</h1>
          <p>Desktop mail hub</p>
        </div>
      </div>

      <div className="account-switcher" aria-label="Accounts">
        {accounts.map((account) => (
          <button
            key={account.id}
            className={`account-button ${activeAccountId === account.id ? "is-active" : ""}`}
            style={{ "--account-accent": account.accent } as React.CSSProperties}
            onClick={() => onAccountChange(account.id)}
            type="button"
          >
            <span className="account-dot" />
            <span>
              <strong>{account.name}</strong>
              <small>{account.address}</small>
            </span>
          </button>
        ))}
      </div>

      <nav className="folder-list" aria-label="Folders">
        {folders.map((folder) => {
          const Icon = folderIcons[folder.id];
          const unread = unreadByFolder(folder.id);
          return (
            <button
              key={folder.id}
              className={`folder-button ${activeFolder === folder.id ? "is-active" : ""}`}
              onClick={() => onFolderChange(folder.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{folder.label}</span>
              {unread > 0 ? <em>{unread}</em> : null}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <strong>Local first</strong>
        <span>UI state runs offline. Provider sync layer can plug into Electron IPC.</span>
      </div>
    </aside>
  );
}
