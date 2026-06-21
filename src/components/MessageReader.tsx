import { Archive, Mail, Reply, Star, Trash2 } from "lucide-react";
import type { Account, MailMessage } from "../types";

interface MessageReaderProps {
  account?: Account;
  message?: MailMessage;
  onArchive: () => void;
  onDelete: () => void;
  onReply: (message: MailMessage) => void;
  onToggleStar: (id: string) => void;
}

const longDate = new Intl.DateTimeFormat("en", {
  dateStyle: "full",
  timeStyle: "short"
});

export function MessageReader({
  account,
  message,
  onArchive,
  onDelete,
  onReply,
  onToggleStar
}: MessageReaderProps) {
  if (!message) {
    return (
      <section className="reader empty-reader" aria-label="Message reader">
        <Mail size={36} />
        <strong>Select a message</strong>
        <span>Message content will appear here.</span>
      </section>
    );
  }

  return (
    <article className="reader" aria-label="Message reader">
      <header className="reader-header">
        <div>
          <h2>{message.subject}</h2>
          {account ? (
            <span className="reader-channel">
              {account.provider.toUpperCase()} / {account.name} / {account.status.replace("-", " ")}
            </span>
          ) : null}
          <p>
            From <strong>{message.from.name}</strong> &lt;{message.from.address}&gt;
          </p>
          <time>{longDate.format(new Date(message.timestamp))}</time>
        </div>
        <div className="reader-actions">
          <button title="Toggle star" onClick={() => onToggleStar(message.id)} type="button">
            <Star size={18} fill={message.starred ? "currentColor" : "none"} />
          </button>
          <button title="Reply" onClick={() => onReply(message)} type="button">
            <Reply size={18} />
          </button>
          <button title="Archive" onClick={onArchive} type="button">
            <Archive size={18} />
          </button>
          <button title="Trash" onClick={onDelete} type="button">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="recipient-row">
        <span>To</span>
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
