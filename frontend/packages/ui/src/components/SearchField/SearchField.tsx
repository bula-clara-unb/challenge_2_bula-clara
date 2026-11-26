import { MagnifyingGlass, X } from '@phosphor-icons/react';
import {
  Button as AriaButton,
  Input,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, Rotulo } from '../Campo/partes';

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'style' | 'children' | 'render'> {
  /** Rótulo visível. Obrigatório: placeholder nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo. */
  descricao?: string;
  /** Nome do botão que limpa a busca. */
  rotuloLimpar?: string;
}

export function SearchField({ rotulo, descricao, rotuloLimpar = 'Limpar busca', ...props }: SearchFieldProps) {
  return (
    <AriaSearchField {...props} className={`group ${classesDoCampo}`}>
      <Rotulo>{rotulo}</Rotulo>
      <div className="relative">
        <MagnifyingGlass
          size="1.5rem"
          weight="bold"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <Input
          className={`${classesDaEntrada} ps-12 pe-12 [&::-webkit-search-cancel-button]:hidden`}
        />
        <AriaButton
          aria-label={rotuloLimpar}
          className={
            'absolute end-0 top-0 inline-flex size-12 cursor-pointer items-center justify-center rounded-controle ' +
            'text-action-primary data-hovered:bg-action-primary-subtle data-focus-visible:foco-visivel ' +
            'group-data-empty:hidden'
          }
        >
          <X size="1.5rem" weight="bold" aria-hidden="true" focusable="false" />
        </AriaButton>
      </div>
      <Descricao>{descricao}</Descricao>
    </AriaSearchField>
  );
}
