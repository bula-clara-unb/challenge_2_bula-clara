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

PASTA = Path(__file__).resolve().parent.parent / "data" / "bulas"
API = "https://consultas.anvisa.gov.br/api/consulta"
CABECALHO = {"Authorization": "Guest", "User-Agent": "Mozilla/5.0 (projeto academico UnB)"}

MVP = ["dipirona", "paracetamol", "ibuprofeno", "acido acetilsalicilico", "losartana", "enalapril",
       "captopril", "hidroclorotiazida", "metformina", "sinvastatina", "omeprazol", "amoxicilina",
       "varfarina", "clopidogrel", "levotiroxina"]


def baixar(nome: str) -> bool:
    destino = PASTA / f"{nome.replace(' ', '_')}.pdf"
    if destino.exists():
        print(f"  = {nome}: já existe")
        return True
    r = requests.get(f"{API}/bulario", headers=CABECALHO, timeout=30,
                     params={"count": 10, "page": 1, "filter[nomeProduto]": nome})
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
    for n in nomes:
        try:
            if not baixar(n):
                falhas.append(n)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {n}: {e}")
            falhas.append(n)
        time.sleep(1.5)  # não sobrecarregar o site da ANVISA
    if falhas:
        print("\nBaixe manualmente (veja instruções no topo deste arquivo):", ", ".join(falhas))


if __name__ == "__main__":
    main()
