"use client";

import { useSearchParams } from "next/navigation";

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("name");

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">
        {category} Questions
      </h1>

      <p className="mt-4 text-gray-500">
        This will come from FastAPI backend soon.
      </p>
    </main>
  );
}