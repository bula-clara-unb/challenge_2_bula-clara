import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { InputDock } from './InputDock';

const meta = {
  title: 'Componentes/Domínio/InputDock',
  component: InputDock,
  parameters: { layout: 'fullscreen' },
  args: {
    destinoAtual: 'perguntar',
    enderecos: { perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' },
    onPerguntar: fn(),
    onAbrirCamera: fn(),
    onGravar: fn(),
  },
} satisfies Meta<typeof InputDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
  },
};

export const ComTexto: Story = {
  name: 'Com texto digitado',
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'Sua pergunta' }), 'Para que serve a losartana?');
    await userEvent.keyboard('{Enter}');
    await expect(args.onPerguntar).toHaveBeenCalledWith('Para que serve a losartana?');
  },
};

export const SoNavegacao: Story = {
  name: 'Só a navegação, em Meus remédios',
  args: { mostrarCaixa: false, destinoAtual: 'remedios' },
};

export const TextoGrande: Story = {
  name: 'Texto em 140%',
  globals: { escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
