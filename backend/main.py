import os
import random

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session

import models
import schemas
from data import CATEGORIES, QUESTIONS
from python_topics_data import PYTHON_CATEGORIES, PYTHON_QUESTIONS
from database import Base, SessionLocal, engine, get_db

ALL_CATEGORIES = CATEGORIES + PYTHON_CATEGORIES
ALL_QUESTIONS = QUESTIONS + PYTHON_QUESTIONS

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Interview Prep API", version="1.0.0")

# Comma-separated list of allowed origins, e.g. "http://localhost:3000,https://yourapp.vercel.app"
origins_env = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000")
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Seeding — idempotent, runs once on startup if the DB is empty
# ---------------------------------------------------------------------------
def seed_if_empty():
    db: Session = SessionLocal()
    try:
        if db.query(models.Category).count() > 0:
            return

        slug_to_category = {}
        for cat in ALL_CATEGORIES:
            row = models.Category(
                slug=cat["slug"],
                name=cat["name"],
                code=cat["code"],
                description=cat["description"],
            )
            db.add(row)
            db.flush()  # get row.id without committing
            slug_to_category[cat["slug"]] = row

        for q in ALL_QUESTIONS:
            category = slug_to_category.get(q["category"])
            if not category:
                continue
            db.add(
                models.Question(
                    category_id=category.id,
                    question=q["question"],
                    answer=q["answer"],
                    deep_dive=q.get("deep_dive", ""),
                    difficulty=q.get("difficulty", "Intermediate"),
                    frequency=q.get("frequency", 3),
                    tags=",".join(q.get("tags", [])),
                )
            )

        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_if_empty()


# ---------------------------------------------------------------------------
# Serialization helpers
# ---------------------------------------------------------------------------
def serialize_question(q: models.Question) -> schemas.QuestionOut:
    return schemas.QuestionOut(
        id=q.id,
        category=q.category_rel.name if q.category_rel else "",
        category_slug=q.category_rel.slug if q.category_rel else "",
        question=q.question,
        answer=q.answer,
        deep_dive=q.deep_dive or "",
        difficulty=q.difficulty,
        frequency=q.frequency,
        tags=[t for t in (q.tags or "").split(",") if t],
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "service": "AI Interview Prep API"}


@app.get("/categories", response_model=list[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(models.Category).order_by(models.Category.name).all()
    out = []
    for c in cats:
        out.append(
            schemas.CategoryOut(
                id=c.id,
                slug=c.slug,
                name=c.name,
                description=c.description or "",
                code=c.code or "",
                question_count=len(c.questions),
            )
        )
    return out


@app.get("/questions", response_model=list[schemas.QuestionOut])
def get_questions(
    category: str | None = Query(default=None, description="Category slug"),
    difficulty: str | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=30, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    q = db.query(models.Question).join(models.Category)

    if category:
        q = q.filter(models.Category.slug == category)
    if difficulty:
        q = q.filter(models.Question.difficulty == difficulty)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                models.Question.question.ilike(like),
                models.Question.answer.ilike(like),
                models.Question.tags.ilike(like),
            )
        )

    results = q.order_by(models.Question.id).offset(offset).limit(limit).all()
    return [serialize_question(r) for r in results]


@app.get("/questions/{question_id}", response_model=schemas.QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return serialize_question(q)


@app.get("/questions-count")
def count_questions(
    category: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Question).join(models.Category)
    if category:
        q = q.filter(models.Category.slug == category)
    if difficulty:
        q = q.filter(models.Question.difficulty == difficulty)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                models.Question.question.ilike(like),
                models.Question.answer.ilike(like),
                models.Question.tags.ilike(like),
            )
        )
    return {"count": q.count()}


@app.get("/search", response_model=list[schemas.QuestionOut])
def search_questions(q: str = Query(default="", min_length=0), db: Session = Depends(get_db)):
    if not q:
        return []
    like = f"%{q}%"
    results = (
        db.query(models.Question)
        .join(models.Category)
        .filter(
            or_(
                models.Question.question.ilike(like),
                models.Question.answer.ilike(like),
                models.Question.tags.ilike(like),
                models.Category.name.ilike(like),
            )
        )
        .order_by(models.Question.id)
        .all()
    )
    return [serialize_question(r) for r in results]


@app.get("/practice", response_model=list[schemas.QuestionOut])
def get_practice_set(
    category: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    count: int = Query(default=15, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(models.Question).join(models.Category)
    if category:
        q = q.filter(models.Category.slug == category)
    if difficulty:
        q = q.filter(models.Question.difficulty == difficulty)

    results = q.all()
    random.shuffle(results)
    return [serialize_question(r) for r in results[:count]]


@app.get("/stats", response_model=schemas.StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total_questions = db.query(models.Question).count()
    total_categories = db.query(models.Category).count()

    by_difficulty = {}
    for diff in ("Beginner", "Intermediate", "Advanced"):
        by_difficulty[diff] = (
            db.query(models.Question).filter(models.Question.difficulty == diff).count()
        )

    return schemas.StatsOut(
        total_questions=total_questions,
        total_categories=total_categories,
        by_difficulty=by_difficulty,
    )
