"""Catálogo oficial de medicamentos da ANVISA (CSV aberto) cruzado com o manifesto local.

Mantém o CSV original intacto e deriva o status ("ok", "quarentena", "pendente") a partir de
`data/manifesto.json`, gerando lotes incrementais apenas com os medicamentos ainda sem "ok".

Uso:
  python -m bula_clara.catalogo --baixar --proximo-lote 15
  python -m bula_clara.catalogo --proximo-lote 15 --exportar-csv data/catalogo.csv
"""
import argparse
import csv
import json
import os
import re
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from . import config
from .conhecimento import APELIDOS, CLASSES
from .pipeline_ingestao import carregar_manifesto, salvar_json_atomico
from .secoes import normalizar

_APELIDOS_NORM = {normalizar(k): v for k, v in APELIDOS.items()}
_SITUACOES_ATIVAS = {"valido", "valida", "ativo", "ativa"}


def normalizar_principio_ativo(texto: str) -> str:
    chave = re.sub(r"\s+", " ", normalizar(texto)).strip()
    return _APELIDOS_NORM.get(chave, chave)


def _ler_texto_csv(arq_csv: Path) -> str:
    bruto = arq_csv.read_bytes()
    for enc in ("utf-8-sig", "latin-1"):
        try:
            return bruto.decode(enc)
        except UnicodeDecodeError:
            continue
    return bruto.decode("latin-1", errors="replace")


def baixar_csv_anvisa(
    destino: Path = config.ARQ_CSV_ANVISA,
    url: str = config.URL_CATALOGO_ANVISA,
    timeout: int = 60,
) -> Path:
    if not url.startswith(("http://", "https://")):
        raise ValueError(f"URL inválida para catálogo ANVISA: {url}")

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "bula-clara/1.0 (projeto academico UnB)"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        conteudo = resp.read()

    primeira_linha = conteudo.splitlines()[0].decode("latin-1", errors="ignore") if conteudo else ""
    if "PRINCIPIO_ATIVO" not in primeira_linha.upper():
        raise ValueError("Resposta baixada não parece ser DADOS_ABERTOS_MEDICAMENTOS.csv (cabeçalho inválido).")

    destino = Path(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(dir=destino.parent, delete=False, mode="wb", suffix=".tmp") as tmp:
            tmp_path = Path(tmp.name)
            tmp.write(conteudo)
        os.replace(tmp_path, destino)
    except Exception:
        if tmp_path is not None:
            tmp_path.unlink(missing_ok=True)
        raise
    return destino


def ler_csv_anvisa(arq_csv: Path, incluir_combinacoes: bool = False) -> dict[str, dict]:
    texto = _ler_texto_csv(Path(arq_csv))
    linhas = texto.splitlines()
    if not linhas:
        return {}
    delimitador = ";" if ";" in linhas[0] else ","
    leitor = csv.DictReader(linhas, delimiter=delimitador)

    agrupados: dict[str, dict] = {}
    for row in leitor:
        norm_row = {(k or "").strip().upper(): (v or "").strip() for k, v in row.items()}
        situacao = normalizar(norm_row.get("SITUACAO_REGISTRO", ""))
        if situacao and situacao not in _SITUACOES_ATIVAS:
            continue

        principio_bruto = norm_row.get("PRINCIPIO_ATIVO", "")
        if not principio_bruto:
            continue
        if not incluir_combinacoes and "+" in principio_bruto:
            continue

        chave = normalizar_principio_ativo(principio_bruto)
        if not chave:
            continue

        item = agrupados.setdefault(
            chave,
            {
                "principio_ativo": chave,
                "registros_ativos": 0,
                "registros_genericos": 0,
                "nomes_comerciais": set(),
                "classes_terapeuticas": set(),
                "fabricantes": set(),
                "mvp": chave in config.MEDICAMENTOS_MVP,
                "origem_csv": True,
            },
        )
        item["registros_ativos"] += 1

        categoria = normalizar(norm_row.get("CATEGORIA_REGULATORIA", ""))
        if "generico" in categoria:
            item["registros_genericos"] += 1

        nome_prod = norm_row.get("NOME_PRODUTO", "")
        if nome_prod:
            item["nomes_comerciais"].add(nome_prod)

        classe = norm_row.get("CLASSE_TERAPEUTICA", "")
        if classe:
            item["classes_terapeuticas"].add(classe)

        empresa = norm_row.get("EMPRESA_DETENTORA_REGISTRO", "")
        if empresa:
            item["fabricantes"].add(empresa)

    return {
        chave: {
            **dados,
            "nomes_comerciais": sorted(dados["nomes_comerciais"]),
            "classes_terapeuticas": sorted(dados["classes_terapeuticas"]),
            "fabricantes": sorted(dados["fabricantes"]),
        }
        for chave, dados in agrupados.items()
    }


def _indexar_manifesto_por_medicamento(manifesto: dict) -> dict[str, dict]:
    por_med: dict[str, dict] = {}
    for reg in manifesto.get("arquivos", {}).values():
        med = reg.get("medicamento")
        if not med:
            continue
        atual = por_med.get(med)
        if atual is None or (atual.get("status") != "ativo" and reg.get("status") == "ativo"):
            por_med[med] = reg
    return por_med


def sincronizar_catalogo(
    arq_csv: Path | None = config.ARQ_CSV_ANVISA,
    arq_manifesto: Path = config.ARQ_MANIFESTO,
    arq_catalogo: Path = config.ARQ_CATALOGO,
    incluir_combinacoes: bool = False,
    dry_run: bool = False,
    manifesto: dict | None = None,
) -> dict:
    csv_path = Path(arq_csv) if arq_csv is not None else None
    base_csv = ler_csv_anvisa(csv_path, incluir_combinacoes=incluir_combinacoes) if csv_path and csv_path.exists() else {}
    manifesto_atual = manifesto if manifesto is not None else carregar_manifesto(Path(arq_manifesto))
    por_med = _indexar_manifesto_por_medicamento(manifesto_atual)

    chaves = set(base_csv) | set(por_med) | set(config.MEDICAMENTOS_MVP)
    medicamentos: list[dict] = []

    for med in sorted(chaves):
        info = base_csv.get(
            med,
            {
                "principio_ativo": med,
                "registros_ativos": 0,
                "registros_genericos": 0,
                "nomes_comerciais": [],
                "classes_terapeuticas": [],
                "fabricantes": [],
                "mvp": med in config.MEDICAMENTOS_MVP,
                "origem_csv": False,
            },
        )
        reg = por_med.get(med)
        if reg and reg.get("status") == "ativo":
            status = "ok"
            arquivo_bula = reg.get("fonte")
            fabricante_bula = reg.get("fabricante")
            versao_bula = reg.get("versao_bula")
            chunks = reg.get("chunks", 0)
            motivo_quarentena = None
        elif reg and reg.get("status") == "quarentena":
            status = "quarentena"
            arquivo_bula = reg.get("fonte")
            fabricante_bula = reg.get("fabricante")
            versao_bula = reg.get("versao_bula")
            chunks = 0
            motivo_quarentena = reg.get("motivo_quarentena")
        else:
            status = "pendente"
            arquivo_bula = None
            fabricante_bula = None
            versao_bula = None
            chunks = 0
            motivo_quarentena = None

        medicamentos.append({
            **info,
            "status": status,
            "em_conhecimento": med in CLASSES,
            "arquivo_esperado": f"{med.replace(' ', '_')}.pdf",
            "arquivo_bula": arquivo_bula,
            "fabricante_bula": fabricante_bula,
            "versao_bula": versao_bula,
            "chunks": chunks,
            "motivo_quarentena": motivo_quarentena,
        })

    medicamentos.sort(
        key=lambda item: (
            not item["mvp"],
            -item["registros_genericos"],
            -item["registros_ativos"],
            item["principio_ativo"],
        )
    )

    resumo = {
        "total": len(medicamentos),
        "ok": sum(1 for m in medicamentos if m["status"] == "ok"),
        "quarentena": sum(1 for m in medicamentos if m["status"] == "quarentena"),
        "pendente": sum(1 for m in medicamentos if m["status"] == "pendente"),
        "mvp_ok": sum(1 for m in medicamentos if m["mvp"] and m["status"] == "ok"),
        "mvp_pendente": sum(1 for m in medicamentos if m["mvp"] and m["status"] != "ok"),
    }

    catalogo = {
        "atualizado_em": datetime.now(timezone.utc).isoformat(),
        "fonte_csv": str(csv_path) if csv_path and csv_path.exists() else None,
        "resumo": resumo,
        "medicamentos": medicamentos,
    }

    if not dry_run:
        salvar_json_atomico(Path(arq_catalogo), catalogo)

    return catalogo


def proximo_lote(
    catalogo: dict,
    tamanho: int = 15,
    apenas_mvp: bool = False,
    incluir_quarentena: bool = False,
) -> list[dict]:
    permitidos = {"pendente", "quarentena"} if incluir_quarentena else {"pendente"}
    candidatos = [
        item
        for item in catalogo.get("medicamentos", [])
        if item.get("status") in permitidos and (not apenas_mvp or item.get("mvp"))
    ]
    return candidatos[: max(0, tamanho)]


def exportar_catalogo_csv(catalogo: dict, destino: Path) -> Path:
    destino = Path(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    colunas = [
        "principio_ativo",
        "status",
        "mvp",
        "registros_genericos",
        "registros_ativos",
        "em_conhecimento",
        "arquivo_bula",
        "arquivo_esperado",
        "classes_terapeuticas",
        "nomes_comerciais",
    ]
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=destino.parent, delete=False, mode="w", encoding="utf-8-sig", newline="", suffix=".tmp"
        ) as tmp:
            tmp_path = Path(tmp.name)
            writer = csv.DictWriter(tmp, fieldnames=colunas, delimiter=";")
            writer.writeheader()
            for item in catalogo.get("medicamentos", []):
                writer.writerow({
                    "principio_ativo": item["principio_ativo"],
                    "status": item["status"],
                    "mvp": "sim" if item["mvp"] else "nao",
                    "registros_genericos": item["registros_genericos"],
                    "registros_ativos": item["registros_ativos"],
                    "em_conhecimento": "sim" if item["em_conhecimento"] else "nao",
                    "arquivo_bula": item.get("arquivo_bula") or "",
                    "arquivo_esperado": item["arquivo_esperado"],
                    "classes_terapeuticas": " | ".join(item.get("classes_terapeuticas", [])),
                    "nomes_comerciais": " | ".join(item.get("nomes_comerciais", [])[:10]),
                })
        os.replace(tmp_path, destino)
    except Exception:
        if tmp_path is not None:
            tmp_path.unlink(missing_ok=True)
        raise
    return destino


def _imprimir_resumo(catalogo: dict, lote: list[dict]) -> None:
    r = catalogo["resumo"]
    print(
        f"Catálogo de medicamentos: {r['ok']} ok · {r['quarentena']} quarentena · "
        f"{r['pendente']} pendentes (total: {r['total']})"
    )
    print(f"MVP: {r['mvp_ok']} ok · {r['mvp_pendente']} pendentes")
    if not lote:
        print("Nenhum medicamento pendente para o próximo lote.")
        return
    print(f"\nPróximo lote sem 'ok' ({len(lote)}):")
    for idx, item in enumerate(lote, 1):
        tag_mvp = " [MVP]" if item["mvp"] else ""
        print(
            f"  {idx:2d}. {item['principio_ativo']}{tag_mvp} -> data/bulas/{item['arquivo_esperado']} "
            f"(genéricos: {item['registros_genericos']}, registros: {item['registros_ativos']})"
        )


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Catálogo oficial da ANVISA e fila incremental de bulas.")
    ap.add_argument("--baixar", action="store_true", help="Baixa DADOS_ABERTOS_MEDICAMENTOS.csv da ANVISA.")
    ap.add_argument("--url", default=config.URL_CATALOGO_ANVISA)
    ap.add_argument("--csv", type=Path, default=config.ARQ_CSV_ANVISA)
    ap.add_argument("--manifesto", type=Path, default=config.ARQ_MANIFESTO)
    ap.add_argument("--saida", type=Path, default=config.ARQ_CATALOGO)
    ap.add_argument("--exportar-csv", type=Path, default=None)
    ap.add_argument("--proximo-lote", type=int, default=15)
    ap.add_argument("--apenas-mvp", action="store_true")
    ap.add_argument("--incluir-quarentena", action="store_true")
    ap.add_argument("--incluir-combinacoes", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--json", action="store_true", dest="saida_json")
    args = ap.parse_args(argv)

    if args.baixar and not args.dry_run:
        baixar_csv_anvisa(destino=args.csv, url=args.url)

    catalogo = sincronizar_catalogo(
        arq_csv=args.csv,
        arq_manifesto=args.manifesto,
        arq_catalogo=args.saida,
        incluir_combinacoes=args.incluir_combinacoes,
        dry_run=args.dry_run,
    )
    lote = proximo_lote(
        catalogo,
        tamanho=args.proximo_lote,
        apenas_mvp=args.apenas_mvp,
        incluir_quarentena=args.incluir_quarentena,
    )

    if args.exportar_csv and not args.dry_run:
        exportar_catalogo_csv(catalogo, args.exportar_csv)

    if args.saida_json:
        print(json.dumps({"resumo": catalogo["resumo"], "proximo_lote": lote, "catalogo": catalogo}, ensure_ascii=False, indent=2))
    else:
        _imprimir_resumo(catalogo, lote)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
