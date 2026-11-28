// Peças internas de Dialog e Sheet (grupo C). Não são exportadas pelo pacote.
import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Dialog as AriaDialog, Heading } from 'react-aria-components';
import { IconButton } from '../IconButton';

export type ConteudoDoPainel = ReactNode | ((opcoes: { fechar: () => void }) => ReactNode);

export interface PainelProps {
  titulo: string;
  estiloDoTitulo: 'titulo-3' | 'resposta';
  /** Linha curta em caixa alta acima do título ("Li na caixa"). */
  rotulo?: string | undefined;
  papel: 'dialog' | 'alertdialog';
  /** Sem rótulo, não aparece o botão de fechar. */
  rotuloFechar?: string | undefined;
  children: ConteudoDoPainel;
}

const estilosDoTitulo = {
  'titulo-3': 'font-texto text-titulo-3 font-bold',
  resposta: 'font-voz text-resposta font-semibold',
};

export function Painel({ titulo, estiloDoTitulo, rotulo, papel, rotuloFechar, children }: PainelProps) {
  return (
    <AriaDialog role={papel} className="flex flex-col gap-3 outline-none">
      {({ close }) => (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {rotulo ? (
                <p className="text-rotulo font-bold uppercase tracking-rotulo text-text-muted">{rotulo}</p>
              ) : null}
              <Heading
                slot="title"
                className={`${estilosDoTitulo[estiloDoTitulo]} hyphens-auto wrap-anywhere text-text-default`}
              >
                {titulo}
              </Heading>
            </div>
            {rotuloFechar ? <IconButton aria-label={rotuloFechar} icone={X} onPress={close} /> : null}
          </div>
          {typeof children === 'function' ? children({ fechar: close }) : children}
        </>
      )}
    </AriaDialog>
  );
}

/** Véu escuro atrás do painel. A animação usa os tokens de duração, que vão a 0ms com movimento reduzido. */
export const classesDoVeu =
  'fixed inset-0 z-40 flex bg-sobreposicao-fundo data-entering:animate-aparecer data-exiting:animate-sumir';

/** No alto contraste, a sombra não basta: o painel ganha borda preta de 3px. */
export const classesDoPainel =
  'bg-painel-fundo text-text-default shadow-flutuante outline-none alto-contraste:border-3 alto-contraste:border-text-default';
