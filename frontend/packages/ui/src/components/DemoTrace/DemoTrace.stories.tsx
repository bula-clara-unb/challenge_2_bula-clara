import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { DemoTrace } from './DemoTrace';
import { traceDeExemplo } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/DemoTrace',
  component: DemoTrace,
  args: traceDeExemplo,
} satisfies Meta<typeof DemoTrace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recolhido: Story = {};

export const Aberto: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Modo demonstração: o que os agentes fizeram' }));
    await expect(canvas.getByRole('table')).toBeVisible();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
