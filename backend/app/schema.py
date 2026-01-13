from pydantic import BaseModel
from typing import List


class DocumentChunk(BaseModel):
    id: str
    text: str
    source: str
    token_count: int


class SearchResult(BaseModel):
    id: str
    text: str
    source: str
    score: float


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class QueryResponse(BaseModel):
    answer: str
    sources: List[SearchResult]
