"""Testes do pipeline de preparo do dataset LoRA, gráfico de perda e notebook do Colab"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

from bula_clara import ingestao
from scripts import gerar_dataset_finetune, plotar_treino

FIX = Path(__file__).parent / "fixtures"


def test_gerar_dataset_usa_todos_chunks_sem_vazamento(tmp_path):
    chunks = ingestao.main(FIX, tmp_path / "chunks.jsonl")
    # Garante múltiplos chunks (::0 e ::1) na mesma seção
    chunk_extra = {
        **chunks[0],
        "id": f"{chunks[0]['medicamento']}::{chunks[0]['secao']}::1",
        "texto": "Informação complementar da bula para garantir uso do segundo pedaço no treino.",
    }
    chunks_com_extra = [*chunks, chunk_extra]

    treino, validacao, stats = gerar_dataset_finetune.gerar_exemplos(chunks_com_extra, seed=42, val_ratio=0.15)
    assert treino and validacao
    tipos = {ex["tipo"] for ex in treino} | {ex["tipo"] for ex in validacao}
    assert {"rag", "dose", "interacao"} <= tipos

    textos_prompts = "\n".join(ex["messages"][1]["content"] for ex in treino + validacao)
    assert "segundo pedaço no treino" in textos_prompts

    assert stats["grupos_treino"] + stats["grupos_validacao"] == len({(c["medicamento"], c["secao"]) for c in chunks_com_extra})

    arq_chunks = tmp_path / "chunks_cli.jsonl"
    arq_chunks.write_text("\n".join(json.dumps(c, ensure_ascii=False) for c in chunks_com_extra) + "\n", encoding="utf-8")
    pasta_out = tmp_path / "finetune"
    code = gerar_dataset_finetune.main(["--chunks", str(arq_chunks), "--saida", str(pasta_out), "--seed", "42"])
    assert code == 0
    assert (pasta_out / "treino.jsonl").exists()
    assert (pasta_out / "validacao.jsonl").exists()
    assert (pasta_out / "resumo_dataset.json").exists()
    primeiro = json.loads((pasta_out / "treino.jsonl").read_text(encoding="utf-8").splitlines()[0])
    assert list(primeiro.keys()) == ["messages"]


def test_plotar_treino_gera_svg_e_relatorio(tmp_path):
    historico = [
        {"loss": 2.10, "step": 10, "epoch": 0.5},
        {"loss": 1.65, "step": 20, "epoch": 1.0},
        {"eval_loss": 1.58, "step": 20, "epoch": 1.0},
        {"loss": 1.22, "step": 30, "epoch": 1.5},
        {"loss": 0.98, "step": 40, "epoch": 2.0},
        {"eval_loss": 1.15, "step": 40, "epoch": 2.0},
    ]
    resumo = {
        "modelo_base": "Qwen/Qwen2.5-1.5B-Instruct",
        "epocas": 2,
        "rank": 16,
        "lr": 2e-4,
        "exemplos_treino": 800,
        "exemplos_validacao": 90,
        "dispositivo": "Tesla T4",
        "duracao_min": 14.2,
    }
    arq_hist = tmp_path / "historico_treino.json"
    arq_res = tmp_path / "resumo_treino.json"
    arq_hist.write_text(json.dumps(historico), encoding="utf-8")
    arq_res.write_text(json.dumps(resumo), encoding="utf-8")

    rel = plotar_treino.gerar_relatorio_treino(arq_hist, tmp_path / "resultados", arq_res)
    svg_txt = Path(rel["svg"]).read_text(encoding="utf-8")
    md_txt = Path(rel["relatorio"]).read_text(encoding="utf-8")

    assert "<svg" in svg_txt and "<polyline" in svg_txt
    assert "Treino (loss)" in svg_txt and "Validação (eval_loss)" in svg_txt
    assert rel["eval_loss_final"] == 1.15
    assert rel["perplexidade_final"] is not None
    assert "1.1500" in md_txt and "Tesla T4" in md_txt


def test_notebook_colab_valido_e_sem_placeholder():
    nb_path = RAIZ / "notebooks" / "treino_colab.ipynb"
    nb = json.loads(nb_path.read_text(encoding="utf-8"))
    assert nb["nbformat"] == 4
    conteudo = "\n".join("".join(c["source"]) for c in nb["cells"])
    assert "SEU_USUARIO" not in conteudo
    assert "bula-clara-unb/challenge_2_bula-clara" in conteudo
    assert "gerar_dataset_finetune.py" in conteudo
    assert "treinar_lora.py" in conteudo
    assert "grafico_perda_lora" in conteudo
    assert "BULA_RECUPERADOR=chroma" in conteudo
