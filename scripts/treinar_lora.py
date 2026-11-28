"""Fine-tuning LoRA do Qwen2.5-1.5B-Instruct com o dataset das bulas.
Feito para o Google Colab gratuito (GPU T4): ~10–25 min para ~800–1500 exemplos.

Uso:  python scripts/treinar_lora.py --epocas 3
Saída: modelos/bula-clara-lora/   (adaptador LoRA + historico_treino.json + resumo_treino.json)
       resultados/relatorio_treino_lora.md + grafico_perda_lora.png/.svg

A perda é calculada só nos tokens da RESPOSTA (o prompt/contexto é mascarado com -100).
"""
import argparse
import json
import math
import sys
import time
from pathlib import Path

import torch
from peft import LoraConfig, get_peft_model
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    DataCollatorForSeq2Seq,
    Trainer,
    TrainingArguments,
)

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

from scripts.plotar_treino import gerar_relatorio_treino


def carregar(arq: Path) -> list[dict]:
    with open(arq, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


class DatasetChat(torch.utils.data.Dataset):
    def __init__(self, exemplos: list[dict], tok, max_len: int):
        self.itens = []
        for e in exemplos:
            msgs = e["messages"]
            prompt = tok.apply_chat_template(msgs[:-1], tokenize=False, add_generation_prompt=True)
            resp = msgs[-1]["content"] + (tok.eos_token or "")
            ids_prompt = tok(prompt, add_special_tokens=False)["input_ids"]
            ids_resp = tok(resp, add_special_tokens=False)["input_ids"]
            if len(ids_resp) >= max_len:
                ids_resp = ids_resp[: max_len - 1]
                ids_prompt = []
            elif len(ids_prompt) + len(ids_resp) > max_len:
                # Corta o excesso do início do contexto, preservando a resposta inteira
                ids_prompt = ids_prompt[-(max_len - len(ids_resp)) :]
            ids = ids_prompt + ids_resp
            labels = [-100] * len(ids_prompt) + ids_resp
            self.itens.append({"input_ids": ids, "attention_mask": [1] * len(ids), "labels": labels})

    def __len__(self):
        return len(self.itens)

    def __getitem__(self, i):
        return self.itens[i]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelo", default="Qwen/Qwen2.5-1.5B-Instruct")
    ap.add_argument("--dados", default=str(RAIZ / "data" / "finetune"))
    ap.add_argument("--saida", default=str(RAIZ / "modelos" / "bula-clara-lora"))
    ap.add_argument("--relatorio", default=str(RAIZ / "resultados"))
    ap.add_argument("--epocas", type=float, default=3)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--max_len", type=int, default=1536)
    ap.add_argument("--rank", type=int, default=16)
    ap.add_argument("--seed", type=int, default=42)
    a = ap.parse_args(argv)

    torch.manual_seed(a.seed)
    tem_cuda = torch.cuda.is_available()
    bf16 = tem_cuda and torch.cuda.is_bf16_supported()
    fp16 = tem_cuda and not bf16
    dispositivo = torch.cuda.get_device_name(0) if tem_cuda else "cpu"

    tok = AutoTokenizer.from_pretrained(a.modelo)
    tok.pad_token = tok.pad_token or tok.eos_token

    kwargs_modelo: dict = {"torch_dtype": (torch.bfloat16 if bf16 else torch.float16) if tem_cuda else torch.float32}
    if tem_cuda:
        kwargs_modelo["device_map"] = "auto"

    modelo = AutoModelForCausalLM.from_pretrained(a.modelo, **kwargs_modelo)
    modelo.gradient_checkpointing_enable()
    modelo.enable_input_require_grads()
    modelo = get_peft_model(
        modelo,
        LoraConfig(
            r=a.rank,
            lora_alpha=a.rank * 2,
            lora_dropout=0.05,
            task_type="CAUSAL_LM",
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        ),
    )
    modelo.print_trainable_parameters()

    treino = DatasetChat(carregar(Path(a.dados) / "treino.jsonl"), tok, a.max_len)
    val = DatasetChat(carregar(Path(a.dados) / "validacao.jsonl"), tok, a.max_len)
    print(f"dispositivo={dispositivo}  treino={len(treino)}  validação={len(val)}")

    inicio = time.perf_counter()
    args = TrainingArguments(
        output_dir=str(RAIZ / "modelos" / "checkpoints"),
        num_train_epochs=a.epocas,
        per_device_train_batch_size=2,
        per_device_eval_batch_size=2,
        gradient_accumulation_steps=8,
        learning_rate=a.lr,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=1,
        bf16=bf16,
        fp16=fp16,
        seed=a.seed,
        report_to="none",
        optim="adamw_torch",
    )
    trainer = Trainer(
        model=modelo,
        args=args,
        train_dataset=treino,
        eval_dataset=val,
        data_collator=DataCollatorForSeq2Seq(tok, padding=True, label_pad_token_id=-100),
    )
    trainer.train()
    m = trainer.evaluate()
    duracao_min = round((time.perf_counter() - inicio) / 60, 2)
    eval_loss = round(float(m["eval_loss"]), 4)
    perplexidade = round(math.exp(min(eval_loss, 20.0)), 2)
    print(f"perda de validação final: {eval_loss:.4f} (perplexidade={perplexidade:.2f})")

    pasta_saida = Path(a.saida)
    pasta_saida.mkdir(parents=True, exist_ok=True)
    modelo.save_pretrained(pasta_saida)
    tok.save_pretrained(pasta_saida)

    arq_hist = pasta_saida / "historico_treino.json"
    arq_hist.write_text(json.dumps(trainer.state.log_history, indent=2), encoding="utf-8")

    treinaveis, totais = modelo.get_nb_trainable_parameters()
    resumo = {
        "modelo_base": a.modelo,
        "epocas": a.epocas,
        "lr": a.lr,
        "rank": a.rank,
        "max_len": a.max_len,
        "seed": a.seed,
        "exemplos_treino": len(treino),
        "exemplos_validacao": len(val),
        "parametros_treinaveis": treinaveis,
        "parametros_totais": totais,
        "dispositivo": dispositivo,
        "precisao": "bf16" if bf16 else ("fp16" if fp16 else "fp32"),
        "duracao_min": duracao_min,
        "eval_loss_final": eval_loss,
        "perplexidade_final": perplexidade,
    }
    arq_resumo = pasta_saida / "resumo_treino.json"
    arq_resumo.write_text(json.dumps(resumo, ensure_ascii=False, indent=2), encoding="utf-8")

    rel = gerar_relatorio_treino(arq_hist, Path(a.relatorio), arq_resumo)
    print(f"Adaptador LoRA salvo em {pasta_saida}")
    print(f"Relatório e gráfico salvos em {rel['relatorio']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
