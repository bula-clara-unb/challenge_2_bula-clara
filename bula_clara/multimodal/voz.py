"""Voz: pergunta falada (fala → texto) e resposta em áudio (texto → fala).
Pensado para idosos e pessoas com baixa visão.

Fala → texto: faster-whisper (local; baixa o modelo na 1ª vez). Modelo via BULA_WHISPER (padrão "small").
Texto → fala: gTTS (voz Google, precisa de internet) ou pyttsx3 (offline, voz do sistema).
              Escolha com BULA_TTS=gtts|pyttsx3 (padrão gtts).
"""
import os
import re
import tempfile
from functools import lru_cache
from pathlib import Path


# ---------------- fala -> texto ----------------
@lru_cache(maxsize=1)
def _whisper():
    from faster_whisper import WhisperModel
    return WhisperModel(os.getenv("BULA_WHISPER", "small"), device="auto", compute_type="int8")


def transcrever(audio) -> dict:
    """audio: caminho do arquivo ou bytes (wav, mp3, ogg/opus do WhatsApp, m4a...)."""
    caminho, temp = audio, None
    if isinstance(audio, (bytes, bytearray)):
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".audio")
        temp.write(audio); temp.close()
        caminho = temp.name
    try:
        segmentos, info = _whisper().transcribe(str(caminho), language="pt", vad_filter=True,
                                                initial_prompt="Pergunta sobre remédio e bula.")
        segs = list(segmentos)
        texto = " ".join(s.text.strip() for s in segs).strip()
        conf = sum(s.avg_logprob for s in segs) / len(segs) if segs else None
        return {"texto": texto, "duracao_s": round(info.duration, 1), "logprob_medio": conf}
    finally:
        if temp:
            Path(temp.name).unlink(missing_ok=True)


# ---------------- texto -> fala ----------------
_EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿️]")


def texto_para_fala(resposta: str) -> str:
    """Prepara a resposta para leitura em voz alta: tira fontes, citações [n] e emojis;
    expande números de telefone e siglas para a voz ler direito."""
    t = resposta.split("Fontes (bula ANVISA):")[0]
    t = re.sub(r"\[\d+\]", "", t)
    t = _EMOJI.sub("", t)
    t = t.replace("0800-722-6001", "zero oitocentos, sete dois dois, seis zero zero um")
    t = t.replace("192", "cento e noventa e dois").replace("188", "cento e oitenta e oito")
    t = re.sub(r"\s*[()]\s*", ", ", t)
    t = re.sub(r",\s*([,.])", r"\1", t)
    t = re.sub(r"\bmg\b", "miligramas", t)
    t = re.sub(r"\bml\b", "mililitros", t)
    t = re.sub(r"[ \t]+", " ", t)
    return re.sub(r"\n{2,}", "\n", t).strip()


def falar(resposta: str, saida: str | Path | None = None) -> Path:
    """Gera o áudio (mp3 com gTTS, wav com pyttsx3) e devolve o caminho."""
    texto = texto_para_fala(resposta)
    backend = os.getenv("BULA_TTS", "gtts")
    if backend == "pyttsx3":
        import pyttsx3
        saida = Path(saida or tempfile.mktemp(suffix=".wav"))
        motor = pyttsx3.init()
        for v in motor.getProperty("voices"):
            if "pt" in (v.id + str(getattr(v, "languages", ""))).lower():
                motor.setProperty("voice", v.id); break
        motor.setProperty("rate", 160)   # um pouco mais devagar que o padrão
        motor.save_to_file(texto, str(saida)); motor.runAndWait()
        return saida
    from gtts import gTTS
    saida = Path(saida or tempfile.mktemp(suffix=".mp3"))
    gTTS(texto, lang="pt", tld="com.br", slow=False).save(str(saida))
    return saida
