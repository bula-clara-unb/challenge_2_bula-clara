import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Componentes/Primitivos/Spinner',
  component: Spinner,
  args: { rotulo: 'Lendo a bula da losartana…' },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComTexto: Story = {};

export const SoOCirculo: Story = { name: 'Só o círculo', args: { rotulo: 'Carregando', mostrarRotulo: false } };
