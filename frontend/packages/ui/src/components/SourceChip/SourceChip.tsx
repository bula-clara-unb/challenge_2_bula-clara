import { FileText } from '@phosphor-icons/react';
import { Button as AriaButton } from 'react-aria-components';

/** Visual do chip (texto azul-escuro sobre azul-claro, 11:1), igual ao da Tag. */
const classesDoChip =
  'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-controle border border-transparent bg-chip-fundo ' +
  'px-3 py-2 text-start text-apoio text-chip-texto transition-colors duration-rapida ease-out ' +
  'data-hovered:border-chip-texto data-pressed:border-chip-texto data-focus-visible:foco-visivel ' +
  'alto-contraste:border-(length:--bc-borda-controle) alto-contraste:border-text-default';

export interface SourceChipProps {
  /** O número da citação na explicação ([1], [2]…). */
  numero?: number;
  /** De qual bula é o trecho ("Losartana"). */
  remedio: string;
  /** Número da seção na bula (1 a 9, RDC 47/2009). */
  secao: number;
  /**
   * Abre a ficha do remédio na seção citada. É um botão, nunca um link: a ficha abre por estado de
   * navegação, sem o nome do remédio na URL.
   */
  onPress: () => void;
}

/** "[1] Na bula: Losartana · seção 4". Liga a citação ao trecho da bula. */
export function SourceChip({ numero, remedio, secao, onPress }: SourceChipProps) {
  return (
    <AriaButton onPress={onPress} className={classesDoChip}>
      <FileText size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
      <span>
        {numero ? `[${numero}] ` : ''}Na bula:{' '}
        <b className="font-bold">
          {remedio} · seção {secao}
        </b>
      </span>
    </AriaButton>
  );
}

export interface SuggestionChipProps {
  /** A pergunta sugerida, saída de um modelo fixo ("Como tomar a losartana?"). */
  children: string;
  /** Faz a pergunta. */
  onPress: () => void;
}

/** Sugestão de "Perguntar mais" e exemplo da primeira visita: o mesmo visual do SourceChip, sem ícone. */
export function SuggestionChip({ children, onPress }: SuggestionChipProps) {
  return (
    <AriaButton onPress={onPress} className={classesDoChip}>
      {children}
    </AriaButton>
  );
}
