export const MOCK_MODE_STORAGE_KEY = 'hotcinema_mock_mode';
export const MOCK_DATABASE_STORAGE_KEY = 'hotcinema_mock_database_v1';

const readStoredMode = () => {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(MOCK_MODE_STORAGE_KEY);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

export const isMockApiEnabled = () => {
  const stored = readStoredMode();
  if (stored !== null) return stored;

  const configured = String(import.meta.env.VITE_USE_MOCK_DATA || '').trim().toLowerCase();
  if (configured === 'true') return true;
  if (configured === 'false') return false;

  // Real API is the development default. Mock mode is now an explicit opt-in
  // for isolated UI work so FE/BE contract regressions remain visible locally.
  return false;
};

export const MOCK_API_ENABLED = isMockApiEnabled();
export const MOCK_API_DELAY = Math.max(0, Number(import.meta.env.VITE_MOCK_API_DELAY ?? 280) || 0);

export const setMockApiEnabled = (enabled) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MOCK_MODE_STORAGE_KEY, String(Boolean(enabled)));
};

export const clearMockApiOverride = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MOCK_MODE_STORAGE_KEY);
};

export const resetMockDatabase = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MOCK_DATABASE_STORAGE_KEY);
};
