"""Agente de Interações — cruza as bulas entre si de forma DETERMINÍSTICA.

Para cada par (A, B): procura na seção "Antes de usar / Interações" (e "Quando não usar") da bula de A
menções a B (nome ou classe terapêutica). A frase encontrada vira evidência citável.
Determinístico = auditável e mensurável (recall/precisão), sem depender do LLM.
"""
import itertools
import re

from ..conhecimento import CLASSES, TERMOS_FRACOS
from ..secoes import normalizar
from .base import Agente, Consulta

SECOES_INTERACAO = {"precaucoes_interacoes", "contraindicacao"}
PALAVRAS_RISCO = r"(aument|reduz|diminu|risco|sangra|interag|potencializ|efeito|toxic|cuidado|evit|nao (deve|use))"


def _frases(texto: str) -> list[str]:
    return [f.strip() for f in re.split(r"(?<=[.;!?])\s+|\n", texto) if len(f.strip()) > 15]


class AgenteInteracoes(Agente):
    nome = "interacoes"

    def __init__(self, chunks: list[dict]):
        # texto das seções de interação por medicamento
        self.secoes: dict[str, list[dict]] = {}
        for ch in chunks:
            if ch["secao"] in SECOES_INTERACAO:
                self.secoes.setdefault(ch["medicamento"], []).append(ch)

    def verificar_par(self, a: str, b: str) -> list[dict]:
        termos = CLASSES.get(b, [b])
        evidencias = []
        for ch in self.secoes.get(a, []):
            for frase in _frases(ch["texto"]):
                fn = normalizar(frase)
                for termo in termos:
                    tn = normalizar(termo)
                    if not re.search(rf"\b{re.escape(tn)}", fn):
                        continue
                    if termo in TERMOS_FRACOS and not re.search(PALAVRAS_RISCO, fn):
                        continue
                    evidencias.append({"bula_de": a, "menciona": b, "termo": termo,
                                       "evidencia": frase, "secao_nome": ch["secao_nome"], "fonte": ch["fonte"]})
                    break
        return evidencias

    def executar(self, c: Consulta):
        meds = c.medicamentos
        if len(meds) < 2:
            return {"pares": 0}
        achadas = []
        for a, b in itertools.permutations(meds, 2):
            achadas += self.verificar_par(a, b)[:2]
        c.interacoes = achadas
        return {"pares": len(meds) * (len(meds) - 1), "interacoes": [(i["bula_de"], i["menciona"]) for i in achadas]}

    def existe_interacao(self, a: str, b: str) -> bool:
        return bool(self.verificar_par(a, b) or self.verificar_par(b, a))
