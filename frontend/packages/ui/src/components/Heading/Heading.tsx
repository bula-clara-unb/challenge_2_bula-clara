import type { ReactNode, Ref } from 'react';
import { Heading as AriaHeading, type HeadingProps as AriaHeadingProps } from 'react-aria-components';

export type HeadingNivel = 1 | 2 | 3 | 4;
export type HeadingEstilo = 'titulo-1' | 'resposta' | 'titulo-2' | 'titulo-3';

export interface HeadingProps extends Omit<AriaHeadingProps, 'className' | 'style' | 'level' | 'render'> {
  /** Nível no documento (h1 a h4). Separado do estilo para não pular nível por causa da aparência. */
  nivel: HeadingNivel;
  /** Aparência. Se não vier, segue o nível. */
  estilo?: HeadingEstilo;
  /** O texto do título. */
  children: ReactNode;
  /** Para levar o foco ao título quando a resposta chega (use junto com tabIndex={-1}). */
  ref?: Ref<HTMLHeadingElement>;
}

const estiloDoNivel: Record<HeadingNivel, HeadingEstilo> = {
  1: 'titulo-1',
  2: 'titulo-2',
  3: 'titulo-3',
  4: 'titulo-3',
};

const estilos: Record<HeadingEstilo, string> = {
  'titulo-1': 'font-voz font-semibold text-titulo-1',
  resposta: 'font-voz font-semibold text-resposta',
  'titulo-2': 'font-texto font-bold text-titulo-2',
  'titulo-3': 'font-texto font-bold text-titulo-3',
};

/** Nomes como "Hidroclorotiazida" quebram com hífen (ou em qualquer ponto) em vez de vazar da tela. */
const quebra = 'hyphens-auto wrap-anywhere';

export function Heading({ nivel, estilo, ...props }: HeadingProps) {
  return (
    <AriaHeading
      {...props}
      level={nivel}
      className={`${estilos[estilo ?? estiloDoNivel[nivel]]} ${quebra} text-text-default focus:outline-none`}
    />
  );
}
