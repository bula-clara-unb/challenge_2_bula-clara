"""Testes da semana 4 (foto e voz). O teste com OCR real é pulado se o Tesseract não estiver instalado."""
import os
import shutil
from pathlib import Path

import pytest

os.environ["BULA_RECUPERADOR"] = "tfidf"

from bula_clara import ingestao  # noqa: E402
from bula_clara.agentes import Orquestrador  # noqa: E402
from bula_clara.agentes.leitor_imagem import AgenteLeitorImagem  # noqa: E402
from bula_clara.assistente import AssistenteMultimodal  # noqa: E402
from bula_clara.llm import LLMMock  # noqa: E402
from bula_clara.multimodal.ocr import ResultadoOCR  # noqa: E402
from bula_clara.multimodal.voz import texto_para_fala  # noqa: E402

FIX = Path(__file__).parent / "fixtures"


class OCRFalso:
    """Simula o OCR devolvendo um texto fixo (testa o resto do fluxo sem depender do Tesseract)."""
    nome = "falso"

    def __init__(self, texto):
        self.texto = texto

    def ler(self, img):
        return ResultadoOCR(self.texto, 0.9, self.nome)


@pytest.fixture(scope="module")
def orq(tmp_path_factory):
    chunks = ingestao.main(FIX, tmp_path_factory.mktemp("d") / "chunks.jsonl")
    return Orquestrador(llm=LLMMock(), chunks=chunks)


def _caixa(tmp_path, linhas, inverter=False):
    from PIL import Image, ImageDraw, ImageFont
    try:
        fonte = ImageFont.truetype("DejaVuSans-Bold.ttf", 64)
    except OSError:  # fonte DejaVu não instalada no sistema
        fonte = ImageFont.load_default(size=64)
    fundo, cor = ((20, 60, 160), (255, 255, 255)) if inverter else ((255, 255, 255), (20, 20, 20))
    img = Image.new("RGB", (1400, 700), fundo)
    d = ImageDraw.Draw(img)
    for i, l in enumerate(linhas):
        d.text((60, 60 + i * 120), l, fill=cor, font=fonte)
    p = tmp_path / "caixa.png"
    img.save(p)
    return p


@pytest.mark.parametrize("texto,esperado", [
    ("LOSARTANA POTÁSSICA 50 mg 30 comprimidos revestidos MEDICAMENTO GENÉRICO", "losartana"),
    ("L0SARTANA P0TASSICA 50mg", "losartana"),            # OCR trocou O por 0
    ("Marevan 5 mg varfarina sódica", "varfarina"),       # nome comercial
    ("ADVIL 400mg", "ibuprofeno"),
])
def test_identifica_texto_de_caixa(orq, texto, esperado):
    r = AgenteLeitorImagem(orq.identificador, ocr=OCRFalso(texto)).analisar_texto(ResultadoOCR(texto, 0.9, "falso"))
    assert r["medicamentos"][:1] == [esperado]


def test_extrai_concentracao(orq):
    t = "Losartana potássica 50 mg"
    r = AgenteLeitorImagem(orq.identificador).analisar_texto(ResultadoOCR(t, 0.9, "falso"))
    assert r["concentracoes"] == ["50mg"]


def test_foto_ilegivel(orq):
    t = "lote 2381 val 12/27 industria brasileira"
    r = AgenteLeitorImagem(orq.identificador).analisar_texto(ResultadoOCR(t, 0.5, "falso"))
    assert r["medicamentos"] == [] and "Não consegui ler" in r["mensagem"]


def test_assistente_so_com_foto(orq, tmp_path):
    a = AssistenteMultimodal(orq, ocr=OCRFalso("VARFARINA SÓDICA 5 mg"))
    r = a.responder(imagem=_caixa(tmp_path, ["x"]))
    assert r["medicamentos"] == ["varfarina"]
    assert r["trace"][0]["agente"] == "leitor_imagem"
    assert "Identifiquei na foto: varfarina" in r["resposta"]


def test_foto_mais_pergunta_detecta_interacao(orq, tmp_path):
    a = AssistenteMultimodal(orq, ocr=OCRFalso("Ibuprofeno 400 mg"))
    r = a.responder(pergunta="posso tomar junto com a varfarina?", imagem=_caixa(tmp_path, ["x"]))
    assert {"ibuprofeno", "varfarina"} <= set(r["medicamentos"])
    assert r["interacoes"]


@pytest.mark.skipif(not shutil.which("tesseract"), reason="Tesseract não instalado")
@pytest.mark.parametrize("inverter", [False, True])
def test_ocr_real_em_caixa_sintetica(orq, tmp_path, inverter):
    from bula_clara.multimodal.ocr import OCRTesseract
    foto = _caixa(tmp_path, ["LOSARTANA POTÁSSICA", "50 mg", "30 comprimidos"], inverter)
    r = AgenteLeitorImagem(orq.identificador, ocr=OCRTesseract()).ler(foto)
    assert r["medicamentos"][:1] == ["losartana"], r["texto_ocr"]


def test_texto_para_fala_remove_fontes_e_citacoes():
    resp = ("⚠️ Atenção.\n\nTome 50 mg por dia [1].\n\nFontes (bula ANVISA):\n[1] Losartana — Como usar\n\n"
            "Ligue para o SAMU (192) ou 0800-722-6001.")
    t = texto_para_fala(resp)
    assert "[1]" not in t and "Fontes" not in t and "⚠" not in t
    assert "miligramas" in t
