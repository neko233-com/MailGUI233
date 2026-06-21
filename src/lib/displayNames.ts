import type { Account, ProviderDefinition } from "../types";
import type { ResolvedLanguage } from "../i18n";

const zhAccountNames: Record<string, string> = {
  "gmail-personal": "个人 Gmail",
  "qq-main": "QQ邮箱",
  "qq-work": "工作QQ邮箱",
  "outlook-studio": "工作 Outlook",
  "icloud-family": "iCloud 邮箱",
  "netease-backup": "网易 163",
  "proton-secure": "Proton 桥",
  "custom-imap": "自定义 IMAP"
};

const jaAccountNames: Record<string, string> = {
  "gmail-personal": "個人 Gmail",
  "qq-main": "QQメール",
  "qq-work": "仕事用 QQメール",
  "outlook-studio": "仕事用 Outlook",
  "icloud-family": "iCloud メール",
  "netease-backup": "NetEase 163",
  "proton-secure": "Proton Bridge",
  "custom-imap": "カスタム IMAP"
};

const zhProviderNames: Record<string, string> = {
  gmail: "Gmail",
  qq: "QQ邮箱",
  outlook: "Outlook",
  icloud: "iCloud 邮箱",
  yahoo: "Yahoo 邮箱",
  netease: "网易邮箱",
  zoho: "Zoho 邮箱",
  proton: "Proton 桥",
  imap: "自定义 IMAP"
};

const jaProviderNames: Record<string, string> = {
  gmail: "Gmail",
  qq: "QQメール",
  outlook: "Outlook",
  icloud: "iCloud メール",
  yahoo: "Yahooメール",
  netease: "NetEaseメール",
  zoho: "Zohoメール",
  proton: "Proton Bridge",
  imap: "カスタム IMAP"
};

export function accountDisplayName(account: Account, language: ResolvedLanguage) {
  if (language === "zh") {
    if (zhAccountNames[account.id]) {
      return zhAccountNames[account.id];
    }

    if (account.provider === "qq") {
      return account.name.toLowerCase().includes("work") ? "工作QQ邮箱" : "QQ邮箱";
    }

    return account.name;
  }

  if (language === "ja") {
    if (jaAccountNames[account.id]) {
      return jaAccountNames[account.id];
    }

    if (account.provider === "qq") {
      return account.name.toLowerCase().includes("work") ? "仕事用 QQメール" : "QQメール";
    }

    return account.name;
  }

  return account.name.replace(" Mail", "");
}

export function providerDisplayName(provider: ProviderDefinition, language: ResolvedLanguage) {
  if (language === "zh") {
    return zhProviderNames[provider.id] ?? provider.name;
  }

  if (language === "ja") {
    return jaProviderNames[provider.id] ?? provider.name;
  }

  return provider.shortName;
}

export function providerDisplayNameById(providerId: string, language: ResolvedLanguage) {
  if (language === "zh") {
    return zhProviderNames[providerId] ?? providerId.toUpperCase();
  }

  if (language === "ja") {
    return jaProviderNames[providerId] ?? providerId.toUpperCase();
  }

  return providerId.toUpperCase();
}
