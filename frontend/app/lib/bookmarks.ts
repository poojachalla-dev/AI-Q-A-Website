import type { Question } from "./api";

const KEY = "aiprep_bookmarks";

export function getBookmarks(): Question[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isBookmarked(id: number): boolean {
  return getBookmarks().some((q) => q.id === id);
}

export function addBookmark(item: Question) {
  const existing = getBookmarks();
  if (existing.some((q) => q.id === item.id)) return;
  localStorage.setItem(KEY, JSON.stringify([...existing, item]));
}

export function removeBookmark(id: number) {
  const existing = getBookmarks();
  localStorage.setItem(KEY, JSON.stringify(existing.filter((q) => q.id !== id)));
}

export function toggleBookmark(item: Question): boolean {
  if (isBookmarked(item.id)) {
    removeBookmark(item.id);
    return false;
  }
  addBookmark(item);
  return true;
}
