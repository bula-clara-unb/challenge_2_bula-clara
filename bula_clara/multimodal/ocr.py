"""OCR da foto da caixa/cartela do medicamento.

Backends (escolha com BULA_OCR=tesseract|easyocr; padrão: tesseract, se instalado, senão easyocr):
- tesseract: leve e rápido. Instalar o programa:
    Windows: https://github.com/UB-Mannheim/tesseract/wiki (marcar "Portuguese" na instalação)
    Linux:   sudo apt install tesseract-ocr tesseract-ocr-por
- easyocr:   mais robusto em foto torta/com reflexo, porém mais pesado (usa torch; baixa o modelo na 1ª vez).
"""
import io
import os
import re
from dataclasses import dataclass

from PIL import Image, ImageFilter, ImageOps


@dataclass
class ResultadoOCR:
    texto: str
    confianca: float      # 0–1 (média das palavras reconhecidas)
    backend: str


def abrir_imagem(imagem) -> Image.Image:
    """Aceita caminho, bytes ou PIL.Image."""
    if isinstance(imagem, Image.Image):
        img = imagem
    elif isinstance(imagem, (bytes, bytearray)):
        img = Image.open(io.BytesIO(imagem))
    else:
        img = Image.open(imagem)
    img = ImageOps.exif_transpose(img)  # foto de celular girada
    return img.convert("RGB")


def preprocessar(img: Image.Image) -> Image.Image:
    """Cinza + contraste + ampliação: melhora bastante o OCR em fotos de celular."""
    cinza = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=2)
    menor = min(cinza.size)
    if menor < 1000:   # texto pequeno da caixa: amplia
        f = 1000 / menor
        cinza = cinza.resize((int(cinza.width * f), int(cinza.height * f)), Image.LANCZOS)
    return cinza.filter(ImageFilter.SHARPEN)


class OCRTesseract:
    nome = "tesseract"

    def __init__(self, idioma="por"):
        import pytesseract
        self.pt = pytesseract
        self.idioma = idioma
        self.pt.get_tesseract_version()   # falha cedo se o programa não estiver instalado

    def ler(self, img: Image.Image) -> ResultadoOCR:
        textos, confs = [], []
        # tenta a imagem normal e a invertida (caixas com letra branca em fundo colorido)
        for variante in (img, ImageOps.invert(img)):
            d = self.pt.image_to_data(variante, lang=self.idioma, config="--psm 11",
                                      output_type=self.pt.Output.DICT)
            palavras = [(p.strip(), float(c) / 100) for p, c in zip(d["text"], d["conf"])
                        if p.strip() and float(c) > 30]
            novas = [p for p, _ in palavras]
            if novas and " ".join(novas) not in " ".join(textos):   # não repete a mesma leitura
                textos += novas
                confs += [c for _, c in palavras]
        return ResultadoOCR(" ".join(textos), sum(confs) / len(confs) if confs else 0.0, self.nome)


class OCREasy:
    nome = "easyocr"

    def __init__(self):
        import easyocr
        self.leitor = easyocr.Reader(["pt", "en"], gpu=False, verbose=False)

    def ler(self, img: Image.Image) -> ResultadoOCR:
        import numpy as np
        r = self.leitor.readtext(np.array(img))
        textos = [t for _, t, c in r if c > 0.3]
        confs = [c for _, _, c in r if c > 0.3]
        return ResultadoOCR(" ".join(textos), sum(confs) / len(confs) if confs else 0.0, self.nome)


def criar_ocr():
    preferido = os.getenv("BULA_OCR", "tesseract")
    ordem = [OCRTesseract, OCREasy] if preferido == "tesseract" else [OCREasy, OCRTesseract]
    erros = []
    for cls in ordem:
        try:
            return cls()
        except Exception as e:  # noqa: BLE001
            erros.append(f"{cls.nome}: {e}")
    raise RuntimeError("Nenhum OCR disponível. Instale o Tesseract ou o easyocr.\n" + "\n".join(erros))


def ler_imagem(imagem, ocr=None) -> ResultadoOCR:
    ocr = ocr or criar_ocr()
    r = ocr.ler(preprocessar(abrir_imagem(imagem)))
    r.texto = re.sub(r"\s+", " ", r.texto).strip()
    return r
