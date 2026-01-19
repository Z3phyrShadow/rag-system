from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DOCS_PATH: Path = BASE_DIR.parent / "docs"
    STORAGE_PATH: Path = BASE_DIR / "storage"

    # Chunking
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100

    # Embeddings
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIMENSION: int = 3072  # Gemini embedding-001 dimension

    # API Keys
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # LLM Settings
    GEMINI_MODEL: str = "gemini-2.5-flash"
    TEMPERATURE: float = 0.7

    class Config:
        env_file = ".env"

settings = Settings()
