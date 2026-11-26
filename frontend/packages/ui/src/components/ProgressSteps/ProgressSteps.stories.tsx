import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressSteps } from './ProgressSteps';

const meta = {
  title: 'Componentes/Primitivos/ProgressSteps',
  component: ProgressSteps,
  args: { rotulo: 'Perguntar por foto', passos: ['Foto', 'Confirmar', 'Resposta'], atual: 1 },
} satisfies Meta<typeof ProgressSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoMeio: Story = { name: 'No meio do caminho' };

export const Comeco: Story = { name: 'Começo', args: { atual: 0 } };
