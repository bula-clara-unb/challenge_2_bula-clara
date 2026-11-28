"""Gera o dataset de fine-tuning a partir das bulas (data/chunks.jsonl).

Ideia ("RAG-aware fine-tuning"): ensinar o modelo a
  (a) responder SÓ com o trecho certo do contexto, escolhendo-o entre trechos distratores;
  (b) citar o número do trecho [n];
  (c) dizer "Não encontrei essa informação na bula." quando o trecho certo não está no contexto;
  (d) recusar alteração de dose de forma alinhada ao Agente de Segurança;
  (e) explicar interações medicamentosas a partir do bloco INFORMAÇÕES VERIFICADAS.

Saída: data/finetune/treino.jsonl, data/finetune/validacao.jsonl e resumo_dataset.json.

Uso:  python scripts/gerar_dataset_finetune.py
"""
import argparse
import itertools
import json
import random
import re
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

from bula_clara import config
from bula_clara.agentes.interacoes import AgenteInteracoes
from bula_clara.ingestao import carregar_chunks
from bula_clara.prompts import prompt_rag

SAIDA = config.DADOS / "finetune"

PERGUNTAS = {
    "indicacao": [
        "Para que serve o {m}?",
        "O {m} é indicado para quê?",
        "pra que serve {m}",
        "Meu médico passou {m}, isso trata o quê?",
    ],
    "funcionamento": [
        "Como o {m} funciona no corpo?",
        "Como age o {m}?",
    ],
    "contraindicacao": [
        "Quem não pode tomar {m}?",
        "Quando não devo usar {m}?",
        "tem gente que nao pode usar {m}?",
    ],
    "precaucoes_interacoes": [
        "Que cuidados devo ter antes de usar {m}?",
        "Posso tomar {m} com outros remédios?",
        "Posso beber álcool tomando {m}?",
    ],
    "armazenamento": [
        "Como guardar o {m}?",
        "Posso deixar o {m} na geladeira?",
        "{m} vence quando aberto?",
    ],
    "posologia": [
        "Como devo tomar o {m}?",
        "Como usar {m}?",
        "tomo {m} antes ou depois de comer?",
    ],
    "esquecimento": [
        "Esqueci de tomar o {m}, e agora?",
        "O que faço se esquecer uma dose de {m}?",
    ],
    "reacoes_adversas": [
        "Quais os efeitos colaterais do {m}?",
        "{m} pode fazer mal?",
        "O {m} dá sono?",
    ],
    "superdose": [
        "O que acontece se tomar {m} demais?",
        "Tomei {m} a mais sem querer, o que faço?",
    ],
}
PERGUNTAS_DOSE = [
    "Posso dobrar a dose de {m}?",
    "Posso parar de tomar {m} por conta própria?",
    "Posso aumentar a dose de {m} se a dor continuar?",
]
PERGUNTAS_INTERACAO = [
    "Posso tomar {a} junto com {b}?",
    "Tem problema usar {a} e {b} no mesmo dia?",
    "Existe interação entre {a} e {b}?",
]
NAO_ENCONTREI = "Não encontrei essa informação na bula."
RECUSA_DOSE = (
    "Não posso orientar sobre mudança de dose, suspensão ou troca de medicamento. "
    "Isso só deve ser feito pelo médico que fez a receita. Converse com ele ou com o farmacêutico."
)


def resumo(texto: str, n: int = 3, max_chars: int = 450) -> str:
    limpo = " ".join(texto.split())
    frases = re.split(r"(?<=[.!?])\s+", limpo)
    boas = [f for f in frases if len(f) > 10] or frases
    selecionadas: list[str] = []
    total = 0
    for frase in boas[:n]:
        adicional = len(frase) + (1 if selecionadas else 0)
        if selecionadas and total + adicional > max_chars:
            break
        selecionadas.append(frase)
        total += adicional
    resultado = " ".join(selecionadas).strip()
    if len(resultado) > max_chars:
        corte = resultado[:max_chars].rsplit(" ", 1)[0].strip()
        resultado = (corte or resultado[:max_chars]).rstrip(" ,;") + "."
    return resultado


def exemplo(pergunta: str, trechos: list[dict], resposta: str, tipo: str, extra: str = "") -> dict:
    msgs = prompt_rag(pergunta, trechos, extra=extra)
    return {"messages": [*msgs, {"role": "assistant", "content": resposta}], "tipo": tipo}


def _gerar_particao(part_chunks: list[dict], rng: random.Random) -> list[dict]:
    exemplos: list[dict] = []
    por_med: dict[str, list[dict]] = {}
    for ch in part_chunks:
        por_med.setdefault(ch["medicamento"], []).append(ch)

    for c in part_chunks:
        secao = c["secao"]
        if secao not in PERGUNTAS:
            continue
        outros = [x for x in part_chunks if x["medicamento"] != c["medicamento"]]
        tpls = rng.sample(PERGUNTAS[secao], k=min(2, len(PERGUNTAS[secao])))
        for tpl in tpls:
            pergunta = tpl.format(m=c["medicamento"])
            distratores = rng.sample(outros, k=min(2, len(outros))) if outros else []
            ctx = [*distratores, c]
            rng.shuffle(ctx)
            idx = ctx.index(c) + 1
            exemplos.append(exemplo(pergunta, ctx, f"{resumo(c['texto'])} [{idx}]", tipo="rag"))

        if len(outros) >= 2 and rng.random() < 0.3:
            pergunta = rng.choice(PERGUNTAS[secao]).format(m=c["medicamento"])
            exemplos.append(exemplo(pergunta, rng.sample(outros, k=2), NAO_ENCONTREI, tipo="sem_contexto"))

        if secao == "posologia":
            pergunta = rng.choice(PERGUNTAS_DOSE).format(m=c["medicamento"])
            exemplos.append(exemplo(pergunta, [c], RECUSA_DOSE, tipo="dose"))

    # Exemplos de interações verificadas dentro da mesma partição (sem vazamento)
    agente_inter = AgenteInteracoes(part_chunks)
    meds = sorted(por_med)
    for a, b in itertools.combinations(meds, 2):
        evidencias = agente_inter.verificar_par(a, b)[:1] + agente_inter.verificar_par(b, a)[:1]
        if not evidencias:
            continue

        trechos_a = [
            x for x in por_med[a] if x["secao"] in {"precaucoes_interacoes", "contraindicacao"}
        ] or por_med[a]
        trechos_b = [
            x for x in por_med[b] if x["secao"] in {"precaucoes_interacoes", "contraindicacao"}
        ] or por_med[b]
        ctx = [trechos_a[0], trechos_b[0]]
        outros = [x for x in part_chunks if x["medicamento"] not in {a, b}]
        if outros:
            ctx.append(rng.choice(outros))
        rng.shuffle(ctx)

        ev = evidencias[0]
        extra = "\n".join(
            f'- A bula de {item["bula_de"].title()} cita {item["menciona"].title()}: "{item["evidencia"]}"'
            for item in evidencias
        )
        citacao_a = ctx.index(trechos_a[0]) + 1
        citacao_b = ctx.index(trechos_b[0]) + 1
        citacao_ev = citacao_a if ev["bula_de"] == a else citacao_b
        pergunta = rng.choice(PERGUNTAS_INTERACAO).format(a=a, b=b)
        resposta = (
            f"A bula de {ev['bula_de']} cita {ev['menciona']} com alerta de cuidado nessa combinação [{citacao_ev}]. "
            f"{resumo(ev['evidencia'], n=2, max_chars=260)} [{citacao_ev}] "
            "Não pare nenhum remédio por conta própria: converse com o farmacêutico ou médico antes de usar juntos."
        )
        exemplos.append(exemplo(pergunta, ctx, resposta, tipo="interacao", extra=extra))

    rng.shuffle(exemplos)
    return exemplos


def gerar_exemplos(
    chunks: list[dict],
    seed: int = 42,
    val_ratio: float = 0.1,
) -> tuple[list[dict], list[dict], dict]:
    rng = random.Random(seed)
    validos = [c for c in chunks if len(c.get("texto", "").strip()) >= 40]
    if not validos:
        raise ValueError("Nenhum chunk válido encontrado para gerar o dataset.")

    # Split por grupo (medicamento, secao) para evitar vazamento do mesmo chunk entre treino e validação
    grupos: dict[tuple[str, str], list[dict]] = {}
    for ch in validos:
        grupos.setdefault((ch["medicamento"], ch["secao"]), []).append(ch)

    chaves = sorted(grupos)
    rng.shuffle(chaves)
    n_val = max(1, round(len(chaves) * val_ratio)) if len(chaves) >= 2 else 0
    chaves_val = set(chaves[:n_val])

    chunks_val = [ch for chave in chaves_val for ch in grupos[chave]]
    chunks_treino = [ch for chave in chaves if chave not in chaves_val for ch in grupos[chave]]

    treino = _gerar_particao(chunks_treino, rng)
    validacao = _gerar_particao(chunks_val, rng)

    contagem_treino = Counter(ex["tipo"] for ex in treino)
    contagem_val = Counter(ex["tipo"] for ex in validacao)
    stats = {
        "seed": seed,
        "val_ratio": val_ratio,
        "medicamentos": len({c["medicamento"] for c in validos}),
        "chunks_validos": len(validos),
        "grupos_treino": len(chaves) - len(chaves_val),
        "grupos_validacao": len(chaves_val),
        "treino": len(treino),
        "validacao": len(validacao),
        "por_tipo_treino": dict(sorted(contagem_treino.items())),
        "por_tipo_validacao": dict(sorted(contagem_val.items())),
    }
    return treino, validacao, stats


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Gera o dataset de fine-tuning LoRA a partir dos chunks das bulas.")
    ap.add_argument("--chunks", type=Path, default=config.ARQ_CHUNKS)
    ap.add_argument("--saida", type=Path, default=SAIDA)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--val-ratio", type=float, default=0.1)
    args = ap.parse_args(argv)

    chunks = carregar_chunks(args.chunks)
    treino, validacao, stats = gerar_exemplos(chunks, seed=args.seed, val_ratio=args.val_ratio)

    args.saida.mkdir(parents=True, exist_ok=True)
    for nome, parte in (("treino", treino), ("validacao", validacao)):
        with (args.saida / f"{nome}.jsonl").open("w", encoding="utf-8") as f:
            for item in parte:
                f.write(json.dumps({"messages": item["messages"]}, ensure_ascii=False) + "\n")
    (args.saida / "resumo_dataset.json").write_text(
        json.dumps(stats, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        f"{stats['medicamentos']} medicamentos ({stats['chunks_validos']} chunks) -> "
        f"{stats['treino']} exemplos de treino, {stats['validacao']} de validação em {args.saida}"
    )
    print(f"Tipos (treino): {stats['por_tipo_treino']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
