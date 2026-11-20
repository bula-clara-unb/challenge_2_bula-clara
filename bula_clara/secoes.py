"""Divide a bula do paciente nas 9 seções padronizadas pela RDC ANVISA 47/2009."""
import re
import unicodedata

# (id, nome curto, padrão que identifica o título da seção)
SECOES = [
    ("indicacao", "Para que serve", r"PARA\s+QU[EÊ]\s+(ESTE|ESSE)\s+MEDICAMENTO\s+[ÉE]\s+INDICADO"),
    ("funcionamento", "Como funciona", r"COMO\s+(ESTE|ESSE)\s+MEDICAMENTO\s+FUNCIONA"),
    ("contraindicacao", "Quando não usar", r"QUANDO\s+N[ÃA]O\s+DEVO\s+USAR"),
    ("precaucoes_interacoes", "Antes de usar / Interações", r"O\s+QUE\s+DEVO\s+SABER\s+ANTES\s+DE\s+USAR"),
    ("armazenamento", "Como guardar", r"ONDE,?\s+COMO\s+E\s+POR\s+QUANTO\s+TEMPO"),
    ("posologia", "Como usar", r"COMO\s+DEVO\s+USAR\s+(ESTE|ESSE)\s+MEDICAMENTO"),
    ("esquecimento", "Se esquecer uma dose", r"O\s+QUE\s+DEVO\s+FAZER\s+QUANDO\s+(EU\s+)?(ME\s+)?ESQUECER"),
    ("reacoes_adversas", "Efeitos colaterais", r"QUAIS\s+(OS\s+)?MALES\s+QUE\s+(ESTE|ESSE)\s+MEDICAMENTO"),
    ("superdose", "Superdose", r"O\s+QUE\s+FAZER\s+SE\s+ALGU[ÉE]M\s+USAR\s+UMA\s+QUANTIDADE\s+MAIOR"),
]
NOME_SECAO = {sid: nome for sid, nome, _ in SECOES}

_TITULO = re.compile(
    r"(?:^|\n)\s*(?:\d\s*[\.\-\)]\s*)?(" + "|".join(f"(?P<{sid}>{pad})" for sid, _, pad in SECOES) + r")[^\n]*",
    re.IGNORECASE,
)


def normalizar(txt: str) -> str:
    """minúsculas e sem acento — usado em buscas tolerantes."""
    txt = unicodedata.normalize("NFKD", txt.lower())
    return "".join(c for c in txt if not unicodedata.combining(c))


def limpar(txt: str) -> str:
    txt = unicodedata.normalize("NFC", txt)  # PDFs às vezes trazem "É" como "E" + acento combinante
    txt = txt.replace("\u00ad", "")         # hífen invisível (soft hyphen)
    txt = re.sub(r"-\n(\w)", r"\1", txt)          # palavra quebrada no fim da linha
    txt = re.sub(r"[ \t]+", " ", txt)
    txt = re.sub(r"\n{3,}", "\n\n", txt)
    return txt.strip()


def dividir_em_secoes(texto: str) -> dict[str, str]:
    """Retorna {id_secao: texto}. Se a mesma seção aparecer duas vezes, fica a primeira."""
    texto = limpar(texto)
    achados = []
    for m in _TITULO.finditer(texto):
        sid = next(k for k, v in m.groupdict().items() if v)
        achados.append((m.start(), m.end(), sid))
    secoes: dict[str, str] = {}
    for i, (ini, fim, sid) in enumerate(achados):
        prox = achados[i + 1][0] if i + 1 < len(achados) else len(texto)
        corpo = texto[fim:prox].strip()
        # título quebrado em duas linhas: remove o resto ("MEDICAMENTO?") do começo do corpo
        corpo = re.sub(r"^((ESTE|ESSE)\s+)?MEDICAMENTO\??\s*", "", corpo, flags=re.IGNORECASE)
        if sid not in secoes and corpo:
            secoes[sid] = corpo
    return secoes
