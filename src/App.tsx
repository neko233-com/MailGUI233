import { useEffect, useMemo, useState } from "react";
import { Archive, MailPlus, RefreshCcw, Trash2 } from "lucide-react";
import { accounts, calendarEvents, folders, initialMessages, providerCatalog } from "./data/mail";
import { createSentMessage, filterMessages } from "./lib/mailActions";
import type { Account, AccountScope, DraftMessage, FolderId, MailboxTabId, MailMessage, ProviderScope } from "./types";
import { ChannelPanel } from "./components/ChannelPanel";
import { Composer } from "./components/Composer";
import { MessageList } from "./components/MessageList";
import { MessageReader } from "./components/MessageReader";
import { SchedulePanel } from "./components/SchedulePanel";
import { ShaderBackdrop } from "./components/ShaderBackdrop";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { TopBar } from "./components/TopBar";

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

function App() {
  const [messages, setMessages] = useState<MailMessage[]>(initialMessages);
  const [activeAccountId, setActiveAccountId] = useState<AccountScope>("all");
  const [activeProviderId, setActiveProviderId] = useState<ProviderScope>("all");
  const [activeTab, setActiveTab] = useState<MailboxTabId>("inbox");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(initialMessages[0].id);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<DraftMessage>(emptyDraft);
  const [syncing, setSyncing] = useState(false);
  const [verifyingChannels, setVerifyingChannels] = useState(false);
  const [lastChannelCheck, setLastChannelCheck] = useState<string | null>(null);
  const [platform, setPlatform] = useState("browser");
  const activeFolder = isFolderTab(activeTab) ? activeTab : "inbox";
  const isMailTab = isFolderTab(activeTab);

  const filteredMessages = useMemo(
    () => filterMessages(messages, activeFolder, activeAccountId, query, accounts, activeProviderId),
    [activeAccountId, activeFolder, activeProviderId, messages, query]
  );

  const selectedMessage = useMemo(
    () => filteredMessages.find((message) => message.id === selectedId) ?? filteredMessages[0],
    [filteredMessages, selectedId]
  );

  const accountById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), []);
  const activeAccount = activeAccountId === "all" ? undefined : accountById.get(activeAccountId);
  const activeProvider =
    activeProviderId === "all"
      ? undefined
      : providerCatalog.find((provider) => provider.id === activeProviderId);
  const selectedAccount = selectedMessage ? accountById.get(selectedMessage.accountId) : undefined;
  const activeFolderLabel = folders.find((folder) => folder.id === activeFolder)?.label ?? "Inbox";
  const activeViewLabel =
    activeTab === "timetable" ? "Timetable" : activeTab === "channels" ? "Channels" : activeFolderLabel;
  const title = activeAccount?.name ?? activeProvider?.name ?? "All mailboxes";
  const subtitle =
    activeTab === "channels"
      ? "Verify Gmail, QQ, Outlook, iCloud, NetEase, Proton, and custom IMAP"
      : `${activeViewLabel} / ${activeAccount?.address ?? activeProvider?.capabilitySummary ?? "all providers"}`;
  const scopeLabel = activeAccount?.address ?? activeProvider?.shortName ?? "All mailboxes";

  useEffect(() => {
    getDesktopPlatform().then((value) => setPlatform(value));
  }, []);

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

  function changeAccount(accountId: AccountScope) {
    setActiveAccountId(accountId);

    setActiveProviderId("all");
  }

  function changeProvider(providerId: ProviderScope) {
    setActiveProviderId(providerId);
    setActiveAccountId("all");
    setActiveTab("inbox");
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
        accounts.find(
          (account) => account.provider === activeProvider.id && account.status === "connected"
        ) ??
        accounts.find((account) => account.provider === activeProvider.id) ??
        accounts[0]
      );
    }

    return accounts.find((account) => account.status === "connected") ?? accounts[0];
  }

  function sendDraft() {
    const sent = createSentMessage(draft, resolveSendAccount());
    setMessages((current) => [sent, ...current]);
    setSelectedId(sent.id);
    setActiveTab("sent");
    setDraft(emptyDraft());
    setComposerOpen(false);
  }

  return (
    <main className="app-shell">
      <ShaderBackdrop />

      <Sidebar
        accounts={accounts}
        folders={folders}
        activeAccountId={activeAccountId}
        activeTab={activeTab}
        messages={messages}
        onAccountChange={changeAccount}
        onTabChange={setActiveTab}
      />

      <section className="mail-workspace" aria-label="Mail workspace">
        <TopBar
          title={title}
          subtitle={subtitle}
          query={query}
          syncing={syncing}
          onQueryChange={setQuery}
          actions={[
            { label: "Compose", icon: MailPlus, onClick: () => setComposerOpen(true), tone: "primary" },
            { label: "Refresh", icon: RefreshCcw, onClick: refreshMail },
            ...(isMailTab
              ? [
                  { label: "Archive", icon: Archive, onClick: () => moveSelected("archive"), disabled: !selectedMessage },
                  { label: "Trash", icon: Trash2, onClick: () => moveSelected("trash"), disabled: !selectedMessage }
                ]
              : []),
          ]}
        />

        {activeTab === "channels" ? (
          <div className="channel-workspace">
            <ChannelPanel
              accounts={accounts}
              providers={providerCatalog}
              activeProviderId={activeProviderId}
              verifying={verifyingChannels}
              lastVerifiedAt={lastChannelCheck}
              onProviderChange={changeProvider}
              onVerifyAll={verifyAllChannels}
            />
          </div>
        ) : activeTab === "timetable" ? (
          <div className="timetable-layout">
            <SchedulePanel
              activeAccountId={activeAccountId}
              activeProviderId={activeProviderId}
              accounts={accounts}
              messages={messages}
              events={calendarEvents}
            />
          </div>
        ) : (
          <div className="content-grid">
            <MessageList
              accounts={accounts}
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
          accounts={accounts}
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
    </main>
  );
}

export default App;
