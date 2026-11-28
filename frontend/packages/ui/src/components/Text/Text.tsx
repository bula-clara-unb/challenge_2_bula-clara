import type { ReactNode } from 'react';
import { Text as AriaText } from 'react-aria-components';

export type TextVariante = 'corpo' | 'apoio' | 'rotulo';

export interface TextProps {
  /**
   * `corpo` para o texto normal; `apoio` para fonte, metadados e dicas;
   * `rotulo` para o título curto de bloco em caixa alta ("SUA PERGUNTA"), só com palavras curtas.
   */
  variante?: TextVariante;
  /** O elemento HTML. `span` para usar dentro de outra linha. */
  elemento?: 'p' | 'span' | 'div';
  /** Para ligar o texto a um controle com aria-describedby. */
  id?: string;
  /** O texto. */
  children: ReactNode;
}

const variantes: Record<TextVariante, string> = {
  corpo: 'text-corpo text-text-default',
  apoio: 'text-apoio text-text-muted',
  rotulo: 'text-rotulo font-bold uppercase tracking-rotulo text-text-muted',
};

export function Text({ variante = 'corpo', elemento = 'p', ...props }: TextProps) {
  return <AriaText {...props} elementType={elemento} className={variantes[variante]} />;
}
