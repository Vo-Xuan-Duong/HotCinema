/** Session key: scroll position to restore after returning from login without completing auth (or after login). */
export const AUTH_SCROLL_STORAGE_KEY = 'hotcinema:authScrollRestore';

/**
 * Call before navigating to the login page so ScrollToTop can restore vertical scroll on return.
 * @param {string} [pathname] — defaults to current path
 */
export function saveScrollForAuthReturn(pathname) {
  try {
    const path = pathname || window.location.pathname;
    const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    sessionStorage.setItem(AUTH_SCROLL_STORAGE_KEY, JSON.stringify({ path, y }));
  } catch {
    // ignore
  }
}

/**
 * If storage matches this pathname, remove it and return scroll Y to apply; otherwise clear stale entry.
 * @param {string} pathname
 * @returns {number|null}
 */
export function consumeScrollRestoreForPath(pathname) {
  try {
    const raw = sessionStorage.getItem(AUTH_SCROLL_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data.path === 'string' && data.path === pathname) {
      sessionStorage.removeItem(AUTH_SCROLL_STORAGE_KEY);
      return typeof data.y === 'number' ? data.y : 0;
    }
    sessionStorage.removeItem(AUTH_SCROLL_STORAGE_KEY);
    return null;
  } catch {
    try {
      sessionStorage.removeItem(AUTH_SCROLL_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}
