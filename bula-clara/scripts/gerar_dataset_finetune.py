"""Gera o dataset de fine-tuning a partir das bulas (data/chunks.jsonl).

Ideia ("RAG-aware fine-tuning"): ensinar o modelo a
  (a) responder SÓ com o trecho certo do contexto, escolhendo-o entre trechos distratores;
  (b) citar o número do trecho [n];
  (c) dizer "Não encontrei essa informação na bula." quando o trecho certo não está no contexto;
  (d) recusar alteração de dose e encaminhar ao médico.
Saída: data/finetune/treino.jsonl e data/finetune/validacao.jsonl (formato "messages").

Uso:  python scripts/gerar_dataset_finetune.py
"""
import json
import random
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from bula_clara import config  # noqa: E402
from bula_clara.ingestao import carregar_chunks  # noqa: E402
from bula_clara.prompts import prompt_rag  # noqa: E402

random.seed(42)
SAIDA = config.DADOS / "finetune"

PERGUNTAS = {
    "indicacao": ["Para que serve o {m}?", "O {m} é indicado para quê?", "pra que serve {m}",
                  "Meu médico passou {m}, isso trata o quê?"],
    "funcionamento": ["Como o {m} funciona no corpo?", "Como age o {m}?"],
    "contraindicacao": ["Quem não pode tomar {m}?", "Quando não devo usar {m}?", "tem gente que nao pode usar {m}?"],
    "precaucoes_interacoes": ["Que cuidados devo ter antes de usar {m}?", "Posso tomar {m} com outros remédios?",
                              "Posso beber álcool tomando {m}?"],
    "armazenamento": ["Como guardar o {m}?", "Posso deixar o {m} na geladeira?", "{m} vence quando aberto?"],
    "posologia": ["Como devo tomar o {m}?", "Como usar {m}?", "tomo {m} antes ou depois de comer?"],
    "esquecimento": ["Esqueci de tomar o {m}, e agora?", "O que faço se esquecer uma dose de {m}?"],
    "reacoes_adversas": ["Quais os efeitos colaterais do {m}?", "{m} pode fazer mal?", "O {m} dá sono?"],
    "superdose": ["O que acontece se tomar {m} demais?", "Tomei {m} a mais sem querer, o que faço?"],
}
PERGUNTAS_DOSE = ["Posso dobrar a dose de {m}?", "Posso parar de tomar {m} por conta própria?"]
NAO_ENCONTREI = "Não encontrei essa informação na bula."
AVISO_DOSE = ("Não mude a dose nem pare o remédio por conta própria: converse antes com o médico que o receitou. "
              "Veja o que a bula diz:")


def resumo(texto: str, n=3) -> str:
    frases = re.split(r"(?<=[.!?])\s+", " ".join(texto.split()))
    return " ".join(f for f in frases[:n] if len(f) > 10)


def exemplo(pergunta, trechos, resposta):
    msgs = prompt_rag(pergunta, trechos)
    return {"messages": msgs + [{"role": "assistant", "content": resposta}]}


def main():
    chunks = carregar_chunks()
    meds = sorted({c["medicamento"] for c in chunks})
    exemplos = []
    for c in chunks:
        if not c["texto"].strip() or c["id"].split("::")[-1] != "0":   # 1º pedaço de cada seção
            continue
        outros = [x for x in chunks if x["medicamento"] != c["medicamento"]]
        for tpl in random.sample(PERGUNTAS[c["secao"]], k=min(2, len(PERGUNTAS[c["secao"]]))):
            p = tpl.format(m=c["medicamento"])
            # (a)+(b) trecho correto em posição aleatória entre 2 distratores
            ctx = random.sample(outros, k=min(2, len(outros))) + [c]
            random.shuffle(ctx)
            n = ctx.index(c) + 1
            exemplos.append(exemplo(p, ctx, f"{resumo(c['texto'])} [{n}]"))
        # (c) contexto sem o trecho certo
        if len(outros) >= 2 and random.random() < 0.3:
            p = random.choice(PERGUNTAS[c["secao"]]).format(m=c["medicamento"])
            exemplos.append(exemplo(p, random.sample(outros, k=2), NAO_ENCONTREI))
        # (d) pedido de alteração de dose
        if c["secao"] == "posologia":
            p = random.choice(PERGUNTAS_DOSE).format(m=c["medicamento"])
            exemplos.append(exemplo(p, [c], f"{AVISO_DOSE} {resumo(c['texto'], 2)} [1]"))
    random.shuffle(exemplos)
    corte = max(1, int(len(exemplos) * 0.9))
    SAIDA.mkdir(parents=True, exist_ok=True)
    for nome, parte in (("treino", exemplos[:corte]), ("validacao", exemplos[corte:])):
        with (SAIDA / f"{nome}.jsonl").open("w", encoding="utf-8") as f:
            for e in parte:
                f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"{len(meds)} medicamentos -> {corte} exemplos de treino, {len(exemplos) - corte} de validação em {SAIDA}")


if __name__ == "__main__":
    main()
