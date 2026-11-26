import { CaretDown } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type DisclosureGroupProps,
  type DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components';

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'className' | 'style' | 'children' | 'render'> {
  /** O texto do botão que abre e fecha. Na ficha do remédio, a pergunta da seção ("4. O que devo saber antes de usar?"). */
  titulo: string;
  /** Nível do título que envolve o botão. */
  nivelTitulo?: 2 | 3 | 4;
  /** O conteúdo que aparece quando abre. */
  children: ReactNode;
}

/** Bloco que abre e fecha. Aberto, a borda fica azul e mais grossa. */
export function Disclosure({ titulo, nivelTitulo = 3, children, ...props }: DisclosureProps) {
  return (
    <AriaDisclosure
      {...props}
      className={
        'group max-w-medida rounded-controle border border-border-field ' +
        'data-expanded:border-(length:--bc-borda-controle) data-expanded:border-action-primary ' +
        'alto-contraste:border-(length:--bc-borda-controle)'
      }
    >
      <Heading level={nivelTitulo} className="text-corpo font-bold">
        <AriaButton
          slot="trigger"
          className={
            'flex min-h-13 w-full cursor-pointer items-center justify-between gap-2 rounded-controle px-4 py-2 ' +
            'text-start text-text-default outline-none data-focus-visible:foco-visivel'
          }
        >
          {titulo}
          <CaretDown
            size="1.5rem"
            weight="bold"
            aria-hidden="true"
            focusable="false"
            className="shrink-0 transition-transform duration-rapida ease-out group-data-expanded:rotate-180"
          />
        </AriaButton>
      </Heading>
      {/* Fechado, o painel fica com hidden="until-found", que o Tailwind não esconde:
          o espaçamento só entra aberto, senão sobra um vão embaixo do título. */}
      <DisclosurePanel className="px-4 text-corpo group-data-expanded:pb-4">{children}</DisclosurePanel>
    </AriaDisclosure>
  );
}

export interface AccordionProps extends Omit<DisclosureGroupProps, 'className' | 'style' | 'children' | 'render' | 'allowsMultipleExpanded'> {
  /** Vários Disclosure, cada um com `id`. */
  children: ReactNode;
  /** Por padrão, abrir uma seção não fecha as outras. */
  permiteVariosAbertos?: boolean;
}

/** Grupo de Disclosure, como as 9 seções da bula na ficha do remédio. */
export function Accordion({ permiteVariosAbertos = true, ...props }: AccordionProps) {
  return <DisclosureGroup {...props} allowsMultipleExpanded={permiteVariosAbertos} className="flex flex-col gap-4" />;
}
