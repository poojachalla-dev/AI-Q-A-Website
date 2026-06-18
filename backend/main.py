from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Interview API Running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/categories")
def get_categories():
    return [
        "Python",
        "SQL",
        "Statistics",
        "NumPy",
        "Pandas",
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Computer Vision",
        "ML Ops",
        "System Design"   
    ]