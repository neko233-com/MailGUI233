import { Paperclip, Star } from "lucide-react";
import type { MailMessage } from "../types";

interface MessageListProps {
  messages: MailMessage[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const formatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function MessageList({ messages, selectedId, onSelect }: MessageListProps) {
  return (
    <section className="message-list" aria-label="Messages">
      <div className="list-heading">
        <strong>Messages</strong>
        <span>{messages.length}</span>
      </div>

      <div className="message-scroll">
        {messages.length === 0 ? (
          <div className="empty-state">
            <strong>No messages</strong>
            <span>Search or folder has no matching mail.</span>
          </div>
        ) : null}

        {messages.map((message) => (
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
        ))}
      </div>
    </section>
  );
}
