import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1120,
    minHeight: 720,
    title: "MailGUI233",
    backgroundColor: "#f7f9fb",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("app:get-version", () => app.getVersion());
  ipcMain.handle("app:get-platform", () => process.platform);
  ipcMain.handle("app:open-external", async (_event, url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return false;
    }
    await shell.openExternal(url);
    return true;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
