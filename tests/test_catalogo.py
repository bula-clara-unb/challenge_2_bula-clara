"""Testes do catálogo oficial da ANVISA e fila incremental de lotes."""
import csv
import json
import shutil
import urllib.request
from pathlib import Path

import pytest

from bula_clara import catalogo, pipeline_ingestao

FIX = Path(__file__).parent / "fixtures"

CSV_EXEMPLO = """TIPO_PRODUTO;NOME_PRODUTO;DATA_FINALIZACAO_PROCESSO;CATEGORIA_REGULATORIA;NUMERO_REGISTRO_PRODUTO;DATA_VENCIMENTO_REGISTRO;NUMERO_PROCESSO;CLASSE_TERAPEUTICA;EMPRESA_DETENTORA_REGISTRO;SITUACAO_REGISTRO;PRINCIPIO_ATIVO
MEDICAMENTO;COZAAR;01/01/2020;NOVO;100000001;01/01/2030;1;ANTI-HIPERTENSIVOS;ORGANON;VÁLIDO;LOSARTANA POTÁSSICA
MEDICAMENTO;LOSARTANA GENÉRICO;01/01/2021;GENÉRICO;100000002;01/01/2031;2;ANTI-HIPERTENSIVOS;EMS;ATIVO;LOSARTANA POTÁSSICA
MEDICAMENTO;NOVALGINA;01/01/2020;NOVO;100000003;01/01/2030;3;ANALGÉSICOS;SANOFI;VÁLIDO;DIPIRONA MONOIDRATADA
MEDICAMENTO;ATENOLOL MEDLEY;01/01/2020;GENÉRICO;100000004;01/01/2030;4;BETABLOQUEADORES;MEDLEY;ATIVO;ATENOLOL
MEDICAMENTO;ATENOLOL EMS;01/01/2020;GENÉRICO;100000005;01/01/2030;5;BETABLOQUEADORES;EMS;ATIVO;ATENOLOL
MEDICAMENTO;AZITROMICINA;01/01/2020;SIMILAR;100000006;01/01/2030;6;ANTIBIÓTICOS;EUROFARMA;ATIVO;AZITROMICINA
MEDICAMENTO;DORFLEX;01/01/2020;SIMILAR;100000007;01/01/2030;7;RELAXANTES;SANOFI;VÁLIDO;DIPIRONA + ORFENADRINA + CAFEINA
MEDICAMENTO;ANTIGO CANCELADO;01/01/2010;SIMILAR;100000008;01/01/2015;8;OUTROS;LAB X;CANCELADO;CICLOBENZAPRINA
"""


def _escrever_csv(destino: Path) -> Path:
    destino.write_bytes(CSV_EXEMPLO.encode("latin-1"))
    return destino


def _copiar_fixtures(destino: Path) -> Path:
    bulas = destino / "bulas"
    bulas.mkdir(parents=True, exist_ok=True)
    for arq in FIX.glob("*.txt"):
        shutil.copy(arq, bulas / arq.name)
    return bulas


def test_ler_csv_anvisa_filtra_normaliza_e_agrupa(tmp_path):
    arq = _escrever_csv(tmp_path / "anvisa.csv")

    dados = catalogo.ler_csv_anvisa(arq)
    assert "losartana" in dados
    assert dados["losartana"]["registros_ativos"] == 2
    assert dados["losartana"]["registros_genericos"] == 1
    assert dados["losartana"]["nomes_comerciais"] == ["COZAAR", "LOSARTANA GENÉRICO"]
    assert dados["losartana"]["mvp"] is True

    assert "dipirona" in dados
    assert "atenolol" in dados
    assert dados["atenolol"]["registros_genericos"] == 2
    assert "ciclobenzaprina" not in dados  # CANCELADO ignorado
    assert "dipirona + orfenadrina + cafeina" not in dados  # combinação com + ignorada

    com_comb = catalogo.ler_csv_anvisa(arq, incluir_combinacoes=True)
    assert "dipirona + orfenadrina + cafeina" in com_comb


def test_sincronizar_catalogo_status_e_proximo_lote(tmp_path):
    arq_csv = _escrever_csv(tmp_path / "anvisa.csv")
    manifesto = {
        "versao_esquema": 1,
        "arquivos": {
            "losartana.txt": {"medicamento": "losartana", "fonte": "losartana.txt", "status": "ativo", "chunks": 9},
            "azitromicina.txt": {
                "medicamento": "azitromicina",
                "fonte": "azitromicina.txt",
                "status": "quarentena",
                "motivo_quarentena": "apenas 2/9 seções",
            },
        },
    }

    cat = catalogo.sincronizar_catalogo(
        arq_csv=arq_csv,
        arq_catalogo=tmp_path / "catalogo.json",
        manifesto=manifesto,
    )
    por_med = {m["principio_ativo"]: m for m in cat["medicamentos"]}
    assert por_med["losartana"]["status"] == "ok"
    assert por_med["azitromicina"]["status"] == "quarentena"
    assert por_med["dipirona"]["status"] == "pendente"
    assert por_med["atenolol"]["status"] == "pendente"

    lote = catalogo.proximo_lote(cat, tamanho=15)
    nomes_lote = [item["principio_ativo"] for item in lote]
    assert "losartana" not in nomes_lote
    assert "azitromicina" not in nomes_lote
    # MVPs vêm antes de atenolol; depois atenolol (2 genéricos)
    assert nomes_lote.index("dipirona") < nomes_lote.index("atenolol")
    assert nomes_lote[-1] == "atenolol"

    lote_com_quar = catalogo.proximo_lote(cat, tamanho=20, incluir_quarentena=True)
    assert any(item["principio_ativo"] == "azitromicina" for item in lote_com_quar)


def test_integracao_pipeline_atualiza_ok_no_catalogo(tmp_path):
    bulas = _copiar_fixtures(tmp_path)
    arq_csv = _escrever_csv(tmp_path / "anvisa.csv")
    arq_cat = tmp_path / "catalogo.json"

    r1 = pipeline_ingestao.executar_pipeline(
        pasta=bulas,
        arq_chunks=tmp_path / "chunks.jsonl",
        arq_manifesto=tmp_path / "manifesto.json",
        pasta_relatorios=tmp_path / "relatorios",
        atualizar_indice=False,
        arq_csv_anvisa=arq_csv,
        arq_catalogo=arq_cat,
    )
    assert r1["catalogo"]["ok"] == 4
    cat1 = json.loads(arq_cat.read_text(encoding="utf-8"))
    assert any(m["principio_ativo"] == "dipirona" for m in catalogo.proximo_lote(cat1, tamanho=20))

    # Adiciona bula válida de dipirona e reexecuta: deve virar "ok" e sair do próximo lote
    (bulas / "dipirona__EMS.txt").write_text((FIX / "losartana.txt").read_text(encoding="utf-8"), encoding="utf-8")
    r2 = pipeline_ingestao.executar_pipeline(
        pasta=bulas,
        arq_chunks=tmp_path / "chunks.jsonl",
        arq_manifesto=tmp_path / "manifesto.json",
        pasta_relatorios=tmp_path / "relatorios",
        atualizar_indice=False,
        arq_csv_anvisa=arq_csv,
        arq_catalogo=arq_cat,
    )
    assert r2["catalogo"]["ok"] == 5
    cat2 = json.loads(arq_cat.read_text(encoding="utf-8"))
    assert all(m["principio_ativo"] != "dipirona" for m in catalogo.proximo_lote(cat2, tamanho=20))


def test_exportar_csv_baixar_e_cli(tmp_path, monkeypatch, capsys):
    arq_csv = _escrever_csv(tmp_path / "anvisa.csv")
    arq_man = tmp_path / "manifesto.json"
    arq_cat = tmp_path / "catalogo.json"
    arq_exp = tmp_path / "catalogo_export.csv"
    arq_man.write_text(json.dumps({"arquivos": {}}), encoding="utf-8")

    code = catalogo.main([
        "--csv", str(arq_csv),
        "--manifesto", str(arq_man),
        "--saida", str(arq_cat),
        "--exportar-csv", str(arq_exp),
        "--proximo-lote", "5",
        "--json",
    ])
    assert code == 0
    payload = json.loads(capsys.readouterr().out)
    assert len(payload["proximo_lote"]) == 5
    assert arq_exp.exists()

    with arq_exp.open(encoding="utf-8-sig", newline="") as f:
        linhas = list(csv.DictReader(f, delimiter=";"))
    assert len(linhas) == payload["resumo"]["total"]
    assert all(row["status"] == "pendente" for row in linhas)

    class _RespFake:
        def __init__(self, dados: bytes):
            self._dados = dados

        def read(self) -> bytes:
            return self._dados

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

    monkeypatch.setattr(urllib.request, "urlopen", lambda req, timeout=60: _RespFake(CSV_EXEMPLO.encode("latin-1")))
    baixado = catalogo.baixar_csv_anvisa(destino=tmp_path / "baixado.csv", url="https://exemplo.test/meds.csv")
    assert baixado.exists()

    monkeypatch.setattr(urllib.request, "urlopen", lambda req, timeout=60: _RespFake(b"<html>erro</html>"))
    with pytest.raises(ValueError):
        catalogo.baixar_csv_anvisa(destino=tmp_path / "invalido.csv", url="https://exemplo.test/erro.csv")
