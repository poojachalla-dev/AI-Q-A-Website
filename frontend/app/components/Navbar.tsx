"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(6,6,17,0.7)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
        }}
      >
        <Link
          href="/"
          className="mono"
          style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 700 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--cyan)",
              boxShadow: "0 0 10px var(--cyan)",
              display: "inline-block",
            }}
          />
          AI INTERVIEW PREP
        </Link>

        <div className="mono" style={{ display: "flex", gap: 28, fontSize: 13 }}>
          <Link href="/topics" style={{ color: "var(--mist)" }}>
            Topics
          </Link>
          <Link href="/practice" style={{ color: "var(--mist)" }}>
            Practice
          </Link>
          <Link href="/bookmarks" style={{ color: "var(--mist)" }}>
            Bookmarks
          </Link>
        </div>
      </div>
    </nav>
  );
}
