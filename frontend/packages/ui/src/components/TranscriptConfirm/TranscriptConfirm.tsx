import { Microphone } from '@phosphor-icons/react';
import { CaptureConfirm } from '../CaptureConfirm';

export interface TranscriptConfirmProps {
  isOpen: boolean;
  onOpenChange?: (aberta: boolean) => void;
  /** O que o /transcrever devolveu. Vazio quando nada foi entendido. */
  transcricao: string;
  /** "Sim, perguntar": só agora a pergunta vai para a API. */
  onConfirmar: () => void;
  /** "Não, vou escrever" ou "Escrever a pergunta": leva ao campo de pergunta. */
  onEscrever: () => void;
  /** "Gravar de novo", quando nada foi entendido. */
  onGravarDeNovo: () => void;
}

/** "Entendi: … Está certo?" Confirma a transcrição antes de perguntar. */
export function TranscriptConfirm({
  isOpen,
  onOpenChange,
  transcricao,
  onConfirmar,
  onEscrever,
  onGravarDeNovo,
}: TranscriptConfirmProps) {
  if (transcricao.trim() === '') {
    return (
      <CaptureConfirm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        rotulo="Pergunta falada"
        titulo="Não consegui entender a gravação"
        pergunta="Tente falar de novo, mais perto do aparelho, ou escreva a sua pergunta."
        rotuloConfirmar="Gravar de novo"
        iconeConfirmar={Microphone}
        rotuloCorrigir="Escrever a pergunta"
        onConfirmar={onGravarDeNovo}
        onCorrigir={onEscrever}
      />
    );
  }
  return (
    <CaptureConfirm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      rotulo="Entendi"
      titulo={`“${transcricao.trim()}”`}
      pergunta="Está certo?"
      rotuloConfirmar="Sim, perguntar"
      rotuloCorrigir="Não, vou escrever"
      onConfirmar={onConfirmar}
      onCorrigir={onEscrever}
    />
  );
}
