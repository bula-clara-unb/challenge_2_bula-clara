"""Agente Recuperador — decide QUAIS seções da bula interessam e busca os trechos (RAG)."""
import re

from .. import config
from ..secoes import normalizar
from .base import Agente, Consulta

# intenção da pergunta -> seções da bula
INTENCOES = [
    (r"para que serve|serve pra|indicad|trata o que|pra que", ["indicacao"]),
    (r"como (ele )?funciona|como age", ["funcionamento"]),
    (r"nao (posso|devo) (usar|tomar)|contraindic|quem nao pode", ["contraindicacao"]),
    (r"junto|junto com|mesmo tempo|misturar|interag|alcool|bebida|cerveja|gravid|gestante|amament|"
     r"dirigir|cuidado|precau", ["precaucoes_interacoes", "contraindicacao"]),
    (r"guardar|geladeira|validade|armazen|temperatura", ["armazenamento"]),
    (r"como (devo )?(tomar|usar)|dose|quant|horario|de quanto em quanto|em jejum|"
     r"antes ou depois|posso tomar mais|mastigar|partir", ["posologia"]),
    (r"esqueci|esquecer|perdi (a|uma) dose", ["esquecimento"]),
    (r"efeito colateral|efeitos colaterais|reac|faz mal|males|sintoma|enjoo|sono|tontura|dor de", ["reacoes_adversas"]),
    (r"tomei (muit|demais|a mais)|superdos|overdose|dose maior", ["superdose"]),
]


def secoes_da_pergunta(pergunta: str) -> list[str]:
    t = normalizar(pergunta)
    secoes = []
    for padrao, s in INTENCOES:
        if re.search(padrao, t):
            secoes += [x for x in s if x not in secoes]
    return secoes


class AgenteRecuperador(Agente):
    nome = "recuperador"

    def __init__(self, recuperador, k=config.TOP_K):
        self.rec, self.k = recuperador, k

    def executar(self, c: Consulta):
        c.secoes_alvo = secoes_da_pergunta(c.pergunta)
        if len(c.medicamentos) >= 2 and "precaucoes_interacoes" not in c.secoes_alvo:
            c.secoes_alvo.append("precaucoes_interacoes")
        meds = c.medicamentos or None
        trechos = []
        if not meds:   # sem medicamento identificado não busca: evita responder sobre o remédio errado
            c.trechos = []
            return {"secoes_alvo": c.secoes_alvo, "trechos": [], "obs": "nenhum medicamento identificado"}
        if meds:
            # garante pelo menos 1 trecho de cada medicamento citado
            por_med = max(1, self.k // len(meds))
            for m in meds:
                trechos += self.rec.buscar(c.pergunta, k=por_med, medicamentos=[m], secoes=c.secoes_alvo or None)
        if not trechos:   # sem filtro de seção como reserva
            trechos = self.rec.buscar(c.pergunta, k=self.k, medicamentos=meds)
        # remove duplicados e limita a k*2
        vistos, unicos = set(), []
        for t in sorted(trechos, key=lambda x: -x["score"]):
            if t["id"] not in vistos:
                vistos.add(t["id"]); unicos.append(t)
        c.trechos = unicos[: self.k * 2]
        return {"secoes_alvo": c.secoes_alvo, "trechos": [t["id"] for t in c.trechos]}
