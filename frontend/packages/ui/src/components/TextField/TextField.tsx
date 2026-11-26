import { Input, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'className' | 'style' | 'children' | 'render'> {
  /** Rótulo visível. Obrigatório: o exemplo (placeholder) nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo ("Como está escrito na caixa."). */
  descricao?: string;
  /** Exemplo dentro do campo vazio ("ex.: metformina"). Some ao digitar, por isso nunca é o rótulo. */
  exemplo?: string;
  /** Texto do erro. Sem ele, aparece a mensagem de validação do navegador. */
  mensagemErro?: MensagemErro;
}

export function TextField({ rotulo, descricao, exemplo, mensagemErro, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={classesDoCampo}>
      <Rotulo>{rotulo}</Rotulo>
      <Input placeholder={exemplo} className={classesDaEntrada} />
      <Descricao>{descricao}</Descricao>
      <ErroDoCampo mensagem={mensagemErro} />
    </AriaTextField>
  );
}
