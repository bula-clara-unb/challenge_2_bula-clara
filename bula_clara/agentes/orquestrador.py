"""Orquestrador — executa os agentes em sequência sobre a mesma Consulta.

Modos (usados na comparação experimental):
  "llm"         LLM sozinho, sem contexto                         (configuração A)
  "rag"         recuperação top-k simples + LLM                   (configuração B)
  "multiagente" pipeline completo com segurança e interações      (configuração C / produto)
"""
import time

from .. import config
from ..ingestao import carregar_chunks
from ..llm import criar_llm
from ..prompts import prompt_rag, prompt_sem_rag
from ..recuperador import criar_recuperador
from .base import Consulta
from .identificador import AgenteIdentificador
from .interacoes import AgenteInteracoes
from .recuperacao import AgenteRecuperador
from .seguranca import AgenteSegurancaPos, AgenteSegurancaPre, finalizar
from .simplificador import AgenteSimplificador


class Orquestrador:
    def __init__(self, llm=None, chunks=None, recuperador=None):
        self.chunks = chunks or carregar_chunks()
        self.rec = recuperador or criar_recuperador(self.chunks)
        self.llm = llm or criar_llm()
        self.identificador = AgenteIdentificador([c["medicamento"] for c in self.chunks])
        self.interacoes = AgenteInteracoes(self.chunks)
        self.pipeline = [
            AgenteSegurancaPre(),
            self.identificador,
            AgenteRecuperador(self.rec),
            self.interacoes,
            AgenteSimplificador(self.llm),
            AgenteSegurancaPos(),
        ]

    def responder(self, pergunta: str, medicamentos_em_uso: list[str] | None = None,
                  modo: str = "multiagente") -> dict:
        inicio = time.perf_counter()
        c = Consulta(pergunta=pergunta, medicamentos_em_uso=medicamentos_em_uso or [])
        if modo == "llm":
            c.resposta = self.llm.gerar(prompt_sem_rag(pergunta))
            final = c.resposta
        elif modo == "rag":
            c.trechos = self.rec.buscar(pergunta, k=config.TOP_K)
            c.resposta = self.llm.gerar(prompt_rag(pergunta, c.trechos))
            final = c.resposta
        else:
            for agente in self.pipeline:
                agente(c)
                if c.bloqueada and agente.nome == "seguranca_pre":
                    break
            final = finalizar(c)
            # Garantia ética: aviso legal sempre presente, mesmo em respostas bloqueadas
            AVISO_LEGAL = "⚠️ Projeto acadêmico. Não substitui médico ou farmacêutico. Emergência: SAMU 192 · Disque-Intoxicação 0800-722-6001."
            if AVISO_LEGAL not in final:
                final += f"\n\n{AVISO_LEGAL}"
        return {
            "resposta": final,
            "resposta_llm": c.resposta,
            "medicamentos": c.medicamentos,
            "trechos": [{k: t[k] for k in ("id", "medicamento", "secao", "secao_nome", "texto")} for t in c.trechos],
            "interacoes": c.interacoes,
            "categoria_risco": c.categoria_risco,
            "bloqueada": c.bloqueada,
            "trace": c.trace,
            "modo": modo,
            "segundos": round(time.perf_counter() - inicio, 2),
        }
