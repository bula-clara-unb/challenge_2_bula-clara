"""Linha de comando.
  python -m bula_clara.cli "Posso tomar ibuprofeno junto com losartana?"
  python -m bula_clara.cli "Para que serve?" --uso "varfarina,aas" --trace
  python -m bula_clara.cli               (modo interativo)
"""
import argparse
import json

from .agentes import Orquestrador


def mostrar(r: dict, trace: bool):
    print("\n" + r["resposta"] + "\n")
    if trace:
        print("── trace dos agentes ──")
        for passo in r["trace"]:
            print(json.dumps(passo, ensure_ascii=False))
        print(f"total: {r['segundos']} s")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pergunta", nargs="?")
    ap.add_argument("--uso", default="", help="medicamentos que a pessoa usa, separados por vírgula")
    ap.add_argument("--modo", default="multiagente", choices=["llm", "rag", "multiagente"])
    ap.add_argument("--trace", action="store_true", help="mostra o que cada agente fez")
    a = ap.parse_args()
    uso = [m.strip() for m in a.uso.split(",") if m.strip()]
    o = Orquestrador()
    print(f"LLM: {o.llm.nome}")
    if a.pergunta:
        mostrar(o.responder(a.pergunta, uso, a.modo), a.trace)
        return
    while True:
        try:
            p = input("\nPergunta (enter para sair): ").strip()
        except EOFError:
            break
        if not p:
            break
        mostrar(o.responder(p, uso, a.modo), a.trace)


if __name__ == "__main__":
    main()
