// Trace de exemplo, no formato que o modo demonstração mostra. Não é exportado pelo pacote.
import type { DemoTraceProps } from './DemoTrace';

export const traceDeExemplo = {
  etapas: [
    { agente: 'AgenteSeguranca (pré)', duracaoMs: 12, detalhe: 'categoria_risco: nenhum' },
    { agente: 'AgenteIdentificador', duracaoMs: 48, detalhe: 'losartana, ibuprofeno (lista: metformina)' },
    { agente: 'AgenteRecuperador', duracaoMs: 640, detalhe: '6 trechos' },
    { agente: 'AgenteInteracoes', duracaoMs: 95, detalhe: '1 frase em precaucoes_interacoes' },
    { agente: 'LLM (Qwen2.5-1.5B)', duracaoMs: 8420 },
    { agente: 'AgenteSeguranca (pós)', duracaoMs: 21, detalhe: 'citações ok, nenhuma dose fora do contexto' },
  ],
  categoriaRisco: 'nenhum',
  trechos: [
    {
      remedio: 'Losartana',
      secao: 'precaucoes_interacoes',
      texto: 'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana.',
      pontuacao: 0.21,
    },
  ],
} satisfies DemoTraceProps;
