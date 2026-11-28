# Treino LoRA do Bula Clara (Issue #2)

Este guia descreve como preparar os dados, executar o fine-tuning com LoRA no **Google Colab (GPU T4)** e registrar o adaptador e o gráfico de perda sem commitar pesos no repositório.

## 1. Gerar `data/chunks.jsonl` localmente (com os 15 PDFs)

Com os PDFs reais da ANVISA em `data/bulas/`:

```bash
python scripts/validar_bulas.py
python -m bula_clara.ingestao
```

Isso gera o arquivo `data/chunks.jsonl` (com os 15 medicamentos do MVP).

## 2. Rodar o treino no Google Colab (GPU T4)

1. Abra [`notebooks/treino_colab.ipynb`](../notebooks/treino_colab.ipynb) no Google Colab.
2. Em **Ambiente de execução → Alterar tipo de ambiente de execução**, selecione **GPU T4**.
3. Envie `data/chunks.jsonl` para `/content/chunks.jsonl` (ou coloque no Google Drive e ative `USAR_DRIVE = True`).
4. Execute em ordem:
   - `scripts/gerar_dataset_finetune.py`: usa todos os chunks válidos (sem vazamento entre treino e validação por `(medicamento, secao)`), gerando exemplos de RAG, ausência de contexto, recusa de dose alinhada ao `seguranca.py` e interações com `INFORMAÇÕES VERIFICADAS`.
   - `scripts/treinar_lora.py --epocas 3 --rank 16 --lr 2e-4`: treina o `Qwen/Qwen2.5-1.5B-Instruct` com LoRA em `fp16` na T4, mascara o prompt com `-100` preservando a resposta inteira e salva o adaptador, `historico_treino.json` e `resumo_treino.json` em `modelos/bula-clara-lora/`.
   - `scripts/plotar_treino.py`: é chamado automaticamente ao final do treino e gera `resultados/grafico_perda_lora.png` (e `.svg`) + `resultados/relatorio_treino_lora.md`.
   - `scripts/avaliar.py`: compara `base` (`--sem-lora`) contra `lora` usando `ChromaDB`.

## 3. Publicação do adaptador (sem commitar pesos)

- Os diretórios `modelos/` e `resultados/*.json` ficam fora do Git (`.gitignore`).
- Ao final do notebook, baixe `lora_e_resultados.zip` (ou salve direto no Google Drive) e publique o adaptador no Drive do grupo ou em uma **GitHub Release**.
- O relatório (`resultados/relatorio_treino_lora.md`) e o gráfico (`resultados/grafico_perda_lora.png` / `.svg`) podem ser anexados na issue #2 ou no relatório final (#14).
