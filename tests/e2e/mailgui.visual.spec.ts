import { expect, test } from "@playwright/test";

async function expectMaterialShader(page: import("@playwright/test").Page) {
  const shader = page.getByTestId("material-shader");

  await expect(shader).toBeVisible();
  await expect.poll(() => shader.getAttribute("data-shader-ready")).toBe("true");

  const sample = await shader.evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");

    if (!gl) {
      return { supported: false, width: canvas.width, height: canvas.height, variance: 0 };
    }

    const points = [
      [Math.floor(canvas.width * 0.22), Math.floor(canvas.height * 0.28)],
      [Math.floor(canvas.width * 0.54), Math.floor(canvas.height * 0.50)],
      [Math.floor(canvas.width * 0.82), Math.floor(canvas.height * 0.76)]
    ];
    const pixels: number[] = [];

    for (const [x, y] of points) {
      const pixel = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      pixels.push(pixel[0], pixel[1], pixel[2]);
    }

    const average = pixels.reduce((sum, value) => sum + value, 0) / pixels.length;
    const variance =
      pixels.reduce((sum, value) => sum + Math.abs(value - average), 0) / pixels.length;

    return { supported: true, width: canvas.width, height: canvas.height, variance };
  });

  expect(sample.supported).toBe(true);
  expect(sample.width).toBeGreaterThan(300);
  expect(sample.height).toBeGreaterThan(300);
  expect(sample.variance).toBeGreaterThan(3);
}

test.describe("MailGUI233 visual mailbox QA", () => {
  test.beforeEach(async ({ page }) => {
    const consoleIssues: string[] = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        consoleIssues.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      consoleIssues.push(`pageerror: ${error.message}`);
    });

    await page.goto("/");
    await expect(page).toHaveTitle("MailGUI233");
    await expectMaterialShader(page);
    await expect(page.getByRole("complementary", { name: "Mail navigation" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /All mailboxes/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Inbox" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Timetable" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Messages" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Mail timetable" })).toHaveCount(0);

    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => consoleIssues).toEqual([]);
  });

  test("desktop validates two-column tabs, timetable, channels, and sending", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Desktop viewport coverage test");

    await expect(page.getByRole("tab", { name: /Personal Gmail/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /QQ Mail/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /Studio Outlook/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /iCloud/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /NetEase 163/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /Proton Bridge/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /Custom IMAP/i })).toBeInViewport();

    await page.screenshot({
      path: testInfo.outputPath("desktop-two-column-mailbox.png"),
      fullPage: false
    });

    await page.getByRole("tab", { name: /QQ Mail/i }).click();
    await page.getByRole("tab", { name: "Timetable" }).click();
    const schedule = page.getByRole("region", { name: "Mail timetable" });
    await expect(schedule).toBeVisible();
    await expect(schedule.getByRole("button", { name: "日" })).toBeVisible();
    await expect(schedule.getByRole("button", { name: "周" })).toBeVisible();
    await expect(schedule.getByRole("button", { name: "月" })).toBeVisible();
    await expect(schedule.getByText(/QQ Mail \/ Sun, Jun 21/)).toBeVisible();
    await expect(schedule.getByText("IMAP/SMTP authorization code refreshed")).toBeVisible();
    await expect(schedule.getByText("Dinner with Kai")).toHaveCount(0);

    await page.screenshot({
      path: testInfo.outputPath("desktop-qq-mail-timetable.png"),
      fullPage: false
    });

    await page.getByRole("tab", { name: /All mailboxes/i }).click();
    await schedule.getByRole("button", { name: "周" }).click();
    await expect(schedule.getByText("Release sync")).toBeVisible();
    await schedule.getByRole("button", { name: "月" }).click();
    await expect(schedule.getByText("June 2026")).toBeVisible();
    await expect(schedule.getByText("IMAP certificate review")).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("desktop-schedule-month.png"),
      fullPage: false
    });

    await page.getByRole("tab", { name: "Channels" }).click();
    const channels = page.getByRole("region", { name: "Mail channel coverage" });
    await expect(channels).toBeVisible();
    await expect(channels.getByRole("button", { name: /^Gmail channel/i })).toBeVisible();
    await expect(channels.getByRole("button", { name: /^QQ channel/i })).toBeVisible();
    await expect(channels.getByRole("button", { name: /^Outlook channel/i })).toBeVisible();
    await expect(channels.getByRole("button", { name: /^IMAP channel/i })).toBeVisible();

    await page.getByRole("button", { name: /Verify all/i }).click();
    await expect(page.getByRole("button", { name: /Verifying/i })).toBeVisible();
    await expect(page.getByText(/Last check: (?!Not run yet)/)).toBeVisible();

    await channels.getByRole("button", { name: /^QQ channel/i }).click();
    await expect(
      page.getByRole("heading", { name: "IMAP/SMTP authorization code refreshed" })
    ).toBeVisible();
    await expect(page.getByText(/QQ \/ QQ Mail \/ connected/i)).toBeVisible();

    await page.getByRole("tab", { name: /All mailboxes/i }).click();
    await page.getByPlaceholder("Search sender, subject, labels").fill("bridge");
    await expect(page.getByRole("heading", { name: "Bridge offline: local sync paused" })).toBeVisible();
    await page.getByPlaceholder("Search sender, subject, labels").fill("");

    await page.getByRole("button", { name: /Compose/i }).click();
    const composer = page.getByRole("region", { name: "Compose message" });
    await composer.getByPlaceholder("name@example.com").fill("qa@example.com");
    await composer.getByRole("textbox", { name: "Subject" }).fill("Visual QA send path");
    await composer
      .getByPlaceholder("Write message...")
      .fill("Automated visual validation across providers.");
    await composer.getByRole("button", { name: /^Send$/ }).click();
    await expect(page.getByRole("heading", { name: "Visual QA send path" })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("desktop-mailgui233.png"),
      fullPage: false
    });
  });

  test("mobile keeps the two-column tabs, timetable, and reader usable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-mobile", "Mobile viewport coverage test");

    await expect(page.getByRole("tab", { name: /All mailboxes/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Inbox" })).toBeVisible();
    await page.getByRole("tab", { name: "Timetable" }).click();
    const schedule = page.getByRole("region", { name: "Mail timetable" });
    await schedule.getByRole("button", { name: "周" }).click();
    await expect(schedule.getByText("Release sync")).toBeVisible();
    await schedule.getByRole("button", { name: "月" }).click();
    await expect(schedule.getByText("June 2026")).toBeVisible();
    await schedule.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath("mobile-schedule-month.png"),
      fullPage: false
    });

    await page.getByRole("tab", { name: "Channels" }).click();
    await expect(page.getByRole("region", { name: "Mail channel coverage" })).toBeVisible();
    await page.getByRole("button", { name: /Verify all/i }).click();
    await expect(page.getByRole("button", { name: /Verifying/i })).toBeVisible();

    await page.getByRole("tab", { name: "Starred" }).click();
    await expect(
      page.getByRole("region", { name: "Messages" }).getByText("IMAP/SMTP authorization code refreshed")
    ).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("mobile-mailgui233.png"),
      fullPage: false
    });
  });
});
