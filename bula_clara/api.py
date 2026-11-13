"""API HTTP.  Rodar:  uvicorn bula_clara.api:app --reload   ->  http://localhost:8000/docs"""
from functools import lru_cache

from fastapi import FastAPI
from pydantic import BaseModel

from .agentes import Orquestrador

app = FastAPI(title="Bula Clara", description="Assistente multiagente que explica bulas da ANVISA")


@lru_cache
def orq() -> Orquestrador:
    return Orquestrador()


class Pergunta(BaseModel):
    pergunta: str
    medicamentos_em_uso: list[str] = []
    modo: str = "multiagente"   # llm | rag | multiagente


@app.get("/saude")
def saude():
    return {"ok": True, "llm": orq().llm.nome}


@app.get("/medicamentos")
def medicamentos():
    return sorted({c["medicamento"] for c in orq().chunks})


@app.post("/perguntar")
def perguntar(p: Pergunta):
    return orq().responder(p.pergunta, p.medicamentos_em_uso, p.modo)
