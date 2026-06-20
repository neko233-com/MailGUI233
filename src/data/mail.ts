import type { Account, Folder, MailMessage } from "../types";

export const accounts: Account[] = [
  {
    id: "personal",
    name: "Personal",
    address: "neko233@example.com",
    accent: "#0f766e",
    unread: 8
  },
  {
    id: "work",
    name: "Studio",
    address: "desk@neko233.com",
    accent: "#b45309",
    unread: 4
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

export const initialMessages: MailMessage[] = [
  {
    id: "m-001",
    accountId: "work",
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
    labels: ["release", "migration"],
    attachments: ["release-checklist.pdf"],
    priority: "high"
  },
  {
    id: "m-002",
    accountId: "personal",
    folder: "inbox",
    from: { name: "Kai", address: "kai@example.net" },
    to: [{ name: "Neko", address: "neko233@example.com" }],
    subject: "Dinner plan moved to Sunday",
    preview: "Saturday got busy. Sunday 19:00 works better if you are free.",
    body:
      "Hey,\n\nSaturday got busy for me. Can we move dinner to Sunday 19:00? Same place works.\n\nKai",
    timestamp: "2026-06-20T15:12:00+08:00",
    unread: true,
    starred: false,
    labels: ["personal"],
    attachments: [],
    priority: "normal"
  },
  {
    id: "m-003",
    accountId: "work",
    folder: "inbox",
    from: { name: "Build Bot", address: "ci@github.com" },
    to: [{ name: "Desk", address: "desk@neko233.com" }],
    subject: "main build passed on Linux, Windows, macOS",
    preview: "Typecheck, renderer build, and Electron compile completed successfully.",
    body:
      "Workflow result: passed\n\nJobs:\n- ubuntu-latest: passed\n- windows-latest: passed\n- macos-latest: passed\n\nArtifacts are ready for manual release packaging.",
    timestamp: "2026-06-20T12:44:00+08:00",
    unread: false,
    starred: false,
    labels: ["ci"],
    attachments: [],
    priority: "low"
  },
  {
    id: "m-004",
    accountId: "personal",
    folder: "inbox",
    from: { name: "Lin Studio", address: "hello@linstudio.design" },
    to: [{ name: "Neko", address: "neko233@example.com" }],
    subject: "Invoice and project wrap notes",
    preview: "Attached invoice plus the final handoff notes for the identity work.",
    body:
      "Hi,\n\nAttached invoice and wrap notes. The final assets include editable source files, export-ready PNGs, and usage guidance.\n\nBest,\nLin",
    timestamp: "2026-06-19T18:26:00+08:00",
    unread: false,
    starred: true,
    labels: ["finance", "design"],
    attachments: ["invoice-1088.pdf", "handoff.zip"],
    priority: "normal"
  },
  {
    id: "m-005",
    accountId: "work",
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
    labels: ["ops"],
    attachments: [],
    priority: "low"
  }
];
