import { Modal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';
import { classesDoPainel, classesDoVeu, Painel, type ConteudoDoPainel } from './Painel';

export { DialogTrigger } from 'react-aria-components';

export interface DialogProps extends Pick<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> {
  /** Título visível e nome acessível do diálogo. */
  titulo: string;
  /**
   * `alertdialog` para confirmar uma ação que não dá para desfazer ("Apagar a lista?"):
   * não fecha tocando fora e não tem o X, a pessoa precisa escolher um dos botões.
   */
  papel?: 'dialog' | 'alertdialog';
  /** Nome do X de fechar. O `alertdialog` não tem X. */
  rotuloFechar?: string;
  /** O conteúdo. Pode ser uma função que recebe `fechar`, para os botões fecharem o diálogo. */
  children: ConteudoDoPainel;
}

export function Dialog({ titulo, papel = 'dialog', rotuloFechar = 'Fechar', children, ...props }: DialogProps) {
  const alerta = papel === 'alertdialog';
  return (
    <ModalOverlay {...props} isDismissable={!alerta} className={`${classesDoVeu} items-center justify-center p-4`}>
      <Modal
        className={`${classesDoPainel} max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-auto rounded-painel p-6`}
      >
        <Painel titulo={titulo} estiloDoTitulo="titulo-3" papel={papel} rotuloFechar={alerta ? undefined : rotuloFechar}>
          {children}
        </Painel>
      </Modal>
    </ModalOverlay>
  );
}
