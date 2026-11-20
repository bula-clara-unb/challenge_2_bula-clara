# Base de bulas do MVP (issue #1)

Objetivo: ter as bulas **do paciente** reais dos 15 medicamentos do MVP ingeridas, indexadas e com
**≥ 8 das 9 seções** da RDC ANVISA 47/2009 reconhecidas em cada uma.

## Medicamentos do MVP

Definidos em `bula_clara/config.py` (`MEDICAMENTOS_MVP`), e é de lá que leem o download e o validador:

dipirona · paracetamol · ibuprofeno · ácido acetilsalicílico · losartana · enalapril · captopril ·
hidroclorotiazida · metformina · sinvastatina · omeprazol · amoxicilina · varfarina · clopidogrel · levotiroxina

## Passo a passo

```bash
source .venv/bin/activate
python scripts/baixar_bulas.py          # 1. tenta baixar pela API do bulário
python scripts/validar_bulas.py         # 2. confere as 9 seções de cada bula (sai com erro se faltar algo)
python -m bula_clara.ingestao           # 3. gera data/chunks.jsonl (mostra n/9 e quais seções faltam)
python -m bula_clara.recuperador        # 4. cria o índice
python -m bula_clara.cli "Posso tomar ibuprofeno com losartana?" --trace   # 5. teste
```

### 1. Download

`scripts/baixar_bulas.py` usa a API interna do site do Bulário Eletrônico, que não é documentada.
**Situação em 20/11/2026: a API responde `403 Forbidden` a qualquer consulta feita fora do navegador.**
O script agora para na primeira recusa (para não ficar insistindo no site da ANVISA) e lista os arquivos
que faltam baixar à mão. Não tentamos contornar o bloqueio, por exemplo imitando um navegador.

**Download manual** (o caminho que vale hoje):

1. Acesse <https://consultas.anvisa.gov.br/#/bulario/> e pesquise o princípio ativo.
2. Prefira o **genérico** ou o **medicamento de referência**.
3. Baixe a **Bula do Paciente** (não a "do Profissional", que tem outras seções).
4. Salve em `data/bulas/` com o nome do princípio ativo, usando `_` no lugar de espaço:
   `data/bulas/acido_acetilsalicilico.pdf`, `data/bulas/losartana.pdf`, …
   Sufixos são aceitos: `losartana_potassica.pdf` ou `losartana__EMS.pdf` também valem para "losartana".

Os PDFs ficam fora do git (`data/bulas/*.pdf` está no `.gitignore`). Cada pessoa do grupo baixa os seus.

### 2. Validação das seções

`scripts/validar_bulas.py` imprime uma linha por medicamento:

```
medicamento               seções  situação
losartana                    9/9  ✓ losartana.pdf
omeprazol                    7/9  ✗ omeprazol.pdf  (falta: Se esquecer uma dose, Superdose)
dipirona                       —  ✗ sem bula em data/bulas
...
14/15 medicamentos com ≥ 8/9 seções reconhecidas.
```

O código de saída é `0` só quando os 15 passam. O mínimo vem de `config.MIN_SECOES` (8).

### Se uma bula não atingir 8/9

Os títulos são encontrados por expressões regulares em `bula_clara/secoes.py` (lista `SECOES`). Para corrigir:

1. Veja o texto que o PDF devolve:
   `python -c "from bula_clara.ingestao import ler_texto; print(ler_texto(__import__('pathlib').Path('data/bulas/X.pdf')))"`
2. Procure o título da seção que falta e compare com o padrão em `SECOES`.
3. Ajuste o padrão e acrescente a variação em `tests/test_secoes_validacao.py` para ela não voltar a quebrar.

Variações que já são aceitas:

| Variação | Exemplo |
|---|---|
| Numeração com `.`, `-`, `)` ou sem espaço | `1 - PARA QUE…`, `2) COMO…`, `3.QUANDO…` |
| Título quebrado em duas linhas | `…ANTES DE USAR ESTE` / `MEDICAMENTO?` |
| "EU" e "ME" opcionais no esquecimento | `QUANDO ME ESQUECER…`, `QUANDO EU ESQUECER…` |
| "OS" opcional nos males | `QUAIS MALES QUE ESTE MEDICAMENTO…` |
| "ESTE" ou "ESSE" | `COMO ESSE MEDICAMENTO FUNCIONA?` |
| Acento decomposto pelo PDF (NFD) | `É` extraído como `E` + `◌́` (o texto passa a ser normalizado para NFC) |
| Hífen invisível (U+00AD) e palavra quebrada no fim da linha | `medica-`/`mento` |
| Citação de outra seção no meio do texto | `(ver item` / `3. QUANDO NÃO DEVO USAR…)` dentro da seção 4: títulos fora da ordem 1→9 são ignorados |

### O que é cortado

Depois da seção 9, os PDFs reais trazem **Dizeres legais** (registro MS, CNPJ, farmacêutico responsável, SAC)
e a tabela **Histórico de alteração de bula**, que às vezes repete títulos de seção. Nada disso é texto para o
paciente: sem o corte, a seção "Superdose" chegava a ~5.000 caracteres de tabela. O texto agora é
truncado no primeiro desses marcadores, e todas as bulas validadas terminam na frase padrão
"Ligue para 0800 722 6001, se você precisar de mais orientações".

## Resultado com as bulas reais (20/11/2026)

12 de 15 bulas baixadas manualmente do Bulário Eletrônico, **todas com 9/9 seções**:

| Medicamento | Seções | Chunks |
|---|---|---|
| ácido acetilsalicílico | 9/9 | 29 |
| captopril | 9/9 | 19 |
| clopidogrel | 9/9 | 32 |
| dipirona | 9/9 | 35 |
| enalapril | 9/9 | 23 |
| hidroclorotiazida | 9/9 | 28 |
| ibuprofeno | 9/9 | 18 |
| levotiroxina | 9/9 | 29 |
| losartana | 9/9 | 25 |
| metformina | 9/9 | 24 |
| paracetamol | 9/9 | 13 |
| sinvastatina | 9/9 | 18 |
| omeprazol | — | ainda não baixada |
| amoxicilina | — | ainda não baixada |
| varfarina | — | ainda não baixada |

Total: 293 chunks. `cli "Posso tomar ibuprofeno com losartana?" --trace` (TF-IDF + LLM mock) identifica os dois
medicamentos, recupera a seção 4 das duas bulas (o trecho da losartana sobre anti-inflamatórios reduzirem o
efeito na pressão) e detecta a interação.

## O que foi feito nesta etapa

- `bula_clara/config.py`: a lista do MVP e o mínimo de seções (`MEDICAMENTOS_MVP`, `MIN_SECOES`) ficam num lugar só.
- `scripts/baixar_bulas.py`: para no primeiro `401/403` e imprime o caminho exato de cada PDF que falta.
- `scripts/validar_bulas.py` (novo): verifica o critério de pronto da issue e retorna código de saída.
- `bula_clara/ingestao.py`: além de `n/9`, mostra **quais** seções não foram reconhecidas.
- `bula_clara/secoes.py`: padrões mais tolerantes (tabela acima), normalização Unicode, corte dos dizeres
  legais/histórico e títulos aceitos só em ordem crescente.
- `tests/test_secoes_validacao.py` (novo): cobre as variações e o validador.
- Os passos 3–5 (ingestão → índice → CLI) foram verificados de ponta a ponta com as bulas fictícias de
  `tests/fixtures/` (TF-IDF + LLM mock): 4/4 bulas com 9/9 seções e a interação ibuprofeno × losartana detectada.

## Pendente

- [x] Baixar manualmente os PDFs (a API está bloqueando com 403): 12/15.
- [ ] Baixar omeprazol, amoxicilina e varfarina.
- [ ] Rodar `python scripts/validar_bulas.py` até dar 15/15 e atualizar a tabela acima.
- [ ] Gerar o índice com o recuperador padrão (ChromaDB + embeddings); aqui foi validado com TF-IDF.
