import type { Icon } from '@phosphor-icons/react';
import { Link as AriaLink, type LinkProps as AriaLinkProps } from 'react-aria-components';
import { classesDeBotao, type ButtonVariante } from '../Button/estilo';

export interface LinkButtonProps extends Omit<AriaLinkProps, 'className' | 'style' | 'href' | 'children'> {
  /** Obrigatório: um LinkButton sempre leva a algum lugar. Para ação na própria tela, use Button. */
  href: string;
  /** O texto diz para onde o link leva ("Ver a bula inteira"). */
  children: string;
  /** As mesmas do Button. Na `discreta`, o link fica sublinhado. */
  variante?: ButtonVariante;
  /** Ícone Phosphor à esquerda do texto. É decorativo. */
  icone?: Icon;
  /** Ocupa a largura toda do contêiner. */
  larguraTotal?: boolean;
}

/** Link com a cara do Button, nas mesmas variantes. */
export function LinkButton({
  variante = 'primaria',
  icone: Icone,
  larguraTotal = false,
  children,
  ...props
}: LinkButtonProps) {
  const classes = classesDeBotao(variante, larguraTotal) + (variante === 'discreta' ? '' : ' no-underline');
  return (
    <AriaLink {...props} className={classes}>
      {Icone ? <Icone size={24} weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaLink>
  );
}
