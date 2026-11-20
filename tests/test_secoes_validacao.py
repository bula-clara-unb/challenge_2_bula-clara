"""Variações de título vistas em PDFs reais de bula + o validador da base do MVP (issue #1)."""
import importlib.util
import unicodedata
from pathlib import Path

from bula_clara import config
from bula_clara.secoes import dividir_em_secoes

RAIZ = Path(__file__).resolve().parent.parent
FIX = Path(__file__).parent / "fixtures"

_spec = importlib.util.spec_from_file_location("validar_bulas", RAIZ / "scripts" / "validar_bulas.py")
validar_bulas = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(validar_bulas)

BULA_VARIANTE = """II - INFORMAÇÕES AO PACIENTE
1 - PARA QUE ESTE MEDICAMENTO É INDICADO?
Dor e febre.
2) COMO ESTE MEDICAMENTO FUNCIONA?
Age no sistema nervoso.
3.QUANDO NÃO DEVO USAR ESTE MEDICAMENTO?
Alergia ao componente.
4. O QUE DEVO SABER ANTES DE USAR ESTE
MEDICAMENTO?
Evite álcool.
5. ONDE, COMO E POR QUANTO TEMPO POSSO GUARDAR ESTE MEDICAMENTO?
Temperatura ambiente.
6. COMO DEVO USAR ESTE MEDICAMENTO?
Um comprimido.
7. O QUE DEVO FAZER QUANDO ME ESQUECER DE USAR ESTE MEDICAMENTO?
Tome assim que lembrar.
8. QUAIS MALES QUE ESTE MEDICAMENTO PODE ME CAUSAR?
Náusea.
9. O QUE FAZER SE ALGUÉM USAR UMA QUANTIDADE MAIOR DO QUE A INDICADA DESTE MEDICAMENTO?
Procure socorro.
"""


def test_variacoes_de_titulo_reconhecidas():
    secoes = dividir_em_secoes(BULA_VARIANTE)
    assert len(secoes) == 9
    assert secoes["precaucoes_interacoes"].startswith("Evite álcool")
    assert secoes["esquecimento"].startswith("Tome assim")


def test_acento_decomposto_do_pdf():
    """'É' extraído como 'E' + acento combinante (NFD) não pode derrubar a seção."""
    secoes = dividir_em_secoes(unicodedata.normalize("NFD", BULA_VARIANTE))
    assert len(secoes) == 9


def test_validador_aponta_bulas_faltando():
    linhas = {l["medicamento"]: l for l in validar_bulas.validar(FIX)}
    assert len(linhas) == len(config.MEDICAMENTOS_MVP) == 15
    assert linhas["losartana"]["secoes"] == 9 and linhas["losartana"]["faltando"] == []
    assert linhas["dipirona"]["arquivo"] is None


def test_validador_aceita_sufixo_no_nome(tmp_path):
    (tmp_path / "losartana_potassica.txt").write_text((FIX / "losartana.txt").read_text(encoding="utf-8"),
                                                      encoding="utf-8")
    assert validar_bulas.achar_arquivo(tmp_path, "losartana").name == "losartana_potassica.txt"
