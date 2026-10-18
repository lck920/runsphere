// Remembers the nickname on this device so forms are pre-filled.
// Convenience only: storage can be blocked (private mode, Instagram's in-app browser), so never rely on it.
const KEY = "runsphere:nickname";

export function getSavedNickname(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(nickname: string) {
  try {
    localStorage.setItem(KEY, nickname);
  } catch {}
}
