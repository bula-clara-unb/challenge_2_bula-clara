"""Recuperação (o "R" do RAG).

Backend principal: embeddings multilíngues + ChromaDB persistente.
Backend reserva: TF-IDF (scikit-learn) — usado nos testes ou se não houver sentence-transformers/chromadb.
Escolha com BULA_RECUPERADOR=chroma|tfidf (padrão: chroma se instalado).
"""
import os
from contextlib import suppress

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

    def __init__(self, chunks: list[dict] | None = None, reconstruir=False, pasta_indice=None, embedding_function=None):
        import chromadb
        from chromadb.utils.embedding_functions import (
            SentenceTransformerEmbeddingFunction,
        )
        pasta = pasta_indice or config.PASTA_INDICE
        self.cliente = chromadb.PersistentClient(path=str(pasta))
        self.fe = embedding_function or SentenceTransformerEmbeddingFunction(model_name=config.MODELO_EMBEDDING)
        if reconstruir:
            with suppress(Exception):
                self.cliente.delete_collection(self.COLECAO)
        self.col = self.cliente.get_or_create_collection(
            self.COLECAO, embedding_function=self.fe, metadata={"hnsw:space": "cosine"}
        )
        if self.col.count() == 0:
            chunks = chunks if chunks is not None else carregar_chunks()
            if chunks:
                for i in range(0, len(chunks), 256):
                    lote = chunks[i:i + 256]
                    self.col.add(
                        ids=[c["id"] for c in lote],
                        documents=[c["texto"] for c in lote],
                        metadatas=[self._metadata_chunk(c) for c in lote],
                    )
                print(f"Índice criado com {self.col.count()} chunks em {pasta}")

    @staticmethod
    def _metadata_chunk(c: dict) -> dict:
        meta = {k: c[k] for k in ("medicamento", "secao", "secao_nome", "fonte")}
        for extra in ("fabricante", "versao_bula"):
            if c.get(extra) is not None:
                meta[extra] = c[extra]
        return meta

    def remover_fontes(self, fontes: list[str]) -> int:
        unicas = list(dict.fromkeys(fontes))
        for fonte in unicas:
            self.col.delete(where={"fonte": fonte})
        return len(unicas)

    def upsert_chunks(self, chunks: list[dict]) -> int:
        for i in range(0, len(chunks), 256):
            lote = chunks[i:i + 256]
            self.col.upsert(
                ids=[c["id"] for c in lote],
                documents=[c["texto"] for c in lote],
                metadatas=[self._metadata_chunk(c) for c in lote],
            )
        return len(chunks)

    def sincronizar_incremental(
        self,
        chunks_novos: list[dict],
        fontes_removidas: list[str],
        fontes_alteradas: list[str],
        reconstrucao_total: bool = False,
    ) -> dict:
        removidas_ou_alteradas = list(dict.fromkeys([*fontes_removidas, *fontes_alteradas]))
        if reconstrucao_total:
            with suppress(Exception):
                self.cliente.delete_collection(self.COLECAO)
            self.col = self.cliente.get_or_create_collection(
                self.COLECAO, embedding_function=self.fe, metadata={"hnsw:space": "cosine"}
            )
            if chunks_novos:
                self.upsert_chunks(chunks_novos)
        else:
            if removidas_ou_alteradas:
                self.remover_fontes(removidas_ou_alteradas)
            if chunks_novos:
                self.upsert_chunks(chunks_novos)
        return {
            "status": "reconstruido" if reconstrucao_total else "atualizado",
            "fontes_removidas": len(removidas_ou_alteradas),
            "chunks_gravados": len(chunks_novos),
            "total_indice": self.col.count(),
        }

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
