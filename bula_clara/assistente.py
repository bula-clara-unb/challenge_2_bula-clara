"""Assistente multimodal: junta foto, voz e texto em cima do Orquestrador (sem alterá-lo).

    a = AssistenteMultimodal()
    a.responder(imagem="caixa.jpg")                                   # só a foto -> "para que serve?"
    a.responder(pergunta="como devo tomar?", imagem="caixa.jpg")
    a.responder(audio="pergunta.ogg", falar=True)                     # voz -> resposta em mp3
"""
from .agentes import Orquestrador
from .agentes.leitor_imagem import AgenteLeitorImagem

PERGUNTA_PADRAO_FOTO = "Para que serve o {m} e como devo usar?"


class AssistenteMultimodal:
    def __init__(self, orquestrador: Orquestrador | None = None, ocr=None):
        self.orq = orquestrador or Orquestrador()
        self.leitor = AgenteLeitorImagem(self.orq.identificador, ocr=ocr)

    def responder(self, pergunta: str | None = None, imagem=None, audio=None,
                  medicamentos_em_uso: list[str] | None = None, falar: bool = False) -> dict:
        em_uso = list(medicamentos_em_uso or [])
        extra: dict = {}

        if audio is not None:
            from .multimodal.voz import transcrever
            extra["voz"] = transcrever(audio)
            pergunta = extra["voz"]["texto"] or pergunta

        if imagem is not None:
            foto = self.leitor.ler(imagem)
            extra["imagem"] = foto
            if not foto["medicamentos"]:
                if not pergunta:   # sem nome e sem pergunta: não há o que responder
                    return {"resposta": foto["mensagem"], "medicamentos": [], "trechos": [], "interacoes": [],
                            "trace": [{"agente": "leitor_imagem", "ms": foto["ms"]}], **extra}
            else:
                med = foto["medicamentos"][0]
                pergunta = pergunta or PERGUNTA_PADRAO_FOTO.format(m=med)
                em_uso = foto["medicamentos"] + [m for m in em_uso if m not in foto["medicamentos"]]

        if not pergunta:
            return {"resposta": "Envie uma pergunta, uma foto da caixa ou um áudio.", "medicamentos": [],
                    "trechos": [], "interacoes": [], "trace": []}

        r = self.orq.responder(pergunta, em_uso)
        if "imagem" in extra:
            r["trace"].insert(0, {"agente": "leitor_imagem", "ms": extra["imagem"]["ms"],
                                  "medicamentos": extra["imagem"]["medicamentos"], "ocr": extra["imagem"]["ocr"]})
            if extra["imagem"]["medicamentos"]:
                r["resposta"] = extra["imagem"]["mensagem"] + "\n\n" + r["resposta"]
        r["pergunta_usada"] = pergunta
        r.update(extra)

        if falar:
            from .multimodal.voz import falar as gerar_audio
            r["audio_resposta"] = str(gerar_audio(r["resposta"]))
        return r
