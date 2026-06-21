# MailGUI233

Small cross-platform desktop mail GUI built with Tauri, TypeScript, React, and Vite.

## Features

- Lightweight Tauri desktop shell with a Rust command layer.
- Multi-account and all-channel navigation across Gmail, QQ Mail, Outlook, iCloud, Yahoo/AOL, NetEase, Zoho, Proton Bridge, and custom IMAP/SMTP.
- Provider capability matrix with visual channel health, auth mode, incoming/outgoing endpoints, and one-click validation state.
- Folders, unread counts, starred mail, archive, trash, and send flow.
- Search across sender, subject, body, preview, and labels.
- Reader actions for reply, star, archive, and trash.
- Composer window with validation and local sent-message creation.
- GitHub Actions CI for Windows visual QA and package smoke, with non-blocking macOS smoke while Linux is paused.
- Tagged Tauri release workflow for small native desktop bundles.
- WebGL material shader background with automated visual validation.
- Native language selection with system-language default and persisted user override.
- Agent-first install, uninstall, launch, status, package-size, and visual verification scripts.

## Scripts

```bash
npm install
npm run dev
npm run dev:web
npm run typecheck
npm run build
npm run test:e2e
npm run package:smoke
npm run package:size
npm run verify:all
npm run dist
```

## Agent-first operation

Windows:

```powershell
.\scripts\mailgui233.ps1 install
.\scripts\mailgui233.ps1 use
.\scripts\mailgui233.ps1 status
.\scripts\mailgui233.ps1 uninstall
```

macOS/Linux shell:

```bash
sh scripts/mailgui233.sh install
sh scripts/mailgui233.sh use
sh scripts/mailgui233.sh status
sh scripts/mailgui233.sh uninstall
```

The agent scripts prefer the latest GitHub Release. If the current platform does not have a native release asset yet, they fall back to source setup and `npm run dev`.

## Verification contract

- `npm run build` type-checks with TypeScript 7 preview and builds the renderer.
- `npm run test:e2e` visually verifies navigation, language switching, mailbox actions, timetable day/week/month, channel validation, search, compose/send, and mobile layout.
- `npm run package:smoke` compiles the native Tauri shell without bundling installers.
- `npm run package:size` reports renderer gzip size, native executable size, and installer size when installer assets are present in `src-tauri/target/release/bundle` or `release/`.
- CI runs the same contract on Windows and a macOS smoke job.

## Toolchain

- Node.js 24 LTS is enforced through `engines`, `.nvmrc`, `.node-version`, and `.npmrc`.
- Type checking uses TypeScript 7 native preview via `@typescript/native-preview` and `tsgo`.

## Notes

Current app ships complete local GUI logic with seeded multi-provider mail data and visual channel validation. Real Gmail/Microsoft OAuth, QQ/NetEase authorization-code login, Proton Bridge, and custom IMAP/SMTP sync should be added behind Tauri commands, so credentials stay outside the renderer.
