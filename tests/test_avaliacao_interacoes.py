"""Validação estrutural e de integridade do gabarito de interações medicamentosas."""
import json
from pathlib import Path

from bula_clara.conhecimento import CLASSES

ARQ_INTERACOES = Path(__file__).resolve().parent.parent / "data" / "avaliacao" / "interacoes.jsonl"


def _carregar_pares() -> list[dict]:
    linhas = [linha for linha in ARQ_INTERACOES.read_text(encoding="utf-8").splitlines() if linha.strip()]
    return [json.loads(linha) for linha in linhas]


def test_formato_e_medicamentos_validos():
    """Cada linha deve ter formato válido, medicamentos distintos e presentes na base."""
    pares = _carregar_pares()
    assert pares
    for item in pares:
        assert set(item.keys()) == {"a", "b", "interage"}
        assert isinstance(item["a"], str) and isinstance(item["b"], str)
        assert isinstance(item["interage"], bool)
        assert item["a"] != item["b"]
        assert item["a"] in CLASSES
        assert item["b"] in CLASSES


def test_sem_pares_duplicados_ou_invertidos():
    """A ordem (a, b) não importa na métrica; nenhum par pode aparecer repetido."""
    pares = _carregar_pares()
    chaves = [tuple(sorted((item["a"], item["b"]))) for item in pares]
    assert len(chaves) == len(set(chaves))


def test_quantidade_minima_e_balanceamento():
    """Garante pelo menos 28 pares únicos (issue #3) e equilíbrio mínimo entre classes."""
    pares = _carregar_pares()
    positivos = sum(1 for item in pares if item["interage"] is True)
    negativos = sum(1 for item in pares if item["interage"] is False)
    assert len(pares) >= 28
    assert positivos >= 10
    assert negativos >= 10
