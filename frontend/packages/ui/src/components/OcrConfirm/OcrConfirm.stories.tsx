import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { OcrConfirm } from './OcrConfirm';

const meta = {
  title: 'Componentes/Domínio/OcrConfirm',
  component: OcrConfirm,
  args: {
    isOpen: true,
    medicamento: 'Losartana potássica 50 mg',
    onConfirmar: fn(),
    onDigitar: fn(),
    onTentarDeNovo: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof OcrConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Leu: Story = {
  name: 'Leu o nome',
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('dialog', { name: 'Losartana potássica 50 mg' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};

export const NaoLeu: Story = {
  name: 'Não conseguiu ler',
  args: { medicamento: null },
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('button', { name: 'Tirar outra foto' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};
