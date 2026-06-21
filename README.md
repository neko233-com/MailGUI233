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
- GitHub Actions CI across Linux, Windows, and macOS.
- Tagged Tauri release workflow for small native desktop bundles.
- WebGL material shader background with automated visual validation.

## Scripts

```bash
npm install
npm run dev
npm run dev:web
npm run typecheck
npm run build
npm run dist
```

## Notes

Current app ships complete local GUI logic with seeded multi-provider mail data and visual channel validation. Real Gmail/Microsoft OAuth, QQ/NetEase authorization-code login, Proton Bridge, and custom IMAP/SMTP sync should be added behind Tauri commands, so credentials stay outside the renderer.
