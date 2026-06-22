import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Set DATABASE_URL in your environment (or .env file) to point at Postgres, e.g.
#   postgresql://user:password@host:5432/dbname
# If it's not set, we fall back to a local SQLite file so the project still
# runs instantly with zero setup.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local.db")

# Some hosts (Render, Heroku, Railway) hand out URLs starting with
# "postgres://", but SQLAlchemy 2.x requires the "postgresql://" scheme.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# We install the psycopg3 driver (see requirements.txt — it ships proper
# binary wheels on Windows/Mac/Linux, unlike psycopg2-binary, which often
# fails to build on newer Python versions without a C compiler installed).
# SQLAlchemy needs to be told explicitly to use it via "+psycopg".
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
