import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

/** Mesmas cores do Button. `primaria` é a usada na caixa de pergunta (câmera e microfone). */
export type IconButtonVariante = 'primaria' | 'secundaria' | 'discreta';

export interface IconButtonProps
  extends Omit<AriaButtonProps, 'className' | 'style' | 'children' | 'aria-label'> {
  /** Obrigatório: é o único nome que o leitor de tela anuncia. */
  'aria-label': string;
  /** Ícone Phosphor. Fica escondido do leitor de tela, que lê o `aria-label`. */
  icone: Icon;
  /** Mesmas cores do Button, sem a de perigo. */
  variante?: IconButtonVariante;
}

const variantes: Record<IconButtonVariante, string> = {
  primaria:
    'border-action-primary bg-action-primary text-text-on-solid ' +
    'data-hovered:border-action-primary-strong data-hovered:bg-action-primary-strong ' +
    'data-pressed:border-action-primary-strong data-pressed:bg-action-primary-strong alto-contraste:border-3 alto-contraste:border-text-default',
  secundaria:
    'border-action-primary bg-surface-default text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle alto-contraste:border-3 alto-contraste:border-text-default',
  discreta:
    'border-transparent bg-transparent text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle',
};

export function IconButton({ icone: Icone, variante = 'secundaria', ...props }: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      className={
        'inline-flex size-12 flex-none cursor-pointer items-center justify-center rounded-controle ' +
        'border-(length:--bc-borda-controle) transition-colors duration-rapida ease-out ' +
        'outline-none data-focus-visible:foco-visivel data-disabled:cursor-not-allowed data-disabled:opacity-55 ' +
        variantes[variante]
      }
    >
      <Icone size={24} weight="bold" aria-hidden="true" focusable="false" />
    </AriaButton>
  );
}
