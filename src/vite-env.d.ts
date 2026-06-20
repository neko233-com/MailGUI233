/// <reference types="vite/client" />

import type { MailGUI233Bridge } from "../electron/preload";

declare global {
  interface Window {
    mailgui233?: MailGUI233Bridge;
  }
}
