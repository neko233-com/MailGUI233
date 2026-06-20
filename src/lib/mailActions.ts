import type { DraftMessage, FolderId, MailMessage } from "../types";

export function filterMessages(
  messages: MailMessage[],
  folder: FolderId,
  accountId: string,
  query: string
) {
  const normalized = query.trim().toLowerCase();

  return messages
    .filter((message) => message.accountId === accountId)
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

export function createSentMessage(draft: DraftMessage, accountId: string): MailMessage {
  const now = new Date();

  return {
    id: `sent-${now.getTime()}`,
    accountId,
    folder: "sent",
    from: { name: "MailGUI233", address: "desk@neko233.com" },
    to: draft.to
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean)
      .map((address) => ({ name: address.split("@")[0] ?? address, address })),
    cc: draft.cc
      ? draft.cc
          .split(",")
          .map((address) => address.trim())
          .filter(Boolean)
          .map((address) => ({ name: address.split("@")[0] ?? address, address }))
      : undefined,
    subject: draft.subject || "(no subject)",
    preview: draft.body.slice(0, 120) || "Empty message",
    body: draft.body,
    timestamp: now.toISOString(),
    unread: false,
    starred: false,
    labels: ["sent"],
    attachments: [],
    priority: "normal"
  };
}
