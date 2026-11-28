import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EmergencyCard } from './EmergencyCard';
import { autolesao, intoxicacao } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/EmergencyCard',
  component: EmergencyCard,
} satisfies Meta<typeof EmergencyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Intoxicacao: Story = {
  name: 'Intoxicação',
  args: intoxicacao,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(56);
    }
  },
};

export const Autolesao: Story = {
  name: 'Autolesão',
  args: autolesao,
  play: async ({ canvas }) => {
    const [primeiro] = canvas.getAllByRole('link');
    await expect(primeiro).toHaveAttribute('href', 'tel:188');
    await expect(canvas.queryByText('Enquanto espera')).toBeNull();
  },
};

export const AltoContraste: Story = {
  name: 'Intoxicação no alto contraste',
  args: intoxicacao,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    const estilo = getComputedStyle(canvas.getByRole('alert'));
    await expect(estilo.borderTopWidth).toBe('3px');
    await expect(estilo.backgroundColor).toBe('rgb(122, 14, 6)');
  },
};

export const TextoGrande: Story = {
  name: 'Autolesão com texto em 140%',
  args: autolesao,
  globals: { escala: '140' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(56);
    }
  },
};
