import { Disclosure } from '../Disclosure';

export interface EtapaDoTrace {
  /** Nome do agente, como no backend ("AgenteSeguranca"). */
  agente: string;
  duracaoMs: number;
  /** O que o agente decidiu, em uma linha ("categoria_risco: nenhum"). */
  detalhe?: string;
}

export interface TrechoRecuperado {
  remedio: string;
  secao: string;
  texto: string;
  /** Distância ou pontuação da busca, como veio. */
  pontuacao?: number;
}

export interface DemoTraceProps {
  /** As etapas do pipeline, na ordem em que rodaram. Sem etapas, o componente não aparece. */
  etapas: readonly EtapaDoTrace[];
  trechos?: readonly TrechoRecuperado[];
  /** O texto bruto lido pelo OCR, quando a pergunta veio de uma foto. */
  ocr?: string;
  categoriaRisco?: string;
}

const segundos = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const pontos = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatarDuracao(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${segundos.format(ms / 1000)} s`;
}

const classesDaCelula = 'border-b border-border-subtle px-2 py-2 text-start align-top';

/**
 * Trace técnico dos agentes, só no modo demonstração. O app decide quando mostrar (?demo=1) e passa
 * os dados. Para quem usa o app, a explicação é o ReasoningSteps.
 */
export function DemoTrace({ etapas, trechos = [], ocr, categoriaRisco }: DemoTraceProps) {
  if (etapas.length === 0) return null;
  const total = etapas.reduce((soma, etapa) => soma + etapa.duracaoMs, 0);
  return (
    <Disclosure titulo="Modo demonstração: o que os agentes fizeram">
      <div className="flex flex-col gap-4 text-apoio">
        <table className="w-full border-collapse">
          <caption className="text-start font-bold">Etapas, em {formatarDuracao(total)} no total</caption>
          <thead>
            <tr>
              <th scope="col" className={classesDaCelula}>
                Agente
              </th>
              <th scope="col" className={classesDaCelula}>
                Tempo
              </th>
              <th scope="col" className={classesDaCelula}>
                Detalhe
              </th>
            </tr>
          </thead>
          <tbody>
            {etapas.map((etapa, posicao) => (
              <tr key={`${etapa.agente}-${posicao}`}>
                <th scope="row" className={`${classesDaCelula} wrap-anywhere`}>
                  {etapa.agente}
                </th>
                <td className={`${classesDaCelula} whitespace-nowrap`}>{formatarDuracao(etapa.duracaoMs)}</td>
                <td className={`${classesDaCelula} wrap-anywhere`}>{etapa.detalhe ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {categoriaRisco ? (
          <p>
            <b>categoria_risco:</b> {categoriaRisco}
          </p>
        ) : null}
        {ocr ? (
          <p>
            <b>OCR:</b> {ocr}
          </p>
        ) : null}
        {trechos.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Trechos recuperados</p>
            <ol className="list-decimal space-y-2 ps-6">
              {trechos.map((trecho, posicao) => (
                <li key={posicao}>
                  <span className="font-bold">
                    {trecho.remedio} · {trecho.secao}
                    {trecho.pontuacao !== undefined ? ` · ${pontos.format(trecho.pontuacao)}` : ''}
                  </span>
                  <br />
                  {trecho.texto}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </Disclosure>
  );
}
