from pathlib import Path
import markdown
from bs4 import BeautifulSoup
import tiktoken
from pypdf import PdfReader
from typing import List

from app.schema import DocumentChunk
from app.config import settings

tokenizer = tiktoken.get_encoding("cl100k_base")


def chunk_text(text: str):
    tokens = tokenizer.encode(text)
    chunks = []

    start = 0
    while start < len(tokens):
        end = start + settings.CHUNK_SIZE
        chunk_tokens = tokens[start:end]
        chunk_text = tokenizer.decode(chunk_tokens)

        chunks.append((chunk_text, len(chunk_tokens)))
        start += settings.CHUNK_SIZE - settings.CHUNK_OVERLAP

    return chunks


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract text from PDF file"""
    reader = PdfReader(pdf_path)
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text())
    return "\n\n".join(text_parts)


def ingest_file(file_path: Path) -> List[DocumentChunk]:
    """Ingest a single file (PDF or markdown) and return chunks"""
    all_chunks = []
    
    # Determine file type and extract text
    if file_path.suffix.lower() == ".pdf":
        clean_text = extract_text_from_pdf(file_path)
    elif file_path.suffix.lower() == ".md":
        raw = file_path.read_text(encoding="utf-8")
        html = markdown.markdown(raw)
        soup = BeautifulSoup(html, "html.parser")
        clean_text = soup.get_text(separator="\n")
    else:
        # Plain text file
        clean_text = file_path.read_text(encoding="utf-8")
    
    # Chunk the text
    for i, (chunk, token_count) in enumerate(chunk_text(clean_text)):
        all_chunks.append(
            DocumentChunk(
                id=f"{file_path.stem}_{i}",
                text=chunk,
                source=str(file_path),
                token_count=token_count,
            )
        )
    
    return all_chunks


def ingest_docs():
    """Ingest all documents from the docs directory"""
    docs_path = Path(settings.DOCS_PATH)
    all_chunks = []

    # Process markdown files
    for file in docs_path.rglob("*.md"):
        all_chunks.extend(ingest_file(file))
    
    # Process PDF files
    for file in docs_path.rglob("*.pdf"):
        all_chunks.extend(ingest_file(file))

    return all_chunks
