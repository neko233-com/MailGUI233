import { Paperclip, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useI18n } from "../i18n";
import type { Account, MailMessage } from "../types";

interface MessageListProps {
  accounts: Account[];
  messages: MailMessage[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function MessageList({ accounts, messages, selectedId, onSelect }: MessageListProps) {
  const { locale, t } = useI18n();
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <section className="message-list" aria-label={t("messages")}>
      <div className="list-heading">
        <strong>{t("messages")}</strong>
        <span>{messages.length}</span>
      </div>

      <div className="message-scroll">
        {messages.length === 0 ? (
          <div className="empty-state">
            <strong>{t("noMessages")}</strong>
            <span>{t("searchEmpty")}</span>
          </div>
        ) : null}

        {messages.map((message) => {
          const account = accountById.get(message.accountId);

          return (
            <button
              key={message.id}
              className={`message-row ${selectedId === message.id ? "is-selected" : ""} ${
                message.unread ? "is-unread" : ""
              }`}
              onClick={() => onSelect(message.id)}
              type="button"
            >
              <span className={`priority-dot priority-${message.priority}`} />
              <span className="message-row-main">
                <span className="message-meta">
                  <strong>{message.from.name}</strong>
                  <time>{formatter.format(new Date(message.timestamp))}</time>
                </span>
                <span className="message-subject">{message.subject}</span>
                <span className="message-preview">{message.preview}</span>
                <span className="label-row">
                  {account ? (
                    <span
                      className="message-account"
                      style={{ "--account-accent": account.accent } as CSSProperties}
                    >
                      {account.provider.toUpperCase()}
                    </span>
                  ) : null}
                  {message.labels.map((label) => (
                    <em key={label}>{label}</em>
                  ))}
                  {message.attachments.length > 0 ? (
                    <span className="attachment-count">
                      <Paperclip size={13} />
                      {message.attachments.length}
                    </span>
                  ) : null}
                </span>
              </span>
              {message.starred ? <Star className="star-icon" size={16} fill="currentColor" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
