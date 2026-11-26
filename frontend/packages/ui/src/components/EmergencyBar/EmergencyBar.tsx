import { Phone } from '@phosphor-icons/react';

export interface EmergencyBarProps {
  /**
   * Para onde a faixa leva. Por padrão liga direto para o 192. O app pode apontar para a página de
   * contatos de emergência, mas o texto da faixa não muda.
   */
  href?: string;
}

/**
 * Faixa "Emergência? Ligue 192", logo abaixo do topo, em todas as telas. Nunca some, nem no
 * carregamento nem num erro. A posição fixa é do layout do app.
 */
export function EmergencyBar({ href = 'tel:192' }: EmergencyBarProps) {
  return (
    <a
      href={href}
      className={
        'flex min-h-12 items-center gap-2 bg-faixa-emergencia-fundo px-4 py-2 text-apoio font-bold ' +
        'text-faixa-emergencia-texto no-underline focus-visible:foco-visivel ' +
        'alto-contraste:border-b-3 alto-contraste:border-faixa-emergencia-texto'
      }
    >
      <Phone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
      Emergência? Ligue 192
    </a>
  );
}
