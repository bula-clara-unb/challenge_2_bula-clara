import { Modal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';
import { classesDoPainel, classesDoVeu, Painel, type ConteudoDoPainel } from '../Dialog/Painel';

export interface SheetProps extends Pick<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> {
  /** Título visível e nome acessível da folha. Sai no estilo da frase-resposta. */
  titulo: string;
  /** Linha curta em caixa alta acima do título ("Li na caixa"). */
  rotulo?: string;
  /** Mostra um X com esse nome. Sem ele, a folha fecha com Esc, tocando fora ou pelas ações do conteúdo. */
  rotuloFechar?: string;
  /** O conteúdo. Pode ser uma função que recebe `fechar`. */
  children: ConteudoDoPainel;
}

/** Folha que sobe da borda de baixo. Usada na confirmação da foto e da voz. Abre com DialogTrigger. */
export function Sheet({ titulo, rotulo, rotuloFechar, children, ...props }: SheetProps) {
  return (
    <ModalOverlay {...props} isDismissable className={`${classesDoVeu} items-end justify-center`}>
      <Modal
        className={
          `${classesDoPainel} max-h-[85dvh] w-full max-w-2xl overflow-auto rounded-t-painel px-4 py-6 ` +
          'data-entering:animate-subir data-exiting:animate-descer'
        }
      >
        <Painel titulo={titulo} estiloDoTitulo="resposta" rotulo={rotulo} papel="dialog" rotuloFechar={rotuloFechar}>
          {children}
        </Painel>
      </Modal>
    </ModalOverlay>
  );
}
