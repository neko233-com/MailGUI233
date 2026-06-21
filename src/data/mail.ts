import type { Account, CalendarEvent, Folder, MailMessage, ProviderDefinition } from "../types";

export const providerCatalog: ProviderDefinition[] = [
  {
    id: "gmail",
    name: "Gmail / Google Workspace",
    shortName: "Gmail",
    domains: ["gmail.com", "googlemail.com", "workspace domains"],
    accent: "#1a73e8",
    auth: "OAuth 2.0",
    incoming: "Gmail API / IMAP",
    outgoing: "Gmail API / SMTP",
    capabilitySummary: "OAuth, labels, attachments, threaded mail",
    setupNote: "Use OAuth for personal and Workspace accounts; IMAP remains available when enabled.",
    capabilities: ["oauth", "imap", "smtp", "labels", "push", "attachments"]
  },
  {
    id: "qq",
    name: "QQ Mail / Foxmail",
    shortName: "QQ",
    domains: ["qq.com", "foxmail.com"],
    accent: "#0ea5e9",
    auth: "App password",
    incoming: "imap.qq.com:993",
    outgoing: "smtp.qq.com:465",
    capabilitySummary: "IMAP, SMTP, app-password login",
    setupNote: "QQ requires IMAP/SMTP to be enabled in mailbox settings and uses an authorization code.",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "outlook",
    name: "Outlook / Microsoft 365",
    shortName: "Outlook",
    domains: ["outlook.com", "hotmail.com", "live.com", "microsoft 365"],
    accent: "#2563eb",
    auth: "OAuth 2.0",
    incoming: "Microsoft Graph / IMAP",
    outgoing: "Microsoft Graph / SMTP",
    capabilitySummary: "OAuth, folders, enterprise tenants",
    setupNote: "Microsoft Graph is preferred; IMAP/SMTP can be used for compatible tenants.",
    capabilities: ["oauth", "imap", "smtp", "folders", "push", "attachments"]
  },
  {
    id: "icloud",
    name: "iCloud Mail",
    shortName: "iCloud",
    domains: ["icloud.com", "me.com", "mac.com"],
    accent: "#64748b",
    auth: "App-specific password",
    incoming: "imap.mail.me.com:993",
    outgoing: "smtp.mail.me.com:587",
    capabilitySummary: "IMAP, SMTP, app-specific password",
    setupNote: "Apple ID two-factor accounts need an app-specific password.",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "yahoo",
    name: "Yahoo / AOL Mail",
    shortName: "Yahoo",
    domains: ["yahoo.com", "ymail.com", "aol.com"],
    accent: "#7c3aed",
    auth: "OAuth or app password",
    incoming: "imap.mail.yahoo.com:993",
    outgoing: "smtp.mail.yahoo.com:465",
    capabilitySummary: "OAuth/app password, IMAP, SMTP",
    setupNote: "Use OAuth where available, otherwise create an app password.",
    capabilities: ["oauth", "imap", "smtp", "folders", "attachments"]
  },
  {
    id: "netease",
    name: "NetEase 163 / 126 / Yeah",
    shortName: "NetEase",
    domains: ["163.com", "126.com", "yeah.net"],
    accent: "#dc2626",
    auth: "Authorization code",
    incoming: "imap.163.com:993 / imap.126.com:993",
    outgoing: "smtp.163.com:465 / smtp.126.com:465",
    capabilitySummary: "IMAP, SMTP, authorization-code login",
    setupNote: "Enable POP3/IMAP/SMTP in NetEase settings and use the generated authorization code.",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "zoho",
    name: "Zoho Mail",
    shortName: "Zoho",
    domains: ["zoho.com", "custom domains"],
    accent: "#16a34a",
    auth: "OAuth or app password",
    incoming: "imap.zoho.com:993",
    outgoing: "smtp.zoho.com:465",
    capabilitySummary: "OAuth/app password, IMAP, SMTP",
    setupNote: "Business domains can use OAuth or app passwords depending on organization policy.",
    capabilities: ["oauth", "imap", "smtp", "folders", "attachments"]
  },
  {
    id: "proton",
    name: "Proton Mail Bridge",
    shortName: "Proton",
    domains: ["proton.me", "protonmail.com", "custom domains"],
    accent: "#6d4aff",
    auth: "Bridge credentials",
    incoming: "Proton Bridge IMAP",
    outgoing: "Proton Bridge SMTP",
    capabilitySummary: "Local Bridge, encrypted mailbox access",
    setupNote: "Desktop sync requires Proton Mail Bridge running locally.",
    capabilities: ["imap", "smtp", "folders", "attachments", "bridge"]
  },
  {
    id: "imap",
    name: "Custom IMAP / SMTP",
    shortName: "IMAP",
    domains: ["any domain"],
    accent: "#0f766e",
    auth: "Password, app password, or OAuth",
    incoming: "Custom IMAP host",
    outgoing: "Custom SMTP host",
    capabilitySummary: "Universal fallback for hosted mail",
    setupNote: "Use this for Fastmail, MXRoute, self-hosted mail, corporate servers, and other providers.",
    capabilities: ["oauth", "imap", "smtp", "folders", "attachments"]
  }
];

export const accounts: Account[] = [
  {
    id: "gmail-personal",
    name: "Personal Gmail",
    address: "neko233@gmail.com",
    provider: "gmail",
    accent: "#1a73e8",
    unread: 6,
    status: "connected",
    auth: "OAuth 2.0",
    incoming: "Gmail API",
    outgoing: "Gmail API",
    lastSync: "2026-06-21T14:54:00+08:00",
    capabilities: ["oauth", "imap", "smtp", "labels", "push", "attachments"]
  },
  {
    id: "qq-main",
    name: "QQ Mail",
    address: "14170@qq.com",
    provider: "qq",
    accent: "#0ea5e9",
    unread: 5,
    status: "connected",
    auth: "Authorization code",
    incoming: "imap.qq.com:993",
    outgoing: "smtp.qq.com:465",
    lastSync: "2026-06-21T14:51:00+08:00",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "qq-work",
    name: "QQ Work",
    address: "work233@qq.com",
    provider: "qq",
    accent: "#38bdf8",
    unread: 3,
    status: "connected",
    auth: "Authorization code",
    incoming: "imap.qq.com:993",
    outgoing: "smtp.qq.com:465",
    lastSync: "2026-06-21T14:47:00+08:00",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "outlook-studio",
    name: "Studio Outlook",
    address: "desk@neko233.com",
    provider: "outlook",
    accent: "#2563eb",
    unread: 4,
    status: "connected",
    auth: "Microsoft OAuth",
    incoming: "Microsoft Graph",
    outgoing: "Microsoft Graph",
    lastSync: "2026-06-21T14:49:00+08:00",
    capabilities: ["oauth", "imap", "smtp", "folders", "push", "attachments"]
  },
  {
    id: "icloud-family",
    name: "iCloud",
    address: "neko233@icloud.com",
    provider: "icloud",
    accent: "#64748b",
    unread: 1,
    status: "needs-auth",
    auth: "App-specific password",
    incoming: "imap.mail.me.com:993",
    outgoing: "smtp.mail.me.com:587",
    lastSync: "2026-06-20T21:18:00+08:00",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "netease-backup",
    name: "NetEase 163",
    address: "neko233@163.com",
    provider: "netease",
    accent: "#dc2626",
    unread: 2,
    status: "connected",
    auth: "Authorization code",
    incoming: "imap.163.com:993",
    outgoing: "smtp.163.com:465",
    lastSync: "2026-06-21T14:42:00+08:00",
    capabilities: ["imap", "smtp", "folders", "attachments"]
  },
  {
    id: "proton-secure",
    name: "Proton Bridge",
    address: "desk@proton.me",
    provider: "proton",
    accent: "#6d4aff",
    unread: 0,
    status: "offline",
    auth: "Bridge credentials",
    incoming: "127.0.0.1 Bridge IMAP",
    outgoing: "127.0.0.1 Bridge SMTP",
    lastSync: "2026-06-19T09:12:00+08:00",
    capabilities: ["imap", "smtp", "folders", "attachments", "bridge"]
  },
  {
    id: "custom-imap",
    name: "Custom IMAP",
    address: "ops@example.org",
    provider: "imap",
    accent: "#0f766e",
    unread: 1,
    status: "needs-auth",
    auth: "Password or OAuth",
    incoming: "mail.example.org:993",
    outgoing: "mail.example.org:465",
    lastSync: "2026-06-18T18:30:00+08:00",
    capabilities: ["oauth", "imap", "smtp", "folders", "attachments"]
  }
];

export const folders: Folder[] = [
  { id: "inbox", label: "Inbox" },
  { id: "starred", label: "Starred" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
  { id: "archive", label: "Archive" },
  { id: "trash", label: "Trash" }
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "cal-001",
    accountId: "outlook-studio",
    title: "Release sync",
    startsAt: "2026-06-21T09:30:00+08:00",
    endsAt: "2026-06-21T10:15:00+08:00",
    location: "Studio room",
    notes: "Review token refresh and packaged desktop builds.",
    source: "mail"
  },
  {
    id: "cal-002",
    accountId: "qq-main",
    title: "QQ auth check",
    startsAt: "2026-06-21T11:00:00+08:00",
    endsAt: "2026-06-21T11:30:00+08:00",
    location: "Mail settings",
    notes: "Rotate authorization code and confirm IMAP/SMTP folders.",
    source: "provider"
  },
  {
    id: "cal-003",
    accountId: "qq-work",
    title: "QQ work label audit",
    startsAt: "2026-06-21T14:00:00+08:00",
    endsAt: "2026-06-21T14:35:00+08:00",
    location: "QQ Work mailbox",
    notes: "Confirm tags, aliases, and multiple QQ account routing.",
    source: "mail"
  },
  {
    id: "cal-004",
    accountId: "gmail-personal",
    title: "Dinner with Kai",
    startsAt: "2026-06-21T19:00:00+08:00",
    endsAt: "2026-06-21T20:30:00+08:00",
    location: "Same place",
    source: "mail"
  },
  {
    id: "cal-005",
    accountId: "icloud-family",
    title: "Create iCloud app password",
    startsAt: "2026-06-22T10:00:00+08:00",
    endsAt: "2026-06-22T10:25:00+08:00",
    location: "Apple ID",
    notes: "Required before iCloud IMAP sync can start.",
    source: "provider"
  },
  {
    id: "cal-006",
    accountId: "netease-backup",
    title: "NetEase folder audit",
    startsAt: "2026-06-24T14:00:00+08:00",
    endsAt: "2026-06-24T14:45:00+08:00",
    location: "163 mailbox",
    source: "provider"
  },
  {
    id: "cal-007",
    accountId: "proton-secure",
    title: "Start Proton Bridge",
    startsAt: "2026-06-26T16:00:00+08:00",
    endsAt: "2026-06-26T16:30:00+08:00",
    location: "Local desktop",
    notes: "Unlock Bridge before encrypted mailbox sync.",
    source: "calendar"
  },
  {
    id: "cal-008",
    accountId: "custom-imap",
    title: "IMAP certificate review",
    startsAt: "2026-06-28T13:30:00+08:00",
    endsAt: "2026-06-28T14:10:00+08:00",
    location: "mail.example.org",
    source: "provider"
  }
];

export const initialMessages: MailMessage[] = [
  {
    id: "m-001",
    accountId: "outlook-studio",
    folder: "inbox",
    from: { name: "Mina Chen", address: "mina@northstar.dev" },
    to: [{ name: "Desk", address: "desk@neko233.com" }],
    subject: "Release checklist for Q3 mail migration",
    preview: "Need review on auth edge cases, offline cache, and packaged builds before Friday.",
    body:
      "Team,\n\nI merged the migration notes into the release board. Please review the auth edge cases, offline cache behavior, and packaged desktop builds before Friday noon.\n\nI also added the rollback path and owner list. The only open risk is token refresh while the desktop app is waking from sleep.\n\nThanks,\nMina",
    timestamp: "2026-06-20T17:35:00+08:00",
    unread: true,
    starred: true,
    labels: ["release", "migration", "outlook"],
    attachments: ["release-checklist.pdf"],
    priority: "high"
  },
  {
    id: "m-002",
    accountId: "gmail-personal",
    folder: "inbox",
    from: { name: "Kai", address: "kai@example.net" },
    to: [{ name: "Neko", address: "neko233@gmail.com" }],
    subject: "Dinner plan moved to Sunday",
    preview: "Saturday got busy. Sunday 19:00 works better if you are free.",
    body:
      "Hey,\n\nSaturday got busy for me. Can we move dinner to Sunday 19:00? Same place works.\n\nKai",
    timestamp: "2026-06-20T15:12:00+08:00",
    unread: true,
    starred: false,
    labels: ["personal", "gmail"],
    attachments: [],
    priority: "normal"
  },
  {
    id: "m-003",
    accountId: "outlook-studio",
    folder: "inbox",
    from: { name: "Build Bot", address: "ci@github.com" },
    to: [{ name: "Desk", address: "desk@neko233.com" }],
    subject: "main build passed on Windows",
    preview: "Typecheck, renderer build, and Tauri desktop compile completed successfully.",
    body:
      "Workflow result: passed\n\nJobs:\n- ubuntu-latest: passed\n- windows-latest: passed\n- macos-latest: passed\n\nArtifacts are ready for manual release packaging.",
    timestamp: "2026-06-20T12:44:00+08:00",
    unread: false,
    starred: false,
    labels: ["ci", "outlook"],
    attachments: [],
    priority: "low"
  },
  {
    id: "m-004",
    accountId: "qq-main",
    folder: "inbox",
    from: { name: "QQ Security Center", address: "service@qq.com" },
    to: [{ name: "Neko", address: "14170@qq.com" }],
    subject: "IMAP/SMTP authorization code refreshed",
    preview: "Your QQ Mail authorization code was rotated for MailGUI233 desktop access.",
    body:
      "Your QQ Mail authorization code was refreshed for MailGUI233.\n\nIf this was expected, no action is required. If not, disable IMAP/SMTP in mailbox settings and rotate the code again.",
    timestamp: "2026-06-21T10:03:00+08:00",
    unread: true,
    starred: true,
    labels: ["qq", "security"],
    attachments: [],
    priority: "high"
  },
  {
    id: "m-005",
    accountId: "qq-work",
    folder: "inbox",
    from: { name: "QQ Team", address: "team@qq.com" },
    to: [{ name: "Work", address: "work233@qq.com" }],
    subject: "Work QQ labels indexed for project mail",
    preview: "Labels for project, sync, and vendor mail are ready for searchable routing.",
    body:
      "The work QQ mailbox has separate label routing for project mail, sync status, and vendor notifications. Search examples: tag:project provider:qq account:work233@qq.com.",
    timestamp: "2026-06-21T13:46:00+08:00",
    unread: true,
    starred: false,
    labels: ["qq", "project", "sync", "work"],
    attachments: ["label-map.csv"],
    priority: "normal"
  },
  {
    id: "m-006",
    accountId: "netease-backup",
    folder: "inbox",
    from: { name: "NetEase Mail", address: "notice@mail.163.com" },
    to: [{ name: "Neko", address: "neko233@163.com" }],
    subject: "Authorization code login enabled",
    preview: "IMAP, SMTP, and folder sync are available for this 163 mailbox.",
    body:
      "IMAP and SMTP have been enabled for your 163 mailbox. Use the generated authorization code instead of your login password when connecting MailGUI233.",
    timestamp: "2026-06-21T09:28:00+08:00",
    unread: true,
    starred: false,
    labels: ["netease", "setup"],
    attachments: [],
    priority: "normal"
  },
  {
    id: "m-007",
    accountId: "gmail-personal",
    folder: "inbox",
    from: { name: "Lin Studio", address: "hello@linstudio.design" },
    to: [{ name: "Neko", address: "neko233@gmail.com" }],
    subject: "Invoice and project wrap notes",
    preview: "Attached invoice plus the final handoff notes for the identity work.",
    body:
      "Hi,\n\nAttached invoice and wrap notes. The final assets include editable source files, export-ready PNGs, and usage guidance.\n\nBest,\nLin",
    timestamp: "2026-06-19T18:26:00+08:00",
    unread: false,
    starred: true,
    labels: ["finance", "design", "gmail"],
    attachments: ["invoice-1088.pdf", "handoff.zip"],
    priority: "normal"
  },
  {
    id: "m-008",
    accountId: "icloud-family",
    folder: "inbox",
    from: { name: "Apple ID", address: "appleid@id.apple.com" },
    to: [{ name: "Neko", address: "neko233@icloud.com" }],
    subject: "Create an app-specific password for desktop mail",
    preview: "iCloud Mail needs an app-specific password before IMAP sync can start.",
    body:
      "MailGUI233 can connect to iCloud Mail after you create an app-specific password for your Apple ID.\n\nOpen Apple ID account settings, create a password for desktop mail, and paste it into the account connector.",
    timestamp: "2026-06-20T21:18:00+08:00",
    unread: true,
    starred: false,
    labels: ["icloud", "needs-auth"],
    attachments: [],
    priority: "normal"
  },
  {
    id: "m-009",
    accountId: "proton-secure",
    folder: "inbox",
    from: { name: "Proton Bridge", address: "bridge@proton.me" },
    to: [{ name: "Desk", address: "desk@proton.me" }],
    subject: "Bridge offline: local sync paused",
    preview: "Start Proton Mail Bridge to resume encrypted mailbox sync.",
    body:
      "The Proton Mail Bridge process is not reachable on localhost. Start Bridge, unlock the mailbox, and MailGUI233 can resume IMAP/SMTP sync through the local bridge.",
    timestamp: "2026-06-19T09:12:00+08:00",
    unread: false,
    starred: false,
    labels: ["proton", "bridge", "offline"],
    attachments: [],
    priority: "low"
  },
  {
    id: "m-010",
    accountId: "custom-imap",
    folder: "inbox",
    from: { name: "Ops Mailhost", address: "postmaster@example.org" },
    to: [{ name: "Ops", address: "ops@example.org" }],
    subject: "Custom IMAP certificate ready",
    preview: "The new mail.example.org certificate is valid through next year.",
    body:
      "The mail.example.org certificate was renewed successfully. IMAP 993 and SMTP 465 are both ready for client validation.",
    timestamp: "2026-06-18T18:30:00+08:00",
    unread: true,
    starred: false,
    labels: ["imap", "ops"],
    attachments: ["certificate-report.txt"],
    priority: "normal"
  },
  {
    id: "m-011",
    accountId: "qq-main",
    folder: "sent",
    from: { name: "Neko", address: "14170@qq.com" },
    to: [{ name: "Desk", address: "desk@neko233.com" }],
    subject: "QQ channel smoke test",
    preview: "Confirmed QQ IMAP folders and SMTP send path in the channel matrix.",
    body:
      "Confirmed QQ IMAP folders and SMTP send path in the channel matrix. Real sync will route through the Tauri command layer once credentials are wired.",
    timestamp: "2026-06-21T11:46:00+08:00",
    unread: false,
    starred: false,
    labels: ["sent", "qq"],
    attachments: [],
    priority: "low"
  },
  {
    id: "m-012",
    accountId: "outlook-studio",
    folder: "archive",
    from: { name: "Ops Team", address: "ops@neko233.com" },
    to: [{ name: "Desk", address: "desk@neko233.com" }],
    subject: "DNS maintenance finished",
    preview: "Records propagated. No error budget impact observed.",
    body:
      "DNS maintenance finished at 04:20 UTC. Records propagated and monitoring stayed green. No error budget impact observed.",
    timestamp: "2026-06-18T20:10:00+08:00",
    unread: false,
    starred: false,
    labels: ["ops", "outlook"],
    attachments: [],
    priority: "low"
  }
];
