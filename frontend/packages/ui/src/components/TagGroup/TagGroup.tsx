import type { Icon } from '@phosphor-icons/react';
import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList,
  type TagGroupProps as AriaTagGroupProps,
  type TagProps as AriaTagProps,
} from 'react-aria-components';

export interface TagGroupProps<T extends object> extends Omit<AriaTagGroupProps, 'className' | 'style' | 'children' | 'render'> {
  /** Rótulo de bloco, visível e em caixa alta ("Seus remédios"). */
  rotulo: string;
  /** Os itens, quando a lista muda (como os remédios da pessoa). Cada um precisa de `id`. */
  items?: Iterable<T>;
  /** Os Tag, ou uma função que desenha um Tag para cada item. */
  children: ReactNode | ((item: T) => ReactNode);
  /** O que aparece quando a lista está vazia. */
  textoVazio?: string;
}

export function TagGroup<T extends object>({ rotulo, items, children, textoVazio, ...props }: TagGroupProps<T>) {
  return (
    <AriaTagGroup {...props} className="flex flex-col gap-2">
      <Label className="text-rotulo font-bold uppercase tracking-rotulo text-text-muted">{rotulo}</Label>
      <TagList
        items={items}
        className="flex flex-wrap gap-2"
        renderEmptyState={textoVazio ? () => <p className="text-apoio text-text-muted">{textoVazio}</p> : undefined}
      >
        {children}
      </TagList>
    </AriaTagGroup>
  );
}

export interface TagProps extends Omit<AriaTagProps, 'className' | 'style' | 'children' | 'textValue' | 'render'> {
  /** O texto do chip. */
  children: string;
  /** Ícone Phosphor à esquerda. É decorativo. */
  icone?: Icon;
  /** Verbo do botão de remover. O React Aria junta o texto do chip: "Remover Losartana". */
  rotuloRemover?: string;
}

/** Chip: fundo azul-claro, texto azul-escuro, 48px de altura. Com onRemove no grupo, ganha o botão de remover. */
export function Tag({ children, icone: Icone, rotuloRemover = 'Remover', ...props }: TagProps) {
  return (
    <AriaTag
      {...props}
      textValue={children}
      className={
        'inline-flex min-h-12 cursor-default items-center gap-2 rounded-controle border border-transparent bg-chip-fundo ' +
        'px-3 text-apoio text-chip-texto outline-none transition-colors duration-rapida ease-out ' +
        'data-hovered:border-chip-texto data-selected:border-chip-texto data-selected:font-bold ' +
        'data-focus-visible:foco-visivel alto-contraste:border-(length:--bc-borda-controle) alto-contraste:border-text-default'
      }
    >
      {({ allowsRemoving }) => (
        <>
          {Icone ? <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" /> : null}
          {children}
          {allowsRemoving ? (
            <AriaButton
              slot="remove"
              aria-label={rotuloRemover}
              className={
                '-me-3 inline-flex size-12 cursor-pointer items-center justify-center rounded-controle ' +
                'data-hovered:bg-surface-default data-focus-visible:foco-visivel'
              }
            >
              <X size="1.25rem" weight="bold" aria-hidden="true" focusable="false" />
            </AriaButton>
          ) : null}
        </>
      )}
    </AriaTag>
  );
}
