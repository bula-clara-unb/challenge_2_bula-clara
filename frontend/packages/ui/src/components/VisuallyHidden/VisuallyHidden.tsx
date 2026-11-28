import type { ReactNode } from 'react';

export interface VisuallyHiddenProps {
  /** O texto que só o leitor de tela lê. */
  children: ReactNode;
}

/** Texto que só o leitor de tela lê. Continua no fluxo de leitura, mas não aparece na tela. */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className="sr-only">{children}</span>;
}
