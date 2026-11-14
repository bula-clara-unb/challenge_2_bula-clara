# Ética, Segurança e LGPD - Bula Clara

Este documento detalha como o projeto Bula Clara implementa os princípios éticos de **Safety by Design**, garantindo a privacidade do usuário (LGPD) e a segurança do paciente (Não-Maleficência).

### 1. Privacidade e Proteção de Dados (LGPD Art. 11)
*  **Dados Sensíveis:** Os medicamentos informados revelam condições de saúde.
*  **Decisão:** O processamento é 100% local (modelo Qwen2.5-1.5B via 'transformers'). Não há envio de dados para APIs de terceiros. Não há login e o histórico é volátil (em memória), sem persistência em banco de dados.

## 2. Segurança do Paciente (Agentes de Segurança)
A segurança não depende do LLM (probabilístico), mas de regras determinísticas e auditáveis no arquivo 'bula_clara/agentes/seguranca.py'.

### 2.1. Agente de Segurança (Pré-LLM)
Atua antes do modelo generativo para bloquear riscos iminentes:
* **Emergências:** Overdose, intoxicação, crianças que ingeriram, reações graves. Resposta imediata com SAMU (192) e Disque-Intoxicação (0800-722-6001).
* **Autolesão:** Detecção de ideação suicida com encaminhamento para o CW (188).
* **Alteração de Dose:** Perguntas sobre dobrar a dose, parar ou trocar remédio são **bloqueadas** com encaminhamento ao médico. (Antes, apenas alertava; agora bloqueia para evitar uso como prescrição).
* **Grupos Especiais:** Gestantes, lactantes, crianças e idosos têm a resposta bloqueada e são encaminhados ao profissional de saúde, pois a bula genérica não cobre o risco individual.

### 2.2. Agente de Segurança (Pós-LLM)
Valida a resposta do LLM para evitar alucinações (R1):
* **Detector de Alucinação de Dose:** Se o LLM citar uma dose (ex: "500mg") que não está no texto da bula recuperada, o sistema aciona um alerta.
* **Citação Obrigatória:** Se a resposta não contiver citações (ex: '[1]'), o sistema marca como problema.
* **Detector de Alucinação Textual:** Frases de risco (ex: "não tome com", "pode causar morte") que não estão no contexto recuperado são sinalizadas.

## 3. Transparência e Confiabilidade
* **RAG Obrigatório:** O LLM só é chamado se houver trechos da bula recuperados. Caso contrário, responde "não encontrei na bula".
* **Aviso Legal:** A função 'finalizar' garante que o aviso legal (`⚠️ Projeto acadêmico...`) apareça em todas as respostas, inclusive nas bloqueadas por segurança.
* **Prompt Ético:** O prompt de sistema instrui a LLM a nunca recomendar, aumentar, reduzir, trocar ou suspender doses.

## 4. Inclusão e Justiça (R8)
* **Busca Tolerante:** O Agente Identificador usa 'difflib' e o dicionário 'APELIDOS' para aceitar erros de digitação e nomes populares (ex: "novalgina" -> "dipirona"), garantindo que idosos e pessoas com baixa escolaridade não sejam excluídos.
