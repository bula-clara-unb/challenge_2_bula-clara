"""Agente Leitor de Imagem — identifica o medicamento pela FOTO da caixa/cartela.

Fluxo: foto → OCR (bula_clara/multimodal/ocr.py) → texto → mesmo método do Agente Identificador
(nome, nome comercial e tolerância a erro de leitura). Também extrai a concentração (ex.: "50 mg"),
que é mostrada ao usuário para ele conferir com a caixa.
"""
import re
import time

from ..multimodal.ocr import ResultadoOCR, ler_imagem
from .identificador import AgenteIdentificador

_CONCENTRACAO = re.compile(r"\b\d+(?:[.,]\d+)?\s?(?:mg|mcg|µg|g|ml|mg/ml|ui)\b", re.I)
CONFIANCA_MINIMA = 0.8


class AgenteLeitorImagem:
    nome = "leitor_imagem"

    def __init__(self, identificador: AgenteIdentificador, ocr=None):
        self.identificador = identificador
        self.ocr = ocr   # None = cria o OCR na primeira foto (evita carregar sem necessidade)

    def ler(self, imagem) -> dict:
        t = time.perf_counter()
        if self.ocr is None:
            from ..multimodal.ocr import criar_ocr
            self.ocr = criar_ocr()
        r: ResultadoOCR = ler_imagem(imagem, self.ocr)
        return self.analisar_texto(r, t)

    def analisar_texto(self, r: ResultadoOCR, t: float | None = None) -> dict:
        candidatos = self.identificador.identificar(r.texto)
        confiaveis = [(m, s) for m, s in candidatos if s >= CONFIANCA_MINIMA]
        concentracoes = list(dict.fromkeys(c.replace(" ", "").lower() for c in _CONCENTRACAO.findall(r.texto)))
        if not confiaveis:
            msg = ("Não consegui ler o nome do remédio na foto. Tente de novo com a caixa de frente, "
                   "bem iluminada e sem reflexo — ou digite o nome.")
        elif len(confiaveis) > 1:
            msg = "Encontrei mais de um nome na foto: " + ", ".join(m for m, _ in confiaveis) + ". Confira se está certo."
        else:
            msg = f"Identifiquei na foto: {confiaveis[0][0]}" + (f" ({', '.join(concentracoes)})" if concentracoes else "") + "."
        return {
            "medicamentos": [m for m, _ in confiaveis],
            "candidatos": candidatos,
            "concentracoes": concentracoes,
            "texto_ocr": r.texto,
            "confianca_ocr": round(r.confianca, 2),
            "ocr": r.backend,
            "mensagem": msg,
            "ms": round((time.perf_counter() - t) * 1000, 1) if t else None,
        }
