import { Send, X } from "lucide-react";
import { useI18n } from "../i18n";
import type { DraftMessage } from "../types";

interface ComposerProps {
  draft: DraftMessage;
  onChange: (draft: DraftMessage) => void;
  onClose: () => void;
  onSend: () => void;
}

export function Composer({ draft, onChange, onClose, onSend }: ComposerProps) {
  const { t } = useI18n();
  const canSend = draft.to.trim().length > 0 && draft.body.trim().length > 0;

  return (
    <section className="composer" aria-label={t("compose")}>
      <header>
        <strong>{t("newMessage")}</strong>
        <button onClick={onClose} title={t("closeComposer")} type="button">
          <X size={18} />
        </button>
      </header>

      <label>
        <span>{t("to")}</span>
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
          placeholder={t("optional")}
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
        placeholder={t("writeMessage")}
      />

      <footer>
        <button className="send-button" onClick={onSend} disabled={!canSend} type="button">
          <Send size={17} />
          {t("send")}
        </button>
      </footer>
    </section>
  );
}
