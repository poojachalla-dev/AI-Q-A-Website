"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import QuestionCard from "../components/QuestionCard";
import { api, Category, Question } from "../lib/api";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const PAGE_SIZE = 30;

// Group categories so Python sub-topics sit neatly together in the sidebar
const PYTHON_PREFIX = "python-";
function groupCategories(cats: Category[]) {
  const python = cats.filter((c) => c.slug.startsWith(PYTHON_PREFIX));
  const other = cats.filter((c) => !c.slug.startsWith(PYTHON_PREFIX));
  return { python, other };
}

function pillStyle(active: boolean, subtle = false): React.CSSProperties {
  return {
    fontSize: 12,
    padding: "7px 13px",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--cyan)" : "var(--line)"}`,
    color: active ? "var(--cyan)" : subtle ? "var(--mist-dim)" : "var(--mist)",
    background: active ? "rgba(103,232,249,0.08)" : "transparent",
    cursor: "pointer",
    textAlign: "left" as const,
    whiteSpace: "nowrap" as const,
  };
}

function CategorySidebar({
  categories,
  active,
  onSelect,
}: {
  categories: Category[];
  active: string;
  onSelect: (slug: string) => void;
}) {
  const { python, other } = groupCategories(categories);
  const [pyOpen, setPyOpen] = useState(
    active.startsWith(PYTHON_PREFIX) || active === ""
  );

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        position: "sticky",
        top: 80,
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        paddingRight: 8,
      }}
    >
      <p
        className="mono"
        style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--mist-dim)", marginBottom: 10 }}
      >
        TOPICS
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button
          onClick={() => onSelect("")}
          className="mono"
          style={pillStyle(active === "")}
        >
          All topics
        </button>

        {/* Other non-Python topics */}
        {other.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelect(c.slug)}
            className="mono"
            style={pillStyle(active === c.slug)}
          >
            {c.name}
            <span style={{ marginLeft: 6, opacity: 0.5 }}>{c.question_count}</span>
          </button>
        ))}

        {/* Python collapsible group */}
        {python.length > 0 && (
          <>
            <button
              onClick={() => setPyOpen((v) => !v)}
              className="mono"
              style={{
                ...pillStyle(active.startsWith(PYTHON_PREFIX)),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <span>Python ▸</span>
              <span style={{ opacity: 0.5 }}>{pyOpen ? "▲" : "▼"}</span>
            </button>
            {pyOpen && (
              <div style={{ paddingLeft: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                {python.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => onSelect(c.slug)}
                    className="mono"
                    style={{ ...pillStyle(active === c.slug), fontSize: 11 }}
                  >
                    {c.name.replace("Python ", "")}
                    <span style={{ marginLeft: 6, opacity: 0.5 }}>{c.question_count}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function TopicsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    setError(false);
    const params = {
      category: category || undefined,
      difficulty: difficulty || undefined,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    };
    Promise.all([
      api.questions(params),
      api.questionCount({
        category: category || undefined,
        difficulty: difficulty || undefined,
        search: search || undefined,
      }),
    ])
      .then(([qs, { count }]) => {
        setQuestions(qs);
        setTotalCount(count);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [category, difficulty, search, page]);

  // reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [category, difficulty, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Navbar />
      <main
        className="container"
        style={{ paddingTop: 110, paddingBottom: 80, display: "flex", gap: 32, alignItems: "flex-start" }}
      >
        {/* Sidebar */}
        <CategorySidebar
          categories={categories}
          active={category}
          onSelect={(slug) => setCategory(slug)}
        />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 700, margin: 0 }}>
              {category
                ? categories.find((c) => c.slug === category)?.name ?? "Questions"
                : "All Questions"}
            </h1>
            {!loading && (
              <span className="mono" style={{ fontSize: 12, color: "var(--mist-dim)" }}>
                {totalCount.toLocaleString()} total
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
            <SearchBar onSearch={(q) => { setSearch(q); }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setDifficulty("")}
                className="mono"
                style={pillStyle(difficulty === "", true)}
              >
                Any
              </button>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="mono"
                  style={pillStyle(difficulty === d, true)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mono" style={{ color: "var(--mist-dim)", fontSize: 13 }}>
              Couldn&apos;t reach the API. Make sure the backend is running at
              the address set in NEXT_PUBLIC_API_URL.
            </p>
          )}
          {loading && !error && (
            <p className="mono" style={{ color: "var(--mist-dim)", fontSize: 13 }}>
              Loading…
            </p>
          )}
          {!loading && !error && questions.length === 0 && (
            <p className="mono" style={{ color: "var(--mist-dim)", fontSize: 13 }}>
              No questions match those filters.
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {questions.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 40,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn"
                style={{ opacity: page === 0 ? 0.35 : 1, padding: "10px 20px" }}
              >
                ← Prev
              </button>

              {/* page number pills — show ±2 around current page */}
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
                .map((i, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== i - 1 && (
                      <span
                        key={`ellipsis-${i}`}
                        className="mono"
                        style={{ color: "var(--mist-dim)", fontSize: 12 }}
                      >
                        …
                      </span>
                    )}
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className="mono"
                      style={{
                        ...pillStyle(page === i),
                        minWidth: 36,
                        textAlign: "center",
                      }}
                    >
                      {i + 1}
                    </button>
                  </>
                ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn"
                style={{ opacity: page >= totalPages - 1 ? 0.35 : 1, padding: "10px 20px" }}
              >
                Next →
              </button>

              <span className="mono" style={{ fontSize: 11, color: "var(--mist-dim)" }}>
                Page {page + 1} of {totalPages} · showing {PAGE_SIZE} per page
              </span>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={null}>
      <TopicsContent />
    </Suspense>
  );
}
