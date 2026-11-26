// Classes do Button, separadas para o LinkButton ter exatamente a mesma cara.
//
// Altura: `min-h-alvo` (48px em 100%, crescendo com o A+, ver styles/index.css). No alto contraste, a borda fica preta e com 3px,
// como pede o design aprovado ("bordas pretas em tudo o que é interativo").

/**
 * - `primaria`: a ação principal da tela (uma por tela).
 * - `secundaria`: ações de mesmo peso, como foto e voz.
 * - `discreta`: alternativas, como "Digitar o nome".
 * - `perigo`: só para "Apagar tudo".
 */
export type ButtonVariante = 'primaria' | 'secundaria' | 'discreta' | 'perigo';

const base =
  'inline-flex min-h-alvo min-w-12 cursor-pointer items-center justify-center gap-2 rounded-controle ' +
  'text-botao font-bold transition-colors duration-rapida ease-out ' +
  'border-(length:--bc-borda-controle) outline-none data-focus-visible:foco-visivel ' +
  'data-disabled:cursor-not-allowed data-disabled:opacity-55';

const variantes: Record<ButtonVariante, string> = {
  primaria:
    'px-6 border-action-primary bg-action-primary text-text-on-solid ' +
    'data-hovered:border-action-primary-strong data-hovered:bg-action-primary-strong ' +
    'data-pressed:border-action-primary-strong data-pressed:bg-action-primary-strong alto-contraste:border-3 alto-contraste:border-text-default',
  secundaria:
    'px-6 border-action-primary bg-surface-default text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle alto-contraste:border-3 alto-contraste:border-text-default',
  discreta:
    'px-3 border-transparent bg-transparent text-action-primary underline underline-offset-3 ' +
    'data-hovered:text-action-primary-strong data-pressed:text-action-primary-strong',
  perigo:
    'px-6 border-danger-border bg-surface-default text-danger-text ' +
    'data-hovered:bg-danger-bg data-pressed:bg-danger-bg alto-contraste:border-3 alto-contraste:border-text-default',
};

export function classesDeBotao(variante: ButtonVariante, larguraTotal: boolean): string {
  return `${base} ${variantes[variante]}${larguraTotal ? ' w-full' : ''}`;
}
