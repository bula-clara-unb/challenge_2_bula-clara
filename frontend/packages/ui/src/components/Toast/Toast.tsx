import { CheckCircle, X } from '@phosphor-icons/react';
import {
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
} from 'react-aria-components';
import { IconButton } from '../IconButton';

/** O toast só carrega uma frase curta. Não tem tom nem variante: ele nunca é aviso. */
export interface ConfirmacaoDeAcao {
  mensagem: string;
}

/** 8 segundos, e o tempo para enquanto o toast está com foco ou com o mouse em cima (WCAG 2.2.1). */
export const TEMPO_DO_TOAST = 8000;

export const filaDeToasts = new ToastQueue<ConfirmacaoDeAcao>({ maxVisibleToasts: 1 });

/**
 * Confirma uma ação que a pessoa acabou de fazer ("Lista apagada deste aparelho.").
 * Nunca use para informação de segurança, erro ou estado da tela: isso é Alert.
 */
export function confirmarAcao(mensagem: string): string {
  return filaDeToasts.add({ mensagem }, { timeout: TEMPO_DO_TOAST });
}

export interface ToastRegionProps {
  /** Só para testes e stories. O app usa a fila padrão, alimentada por confirmarAcao. */
  fila?: ToastQueue<ConfirmacaoDeAcao>;
  /** Nome da região, que o leitor de tela anuncia ao entrar nela com F6. */
  rotuloRegiao?: string;
  /** Nome do X de fechar o toast. */
  rotuloFechar?: string;
}

/** Monte uma vez só, no fim do layout do app. */
export function ToastRegion({
  fila = filaDeToasts,
  rotuloRegiao = 'Confirmações',
  rotuloFechar = 'Fechar',
}: ToastRegionProps) {
  return (
    <AriaToastRegion
      queue={fila}
      aria-label={rotuloRegiao}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg flex-col gap-2 outline-none data-focus-visible:foco-visivel"
    >
      {({ toast }) => (
        <AriaToast
          toast={toast}
          className={
            'flex items-center gap-3 rounded-controle border-(length:--bc-borda-controle) border-toast-destaque ' +
            'bg-toast-fundo py-1 ps-4 pe-1 shadow-flutuante outline-none data-focus-visible:foco-visivel'
          }
        >
          <CheckCircle
            size="1.5rem"
            weight="bold"
            aria-hidden="true"
            focusable="false"
            className="shrink-0 text-toast-destaque"
          />
          <ToastContent className="flex-1 py-2">
            <Text slot="title" className="text-corpo font-bold text-toast-destaque">
              {toast.content.mensagem}
            </Text>
          </ToastContent>
          <IconButton slot="close" aria-label={rotuloFechar} icone={X} />
        </AriaToast>
      )}
    </AriaToastRegion>
  );
}
