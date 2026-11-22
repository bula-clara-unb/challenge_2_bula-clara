"""Confere se a base de bulas do MVP está pronta (issue #1).

Uso:  python scripts/validar_bulas.py            (pasta padrão: data/bulas/)
      python scripts/validar_bulas.py outra/pasta

Para cada um dos 15 medicamentos do MVP mostra quantas das 9 seções da RDC 47/2009 foram reconhecidas
e quais faltam. Sai com código 1 se algum medicamento estiver sem bula ou abaixo de config.MIN_SECOES.
Se uma bula ficar abaixo do mínimo, ajuste os padrões em bula_clara/secoes.py.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from bula_clara import config  # noqa: E402
from bula_clara.ingestao import ler_texto, nome_medicamento  # noqa: E402
from bula_clara.secoes import NOME_SECAO, dividir_em_secoes  # noqa: E402


def achar_arquivo(pasta: Path, med: str) -> Path | None:
    """Aceita 'losartana.pdf', 'losartana_potassica.pdf', 'losartana__EMS.pdf' etc."""
    candidatos = sorted([*pasta.glob("*.pdf"), *pasta.glob("*.txt")])
    exatos = [a for a in candidatos if nome_medicamento(a) == med]
    prefixo = [a for a in candidatos if nome_medicamento(a).startswith(med + " ")]
    return (exatos or prefixo or [None])[0]


def validar(pasta: Path = config.PASTA_PDFS) -> list[dict]:
    linhas = []
    for med in config.MEDICAMENTOS_MVP:
        arq = achar_arquivo(pasta, med)
        if arq is None:
            linhas.append({"medicamento": med, "arquivo": None, "secoes": 0, "faltando": list(NOME_SECAO)})
            continue
        secoes = dividir_em_secoes(ler_texto(arq))
        linhas.append({"medicamento": med, "arquivo": arq.name, "secoes": len(secoes),
                       "faltando": [s for s in NOME_SECAO if s not in secoes]})
    return linhas


def main() -> int:
    pasta = Path(sys.argv[1]) if len(sys.argv) > 1 else config.PASTA_PDFS
    linhas = validar(pasta)
    ok = 0
    print(f"{'medicamento':<24} {'seções':>7}  situação")
    for l in linhas:
        if l["arquivo"] is None:
            print(f"{l['medicamento']:<24} {'—':>7}  ✗ sem bula em {pasta}")
            continue
        passou = l["secoes"] >= config.MIN_SECOES
        ok += passou
        falta = ", ".join(NOME_SECAO[s] for s in l["faltando"])
        print(f"{l['medicamento']:<24} {l['secoes']:>5}/9  {'✓' if passou else '✗'} {l['arquivo']}"
              + (f"  (falta: {falta})" if falta else ""))
    total = len(linhas)
    print(f"\n{ok}/{total} medicamentos com ≥ {config.MIN_SECOES}/9 seções reconhecidas.")
    return 0 if ok == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
