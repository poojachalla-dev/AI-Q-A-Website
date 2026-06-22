from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, default="")
    code = Column(String, default="")  # short spec-sheet style label, e.g. "ML", "NLP"

    questions = relationship(
        "Question", back_populates="category_rel", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)

    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    deep_dive = Column(Text, default="")  # longer explanation, shown on demand

    difficulty = Column(String, default="Intermediate")  # Beginner / Intermediate / Advanced
    frequency = Column(Integer, default=3)  # 1-5, how often this tends to come up
    tags = Column(String, default="")  # comma-separated

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category_rel = relationship("Category", back_populates="questions")
