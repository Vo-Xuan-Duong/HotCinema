import { beforeEach, describe, expect, it } from 'vitest';
import settingsService, {
  SETTINGS_SCHEMA_VERSION,
  SETTINGS_STORAGE_KEY,
  parseStoredSettings,
} from './settingsService';

describe('settingsService browser-local storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not claim to be server backed', () => {
    expect(settingsService.isServerBacked()).toBe(false);
    expect(settingsService.getStorageScope()).toBe('browser-local');
  });

  it('persists versioned settings locally', async () => {
    const saved = await settingsService.update({
      company: { name: 'HotCinema' },
      bookingPreview: { maxSeatsPerBooking: 10 },
    });

    expect(saved.company.name).toBe('HotCinema');
    expect(saved._localMetadata.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);

    const raw = parseStoredSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    expect(raw.storageScope).toBe('browser-local');
    expect(raw.data.bookingPreview.maxSeatsPerBooking).toBe(10);

    const loaded = await settingsService.get();
    expect(loaded.company.name).toBe('HotCinema');
    expect(loaded._localMetadata.updatedAt).toBeTruthy();
  });

  it('resets only the browser-local settings key', async () => {
    window.localStorage.setItem('unrelated', 'keep');
    await settingsService.update({ company: { name: 'Test' } });
    await settingsService.reset();

    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem('unrelated')).toBe('keep');
  });

  it('handles invalid stored json without throwing', () => {
    expect(parseStoredSettings('{invalid')).toBeNull();
  });
});
