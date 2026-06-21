# MailGUI233

Small, fast desktop mail GUI for Gmail, QQ Mail, Outlook, iCloud, NetEase, Proton Bridge, and custom IMAP/SMTP.

![MailGUI233 inbox](docs/assets/mailgui233-inbox.png)

## Product Tour

### Two-column mailbox navigation

Mailbox accounts stay in the first vertical rail. Per-mailbox features stay in the second rail, so switching accounts does not scramble the user's working mode.

![Two-column mailbox navigation](docs/assets/mailgui233-two-column.png)

### Mail timetable

Mail can be viewed as a day, week, or month timetable. Items support create, edit, duplicate, delete, and right-click menus.

![Mail timetable](docs/assets/mailgui233-timetable.png)

### Mailbox settings and server presets

The app uses its own UI for mailbox setup and settings. Provider presets expose IMAP, POP3, and SMTP values before saving, and users can edit those values.

![Mailbox settings](docs/assets/mailgui233-mailbox-settings.png)

### Cloud sync and custom themes

Settings include Git repository, WebDAV, and local-folder sync strategies. Users can also provide one CSS URL that is appended as the top visual override layer.

![Cloud sync settings](docs/assets/mailgui233-settings.png)

## Features

- Tauri desktop shell with a small Rust command layer.
- Multi-account support for Gmail, QQ Mail, Outlook, iCloud, Yahoo/AOL, NetEase, Zoho, Proton Bridge, and custom IMAP/SMTP.
- App-owned mailbox setup UI; no `alert`, `confirm`, or `prompt` product flows.
- Editable IMAP, POP3, and SMTP presets for each mailbox.
- Search across sender, subject, body, preview, labels, providers, accounts, attachments, and starred state.
- Mail timetable with day/week/month views and item CRUD.
- Native language preference with system-language default.
- Git/WebDAV/local sync strategy factory.
- User CSS URL override for custom themes.
- Windows NSIS release packaging optimized for small bundles and fast CI.

## Agent-first Commands

```powershell
.\scripts\mailgui233.ps1 install
.\scripts\mailgui233.ps1 use
.\scripts\mailgui233.ps1 status
.\scripts\mailgui233.ps1 uninstall
```

```bash
sh scripts/mailgui233.sh install
sh scripts/mailgui233.sh use
sh scripts/mailgui233.sh status
sh scripts/mailgui233.sh uninstall
```

## Development

```bash
npm install
npm run dev
npm run build
npm run test:e2e
npm run verify:all
npm run package
```

## Verification Contract

- `npm run build` type-checks with TypeScript 7 preview and builds the renderer.
- `npm run test:e2e` visually verifies layout, language switching, mailbox setup, timetable CRUD, cloud sync settings, custom theme CSS, search, compose/send, and mobile behavior.
- `npm run package:smoke` compiles the native Tauri shell without bundling installers.
- `npm run package:size` reports renderer gzip size, native executable size, and installer size.

## Toolchain

- Node.js 24 LTS.
- TypeScript 7 native preview through `@typescript/native-preview`.
- React, Vite, Tauri, Playwright.

## UI Rules

The product UI rules live in [docs/ui-guidelines.md](docs/ui-guidelines.md). Important rule: primary flows must use MailGUI233-owned UI, not browser or OS-native prompts.
