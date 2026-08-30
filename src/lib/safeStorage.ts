/**
 * Safe localStorage helpers.
 * Some mobile browsers / private modes / webviews block localStorage
 * (throwing SecurityError on access). Wrap every access so the app
 * never crashes when storage is unavailable.
 */
export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable — ignore */
  }
}
