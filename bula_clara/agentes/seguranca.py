"""Agente de Segurança — roda ANTES (triagem) e DEPOIS (validação) do LLM.
Baseado em regras, de propósito: segurança não pode depender de modelo probabilístico."""
import re

from ..secoes import normalizar
from .base import Agente, Consulta

EMERGENCIA = [
    r"tomei (muit|demais|a cartela|todos|tudo)", r"overdose", r"superdos", r"intoxica",
    r"(crianca|bebe|filho|filha|neto|neta).{0,40}(engoliu|tomou|comeu|ingeriu)",
    r"(engoliu|tomou|ingeriu).{0,40}(crianca|bebe)", r"desmai", r"convuls",
    r"falta de ar", r"nao consigo respirar", r"(inchaco|inchou).{0,30}(boca|garganta|lingua|rosto)",
]
AUTOLESAO = [r"me matar", r"suicid", r"acabar com (a )?minha vida", r"tirar (a )?minha vida"]
ALTERACAO_DOSE = [
    r"(posso|devo|da pra|pode) (tomar|usar) mais", r"aumentar (a )?dose", r"dobrar (a )?dose",
    r"(posso|devo) (parar|suspender|interromper)", r"parar de tomar", r"trocar .{0,30} por",
    r"substituir", r"(qual|que) dose (eu )?(devo|tenho)", r"quant[oa]s? .{0,40}(devo|posso|tenho que) tomar",
]
GRUPO_ESPECIAL = [r"gravid", r"gestante", r"amament", r"lactant", r"bebe", r"crianca", r"idos"]

AVISO_PADRAO = ("ℹ️ Esta explicação é baseada na bula oficial e não substitui a orientação do seu médico "
                "ou farmacêutico. Siga sempre a dose da sua receita.")


def _bate(padroes, texto):
    return any(re.search(p, texto) for p in padroes)


class AgenteSegurancaPre(Agente):
    nome = "seguranca_pre"

    def executar(self, c: Consulta):
        t = normalizar(c.pergunta)
        if _bate(AUTOLESAO, t):
            c.categoria_risco, c.bloqueada = "emergencia", True
            c.resposta = ("Sinto muito que você esteja passando por isso. Você não está sozinho(a). "
                          "Ligue agora para o CVV (188, 24h, gratuito) ou para o SAMU (192). "
                          "Se tomou algum medicamento em excesso, ligue também para o Disque-Intoxicação: 0800-722-6001.")
        elif _bate(EMERGENCIA, t):
            c.categoria_risco, c.bloqueada = "emergencia", True
            c.resposta = ("⚠️ Isso pode ser uma emergência. Ligue AGORA para o SAMU (192) ou para o "
                          "Disque-Intoxicação da ANVISA (0800-722-6001, gratuito, 24h). "
                          "Tenha a caixa ou a bula do medicamento em mãos e não provoque vômito sem orientação.")
        elif _bate(ALTERACAO_DOSE, t):
            c.categoria_risco = "alteracao_dose"
            c.alertas.append("Mudar a dose, parar ou trocar um remédio só deve ser feito com orientação do "
                             "médico que o receitou. Abaixo está apenas o que a bula diz.")
        elif _bate(GRUPO_ESPECIAL, t):
            c.categoria_risco = "grupo_especial"
            c.alertas.append("Gestantes, lactantes, crianças e idosos têm cuidados específicos: "
                             "confirme sempre com o médico ou farmacêutico.")
        return {"categoria_risco": c.categoria_risco, "bloqueada": c.bloqueada}


_DOSE = re.compile(r"\d+(?:[.,]\d+)?\s*(?:mg|g|ml|mcg|µg|gotas?|comprimidos?|c[áa]psulas?)\b", re.I)


class AgenteSegurancaPos(Agente):
    nome = "seguranca_pos"

    def executar(self, c: Consulta):
        if c.bloqueada:
            return {"acao": "resposta de emergência mantida"}
        problemas = []
        if not c.medicamentos:
            c.resposta = ("Não consegui identificar o medicamento, ou ele ainda não está na minha base. "
                          "Escreva o nome como aparece na caixa (ex.: \"losartana\"). "
                          "Na dúvida, pergunte ao farmacêutico.")
            problemas.append("medicamento_nao_identificado")
        elif not c.trechos:
            c.resposta = ("Não encontrei essa informação na bula dos medicamentos que tenho na base. "
                          "Pergunte ao farmacêutico — ele pode ajudar na hora.")
            problemas.append("sem_contexto")
        else:
            contexto = normalizar(" ".join(t["texto"] for t in c.trechos))
            # doses citadas na resposta que NÃO estão na bula = possível alucinação
            inventadas = [d for d in _DOSE.findall(c.resposta)
                          if normalizar(re.sub(r"\s+", " ", d)) not in re.sub(r"\s+", " ", contexto)]
            if inventadas:
                problemas.append(f"doses_nao_encontradas:{inventadas}")
                c.alertas.append("Alguns valores da resposta não foram confirmados na bula "
                                 f"({', '.join(inventadas)}). Confira na bula ou com o farmacêutico.")
            if not re.search(r"\[\d+\]", c.resposta):
                problemas.append("sem_citacao")
        if c.interacoes:
            c.alertas.insert(0, "⚠️ Encontrei possível interação entre os seus medicamentos. "
                                "Não pare nenhum remédio por conta própria: fale com o farmacêutico ou médico.")
        return {"problemas": problemas}


def finalizar(c: Consulta) -> str:
    """Monta o texto final: alertas + resposta + fontes + aviso."""
    if c.bloqueada:
        return c.resposta
    partes = [*c.alertas, c.resposta]
    if c.trechos:
        fontes = [f"[{i}] {t['medicamento'].title()} — {t['secao_nome']}" for i, t in enumerate(c.trechos, 1)]
        partes.append("Fontes (bula ANVISA):\n" + "\n".join(fontes))
    partes.append(AVISO_PADRAO)
    return "\n\n".join(p for p in partes if p)
