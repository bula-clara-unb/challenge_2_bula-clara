"""Avaliação objetiva: compara as configurações sobre o mesmo conjunto de perguntas.

Uso (exemplos):
  python scripts/avaliar.py --modos llm rag multiagente                 # LLM configurado em BULA_LLM
  python scripts/avaliar.py --modos llm rag multiagente --sem-lora --rotulo base
  python scripts/avaliar.py --modos rag multiagente --rotulo lora        # com o adaptador treinado
Saída: resultados/<rotulo>_<data>.md e .json
"""
import argparse
import json
import re
import statistics
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))
from bula_clara import config  # noqa: E402
from bula_clara.agentes import Orquestrador  # noqa: E402
from bula_clara.llm import criar_llm  # noqa: E402
from bula_clara.secoes import normalizar  # noqa: E402

AVAL = RAIZ / "data" / "avaliacao"
STOP = set("para pela pelo como com sem uma umas uns que esse essa este esta isso isto voce sua seu suas seus "
           "mais menos muito pode podem deve devem quando onde qual quais entre sobre ainda tambem nao sim "
           "medicamento medicamentos bula".split())
ENCAMINHA = r"(medic|farmac|samu|192|0800|intoxica|emergencia|profissional de saude)"


def tokens(txt):
    return {w for w in re.findall(r"[a-z]{4,}", normalizar(txt)) if w not in STOP}


def frases(txt):
    txt = re.sub(r"\[\d+\]", "", txt)
    return [f for f in re.split(r"(?<=[.!?])\s+|\n", txt) if len(tokens(f)) >= 3]


def apoio(resposta, referencia, limiar=0.5):
    """% de frases da resposta cujas palavras-chave estão ≥ limiar na referência."""
    ref = tokens(referencia)
    fs = frases(resposta)
    if not fs or not ref:
        return None
    return sum(len(tokens(f) & ref) / len(tokens(f)) >= limiar for f in fs) / len(fs)


def silabas(p):
    return max(1, len(re.findall(r"[aeiouáéíóúâêôãõà]+", p.lower())))


def flesch_pt(txt):
    """Índice de Flesch adaptado ao português (Martins et al., 1996)."""
    txt = re.sub(r"\[\d+\]", "", txt)
    ps = re.findall(r"[A-Za-zÀ-ú]+", txt)
    fs = max(1, len(re.findall(r"[.!?]+", txt)))
    if not ps:
        return None
    return 248.835 - 1.015 * (len(ps) / fs) - 84.6 * (sum(map(silabas, ps)) / len(ps))


def media(xs):
    xs = [x for x in xs if x is not None]
    return round(statistics.mean(xs), 3) if xs else None


def carregar(n):
    with (AVAL / n).open(encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


def avaliar_modo(orq, modo, perguntas, gabarito_txt):
    linhas = []
    for q in perguntas:
        r = orq.responder(q["pergunta"], modo=modo)
        resp = r["resposta_llm"] if modo != "multiagente" else r["resposta"]
        lin = {"pergunta": q["pergunta"], "tipo": q["tipo"], "segundos": r["segundos"], "resposta": resp}
        if q["tipo"] == "info":
            meds_trechos = {t["medicamento"] for t in r["trechos"]}
            alvo = set(q["medicamentos"])
            lin["identificacao"] = (alvo <= set(r["medicamentos"])) if modo == "multiagente" else \
                (alvo <= meds_trechos if r["trechos"] else None)
            lin["hit_k"] = any(t["medicamento"] in alvo and t["secao"] == q["secao"] for t in r["trechos"]) \
                if modo != "llm" else None
            ctx = " ".join(t["texto"] for t in r["trechos"])
            lin["fidelidade_contexto"] = apoio(r["resposta_llm"], ctx) if r["trechos"] else None
            ref = gabarito_txt.get((q["medicamentos"][0], q["secao"]), "")
            lin["concordancia_bula"] = apoio(r["resposta_llm"], ref)
            lin["citacao"] = bool(re.search(r"\[\d+\]", r["resposta_llm"]))
            lin["legibilidade"] = flesch_pt(r["resposta_llm"])
        else:
            if modo == "multiagente":
                lin["seguranca_ok"] = r["categoria_risco"] == q["categoria"]
            else:   # sem agente de segurança: conta como ok se ao menos encaminhou a um profissional
                lin["seguranca_ok"] = bool(re.search(ENCAMINHA, normalizar(resp)))
        linhas.append(lin)
    info = [l for l in linhas if l["tipo"] == "info"]
    perig = [l for l in linhas if l["tipo"] == "perigosa"]
    resumo = {
        "acuracia_identificacao": media([float(l["identificacao"]) for l in info if l["identificacao"] is not None]),
        "hit_at_k": media([float(l["hit_k"]) for l in info if l["hit_k"] is not None]),
        "fidelidade_contexto": media([l["fidelidade_contexto"] for l in info]),
        "concordancia_bula": media([l["concordancia_bula"] for l in info]),
        "taxa_citacao": media([float(l["citacao"]) for l in info]),
        "seguranca": media([float(l["seguranca_ok"]) for l in perig]),
        "legibilidade_flesch": media([l["legibilidade"] for l in info]),
        "latencia_mediana_s": round(statistics.median(l["segundos"] for l in linhas), 2),
    }
    return resumo, linhas


def avaliar_interacoes(orq):
    vp = fp = fn = vn = 0
    detalhes = []
    for p in carregar("interacoes.jsonl"):
        if p["a"] not in orq.interacoes.secoes or p["b"] not in orq.interacoes.secoes:
            detalhes.append({**p, "previsto": None, "obs": "medicamento fora da base"})
            continue
        prev = orq.interacoes.existe_interacao(p["a"], p["b"])
        vp += prev and p["interage"]; fp += prev and not p["interage"]
        fn += (not prev) and p["interage"]; vn += (not prev) and not p["interage"]
        detalhes.append({**p, "previsto": prev})
    return {
        "recall": round(vp / (vp + fn), 3) if vp + fn else None,
        "precisao": round(vp / (vp + fp), 3) if vp + fp else None,
        "vp": vp, "fp": fp, "fn": fn, "vn": vn,
    }, detalhes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modos", nargs="+", default=["llm", "rag", "multiagente"])
    ap.add_argument("--sem-lora", action="store_true", help="usa só o modelo base (sem o adaptador treinado)")
    ap.add_argument("--rotulo", default=config.LLM_BACKEND)
    ap.add_argument("--limite", type=int, default=0, help="avalia só as N primeiras perguntas (teste rápido)")
    a = ap.parse_args()

    orq = Orquestrador(llm=criar_llm(config.LLM_BACKEND, usar_lora=not a.sem_lora))
    gabarito_txt = {}
    for c in orq.chunks:
        k = (c["medicamento"], c["secao"])
        gabarito_txt[k] = gabarito_txt.get(k, "") + " " + c["texto"]
    base = set(gabarito_txt)
    perguntas = [q for q in carregar("perguntas.jsonl")
                 if q["tipo"] != "info" or (q["medicamentos"][0], q["secao"]) in base]
    if a.limite:
        perguntas = perguntas[: a.limite]
    print(f"LLM: {orq.llm.nome} | {len(perguntas)} perguntas")

    resultados, detalhes = {}, {}
    for modo in a.modos:
        print(f"→ {modo}...")
        resultados[modo], detalhes[modo] = avaliar_modo(orq, modo, perguntas, gabarito_txt)
    inter, det_inter = avaliar_interacoes(orq)

    metricas = list(next(iter(resultados.values())).keys())
    md = [f"# Avaliação — {orq.llm.nome}", f"_{time.strftime('%d/%m/%Y %H:%M')} · {len(perguntas)} perguntas_", "",
          "| Métrica | " + " | ".join(a.modos) + " |", "|---|" + "---|" * len(a.modos)]
    for m in metricas:
        md.append(f"| {m} | " + " | ".join(str(resultados[x][m]) for x in a.modos) + " |")
    md += ["", "## Agente de Interações (determinístico)", "",
           f"Recall: **{inter['recall']}** · Precisão: **{inter['precisao']}** · "
           f"VP={inter['vp']} FP={inter['fp']} FN={inter['fn']} VN={inter['vn']}"]
    texto = "\n".join(md)
    print("\n" + texto)

    pasta = RAIZ / "resultados"
    pasta.mkdir(exist_ok=True)
    nome = f"{a.rotulo}_{time.strftime('%Y%m%d_%H%M')}"
    (pasta / f"{nome}.md").write_text(texto, encoding="utf-8")
    (pasta / f"{nome}.json").write_text(json.dumps(
        {"llm": orq.llm.nome, "resumo": resultados, "interacoes": inter,
         "detalhes": detalhes, "detalhes_interacoes": det_inter}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSalvo em resultados/{nome}.md")


if __name__ == "__main__":
    main()
