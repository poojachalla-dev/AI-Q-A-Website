# AI Interview Prep — The Neural Constellation

A full-stack AI/ML interview prep platform. 72 curated questions across
Machine Learning, Deep Learning, NLP, Computer Vision, Statistics, MLOps,
and Generative AI & LLMs — browsable as a filterable library or drilled in
a focused flashcard practice mode.

**Stack:** Next.js 14 (App Router, TypeScript) · FastAPI · SQLAlchemy ·
PostgreSQL (SQLite fallback for local dev) · Three.js for the hero
visualization.

---

## Project structure

```
backend/
  main.py          FastAPI app, routes, startup seeding
  models.py         SQLAlchemy models (Category, Question)
  schemas.py        Pydantic response schemas
  database.py        DB engine/session, Postgres-or-SQLite switch
  data.py            The 72-question seed content
  requirements.txt
  .env.example

frontend/
  app/
    components/      Navbar, ScrollyCanvas (scroll-scrubbed canvas), Overlay
                      (parallax hero text), NeuralBackground (live Three.js,
                      currently unused but kept — drop it into any page for
                      an ambient animated background), Categories,
                      QuestionCard, SearchBar, Footer
    lib/              api.ts (backend client), bookmarks.ts, progress.ts
    topics/           Browse + filter + search
    practice/         Flashcard drill mode
    bookmarks/        Saved questions
  public/sequence/    64 WebP frames powering the scroll-scrubbed hero
tools/
  generate_sequence.py  Regenerates the procedural frame sequence (see
                         "The cinematic hero" below)
```

## The cinematic hero

The homepage hero is a scroll-scrubbed canvas animation: as you scroll,
JavaScript swaps between 64 pre-rendered WebP frames based on scroll
position, creating a smooth "video" that's actually just an image
sequence — the same technique behind most high-end Awwwards-style
product pages. `ScrollyCanvas.tsx` handles the scroll → frame-index
mapping and drawing; `Overlay.tsx` handles the parallax headline text
that drifts center → left → right as you scroll through it.

The current frames are **procedurally generated** (a constellation of
nodes assembling into a connected network, matching the site's color
palette) via `tools/generate_sequence.py` — no photo needed. Regenerate
or tweak it with:

```bash
pip install pillow numpy
python3 tools/generate_sequence.py
```

**Want to use your own photo instead?** Generate a cinematic animated
portrait (e.g. with an AI image/video tool of your choice), export it as
a frame sequence, convert to WebP, and drop the files into
`frontend/public/sequence/` named `frame-001.webp` through
`frame-064.webp` (or update `FRAME_COUNT` in `ScrollyCanvas.tsx` to match
your frame count). No other code changes needed — the component just
reads whatever's in that folder.

## Run it locally

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # edit if you want Postgres now, or leave as-is to use SQLite
uvicorn main:app --reload
```

The API boots on `http://127.0.0.1:8000` and seeds itself automatically on
first run (idempotent — safe to restart). Visit `/docs` for interactive
API docs.

By default, with no `DATABASE_URL` set, it uses a local SQLite file
(`local.db`) so you can run it instantly. To use Postgres locally, set
`DATABASE_URL` in `.env` to a connection string from any provider (Neon,
Supabase, Railway, or a local Postgres install) — SQLAlchemy handles the
rest, no code changes needed.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`. It talks to the backend at
`http://127.0.0.1:8000` by default — see **Environment variables** below
to point it elsewhere.

## Environment variables

**Backend** (`backend/.env`, copy from `.env.example`):
- `DATABASE_URL` — Postgres connection string. Omit for SQLite.
- `FRONTEND_ORIGINS` — comma-separated list of origins allowed to call the
  API (CORS). Include your deployed frontend's URL here once you deploy.

**Frontend** (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL` — your backend's base URL. Defaults to
  `http://127.0.0.1:8000` if unset.

## Deploying

A practical, free-tier-friendly setup:

1. **Database** — create a free Postgres instance on
   [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy the
   connection string.
2. **Backend** — deploy `backend/` to [Render](https://render.com) (or
   Railway) as a Python web service.
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Set `DATABASE_URL` to the Postgres string from step 1.
   - Set `FRONTEND_ORIGINS` to your Vercel URL once you have it (step 3) —
     you can come back and update this after deploying the frontend.
3. **Frontend** — deploy `frontend/` to [Vercel](https://vercel.com).
   - Set `NEXT_PUBLIC_API_URL` to your Render backend's URL.
   - Redeploy the backend (or just update its env var) with
     `FRONTEND_ORIGINS` pointing at your final `*.vercel.app` URL so CORS
     allows it.

The very first request to a fresh database seeds it automatically — no
manual migration step required.

## Notes on content

`backend/data.py` is the entire question bank in one place — categories
and questions as plain Python data, no migrations needed to edit content.
Add a question by appending a `dict(...)` entry; add a category by adding
to `CATEGORIES` and using its `slug` on new questions. Delete `local.db`
(or your Postgres tables) and restart the server to reseed from scratch.
