"""Métrica da semana 4: acurácia de identificação do medicamento pela FOTO.

Coloque as fotos em data/avaliacao/fotos/ com o nome = gabarito:
    losartana_01.jpg, losartana_02.jpg, acido_acetilsalicilico_01.jpg, novalgina_01.jpg -> use o nome DA BASE:
    dipirona_01.jpg (mesmo que a caixa diga Novalgina)
Fotos de "ruído" (sem remédio) podem se chamar nenhum_01.jpg — o certo é o sistema não identificar nada.

Uso:  python scripts/avaliar_imagens.py
"""
import re
import statistics
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))
from bula_clara.agentes.identificador import AgenteIdentificador  # noqa: E402
from bula_clara.agentes.leitor_imagem import AgenteLeitorImagem  # noqa: E402
from bula_clara.ingestao import carregar_chunks  # noqa: E402

PASTA = RAIZ / "data" / "avaliacao" / "fotos"


def gabarito(arq: Path) -> str | None:
    nome = re.sub(r"_\d+$", "", arq.stem).replace("_", " ").lower()
    return None if nome == "nenhum" else nome


def main():
    fotos = sorted(p for p in PASTA.glob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    if not fotos:
        raise SystemExit(f"Nenhuma foto em {PASTA}")
    leitor = AgenteLeitorImagem(AgenteIdentificador([c["medicamento"] for c in carregar_chunks()]))
    linhas, acertos, tempos = [], 0, []
    for f in fotos:
        esperado = gabarito(f)
        t = time.perf_counter()
        r = leitor.ler(f)
        tempos.append(time.perf_counter() - t)
        previsto = r["medicamentos"][0] if r["medicamentos"] else None
        ok = previsto == esperado
        acertos += ok
        linhas.append(f"| {f.name} | {esperado or '—'} | {previsto or '—'} | {'✅' if ok else '❌'} | "
                      f"{r['confianca_ocr']} | {r['texto_ocr'][:60]} |")
    acc = acertos / len(fotos)
    md = [f"# Avaliação de imagens — OCR: {r['ocr']}", "",
          f"**Acurácia de identificação:** {acc:.1%} ({acertos}/{len(fotos)}) · "
          f"**tempo mediano:** {statistics.median(tempos):.2f} s", "",
          "| Foto | Esperado | Previsto | OK | Conf. OCR | Texto lido (início) |", "|---|---|---|---|---|---|", *linhas]
    texto = "\n".join(md)
    print(texto)
    (RAIZ / "resultados").mkdir(exist_ok=True)
    saida = RAIZ / "resultados" / f"imagens_{time.strftime('%Y%m%d_%H%M')}.md"
    saida.write_text(texto, encoding="utf-8")
    print(f"\nSalvo em {saida.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
