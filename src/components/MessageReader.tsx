import { Archive, Mail, Reply, Star, Trash2 } from "lucide-react";
import { useI18n } from "../i18n";
import { accountDisplayName, providerDisplayNameById } from "../lib/displayNames";
import type { Account, MailMessage } from "../types";

interface MessageReaderProps {
  account?: Account;
  message?: MailMessage;
  onArchive: () => void;
  onDelete: () => void;
  onReply: (message: MailMessage) => void;
  onToggleStar: (id: string) => void;
}

export function MessageReader({
  account,
  message,
  onArchive,
  onDelete,
  onReply,
  onToggleStar
}: MessageReaderProps) {
  const { locale, resolvedLanguage, t } = useI18n();
  const longDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short"
  });

  if (!message) {
    return (
      <section className="reader empty-reader" aria-label={t("messageReader")}>
        <Mail size={36} />
        <strong>{t("selectMessage")}</strong>
        <span>{t("messageContentHint")}</span>
      </section>
    );
  }

  return (
    <article className="reader" aria-label={t("messageReader")}>
      <header className="reader-header">
        <div>
          <h2>{message.subject}</h2>
          {account ? (
            <span className="reader-channel">
              {providerDisplayNameById(account.provider, resolvedLanguage)} / {accountDisplayName(account, resolvedLanguage)} / {account.status.replace("-", " ")}
            </span>
          ) : null}
          <p>
            {t("from")} <strong>{message.from.name}</strong> &lt;{message.from.address}&gt;
          </p>
          <time>{longDate.format(new Date(message.timestamp))}</time>
        </div>
        <div className="reader-actions">
          <button title={t("toggleStar")} onClick={() => onToggleStar(message.id)} type="button">
            <Star size={18} fill={message.starred ? "currentColor" : "none"} />
          </button>
          <button title={t("reply")} onClick={() => onReply(message)} type="button">
            <Reply size={18} />
          </button>
          <button title={t("archive")} onClick={onArchive} type="button">
            <Archive size={18} />
          </button>
          <button title={t("trash")} onClick={onDelete} type="button">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="recipient-row">
        <span>{t("to")}</span>
        <strong>{message.to.map((contact) => contact.address).join(", ")}</strong>
      </div>

      {message.attachments.length > 0 ? (
        <div className="attachment-strip">
          {message.attachments.map((attachment) => (
            <button key={attachment} type="button">
              {attachment}
            </button>
          ))}
        </div>
      ) : null}

      <div className="message-body">
        {message.body.split("\n").map((line, index) => (
          <p key={`${message.id}-${index}`}>{line || "\u00a0"}</p>
        ))}
      </div>
    </article>
  );
}
