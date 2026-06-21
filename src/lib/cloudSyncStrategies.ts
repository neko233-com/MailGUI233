import type {
  CloudSyncConfig,
  CloudSyncField,
  CloudSyncStrategyDefinition,
  CloudSyncStrategyId,
  CloudSyncValidation
} from "../types";

interface CloudSyncStrategy {
  definition: CloudSyncStrategyDefinition;
  validate: (config: CloudSyncConfig) => CloudSyncValidation;
  describe: (config: CloudSyncConfig) => string;
}

const strategyDefinitions: CloudSyncStrategyDefinition[] = [
  {
    id: "git",
    name: "Git repository",
    summary: "Sync encrypted account settings, tags, and UI state through a private Git repository.",
    privacyNote: "The user owns repository privacy. MailGUI233 treats this as a private remote and stores no public backup.",
    accent: "#111827",
    fields: [
      { key: "remote", label: "Remote URL", kind: "text", placeholder: "git@github.com:you/mailgui233-sync.git", required: true },
      { key: "branch", label: "Branch", kind: "text", placeholder: "main", required: true },
      { key: "path", label: "Sync path", kind: "text", placeholder: "mailgui233/accounts.json", required: true },
      { key: "auth", label: "Auth mode", kind: "select", options: ["SSH agent", "System Git credential", "Token env var"], required: true }
    ]
  },
  {
    id: "webdav",
    name: "WebDAV",
    summary: "Sync the same encrypted profile snapshot to a self-hosted or provider-hosted WebDAV directory.",
    privacyNote: "Credentials stay local. Remote privacy depends on the WebDAV server controlled by the user.",
    accent: "#147efb",
    fields: [
      { key: "endpoint", label: "Endpoint", kind: "text", placeholder: "https://dav.example.com/mailgui233/", required: true },
      { key: "username", label: "Username", kind: "text", placeholder: "neko233", required: true },
      { key: "passwordRef", label: "Password key", kind: "password", placeholder: "Stored in OS keychain", required: true },
      { key: "remotePath", label: "Remote path", kind: "text", placeholder: "/MailGUI233/accounts.json", required: true }
    ]
  },
  {
    id: "local",
    name: "Local folder",
    summary: "Use a folder as the native sync target for portable drives, Syncthing, iCloud Drive, or other agents.",
    privacyNote: "MailGUI233 writes only to the selected local path. Any onward sync is handled by the user's agent.",
    accent: "#0b8f8a",
    fields: [
      { key: "folder", label: "Folder", kind: "text", placeholder: "D:\\Private\\MailGUI233", required: true },
      { key: "profile", label: "Profile", kind: "text", placeholder: "default", required: true }
    ]
  }
];

function requiredFields(fields: CloudSyncField[]) {
  return fields.filter((field) => field.required).map((field) => field.key);
}

function validateRequired(definition: CloudSyncStrategyDefinition, config: CloudSyncConfig): CloudSyncValidation {
  const missingFields = requiredFields(definition.fields).filter((key) => !config.values[key]?.trim());

  if (!config.enabled) {
    return {
      ok: false,
      status: "needs-config",
      message: "Disabled until the user enables this sync method.",
      missingFields
    };
  }

  if (missingFields.length > 0) {
    return {
      ok: false,
      status: "needs-config",
      message: `Missing ${missingFields.length} required field${missingFields.length === 1 ? "" : "s"}.`,
      missingFields
    };
  }

  return {
    ok: true,
    status: "ready",
    message: `${definition.name} is ready for native sync validation.`,
    missingFields: []
  };
}

const strategies = new Map<CloudSyncStrategyId, CloudSyncStrategy>(
  strategyDefinitions.map((definition) => [
    definition.id,
    {
      definition,
      validate: (config) => validateRequired(definition, config),
      describe: (config) => {
        const validation = validateRequired(definition, config);
        return validation.ok ? `${definition.name}: ${validation.message}` : `${definition.name}: ${validation.message}`;
      }
    }
  ])
);

export function listCloudSyncStrategies() {
  return strategyDefinitions;
}

export function createCloudSyncStrategy(id: CloudSyncStrategyId) {
  const strategy = strategies.get(id);

  if (!strategy) {
    throw new Error(`Unknown cloud sync strategy: ${id}`);
  }

  return strategy;
}

export const initialCloudSyncConfigs: Record<CloudSyncStrategyId, CloudSyncConfig> = {
  git: {
    strategyId: "git",
    enabled: true,
    values: {
      remote: "git@github.com:private/mailgui233-sync.git",
      branch: "main",
      path: "mailgui233/accounts.json",
      auth: "SSH agent"
    }
  },
  webdav: {
    strategyId: "webdav",
    enabled: false,
    values: {
      endpoint: "",
      username: "",
      passwordRef: "",
      remotePath: "/MailGUI233/accounts.json"
    }
  },
  local: {
    strategyId: "local",
    enabled: false,
    values: {
      folder: "",
      profile: "default"
    }
  }
};
