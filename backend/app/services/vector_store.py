from typing import List, Dict, Any
import faiss
import json
from pathlib import Path
import numpy as np


class VectorStore:
    def __init__(
        self,
        dim: int,
        storage_dir: Path,
        index_name: str = "documents",
    ):
        self.dim = dim
        self.storage_dir = storage_dir
        self.index_path = storage_dir / f"{index_name}.faiss"
        self.meta_path = storage_dir / f"{index_name}.json"

        self.storage_dir.mkdir(parents=True, exist_ok=True)

        if self.index_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            self.metadata = self._load_metadata()
        else:
            self.index = faiss.IndexFlatL2(dim)
            self.metadata: List[Dict[str, Any]] = []

    def add(self, embeddings: List[List[float]], metadatas: List[Dict[str, Any]]):
        vectors = np.array(embeddings).astype("float32")
        self.index.add(vectors)
        self.metadata.extend(metadatas)

    def save(self):
        faiss.write_index(self.index, str(self.index_path))
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)

    def search(self, query_embedding: List[float], k: int = 5):
        vector = np.array([query_embedding]).astype("float32")
        distances, indices = self.index.search(vector, k)

        results = []
        for idx in indices[0]:
            if idx == -1:
                continue
            results.append(self.metadata[idx])

        return results

    def _load_metadata(self) -> List[Dict[str, Any]]:
        if not self.meta_path.exists():
            return []
        with open(self.meta_path, "r", encoding="utf-8") as f:
            return json.load(f)
