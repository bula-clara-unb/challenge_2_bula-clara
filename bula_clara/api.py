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


# ---------------- Semana 4: multimodal ----------------
from fastapi import File, Form, UploadFile  # noqa: E402
from fastapi.responses import FileResponse  # noqa: E402

from .assistente import AssistenteMultimodal  # noqa: E402


@lru_cache
def assistente() -> AssistenteMultimodal:
    return AssistenteMultimodal(orq())


@app.post("/perguntar-multimodal")
async def perguntar_multimodal(pergunta: str = Form(""), medicamentos_em_uso: str = Form(""),
                               imagem: UploadFile | None = File(None), audio: UploadFile | None = File(None)):
    """Foto da caixa e/ou áudio da pergunta (multipart/form-data). Remédios em uso separados por vírgula."""
    em_uso = [m.strip() for m in medicamentos_em_uso.split(",") if m.strip()]
    return assistente().responder(
        pergunta=pergunta or None,
        imagem=await imagem.read() if imagem else None,
        audio=await audio.read() if audio else None,
        medicamentos_em_uso=em_uso,
    )


class Texto(BaseModel):
    texto: str


@app.post("/falar")
def falar(t: Texto):
    """Converte uma resposta em áudio (mp3) para ser tocado ao usuário."""
    from .multimodal.voz import falar as gerar_audio
    caminho = gerar_audio(t.texto)
    return FileResponse(caminho, media_type="audio/mpeg", filename="resposta.mp3")
