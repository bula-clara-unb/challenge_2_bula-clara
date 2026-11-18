# Bula Clara 💊

Assistente multiagente que explica **bulas oficiais da ANVISA** em linguagem simples, verifica **interações** entre
os medicamentos do usuário e aplica **regras de segurança**. A LLM é um **Qwen2.5-1.5B-Instruct ajustado pelo grupo com LoRA**.

Challenge 2 — Tópicos Especiais em Software (UnB/FCTE) · Big Idea: Qualidade de Vida
Definições do projeto (problema, stakeholders, riscos, métricas): [`docs/definicoes.md`](docs/definicoes.md)

## Arquitetura

```
pergunta ─► Segurança (pré) ─► Identificador ─► Recuperador (RAG) ─► Interações ─► Simplificador (LLM) ─► Segurança (pós) ─► resposta + fontes
              regras             nome/apelido/     ChromaDB +           cruza a seção 4     Qwen2.5 + LoRA      valida doses,
              emergência         erro de digitação embeddings,         das bulas           (único agente       citação, avisos
              e dose                               filtro por seção                         que usa LLM)
```

| Pasta/arquivo | Conteúdo |
|---|---|
| `bula_clara/ingestao.py` | PDF → 9 seções da RDC 47/2009 → `data/chunks.jsonl` |
| `bula_clara/recuperador.py` | ChromaDB + embeddings multilíngues (reserva: TF-IDF) |
| `bula_clara/llm.py` | backends `hf` (local + LoRA), `ollama`, `mock` |
| `bula_clara/agentes/` | um arquivo por agente + `orquestrador.py` |
| `scripts/baixar_bulas.py` | baixa as bulas do Bulário Eletrônico |
| `scripts/gerar_dataset_finetune.py` / `treinar_lora.py` | fine-tuning |
| `scripts/avaliar.py` | métricas: LLM puro × RAG × multiagentes |
| `notebooks/treino_colab.ipynb` | treino no Colab (GPU T4 gratuita) |

## Rodar (resumo)

```bash
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/baixar_bulas.py          # ou baixe os PDFs à mão para data/bulas/
python -m bula_clara.ingestao
python -m bula_clara.recuperador        # cria o índice
python -m bula_clara.cli "Posso tomar ibuprofeno com losartana?" --trace
uvicorn bula_clara.api:app --reload     # http://localhost:8000/docs
pytest -q                               # testes (não precisam de modelo)
```

Variáveis úteis: `BULA_LLM=hf|ollama|mock`, `BULA_RECUPERADOR=chroma|tfidf`, `BULA_LORA=caminho/do/adaptador`.

> ⚠️ Projeto acadêmico. Não substitui médico ou farmacêutico. Emergência: SAMU 192 · Disque-Intoxicação 0800-722-6001.

## Semana 4 — Multimodal (foto e voz)

```bash
pip install -r requirements-multimodal.txt
# + instalar o Tesseract com Português (Windows: https://github.com/UB-Mannheim/tesseract/wiki)
python -m bula_clara.cli --foto caixa.jpg --trace                  # identifica o remédio pela foto
python -m bula_clara.cli "posso tomar com varfarina?" --foto caixa.jpg
python -m bula_clara.cli --audio pergunta.ogg --falar              # pergunta falada, resposta em mp3
python scripts/avaliar_imagens.py                                  # acurácia nas fotos de data/avaliacao/fotos/
```
API: `POST /perguntar-multimodal` (form-data: `pergunta`, `medicamentos_em_uso`, `imagem`, `audio`) e `POST /falar`.
Código: `bula_clara/multimodal/` (OCR e voz), `bula_clara/agentes/leitor_imagem.py`, `bula_clara/assistente.py`.
