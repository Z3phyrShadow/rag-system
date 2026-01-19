# 🎓 RAG Jeopardy Quiz System

A full-stack AI-powered quiz generation system that demonstrates the power of Retrieval Augmented Generation (RAG) with comprehensive performance metrics. Built as a portfolio project showcasing both ML/AI capabilities and production engineering skills.

## ✨ Features

- **📚 Document Ingestion**: Upload PDFs, text files, or markdown documents
- **🎯 Jeopardy-Style Quiz Generation**: AI-generated questions in classic Jeopardy format
- **⚡ RAG vs Non-RAG Comparison**: Side-by-side performance analysis
- **📊 Real-time Metrics Dashboard**: Interactive charts showing:
  - Token usage comparison
  - Response time analysis
  - Token breakdown (prompt vs completion)
  - Method distribution
- **🎨 Modern UI**: Dark mode with glassmorphism effects and smooth animations
- **🔍 Vector Search**: FAISS-powered semantic search for context retrieval

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │  FastAPI Backend │ ◄─────► │  Gemini AI API  │
│   (Vite + UI)   │         │   (Python 3.11+) │         │  (LLM Provider) │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  FAISS Vector DB │
                            │  (Embeddings)    │
                            └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- OpenAI API key (for embeddings) ([Get one here](https://platform.openai.com/api-keys))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using uv (or pip):
```bash
uv sync
# OR
pip install -e .
```

3. Create a `.env` file with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage Guide

### 1. Upload Documents

- Navigate to the **Upload** tab
- Drag and drop PDF, TXT, or MD files
- Wait for processing to complete
- Documents are chunked and embedded into the vector database

### 2. Generate Quiz

- Navigate to the **Quiz** tab
- Enter a topic or query (e.g., "Ancient Rome", "Machine Learning")
- Choose number of questions (1-10)
- Toggle **Use RAG** to compare:
  - **RAG ON**: Uses uploaded documents as context
  - **RAG OFF**: Generates questions from general knowledge
- Click **Generate Quiz**

### 3. Play the Quiz

- Click on any dollar amount to reveal the question
- Read the Jeopardy-style clue
- View the answer in the modal
- Revealed questions are grayed out

### 4. View Metrics

- Navigate to the **Metrics** tab
- View comprehensive performance comparisons:
  - Token usage (RAG vs Non-RAG)
  - Response times
  - Token breakdown
  - Detailed statistics

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Google Gemini AI**: LLM for quiz generation
- **OpenAI Embeddings**: Text embedding model
- **FAISS**: Vector similarity search
- **PyPDF**: PDF text extraction
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Chart.js**: Data visualization
- **React Dropzone**: File upload
- **Axios**: HTTP client

## 📊 API Endpoints

### `POST /upload`
Upload and process documents
```json
{
  "files": ["file1.pdf", "file2.txt"]
}
```

### `POST /generate-quiz`
Generate Jeopardy questions
```json
{
  "topic": "Ancient Rome",
  "num_questions": 5,
  "use_rag": true
}
```

### `GET /metrics`
Retrieve performance metrics
```json
{
  "rag": { "avg_tokens": 1234, "avg_time": 2.5 },
  "no_rag": { "avg_tokens": 890, "avg_time": 1.8 },
  "comparison": { "token_difference": 344 }
}
```

## 🎯 Portfolio Highlights

This project demonstrates:

1. **RAG Implementation**: Practical application of retrieval augmented generation
2. **Vector Databases**: FAISS integration for semantic search
3. **LLM Integration**: Gemini API with structured output parsing
4. **Performance Monitoring**: Token tracking and latency measurement
5. **Full-Stack Development**: React + FastAPI integration
6. **Modern UI/UX**: Responsive design with animations
7. **Data Visualization**: Chart.js for metrics dashboards
8. **Production Practices**: Environment variables, error handling, CORS

## 🔧 Configuration

### Backend (`backend/app/config.py`)
```python
CHUNK_SIZE = 500          # Token chunk size
CHUNK_OVERLAP = 100       # Overlap between chunks
EMBEDDING_MODEL = "text-embedding-3-small"
GEMINI_MODEL = "gemini-1.5-flash"
TEMPERATURE = 0.7         # LLM creativity (0-1)
```

### Frontend
API endpoint is configured in component files. Update if backend runs on different port.

## 📝 Example Documents

Create sample documents in the `docs/` directory:

**docs/ancient_rome.md**:
```markdown
# Ancient Rome

Rome was founded in 753 BCE and became one of the greatest empires...
```

**Or upload your own PDFs!**

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.11+)
- Verify API keys in `.env` file
- Install dependencies: `uv sync` or `pip install -e .`

### Frontend won't connect
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`
- Verify fetch URLs in frontend components

### Quiz generation fails
- Check Gemini API key is valid
- Ensure documents are uploaded first (for RAG mode)
- Check backend logs for detailed errors

## 📄 License

MIT License - feel free to use this project for your portfolio!

## 🙏 Acknowledgments

- Google Gemini for LLM capabilities
- OpenAI for embedding models
- FAISS for vector search
- FastAPI and React communities

---

**Built with ❤️ as a portfolio project demonstrating RAG systems and production ML engineering**
