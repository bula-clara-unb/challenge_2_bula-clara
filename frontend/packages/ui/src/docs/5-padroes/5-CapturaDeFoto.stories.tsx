import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CameraCapture } from '../../components/CameraCapture';
import { InputDock } from '../../components/InputDock';
import { LoadingStatus } from '../../components/LoadingStatus';
import { OcrConfirm } from '../../components/OcrConfirm';
import { simularCamera } from '../../test/stubs';

type Etapa = 'perguntar' | 'camera' | 'confirmar' | 'perguntando';

interface FluxoDaFotoProps {
  /** Faz o papel do POST /ler-caixa (issue #24). Aqui responde na hora, sem rede. */
  lerCaixa: (foto: Blob) => Promise<string | null>;
  onPerguntar: (pergunta: string) => void;
}

/** Foto da caixa, leitura e confirmação. A pergunta só sai depois do "sim". */
function FluxoDaFoto({ lerCaixa, onPerguntar }: FluxoDaFotoProps) {
  const [etapa, setEtapa] = useState<Etapa>('perguntar');
  const [lido, setLido] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      {etapa === 'camera' || etapa === 'confirmar' ? (
        <CameraCapture
          onFechar={() => setEtapa('perguntar')}
          onDigitar={() => setEtapa('perguntar')}
          onFoto={async (foto) => {
            setLido(await lerCaixa(foto));
            setEtapa('confirmar');
          }}
        />
      ) : null}
      {etapa === 'perguntando' ? <LoadingStatus>Lendo a bula da losartana…</LoadingStatus> : <LoadingStatus />}
      <OcrConfirm
        isOpen={etapa === 'confirmar'}
        onOpenChange={(aberta) => {
          if (!aberta && etapa === 'confirmar') setEtapa('camera');
        }}
        medicamento={lido}
        onConfirmar={() => {
          onPerguntar('Para que serve a losartana?');
          setEtapa('perguntando');
        }}
        onDigitar={() => setEtapa('perguntar')}
        onTentarDeNovo={() => setEtapa('camera')}
      />
      {etapa === 'perguntar' || etapa === 'perguntando' ? (
        <InputDock
          destinoAtual="perguntar"
          enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
          onPerguntar={onPerguntar}
          onAbrirCamera={() => setEtapa('camera')}
          onGravar={() => undefined}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: 'Padrões/Captura de foto',
  component: FluxoDaFoto,
  args: { lerCaixa: async (): Promise<string | null> => 'Losartana potássica 50 mg', onPerguntar: fn() },
} satisfies Meta<typeof FluxoDaFoto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmarAntesDePerguntar: Story = {
  name: 'Confirmar antes de perguntar',
  beforeEach: () => simularCamera('permitir').desfazer,
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    const tirar = await canvas.findByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: 'Losartana potássica 50 mg' });
    await waitFor(() => expect(folha).toBeVisible());
    await expect(args.onPerguntar).not.toHaveBeenCalled();
    await userEvent.click(pagina.getByRole('button', { name: 'Sim, perguntar sobre ele' }));
    await expect(args.onPerguntar).toHaveBeenCalledWith('Para que serve a losartana?');
    await expect(await canvas.findByText('Lendo a bula da losartana…')).toBeInTheDocument();
  },
};

export const NaoLeu: Story = {
  name: 'Não conseguiu ler',
  args: { lerCaixa: async () => null },
  beforeEach: () => simularCamera('permitir').desfazer,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    const tirar = await canvas.findByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: 'Não consegui ler o nome na foto' });
    await userEvent.click(within(folha).getByRole('button', { name: 'Digitar o nome' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument());
  },
};

export const CameraNegada: Story = {
  name: 'Câmera negada',
  beforeEach: () => simularCamera('negar').desfazer,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    await expect(await canvas.findByText('A câmera está bloqueada para o Bula Clara')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Digitar o nome' }));
    await expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument();
  },
};
