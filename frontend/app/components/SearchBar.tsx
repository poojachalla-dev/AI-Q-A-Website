"use client";

import { useEffect, useState } from "react";

export default function SearchBar({
  onSearch,
  initial = "",
}: {
  onSearch: (q: string) => void;
  initial?: string;
}) {
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 280);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div style={{ position: "relative", maxWidth: 420 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the constellation…"
        className="mono"
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "12px 18px",
          fontSize: 13,
          color: "var(--glow)",
        }}
      />
    </div>
  );
}
