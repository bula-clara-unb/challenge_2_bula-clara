"""Recuperação (o "R" do RAG).

Backend principal: embeddings multilíngues + ChromaDB persistente.
Backend reserva: TF-IDF (scikit-learn) — usado nos testes ou se não houver sentence-transformers/chromadb.
Escolha com BULA_RECUPERADOR=chroma|tfidf (padrão: chroma se instalado).
"""
import os

from . import config
from .ingestao import carregar_chunks
from .secoes import normalizar


class RecuperadorTFIDF:
    def __init__(self, chunks: list[dict]):
        from sklearn.feature_extraction.text import TfidfVectorizer
        self.chunks = chunks
        self.vec = TfidfVectorizer(preprocessor=normalizar, ngram_range=(1, 2), sublinear_tf=True)
        self.matriz = self.vec.fit_transform([f"{c['medicamento']} {c['secao_nome']} {c['texto']}" for c in chunks])

    def buscar(self, pergunta, k=config.TOP_K, medicamentos=None, secoes=None):
        sims = (self.matriz @ self.vec.transform([pergunta]).T).toarray().ravel()
        ordem = sims.argsort()[::-1]
        res = []
        for i in ordem:
            c = self.chunks[i]
            if medicamentos and c["medicamento"] not in medicamentos:
                continue
            if secoes and c["secao"] not in secoes:
                continue
            res.append({**c, "score": float(sims[i])})
            if len(res) >= k:
                break
        return res


class RecuperadorChroma:
    COLECAO = "bulas"

    def __init__(self, chunks: list[dict] | None = None, reconstruir=False):
        import chromadb
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
        cliente = chromadb.PersistentClient(path=str(config.PASTA_INDICE))
        fe = SentenceTransformerEmbeddingFunction(model_name=config.MODELO_EMBEDDING)
        if reconstruir:
            try:
                cliente.delete_collection(self.COLECAO)
            except Exception:
                pass
        self.col = cliente.get_or_create_collection(self.COLECAO, embedding_function=fe,
                                                    metadata={"hnsw:space": "cosine"})
        if self.col.count() == 0:
            chunks = chunks or carregar_chunks()
            for i in range(0, len(chunks), 256):
                lote = chunks[i:i + 256]
                self.col.add(
                    ids=[c["id"] for c in lote],
                    documents=[c["texto"] for c in lote],
                    metadatas=[{k: c[k] for k in ("medicamento", "secao", "secao_nome", "fonte")} for c in lote],
                )
            print(f"Índice criado com {self.col.count()} chunks em {config.PASTA_INDICE}")

    def buscar(self, pergunta, k=config.TOP_K, medicamentos=None, secoes=None):
        filtros = []
        if medicamentos:
            filtros.append({"medicamento": {"$in": list(medicamentos)}})
        if secoes:
            filtros.append({"secao": {"$in": list(secoes)}})
        where = None if not filtros else filtros[0] if len(filtros) == 1 else {"$and": filtros}
        r = self.col.query(query_texts=[pergunta], n_results=k, where=where)
        return [
            {"id": i, "texto": d, **m, "score": 1 - dist}
            for i, d, m, dist in zip(r["ids"][0], r["documents"][0], r["metadatas"][0], r["distances"][0])
        ]


def criar_recuperador(chunks: list[dict] | None = None, reconstruir=False):
    tipo = os.getenv("BULA_RECUPERADOR", "chroma")
    if tipo == "chroma":
        try:
            return RecuperadorChroma(chunks, reconstruir)
        except ImportError:
            print("chromadb/sentence-transformers não instalados — usando TF-IDF.")
    return RecuperadorTFIDF(chunks or carregar_chunks())


if __name__ == "__main__":   # python -m bula_clara.recuperador  -> (re)constrói o índice
    criar_recuperador(reconstruir=True)
