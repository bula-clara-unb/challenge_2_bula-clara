"""Backends de LLM com a mesma interface: gerar(mensagens) -> str.

- hf:     modelo local via transformers (+ adaptador LoRA treinado pelo grupo, se existir)
- ollama: modelo servido pelo Ollama (útil para rodar o modelo base sem GPU)
- mock:   sem modelo; devolve trechos do contexto (para testes e para rodar sem baixar nada)
"""
import re
from functools import lru_cache
from pathlib import Path

from . import config


class LLMHF:
    def __init__(self, modelo=config.MODELO_BASE, adaptador=config.ADAPTADOR_LORA, usar_lora=True):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        self.torch = torch
        self.tok = AutoTokenizer.from_pretrained(modelo)
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        self.modelo = AutoModelForCausalLM.from_pretrained(modelo, torch_dtype=dtype, device_map="auto")
        self.nome = modelo
        if usar_lora and adaptador and Path(adaptador).exists():
            from peft import PeftModel
            self.modelo = PeftModel.from_pretrained(self.modelo, adaptador)
            self.nome = f"{modelo} + LoRA"
        self.modelo.eval()

    def gerar(self, mensagens, max_tokens=config.MAX_NOVOS_TOKENS):
        texto = self.tok.apply_chat_template(mensagens, tokenize=False, add_generation_prompt=True)
        entrada = self.tok(texto, return_tensors="pt", add_special_tokens=False)["input_ids"].to(self.modelo.device)
        with self.torch.no_grad():
            saida = self.modelo.generate(entrada, max_new_tokens=max_tokens, do_sample=False,
                                         repetition_penalty=1.1, pad_token_id=self.tok.eos_token_id)
        return self.tok.decode(saida[0][entrada.shape[1]:], skip_special_tokens=True).strip()


class LLMOllama:
    def __init__(self, modelo=config.OLLAMA_MODELO):
        self.nome = f"ollama:{modelo}"
        self.modelo = modelo

    def gerar(self, mensagens, max_tokens=config.MAX_NOVOS_TOKENS):
        import requests
        r = requests.post(f"{config.OLLAMA_URL}/api/chat", timeout=300, json={
            "model": self.modelo, "messages": mensagens, "stream": False,
            "options": {"temperature": 0, "num_predict": max_tokens}})
        r.raise_for_status()
        return r.json()["message"]["content"].strip()


class LLMMock:
    """Extrai as 2 primeiras frases de cada trecho [n] do contexto. Sem contexto, responde genericamente."""
    nome = "mock"

    def gerar(self, mensagens, max_tokens=config.MAX_NOVOS_TOKENS):
        prompt = mensagens[-1]["content"]
        trechos = re.findall(r"\[(\d+)\][^\n]*\n(.+?)(?=\n\[\d+\]|\nPERGUNTA:|\Z)", prompt, re.S)
        if not trechos:
            return "De forma geral, siga a orientação do seu médico e leia a bula."
        partes = []
        for n, t in trechos[:2]:
            frases = re.split(r"(?<=[.!?])\s+", " ".join(t.split()))
            partes.append(" ".join(frases[:2]) + f" [{n}]")
        return " ".join(partes)


@lru_cache(maxsize=4)
def criar_llm(backend: str = config.LLM_BACKEND, usar_lora: bool = True):
    if backend == "hf":
        return LLMHF(usar_lora=usar_lora)
    if backend == "ollama":
        return LLMOllama()
    return LLMMock()
