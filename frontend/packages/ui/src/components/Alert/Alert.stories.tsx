import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Alert } from './Alert';

const meta = {
  title: 'Componentes/Primitivos/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Perigo: Story = {
  args: {
    tom: 'perigo',
    titulo: 'A bula diz para não usar junto',
    children: 'Fale com o médico antes. Não pare nenhum remédio por conta própria.',
  },
};

export const Cuidado: Story = {
  args: {
    tom: 'cuidado',
    titulo: 'A bula pede cuidado com essa combinação',
    children: 'Converse com o farmacêutico antes de tomar os dois juntos.',
  },
  play: async ({ canvas }) => {
    const aviso = canvas.getByRole('note');
    await expect(getComputedStyle(aviso).borderInlineStartWidth).toBe('6px');
  },
};

export const Info: Story = {
  args: {
    tom: 'info',
    titulo: 'A bula não fala dessa combinação',
    children: 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.',
  },
};

export const AltoContraste: Story = {
  name: 'Perigo no alto contraste',
  args: Perigo.args,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    const aviso = canvas.getByRole('note');
    const estilo = getComputedStyle(aviso);
    await expect(estilo.borderTopWidth).toBe('2px');
    await expect(estilo.borderInlineStartWidth).toBe('10px');
    await expect(estilo.borderTopColor).toBe('rgb(0, 0, 0)');
  },
};
