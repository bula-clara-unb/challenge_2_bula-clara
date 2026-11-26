import { ArrowClockwise, Camera } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Alert } from '../../components/Alert';
import { AnswerHeadline } from '../../components/AnswerHeadline';
import { Button } from '../../components/Button';
import { CameraCapture } from '../../components/CameraCapture';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { EmergencyBar } from '../../components/EmergencyBar';
import { Text } from '../../components/Text';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { simularCamera, simularMicrofone } from '../../test/stubs';

interface TelaDeErroProps {
  erro: 'api-fora-do-ar' | 'fora-do-formato' | 'fora-da-base' | 'sem-conexao' | 'camera-negada' | 'microfone-negado';
  onTentarDeNovo: () => void;
  onDigitar: () => void;
  onAbrirCamera: () => void;
}

/** Os erros da resposta. A faixa de emergência fica na tela em todos. */
function TelaDeErro({ erro, onTentarDeNovo, onDigitar, onAbrirCamera }: TelaDeErroProps) {
  const conteudo = {
    'api-fora-do-ar': (
      <>
        <Alert tom="info" anunciar="polite" nivelTitulo={2} titulo="Não consegui falar com o Bula Clara agora">
          Tente de novo em alguns minutos. Se a dúvida não pode esperar, fale com o farmacêutico.
        </Alert>
        <div>
          <Button variante="secundaria" icone={ArrowClockwise} onPress={onTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      </>
    ),
    'fora-do-formato': (
      <>
        {/* Resposta fora do formato: nenhum aviso de segurança pela metade, só esta mensagem. */}
        <Alert tom="info" anunciar="polite" nivelTitulo={2} titulo="Não consegui montar a resposta com segurança">
          O farmacêutico pode te ajudar.
        </Alert>
        <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
      </>
    ),
    'fora-da-base': (
      <>
        {/* Título e explicação vêm do backend. */}
        <AnswerHeadline pergunta="Posso tomar nimesulida com dipirona?" focarAoMontar>
          Não consegui identificar o remédio.
        </AnswerHeadline>
        <Text>
          Escreva o nome como aparece na caixa, por exemplo &quot;losartana&quot;. Ou fotografe a caixa. Na dúvida, pergunte ao
          farmacêutico.
        </Text>
        <div>
          <Button variante="secundaria" icone={Camera} onPress={onAbrirCamera}>
            Fotografar a caixa
          </Button>
        </div>
        <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
      </>
    ),
    'sem-conexao': (
      <>
        <Alert tom="info" anunciar="polite" nivelTitulo={2} titulo="Sem conexão: preciso da internet para ler a bula." />
        <div>
          <Button variante="secundaria" icone={ArrowClockwise} onPress={onTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      </>
    ),
    'camera-negada': <CameraCapture onFoto={() => undefined} onFechar={onDigitar} onDigitar={onDigitar} />,
    'microfone-negado': <VoiceRecorder onGravacao={() => undefined} onFechar={onDigitar} onEscrever={onDigitar} />,
  }[erro];
  return (
    <div className="flex flex-col gap-4">
      <EmergencyBar />
      <div className="flex max-w-medida flex-col gap-4 px-4">{conteudo}</div>
    </div>
  );
}

const meta = {
  title: 'Padrões/Erros',
  component: TelaDeErro,
  parameters: { layout: 'fullscreen' },
  args: { erro: 'api-fora-do-ar', onTentarDeNovo: fn(), onDigitar: fn(), onAbrirCamera: fn() },
} satisfies Meta<typeof TelaDeErro>;

export default meta;
type Story = StoryObj<typeof meta>;

const faixaNaTela = async (canvas: { getByRole: (papel: string, opcoes: { name: string }) => HTMLElement }) =>
  expect(canvas.getByRole('link', { name: 'Emergência? Ligue 192' })).toBeInTheDocument();

export const ApiForaDoAr: Story = {
  name: 'API fora do ar',
  play: async ({ canvas, args }) => {
    await faixaNaTela(canvas);
    await expect(canvas.getByRole('status')).toHaveTextContent('Não consegui falar com o Bula Clara agora');
    await userEvent.click(canvas.getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.onTentarDeNovo).toHaveBeenCalledOnce();
  },
};

export const ForaDoFormato: Story = {
  name: 'Resposta fora do formato',
  args: { erro: 'fora-do-formato' },
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(canvas.getByRole('status')).toHaveTextContent('O farmacêutico pode te ajudar.');
  },
};

export const ForaDaBase: Story = {
  name: 'Remédio fora da base',
  args: { erro: 'fora-da-base' },
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(canvas.getByRole('heading', { name: 'Não consegui identificar o remédio.' })).toHaveFocus();
  },
};

export const SemConexao: Story = {
  name: 'Sem conexão',
  args: { erro: 'sem-conexao' },
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(canvas.getByRole('status')).toHaveTextContent('Sem conexão: preciso da internet para ler a bula.');
  },
};

export const CameraNegada: Story = {
  name: 'Câmera negada',
  args: { erro: 'camera-negada' },
  beforeEach: () => simularCamera('negar').desfazer,
  play: async ({ canvas, args }) => {
    await faixaNaTela(canvas);
    await expect(await canvas.findByText('A câmera está bloqueada para o Bula Clara')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Digitar o nome' }));
    await expect(args.onDigitar).toHaveBeenCalledOnce();
  },
};

export const MicrofoneNegado: Story = {
  name: 'Microfone negado',
  args: { erro: 'microfone-negado' },
  beforeEach: () => simularMicrofone('negar').desfazer,
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(await canvas.findByText('O microfone está bloqueado para o Bula Clara')).toBeVisible();
  },
};
