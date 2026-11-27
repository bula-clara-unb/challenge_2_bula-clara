"""Configuração central. Tudo pode ser sobrescrito por variáveis de ambiente."""
import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DADOS = Path(os.getenv("BULA_DADOS", RAIZ / "data"))
PASTA_PDFS = DADOS / "bulas"            # PDFs baixados da ANVISA
ARQ_CHUNKS = DADOS / "chunks.jsonl"     # saída da ingestão
PASTA_INDICE = DADOS / "indice"         # ChromaDB persistente
ARQ_MANIFESTO = DADOS / "manifesto.json"
PASTA_RELATORIOS = DADOS / "relatorios"
VERSAO_PARSER = "1.0"
URL_CATALOGO_ANVISA = os.getenv(
    "BULA_URL_CATALOGO_ANVISA",
    "https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv",
)
ARQ_CSV_ANVISA = DADOS / "DADOS_ABERTOS_MEDICAMENTOS.csv"
ARQ_CATALOGO = DADOS / "catalogo_medicamentos.json"

# Os 15 medicamentos do MVP (nome do arquivo esperado: data/bulas/<nome com _>.pdf)
MEDICAMENTOS_MVP = [
    "dipirona", "paracetamol", "ibuprofeno", "acido acetilsalicilico", "losartana", "enalapril",
    "captopril", "hidroclorotiazida", "metformina", "sinvastatina", "omeprazol", "amoxicilina",
    "varfarina", "clopidogrel", "levotiroxina",
]
MIN_SECOES = 8   # mínimo de seções (de 9) reconhecidas para a bula ser aceita

# Embeddings (multilíngue, roda em CPU)
MODELO_EMBEDDING = os.getenv("BULA_EMBEDDING", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# LLM: "hf" (transformers local), "ollama" ou "mock" (testes, sem modelo)
LLM_BACKEND = os.getenv("BULA_LLM", "hf")
MODELO_BASE = os.getenv("BULA_MODELO_BASE", "Qwen/Qwen2.5-1.5B-Instruct")
# Caminho do adaptador LoRA treinado pelo grupo (vazio = usa só o modelo base)
ADAPTADOR_LORA = os.getenv("BULA_LORA", str(RAIZ / "modelos" / "bula-clara-lora"))
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODELO = os.getenv("OLLAMA_MODELO", "qwen2.5:1.5b")

TOP_K = int(os.getenv("BULA_TOP_K", "4"))
MAX_NOVOS_TOKENS = int(os.getenv("BULA_MAX_TOKENS", "350"))
