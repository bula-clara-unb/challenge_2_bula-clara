import type { ReactNode } from 'react';

export interface SkipLinkProps {
  /** Âncora do conteúdo principal, sempre um fragmento da própria página. */
  href?: `#${string}`;
  /** O texto do link. */
  children?: ReactNode;
}

/** Primeiro item da página: some da tela até receber foco pelo teclado. */
export function SkipLink({ href = '#conteudo', children = 'Pular para o conteúdo' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={
        'sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 ' +
        'focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-controle focus:px-6 ' +
        'focus:bg-surface-default focus:text-botao focus:font-bold focus:text-action-primary focus:foco-visivel'
      }
    >
      {children}
    </a>
  );
}
