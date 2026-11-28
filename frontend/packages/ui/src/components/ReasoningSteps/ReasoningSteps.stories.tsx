import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { passosDeExemplo } from './exemplos';
import { ReasoningSteps } from './ReasoningSteps';

const meta = {
  title: 'Componentes/Domínio/ReasoningSteps',
  component: ReasoningSteps,
  args: { passos: passosDeExemplo },
} satisfies Meta<typeof ReasoningSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recolhido: Story = {};

export const Aberto: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Como chegamos nesta resposta' }));
    const lista = canvas.getByRole('list');
    await expect(getComputedStyle(lista).listStyleType).toBe('decimal');
  },
};
