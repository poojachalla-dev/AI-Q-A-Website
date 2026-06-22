"use client";

import { useEffect, useState } from "react";
import { Question } from "../lib/api";
import { isBookmarked, toggleBookmark } from "../lib/bookmarks";
import { isMastered, toggleMastered } from "../lib/progress";

const ACCENTS: Record<string, string> = {
  "machine-learning": "var(--cyan)",
  "deep-learning": "var(--violet)",
  nlp: "var(--coral)",
  "computer-vision": "var(--cyan)",
  statistics: "var(--violet)",
  mlops: "var(--coral)",
  "generative-ai": "var(--cyan)",
  sql: "var(--coral)",
  numpy: "var(--cyan)",
  pandas: "var(--violet)",
  "system-design": "var(--coral)",
  "python-basics": "var(--cyan)",
  "python-data-types": "var(--violet)",
  "python-strings": "var(--coral)",
  "python-functions": "var(--cyan)",
  "python-collections": "var(--violet)",
  "python-oop": "var(--coral)",
  "python-exceptions": "var(--cyan)",
  "python-file-handling": "var(--violet)",
  "python-modules": "var(--coral)",
  "python-iterators": "var(--cyan)",
  "python-decorators": "var(--violet)",
  "python-context-managers": "var(--coral)",
  "python-concurrency": "var(--cyan)",
  "python-memory": "var(--violet)",
  "python-gil": "var(--coral)",
  "python-advanced": "var(--cyan)",
  "python-coding": "var(--violet)",
  "python-system-design": "var(--coral)",
};

function FrequencyDots({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 3 }} aria-label={`Asked frequency ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i <= value ? "currentColor" : "var(--line-bright)",
          }}
        />
      ))}
    </span>
  );
}

export default function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [mastered, setMastered] = useState(false);

  // hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setBookmarked(isBookmarked(q.id));
    setMastered(isMastered(q.id));
  }, [q.id]);

  const accent = ACCENTS[q.category_slug] || "var(--cyan)";

  return (
    <div
      className="glass-card"
      style={{ padding: "26px 26px 22px", "--accent": accent } as React.CSSProperties}
    >
      <div
        className="mono"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
          fontSize: 11,
          color: "var(--mist-dim)",
        }}
      >
        <span style={{ color: accent, border: `1px solid ${accent}`, borderRadius: 999, padding: "3px 9px" }}>
          {q.category}
        </span>
        <span>{q.difficulty}</span>
        <span style={{ color: accent }}>
          <FrequencyDots value={q.frequency} />
        </span>
      </div>

      <h3 style={{ fontSize: "1.18rem", fontWeight: 600, lineHeight: 1.35, marginBottom: 12 }}>
        {q.question}
      </h3>

      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--mist)", marginBottom: 14 }}>
        {q.answer}
      </p>

      {open && q.deep_dive && (
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--mist-dim)",
            borderLeft: `2px solid ${accent}`,
            paddingLeft: 14,
            marginBottom: 14,
          }}
        >
          {q.deep_dive}
        </p>
      )}

      {q.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {q.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {q.deep_dive && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="mono"
            style={{
              fontSize: 12,
              color: accent,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            {open ? "Hide deep dive ↑" : "Deep dive ↓"}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setMastered(toggleMastered(q.id))}
          className="mono"
          style={{
            fontSize: 11,
            padding: "7px 12px",
            borderRadius: 999,
            border: `1px solid ${mastered ? accent : "var(--line)"}`,
            color: mastered ? accent : "var(--mist-dim)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {mastered ? "✓ Learned" : "Mark learned"}
        </button>
        <button
          onClick={() => setBookmarked(toggleBookmark(q))}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          style={{
            fontSize: 14,
            padding: "7px 11px",
            borderRadius: 999,
            border: `1px solid ${bookmarked ? accent : "var(--line)"}`,
            color: bookmarked ? accent : "var(--mist-dim)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}
