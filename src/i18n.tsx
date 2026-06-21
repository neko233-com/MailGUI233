import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "system" | "en" | "zh" | "ja";
export type ResolvedLanguage = Exclude<Language, "system">;

const storageKey = "mailgui233.language";

const translations = {
  en: {
    allMailboxes: "All mailboxes",
    archive: "Archive",
    channels: "Channels",
    channelValidation: "Channel validation",
    checkAllChannels: "Verify all",
    checking: "Checking",
    closeComposer: "Close composer",
    compose: "Compose",
    connected: "Connected",
    connectedAccounts: "{connected}/{total} accounts connected",
    day: "日",
    drafts: "Drafts",
    from: "From",
    idle: "Idle",
    inbox: "Inbox",
    language: "Language",
    languageEnglish: "English",
    languageJapanese: "Japanese",
    languageSystem: "System",
    languageChinese: "Chinese",
    lastCheck: "Last check: {time}",
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
    newMessage: "New message",
    noMessages: "No messages",
    notRunYet: "Not run yet",
    optional: "optional",
    plan: "Plan",
    providersSummary: "{providers} providers, {connected} connected, {needsAuth} need credentials",
    refresh: "Refresh",
    reply: "Reply",
    runChannelValidation: "Run channel validation",
    scheduleNavigation: "Schedule navigation",
    scheduleView: "Schedule view",
    searchEmpty: "Search or folder has no matching mail.",
    searchPlaceholder: "Search sender, subject, labels",
    selectMessage: "Select a message",
    send: "Send",
    sent: "Sent",
    starred: "Starred",
    syncActive: "Sync active",
    syncingMailbox: "Syncing mailbox...",
    timetable: "Timetable",
    today: "Today",
    to: "To",
    trash: "Trash",
    toggleStar: "Toggle star",
    visibleCount: "{count} visible",
    verifying: "Verifying",
    week: "周",
    writeMessage: "Write message...",
    month: "月"
  },
  zh: {
    allMailboxes: "所有邮箱",
    archive: "归档",
    channels: "渠道",
    channelValidation: "渠道验证",
    checkAllChannels: "验证全部",
    checking: "检查中",
    closeComposer: "关闭写信窗口",
    compose: "写信",
    connected: "已连接",
    connectedAccounts: "{connected}/{total} 个账号已连接",
    day: "日",
    drafts: "草稿",
    from: "发件人",
    idle: "空闲",
    inbox: "收件箱",
    language: "语言",
    languageEnglish: "英语",
    languageJapanese: "日语",
    languageSystem: "跟随系统",
    languageChinese: "中文",
    lastCheck: "上次检查：{time}",
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
    newMessage: "新邮件",
    noMessages: "没有邮件",
    notRunYet: "尚未运行",
    optional: "可选",
    plan: "计划",
    providersSummary: "{providers} 个渠道，{connected} 已连接，{needsAuth} 需要凭据",
    refresh: "刷新",
    reply: "回复",
    runChannelValidation: "运行渠道验证",
    scheduleNavigation: "时间表导航",
    scheduleView: "时间表视图",
    searchEmpty: "搜索或文件夹中没有匹配邮件。",
    searchPlaceholder: "搜索发件人、主题、标签",
    selectMessage: "选择一封邮件",
    send: "发送",
    sent: "已发送",
    starred: "星标",
    syncActive: "同步中",
    syncingMailbox: "正在同步邮箱...",
    timetable: "时间表",
    today: "今天",
    to: "收件人",
    trash: "废纸篓",
    toggleStar: "切换星标",
    visibleCount: "{count} 可见",
    verifying: "验证中",
    week: "周",
    writeMessage: "输入邮件内容...",
    month: "月"
  },
  ja: {
    allMailboxes: "すべてのメールボックス",
    archive: "アーカイブ",
    channels: "チャネル",
    channelValidation: "チャネル検証",
    checkAllChannels: "すべて検証",
    checking: "確認中",
    closeComposer: "作成画面を閉じる",
    compose: "作成",
    connected: "接続済み",
    connectedAccounts: "{connected}/{total} アカウント接続済み",
    day: "日",
    drafts: "下書き",
    from: "差出人",
    idle: "待機中",
    inbox: "受信箱",
    language: "言語",
    languageEnglish: "英語",
    languageJapanese: "日本語",
    languageSystem: "システム",
    languageChinese: "中国語",
    lastCheck: "最終確認: {time}",
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
    newMessage: "新規メール",
    noMessages: "メールがありません",
    notRunYet: "未実行",
    optional: "任意",
    plan: "予定",
    providersSummary: "{providers} チャネル、{connected} 接続済み、{needsAuth} 認証待ち",
    refresh: "更新",
    reply: "返信",
    runChannelValidation: "チャネル検証を実行",
    scheduleNavigation: "時間表ナビゲーション",
    scheduleView: "時間表ビュー",
    searchEmpty: "検索条件またはフォルダに一致するメールはありません。",
    searchPlaceholder: "差出人、件名、ラベルを検索",
    selectMessage: "メールを選択",
    send: "送信",
    sent: "送信済み",
    starred: "スター付き",
    syncActive: "同期中",
    syncingMailbox: "メールボックスを同期中...",
    timetable: "時間表",
    today: "今日",
    to: "宛先",
    trash: "ゴミ箱",
    toggleStar: "スターを切り替え",
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
