"use client";

import { useState } from "react";

export default function SearchBar({ onResults }: any) {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/search?q=${query}`
    );
    const data = await res.json();
    onResults(data);
  };

  return (
    <div className="flex gap-2 mb-6">
      <input
        className="border p-2 rounded w-full"
        placeholder="Search questions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="bg-black text-white px-4 rounded"
      >
        Search
      </button>
    </div>
  );
}