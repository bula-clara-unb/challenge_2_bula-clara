import type { ReactNode } from 'react';
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from 'react-aria-components';
import { classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'style' | 'children' | 'render'> {
  /** Pergunta do grupo, visível. */
  rotulo: string;
  /** Dica abaixo da pergunta. */
  descricao?: string;
  /** Texto do erro, quando nenhuma opção foi escolhida e era preciso. */
  mensagemErro?: MensagemErro;
  /** Os Radio do grupo. */
  children: ReactNode;
}

export function RadioGroup({ rotulo, descricao, mensagemErro, children, ...props }: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} className={classesDoCampo}>
      <Rotulo>{rotulo}</Rotulo>
      <Descricao>{descricao}</Descricao>
      <div className="flex flex-col gap-1">{children}</div>
      <ErroDoCampo mensagem={mensagemErro} />
    </AriaRadioGroup>
  );
}

export interface RadioProps extends Omit<AriaRadioProps, 'className' | 'style' | 'children' | 'render'> {
  /** O texto da opção. É o rótulo. */
  children: ReactNode;
}

export function Radio({ children, ...props }: RadioProps) {
  return (
    <AriaRadio
      {...props}
      className="group flex min-h-12 cursor-pointer items-center gap-3 text-corpo text-text-default data-disabled:cursor-not-allowed data-disabled:opacity-60"
    >
      <span
        className={
          'flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-selecao-borda bg-campo-fundo ' +
          'transition-colors duration-rapida ease-out group-data-selected:border-selecao-marcado ' +
          'group-data-invalid:border-campo-borda-invalida group-data-focus-visible:foco-visivel'
        }
      >
        <span className="hidden size-3.5 rounded-full bg-selecao-marcado group-data-selected:block" />
      </span>
      {children}
    </AriaRadio>
  );
}
