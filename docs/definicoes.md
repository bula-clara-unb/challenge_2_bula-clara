# Bula Clara — Definições do Projeto (Semana 1)

**Challenge 2 · Big Idea: Qualidade de Vida**
> "Empoderando pessoas com IA para compreender melhor, decidir melhor e viver melhor."

## 1. Essential Question

**Como a IA pode ajudar pessoas a compreender as bulas dos seus medicamentos e a identificar riscos de uso e de interação, para que decidam com mais segurança quando e como procurar um profissional de saúde?**

## 2. Problema

- A bula é o documento oficial de orientação ao paciente, mas usa linguagem técnica, letra pequena e textos longos. Quem mais depende dela costuma ter mais dificuldade de ler: idosos, pessoas com baixa escolaridade e pessoas com baixa visão.
- A automedicação é um hábito comum no Brasil, e o uso de vários medicamentos ao mesmo tempo (polifarmácia) aumenta o risco de interações que o paciente não conhece.
- As alternativas que o paciente tem hoje são:
  - **ler a bula sozinho**, o que é difícil;
  - **pesquisar no Google ou perguntar a um chatbot genérico**, que pode inventar informação (alucinação) e não diz de onde ela veio;
  - **perguntar ao farmacêutico**, que é o ideal, mas nem sempre está disponível quando surge a dúvida.

**O problema em números:**

| Dado | Valor | Fonte |
|---|---|---|
| Brasileiros (16+ anos) que tomam medicamentos por conta própria | **86%** | Pesquisa ICTQ/Datafolha — [ICTQ](https://ictq.com.br/farmacia-clinica/5144-dia-do-uso-racional-de-medicamentos-pesquisas-do-ictq-reforcam-alerta-historico-e-papel-do-farmaceutico-contra-a-automedicacao) |
| Participação dos medicamentos nos casos de intoxicação humana registrados no Brasil (2016) | **33,2%** (32.311 de 97.398 casos) — o agente mais frequente | SINITOX/Fiocruz, Tabela 10 — [PDF](https://sinitox.icict.fiocruz.br/sites/sinitox.icict.fiocruz.br/files/Brasil10_9.pdf) |
| Brasileiros de 15 a 64 anos que são analfabetos funcionais (2024) | **29%** | Inaf 2024 (Ação Educativa / Conhecimento Social) — [UNICEF](https://www.unicef.org/brazil/comunicados-de-imprensa/analfabetismo-funcional-nao-apresenta-melhora-e-alcanca-29-por-cento-dos-brasileiros-mesmo-patamar-de-2018-aponta-novo-levantamento-do-inaf) |

Juntos, esses dados mostram o problema: a maioria das pessoas decide sozinha sobre o uso de medicamentos, os medicamentos lideram as intoxicações registradas, e quase 1 em cada 3 adultos não consegue compreender bem um texto como a bula. Os analfabetos funcionais, segundo o Inaf, compreendem só frases curtas e números familiares, como telefones ou preços.

**Decisão que a solução apoia:** *"Posso usar este medicamento do jeito que pretendo, junto com os outros que uso, ou preciso falar com um profissional antes?"*

## 3. Proposta de solução

Assistente que:
1. **identifica** o medicamento (pelo nome digitado; na semana 4, pela foto da caixa);
2. **recupera** os trechos relevantes da **bula oficial da ANVISA** (RAG);
3. **verifica interações** entre os medicamentos que o usuário informa usar;
4. **explica em linguagem simples**, sempre **citando a seção da bula** usada;
5. **aplica regras de segurança**: não prescreve, não altera dose e encaminha para farmacêutico, médico, SAMU (192) ou Disque-Intoxicação (0800-722-6001) quando necessário.

O modelo de linguagem é **treinado pelo grupo** por fine-tuning com LoRA de um modelo aberto (Qwen2.5-1.5B-Instruct), usando como dados de treino exemplos gerados a partir das bulas.

## 4. Stakeholders

| Stakeholder | Interesse | Como é afetado |
|---|---|---|
| **Pacientes / usuários de medicamentos** (foco: idosos e cuidadores) | Entender como usar o remédio com segurança | Usuário principal |
| **Cuidadores e familiares** | Administrar remédios de terceiros corretamente | Usuário secundário |
| **Farmacêuticos** | Pacientes mais bem informados; menos erro de uso | Destino do encaminhamento; possíveis validadores |
| **Médicos / prescritores** | Que o assistente não contradiga a prescrição | A solução precisa reforçar a prescrição, não substituí-la |
| **ANVISA** | Uso correto da bula oficial | Fonte dos dados; regula a informação sobre medicamentos |
| **Fabricantes** | Bula interpretada corretamente | Autores do conteúdo-fonte |
| **Equipe / professor** | Projeto que atenda aos critérios do desafio | Avaliadores |

## 5. Riscos e limitações

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | **Alucinação**: o modelo inventa dose, indicação ou interação | Alta (modelo pequeno) | Muito alto | RAG obrigatório; resposta só a partir do contexto recuperado; citação da seção; métrica de fidelidade; "não encontrei na bula" quando não houver contexto |
| R2 | **Uso como prescrição**: usuário trata a resposta como orientação médica | Média | Muito alto | Agente de Segurança bloqueia pedidos de dose/troca/suspensão; aviso fixo; encaminhamento |
| R3 | **Identificação errada do medicamento** (nome parecido, genérico × referência) | Média | Alto | Confirmação com o usuário quando a confiança for baixa; busca por princípio ativo |
| R4 | **Interação não detectada** (falso negativo) | Média | Alto | Métrica de recall de interações como prioridade; aviso de que a ausência de alerta não garante segurança |
| R5 | **Bula desatualizada** na base | Baixa | Médio | Data de coleta registrada; reprocessamento periódico |
| R6 | **Situações de emergência** (overdose, ingestão por criança, reação grave) | Baixa | Muito alto | Detecção por regras antes do LLM; resposta imediata com SAMU 192 e 0800-722-6001 |
| R7 | **Privacidade / LGPD**: os medicamentos revelam a condição de saúde (dado sensível, art. 11) | Média | Alto | Sem login; sem armazenar histórico; processamento local; nenhum envio para API de terceiros |
| R8 | **Viés / exclusão**: o modelo funciona pior para quem escreve com erros ou usa nomes populares | Média | Médio | Busca tolerante a erros (fuzzy); testes com perguntas escritas de forma informal |
| R9 | **Modelo pequeno com limitação de raciocínio** | Alta | Médio | Partes críticas determinísticas (identificação, checagem de interação por texto da bula, regras de segurança); o LLM só redige |

**Limitações assumidas:** o sistema cobre apenas os medicamentos presentes na base; não considera condição clínica individual, dose prescrita nem exames; não substitui o farmacêutico ou o médico.

## 6. Métricas objetivas

| Métrica | O que mede | Como calcular | Meta |
|---|---|---|---|
| **Acurácia de identificação** | Acertou o medicamento? | % de perguntas com medicamento correto | ≥ 90% |
| **Hit@k da recuperação** | O trecho certo foi recuperado? | % em que a seção-gabarito está entre os k=4 primeiros | ≥ 85% |
| **Fidelidade (groundedness)** | A resposta está apoiada na bula? | % de frases da resposta com sobreposição ≥ 50% com o contexto | ≥ 80% |
| **Taxa de citação** | A resposta cita a fonte? | % de respostas com seção citada | 100% |
| **Recall de interações** | Detectou as interações reais? | VP / (VP + FN) no conjunto de pares | ≥ 90% |
| **Precisão de interações** | Evitou alarme falso? | VP / (VP + FP) | ≥ 70% |
| **Taxa de bloqueio de segurança** | Recusou/encaminhou pedidos perigosos? | % de perguntas perigosas tratadas corretamente | 100% |
| **Legibilidade** | Linguagem simples? | Índice Flesch adaptado ao português | ≥ 50 (fácil) |
| **Latência** | Tempo de resposta | Mediana em segundos | ≤ 10 s (GPU) |

**Comparação experimental (semana 2):** as métricas acima são medidas em três configurações sobre o mesmo conjunto de perguntas:
- **A:** LLM base, sem RAG;
- **B:** LLM base + RAG;
- **C:** LLM treinada pelo grupo (LoRA) + RAG.

## 7. Decisões técnicas e justificativas

| Decisão | Alternativas consideradas | Justificativa |
|---|---|---|
| **Fine-tuning LoRA** de modelo aberto | Treinar do zero; API comercial | Treinar do zero é inviável (custo e dados). LoRA treina cerca de 1% dos parâmetros e roda no Colab gratuito. Modelo local evita enviar dados de saúde a terceiros (LGPD) |
| **Qwen2.5-1.5B-Instruct** | Llama 3.2 1B/3B, Gemma 2 2B, TinyLlama | Bom desempenho em português no seu porte; licença Apache 2.0; cabe em GPU T4 |
| **RAG com seções da bula** | Só fine-tuning | Fine-tuning não garante fatos e a bula muda; o RAG permite citar a fonte e atualizar sem retreinar |
| **Chunking por seção oficial** (as 9 perguntas da RDC 47/2009) | Chunk de tamanho fixo | As bulas seguem estrutura padronizada, então cada trecho tem significado e a citação fica exata |
| **Embeddings multilíngues** (`paraphrase-multilingual-MiniLM-L12-v2`) + ChromaDB | OpenAI embeddings; pgvector | Gratuito, local, leve; o Chroma não exige servidor |
| **Multiagentes com partes determinísticas** | Um único prompt grande | Modelo pequeno erra em tarefas compostas; separar responsabilidades permite testar e medir cada etapa |
| **Regras de segurança antes do LLM** | Confiar no LLM | Segurança não pode depender de modelo probabilístico |

## 8. Arquitetura (visão geral)

```
Usuário ──► Orquestrador
              ├─► 1. Agente de Segurança (pré)   → emergência? pedido de prescrição?
              ├─► 2. Agente Identificador        → quais medicamentos? (nome; foto na semana 4)
              ├─► 3. Agente Recuperador (RAG)    → trechos da bula ANVISA por seção
              ├─► 4. Agente de Interações        → cruza a seção 4 das bulas dos remédios informados
              ├─► 5. Agente Simplificador (LLM)  → resposta simples + citação
              └─► 6. Agente de Segurança (pós)   → valida a resposta e adiciona avisos/encaminhamento
```

## 9. Fontes de dados

- **Bulário Eletrônico da ANVISA:** bulas do paciente (fonte primária).
- **RDC ANVISA nº 47/2009:** estrutura padronizada da bula do paciente.
- **RENAME (Relação Nacional de Medicamentos Essenciais):** usada para escolher os medicamentos do escopo inicial.

**Escopo inicial (MVP):** 15–20 medicamentos muito usados (ex.: dipirona, paracetamol, ibuprofeno, losartana, enalapril, metformina, sinvastatina, omeprazol, amoxicilina, varfarina, ácido acetilsalicílico, clopidogrel, levotiroxina, hidroclorotiazida, captopril).
