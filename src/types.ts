export type FolderId = "inbox" | "starred" | "sent" | "drafts" | "archive" | "trash";

export type Priority = "normal" | "high" | "low";

export interface Account {
  id: string;
  name: string;
  address: string;
  accent: string;
  unread: number;
}

export interface Folder {
  id: FolderId;
  label: string;
}

export interface Contact {
  name: string;
  address: string;
}

export interface MailMessage {
  id: string;
  accountId: string;
  folder: FolderId;
  from: Contact;
  to: Contact[];
  cc?: Contact[];
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  unread: boolean;
  starred: boolean;
  labels: string[];
  attachments: string[];
  priority: Priority;
}

export interface DraftMessage {
  id: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
}
