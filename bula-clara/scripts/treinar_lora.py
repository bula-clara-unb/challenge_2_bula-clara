"""Fine-tuning LoRA do Qwen2.5-1.5B-Instruct com o dataset das bulas.
Feito para o Google Colab gratuito (GPU T4): ~20–40 min para 1–2 mil exemplos.

Uso:  python scripts/treinar_lora.py --epocas 2
Saída: modelos/bula-clara-lora/   (adaptador LoRA, ~20–40 MB — é isso que o grupo "treinou")

A perda é calculada só nos tokens da RESPOSTA (o prompt/contexto é mascarado com -100).
"""
import argparse
import json
from pathlib import Path

import torch
from peft import LoraConfig, get_peft_model
from transformers import (AutoModelForCausalLM, AutoTokenizer, DataCollatorForSeq2Seq, Trainer,
                          TrainingArguments)

RAIZ = Path(__file__).resolve().parent.parent


def carregar(arq):
    with open(arq, encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


class DatasetChat(torch.utils.data.Dataset):
    def __init__(self, exemplos, tok, max_len):
        self.itens = []
        for e in exemplos:
            msgs = e["messages"]
            prompt = tok.apply_chat_template(msgs[:-1], tokenize=False, add_generation_prompt=True)
            completo = prompt + msgs[-1]["content"] + tok.eos_token
            ids_prompt = tok(prompt, add_special_tokens=False)["input_ids"]
            ids = tok(completo, add_special_tokens=False)["input_ids"]
            if len(ids) > max_len:              # corta o contexto pela esquerda, preserva a resposta
                corte = len(ids) - max_len
                ids, ids_prompt = ids[corte:], ids_prompt[corte:]
            labels = [-100] * len(ids_prompt) + ids[len(ids_prompt):]
            self.itens.append({"input_ids": ids, "attention_mask": [1] * len(ids), "labels": labels})

    def __len__(self):
        return len(self.itens)

    def __getitem__(self, i):
        return self.itens[i]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelo", default="Qwen/Qwen2.5-1.5B-Instruct")
    ap.add_argument("--dados", default=str(RAIZ / "data" / "finetune"))
    ap.add_argument("--saida", default=str(RAIZ / "modelos" / "bula-clara-lora"))
    ap.add_argument("--epocas", type=float, default=2)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--max_len", type=int, default=1536)
    ap.add_argument("--rank", type=int, default=16)
    a = ap.parse_args()

    tok = AutoTokenizer.from_pretrained(a.modelo)
    tok.pad_token = tok.pad_token or tok.eos_token
    bf16 = torch.cuda.is_available() and torch.cuda.is_bf16_supported()
    modelo = AutoModelForCausalLM.from_pretrained(
        a.modelo, torch_dtype=torch.bfloat16 if bf16 else torch.float16, device_map="auto")
    modelo.gradient_checkpointing_enable()
    modelo.enable_input_require_grads()
    modelo = get_peft_model(modelo, LoraConfig(
        r=a.rank, lora_alpha=a.rank * 2, lora_dropout=0.05, task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]))
    modelo.print_trainable_parameters()

    treino = DatasetChat(carregar(Path(a.dados) / "treino.jsonl"), tok, a.max_len)
    val = DatasetChat(carregar(Path(a.dados) / "validacao.jsonl"), tok, a.max_len)
    print(f"treino={len(treino)}  validação={len(val)}")

    args = TrainingArguments(
        output_dir=str(RAIZ / "modelos" / "checkpoints"), num_train_epochs=a.epocas,
        per_device_train_batch_size=2, per_device_eval_batch_size=2, gradient_accumulation_steps=8,
        learning_rate=a.lr, lr_scheduler_type="cosine", warmup_ratio=0.05, logging_steps=10,
        eval_strategy="epoch", save_strategy="epoch", save_total_limit=1,
        bf16=bf16, fp16=not bf16, report_to="none", optim="adamw_torch")
    trainer = Trainer(model=modelo, args=args, train_dataset=treino, eval_dataset=val,
                      data_collator=DataCollatorForSeq2Seq(tok, padding=True, label_pad_token_id=-100))
    trainer.train()
    m = trainer.evaluate()
    print(f"perda de validação final: {m['eval_loss']:.4f}")
    modelo.save_pretrained(a.saida)
    tok.save_pretrained(a.saida)
    (Path(a.saida) / "historico_treino.json").write_text(json.dumps(trainer.state.log_history, indent=2))
    print(f"Adaptador LoRA salvo em {a.saida}")


if __name__ == "__main__":
    main()
