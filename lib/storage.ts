// Safe localStorage access.
//
// Reading or writing localStorage THROWS in some browser configurations even
// though the object exists (so `typeof localStorage !== "undefined"` is not
// enough): Safari with "Block All Cookies" / site data disabled, locked-down
// or embedded WebViews, and quota-exceeded on write. An unguarded call inside a
// React render / useState initializer takes the whole component (or app, via a
// top-level provider) down. These wrappers degrade to a null/no-op instead.

export function lsGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function lsSet(key: string, value: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked or full — ignore */
  }
}

export function lsRemove(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* storage blocked — ignore */
  }
}
