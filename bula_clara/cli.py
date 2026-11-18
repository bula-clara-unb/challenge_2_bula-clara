"""Linha de comando.
  python -m bula_clara.cli "Posso tomar ibuprofeno junto com losartana?"
  python -m bula_clara.cli "Para que serve?" --uso "varfarina,aas" --trace
  python -m bula_clara.cli --foto caixa.jpg                      (semana 4: foto da caixa)
  python -m bula_clara.cli "como devo tomar?" --foto caixa.jpg --falar
  python -m bula_clara.cli --audio pergunta.ogg
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
    ap.add_argument("--foto", help="foto da caixa/cartela do medicamento")
    ap.add_argument("--audio", help="áudio com a pergunta falada")
    ap.add_argument("--falar", action="store_true", help="gera a resposta em áudio (mp3)")
    a = ap.parse_args()
    uso = [m.strip() for m in a.uso.split(",") if m.strip()]
    o = Orquestrador()
    print(f"LLM: {o.llm.nome}")
    if a.foto or a.audio or a.falar:
        from .assistente import AssistenteMultimodal
        r = AssistenteMultimodal(o).responder(a.pergunta, imagem=a.foto, audio=a.audio,
                                              medicamentos_em_uso=uso, falar=a.falar)
        if r.get("voz"):
            print(f"Pergunta entendida (voz): {r['voz']['texto']}")
        if r.get("imagem"):
            print(f"Texto lido na foto: {r['imagem']['texto_ocr'][:120]}")
        mostrar({"segundos": "-", **r}, a.trace)
        if r.get("audio_resposta"):
            print(f"Áudio da resposta: {r['audio_resposta']}")
        return
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
