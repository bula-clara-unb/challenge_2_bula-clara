"""Agente Simplificador — o único que usa o LLM. Redige a resposta simples a partir dos trechos e das
interações já verificadas, sempre citando os trechos."""
from ..prompts import prompt_rag
from .base import Agente, Consulta


class AgenteSimplificador(Agente):
    nome = "simplificador"

    def __init__(self, llm):
        self.llm = llm

    def executar(self, c: Consulta):
        if c.bloqueada or not c.trechos:
            return {"llm": "não chamado"}
        extra = "\n".join(
            f"- A bula de {i['bula_de'].title()} cita {i['menciona'].title()}: \"{i['evidencia']}\""
            for i in c.interacoes
        )
        c.resposta = self.llm.gerar(prompt_rag(c.pergunta, c.trechos, extra))
        return {"llm": self.llm.nome, "tamanho_resposta": len(c.resposta)}
