import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { TranscriptConfirm } from './TranscriptConfirm';

const meta = {
  title: 'Componentes/Domínio/TranscriptConfirm',
  component: TranscriptConfirm,
  args: {
    isOpen: true,
    transcricao: 'Posso tomar ibuprofeno com losartana?',
    onConfirmar: fn(),
    onEscrever: fn(),
    onGravarDeNovo: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof TranscriptConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Entendeu: Story = {
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('dialog', { name: '“Posso tomar ibuprofeno com losartana?”' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};

export const NaoEntendeu: Story = {
  name: 'Não entendeu',
  args: { transcricao: '' },
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('button', { name: 'Gravar de novo' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};
