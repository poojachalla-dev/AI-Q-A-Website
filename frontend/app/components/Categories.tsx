"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, Category } from "../lib/api";

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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .categories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <section className="container" style={{ position: "relative", zIndex: 2, padding: "100px 24px" }}>
      <p className="eyebrow" style={{ marginBottom: 16 }}>
        Choose a cluster
      </p>
      <h2
        style={{
          fontSize: "clamp(1.9rem, 4vw, 2.7rem)",
          fontWeight: 700,
          maxWidth: 640,
          marginBottom: 48,
        }}
      >
        Every topic is its own node in the network.
      </h2>

      {error && (
        <p className="mono" style={{ color: "var(--mist-dim)", fontSize: 13 }}>
          Couldn&apos;t reach the API. Make sure the backend is running at the
          address set in NEXT_PUBLIC_API_URL.
        </p>
      )}

      {loading && !error && (
        <p className="mono" style={{ color: "var(--mist-dim)", fontSize: 13 }}>
          Loading topics…
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {categories.map((cat, i) => {
          const accent = ACCENTS[cat.slug] || "var(--cyan)";
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4) }}
            >
              <Link
                href={`/topics?category=${cat.slug}`}
                className="glass-card"
                style={
                  {
                    display: "block",
                    padding: "26px 24px",
                    height: "100%",
                    "--accent": accent,
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      color: accent,
                      border: `1px solid ${accent}`,
                      borderRadius: 999,
                      padding: "4px 10px",
                    }}
                  >
                    {cat.code}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--mist-dim)" }}>
                    {cat.question_count} Q&amp;A
                  </span>
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 10 }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--mist)" }}>
                  {cat.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
