import type {
  Account,
  AccountScope,
  DraftMessage,
  FolderId,
  MailMessage,
  ProviderScope
} from "../types";

export function filterMessages(
  messages: MailMessage[],
  folder: FolderId,
  accountId: AccountScope,
  query: string,
  accounts: Account[],
  providerId: ProviderScope
) {
  const normalized = query.trim().toLowerCase();
  const accountById = new Map(accounts.map((account) => [account.id, account]));

  return messages
    .filter((message) => accountId === "all" || message.accountId === accountId)
    .filter((message) => {
      if (providerId === "all") {
        return true;
      }

      return accountById.get(message.accountId)?.provider === providerId;
    })
    .filter((message) => {
      if (folder === "starred") {
        return message.starred && message.folder !== "trash";
      }
      return message.folder === folder;
    })
    .filter((message) => {
      if (!normalized) {
        return true;
      }

      return [
        message.subject,
        message.preview,
        message.body,
        message.from.name,
        message.from.address,
        ...message.labels
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    })
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

function parseContacts(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(?<name>.*?)\s*<(?<address>[^>]+)>$/);
      const address = match?.groups?.address.trim() ?? entry;
      const name = match?.groups?.name.trim() || address.split("@")[0] || address;

      return { name, address };
    });
}

export function createSentMessage(draft: DraftMessage, account: Account): MailMessage {
  const now = new Date();
  const recipients = parseContacts(draft.to);
  const cc = parseContacts(draft.cc);

  return {
    id: `sent-${now.getTime()}`,
    accountId: account.id,
    folder: "sent",
    from: { name: account.name, address: account.address },
    to: recipients,
    cc: cc.length > 0 ? cc : undefined,
    subject: draft.subject || "(no subject)",
    preview: draft.body.slice(0, 120) || "Empty message",
    body: draft.body,
    timestamp: now.toISOString(),
    unread: false,
    starred: false,
    labels: ["sent", account.provider],
    attachments: [],
    priority: "normal"
  };
}
