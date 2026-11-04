export function readSessionStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSessionStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

export function removeSessionStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

export function readJsonSessionStorage<T>(key: string): T | null {
  const raw = readSessionStorage(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJsonSessionStorage(key: string, value: unknown): void {
  try {
    writeSessionStorage(key, JSON.stringify(value));
  } catch {
    // Serialization or storage failure
  }
}
