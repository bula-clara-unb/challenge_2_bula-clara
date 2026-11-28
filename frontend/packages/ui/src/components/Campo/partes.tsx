// Peças internas dos campos do grupo B (não são exportadas pelo pacote).
import { Warning } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { FieldError, Label, Text, type ValidationResult } from 'react-aria-components';

export type MensagemErro = string | ((validacao: ValidationResult) => string);

/** Rótulo, entrada, dica e erro empilhados com 4px entre eles; no máximo 420px de largura. */
export const classesDoCampo = 'flex max-w-105 flex-col gap-1';

/** Borda de 2px; quando inválido, 3px em danger-border. O foco aparece sempre, até no clique. */
export const classesDaEntrada =
  'min-h-12 w-full rounded-controle border-(length:--bc-borda-controle) border-campo-borda bg-campo-fundo ' +
  'px-3 py-2 text-corpo text-text-default placeholder:text-text-muted transition-colors duration-rapida ease-out ' +
  'data-focused:foco-visivel data-invalid:border-3 data-invalid:border-campo-borda-invalida ' +
  'data-disabled:cursor-not-allowed data-disabled:opacity-55';

export function Rotulo({ children }: { children: ReactNode }) {
  return <Label className="text-corpo font-bold text-text-default">{children}</Label>;
}

export function Descricao({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <Text slot="description" className="text-apoio text-text-muted">
      {children}
    </Text>
  );
}

/**
 * A região aria-live fica sempre montada: assim o leitor de tela anuncia o erro quando ele aparece.
 * O FieldError só desenha alguma coisa quando o campo está inválido.
 */
export function ErroDoCampo({ mensagem }: { mensagem?: MensagemErro | undefined }) {
  return (
    <div aria-live="polite">
      <FieldError className="flex items-center gap-1 text-apoio font-bold text-campo-texto-erro">
        {(validacao) => (
          <>
            <Warning size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
            {typeof mensagem === 'function' ? mensagem(validacao) : (mensagem ?? validacao.validationErrors.join(' '))}
          </>
        )}
      </FieldError>
    </div>
  );
}
