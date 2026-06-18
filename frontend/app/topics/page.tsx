"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "../components/SearchBar";

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("name");

  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!category) return;

    fetch(`http://127.0.0.1:8000/questions?category=${category}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, [category]);

  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold mb-6">
        {category} Interview Questions
      </h1>

      {/* SEARCH */}
      <SearchBar onResults={setQuestions} />

      <div className="space-y-6">
  {questions.map((q, i) => (
    <div
      key={i}
      className="p-6 bg-gray-100 rounded-xl"
    >
      <h2 className="font-semibold text-lg">
        {q.question}
      </h2>

      <p className="text-gray-600 mt-2">
        {q.answer}
      </p>

      {/* ACTIONS */}
      <div className="flex gap-4 mt-4">

        <button
          onClick={() => {
            const saved = JSON.parse(
              localStorage.getItem("bookmarks") || "[]"
            );

            saved.push({
              question: q.question,
              answer: q.answer,
              category
            });

            localStorage.setItem(
              "bookmarks",
              JSON.stringify(saved)
            );
          }}
          className="text-sm text-blue-600"
        >
          Bookmark
        </button>

        <button
          onClick={() => {
            alert("Marked as learned (next step we store progress)");
          }}
          className="text-sm text-green-600"
        >
          Mark Done
        </button>

        <button
          onClick={async () => {
            const res = await fetch(
              "http://127.0.0.1:8000/ai-answer",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  question: q.question
                })
              }
            );

            const data = await res.json();
            alert(data.answer);
          }}
          className="text-sm text-purple-600"
        >
          AI Explain
        </button>

      </div>
    </div>
  ))}
</div>

    </main>
  );
}