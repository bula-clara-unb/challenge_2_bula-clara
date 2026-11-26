import { TextArea as AriaTextArea, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';

export interface TextAreaProps extends Omit<AriaTextFieldProps, 'className' | 'style' | 'children' | 'render' | 'type'> {
  /** Rótulo visível. Obrigatório: placeholder nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo. */
  descricao?: string;
  /** Texto do erro. Sem ele, aparece a mensagem de validação do navegador. */
  mensagemErro?: MensagemErro;
  /** Altura inicial, em linhas. */
  linhas?: number;
}

export function TextArea({ rotulo, descricao, mensagemErro, linhas = 4, ...props }: TextAreaProps) {
  return (
    <AriaTextField {...props} className={classesDoCampo}>
      <Rotulo>{rotulo}</Rotulo>
      <AriaTextArea rows={linhas} className={`${classesDaEntrada} resize-y`} />
      <Descricao>{descricao}</Descricao>
      <ErroDoCampo mensagem={mensagemErro} />
    </AriaTextField>
  );
}
