import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureConfirm } from './CaptureConfirm';

const meta = {
  title: 'Componentes/Domínio/CaptureConfirm',
  component: CaptureConfirm,
  args: {
    isOpen: true,
    rotulo: 'Li na caixa',
    titulo: 'Losartana potássica 50 mg',
    pergunta: 'É esse o remédio?',
    rotuloConfirmar: 'Sim, perguntar sobre ele',
    rotuloCorrigir: 'Não, vou digitar o nome',
    nota: 'A foto é usada só para ler o nome e não é guardada.',
    onConfirmar: fn(),
    onCorrigir: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof CaptureConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  play: async ({ canvasElement, args }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    await userEvent.click(await pagina.findByRole('button', { name: 'Sim, perguntar sobre ele' }));
    await expect(args.onConfirmar).toHaveBeenCalledOnce();
  },
};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
