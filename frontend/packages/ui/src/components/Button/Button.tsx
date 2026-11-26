import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { classesDeBotao, type ButtonVariante } from './estilo';

export type { ButtonVariante } from './estilo';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
  /** O texto diz a ação ("Apagar tudo", nunca "OK"). É o nome acessível. */
  children: string;
  /** `primaria` para a ação principal da tela, `secundaria` e `discreta` para as outras, `perigo` para apagar. */
  variante?: ButtonVariante;
  /** Ícone Phosphor à esquerda do texto. É decorativo: o texto já diz a ação. */
  icone?: Icon;
  /** Ocupa a largura toda do contêiner. Útil no celular. */
  larguraTotal?: boolean;
}

export function Button({
  variante = 'primaria',
  icone: Icone,
  larguraTotal = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton {...props} className={classesDeBotao(variante, larguraTotal)}>
      {Icone ? <Icone size={24} weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaButton>
  );
}
