export type TimeFormat = '12' | '24';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type Theme = 'dark' | 'light';

export interface AppSettings {
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  autoSplit: boolean;
  theme: Theme;
}

const STORAGE_KEY = 'brainzscrobble.settings';

const DEFAULTS: AppSettings = {
  timeFormat: '12',
  dateFormat: 'MM/DD/YYYY',
  autoSplit: true,
  theme: 'dark',
};

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      timeFormat: parsed.timeFormat === '24' ? '24' : '12',
      dateFormat:
        parsed.dateFormat === 'DD/MM/YYYY' || parsed.dateFormat === 'YYYY-MM-DD'
          ? parsed.dateFormat
          : 'MM/DD/YYYY',
      autoSplit: parsed.autoSplit !== false,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export const settings = $state<AppSettings>(load());

document.documentElement.classList.toggle('light', settings.theme === 'light');

export function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): void {
  settings[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable; ignored
  }
}