import { Send, X } from "lucide-react";
import type { DraftMessage } from "../types";

interface ComposerProps {
  draft: DraftMessage;
  onChange: (draft: DraftMessage) => void;
  onClose: () => void;
  onSend: () => void;
}

export function Composer({ draft, onChange, onClose, onSend }: ComposerProps) {
  const canSend = draft.to.trim().length > 0 && draft.body.trim().length > 0;

  return (
    <section className="composer" aria-label="Compose message">
      <header>
        <strong>New message</strong>
        <button onClick={onClose} title="Close composer" type="button">
          <X size={18} />
        </button>
      </header>

      <label>
        <span>To</span>
        <input
          value={draft.to}
          onChange={(event) => onChange({ ...draft, to: event.target.value })}
          placeholder="name@example.com"
        />
      </label>

      <label>
        <span>Cc</span>
        <input
          value={draft.cc}
          onChange={(event) => onChange({ ...draft, cc: event.target.value })}
          placeholder="optional"
        />
      </label>

      <label>
        <span>Subject</span>
        <input
          value={draft.subject}
          onChange={(event) => onChange({ ...draft, subject: event.target.value })}
          placeholder="Subject"
        />
      </label>

      <textarea
        value={draft.body}
        onChange={(event) => onChange({ ...draft, body: event.target.value })}
        placeholder="Write message..."
      />

      <footer>
        <button className="send-button" onClick={onSend} disabled={!canSend} type="button">
          <Send size={17} />
          Send
        </button>
      </footer>
    </section>
  );
}
