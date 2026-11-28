import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { InputDock } from '../../components/InputDock';
import { LoadingStatus } from '../../components/LoadingStatus';
import { TranscriptConfirm } from '../../components/TranscriptConfirm';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { simularMicrofone } from '../../test/stubs';

type Etapa = 'perguntar' | 'gravando' | 'confirmar' | 'perguntando';

interface FluxoDaVozProps {
  /** Faz o papel do POST /transcrever (Whisper no nosso servidor, issue #24). Aqui, sem rede. */
  transcrever: (audio: Blob) => Promise<string>;
  onPerguntar: (pergunta: string) => void;
}

/** Gravação, transcrição no servidor e confirmação. A pergunta só sai depois do "sim". */
function FluxoDaVoz({ transcrever, onPerguntar }: FluxoDaVozProps) {
  const [etapa, setEtapa] = useState<Etapa>('perguntar');
  const [texto, setTexto] = useState('');
  return (
    <div className="flex flex-col gap-4">
      {etapa === 'gravando' || etapa === 'confirmar' ? (
        <VoiceRecorder
          onFechar={() => setEtapa('perguntar')}
          onEscrever={() => setEtapa('perguntar')}
          onGravacao={async (audio) => {
            setTexto(await transcrever(audio));
            setEtapa('confirmar');
          }}
        />
      ) : null}
      {etapa === 'perguntando' ? <LoadingStatus>Identificando os remédios…</LoadingStatus> : <LoadingStatus />}
      <TranscriptConfirm
        isOpen={etapa === 'confirmar'}
        onOpenChange={(aberta) => {
          if (!aberta && etapa === 'confirmar') setEtapa('perguntar');
        }}
        transcricao={texto}
        onConfirmar={() => {
          onPerguntar(texto);
          setEtapa('perguntando');
        }}
        onEscrever={() => setEtapa('perguntar')}
        onGravarDeNovo={() => setEtapa('gravando')}
      />
      {etapa === 'perguntar' || etapa === 'perguntando' ? (
        <InputDock
          destinoAtual="perguntar"
          enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
          onPerguntar={onPerguntar}
          onAbrirCamera={() => undefined}
          onGravar={() => setEtapa('gravando')}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: 'Padrões/Captura de voz',
  component: FluxoDaVoz,
  args: { transcrever: async () => 'Posso tomar ibuprofeno com losartana?', onPerguntar: fn() },
} satisfies Meta<typeof FluxoDaVoz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmarAntesDePerguntar: Story = {
  name: 'Confirmar antes de perguntar',
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Perguntar falando' }));
    await expect(await canvas.findByText('Ouvindo… fale sua pergunta')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Parar de gravar' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: '“Posso tomar ibuprofeno com losartana?”' });
    await waitFor(() => expect(folha).toBeVisible());
    await expect(args.onPerguntar).not.toHaveBeenCalled();
    await userEvent.click(pagina.getByRole('button', { name: 'Sim, perguntar' }));
    await expect(args.onPerguntar).toHaveBeenCalledWith('Posso tomar ibuprofeno com losartana?');
  },
};

export const Corrigir: Story = {
  name: 'Corrigir escrevendo',
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Perguntar falando' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Parar de gravar' }));
    const pagina = within(canvasElement.ownerDocument.body);
    await userEvent.click(await pagina.findByRole('button', { name: 'Não, vou escrever' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument());
    await expect(args.onPerguntar).not.toHaveBeenCalled();
  },
};

export const MicrofoneNegado: Story = {
  name: 'Microfone negado',
  beforeEach: () => simularMicrofone('negar').desfazer,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Perguntar falando' }));
    await expect(await canvas.findByText('O microfone está bloqueado para o Bula Clara')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Escrever a pergunta' }));
    await expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument();
  },
};
