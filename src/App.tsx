import { useEffect, useMemo, useState } from "react";
import { Archive, MailPlus, RefreshCcw, Settings, Trash2 } from "lucide-react";
import { accounts, folders, initialMessages } from "./data/mail";
import { createSentMessage, filterMessages } from "./lib/mailActions";
import type { DraftMessage, FolderId, MailMessage } from "./types";
import { Composer } from "./components/Composer";
import { MessageList } from "./components/MessageList";
import { MessageReader } from "./components/MessageReader";
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

function App() {
  const [messages, setMessages] = useState<MailMessage[]>(initialMessages);
  const [activeAccountId, setActiveAccountId] = useState(accounts[0].id);
  const [activeFolder, setActiveFolder] = useState<FolderId>("inbox");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialMessages[0].id);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<DraftMessage>(emptyDraft);
  const [syncing, setSyncing] = useState(false);
  const [platform, setPlatform] = useState("browser");

  const filteredMessages = useMemo(
    () => filterMessages(messages, activeFolder, activeAccountId, query),
    [activeAccountId, activeFolder, messages, query]
  );

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? filteredMessages[0],
    [filteredMessages, messages, selectedId]
  );

  const activeAccount = accounts.find((account) => account.id === activeAccountId) ?? accounts[0];

  useEffect(() => {
    window.mailgui233?.getPlatform().then((value) => setPlatform(value));
  }, []);

  useEffect(() => {
    if (filteredMessages.length > 0 && !filteredMessages.some((message) => message.id === selectedId)) {
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

  function sendDraft() {
    const sent = createSentMessage(draft, activeAccountId);
    setMessages((current) => [sent, ...current]);
    setSelectedId(sent.id);
    setActiveFolder("sent");
    setDraft(emptyDraft());
    setComposerOpen(false);
  }

  return (
    <main className="app-shell">
      <Sidebar
        accounts={accounts}
        folders={folders}
        activeAccountId={activeAccountId}
        activeFolder={activeFolder}
        messages={messages}
        onAccountChange={setActiveAccountId}
        onFolderChange={setActiveFolder}
      />

      <section className="mail-workspace" aria-label="Mail workspace">
        <TopBar
          account={activeAccount}
          query={query}
          syncing={syncing}
          onQueryChange={setQuery}
          actions={[
            { label: "Compose", icon: MailPlus, onClick: () => setComposerOpen(true), tone: "primary" },
            { label: "Refresh", icon: RefreshCcw, onClick: refreshMail },
            { label: "Archive", icon: Archive, onClick: () => moveSelected("archive"), disabled: !selectedMessage },
            { label: "Trash", icon: Trash2, onClick: () => moveSelected("trash"), disabled: !selectedMessage },
            { label: "Settings", icon: Settings, onClick: () => setActiveFolder("inbox") }
          ]}
        />

        <div className="content-grid">
          <MessageList
            messages={filteredMessages}
            selectedId={selectedMessage?.id}
            onSelect={selectMessage}
          />
          <MessageReader
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

        <StatusBar
          platform={platform}
          account={activeAccount}
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
