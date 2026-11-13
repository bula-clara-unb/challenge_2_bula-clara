"""Testes sem baixar modelo nenhum (LLM mock + TF-IDF + bulas fictícias).  Rodar:  pytest -q"""
import os
from pathlib import Path

import pytest

os.environ["BULA_RECUPERADOR"] = "tfidf"

from bula_clara import ingestao  # noqa: E402
from bula_clara.agentes import Orquestrador  # noqa: E402
from bula_clara.llm import LLMMock  # noqa: E402
from bula_clara.secoes import dividir_em_secoes  # noqa: E402

FIX = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def orq(tmp_path_factory):
    saida = tmp_path_factory.mktemp("d") / "chunks.jsonl"
    chunks = ingestao.main(FIX, saida)
    return Orquestrador(llm=LLMMock(), chunks=chunks)


def test_secoes_reconhecidas():
    s = dividir_em_secoes((FIX / "varfarina.txt").read_text(encoding="utf-8"))
    assert len(s) == 9
    assert not s["precaucoes_interacoes"].upper().startswith("MEDICAMENTO")   # título quebrado tratado


def test_identifica_com_erro_de_digitacao(orq):
    r = orq.responder("losartan da tontura?")
    assert r["medicamentos"] == ["losartana"]


def test_recupera_secao_certa_e_cita(orq):
    r = orq.responder("Para que serve a varfarina?")
    assert r["trechos"][0]["medicamento"] == "varfarina"
    assert r["trechos"][0]["secao"] == "indicacao"
    assert "[1]" in r["resposta"] and "Fontes" in r["resposta"]


def test_interacao_detectada(orq):
    r = orq.responder("Posso tomar ibuprofeno junto com varfarina?")
    pares = {(i["bula_de"], i["menciona"]) for i in r["interacoes"]}
    assert ("varfarina", "ibuprofeno") in pares
    assert "interação" in r["resposta"]


def test_interacao_com_medicamento_em_uso(orq):
    r = orq.responder("Para que serve o ibuprofeno?", medicamentos_em_uso=["losartana"])
    assert any(i["bula_de"] == "losartana" for i in r["interacoes"])


def test_sem_interacao(orq):
    assert not orq.interacoes.existe_interacao("paracetamol", "losartana")


def test_emergencia_bloqueia_antes_do_llm(orq):
    r = orq.responder("meu filho engoliu a cartela de paracetamol")
    assert r["bloqueada"] and "192" in r["resposta"]
    assert all(p["agente"] != "simplificador" for p in r["trace"])


def test_alteracao_de_dose_gera_alerta(orq):
    r = orq.responder("Posso dobrar a dose de losartana?")
    assert r["categoria_risco"] == "alteracao_dose"
    assert "médico" in r["resposta"]


def test_medicamento_fora_da_base(orq):
    r = orq.responder("Para que serve o remedioinexistente?")
    assert r["medicamentos"] == [] and r["trechos"] == []
    assert "identificar o medicamento" in r["resposta"]


def test_modos_de_comparacao(orq):
    assert orq.responder("Para que serve a varfarina?", modo="llm")["trechos"] == []
    assert orq.responder("Para que serve a varfarina?", modo="rag")["trechos"]
