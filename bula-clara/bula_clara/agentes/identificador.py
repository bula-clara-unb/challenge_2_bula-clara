"""Agente Identificador — descobre quais medicamentos a pergunta menciona.
Semana 3: por texto (nome, nome comercial, erro de digitação).
Semana 4: receberá também o texto extraído da FOTO da caixa (OCR) pelo mesmo método."""
import difflib
import re

from ..conhecimento import APELIDOS
from ..secoes import normalizar
from .base import Agente, Consulta


class AgenteIdentificador(Agente):
    nome = "identificador"

    def __init__(self, medicamentos_na_base: list[str]):
        self.base = sorted(set(medicamentos_na_base))
        # vocabulário: nome na base e apelidos -> nome na base (normalizados)
        self.vocab = {normalizar(m): m for m in self.base}
        self.vocab.update({normalizar(a): m for a, m in APELIDOS.items() if m in self.base})

    def identificar(self, texto: str) -> list[tuple[str, float]]:
        t = normalizar(texto)
        palavras = re.findall(r"[a-z0-9]+", t)
        achados: dict[str, float] = {}
        # 1) correspondência exata (inclui nomes compostos, ex.: "acido acetilsalicilico")
        for termo, med in self.vocab.items():
            if re.search(rf"\b{re.escape(termo)}\b", t):
                achados[med] = 1.0
        # 2) correspondência aproximada palavra a palavra (erros de digitação: "losartan", "dipirôna")
        termos_simples = [k for k in self.vocab if " " not in k]
        for p in palavras:
            if len(p) < 5:
                continue
            m = difflib.get_close_matches(p, termos_simples, n=1, cutoff=0.8)
            if m:
                med = self.vocab[m[0]]
                score = difflib.SequenceMatcher(None, p, m[0]).ratio()
                achados[med] = max(achados.get(med, 0), round(score, 2))
        return sorted(achados.items(), key=lambda x: -x[1])

    def executar(self, c: Consulta):
        achados = self.identificar(c.pergunta)
        em_uso = [m for nome in c.medicamentos_em_uso for m, _ in self.identificar(nome)[:1]]
        c.medicamentos = list(dict.fromkeys([m for m, _ in achados] + em_uso))
        c.confianca_identificacao = min([s for _, s in achados], default=1.0 if em_uso else 0.0)
        if achados and c.confianca_identificacao < 0.9:
            nomes = ", ".join(m for m, _ in achados)
            c.alertas.append(f"Entendi que você está falando de: {nomes}. Se não for isso, me corrija.")
        return {"medicamentos": c.medicamentos, "confianca": c.confianca_identificacao}
