import type * as t from '@/types';

const THEME_EVENT = 'aimo:theme-change';
const THEME_COOKIE = /(?:^|;\s*)aimo-theme=(light|dark|system)(?:;|$)/;

function savedTheme(): t.ThemeOption | undefined {
  return document.cookie.match(THEME_COOKIE)?.[1] as t.ThemeOption | undefined;
}

function saveCookie(theme: t.ThemeOption): void {
  document.cookie = `aimo-theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

/** Missing or deleted cookies reset the preference; legacy local storage is intentionally ignored. */
export function readThemePreference(): t.ThemeOption {
  if (typeof document === 'undefined') return 'system';
  try {
    const value = savedTheme();
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function writeThemePreference(theme: t.ThemeOption): void {
  if (typeof document === 'undefined') return;
  if (theme !== 'light' && theme !== 'dark' && theme !== 'system') return;
  saveCookie(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Safari expires cookies written by scripts after 7 days, so every visit renews the saved one. */
export function renewThemePreference(): void {
  const theme = savedTheme();
  if (theme) saveCookie(theme);
}

export function subscribeToTheme(callback: () => void): () => void {
  let previous = readThemePreference();
  const check = (): void => {
    const next = readThemePreference();
    if (next === previous) return;
    previous = next;
    callback();
  };
  const checkVisible = (): void => {
    if (document.visibilityState === 'visible') check();
  };
  const cookieStore = 'cookieStore' in window ? (window.cookieStore as EventTarget) : undefined;
  const timer = cookieStore ? undefined : window.setInterval(checkVisible, 1000);
  cookieStore?.addEventListener('change', check);
  window.addEventListener(THEME_EVENT, check);
  window.addEventListener('focus', check);
  window.addEventListener('pageshow', check);
  document.addEventListener('visibilitychange', checkVisible);
  return () => {
    window.clearInterval(timer);
    cookieStore?.removeEventListener('change', check);
    window.removeEventListener(THEME_EVENT, check);
    window.removeEventListener('focus', check);
    window.removeEventListener('pageshow', check);
    document.removeEventListener('visibilitychange', checkVisible);
  };
}
