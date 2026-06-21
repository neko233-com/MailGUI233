import {
  CircleAlert,
  CircleCheck,
  Globe2,
  KeyRound,
  RefreshCcw,
  Server,
  ShieldCheck,
  WifiOff
} from "lucide-react";
import type { CSSProperties } from "react";
import type { Account, ConnectionStatus, ProviderDefinition, ProviderScope } from "../types";

interface ChannelPanelProps {
  accounts: Account[];
  providers: ProviderDefinition[];
  activeProviderId: ProviderScope;
  verifying: boolean;
  lastVerifiedAt: string | null;
  onProviderChange: (providerId: ProviderScope) => void;
  onVerifyAll: () => void;
}

const statusCopy: Record<ConnectionStatus, string> = {
  connected: "Connected",
  "needs-auth": "Needs auth",
  syncing: "Checking",
  offline: "Offline"
};

const statusIcon = {
  connected: CircleCheck,
  "needs-auth": CircleAlert,
  syncing: RefreshCcw,
  offline: WifiOff
};

function providerStatus(provider: ProviderDefinition, accounts: Account[], verifying: boolean) {
  if (verifying) {
    return "syncing";
  }

  const providerAccounts = accounts.filter((account) => account.provider === provider.id);

  if (providerAccounts.some((account) => account.status === "connected")) {
    return "connected";
  }

  if (providerAccounts.some((account) => account.status === "needs-auth")) {
    return "needs-auth";
  }

  return "offline";
}

function formatVerifiedAt(value: string | null) {
  if (!value) {
    return "Not run yet";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

export function ChannelPanel({
  accounts,
  providers,
  activeProviderId,
  verifying,
  lastVerifiedAt,
  onProviderChange,
  onVerifyAll
}: ChannelPanelProps) {
  const connectedCount = accounts.filter((account) => account.status === "connected").length;
  const needsAuthCount = accounts.filter((account) => account.status === "needs-auth").length;
  const providerCount = providers.length;

  return (
    <section className="channel-panel" aria-label="Mail channel coverage">
      <div className="channel-summary">
        <div className="channel-summary-title">
          <Globe2 size={19} />
          <div>
            <strong>Channel validation</strong>
            <span>
              {providerCount} providers, {connectedCount} connected, {needsAuthCount} need credentials
            </span>
          </div>
        </div>

        <button
          className="verify-button"
          onClick={onVerifyAll}
          disabled={verifying}
          type="button"
          title="Run channel validation"
        >
          <RefreshCcw size={17} className={verifying ? "is-spinning" : ""} />
          {verifying ? "Verifying" : "Verify all"}
        </button>

        <button
          className={`channel-filter-clear ${activeProviderId === "all" ? "is-active" : ""}`}
          onClick={() => onProviderChange("all")}
          type="button"
        >
          All providers
        </button>

        <span className="verified-stamp">Last check: {formatVerifiedAt(lastVerifiedAt)}</span>
      </div>

      <div className="channel-grid">
        {providers.map((provider) => {
          const status = providerStatus(provider, accounts, verifying);
          const StatusIcon = statusIcon[status];
          const linkedAccounts = accounts.filter((account) => account.provider === provider.id);
          const isActive = activeProviderId === provider.id;

          return (
            <button
              key={provider.id}
              aria-label={`${provider.shortName} channel ${statusCopy[status]}`}
              className={`channel-card status-${status} ${isActive ? "is-active" : ""}`}
              onClick={() => onProviderChange(provider.id)}
              style={{ "--provider-accent": provider.accent } as CSSProperties}
              type="button"
            >
              <span className="channel-card-top">
                <span className="provider-mark">{provider.shortName.slice(0, 2).toUpperCase()}</span>
                <span className="channel-state">
                  <StatusIcon size={15} />
                  {statusCopy[status]}
                </span>
              </span>

              <strong>{provider.shortName}</strong>
              <span className="channel-detail">{provider.capabilitySummary}</span>

              <span className="channel-meta-row">
                <span>
                  <KeyRound size={13} />
                  {provider.auth}
                </span>
                <span>
                  <Server size={13} />
                  {linkedAccounts.length || "Ready"}
                </span>
                <span>
                  <ShieldCheck size={13} />
                  {provider.capabilities.slice(0, 3).join(" / ")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
