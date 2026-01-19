from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# Test embedding to get dimension
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="test"
)

print(f"Embedding dimension: {len(result.embeddings[0].values)}")
