import { contextBridge, ipcRenderer } from "electron";

const api = {
  getVersion: () => ipcRenderer.invoke("app:get-version") as Promise<string>,
  getPlatform: () => ipcRenderer.invoke("app:get-platform") as Promise<NodeJS.Platform>,
  openExternal: (url: string) => ipcRenderer.invoke("app:open-external", url) as Promise<boolean>
};

contextBridge.exposeInMainWorld("mailgui233", api);

export type MailGUI233Bridge = typeof api;
