import { Info, Prohibit, Warning, type Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

/**
 * Três tons, e nenhum é verde: verde só confirma ação (Toast) e nunca diz que algo é seguro.
 * - `perigo`: perigo real ("A bula diz para não usar junto").
 * - `cuidado`: pede atenção ("A bula pede cuidado com essa combinação").
 * - `info`: neutro ("A bula não fala dessa combinação").
 */
export type AlertTom = 'info' | 'cuidado' | 'perigo';

export interface AlertProps {
  /** `perigo`, `cuidado` ou `info`. Não existe tom verde. */
  tom: AlertTom;
  /** A mensagem principal, em uma frase. */
  titulo: string;
  /** O próximo passo ou o detalhe. */
  children?: ReactNode;
  /** Nível do título no documento. */
  nivelTitulo?: 2 | 3 | 4;
  /**
   * Só quando o aviso aparece depois que a página já carregou: `polite` vira role="status",
   * `assertive` vira role="alert". Sem isso, é role="note" e não interrompe o leitor de tela.
   */
  anunciar?: 'polite' | 'assertive';
}

const tons: Record<AlertTom, { classes: string; icone: Icon }> = {
  perigo: { classes: 'bg-danger-bg text-danger-text border-danger-border', icone: Prohibit },
  cuidado: { classes: 'bg-caution-bg text-caution-text border-caution-border', icone: Warning },
  info: { classes: 'bg-surface-info text-text-default border-border-field', icone: Info },
};

const papel = { polite: 'status', assertive: 'alert' } as const;

/** Estado da tela, com barra lateral (padrão do gov.br e do NHS). No alto contraste, borda preta inteira. */
export function Alert({ tom, titulo, children, nivelTitulo = 3, anunciar }: AlertProps) {
  const { classes, icone: Icone } = tons[tom];
  const Titulo = `h${nivelTitulo}` as const;
  return (
    <div
      role={anunciar ? papel[anunciar] : 'note'}
      className={
        `flex max-w-medida gap-3 rounded-aviso px-4 py-3 border-(length:--bc-borda-aviso) ` +
        `border-s-(length:--bc-borda-barra-aviso) alto-contraste:border-text-default ${classes}`
      }
    >
      <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <Titulo className="text-titulo-3 font-bold">{titulo}</Titulo>
        {children ? <div className="text-corpo">{children}</div> : null}
      </div>
    </div>
  );
}
