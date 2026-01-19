from pydantic import BaseModel
from typing import List, Optional, Dict, Any


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


# Quiz-specific schemas
class JeopardyQuestion(BaseModel):
    category: str
    points: int
    clue: str
    answer: str
    revealed: bool = False


class QuizGenerationRequest(BaseModel):
    topic: str
    num_questions: int = 5
    use_rag: bool = True


class QuizGenerationResponse(BaseModel):
    questions: List[JeopardyQuestion]
    metrics: Dict[str, Any]


class AnswerSubmission(BaseModel):
    question_id: int
    user_answer: str


class AnswerValidation(BaseModel):
    correct: bool
    expected_answer: str
    feedback: str


class UploadResponse(BaseModel):
    success: bool
    message: str
    num_chunks: int
    files_processed: List[str]


class MetricsResponse(BaseModel):
    rag: Dict[str, float]
    no_rag: Dict[str, float]
    comparison: Dict[str, float]
    total_generations: int
