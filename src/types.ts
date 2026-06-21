export type FolderId = "inbox" | "starred" | "sent" | "drafts" | "archive" | "trash";

export type MailboxTabId = FolderId | "timetable" | "channels" | "settings";

export type AccountProvider =
  | "gmail"
  | "qq"
  | "outlook"
  | "icloud"
  | "yahoo"
  | "netease"
  | "zoho"
  | "proton"
  | "imap";

export type AccountScope = "all" | string;

export type ProviderScope = "all" | AccountProvider;

export type ScheduleViewMode = "day" | "week" | "month";

export type Priority = "normal" | "high" | "low";

export type ConnectionStatus = "connected" | "needs-auth" | "syncing" | "offline";

export type CloudSyncStrategyId = "git" | "webdav" | "local";

export type CloudSyncStatus = "ready" | "needs-config" | "checking";

export type CloudSyncFieldKind = "text" | "password" | "select";

export type MailCapability =
  | "oauth"
  | "imap"
  | "smtp"
  | "labels"
  | "folders"
  | "push"
  | "attachments"
  | "bridge";

export interface Account {
  id: string;
  name: string;
  address: string;
  provider: AccountProvider;
  accent: string;
  unread: number;
  status: ConnectionStatus;
  auth: string;
  incoming: string;
  outgoing: string;
  lastSync: string;
  capabilities: MailCapability[];
}

export interface Folder {
  id: FolderId;
  label: string;
}

export interface ProviderDefinition {
  id: AccountProvider;
  name: string;
  shortName: string;
  domains: string[];
  accent: string;
  auth: string;
  incoming: string;
  outgoing: string;
  capabilitySummary: string;
  setupNote: string;
  capabilities: MailCapability[];
}

export interface CloudSyncField {
  key: string;
  label: string;
  kind: CloudSyncFieldKind;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface CloudSyncConfig {
  strategyId: CloudSyncStrategyId;
  enabled: boolean;
  values: Record<string, string>;
}

export interface CloudSyncValidation {
  ok: boolean;
  status: CloudSyncStatus;
  message: string;
  missingFields: string[];
}

export interface CloudSyncStrategyDefinition {
  id: CloudSyncStrategyId;
  name: string;
  summary: string;
  privacyNote: string;
  accent: string;
  fields: CloudSyncField[];
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

export interface CalendarEvent {
  id: string;
  accountId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  notes?: string;
  source: "mail" | "calendar" | "provider";
}
