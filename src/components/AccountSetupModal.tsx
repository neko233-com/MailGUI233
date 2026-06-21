import { Check, ChevronRight, Eye, EyeOff, MailPlus, Server, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import type { AccountProvider, ProviderDefinition } from "../types";

export interface AccountSetupValues {
  address: string;
  provider: AccountProvider;
  auth: string;
  incoming: string;
  pop3: string;
  outgoing: string;
}

interface AccountSetupModalProps {
  providers: ProviderDefinition[];
  onClose: () => void;
  onSubmit: (values: AccountSetupValues) => void;
}

function providerFromAddress(address: string, providers: ProviderDefinition[]) {
  const domain = address.split("@")[1]?.toLowerCase() ?? "";

  return providers.find((provider) =>
    provider.domains.some((providerDomain) => domain === providerDomain || domain.endsWith(`.${providerDomain}`))
  ) ?? providers.find((provider) => provider.id === "imap") ?? providers[0];
}

export function AccountSetupModal({ providers, onClose, onSubmit }: AccountSetupModalProps) {
  const { t } = useI18n();
  const initialProvider = providers.find((provider) => provider.id === "qq") ?? providers[0];
  const [providerId, setProviderId] = useState<AccountProvider>(initialProvider.id);
  const [address, setAddress] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [incoming, setIncoming] = useState(initialProvider.incoming);
  const [pop3, setPop3] = useState(initialProvider.pop3 ?? "");
  const [outgoing, setOutgoing] = useState(initialProvider.outgoing);
  const [showSecret, setShowSecret] = useState(false);
  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId) ?? initialProvider,
    [initialProvider, providerId, providers]
  );
  const canSubmit = address.trim().includes("@") && authCode.trim().length > 0;

  function applyProvider(provider: ProviderDefinition) {
    setProviderId(provider.id);
    setIncoming(provider.incoming);
    setPop3(provider.pop3 ?? "");
    setOutgoing(provider.outgoing);
  }

  function handleAddressChange(value: string) {
    setAddress(value);

    const nextProvider = providerFromAddress(value, providers);
    if (value.includes("@") && nextProvider.id !== providerId) {
      applyProvider(nextProvider);
    }
  }

  function submit() {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      address: address.trim().toLowerCase(),
      provider: selectedProvider.id,
      auth: selectedProvider.auth,
      incoming: incoming.trim(),
      pop3: pop3.trim(),
      outgoing: outgoing.trim()
    });
  }

  return (
    <div className="account-setup-backdrop" role="presentation">
      <section className="account-setup-modal" aria-label={t("addMailbox")} role="dialog" aria-modal="true">
        <button className="account-setup-close" onClick={onClose} type="button" aria-label={t("close")}>
          <X size={18} />
        </button>

        <header className="account-setup-hero">
          <div className="account-setup-orbit" aria-hidden="true">
            {providers.slice(0, 6).map((provider, index) => (
              <span key={provider.id} style={{ "--orbit-index": index, "--provider-accent": provider.accent } as CSSProperties}>
                {provider.shortName.slice(0, 2)}
              </span>
            ))}
          </div>
          <span className="account-setup-icon">
            <MailPlus size={20} />
          </span>
          <div>
            <strong>{t("mailboxSetupTitle")}</strong>
            <p>{t("mailboxSetupSubtitle")}</p>
          </div>
        </header>

        <div className="account-provider-strip" aria-label={t("mailboxProvider")}>
          {providers.map((provider) => (
            <button
              key={provider.id}
              className={provider.id === selectedProvider.id ? "is-active" : ""}
              onClick={() => applyProvider(provider)}
              style={{ "--provider-accent": provider.accent } as CSSProperties}
              type="button"
            >
              <span>{provider.shortName.slice(0, 2)}</span>
              <strong>{provider.shortName}</strong>
            </button>
          ))}
        </div>

        <div className="account-setup-form">
          <label className="setup-service-row">
            <span>{t("mailboxProvider")}</span>
            <button type="button">
              {selectedProvider.name}
              <ChevronRight size={17} />
            </button>
          </label>

          <label>
            <span>{t("mailboxAddress")}</span>
            <input
              autoFocus
              value={address}
              onChange={(event) => handleAddressChange(event.target.value)}
              placeholder="1417015340@qq.com"
              type="email"
            />
          </label>

          <label>
            <span>{t("authorizationCode")}</span>
            <div className="secret-input">
              <input
                value={authCode}
                onChange={(event) => setAuthCode(event.target.value)}
                placeholder={selectedProvider.auth}
                type={showSecret ? "text" : "password"}
              />
              <button onClick={() => setShowSecret((current) => !current)} type="button" aria-label={t("toggleSecret")}>
                {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <section className="protocol-editor" aria-label={t("mailboxProtocolSettings")}>
            <header>
              <Server size={16} />
              <strong>{t("mailboxProtocolSettings")}</strong>
              <em>{selectedProvider.capabilitySummary}</em>
            </header>
            <label>
              <span>IMAP</span>
              <input value={incoming} onChange={(event) => setIncoming(event.target.value)} />
            </label>
            <label>
              <span>POP3</span>
              <input value={pop3} onChange={(event) => setPop3(event.target.value)} />
            </label>
            <label>
              <span>SMTP</span>
              <input value={outgoing} onChange={(event) => setOutgoing(event.target.value)} />
            </label>
            <p>{selectedProvider.setupNote}</p>
          </section>
        </div>

        <footer className="account-setup-actions">
          <button onClick={onClose} type="button">
            {t("cancel")}
          </button>
          <button className="setup-submit" disabled={!canSubmit} onClick={submit} type="button">
            <Check size={17} />
            {t("connectMailbox")}
          </button>
        </footer>
      </section>
    </div>
  );
}
