"""Pipeline incremental de ingestão de bulas com manifesto, portão de qualidade e upsert no índice.

Uso:
  python -m bula_clara.pipeline_ingestao
  python -m bula_clara.pipeline_ingestao --dry-run
  python -m bula_clara.pipeline_ingestao --forcar --falhar-em-quarentena
"""
import argparse
import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from . import config
from .conhecimento import CLASSES
from .ingestao import (
    carregar_chunks,
    extrair_fabricante,
    ler_texto,
    nome_medicamento,
    quebrar,
)
from .secoes import NOME_SECAO, dividir_em_secoes


def calcular_sha256(arquivo: Path) -> str:
    h = hashlib.sha256()
    with arquivo.open("rb") as f:
        while bloco := f.read(65536):
            h.update(bloco)
    return h.hexdigest()


def carregar_manifesto(arq: Path = config.ARQ_MANIFESTO) -> dict:
    if arq.exists():
        return json.loads(arq.read_text(encoding="utf-8"))
    return {
        "versao_esquema": 1,
        "versao_parser": config.VERSAO_PARSER,
        "modelo_embedding": config.MODELO_EMBEDDING,
        "ultima_execucao": None,
        "arquivos": {},
    }


def carregar_metadados_extras(pasta: Path) -> dict:
    arq = pasta / "metadados.json"
    if not arq.exists():
        return {}
    dados = json.loads(arq.read_text(encoding="utf-8"))
    return dados if isinstance(dados, dict) else {}


def _escrever_atomico(arq: Path, escrever_fn) -> None:
    arq.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=arq.parent, delete=False, mode="w", encoding="utf-8", suffix=".tmp"
        ) as tmp:
            tmp_path = Path(tmp.name)
            escrever_fn(tmp)
        os.replace(tmp_path, arq)
    except Exception:
        if tmp_path is not None:
            tmp_path.unlink(missing_ok=True)
        raise


def salvar_json_atomico(arq: Path, dados: dict) -> None:
    _escrever_atomico(arq, lambda f: json.dump(dados, f, ensure_ascii=False, indent=2))


def salvar_jsonl_atomico(arq: Path, registros: list[dict]) -> None:
    def _gravar(f):
        for r in registros:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    _escrever_atomico(arq, _gravar)


def _metadados_esperados(arquivo: Path, meta_extras: dict) -> tuple[str | None, str | None]:
    meta = meta_extras.get(arquivo.name, {})
    fab = meta.get("fabricante") if meta.get("fabricante") is not None else extrair_fabricante(arquivo)
    return fab, meta.get("versao_bula")


def detectar_delta(
    pasta: Path,
    manifesto: dict,
    meta_extras: dict,
    forcar: bool = False,
    atualizar_indice: bool = True,
) -> dict:
    arquivos = sorted([*pasta.glob("*.pdf"), *pasta.glob("*.txt")]) if pasta.exists() else []
    atuais_por_nome = {a.name: a for a in arquivos}
    registros_antigos = manifesto.get("arquivos", {})

    mudou_parser = manifesto.get("versao_parser") != config.VERSAO_PARSER
    mudou_embedding = atualizar_indice and manifesto.get("modelo_embedding") != config.MODELO_EMBEDDING
    reconstrucao_total = bool(forcar or (registros_antigos and (mudou_parser or mudou_embedding)))

    hashes = {a.name: calcular_sha256(a) for a in arquivos}
    removidos = [nome for nome in sorted(registros_antigos) if nome not in atuais_por_nome]

    novos: list[Path] = []
    modificados: list[Path] = []
    inalterados: list[str] = []
    quarentena_inalterados: list[str] = []

    for arquivo in arquivos:
        reg = registros_antigos.get(arquivo.name)
        if reconstrucao_total:
            if reg is None:
                novos.append(arquivo)
            else:
                modificados.append(arquivo)
            continue

        if reg is None:
            novos.append(arquivo)
            continue

        fab_esperado, versao_esperada = _metadados_esperados(arquivo, meta_extras)
        mudou_meta = reg.get("fabricante") != fab_esperado or reg.get("versao_bula") != versao_esperada
        if reg.get("sha256") != hashes[arquivo.name] or mudou_meta:
            modificados.append(arquivo)
        elif reg.get("status") == "quarentena":
            quarentena_inalterados.append(arquivo.name)
        else:
            inalterados.append(arquivo.name)

    return {
        "reconstrucao_total": reconstrucao_total,
        "novos": novos,
        "modificados": modificados,
        "inalterados": inalterados,
        "quarentena_inalterados": quarentena_inalterados,
        "removidos": removidos,
        "hashes": hashes,
    }


def avaliar_arquivo(
    arquivo: Path,
    sha256: str,
    min_secoes: int,
    meta_extra: dict,
    medicamentos_ativos: set[str],
) -> tuple[dict, list[dict]]:
    med = nome_medicamento(arquivo)
    fabricante = meta_extra.get("fabricante") if meta_extra.get("fabricante") is not None else extrair_fabricante(arquivo)
    versao_bula = meta_extra.get("versao_bula")
    agora = datetime.now(timezone.utc).isoformat()

    if med in medicamentos_ativos:
        registro = {
            "fonte": arquivo.name,
            "medicamento": med,
            "fabricante": fabricante,
            "versao_bula": versao_bula,
            "sha256": sha256,
            "status": "quarentena",
            "secoes_reconhecidas": 0,
            "secoes_faltando": list(NOME_SECAO),
            "chunks": 0,
            "avisos": ["medicamento_duplicado"],
            "motivo_quarentena": f"medicamento '{med}' já ingerido por outro arquivo",
            "processado_em": agora,
        }
        return registro, []

    secoes = dividir_em_secoes(ler_texto(arquivo))
    secoes_faltando = [s for s in NOME_SECAO if s not in secoes]

    if len(secoes) < min_secoes:
        registro = {
            "fonte": arquivo.name,
            "medicamento": med,
            "fabricante": fabricante,
            "versao_bula": versao_bula,
            "sha256": sha256,
            "status": "quarentena",
            "secoes_reconhecidas": len(secoes),
            "secoes_faltando": secoes_faltando,
            "chunks": 0,
            "avisos": [],
            "motivo_quarentena": f"apenas {len(secoes)}/9 seções reconhecidas (mínimo: {min_secoes})",
            "processado_em": agora,
        }
        return registro, []

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
                "fabricante": fabricante,
                "versao_bula": versao_bula,
            })

    avisos = ["sem_classes_em_conhecimento"] if med not in CLASSES else []
    registro = {
        "fonte": arquivo.name,
        "medicamento": med,
        "fabricante": fabricante,
        "versao_bula": versao_bula,
        "sha256": sha256,
        "status": "ativo",
        "secoes_reconhecidas": len(secoes),
        "secoes_faltando": secoes_faltando,
        "chunks": len(chunks),
        "avisos": avisos,
        "motivo_quarentena": None,
        "processado_em": agora,
    }
    return registro, chunks


def _sincronizar_indice(
    delta: dict,
    chunks_finais: list[dict],
    chunks_delta_aprovados: list[dict],
    fontes_quarentena_novas: list[str],
    atualizar_indice: bool,
    dry_run: bool,
    recuperador,
) -> dict:
    if dry_run:
        return {"status": "simulado"}
    if not atualizar_indice:
        return {"status": "desabilitado"}

    houve_mudanca = delta["reconstrucao_total"] or bool(
        delta["novos"] or delta["modificados"] or delta["removidos"]
    )
    if not houve_mudanca:
        return {"status": "sem_alteracoes"}

    if recuperador is None:
        if os.getenv("BULA_RECUPERADOR", "chroma") != "chroma":
            return {"status": "ignorado", "motivo": "recuperador_nao_chroma"}
        try:
            from .recuperador import RecuperadorChroma
            recuperador = RecuperadorChroma(chunks=[])
        except ImportError:
            return {"status": "ignorado", "motivo": "chromadb_indisponivel"}

    if delta["reconstrucao_total"]:
        return recuperador.sincronizar_incremental(
            chunks_finais,
            delta["removidos"],
            [a.name for a in delta["modificados"]],
            reconstrucao_total=True,
        )

    fontes_alteradas = [a.name for a in delta["modificados"]] + fontes_quarentena_novas
    return recuperador.sincronizar_incremental(
        chunks_delta_aprovados,
        delta["removidos"],
        fontes_alteradas,
        reconstrucao_total=False,
    )


def executar_pipeline(
    pasta: Path = config.PASTA_PDFS,
    arq_chunks: Path = config.ARQ_CHUNKS,
    arq_manifesto: Path = config.ARQ_MANIFESTO,
    pasta_relatorios: Path | None = config.PASTA_RELATORIOS,
    min_secoes: int = config.MIN_SECOES,
    dry_run: bool = False,
    forcar: bool = False,
    atualizar_indice: bool = True,
    recuperador=None,
    exigir_mvp: bool = False,
    arq_csv_anvisa: Path | None = None,
    arq_catalogo: Path | None = None,
) -> dict:
    pasta = Path(pasta)
    arq_chunks = Path(arq_chunks)
    arq_manifesto = Path(arq_manifesto)
    pasta_relatorios = Path(pasta_relatorios) if pasta_relatorios is not None else None

    manifesto_antigo = carregar_manifesto(arq_manifesto)
    meta_extras = carregar_metadados_extras(pasta)
    delta = detectar_delta(
        pasta=pasta,
        manifesto=manifesto_antigo,
        meta_extras=meta_extras,
        forcar=forcar,
        atualizar_indice=atualizar_indice,
    )

    chunks_existentes = (
        carregar_chunks(arq_chunks) if arq_chunks.exists() and not delta["reconstrucao_total"] else []
    )

    registros_antigos = manifesto_antigo.get("arquivos", {})
    novo_arquivos: dict[str, dict] = {}
    medicamentos_ativos: set[str] = set()

    for nome in delta["inalterados"] + delta["quarentena_inalterados"]:
        reg = dict(registros_antigos[nome])
        novo_arquivos[nome] = reg
        if reg.get("status") == "ativo":
            medicamentos_ativos.add(reg["medicamento"])

    aprovados: list[str] = []
    chunks_delta_aprovados: list[dict] = []
    fontes_quarentena_novas: list[str] = []

    pendentes = sorted([*delta["novos"], *delta["modificados"]], key=lambda a: a.name)
    for arquivo in pendentes:
        reg, chunks_arq = avaliar_arquivo(
            arquivo=arquivo,
            sha256=delta["hashes"][arquivo.name],
            min_secoes=min_secoes,
            meta_extra=meta_extras.get(arquivo.name, {}),
            medicamentos_ativos=medicamentos_ativos,
        )
        novo_arquivos[arquivo.name] = reg
        if reg["status"] == "ativo":
            medicamentos_ativos.add(reg["medicamento"])
            aprovados.append(arquivo.name)
            chunks_delta_aprovados.extend(chunks_arq)
        else:
            fontes_quarentena_novas.append(arquivo.name)

    fontes_substituidas = (
        set(delta["removidos"])
        | {a.name for a in delta["modificados"]}
        | set(fontes_quarentena_novas)
    )
    chunks_preservados = [c for c in chunks_existentes if c["fonte"] not in fontes_substituidas]
    chunks_finais = sorted(
        [*chunks_preservados, *chunks_delta_aprovados],
        key=lambda c: (c["medicamento"], c["fonte"], c["id"]),
    )

    agora = datetime.now(timezone.utc).isoformat()
    novo_manifesto = {
        "versao_esquema": 1,
        "versao_parser": config.VERSAO_PARSER,
        "modelo_embedding": config.MODELO_EMBEDDING,
        "ultima_execucao": agora,
        "arquivos": {k: novo_arquivos[k] for k in sorted(novo_arquivos)},
    }

    quarentena = [
        {"fonte": r["fonte"], "medicamento": r["medicamento"], "motivo": r["motivo_quarentena"]}
        for r in novo_manifesto["arquivos"].values()
        if r.get("status") == "quarentena"
    ]
    avisos = [
        {"fonte": r["fonte"], "medicamento": r["medicamento"], "avisos": r["avisos"]}
        for r in novo_manifesto["arquivos"].values()
        if r.get("avisos")
    ]
    mvp_faltando = [m for m in config.MEDICAMENTOS_MVP if m not in medicamentos_ativos]

    indice_info = _sincronizar_indice(
        delta=delta,
        chunks_finais=chunks_finais,
        chunks_delta_aprovados=chunks_delta_aprovados,
        fontes_quarentena_novas=fontes_quarentena_novas,
        atualizar_indice=atualizar_indice,
        dry_run=dry_run,
        recuperador=recuperador,
    )

    relatorio = {
        "executado_em": agora,
        "dry_run": dry_run,
        "reconstrucao_total": delta["reconstrucao_total"],
        "exigir_mvp": exigir_mvp,
        "pasta": str(pasta),
        "delta": {
            "novos": [a.name for a in delta["novos"]],
            "modificados": [a.name for a in delta["modificados"]],
            "removidos": delta["removidos"],
            "inalterados": delta["inalterados"],
            "quarentena_inalterados": delta["quarentena_inalterados"],
        },
        "aprovados": aprovados,
        "quarentena": quarentena,
        "avisos": avisos,
        "mvp_faltando": mvp_faltando,
        "total_ativos": sum(1 for r in novo_manifesto["arquivos"].values() if r["status"] == "ativo"),
        "total_chunks": len(chunks_finais),
        "indice": indice_info,
        "arquivo_relatorio": None,
    }

    if not dry_run:
        houve_mudanca = delta["reconstrucao_total"] or bool(
            delta["novos"] or delta["modificados"] or delta["removidos"]
        )
        if houve_mudanca or not arq_chunks.exists():
            salvar_jsonl_atomico(arq_chunks, chunks_finais)
        salvar_json_atomico(arq_manifesto, novo_manifesto)
        if pasta_relatorios is not None:
            ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
            arq_rel = pasta_relatorios / f"ingestao_{ts}.json"
            relatorio["arquivo_relatorio"] = str(arq_rel)
            salvar_json_atomico(arq_rel, relatorio)

    if (arq_csv_anvisa is not None and Path(arq_csv_anvisa).exists()) or arq_catalogo is not None:
        from .catalogo import sincronizar_catalogo

        catalogo = sincronizar_catalogo(
            arq_csv=arq_csv_anvisa,
            arq_manifesto=arq_manifesto,
            arq_catalogo=arq_catalogo or config.ARQ_CATALOGO,
            dry_run=dry_run,
            manifesto=novo_manifesto,
        )
        relatorio["catalogo"] = catalogo["resumo"]

    return relatorio


def _imprimir_resumo(relatorio: dict) -> None:
    d = relatorio["delta"]
    modo = " [DRY-RUN]" if relatorio["dry_run"] else ""
    print(f"Pipeline de ingestão incremental{modo} — {relatorio['pasta']}")
    print(
        f"  Delta: +{len(d['novos'])} novos · ~{len(d['modificados'])} modificados · "
        f"-{len(d['removidos'])} removidos · ={len(d['inalterados'])} inalterados"
    )
    print(
        f"  Base ativa: {relatorio['total_ativos']} arquivos · "
        f"{relatorio['total_chunks']} chunks · índice: {relatorio['indice'].get('status')}"
    )
    if relatorio["quarentena"]:
        print("  Quarentena:")
        for q in relatorio["quarentena"]:
            print(f"    ✗ {q['fonte']} ({q['medicamento']}): {q['motivo']}")
    if relatorio["avisos"]:
        print("  Avisos:")
        for a in relatorio["avisos"]:
            print(f"    ! {a['fonte']} ({a['medicamento']}): {', '.join(a['avisos'])}")
    if relatorio["mvp_faltando"]:
        print(f"  MVP faltando ({len(relatorio['mvp_faltando'])}): {', '.join(relatorio['mvp_faltando'])}")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Pipeline incremental de ingestão de bulas.")
    ap.add_argument("--pasta", type=Path, default=config.PASTA_PDFS)
    ap.add_argument("--chunks", type=Path, default=config.ARQ_CHUNKS)
    ap.add_argument("--manifesto", type=Path, default=config.ARQ_MANIFESTO)
    ap.add_argument("--relatorios", default=str(config.PASTA_RELATORIOS))
    ap.add_argument("--min-secoes", type=int, default=config.MIN_SECOES)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--forcar", action="store_true")
    ap.add_argument("--sem-indice", action="store_true")
    ap.add_argument("--exigir-mvp", action="store_true")
    ap.add_argument("--falhar-em-quarentena", action="store_true")
    ap.add_argument("--csv-anvisa", type=Path, default=None)
    ap.add_argument("--catalogo", type=Path, default=config.ARQ_CATALOGO)
    ap.add_argument("--json", action="store_true", dest="saida_json")
    args = ap.parse_args(argv)

    pasta_relatorios = Path(args.relatorios) if args.relatorios else None
    if args.csv_anvisa is not None:
        csv_anvisa = args.csv_anvisa
        arq_catalogo = args.catalogo
    elif config.ARQ_CSV_ANVISA.exists():
        csv_anvisa = config.ARQ_CSV_ANVISA
        arq_catalogo = args.catalogo
    else:
        csv_anvisa = None
        arq_catalogo = None

    relatorio = executar_pipeline(
        pasta=args.pasta,
        arq_chunks=args.chunks,
        arq_manifesto=args.manifesto,
        pasta_relatorios=pasta_relatorios,
        min_secoes=args.min_secoes,
        dry_run=args.dry_run,
        forcar=args.forcar,
        atualizar_indice=not args.sem_indice,
        exigir_mvp=args.exigir_mvp,
        arq_csv_anvisa=csv_anvisa,
        arq_catalogo=arq_catalogo,
    )

    if args.saida_json:
        print(json.dumps(relatorio, ensure_ascii=False, indent=2))
    else:
        _imprimir_resumo(relatorio)

    if args.falhar_em_quarentena and relatorio["quarentena"]:
        return 1
    if args.exigir_mvp and relatorio["mvp_faltando"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
