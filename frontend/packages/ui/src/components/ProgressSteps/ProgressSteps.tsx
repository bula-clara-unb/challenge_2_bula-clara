import { Check } from '@phosphor-icons/react';
import { VisuallyHidden } from '../VisuallyHidden';

export interface ProgressStepsProps {
  /** Nome da sequência ("Perguntar por foto"). */
  rotulo: string;
  /** Os nomes curtos dos passos, na ordem ("Foto", "Confirmar", "Resposta"). */
  passos: readonly string[];
  /** Índice do passo atual, a partir de 0. */
  atual: number;
}

/** Onde a pessoa está num fluxo de poucos passos. O texto diz tudo; a barra só reforça. */
export function ProgressSteps({ rotulo, passos, atual }: ProgressStepsProps) {
  const indice = Math.min(Math.max(atual, 0), passos.length - 1);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-apoio text-text-muted">
        Passo {indice + 1} de {passos.length}
      </p>
      <ol aria-label={rotulo} className="flex gap-2">
        {passos.map((passo, i) => {
          const feito = i < indice;
          const agora = i === indice;
          return (
            <li
              key={passo}
              aria-current={agora ? 'step' : undefined}
              className={`flex flex-1 flex-col gap-1 text-apoio ${agora ? 'font-bold text-action-primary' : 'text-text-muted'}`}
            >
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-total ${feito || agora ? 'bg-action-primary' : 'bg-border-subtle'}`}
              />
              <span className="flex items-center gap-1">
                {feito ? <Check size="1.25rem" weight="bold" aria-hidden="true" focusable="false" /> : null}
                {passo}
                {feito ? <VisuallyHidden> (feito)</VisuallyHidden> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
