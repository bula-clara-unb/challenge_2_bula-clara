import { Camera } from '@phosphor-icons/react';
import { CaptureConfirm } from '../CaptureConfirm';

export interface OcrConfirmProps {
  isOpen: boolean;
  onOpenChange?: (aberta: boolean) => void;
  /**
   * O que o /ler-caixa leu ("Losartana potássica 50 mg"). `null` quando nenhum remédio foi
   * reconhecido: aí a folha oferece outra foto ou a digitação.
   */
  medicamento: string | null;
  /** "Sim, perguntar sobre ele": só agora a pergunta vai para a API. */
  onConfirmar: () => void;
  /** "Não, vou digitar o nome" ou "Digitar o nome": leva ao campo de pergunta. */
  onDigitar: () => void;
  /** "Tirar outra foto", quando nada foi lido. */
  onTentarDeNovo: () => void;
}

/** "Li: Losartana potássica 50 mg. É esse o remédio?" Confirma a leitura da caixa (risco R3). */
export function OcrConfirm({ isOpen, onOpenChange, medicamento, onConfirmar, onDigitar, onTentarDeNovo }: OcrConfirmProps) {
  if (medicamento === null || medicamento.trim() === '') {
    return (
      <CaptureConfirm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        rotulo="Foto da caixa"
        titulo="Não consegui ler o nome na foto"
        pergunta="Tente com mais luz, ou digite o nome que está na caixa."
        rotuloConfirmar="Tirar outra foto"
        iconeConfirmar={Camera}
        rotuloCorrigir="Digitar o nome"
        onConfirmar={onTentarDeNovo}
        onCorrigir={onDigitar}
      />
    );
  }
  return (
    <CaptureConfirm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      rotulo="Li na caixa"
      titulo={medicamento}
      pergunta="É esse o remédio?"
      rotuloConfirmar="Sim, perguntar sobre ele"
      rotuloCorrigir="Não, vou digitar o nome"
      nota="A foto é usada só para ler o nome e não é guardada."
      onConfirmar={onConfirmar}
      onCorrigir={onDigitar}
    />
  );
}
