import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ProvenanceSeal } from './ProvenanceSeal';

const meta = {
  title: 'Componentes/Domínio/ProvenanceSeal',
  component: ProvenanceSeal,
} satisfies Meta<typeof ProvenanceSeal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComData: Story = {
  name: 'Com data',
  args: { bulas: [{ remedio: 'Losartana', versao: '03/2025' }] },
};

export const SemData: Story = {
  name: 'Sem data',
  args: { bulas: [{ remedio: 'Hidroclorotiazida', versao: null }] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data da versão não informada/)).toBeInTheDocument();
  },
};

export const DuasBulas: Story = {
  name: 'Duas bulas',
  args: {
    bulas: [
      { remedio: 'Losartana', versao: '03/2025' },
      { remedio: 'Ibuprofeno', versao: '11/2024' },
    ],
  },
};

export const NaFicha: Story = {
  name: 'Na ficha do remédio',
  args: { bulas: [{ versao: '03/2025' }] },
};
