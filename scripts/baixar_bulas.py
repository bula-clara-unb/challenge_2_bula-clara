"""Baixa as bulas do PACIENTE do Bulário Eletrônico da ANVISA para data/bulas/.

Uso:  python scripts/baixar_bulas.py                 (lista padrão do MVP)
      python scripts/baixar_bulas.py dipirona omeprazol

⚠️ A ANVISA não tem API pública documentada para o bulário; este script usa a API interna do site
(a mesma que o navegador usa) e pode parar de funcionar ou ser bloqueado. Se falhar, baixe manualmente:
  1. Acesse https://consultas.anvisa.gov.br/#/bulario/
  2. Pesquise o medicamento (prefira o GENÉRICO ou o de REFERÊNCIA)
  3. Clique em "Bula do Paciente" e salve como data/bulas/<nome>.pdf  (ex.: data/bulas/losartana.pdf)
"""
import sys
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from bula_clara import config  # noqa: E402

PASTA = config.PASTA_PDFS
API = "https://consultas.anvisa.gov.br/api/consulta"
CABECALHO = {"Authorization": "Guest", "User-Agent": "Mozilla/5.0 (projeto academico UnB)"}

MVP = config.MEDICAMENTOS_MVP


class APIBloqueada(Exception):
    """A ANVISA recusou o acesso (403/401): não adianta insistir nos outros medicamentos."""


def arquivo_esperado(nome: str) -> Path:
    return PASTA / f"{nome.replace(' ', '_')}.pdf"


def baixar(nome: str) -> bool:
    destino = arquivo_esperado(nome)
    if destino.exists():
        print(f"  = {nome}: já existe")
        return True
    r = requests.get(f"{API}/bulario", headers=CABECALHO, timeout=30,
                     params={"count": 10, "page": 1, "filter[nomeProduto]": nome})
    if r.status_code in (401, 403):
        raise APIBloqueada(f"HTTP {r.status_code}")
    r.raise_for_status()
    itens = [i for i in r.json().get("content", []) if i.get("idBulaPacienteProtegido")]
    if not itens:
        print(f"  ! {nome}: nenhum resultado com bula do paciente")
        return False
    item = itens[0]
    pdf = requests.get(f"{API}/medicamentos/arquivo/bula/parecer/{item['idBulaPacienteProtegido']}/",
                       params={"Authorization": "Guest"}, headers=CABECALHO, timeout=60)
    pdf.raise_for_status()
    if not pdf.content.startswith(b"%PDF"):
        print(f"  ! {nome}: resposta não é PDF (API pode ter mudado)")
        return False
    destino.write_bytes(pdf.content)
    print(f"  ✓ {nome}: {item.get('nomeProduto')} — {item.get('razaoSocial')}")
    return True


def main():
    PASTA.mkdir(parents=True, exist_ok=True)
    nomes = sys.argv[1:] or MVP
    falhas = []
    for idx, n in enumerate(nomes):
        try:
            if not baixar(n):
                falhas.append(n)
        except APIBloqueada as e:
            print(f"  ! API do bulário recusou o acesso ({e}). Interrompendo para não insistir no site.")
            falhas.extend(x for x in nomes[idx:] if not arquivo_esperado(x).exists())
            break
        except Exception as e:  # noqa: BLE001
            print(f"  ! {n}: {e}")
            falhas.append(n)
        time.sleep(1.5)  # não sobrecarregar o site da ANVISA
    if falhas:
        print("\nBaixe manualmente a *Bula do Paciente* em https://consultas.anvisa.gov.br/#/bulario/")
        print("e salve com estes nomes (prefira o genérico ou o de referência):")
        for n in falhas:
            print(f"  - {arquivo_esperado(n).relative_to(config.RAIZ)}")
        print("Depois confira com:  python scripts/validar_bulas.py")


if __name__ == "__main__":
    main()
