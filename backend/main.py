from fastapi import FastAPI
from database import Base, engine, SessionLocal
from models import Category, Question
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS (IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ---------------- SEED DATA ----------------
def seed_data():
    db = SessionLocal()

    if db.query(Category).count() == 0:
        db.add_all([
            Category(name="Python"),
            Category(name="SQL"),
            Category(name="Statistics"),
            Category(name="NumPy"),
            Category(name="Pandas"),
            Category(name="Machine Learning"),
            Category(name="Deep Learning"),
            Category(name="NLP"),
            Category(name="Computer Vision"),
            Category(name="ML Ops"),
            Category(name="System_Design")
        ])

    if db.query(Question).count() == 0:
        db.add_all([
            Question(
                category="Machine Learning",
                question="What is overfitting?",
                answer="Model learns noise instead of patterns."
            ),
            Question(
                category="Machine Learning",
                question="What is bias-variance tradeoff?",
                answer="Balance between model complexity and generalization."
            ),
            Question(
                category="Python",
                question="What is a decorator?",
                answer="A function that modifies another function."
            )
        ])

    db.commit()
    db.close()


@app.on_event("startup")
def startup():
    seed_data()


# ---------------- API ----------------

@app.get("/categories")
def get_categories():
    db = SessionLocal()
    cats = db.query(Category).all()
    db.close()
    return [c.name for c in cats]


@app.get("/questions")
def get_questions(category: str):
    db = SessionLocal()
    qs = db.query(Question).filter(Question.category == category).all()
    db.close()

    return [
        {
            "question": q.question,
            "answer": q.answer
        }
        for q in qs
    ]

@app.get("/search")
def search_questions(q: str):
    db = SessionLocal()

    results = db.query(Question).filter(
        Question.question.contains(q)
    ).all()

    db.close()

    return [
        {
            "question": r.question,
            "answer": r.answer
        }
        for r in results
    ]