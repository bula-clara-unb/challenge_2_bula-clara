import { Label, ProgressBar } from 'react-aria-components';

export interface SpinnerProps {
  /** O que está acontecendo ("Lendo a bula da losartana…"). É o nome da barra de progresso. */
  rotulo: string;
  /** Mostra o texto ao lado do círculo. Desligue só quando o texto já aparece em outro lugar. */
  mostrarRotulo?: boolean;
}

/**
 * Espera sem prazo conhecido. Não é região aria-live: quem quiser anunciar a etapa põe o Spinner
 * dentro de um aria-live="polite" (é o que o LoadingStatus faz). Com movimento reduzido, o círculo fica parado.
 */
export function Spinner({ rotulo, mostrarRotulo = true }: SpinnerProps) {
  return (
    <ProgressBar
      isIndeterminate
      aria-label={mostrarRotulo ? undefined : rotulo}
      className="flex items-center gap-3 text-apoio text-text-muted"
    >
      <span
        aria-hidden="true"
        className="size-6 shrink-0 animate-spin rounded-full border-3 border-border-subtle border-t-action-primary motion-reduce:animate-none"
      />
      {mostrarRotulo ? <Label>{rotulo}</Label> : null}
    </ProgressBar>
  );
}
