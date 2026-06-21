# MailGUI233 UI Guidelines

## Native UI Ban

MailGUI233 product flows must use app-owned UI, not browser or operating-system dialogs.

Do not use:

- `window.alert`
- `window.confirm`
- `window.prompt`
- Native dialogs for mailbox setup, destructive actions, settings, auth, update checks, or schedule item editing
- Raw native `<select>` controls in primary product surfaces

Use app components instead:

- Modal panels for setup, edit, confirm, and auth flows
- Popover menus for small option lists
- Segmented buttons for short mutually exclusive choices
- Toggle rows for boolean settings
- Text inputs inside MailGUI233 panels for editable config

## Mailbox Setup

The add-mailbox flow must show the user's provider and protocol details before saving.

Required visible fields:

- Mailbox address
- Authorization code or provider auth method
- IMAP preset
- POP3 preset
- SMTP preset

Provider presets are defaults only. Users must be able to edit IMAP, POP3, and SMTP values before adding the mailbox.

## Theme CSS Override

Users can provide a single CSS URL in Settings > Theme. MailGUI233 appends it as:

```html
<link id="mailgui233-custom-theme-css" rel="stylesheet" data-theme-layer="user-override">
```

The link is appended after the built-in bundle CSS, so it works as the highest-priority visual override. Selectors not defined by the user CSS continue using the default MailGUI233 UI.

Theme authors should prefer stable app classes such as:

- `.app-frame`
- `.app-titlebar`
- `.sidebar`
- `.mail-workspace`
- `.topbar`
- `.account-tab`
- `.function-tab`
- `.schedule-panel`
- `.settings-shell`
- `.account-setup-modal`

Avoid relying on generated asset filenames or DOM order outside component-local structures.
