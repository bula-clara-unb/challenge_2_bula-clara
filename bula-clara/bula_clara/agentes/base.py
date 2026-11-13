"""Estado compartilhado entre os agentes (padrão blackboard: cada agente lê e escreve na Consulta)."""
import time
from dataclasses import dataclass, field


@dataclass
class Consulta:
    pergunta: str
    medicamentos_em_uso: list[str] = field(default_factory=list)   # informados pelo usuário
    medicamentos: list[str] = field(default_factory=list)          # preenchido pelo Identificador
    confianca_identificacao: float = 0.0
    secoes_alvo: list[str] = field(default_factory=list)
    trechos: list[dict] = field(default_factory=list)
    interacoes: list[dict] = field(default_factory=list)
    alertas: list[str] = field(default_factory=list)
    categoria_risco: str | None = None      # emergencia | alteracao_dose | grupo_especial | None
    bloqueada: bool = False
    resposta: str = ""
    trace: list[dict] = field(default_factory=list)

    def registrar(self, agente: str, inicio: float, **info):
        self.trace.append({"agente": agente, "ms": round((time.perf_counter() - inicio) * 1000, 1), **info})


class Agente:
    nome = "agente"

    def __call__(self, c: Consulta) -> Consulta:
        t = time.perf_counter()
        info = self.executar(c) or {}
        c.registrar(self.nome, t, **info)
        return c

    def executar(self, c: Consulta) -> dict | None:
        raise NotImplementedError
