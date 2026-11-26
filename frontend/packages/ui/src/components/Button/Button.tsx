import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

/**
 * - `primaria`: a ação principal da tela (uma por tela).
 * - `secundaria`: ações de mesmo peso, como foto e voz.
 * - `discreta`: alternativas, como "Digitar o nome".
 * - `perigo`: só para "Apagar tudo".
 */
export type ButtonVariante = 'primaria' | 'secundaria' | 'discreta' | 'perigo';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
  children: string;
  variante?: ButtonVariante;
  /** Ícone Phosphor à esquerda do texto. É decorativo: o texto já diz a ação. */
  icone?: Icon;
  /** Ocupa a largura toda do contêiner. Útil no celular. */
  larguraTotal?: boolean;
}

const base =
  'inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center gap-2 rounded-controle ' +
  'text-botao font-bold transition-colors duration-rapida ease-out ' +
  'border-(length:--bc-borda-controle) data-focus-visible:foco-visivel ' +
  'data-disabled:cursor-not-allowed data-disabled:opacity-55';

const variantes: Record<ButtonVariante, string> = {
  primaria:
    'px-6 border-action-primary bg-action-primary text-text-on-solid ' +
    'data-hovered:border-action-primary-strong data-hovered:bg-action-primary-strong ' +
    'data-pressed:border-action-primary-strong data-pressed:bg-action-primary-strong',
  secundaria:
    'px-6 border-action-primary bg-surface-default text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle',
  discreta:
    'px-3 border-transparent bg-transparent text-action-primary underline underline-offset-3 ' +
    'data-hovered:text-action-primary-strong data-pressed:text-action-primary-strong',
  perigo:
    'px-6 border-danger-border bg-surface-default text-danger-text ' +
    'data-hovered:bg-danger-bg data-pressed:bg-danger-bg',
};

export function Button({
  variante = 'primaria',
  icone: Icone,
  larguraTotal = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={`${base} ${variantes[variante]}${larguraTotal ? ' w-full' : ''}`}
    >
      {Icone ? <Icone size={24} weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaButton>
  );
}
