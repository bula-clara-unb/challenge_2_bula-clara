import { Disclosure } from '../Disclosure';

export interface ReasoningStepsProps {
  /**
   * Os passos, montados pelo app a partir do trace dos agentes, já em linguagem do dia a dia
   * ("Lemos a seção 4 das duas bulas."). Sem nome de agente, tempo ou termo técnico.
   */
  passos: readonly string[];
  nivelTitulo?: 2 | 3 | 4;
}

/** "Como chegamos nesta resposta", recolhido por padrão. O trace técnico fica no DemoTrace. */
export function ReasoningSteps({ passos, nivelTitulo = 3 }: ReasoningStepsProps) {
  if (passos.length === 0) return null;
  return (
    <Disclosure titulo="Como chegamos nesta resposta" nivelTitulo={nivelTitulo}>
      <ol className="list-decimal space-y-2 ps-6">
        {passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
    </Disclosure>
  );
}
