from sqlalchemy import Column, Integer, String
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    question = Column(String)
    answer = Column(String)