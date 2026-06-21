import type {
  Account,
  AccountScope,
  DraftMessage,
  FolderId,
  MailMessage,
  Priority,
  ProviderScope
} from "../types";

interface ParsedSearch {
  text: string[];
  tag: string[];
  from: string[];
  to: string[];
  subject: string[];
  provider: string[];
  account: string[];
  has: string[];
  is: string[];
  priority: string[];
}

const queryKeys = new Set(["tag", "label", "from", "to", "subject", "provider", "account", "has", "is", "priority"]);

function parseSearchQuery(query: string): ParsedSearch {
  const parsed: ParsedSearch = {
    text: [],
    tag: [],
    from: [],
    to: [],
    subject: [],
    provider: [],
    account: [],
    has: [],
    is: [],
    priority: []
  };

  const parts = query.toLowerCase().match(/"[^"]+"|\S+/g) ?? [];

  for (const part of parts) {
    const cleaned = part.replace(/^"|"$/g, "").trim();
    const separator = cleaned.indexOf(":");

    if (separator > 0) {
      const key = cleaned.slice(0, separator);
      const value = cleaned.slice(separator + 1);

      if (queryKeys.has(key) && value) {
        const targetKey = key === "label" ? "tag" : key;
        parsed[targetKey as keyof ParsedSearch].push(value);
        continue;
      }
    }

    if (cleaned) {
      parsed.text.push(cleaned);
    }
  }

  return parsed;
}

function includesAny(values: string[], needles: string[]) {
  return needles.every((needle) => values.some((value) => value.includes(needle)));
}

function contactText(message: MailMessage, field: "from" | "to") {
  if (field === "from") {
    return [message.from.name, message.from.address].join(" ").toLowerCase();
  }

  return message.to.map((contact) => `${contact.name} ${contact.address}`).join(" ").toLowerCase();
}

function searchableText(message: MailMessage, account?: Account) {
  return [
    message.subject,
    message.preview,
    message.body,
    message.from.name,
    message.from.address,
    ...message.to.flatMap((contact) => [contact.name, contact.address]),
    ...(message.cc ?? []).flatMap((contact) => [contact.name, contact.address]),
    ...message.labels,
    ...message.attachments,
    account?.name ?? "",
    account?.address ?? "",
    account?.provider ?? ""
  ]
    .join(" ")
    .toLowerCase();
}

function messageMatchesSearch(message: MailMessage, parsed: ParsedSearch, account?: Account) {
  const labels = message.labels.map((label) => label.toLowerCase());
  const provider = account?.provider ?? "";
  const accountFields = [account?.name ?? "", account?.address ?? "", message.accountId].map((value) => value.toLowerCase());
  const hasChecks: Record<string, boolean> = {
    attachment: message.attachments.length > 0,
    attachments: message.attachments.length > 0,
    cc: Boolean(message.cc?.length),
    label: message.labels.length > 0,
    labels: message.labels.length > 0
  };
  const isChecks: Record<string, boolean> = {
    unread: message.unread,
    read: !message.unread,
    starred: message.starred,
    important: message.priority === "high",
    sent: message.folder === "sent",
    inbox: message.folder === "inbox"
  };

  return (
    includesAny([searchableText(message, account)], parsed.text) &&
    includesAny(labels, parsed.tag) &&
    includesAny([contactText(message, "from")], parsed.from) &&
    includesAny([contactText(message, "to")], parsed.to) &&
    includesAny([message.subject.toLowerCase()], parsed.subject) &&
    includesAny([provider], parsed.provider) &&
    includesAny(accountFields, parsed.account) &&
    parsed.has.every((key) => hasChecks[key] ?? false) &&
    parsed.is.every((key) => isChecks[key] ?? false) &&
    parsed.priority.every((value) => message.priority === (value as Priority) || value === (message.priority as string))
  );
}

export function filterMessages(
  messages: MailMessage[],
  folder: FolderId,
  accountId: AccountScope,
  query: string,
  accounts: Account[],
  providerId: ProviderScope
) {
  const parsedQuery = parseSearchQuery(query);
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
      if (!query.trim()) {
        return true;
      }

      return messageMatchesSearch(message, parsedQuery, accountById.get(message.accountId));
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
