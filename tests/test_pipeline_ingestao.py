"""Testes do pipeline de ingestão incremental (sem depender de ChromaDB ou pypdf)."""
import json
import shutil
from pathlib import Path

from bula_clara import config, pipeline_ingestao

FIX = Path(__file__).parent / "fixtures"


class FakeRecuperador:
    """Simula o índice vetorial em memória para validar sincronizações incrementais."""

    def __init__(self):
        self.itens: dict[str, dict] = {}
        self.chamadas: list[dict] = []

    def sincronizar_incremental(
        self,
        chunks_novos: list[dict],
        fontes_removidas: list[str],
        fontes_alteradas: list[str],
        reconstrucao_total: bool = False,
    ) -> dict:
        self.chamadas.append({
            "chunks_novos": len(chunks_novos),
            "fontes_removidas": list(fontes_removidas),
            "fontes_alteradas": list(fontes_alteradas),
            "reconstrucao_total": reconstrucao_total,
        })
        if reconstrucao_total:
            self.itens.clear()
        else:
            remover = set(fontes_removidas) | set(fontes_alteradas)
            self.itens = {k: v for k, v in self.itens.items() if v["fonte"] not in remover}
        for c in chunks_novos:
            self.itens[c["id"]] = c
        return {
            "status": "reconstruido" if reconstrucao_total else "atualizado",
            "fontes_removidas": len(set(fontes_removidas) | set(fontes_alteradas)),
            "chunks_gravados": len(chunks_novos),
            "total_indice": len(self.itens),
        }


def _copiar_fixtures(destino: Path) -> Path:
    bulas = destino / "bulas"
    bulas.mkdir(parents=True, exist_ok=True)
    for arq in FIX.glob("*.txt"):
        shutil.copy(arq, bulas / arq.name)
    return bulas


def _bula_valida(titulo_extra: str = "") -> str:
    base = (FIX / "losartana.txt").read_text(encoding="utf-8")
    return base + (f"\n{titulo_extra}\n" if titulo_extra else "")


def _rodar(tmp_path: Path, bulas: Path, rec: FakeRecuperador, **kwargs):
    return pipeline_ingestao.executar_pipeline(
        pasta=bulas,
        arq_chunks=tmp_path / "chunks.jsonl",
        arq_manifesto=tmp_path / "manifesto.json",
        pasta_relatorios=tmp_path / "relatorios",
        recuperador=rec,
        **kwargs,
    )


def test_cold_start_e_reexecucao_idempotente(tmp_path):
    bulas = _copiar_fixtures(tmp_path)
    rec = FakeRecuperador()

    r1 = _rodar(tmp_path, bulas, rec)
    assert len(r1["delta"]["novos"]) == 4
    assert r1["total_ativos"] == 4
    assert len(r1["aprovados"]) == 4
    assert r1["quarentena"] == []
    assert r1["indice"]["status"] == "atualizado"
    assert len(rec.chamadas) == 1
    assert len(rec.itens) == r1["total_chunks"]
    assert (tmp_path / "chunks.jsonl").exists()
    assert (tmp_path / "manifesto.json").exists()
    assert Path(r1["arquivo_relatorio"]).exists()

    # Segunda execução sem mudanças: zero retrabalho
    r2 = _rodar(tmp_path, bulas, rec)
    assert r2["delta"]["novos"] == []
    assert r2["delta"]["modificados"] == []
    assert r2["delta"]["removidos"] == []
    assert len(r2["delta"]["inalterados"]) == 4
    assert r2["indice"]["status"] == "sem_alteracoes"
    assert len(rec.chamadas) == 1


def test_adicao_modificacao_e_remocao_incrementais(tmp_path):
    bulas = _copiar_fixtures(tmp_path)
    rec = FakeRecuperador()
    r1 = _rodar(tmp_path, bulas, rec)
    chunks_iniciais = r1["total_chunks"]

    # 1) Adição com fabricante no nome do arquivo
    (bulas / "dipirona__EMS.txt").write_text(_bula_valida(), encoding="utf-8")
    r2 = _rodar(tmp_path, bulas, rec)
    assert r2["delta"]["novos"] == ["dipirona__EMS.txt"]
    assert r2["delta"]["modificados"] == []
    assert r2["total_ativos"] == 5
    manifesto = json.loads((tmp_path / "manifesto.json").read_text(encoding="utf-8"))
    assert manifesto["arquivos"]["dipirona__EMS.txt"]["fabricante"] == "EMS"
    assert manifesto["arquivos"]["dipirona__EMS.txt"]["versao_bula"] is None
    chunks_dipirona = [c for c in rec.itens.values() if c["fonte"] == "dipirona__EMS.txt"]
    assert chunks_dipirona and all(c["fabricante"] == "EMS" for c in chunks_dipirona)

    # 2) Modificação de um único arquivo existente
    texto_mod = _bula_valida() + "\nObservação adicional para o paciente."
    (bulas / "losartana.txt").write_text(texto_mod, encoding="utf-8")
    r3 = _rodar(tmp_path, bulas, rec)
    assert r3["delta"]["modificados"] == ["losartana.txt"]
    assert r3["delta"]["novos"] == []
    assert any("Observação adicional" in c["texto"] for c in rec.itens.values() if c["fonte"] == "losartana.txt")

    # 3) Remoção de um arquivo
    (bulas / "ibuprofeno.txt").unlink()
    r4 = _rodar(tmp_path, bulas, rec)
    assert r4["delta"]["removidos"] == ["ibuprofeno.txt"]
    assert r4["total_ativos"] == 4
    assert not any(c["fonte"] == "ibuprofeno.txt" for c in rec.itens.values())
    assert any(c["fonte"] == "dipirona__EMS.txt" for c in rec.itens.values())
    assert r4["total_chunks"] == chunks_iniciais  # dipirona entrou (9), ibuprofeno saiu (9)


def test_portao_qualidade_quarentena_e_avisos(tmp_path):
    bulas = _copiar_fixtures(tmp_path)
    rec = FakeRecuperador()
    _rodar(tmp_path, bulas, rec)

    # Bula incompleta (< 8/9 seções) vai para quarentena e não contamina chunks/índice
    (bulas / "incompleto.txt").write_text(
        "1. PARA QUE ESTE MEDICAMENTO É INDICADO?\nDor.\n"
        "2. COMO ESTE MEDICAMENTO FUNCIONA?\nRápido.\n",
        encoding="utf-8",
    )
    # Medicamento válido fora de conhecimento.CLASSES gera aviso
    (bulas / "atenolol.txt").write_text(_bula_valida(), encoding="utf-8")

    r = _rodar(tmp_path, bulas, rec)
    assert [q["fonte"] for q in r["quarentena"]] == ["incompleto.txt"]
    assert not any(c["fonte"] == "incompleto.txt" for c in rec.itens.values())
    assert any(a["fonte"] == "atenolol.txt" and "sem_classes_em_conhecimento" in a["avisos"] for a in r["avisos"])
    assert any(c["fonte"] == "atenolol.txt" for c in rec.itens.values())

    # Reexecução mantém incompleto.txt em quarentena sem reprocessar
    r_again = _rodar(tmp_path, bulas, rec)
    assert r_again["delta"]["quarentena_inalterados"] == ["incompleto.txt"]
    assert [q["fonte"] for q in r_again["quarentena"]] == ["incompleto.txt"]


def test_colisao_medicamento_duplicado_vai_para_quarentena(tmp_path):
    bulas = _copiar_fixtures(tmp_path)
    rec = FakeRecuperador()
    _rodar(tmp_path, bulas, rec)

    (bulas / "losartana__EMS.txt").write_text(_bula_valida(), encoding="utf-8")
    r = _rodar(tmp_path, bulas, rec)
    assert [q["fonte"] for q in r["quarentena"]] == ["losartana__EMS.txt"]
    assert "já ingerido" in r["quarentena"][0]["motivo"]
    assert not any(c["fonte"] == "losartana__EMS.txt" for c in rec.itens.values())


def test_dry_run_forcar_e_mudanca_versao_parser(tmp_path, monkeypatch):
    bulas = _copiar_fixtures(tmp_path)
    rec = FakeRecuperador()

    # dry-run não grava arquivos nem altera o índice
    r_dry = _rodar(tmp_path, bulas, rec, dry_run=True)
    assert r_dry["dry_run"] is True
    assert r_dry["indice"]["status"] == "simulado"
    assert not (tmp_path / "chunks.jsonl").exists()
    assert not (tmp_path / "manifesto.json").exists()
    assert rec.chamadas == []

    # Execução real + --forcar
    _rodar(tmp_path, bulas, rec)
    r_forcar = _rodar(tmp_path, bulas, rec, forcar=True)
    assert r_forcar["reconstrucao_total"] is True
    assert rec.chamadas[-1]["reconstrucao_total"] is True

    # Mudança de VERSAO_PARSER dispara reconstrução automática
    monkeypatch.setattr(config, "VERSAO_PARSER", "2.0")
    r_parser = _rodar(tmp_path, bulas, rec)
    assert r_parser["reconstrucao_total"] is True
    assert rec.chamadas[-1]["reconstrucao_total"] is True


def test_metadados_json_e_cli(tmp_path, capsys):
    bulas = _copiar_fixtures(tmp_path)
    (bulas / "metadados.json").write_text(
        json.dumps({"losartana.txt": {"fabricante": "Medley", "versao_bula": "2025-03-01"}}),
        encoding="utf-8",
    )

    code = pipeline_ingestao.main([
        "--pasta", str(bulas),
        "--chunks", str(tmp_path / "chunks.jsonl"),
        "--manifesto", str(tmp_path / "manifesto.json"),
        "--relatorios", "",
        "--sem-indice",
        "--json",
    ])
    assert code == 0
    saida = json.loads(capsys.readouterr().out)
    assert saida["total_ativos"] == 4
    manifesto = json.loads((tmp_path / "manifesto.json").read_text(encoding="utf-8"))
    assert manifesto["arquivos"]["losartana.txt"]["fabricante"] == "Medley"
    assert manifesto["arquivos"]["losartana.txt"]["versao_bula"] == "2025-03-01"
    assert manifesto["arquivos"]["paracetamol.txt"]["versao_bula"] is None

    # --exigir-mvp falha pois há apenas 4 dos 15 medicamentos do MVP
    code_mvp = pipeline_ingestao.main([
        "--pasta", str(bulas),
        "--chunks", str(tmp_path / "chunks.jsonl"),
        "--manifesto", str(tmp_path / "manifesto.json"),
        "--relatorios", "",
        "--sem-indice",
        "--exigir-mvp",
    ])
    assert code_mvp == 1

    # --falhar-em-quarentena retorna 1 quando há arquivo inválido
    (bulas / "quebrado.txt").write_text("texto sem seções", encoding="utf-8")
    code_quar = pipeline_ingestao.main([
        "--pasta", str(bulas),
        "--chunks", str(tmp_path / "chunks.jsonl"),
        "--manifesto", str(tmp_path / "manifesto.json"),
        "--relatorios", "",
        "--sem-indice",
        "--falhar-em-quarentena",
    ])
    assert code_quar == 1
