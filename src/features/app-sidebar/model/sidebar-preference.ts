const STORAGE_KEY = "medlink.sidebar.open";

export function readSidebarOpenFromStorage(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "false") return false;
    if (v === "true") return true;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeSidebarOpenToStorage(open: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(open));
  } catch {
    /* ignore */
  }
}
