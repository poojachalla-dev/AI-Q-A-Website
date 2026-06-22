from typing import List, Optional

from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: int
    slug: str
    name: str
    description: str = ""
    code: str = ""
    question_count: int = 0

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: int
    category: str
    category_slug: str
    question: str
    answer: str
    deep_dive: str = ""
    difficulty: str
    frequency: int
    tags: List[str] = []

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_questions: int
    total_categories: int
    by_difficulty: dict
