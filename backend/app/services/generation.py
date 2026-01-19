import time
from google import genai
from google.genai import types
from typing import List, Dict, Any
import tiktoken

from app.config import settings

# Create Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Token counter (using tiktoken as approximation for Gemini)
tokenizer = tiktoken.get_encoding("cl100k_base")


class QuizGenerator:
    def __init__(self):
        self.model = settings.GEMINI_MODEL
        
    def count_tokens(self, text: str) -> int:
        """Approximate token count for metrics"""
        return len(tokenizer.encode(text))
    
    def generate_with_rag(
        self, 
        context: str, 
        num_questions: int = 5
    ) -> Dict[str, Any]:
        """Generate Jeopardy questions using RAG (with retrieved context)"""
        start_time = time.time()
        
        prompt = f"""You are a Jeopardy quiz master. Based on the following context, create {num_questions} Jeopardy-style questions.

Context:
{context}

Requirements:
1. Format each question as a Jeopardy clue (statement form)
2. The answer should be phrased as a question (e.g., "What is...?" or "Who is...?")
3. Assign each question to a relevant category
4. Assign point values: 100, 200, 300, 400, or 500 based on difficulty
5. Make questions specific to the context provided

Return ONLY a JSON array with this exact format:
[
  {{
    "category": "Category Name",
    "points": 200,
    "clue": "This is the Jeopardy clue statement",
    "answer": "What is the correct answer?"
  }}
]

JSON array:"""

        prompt_tokens = self.count_tokens(prompt)
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=settings.TEMPERATURE,
            )
        )
        
        response_text = response.text.strip()
        # Clean up markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        completion_tokens = self.count_tokens(response_text)
        elapsed_time = time.time() - start_time
        
        return {
            "questions": response_text,
            "metrics": {
                "method": "rag",
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
                "time_seconds": elapsed_time,
                "context_length": len(context)
            }
        }
    
    def generate_without_rag(
        self, 
        topic: str, 
        num_questions: int = 5
    ) -> Dict[str, Any]:
        """Generate Jeopardy questions WITHOUT RAG (no specific context)"""
        start_time = time.time()
        
        prompt = f"""You are a Jeopardy quiz master. Create {num_questions} Jeopardy-style questions about: {topic}

Requirements:
1. Format each question as a Jeopardy clue (statement form)
2. The answer should be phrased as a question (e.g., "What is...?" or "Who is...?")
3. Assign each question to a relevant category
4. Assign point values: 100, 200, 300, 400, or 500 based on difficulty

Return ONLY a JSON array with this exact format:
[
  {{
    "category": "Category Name",
    "points": 200,
    "clue": "This is the Jeopardy clue statement",
    "answer": "What is the correct answer?"
  }}
]

JSON array:"""

        prompt_tokens = self.count_tokens(prompt)
        
        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=settings.TEMPERATURE,
            )
        )
        
        response_text = response.text.strip()
        # Clean up markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        completion_tokens = self.count_tokens(response_text)
        elapsed_time = time.time() - start_time
        
        return {
            "questions": response_text,
            "metrics": {
                "method": "no_rag",
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
                "time_seconds": elapsed_time,
                "context_length": 0
            }
        }
