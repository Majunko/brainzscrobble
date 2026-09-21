import type { Translations } from '../i18n/es';

const STORAGE_KEY = 'brainzscrobble.locale';

const modules = import.meta.glob<Translations>('../i18n/*.ts', {
  eager: true,
  import: 'default',
});

const messages: Record<string, Translations> = {};
for (const [path, mod] of Object.entries(modules)) {
  const name = path.split('/').pop()!.replace(/\.ts$/, '');
  messages[name] = mod;
}

const DEFAULT_LOCALE = 'en';

export type Locale = string;

export const i18n: { locale: Locale } = $state({ locale: DEFAULT_LOCALE });

function defaultLocaleSafe(): Locale {
  const available = Object.keys(messages);
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved != null && available.includes(saved) ? saved : DEFAULT_LOCALE;
}

i18n.locale = defaultLocaleSafe();

export function t(key: string): string {
  const table = messages[i18n.locale] as Record<string, string> | undefined;
  return table?.[key] ?? key;
}

export function setLocale(locale: Locale): void {
  i18n.locale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // storage unavailable; ignored
  }
}

export function availableLocales(): Locale[] {
  return Object.keys(messages);
}