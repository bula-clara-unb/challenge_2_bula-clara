import { Check, type Icon } from '@phosphor-icons/react';
import { Button } from '../Button';
import { Sheet } from '../Sheet';

export interface CaptureConfirmProps {
  /** A folha aparece quando a leitura da foto ou a transcrição da voz chega. */
  isOpen: boolean;
  /** Esc ou toque fora fecham a folha sem perguntar nada. */
  onOpenChange?: (aberta: boolean) => void;
  /** Linha curta em caixa alta acima do título ("Li na caixa", "Entendi"). */
  rotulo: string;
  /** O que foi lido ou transcrito, em destaque. É o nome da folha para o leitor de tela. */
  titulo: string;
  /** A pergunta de confirmação ("É esse o remédio?"). */
  pergunta: string;
  /** Texto do botão principal ("Sim, perguntar sobre ele"). */
  rotuloConfirmar: string;
  iconeConfirmar?: Icon;
  /** Texto do caminho por digitação, que está sempre disponível ("Não, vou digitar o nome"). */
  rotuloCorrigir: string;
  /** Nota curta abaixo dos botões ("A foto é usada só para ler o nome e não é guardada."). */
  nota?: string;
  /** Só depois disso a pergunta vai para a API (risco R3). */
  onConfirmar: () => void;
  onCorrigir: () => void;
}

/**
 * Folha de confirmação comum à foto (OcrConfirm) e à voz (TranscriptConfirm). A pessoa sempre
 * confirma o que o sistema entendeu antes de a pergunta ir para a API.
 */
export function CaptureConfirm({
  isOpen,
  onOpenChange,
  rotulo,
  titulo,
  pergunta,
  rotuloConfirmar,
  iconeConfirmar = Check,
  rotuloCorrigir,
  nota,
  onConfirmar,
  onCorrigir,
}: CaptureConfirmProps) {
  return (
    <Sheet isOpen={isOpen} onOpenChange={onOpenChange} rotulo={rotulo} titulo={titulo}>
      {({ fechar }) => (
        <>
          <p className="text-corpo">{pergunta}</p>
          <Button
            larguraTotal
            icone={iconeConfirmar}
            onPress={() => {
              fechar();
              onConfirmar();
            }}
          >
            {rotuloConfirmar}
          </Button>
          <Button
            larguraTotal
            variante="secundaria"
            onPress={() => {
              fechar();
              onCorrigir();
            }}
          >
            {rotuloCorrigir}
          </Button>
          {nota ? <p className="text-apoio text-text-muted">{nota}</p> : null}
        </>
      )}
    </Sheet>
  );
}
