from typing import List
from google import genai

from app.config import settings

# Create Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)


class EmbeddingService:
    def __init__(self):
        self.model = settings.EMBEDDING_MODEL

    def embed_texts(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generate embeddings for a list of texts using Gemini.
        Returns embeddings in the same order as input.
        """
        all_embeddings: List[List[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]

            # Generate embeddings for each text in the batch
            for text in batch:
                result = client.models.embed_content(
                    model=self.model,
                    contents=text  # Changed from 'content' to 'contents'
                )
                all_embeddings.append(result.embeddings[0].values)

        return all_embeddings