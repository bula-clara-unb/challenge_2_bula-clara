import { CaretDown } from '@phosphor-icons/react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  type ComboBoxProps as AriaComboBoxProps,
} from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';
import { filtroTolerante } from './filtroTolerante';

export interface OpcaoComboBox {
  id: string;
  rotulo: string;
}

export interface ComboBoxProps<T extends OpcaoComboBox>
  extends Omit<AriaComboBoxProps<T>, 'className' | 'style' | 'children' | 'render' | 'items' | 'defaultItems'> {
  /** Rótulo visível. Obrigatório: o exemplo nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo. */
  descricao?: string;
  /** Exemplo dentro do campo vazio ("ex.: metformina"). */
  exemplo?: string;
  /** Texto do erro. Sem ele, aparece a mensagem de validação do navegador. */
  mensagemErro?: MensagemErro;
  /** Todas as opções. O filtro padrão (filtroTolerante) aceita erro de digitação; troque com defaultFilter. */
  opcoes: Iterable<T>;
  /** O que aparece quando nada combina com o que foi digitado. */
  textoSemResultado?: string;
  /** Nome do botão que abre a lista. */
  rotuloAbrir?: string;
}

export function ComboBox<T extends OpcaoComboBox>({
  rotulo,
  descricao,
  exemplo,
  mensagemErro,
  opcoes,
  textoSemResultado = 'Não achei esse nome. Confira como está escrito na caixa.',
  rotuloAbrir = 'Mostrar opções',
  defaultFilter = filtroTolerante,
  ...props
}: ComboBoxProps<T>) {
  return (
    <AriaComboBox
      {...props}
      defaultFilter={defaultFilter}
      defaultItems={opcoes}
      allowsEmptyCollection
      className={classesDoCampo}
    >
      <Rotulo>{rotulo}</Rotulo>
      <div className="relative">
        <Input placeholder={exemplo} className={`${classesDaEntrada} pe-12`} />
        <AriaButton
          aria-label={rotuloAbrir}
          className={
            'absolute end-0 top-0 inline-flex size-12 cursor-pointer items-center justify-center rounded-controle ' +
            'text-action-primary data-hovered:bg-action-primary-subtle data-focus-visible:foco-visivel'
          }
        >
          <CaretDown size="1.5rem" weight="bold" aria-hidden="true" focusable="false" />
        </AriaButton>
      </div>
      <Descricao>{descricao}</Descricao>
      <ErroDoCampo mensagem={mensagemErro} />
      <Popover
        className={
          'w-(--trigger-width) overflow-auto rounded-controle border-(length:--bc-borda-controle) border-campo-borda ' +
          'bg-painel-fundo shadow-flutuante'
        }
      >
        <ListBox
          className="max-h-80 p-1 outline-none"
          renderEmptyState={() => <p className="px-3 py-3 text-corpo text-text-muted">{textoSemResultado}</p>}
        >
          {(opcao: T) => (
            <ListBoxItem
              id={opcao.id}
              textValue={opcao.rotulo}
              className={
                'flex min-h-12 cursor-pointer items-center rounded-controle px-3 text-corpo text-text-default outline-none ' +
                'data-focused:bg-action-primary-subtle data-focused:text-action-primary-strong ' +
                'data-focus-visible:foco-visivel data-selected:font-bold'
              }
            >
              {opcao.rotulo}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}
