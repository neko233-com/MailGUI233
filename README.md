# MailGUI233

Cross-platform desktop mail GUI built with Electron, TypeScript, React, and Vite.

## Features

- Desktop shell with secure preload bridge and context isolation.
- Multi-account navigation, folders, unread counts, starred mail, archive, trash, and send flow.
- Search across sender, subject, body, preview, and labels.
- Reader actions for reply, star, archive, and trash.
- Composer window with validation and local sent-message creation.
- GitHub Actions CI across Linux, Windows, and macOS.
- Release workflow for tagged builds.

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run dist
```

## Notes

Current app ships complete local GUI logic with seeded mail data. Real IMAP/SMTP/OAuth sync should be added behind the Electron IPC bridge, so credentials stay outside the renderer.
