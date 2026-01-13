from app.services.ingestion import ingest_docs

if __name__ == "__main__":
    chunks = ingest_docs()
    print(f"Total chunks: {len(chunks)}")

    if chunks:
        print("Sample chunk:")
        print(chunks[0])
