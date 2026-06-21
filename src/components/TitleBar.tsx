import { Minus, Square, X } from "lucide-react";

async function withCurrentWindow(action: "minimize" | "maximize" | "close") {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const currentWindow = getCurrentWindow();

    if (action === "minimize") {
      await currentWindow.minimize();
      return;
    }

    if (action === "maximize") {
      await currentWindow.toggleMaximize();
      return;
    }

    await currentWindow.close();
  } catch {
    if (action === "close") {
      window.close();
    }
  }
}

export function TitleBar() {
  return (
    <header className="app-titlebar" data-tauri-drag-region data-testid="app-titlebar" aria-label="App window">
      <div className="titlebar-brand" data-tauri-drag-region>
        <span className="titlebar-mark" aria-hidden="true">
          M
        </span>
        <strong data-tauri-drag-region>MailGUI233</strong>
      </div>

      <div className="titlebar-controls" aria-label="Window controls">
        <button aria-label="Minimize window" onClick={() => void withCurrentWindow("minimize")} type="button">
          <Minus size={15} />
        </button>
        <button aria-label="Maximize window" onClick={() => void withCurrentWindow("maximize")} type="button">
          <Square size={13} />
        </button>
        <button aria-label="Close window" className="is-close" onClick={() => void withCurrentWindow("close")} type="button">
          <X size={15} />
        </button>
      </div>
    </header>
  );
}
