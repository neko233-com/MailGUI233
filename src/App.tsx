import { useEffect, useMemo, useState } from "react";
import { Archive, MailPlus, RefreshCcw, Trash2 } from "lucide-react";
import { accounts as demoAccounts, calendarEvents as demoCalendarEvents, folders, initialMessages, providerCatalog } from "./data/mail";
import { initialCloudSyncConfigs } from "./lib/cloudSyncStrategies";
import { accountDisplayName, providerDisplayName } from "./lib/displayNames";
import { createSentMessage, filterMessages } from "./lib/mailActions";
import type {
  Account,
  AccountScope,
  CalendarEvent,
  CloudSyncConfig,
  CloudSyncStrategyId,
  DraftMessage,
  FolderId,
  MailboxTabId,
  MailMessage,
  AccountProvider,
  ProviderScope
} from "./types";
import { ChannelPanel } from "./components/ChannelPanel";
import { Composer } from "./components/Composer";
import { MessageList } from "./components/MessageList";
import { MessageReader } from "./components/MessageReader";
import { SchedulePanel } from "./components/SchedulePanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { ShaderBackdrop } from "./components/ShaderBackdrop";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { TitleBar } from "./components/TitleBar";
import { TopBar } from "./components/TopBar";
import { useI18n } from "./i18n";

const emptyDraft = (): DraftMessage => ({
  id: `draft-${Date.now()}`,
  to: "",
  cc: "",
  subject: "",
  body: ""
});

const folderTabIds = new Set<FolderId>(["inbox", "starred", "sent", "drafts", "archive", "trash"]);

function isFolderTab(tabId: MailboxTabId): tabId is FolderId {
  return folderTabIds.has(tabId as FolderId);
}

async function getDesktopPlatform() {
  try {
    const { invoke, isTauri } = await import("@tauri-apps/api/core");

    if (isTauri()) {
      return invoke<string>("platform");
    }
  } catch {
    return "browser";
  }

  return "browser";
}

function demoDataEnabled() {
  const isBrowserPreview = window.location.protocol === "http:" || window.location.protocol === "https:";

  return import.meta.env.DEV || (isBrowserPreview && window.localStorage.getItem("mailgui233.demoData") === "true");
}

const accountsStorageKey = "mailgui233.accounts";
const calendarEventsStorageKey = "mailgui233.calendarEvents";

function readStoredAccounts() {
  try {
    const stored = window.localStorage.getItem(accountsStorageKey);
    return stored ? (JSON.parse(stored) as Account[]) : [];
  } catch {
    return [];
  }
}

function readStoredCalendarEvents() {
  try {
    const stored = window.localStorage.getItem(calendarEventsStorageKey);
    return stored ? (JSON.parse(stored) as CalendarEvent[]) : [];
  } catch {
    return [];
  }
}

function providerFromAddress(address: string): AccountProvider {
  const domain = address.split("@")[1]?.toLowerCase() ?? "";

  if (domain === "qq.com" || domain === "foxmail.com") return "qq";
  if (domain === "gmail.com" || domain === "googlemail.com") return "gmail";
  if (["outlook.com", "hotmail.com", "live.com"].includes(domain)) return "outlook";
  if (["icloud.com", "me.com", "mac.com"].includes(domain)) return "icloud";
  if (["163.com", "126.com", "yeah.net"].includes(domain)) return "netease";
  if (["proton.me", "protonmail.com"].includes(domain)) return "proton";
  if (domain === "zoho.com") return "zoho";
  if (["yahoo.com", "ymail.com", "aol.com"].includes(domain)) return "yahoo";

  return "imap";
}

function createAccount(address: string): Account {
  const provider = providerFromAddress(address);
  const providerDefinition = providerCatalog.find((item) => item.id === provider) ?? providerCatalog.at(-1)!;
  const localPart = address.split("@")[0] || address;

  return {
    id: `${provider}-${Date.now()}`,
    name: provider === "qq" ? "QQ Mail" : providerDefinition.shortName === "IMAP" ? localPart : providerDefinition.shortName,
    address,
    provider,
    accent: providerDefinition.accent,
    unread: 0,
    status: "needs-auth",
    auth: providerDefinition.auth,
    incoming: providerDefinition.incoming,
    outgoing: providerDefinition.outgoing,
    lastSync: new Date().toISOString(),
    capabilities: providerDefinition.capabilities
  };
}

function App() {
  const { resolvedLanguage, t } = useI18n();
  const useDemoData = demoDataEnabled();
  const [appAccounts, setAppAccounts] = useState<Account[]>(() => (useDemoData ? demoAccounts : readStoredAccounts()));
  const [appEvents, setAppEvents] = useState<CalendarEvent[]>(() => (useDemoData ? demoCalendarEvents : readStoredCalendarEvents()));
  const [messages, setMessages] = useState<MailMessage[]>(() => (useDemoData ? initialMessages : []));
  const [activeAccountId, setActiveAccountId] = useState<AccountScope>("all");
  const [activeProviderId, setActiveProviderId] = useState<ProviderScope>("all");
  const [activeTab, setActiveTab] = useState<MailboxTabId>("inbox");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(() => (useDemoData ? initialMessages[0]?.id : undefined));
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<DraftMessage>(emptyDraft);
  const [syncing, setSyncing] = useState(false);
  const [cloudSyncConfigs, setCloudSyncConfigs] =
    useState<Record<CloudSyncStrategyId, CloudSyncConfig>>(initialCloudSyncConfigs);
  const [verifyingChannels, setVerifyingChannels] = useState(false);
  const [lastChannelCheck, setLastChannelCheck] = useState<string | null>(null);
  const [platform, setPlatform] = useState("browser");
  const activeFolder = isFolderTab(activeTab) ? activeTab : "inbox";
  const isMailTab = isFolderTab(activeTab);

  const filteredMessages = useMemo(
    () => filterMessages(messages, activeFolder, activeAccountId, query, appAccounts, activeProviderId),
    [activeAccountId, activeFolder, activeProviderId, appAccounts, messages, query]
  );

  const selectedMessage = useMemo(
    () => filteredMessages.find((message) => message.id === selectedId) ?? filteredMessages[0],
    [filteredMessages, selectedId]
  );

  const accountById = useMemo(() => new Map(appAccounts.map((account) => [account.id, account])), [appAccounts]);
  const activeAccount = activeAccountId === "all" ? undefined : accountById.get(activeAccountId);
  const activeProvider =
    activeProviderId === "all"
      ? undefined
      : providerCatalog.find((provider) => provider.id === activeProviderId);
  const selectedAccount = selectedMessage ? accountById.get(selectedMessage.accountId) : undefined;
  const folderLabelById: Record<FolderId, string> = {
    archive: t("archive"),
    drafts: t("drafts"),
    inbox: t("inbox"),
    sent: t("sent"),
    starred: t("starred"),
    trash: t("trash")
  };
  const activeFolderLabel = folderLabelById[activeFolder] ?? t("inbox");
  const activeViewLabel =
    activeTab === "timetable"
      ? t("timetable")
      : activeTab === "channels"
        ? t("channels")
        : activeTab === "settings"
          ? t("settings")
          : activeFolderLabel;
  const title = activeAccount
    ? accountDisplayName(activeAccount, resolvedLanguage)
    : activeProvider
      ? providerDisplayName(activeProvider, resolvedLanguage)
      : t("allMailboxes");
  const subtitle =
    activeTab === "channels"
      ? "Verify Gmail, QQ, Outlook, iCloud, NetEase, Proton, and custom IMAP"
      : activeTab === "settings"
        ? t("cloudSyncIntro")
      : `${activeViewLabel} / ${activeAccount?.address ?? activeProvider?.capabilitySummary ?? "all providers"}`;
  const scopeLabel = activeAccount?.address ?? (activeProvider ? providerDisplayName(activeProvider, resolvedLanguage) : t("allMailboxes"));

  useEffect(() => {
    getDesktopPlatform().then((value) => setPlatform(value));
  }, []);

  useEffect(() => {
    if (!useDemoData) {
      window.localStorage.setItem(accountsStorageKey, JSON.stringify(appAccounts));
    }
  }, [appAccounts, useDemoData]);

  useEffect(() => {
    if (!useDemoData) {
      window.localStorage.setItem(calendarEventsStorageKey, JSON.stringify(appEvents));
    }
  }, [appEvents, useDemoData]);

  useEffect(() => {
    if (filteredMessages.length === 0) {
      setSelectedId(undefined);
      return;
    }

    if (!filteredMessages.some((message) => message.id === selectedId)) {
      setSelectedId(filteredMessages[0].id);
    }
  }, [filteredMessages, selectedId]);

  function patchMessage(id: string, patch: Partial<MailMessage>) {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, ...patch } : message))
    );
  }

  function deleteMessage(id: string) {
    setMessages((current) => current.filter((message) => message.id !== id));

    if (selectedId === id) {
      setSelectedId(undefined);
    }
  }

  function selectMessage(id: string) {
    setSelectedId(id);
    patchMessage(id, { unread: false });
  }

  function moveSelected(folder: FolderId) {
    if (!selectedMessage) {
      return;
    }
    patchMessage(selectedMessage.id, { folder, unread: false });
  }

  function refreshMail() {
    setSyncing(true);
    window.setTimeout(() => setSyncing(false), 700);
  }

  function verifyAllChannels() {
    setVerifyingChannels(true);
    setSyncing(true);
    window.setTimeout(() => {
      setLastChannelCheck(new Date().toISOString());
      setVerifyingChannels(false);
      setSyncing(false);
    }, 900);
  }

  function changeCloudSyncConfig(strategyId: CloudSyncStrategyId, config: CloudSyncConfig) {
    setCloudSyncConfigs((current) => ({
      ...current,
      [strategyId]: config
    }));
  }

  function changeAccount(accountId: AccountScope) {
    setActiveAccountId(accountId);

    setActiveProviderId("all");
  }

  function changeProvider(providerId: ProviderScope) {
    setActiveProviderId(providerId);
    setActiveAccountId("all");
    setActiveTab("inbox");
  }

  function addAccount() {
    const address = window.prompt(t("addMailboxPrompt"));
    const normalized = address?.trim().toLowerCase();

    if (!normalized || !normalized.includes("@")) {
      return;
    }

    const account = createAccount(normalized);
    setAppAccounts((current) => [account, ...current]);
    setActiveAccountId(account.id);
    setActiveProviderId("all");
    setActiveTab("inbox");
  }

  function deleteActiveAccount() {
    if (activeAccountId === "all") {
      return;
    }

    setAppAccounts((current) => current.filter((account) => account.id !== activeAccountId));
    setMessages((current) => current.filter((message) => message.accountId !== activeAccountId));
    setAppEvents((current) => current.filter((event) => event.accountId !== activeAccountId));
    setActiveAccountId("all");
    setSelectedId(undefined);
  }

  function createCalendarEvent(event: CalendarEvent) {
    setAppEvents((current) => [event, ...current]);
  }

  function updateCalendarEvent(nextEvent: CalendarEvent) {
    setAppEvents((current) =>
      current.map((event) => (event.id === nextEvent.id ? { ...event, ...nextEvent } : event))
    );
  }

  function deleteCalendarEvent(eventId: string) {
    setAppEvents((current) => current.filter((event) => event.id !== eventId));
  }

  function startReply(message: MailMessage) {
    setDraft({
      id: `reply-${message.id}`,
      to: `${message.from.name} <${message.from.address}>`,
      cc: "",
      subject: message.subject.startsWith("Re:") ? message.subject : `Re: ${message.subject}`,
      body: `\n\nOn ${new Date(message.timestamp).toLocaleString()}, ${message.from.name} wrote:\n> ${message.preview}`
    });
    setComposerOpen(true);
  }

  function resolveSendAccount(): Account {
    if (activeAccount) {
      return activeAccount;
    }

    if (activeProvider) {
      return (
        appAccounts.find(
          (account) => account.provider === activeProvider.id && account.status === "connected"
        ) ??
        appAccounts.find((account) => account.provider === activeProvider.id) ??
        appAccounts[0]
      );
    }

    return appAccounts.find((account) => account.status === "connected") ?? appAccounts[0];
  }

  function sendDraft() {
    if (appAccounts.length === 0) {
      return;
    }

    const sent = createSentMessage(draft, resolveSendAccount());
    setMessages((current) => [sent, ...current]);
    setSelectedId(sent.id);
    setActiveTab("sent");
    setDraft(emptyDraft());
    setComposerOpen(false);
  }

  return (
    <main className="app-frame">
      <TitleBar />
      <div className="app-shell">
        <ShaderBackdrop />

        <Sidebar
          accounts={appAccounts}
          folders={folders}
          activeAccountId={activeAccountId}
          activeTab={activeTab}
          messages={messages}
          onAccountChange={changeAccount}
          onTabChange={setActiveTab}
          onAccountAdd={addAccount}
          onAccountDelete={deleteActiveAccount}
        />

        <section className="mail-workspace" aria-label="Mail workspace">
          <TopBar
            title={title}
            subtitle={subtitle}
            query={query}
            syncing={syncing}
            onQueryChange={setQuery}
            actions={[
              { label: t("compose"), icon: MailPlus, onClick: () => setComposerOpen(true), disabled: appAccounts.length === 0, tone: "primary" },
              { label: t("refresh"), icon: RefreshCcw, onClick: refreshMail },
              ...(isMailTab
                ? [
                    { label: t("archive"), icon: Archive, onClick: () => moveSelected("archive"), disabled: !selectedMessage },
                    { label: t("trash"), icon: Trash2, onClick: () => moveSelected("trash"), disabled: !selectedMessage }
                  ]
                : []),
            ]}
          />

          {activeTab === "channels" ? (
            <div className="channel-workspace">
              <ChannelPanel
                accounts={appAccounts}
                providers={providerCatalog}
                activeProviderId={activeProviderId}
                verifying={verifyingChannels}
                lastVerifiedAt={lastChannelCheck}
                onProviderChange={changeProvider}
                onVerifyAll={verifyAllChannels}
              />
            </div>
          ) : activeTab === "settings" ? (
            <SettingsPanel configs={cloudSyncConfigs} onConfigChange={changeCloudSyncConfig} />
          ) : activeTab === "timetable" ? (
            <div className="timetable-layout">
              <SchedulePanel
                activeAccountId={activeAccountId}
                activeProviderId={activeProviderId}
                accounts={appAccounts}
                messages={messages}
                events={appEvents}
                onCreateEvent={createCalendarEvent}
                onUpdateEvent={updateCalendarEvent}
                onDeleteEvent={deleteCalendarEvent}
                onUpdateMessage={patchMessage}
                onDeleteMessage={deleteMessage}
              />
            </div>
          ) : (
            <div className="content-grid">
              <MessageList
                accounts={appAccounts}
                messages={filteredMessages}
                selectedId={selectedMessage?.id}
                onSelect={selectMessage}
              />
              <MessageReader
                account={selectedAccount}
                message={selectedMessage}
                onArchive={() => moveSelected("archive")}
                onDelete={() => moveSelected("trash")}
                onReply={startReply}
                onToggleStar={(id) => {
                  const target = messages.find((message) => message.id === id);
                  if (target) {
                    patchMessage(id, { starred: !target.starred });
                  }
                }}
              />
            </div>
          )}

          <StatusBar
            platform={platform}
            accounts={appAccounts}
            scopeLabel={scopeLabel}
            messageCount={filteredMessages.length}
            syncing={syncing}
          />
        </section>

        {composerOpen ? (
          <Composer
            draft={draft}
            onChange={setDraft}
            onClose={() => setComposerOpen(false)}
            onSend={sendDraft}
          />
        ) : null}
      </div>
    </main>
  );
}

export default App;
