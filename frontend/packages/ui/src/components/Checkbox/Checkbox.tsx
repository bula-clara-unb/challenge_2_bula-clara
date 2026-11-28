import { Check, Minus } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'className' | 'style' | 'children' | 'render'> {
  /** O texto ao lado da caixa. É o rótulo, e clicar nele também marca. */
  children: ReactNode;
}

export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className="group flex min-h-12 cursor-pointer items-center gap-3 text-corpo text-text-default data-disabled:cursor-not-allowed data-disabled:opacity-60"
    >
      {({ isSelected, isIndeterminate }) => (
        <>
          <span
            className={
              'flex size-7 shrink-0 items-center justify-center rounded-aviso border-2 border-selecao-borda bg-campo-fundo ' +
              'text-selecao-marca transition-colors duration-rapida ease-out ' +
              'group-data-selected:border-selecao-marcado group-data-selected:bg-selecao-marcado ' +
              'group-data-indeterminate:border-selecao-marcado group-data-indeterminate:bg-selecao-marcado ' +
              'group-data-invalid:border-campo-borda-invalida group-data-focus-visible:foco-visivel'
            }
          >
            {isIndeterminate ? (
              <Minus size="1.25rem" weight="bold" aria-hidden="true" focusable="false" />
            ) : isSelected ? (
              <Check size="1.25rem" weight="bold" aria-hidden="true" focusable="false" />
            ) : null}
          </span>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
