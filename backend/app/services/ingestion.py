from pathlib import Path
import markdown
from bs4 import BeautifulSoup
import tiktoken

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


def ingest_docs():
    docs_path = Path(settings.DOCS_PATH)
    all_chunks = []

    for file in docs_path.rglob("*.md"):
        raw = file.read_text(encoding="utf-8")

        html = markdown.markdown(raw)
        soup = BeautifulSoup(html, "html.parser")
        clean_text = soup.get_text(separator="\n")

        for i, (chunk, token_count) in enumerate(chunk_text(clean_text)):
            all_chunks.append(
                DocumentChunk(
                    id=f"{file.stem}_{i}",
                    text=chunk,
                    source=str(file),
                    token_count=token_count,
                )
            )

    return all_chunks
