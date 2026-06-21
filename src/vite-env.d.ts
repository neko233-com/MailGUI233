/// <reference types="vite/client" />

interface MailGUI233Bridge {
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    mailgui233?: MailGUI233Bridge;
  }
}

export {};
