# Pipeline de Ingestão Incremental

Este pipeline permite evoluir a base de bulas do Bula Clara de forma contínua e segura sem reprocessar arquivos que não mudaram.

## Como funciona

1. **Detecção de delta (`SHA-256`):** compara os arquivos em `data/bulas/` (`.pdf` e `.txt`) com o histórico salvo em `data/manifesto.json`:
   - **Inalterados:** mesmo `SHA-256` e mesmos metadados — são pulados (zero retrabalho).
   - **Novos / modificados:** apenas esses passam pela extração de texto e segmentação na RDC ANVISA 47/2009.
   - **Removidos:** seus chunks são removidos de `data/chunks.jsonl` e do índice vetorial.
   - **Mudança de versão:** se `VERSAO_PARSER` ou `MODELO_EMBEDDING` em `bula_clara/config.py` mudar (ou com `--forcar`), o pipeline dispara reconstrução completa automaticamente.
2. **Portão de qualidade:**
   - Exige no mínimo `config.MIN_SECOES` (8/9 seções) para ativar a bula. Arquivos abaixo do mínimo ou com medicamento duplicado entram em **quarentena** (não contaminam `data/chunks.jsonl` nem o índice).
   - Medicamentos válidos ainda ausentes em `bula_clara/conhecimento.py` (`CLASSES`) geram aviso `sem_classes_em_conhecimento` no relatório.
3. **Escrita atômica e upsert no ChromaDB:**
   - `data/chunks.jsonl`, `data/manifesto.json` e o relatório em `data/relatorios/` são gravados via arquivo temporário + `os.replace`.
   - O ChromaDB recebe apenas remoção das fontes alteradas/removidas e `upsert` dos chunks novos/modificados.

## Metadados opcionais (`metadados.json`)

Para registrar procedência sem inventar datas (issue #22), você pode manter um arquivo opcional `data/bulas/metadados.json`:

```json
{
  "losartana__EMS.pdf": {
    "fabricante": "EMS",
    "versao_bula": "2025-03-01"
  }
}
```

Quando ausente, `versao_bula` permanece `null` e o fabricante é inferido do sufixo `__FABRICANTE` no nome do arquivo, se existir.

## Execução local (CLI)

```bash
python -m bula_clara.pipeline_ingestao
# ou pelo script wrapper:
python scripts/rodar_ingestao.py
```

Opções principais:
- `--dry-run`: simula o delta e o portão de qualidade sem alterar `chunks.jsonl`, `manifesto.json` nem o índice.
- `--forcar`: força reprocessamento e reconstrução total do índice.
- `--sem-indice`: atualiza apenas `chunks.jsonl` e `manifesto.json` (útil em ambientes sem `chromadb`).
- `--falhar-em-quarentena`: sai com código `1` se algum arquivo estiver em quarentena.
- `--exigir-mvp`: sai com código `1` se faltar algum medicamento de `MEDICAMENTOS_MVP`.
- `--json`: imprime o relatório completo em JSON na saída padrão.

## Rotina no GitHub Actions

O workflow `.github/workflows/ingestao-incremental.yml` executa o pipeline:
- **Agendado:** toda segunda-feira às 06:00 UTC (`cron: "0 6 * * 1"`).
- **Manual (`workflow_dispatch`):** permite escolher `pasta`, `forcar`, `dry_run` e `falhar_em_quarentena`.
- **Em PRs/pushes:** quando há mudanças nos módulos de ingestão/segmentação.

O estado incremental entre execuções no Actions é preservado em `.ingestao-state/` via `actions/cache`, e o manifesto + relatório são publicados como artefato (`ingestao-relatorio`).

## Catálogo oficial da ANVISA (`ok` × `pendente`) e lotes incrementais

O módulo `bula_clara/catalogo.py` cruza o arquivo oficial `DADOS_ABERTOS_MEDICAMENTOS.csv` (Dados Abertos da ANVISA) com `data/manifesto.json` sem editar o CSV original:

- **`ok`**: medicamento ativo no `manifesto.json` (já ingerido e aprovado no portão de qualidade).
- **`quarentena`**: arquivo presente no manifesto, mas barrado pelo portão de qualidade.
- **`pendente`**: presente no catálogo oficial ou no MVP, ainda sem bula ingerida.

```bash
# 1. Baixar o CSV oficial e listar os próximos 15 medicamentos sem "ok"
python -m bula_clara.catalogo --baixar --proximo-lote 15

# 2. Exportar a tabela de acompanhamento (delimitada por ';' em UTF-8 para Excel)
python -m bula_clara.catalogo --exportar-csv data/catalogo.csv

# 3. Após colocar novos PDFs em data/bulas/, rodar o pipeline incremental
# (quando DADOS_ABERTOS_MEDICAMENTOS.csv existir, o catálogo é atualizado automaticamente)
python -m bula_clara.pipeline_ingestao
```

