from typing import List, Dict, Any
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore
from app.config import settings


class RetrievalService:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.embedding_service = EmbeddingService()
    
    def retrieve_context(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Retrieve relevant context for a query.
        Returns both the concatenated context and individual chunks with scores.
        """
        # Generate query embedding
        query_embedding = self.embedding_service.embed_texts([query])[0]
        
        # Search vector store
        results = self.vector_store.search(query_embedding, k=top_k)
        
        # Concatenate context
        context_parts = []
        for result in results:
            context_parts.append(result.get("text", ""))
        
        context = "\n\n".join(context_parts)
        
        return {
            "context": context,
            "chunks": results,
            "num_chunks": len(results)
        }
