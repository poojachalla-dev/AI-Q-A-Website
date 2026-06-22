"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { api, Category, Question } from "../lib/api";
import { recordPracticeSession, toggleMastered } from "../lib/progress";

function PracticeContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  function begin() {
    setLoading(true);
    api
      .practice({ category: category || undefined, count: 12 })
      .then((data) => {
        setDeck(data);
        setIndex(0);
        setFlipped(false);
        setFinished(false);
        setStarted(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function next() {
    if (index + 1 >= deck.length) {
      const s = recordPracticeSession();
      setStreak(s);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!started || finished) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === "ArrowRight" && flipped) {
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, flipped, index, deck]);

  const current = deck[index];

  return (
    <>
      <Navbar />
      <main
        className="container"
        style={{
          paddingTop: 110,
          paddingBottom: 80,
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!started && (
          <div style={{ maxWidth: 560 }}>
            <p className="eyebrow" style={{ marginBottom: 14 }}>
              Drill mode
            </p>
            <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 700, marginBottom: 18 }}>
              Practice
            </h1>
            <p style={{ color: "var(--mist)", lineHeight: 1.6, marginBottom: 28, fontSize: 14.5 }}>
              A focused, 12-question run. Flip each card, judge yourself
              honestly, move on. Press space to flip, right arrow to
              continue.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30 }}>
              <button
                onClick={() => setCategory("")}
                className="mono"
                style={{
                  fontSize: 12,
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${category === "" ? "var(--cyan)" : "var(--line)"}`,
                  color: category === "" ? "var(--cyan)" : "var(--mist)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                All topics
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className="mono"
                  style={{
                    fontSize: 12,
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: `1px solid ${category === c.slug ? "var(--cyan)" : "var(--line)"}`,
                    color: category === c.slug ? "var(--cyan)" : "var(--mist)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button onClick={begin} className="btn primary" disabled={loading}>
              {loading ? "Shuffling…" : "Begin practice →"}
            </button>
          </div>
        )}

        {started && !finished && current && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="mono"
              style={{ color: "var(--mist-dim)", fontSize: 12, marginBottom: 22 }}
            >
              {index + 1} / {deck.length} · {current.category}
            </div>

            <div style={{ width: "100%", maxWidth: 620, perspective: 1400 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                >
                  <div
                    onClick={() => setFlipped((f) => !f)}
                    className="glass-card"
                    style={{
                      minHeight: 280,
                      padding: "40px 36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <motion.div
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{ duration: 0.45 }}
                      style={{ transformStyle: "preserve-3d", width: "100%", position: "relative" }}
                    >
                      <div style={{ backfaceVisibility: "hidden" }}>
                        <p
                          className="mono"
                          style={{ fontSize: 11, color: "var(--cyan)", marginBottom: 14 }}
                        >
                          QUESTION
                        </p>
                        <h2 style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1.4 }}>
                          {current.question}
                        </h2>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          display: flipped ? "block" : "none",
                        }}
                      >
                        <p
                          className="mono"
                          style={{ fontSize: 11, color: "var(--violet)", marginBottom: 14 }}
                        >
                          ANSWER
                        </p>
                        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--mist)" }}>
                          {current.answer}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mono" style={{ fontSize: 11, color: "var(--mist-dim)", marginTop: 16 }}>
              tap the card to flip
            </p>

            {flipped && (
              <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                <button
                  onClick={() => {
                    toggleMastered(current.id);
                    next();
                  }}
                  className="btn primary"
                >
                  Got it →
                </button>
                <button onClick={next} className="btn">
                  Review again later
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <p className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>
              Session complete
            </p>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 14 }}>
              {deck.length} questions down.
            </h2>
            <p className="mono" style={{ fontSize: 13, color: "var(--mist-dim)", marginBottom: 30 }}>
              Practice streak: <b style={{ color: "var(--cyan)" }}>{streak} day{streak === 1 ? "" : "s"}</b>
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={begin} className="btn primary">
                Run it again
              </button>
              <button onClick={() => setStarted(false)} className="btn">
                Change topic
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeContent />
    </Suspense>
  );
}
