from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DOCS_PATH: Path = BASE_DIR.parent / "docs"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    EMBEDDING_MODEL: str = "text-embedding-3-small"


settings = Settings()
