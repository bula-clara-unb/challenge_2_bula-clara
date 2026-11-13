"""Lê os PDFs das bulas, divide por seção e gera data/chunks.jsonl.

Uso:  python -m bula_clara.ingestao
Nome do arquivo = nome do medicamento (ex.: data/bulas/dipirona.pdf, data/bulas/losartana_potassica.pdf).
"""
import json
import re
from pathlib import Path

from pypdf import PdfReader

from . import config
from .secoes import NOME_SECAO, dividir_em_secoes

TAM_MAX = 1200   # caracteres por chunk
SOBREPOSICAO = 150


def nome_medicamento(arquivo: Path) -> str:
    base = arquivo.stem.split("__")[0]           # "dipirona__EMS" -> "dipirona"
    return re.sub(r"[_\-]+", " ", base).strip().lower()


def ler_texto(arquivo: Path) -> str:
    if arquivo.suffix.lower() == ".txt":
        return arquivo.read_text(encoding="utf-8")
    return "\n".join(p.extract_text() or "" for p in PdfReader(arquivo).pages)


def quebrar(texto: str) -> list[str]:
    """Divide texto longo em pedaços de até TAM_MAX, preferindo quebra entre parágrafos/frases."""
    if len(texto) <= TAM_MAX:
        return [texto]
    partes, ini = [], 0
    while ini < len(texto):
        fim = min(ini + TAM_MAX, len(texto))
        if fim < len(texto):
            corte = max(texto.rfind("\n", ini, fim), texto.rfind(". ", ini, fim))
            if corte > ini + TAM_MAX // 2:
                fim = corte + 1
        partes.append(texto[ini:fim].strip())
        if fim >= len(texto):
            break
        ini = max(fim - SOBREPOSICAO, ini + 1)
    return [p for p in partes if p]


def processar_arquivo(arquivo: Path) -> list[dict]:
    med = nome_medicamento(arquivo)
    secoes = dividir_em_secoes(ler_texto(arquivo))
    if not secoes:
        print(f"  ! {arquivo.name}: nenhuma seção reconhecida (é bula do PACIENTE?)")
        return []
    chunks = []
    for sid, texto in secoes.items():
        for i, parte in enumerate(quebrar(texto)):
            chunks.append({
                "id": f"{med.replace(' ', '_')}::{sid}::{i}",
                "medicamento": med,
                "secao": sid,
                "secao_nome": NOME_SECAO[sid],
                "texto": parte,
                "fonte": arquivo.name,
            })
    print(f"  ✓ {arquivo.name}: {len(secoes)}/9 seções, {len(chunks)} chunks")
    return chunks


def main(pasta: Path = config.PASTA_PDFS, saida: Path = config.ARQ_CHUNKS) -> list[dict]:
    arquivos = sorted([*pasta.glob("*.pdf"), *pasta.glob("*.txt")])
    if not arquivos:
        raise SystemExit(f"Nenhuma bula em {pasta}. Rode scripts/baixar_bulas.py ou coloque os PDFs lá.")
    todos = [c for a in arquivos for c in processar_arquivo(a)]
    saida.parent.mkdir(parents=True, exist_ok=True)
    with saida.open("w", encoding="utf-8") as f:
        for c in todos:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    print(f"\n{len(todos)} chunks salvos em {saida}")
    return todos


def carregar_chunks(arq: Path = config.ARQ_CHUNKS) -> list[dict]:
    with arq.open(encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


if __name__ == "__main__":
    main()
