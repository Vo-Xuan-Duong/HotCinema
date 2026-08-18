const SETTINGS_STORAGE_KEY = 'hotcinema_admin_ui_settings_v1';
const SETTINGS_SCHEMA_VERSION = 1;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const parseStoredSettings = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const settingsService = {
  isServerBacked() {
    return false;
  },

  getStorageScope() {
    return 'browser-local';
  },

  async get() {
    if (!canUseStorage()) return {};
    const stored = parseStoredSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    if (!stored) return {};
    const { data, ...metadata } = stored;
    return {
      ...(data && typeof data === 'object' ? data : {}),
      _localMetadata: metadata,
    };
  },

  async update(settings) {
    const data = settings && typeof settings === 'object'
      ? JSON.parse(JSON.stringify(settings))
      : {};
    delete data._localMetadata;

    const stored = {
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      storageScope: 'browser-local',
      updatedAt: new Date().toISOString(),
      data,
    };

    if (canUseStorage()) {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(stored));
    }

    return {
      ...data,
      _localMetadata: {
        schemaVersion: stored.schemaVersion,
        storageScope: stored.storageScope,
        updatedAt: stored.updatedAt,
      },
    };
  },

  async reset() {
    if (canUseStorage()) window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    return {};
  },
};

export {
  SETTINGS_SCHEMA_VERSION,
  SETTINGS_STORAGE_KEY,
  parseStoredSettings,
};
export default settingsService;
