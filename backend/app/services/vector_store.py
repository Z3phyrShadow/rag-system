from abc import ABC, abstractmethod
from typing import List

from app.schema import DocumentChunk, SearchResult


class VectorStore(ABC):
    @abstractmethod
    def add(self, chunks: List[DocumentChunk]) -> None:
        pass

    @abstractmethod
    def search(
        self, query_vector: list[float], top_k: int
    ) -> List[SearchResult]:
        pass

    @abstractmethod
    def persist(self) -> None:
        pass

    @abstractmethod
    def load(self) -> None:
        pass
