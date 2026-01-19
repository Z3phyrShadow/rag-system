from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
import shutil
from typing import List

from app.config import settings
from app.schema import (
    QuizGenerationRequest,
    QuizGenerationResponse,
    JeopardyQuestion,
    UploadResponse,
    MetricsResponse,
)
from app.services.ingestion import ingest_file
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore
from app.services.generation import QuizGenerator
from app.services.retrieval import RetrievalService
from app.services.metrics import MetricsTracker

# Initialize FastAPI app
app = FastAPI(title="RAG Jeopardy Quiz API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
embedding_service = EmbeddingService()
vector_store = VectorStore(
    dim=settings.EMBEDDING_DIMENSION,  # Gemini text-embedding-004 dimension (768)
    storage_dir=settings.STORAGE_PATH,
    index_name="quiz_documents"
)
retrieval_service = RetrievalService(vector_store)
quiz_generator = QuizGenerator()
metrics_tracker = MetricsTracker()

# Ensure upload directory exists
UPLOAD_DIR = settings.BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {
        "message": "RAG Jeopardy Quiz API",
        "endpoints": {
            "upload": "POST /upload - Upload documents (PDF, TXT, MD)",
            "generate_quiz": "POST /generate-quiz - Generate Jeopardy questions",
            "metrics": "GET /metrics - Get performance comparison data",
        }
    }


@app.post("/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Upload and process documents (PDF, TXT, MD files).
    Documents are chunked and embedded into the vector store.
    """
    try:
        processed_files = []
        all_chunks = []
        
        for file in files:
            # Save uploaded file
            file_path = UPLOAD_DIR / file.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Ingest and chunk the file
            chunks = ingest_file(file_path)
            all_chunks.extend(chunks)
            processed_files.append(file.filename)
        
        # Generate embeddings
        texts = [chunk.text for chunk in all_chunks]
        embeddings = embedding_service.embed_texts(texts)
        
        # Store in vector database
        metadatas = [
            {
                "id": chunk.id,
                "text": chunk.text,
                "source": chunk.source,
                "token_count": chunk.token_count
            }
            for chunk in all_chunks
        ]
        vector_store.add(embeddings, metadatas)
        vector_store.save()
        
        return UploadResponse(
            success=True,
            message=f"Successfully processed {len(files)} file(s)",
            num_chunks=len(all_chunks),
            files_processed=processed_files
        )
    
    except Exception as e:
        import traceback
        error_detail = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # Log to console
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/generate-quiz", response_model=QuizGenerationResponse)
async def generate_quiz(request: QuizGenerationRequest):
    """
    Generate Jeopardy-style quiz questions.
    If use_rag=True, retrieves relevant context from uploaded documents.
    If use_rag=False, generates questions without specific context.
    """
    try:
        if request.use_rag:
            # Retrieve context from vector store
            retrieval_result = retrieval_service.retrieve_context(
                request.topic, 
                top_k=5
            )
            context = retrieval_result["context"]
            
            # Generate quiz with RAG
            result = quiz_generator.generate_with_rag(
                context=context,
                num_questions=request.num_questions
            )
        else:
            # Generate quiz without RAG
            result = quiz_generator.generate_without_rag(
                topic=request.topic,
                num_questions=request.num_questions
            )
        
        # Track metrics
        metrics_tracker.add_metric(result["metrics"])
        
        # Parse questions JSON
        questions_data = json.loads(result["questions"])
        questions = [JeopardyQuestion(**q) for q in questions_data]
        
        return QuizGenerationResponse(
            questions=questions,
            metrics=result["metrics"]
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error parsing quiz questions: {str(e)}. Raw response: {result.get('questions', '')}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")


@app.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """
    Get performance comparison metrics between RAG and non-RAG methods.
    Returns aggregated statistics for visualization.
    """
    try:
        comparison = metrics_tracker.get_comparison()
        return MetricsResponse(**comparison)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")


@app.delete("/metrics")
async def clear_metrics():
    """Clear all stored metrics"""
    metrics_tracker.clear()
    return {"message": "Metrics cleared successfully"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "vector_store_size": vector_store.index.ntotal if hasattr(vector_store.index, 'ntotal') else 0
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
