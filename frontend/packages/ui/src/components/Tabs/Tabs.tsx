import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';

export type TabsProps = Omit<AriaTabsProps, 'className' | 'style' | 'render'>;

export function Tabs(props: TabsProps) {
  return <AriaTabs {...props} className="flex flex-col gap-4" />;
}

export interface TabListProps<T extends object>
  extends Omit<AriaTabListProps<T>, 'className' | 'style' | 'aria-label' | 'render'> {
  /** Obrigatório: diz do que são as abas ("Partes da resposta"). */
  'aria-label': string;
}

export function TabList<T extends object>(props: TabListProps<T>) {
  return <AriaTabList {...props} className="flex border-t border-border-subtle" />;
}

export interface TabProps extends Omit<AriaTabProps, 'className' | 'style' | 'children' | 'render'> {
  /** Liga a aba ao TabPanel de mesmo `id`. */
  id: string;
  /** O texto da aba, curto. */
  children: string;
  /** Ícone Phosphor acima do texto. É decorativo. */
  icone?: Icon;
}

/** Aba com a cara da barra de navegação aprovada: ícone em cima, texto embaixo, barra azul no topo quando selecionada. */
export function Tab({ icone: Icone, children, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      className={
        'flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-t-3 border-transparent ' +
        'px-2 text-center text-rotulo text-text-muted outline-none transition-colors duration-rapida ease-out ' +
        'data-hovered:text-action-primary data-selected:border-aba-indicador data-selected:font-bold ' +
        'data-selected:text-action-primary data-focus-visible:foco-visivel'
      }
    >
      {Icone ? <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className' | 'style' | 'children' | 'render'> {
  /** O mesmo `id` da Tab que mostra este painel. */
  id: string;
  /** O conteúdo do painel. */
  children: ReactNode;
}

export function TabPanel(props: TabPanelProps) {
  return <AriaTabPanel {...props} className="rounded-controle outline-none data-focus-visible:foco-visivel" />;
}
