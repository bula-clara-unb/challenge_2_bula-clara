import { Info } from '@phosphor-icons/react';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { Button } from '../Button';

export interface SafetyNoticeProps {
  /** Título que veio do backend ("Isso só o médico pode orientar"). */
  titulo: string;
  /** Mensagem do bloqueio, exatamente como veio do backend. */
  mensagem: string;
  /** Saída opcional, escrita pela interface ("Fazer outra pergunta"). */
  acao?: { rotulo: string; onPress: () => void };
  /** Quando o bloqueio é a resposta da página, use 1. No histórico de respostas, 2. */
  nivelTitulo?: 1 | 2 | 3;
  /** Leva o foco ao título quando o aviso aparece no lugar da resposta. */
  focarAoMontar?: boolean;
  /** O título, para quem quiser levar o foco na hora certa. */
  ref?: Ref<HTMLHeadingElement>;
}

/**
 * Bloqueio por mudança de dose (`alteracao_dose`) ou grupo especial (`grupo_especial`). Firme sem ser
 * alarmante: fundo neutro, nunca vermelho. Emergência e autolesão usam o EmergencyCard.
 */
export function SafetyNotice({ titulo, mensagem, acao, nivelTitulo = 2, focarAoMontar = false, ref }: SafetyNoticeProps) {
  const Titulo = `h${nivelTitulo}` as const;
  const refDoTitulo = useRef<HTMLHeadingElement>(null);
  useImperativeHandle(ref, () => refDoTitulo.current as HTMLHeadingElement, []);

  useEffect(() => {
    if (focarAoMontar) refDoTitulo.current?.focus();
  }, [focarAoMontar]);

  return (
    <div
      role="note"
      className={
        'flex max-w-medida gap-3 rounded-aviso border-(length:--bc-borda-controle) border-border-field ' +
        'bg-surface-info p-4 text-text-default'
      }
    >
      <Info size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Titulo
            ref={refDoTitulo}
            tabIndex={-1}
            className="text-titulo-3 font-bold hyphens-auto wrap-anywhere focus:outline-none"
          >
            {titulo}
          </Titulo>
          <p className="text-corpo">{mensagem}</p>
        </div>
        {acao ? (
          <div>
            <Button variante="secundaria" onPress={acao.onPress}>
              {acao.rotulo}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
