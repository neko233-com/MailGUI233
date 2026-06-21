import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

function findLocalChromium() {
  if (process.env.CI) {
    return undefined;
  }

  const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

  if (envPath && existsSync(envPath)) {
    return envPath;
  }

  const localAppData = process.env.LOCALAPPDATA;
  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          localAppData ? `${localAppData}\\Google\\Chrome\\Application\\chrome.exe` : ""
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium"
          ]
        : [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/snap/bin/chromium"
          ];

  return candidates.find((candidate) => candidate && existsSync(candidate));
}

const chromiumExecutablePath = findLocalChromium();

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 8_000
  },
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: chromiumExecutablePath
      ? {
          executablePath: chromiumExecutablePath
        }
      : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 }
      }
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 412, height: 915 }
      }
    }
  ],
  outputDir: "test-results"
});
