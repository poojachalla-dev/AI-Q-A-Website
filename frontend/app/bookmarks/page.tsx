"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuestionCard from "../components/QuestionCard";
import { getBookmarks } from "../lib/bookmarks";
import { Question } from "../lib/api";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Question[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBookmarks(getBookmarks());
    setHydrated(true);
  }, []);

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: 110, paddingBottom: 80 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>
          Your collection
        </p>
        <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 700, marginBottom: 30 }}>
          Bookmarks
        </h1>

        {hydrated && bookmarks.length === 0 && (
          <div style={{ color: "var(--mist-dim)", fontSize: 14, lineHeight: 1.6 }}>
            <p style={{ marginBottom: 16 }}>
              Nothing saved yet — star a question from{" "}
              <Link href="/topics" style={{ color: "var(--cyan)" }}>
                Topics
              </Link>{" "}
              to keep it here.
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 18,
          }}
        >
          {bookmarks.map((q) => (
            <QuestionCard key={q.id} q={q} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
