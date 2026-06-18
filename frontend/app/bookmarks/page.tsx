"use client";

import { useEffect, useState } from "react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("bookmarks") || "[]"
    );
    setBookmarks(data);
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-6">
        Bookmarked Questions
      </h1>

      {bookmarks.length === 0 ? (
        <p className="text-gray-500">
          No bookmarks yet
        </p>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((q, i) => (
            <div key={i} className="p-6 bg-gray-100 rounded-xl">
              <h2 className="font-semibold">
                {q.question}
              </h2>
              <p className="text-gray-600 mt-2">
                {q.answer}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {q.category}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}