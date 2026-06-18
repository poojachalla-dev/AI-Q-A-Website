export type Bookmark = {
  question: string;
  answer: string;
  category?: string;
};

const KEY = "bookmarks";

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function addBookmark(item: Bookmark) {
  const existing = getBookmarks();

  const updated = [...existing, item];

  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function removeBookmark(question: string) {
  const existing = getBookmarks();

  const updated = existing.filter(
    (q) => q.question !== question
  );

  localStorage.setItem(KEY, JSON.stringify(updated));
}