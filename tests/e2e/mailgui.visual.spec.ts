import { expect, test } from "@playwright/test";

async function expectMaterialShader(page: import("@playwright/test").Page) {
  const shader = page.getByTestId("material-shader");

  await expect(shader).toBeVisible();
  await expect.poll(() => shader.getAttribute("data-shader-ready")).toMatch(/^(true|fallback)$/);

  const sample = await shader.evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const readyState = canvas.dataset.shaderReady ?? "pending";
    const gl = canvas.getContext("webgl");

    if (!gl) {
      return { supported: false, readyState, width: canvas.width, height: canvas.height, variance: 0 };
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

    return { supported: true, readyState, width: canvas.width, height: canvas.height, variance };
  });

  expect(sample.width).toBeGreaterThan(300);
  expect(sample.height).toBeGreaterThan(300);

  if (sample.readyState === "true") {
    expect(sample.supported).toBe(true);
    expect(sample.variance).toBeGreaterThan(3);
  } else {
    expect(sample.readyState).toBe("fallback");
  }
}

test.describe("MailGUI233 visual mailbox QA", () => {
  test.beforeEach(async ({ page }) => {
    const consoleIssues: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleIssues.push(`error: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      consoleIssues.push(`pageerror: ${error.message}`);
    });

    await page.addInitScript(() => {
      window.localStorage.setItem("mailgui233.demoData", "true");
      window.localStorage.setItem("mailgui233.language", "en");
    });
    await page.goto("/");
    await expect(page).toHaveTitle("MailGUI233");
    await expectMaterialShader(page);
    await expect(page.getByTestId("app-titlebar")).toBeVisible();
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
    await expect(page.getByRole("tab", { name: /^QQ,/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /QQ Work/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /Studio Outlook/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /iCloud/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /NetEase 163/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /Proton Bridge/i })).toBeInViewport();
    await expect(page.getByRole("tab", { name: /Custom IMAP/i })).toBeInViewport();

    await page.screenshot({
      path: testInfo.outputPath("desktop-two-column-mailbox.png"),
      fullPage: false
    });

    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Chinese" }).click();
    await expect(page.getByRole("tab", { name: /所有邮箱/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^QQ邮箱,/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /工作QQ邮箱/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "收件箱" })).toBeVisible();
    await expect(page.getByPlaceholder("搜索发件人、主题、tag:安全、provider:qq")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem("mailgui233.language"))).toBe("zh");
    await page.getByRole("button", { name: "语言" }).click();
    await page.getByRole("menuitem", { name: "英语" }).click();
    await expect(page.getByRole("tab", { name: /All mailboxes/i })).toBeVisible();
    await page.getByPlaceholder("Search mailboxes").fill("qq work");
    await expect(page.getByRole("tab", { name: /QQ Work/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Personal Gmail/i })).toHaveCount(0);
    await page.getByPlaceholder("Search mailboxes").fill("");

    await page.getByRole("button", { name: "Add mailbox" }).click();
    const accountSetup = page.getByRole("dialog", { name: "Add mailbox" });
    await expect(accountSetup).toBeVisible();
    await expect(accountSetup.getByText("Add personal or business mail")).toBeVisible();
    await accountSetup.getByLabel("Mailbox address").fill("visual-qa@qq.com");
    await expect(accountSetup.getByLabel("IMAP")).toHaveValue("imap.qq.com:993");
    await expect(accountSetup.getByLabel("POP3")).toHaveValue("pop.qq.com:995");
    await expect(accountSetup.getByLabel("SMTP")).toHaveValue("smtp.qq.com:465");
    await accountSetup.getByLabel("Authorization code").fill("qq-auth-code");
    await accountSetup.getByLabel("SMTP").fill("smtp.qq.com:587");
    await accountSetup.getByRole("button", { name: "Connect mailbox" }).click();
    await expect(page.getByRole("tab", { name: "QQ, QQ, needs auth" })).toBeVisible();

    await page.getByRole("tab", { name: "QQ, QQ, connected" }).click();
    await page.getByRole("tab", { name: "Timetable" }).click();
    const schedule = page.getByRole("region", { name: "Mail timetable" });
    await expect(schedule).toBeVisible();
    await expect(schedule.getByRole("button", { name: "日" })).toBeVisible();
    await expect(schedule.getByRole("button", { name: "周" })).toBeVisible();
    await expect(schedule.getByRole("button", { name: "月" })).toBeVisible();
    await expect(schedule.getByText(/QQ \/ Sun, Jun 21/)).toBeVisible();
    await expect(schedule.getByText("IMAP/SMTP authorization code refreshed")).toBeVisible();
    await expect(schedule.getByText("QQ work label audit")).toHaveCount(0);
    await expect(schedule.getByText("Dinner with Kai")).toHaveCount(0);

    await page.screenshot({
      path: testInfo.outputPath("desktop-qq-mail-timetable.png"),
      fullPage: false
    });

    await page.getByRole("tab", { name: /All mailboxes/i }).click();
    await schedule.getByRole("button", { name: "周" }).click();
    await expect(schedule.getByText("Release sync")).toBeVisible();
    await expect(schedule.getByText("QQ work label audit")).toBeVisible();
    await schedule.getByRole("button", { name: "月" }).click();
    await expect(schedule.getByText("June 2026")).toBeVisible();
    await expect(schedule.getByText("IMAP certificate review")).toBeVisible();

    await schedule.getByRole("button", { name: "New item" }).click();
    const scheduleEditor = page.getByRole("form", { name: "New item" });
    await scheduleEditor.getByLabel("Title").fill("Visual QA calendar item");
    await scheduleEditor.getByLabel("Date").fill("2026-06-23");
    await scheduleEditor.getByLabel("Start").fill("10:00");
    await scheduleEditor.getByLabel("End").fill("10:30");
    await scheduleEditor.getByLabel("Location").fill("QA room");
    await scheduleEditor.getByRole("button", { name: "Save" }).click();
    const createdScheduleItem = schedule.getByRole("button", { name: /Visual QA calendar item schedule item/i });
    await expect(createdScheduleItem).toBeVisible();

    await createdScheduleItem.click({ button: "right" });
    const scheduleMenu = page.getByRole("menu", { name: "Schedule item menu" });
    await expect(scheduleMenu).toBeVisible();
    await scheduleMenu.getByRole("menuitem", { name: "Edit item" }).click();
    const editScheduleEditor = page.getByRole("form", { name: "Edit item" });
    await editScheduleEditor.getByLabel("Title").fill("Visual QA calendar item edited");
    await editScheduleEditor.getByRole("button", { name: "Save" }).click();
    const editedScheduleItem = schedule.getByRole("button", { name: /Visual QA calendar item edited schedule item/i });
    await expect(editedScheduleItem).toBeVisible();

    await editedScheduleItem.click({ button: "right" });
    await page.getByRole("menu", { name: "Schedule item menu" }).getByRole("menuitem", { name: "Delete item" }).click();
    await expect(editedScheduleItem).toHaveCount(0);

    await page.screenshot({
      path: testInfo.outputPath("desktop-schedule-month.png"),
      fullPage: false
    });

    await page.getByRole("tab", { name: "Channels" }).click();
    const channels = page.getByRole("region", { name: "Channel validation" });
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
    await expect(page.getByText(/QQ \/ QQ \/ connected/i)).toBeVisible();

    await page.getByRole("tab", { name: /All mailboxes/i }).click();
    const search = page.getByPlaceholder("Search sender, subject, tag:security, provider:qq");
    await search.fill("tag:security provider:qq is:starred");
    await expect(page.getByRole("heading", { name: "IMAP/SMTP authorization code refreshed" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Work QQ labels indexed for project mail" })).toHaveCount(0);
    await search.fill("tag:project provider:qq account:work233 has:attachment");
    await expect(page.getByRole("heading", { name: "Work QQ labels indexed for project mail" })).toBeVisible();
    await search.fill("bridge");
    await expect(page.getByRole("heading", { name: "Bridge offline: local sync paused" })).toBeVisible();
    await search.fill("");

    await page.getByRole("tab", { name: "Settings" }).click();
    await page.route("https://api.github.com/repos/neko233-com/MailGUI233/releases/latest", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          tag_name: "v9.9.9",
          html_url: "https://github.com/neko233-com/MailGUI233/releases/tag/v9.9.9",
          assets: [
            {
              name: "MailGUI233_9.9.9_x64-setup.exe",
              browser_download_url: "https://example.com/MailGUI233_9.9.9_x64-setup.exe"
            }
          ]
        })
      });
    });
    const settings = page.getByRole("region", { name: "System settings" });
    await expect(settings).toBeVisible();
    await expect(settings.getByText("Current version 0.1.12")).toBeVisible();
    const mailboxSettings = settings.getByRole("region", { name: "Mailbox settings" });
    await expect(mailboxSettings).toBeVisible();
    await expect(mailboxSettings.getByRole("button", { name: /neko233@gmail.com/i })).toBeVisible();
    await mailboxSettings.getByRole("button", { name: /neko233@gmail.com/i }).click();
    await expect(mailboxSettings.getByLabel("Mailbox address")).toHaveValue("neko233@gmail.com");
    await mailboxSettings.getByRole("tab", { name: "Receive" }).click();
    await expect(mailboxSettings.getByLabel("IMAP")).toHaveValue("Gmail API");
    await mailboxSettings.getByRole("tab", { name: "Write" }).click();
    await mailboxSettings.getByLabel("SMTP").fill("smtp.gmail.com:587");
    await expect(mailboxSettings.getByLabel("SMTP")).toHaveValue("smtp.gmail.com:587");
    await mailboxSettings.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath("desktop-mailbox-settings.png"),
      fullPage: false
    });
    await settings.getByRole("button", { name: "Check updates" }).click();
    await expect(settings.getByText("Version 9.9.9 is available.")).toBeVisible();
    await expect(settings.getByRole("button", { name: "Download update" })).toBeVisible();
    await settings.getByLabel("Automatically check for updates").check();
    await settings.getByLabel("Launch at startup").check();
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem("mailgui233.autoStart"))).toBe("true");
    await settings.getByLabel("Custom CSS URL").fill("https://example.com/mailgui233-theme.css");
    await expect
      .poll(() =>
        page.evaluate(() => document.querySelector<HTMLLinkElement>("#mailgui233-custom-theme-css")?.href)
      )
      .toBe("https://example.com/mailgui233-theme.css");
    await settings.getByRole("button", { name: "Reset theme" }).click();
    await expect
      .poll(() => page.evaluate(() => document.querySelector("#mailgui233-custom-theme-css") === null))
      .toBe(true);
    await expect(settings.getByRole("tab", { name: /Git repository/i })).toBeVisible();
    await expect(settings.getByRole("tab", { name: /WebDAV/i })).toBeVisible();
    await expect(settings.getByText("Git repository is ready for native sync validation.")).toBeVisible();
    await settings.getByRole("tab", { name: /WebDAV/i }).click();
    await expect(settings.getByText("Disabled until the user enables this sync method.")).toBeVisible();
    await settings.getByLabel("Enabled").check();
    await expect(settings.getByText("Missing 3 required fields.")).toBeVisible();
    await settings.getByLabel("Endpoint").fill("https://dav.example.com/mailgui233/");
    await settings.getByLabel("Username").fill("neko233");
    await settings.getByLabel("Password key").fill("keychain:webdav-mailgui233");
    await expect(settings.getByText("WebDAV is ready for native sync validation.")).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("desktop-cloud-sync-settings.png"),
      fullPage: false
    });

    await page.getByRole("button", { name: /Compose/i }).click();
    const composer = page.getByRole("region", { name: "Compose" });
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
    await expect(page.getByRole("region", { name: "Channel validation" })).toBeVisible();
    await page.getByRole("button", { name: /Verify all/i }).click();
    await expect(page.getByRole("button", { name: /Verifying/i })).toBeVisible();

    await page.getByRole("tab", { name: "Settings" }).click();
    const settings = page.getByRole("region", { name: "System settings" });
    await expect(settings.getByRole("tab", { name: /Git repository/i })).toBeVisible();
    await settings.getByRole("tab", { name: /Local folder/i }).click();
    await expect(settings.getByText("Disabled until the user enables this sync method.")).toBeVisible();
    await settings.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath("mobile-cloud-sync-settings.png"),
      fullPage: false
    });

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
