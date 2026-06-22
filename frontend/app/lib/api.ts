// Central place for the backend base URL.
// Set NEXT_PUBLIC_API_URL in your environment when deploying (e.g. Vercel env vars)
// to point at your deployed FastAPI backend. Falls back to local dev.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type Question = {
  id: number;
  category: string;
  category_slug: string;
  question: string;
  answer: string;
  deep_dive: string;
  difficulty: string;
  frequency: number;
  tags: string[];
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  code: string;
  question_count: number;
};

export type Stats = {
  total_questions: number;
  total_categories: number;
  by_difficulty: Record<string, number>;
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`);
  }
  return res.json();
}

export const api = {
  categories: () => apiGet<Category[]>("/categories"),
  stats: () => apiGet<Stats>("/stats"),
  questions: (params: { category?: string; difficulty?: string; search?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.difficulty) qs.set("difficulty", params.difficulty);
    if (params.search) qs.set("search", params.search);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    if (params.offset !== undefined) qs.set("offset", String(params.offset));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiGet<Question[]>(`/questions${suffix}`);
  },
  questionCount: (params: { category?: string; difficulty?: string; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.difficulty) qs.set("difficulty", params.difficulty);
    if (params.search) qs.set("search", params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiGet<{ count: number }>(`/questions-count${suffix}`);
  },
  practice: (params: { category?: string; difficulty?: string; count?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.difficulty) qs.set("difficulty", params.difficulty);
    if (params.count) qs.set("count", String(params.count));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiGet<Question[]>(`/practice${suffix}`);
  },
};
