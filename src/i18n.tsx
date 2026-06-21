import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "system" | "en" | "zh" | "ja";
export type ResolvedLanguage = Exclude<Language, "system">;

const storageKey = "mailgui233.language";

const translations = {
  en: {
    allMailboxes: "All mailboxes",
    addMailbox: "Add mailbox",
    addMailboxPrompt: "Enter the email address to add",
    appSettings: "App settings",
    appVersion: "Current version {version}",
    archive: "Archive",
    autoCheckUpdates: "Automatically check for updates",
    autoStart: "Launch at startup",
    channels: "Channels",
    channelValidation: "Channel validation",
    checkAllChannels: "Verify all",
    checkUpdates: "Check updates",
    checkingUpdates: "Checking for updates...",
    checking: "Checking",
    cancel: "Cancel",
    close: "Close",
    closeComposer: "Close composer",
    compose: "Compose",
    connected: "Connected",
    connectedAccounts: "{connected}/{total} accounts connected",
    cloudSync: "Cloud sync",
    cloudSyncIntro: "Native sync methods for private Git repositories, WebDAV, and local agent folders.",
    cloudSyncMethods: "Cloud sync methods",
    day: "日",
    deleteMailbox: "Delete mailbox",
    deleteScheduleItem: "Delete item",
    duplicateScheduleItem: "Duplicate item",
    downloadUpdate: "Download update",
    drafts: "Drafts",
    date: "Date",
    editScheduleItem: "Edit item",
    enabled: "Enabled",
    endTime: "End",
    from: "From",
    idle: "Idle",
    inbox: "Inbox",
    language: "Language",
    languageEnglish: "English",
    languageJapanese: "Japanese",
    languageSystem: "System",
    languageChinese: "Chinese",
    lastCheck: "Last check: {time}",
    location: "Location",
    mail: "Mail",
    mailbox: "Mailbox",
    mailboxes: "{count} mailboxes",
    mailActions: "Mail actions",
    mailNavigation: "Mail navigation",
    mailTimetable: "Mail timetable",
    mailboxFunctions: "Mailbox functions",
    mailboxList: "Mailbox list",
    messageContentHint: "Message content will appear here.",
    messageReader: "Message reader",
    messages: "Messages",
    needsAuth: "Needs auth",
    noAccountsHint: "Connect a mailbox in Channels or Settings to start syncing mail.",
    newMessage: "New message",
    newScheduleItem: "New item",
    noMessages: "No messages",
    notRunYet: "Not run yet",
    optional: "optional",
    plan: "Plan",
    providersSummary: "{providers} providers, {connected} connected, {needsAuth} need credentials",
    refresh: "Refresh",
    reply: "Reply",
    runChannelValidation: "Run channel validation",
    scheduleNavigation: "Schedule navigation",
    scheduleContextMenu: "Schedule item menu",
    scheduleItem: "schedule item",
    scheduleView: "Schedule view",
    searchEmpty: "Search or folder has no matching mail.",
    searchMailboxes: "Search mailboxes",
    searchPlaceholder: "Search sender, subject, tag:security, provider:qq",
    selectMessage: "Select a message",
    send: "Send",
    save: "Save",
    sent: "Sent",
    settings: "Settings",
    starred: "Starred",
    syncActive: "Sync active",
    syncNeedsConfig: "Needs config",
    syncReady: "Ready",
    syncingMailbox: "Syncing mailbox...",
    startTime: "Start",
    systemSettings: "System settings",
    title: "Title",
    updateAvailable: "Version {version} is available.",
    updateCheckFailed: "Could not check updates. Try again later.",
    updatesIdle: "Updates have not been checked yet.",
    upToDate: "MailGUI233 {version} is up to date.",
    timetable: "Timetable",
    today: "Today",
    to: "To",
    trash: "Trash",
    toggleStar: "Toggle star",
    untitledScheduleItem: "Untitled item",
    visibleCount: "{count} visible",
    verifying: "Verifying",
    week: "周",
    writeMessage: "Write message...",
    month: "月"
  },
  zh: {
    allMailboxes: "所有邮箱",
    addMailbox: "添加邮箱",
    addMailboxPrompt: "输入要添加的邮箱地址",
    appSettings: "应用设置",
    appVersion: "当前版本 {version}",
    archive: "归档",
    autoCheckUpdates: "自动检查更新",
    autoStart: "开机自启动",
    channels: "渠道",
    channelValidation: "渠道验证",
    checkAllChannels: "验证全部",
    checkUpdates: "检查更新",
    checkingUpdates: "正在检查更新...",
    checking: "检查中",
    cancel: "取消",
    close: "关闭",
    closeComposer: "关闭写信窗口",
    compose: "写信",
    connected: "已连接",
    connectedAccounts: "{connected}/{total} 个账号已连接",
    cloudSync: "云同步",
    cloudSyncIntro: "原生支持私有 Git 仓库、WebDAV 和本地 Agent 文件夹同步。",
    cloudSyncMethods: "云同步方式",
    day: "日",
    deleteMailbox: "删除邮箱",
    deleteScheduleItem: "删除条目",
    duplicateScheduleItem: "复制条目",
    downloadUpdate: "下载更新",
    drafts: "草稿",
    date: "日期",
    editScheduleItem: "编辑条目",
    enabled: "启用",
    endTime: "结束",
    from: "发件人",
    idle: "空闲",
    inbox: "收件箱",
    language: "语言",
    languageEnglish: "英语",
    languageJapanese: "日语",
    languageSystem: "跟随系统",
    languageChinese: "中文",
    lastCheck: "上次检查：{time}",
    location: "地点",
    mail: "邮件",
    mailbox: "邮箱",
    mailboxes: "{count} 个邮箱",
    mailActions: "邮件操作",
    mailNavigation: "邮件导航",
    mailTimetable: "邮件时间表",
    mailboxFunctions: "邮箱功能",
    mailboxList: "邮箱列表",
    messageContentHint: "邮件内容会显示在这里。",
    messageReader: "邮件阅读器",
    messages: "邮件",
    needsAuth: "需要授权",
    noAccountsHint: "请先在渠道或设置中连接邮箱，然后开始同步邮件。",
    newMessage: "新邮件",
    newScheduleItem: "新建条目",
    noMessages: "没有邮件",
    notRunYet: "尚未运行",
    optional: "可选",
    plan: "计划",
    providersSummary: "{providers} 个渠道，{connected} 已连接，{needsAuth} 需要凭据",
    refresh: "刷新",
    reply: "回复",
    runChannelValidation: "运行渠道验证",
    scheduleNavigation: "时间表导航",
    scheduleContextMenu: "时间表条目菜单",
    scheduleItem: "时间表条目",
    scheduleView: "时间表视图",
    searchEmpty: "搜索或文件夹中没有匹配邮件。",
    searchMailboxes: "搜索邮箱",
    searchPlaceholder: "搜索发件人、主题、tag:安全、provider:qq",
    selectMessage: "选择一封邮件",
    send: "发送",
    save: "保存",
    sent: "已发送",
    settings: "设置",
    starred: "星标",
    syncActive: "同步中",
    syncNeedsConfig: "需要配置",
    syncReady: "就绪",
    syncingMailbox: "正在同步邮箱...",
    startTime: "开始",
    systemSettings: "系统设置",
    title: "标题",
    updateAvailable: "发现新版本 {version}。",
    updateCheckFailed: "暂时无法检查更新，请稍后再试。",
    updatesIdle: "尚未检查更新。",
    upToDate: "MailGUI233 {version} 已是最新版本。",
    timetable: "时间表",
    today: "今天",
    to: "收件人",
    trash: "废纸篓",
    toggleStar: "切换星标",
    untitledScheduleItem: "未命名条目",
    visibleCount: "{count} 可见",
    verifying: "验证中",
    week: "周",
    writeMessage: "输入邮件内容...",
    month: "月"
  },
  ja: {
    allMailboxes: "すべてのメールボックス",
    addMailbox: "メールボックスを追加",
    addMailboxPrompt: "追加するメールアドレスを入力",
    appSettings: "アプリ設定",
    appVersion: "現在のバージョン {version}",
    archive: "アーカイブ",
    autoCheckUpdates: "更新を自動確認",
    autoStart: "ログイン時に起動",
    channels: "チャネル",
    channelValidation: "チャネル検証",
    checkAllChannels: "すべて検証",
    checkUpdates: "更新を確認",
    checkingUpdates: "更新を確認中...",
    checking: "確認中",
    cancel: "キャンセル",
    close: "閉じる",
    closeComposer: "作成画面を閉じる",
    compose: "作成",
    connected: "接続済み",
    connectedAccounts: "{connected}/{total} アカウント接続済み",
    cloudSync: "クラウド同期",
    cloudSyncIntro: "非公開 Git リポジトリ、WebDAV、ローカルエージェントフォルダにネイティブ同期します。",
    cloudSyncMethods: "クラウド同期方式",
    day: "日",
    deleteMailbox: "メールボックスを削除",
    deleteScheduleItem: "項目を削除",
    duplicateScheduleItem: "項目を複製",
    downloadUpdate: "更新をダウンロード",
    drafts: "下書き",
    date: "日付",
    editScheduleItem: "項目を編集",
    enabled: "有効",
    endTime: "終了",
    from: "差出人",
    idle: "待機中",
    inbox: "受信箱",
    language: "言語",
    languageEnglish: "英語",
    languageJapanese: "日本語",
    languageSystem: "システム",
    languageChinese: "中国語",
    lastCheck: "最終確認: {time}",
    location: "場所",
    mail: "メール",
    mailbox: "メールボックス",
    mailboxes: "{count} メールボックス",
    mailActions: "メール操作",
    mailNavigation: "メールナビゲーション",
    mailTimetable: "メール時間表",
    mailboxFunctions: "メールボックス機能",
    mailboxList: "メールボックス一覧",
    messageContentHint: "メール本文がここに表示されます。",
    messageReader: "メールリーダー",
    messages: "メール",
    needsAuth: "認証が必要",
    noAccountsHint: "チャネルまたは設定でメールボックスを接続すると同期を開始できます。",
    newMessage: "新規メール",
    newScheduleItem: "新規項目",
    noMessages: "メールがありません",
    notRunYet: "未実行",
    optional: "任意",
    plan: "予定",
    providersSummary: "{providers} チャネル、{connected} 接続済み、{needsAuth} 認証待ち",
    refresh: "更新",
    reply: "返信",
    runChannelValidation: "チャネル検証を実行",
    scheduleNavigation: "時間表ナビゲーション",
    scheduleContextMenu: "時間表項目メニュー",
    scheduleItem: "時間表項目",
    scheduleView: "時間表ビュー",
    searchEmpty: "検索条件またはフォルダに一致するメールはありません。",
    searchMailboxes: "メールボックスを検索",
    searchPlaceholder: "差出人、件名、tag:security、provider:qq",
    selectMessage: "メールを選択",
    send: "送信",
    save: "保存",
    sent: "送信済み",
    settings: "設定",
    starred: "スター付き",
    syncActive: "同期中",
    syncNeedsConfig: "設定が必要",
    syncReady: "準備完了",
    syncingMailbox: "メールボックスを同期中...",
    startTime: "開始",
    systemSettings: "システム設定",
    title: "タイトル",
    updateAvailable: "バージョン {version} が利用できます。",
    updateCheckFailed: "更新を確認できませんでした。後でもう一度お試しください。",
    updatesIdle: "更新はまだ確認されていません。",
    upToDate: "MailGUI233 {version} は最新です。",
    timetable: "時間表",
    today: "今日",
    to: "宛先",
    trash: "ゴミ箱",
    toggleStar: "スターを切り替え",
    untitledScheduleItem: "無題の項目",
    visibleCount: "{count} 件表示",
    verifying: "検証中",
    week: "週",
    writeMessage: "本文を入力...",
    month: "月"
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  language: Language;
  resolvedLanguage: ResolvedLanguage;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const languageOptions: Array<{ value: Language; labelKey: TranslationKey }> = [
  { value: "system", labelKey: "languageSystem" },
  { value: "en", labelKey: "languageEnglish" },
  { value: "zh", labelKey: "languageChinese" },
  { value: "ja", labelKey: "languageJapanese" }
];

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function resolveSystemLanguage(): ResolvedLanguage {
  const language = navigator.language.toLowerCase();

  if (language.startsWith("zh")) {
    return "zh";
  }

  if (language.startsWith("ja")) {
    return "ja";
  }

  return "en";
}

function readStoredLanguage(): Language {
  const stored = window.localStorage.getItem(storageKey);

  return stored === "system" || stored === "en" || stored === "zh" || stored === "ja" ? stored : "system";
}

function localeFor(language: ResolvedLanguage) {
  if (language === "zh") {
    return "zh-CN";
  }

  if (language === "ja") {
    return "ja-JP";
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const resolvedLanguage = language === "system" ? resolveSystemLanguage() : language;
  const locale = localeFor(resolvedLanguage);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    function setLanguage(nextLanguage: Language) {
      window.localStorage.setItem(storageKey, nextLanguage);
      setLanguageState(nextLanguage);
    }

    function t(key: TranslationKey, values: Record<string, string | number> = {}) {
      const template = translations[resolvedLanguage][key] ?? translations.en[key];
      let result: string = template;

      for (const [name, replacement] of Object.entries(values)) {
        result = result.replaceAll(`{${name}}`, String(replacement));
      }

      return result;
    }

    return { language, resolvedLanguage, locale, setLanguage, t };
  }, [language, locale, resolvedLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }

  return context;
}

export { languageOptions };
