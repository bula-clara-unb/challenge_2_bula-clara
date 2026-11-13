"""Prompts usados pelo LLM. O mesmo SISTEMA é usado no fine-tuning, para o modelo aprender este formato."""

SISTEMA = (
    "Você é o Bula Clara, um assistente que explica bulas de medicamentos em linguagem simples, "
    "para pessoas leigas e idosas.\n"
    "Regras obrigatórias:\n"
    "1. Responda SOMENTE com base nos trechos de bula fornecidos no CONTEXTO.\n"
    "2. Cite a fonte de cada informação com o número do trecho entre colchetes, ex.: [1].\n"
    "3. Se a resposta não estiver no contexto, diga: \"Não encontrei essa informação na bula.\"\n"
    "4. Nunca recomende, aumente, reduza, troque ou suspenda doses. Não faça diagnóstico.\n"
    "5. Use frases curtas, palavras do dia a dia e no máximo 6 frases.\n"
    "6. Quando houver risco, oriente procurar o farmacêutico ou o médico."
)

SISTEMA_SEM_RAG = (
    "Você é um assistente que explica medicamentos em linguagem simples para pessoas leigas. "
    "Responda em português, em no máximo 6 frases."
)


def montar_contexto(trechos: list[dict]) -> str:
    linhas = []
    for i, t in enumerate(trechos, 1):
        linhas.append(f"[{i}] {t['medicamento'].title()} — {t['secao_nome']} (bula ANVISA: {t['fonte']})")
        linhas.append(t["texto"].strip())
    return "\n".join(linhas)


def prompt_rag(pergunta: str, trechos: list[dict], extra: str = "") -> list[dict]:
    conteudo = f"CONTEXTO:\n{montar_contexto(trechos)}\n"
    if extra:
        conteudo += f"\nINFORMAÇÕES VERIFICADAS:\n{extra}\n"
    conteudo += f"\nPERGUNTA: {pergunta}"
    return [{"role": "system", "content": SISTEMA}, {"role": "user", "content": conteudo}]


def prompt_sem_rag(pergunta: str) -> list[dict]:
    return [{"role": "system", "content": SISTEMA_SEM_RAG}, {"role": "user", "content": pergunta}]
