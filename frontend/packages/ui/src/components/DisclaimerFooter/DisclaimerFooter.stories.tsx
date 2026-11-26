import type { Meta, StoryObj } from '@storybook/react-vite';
import { DisclaimerFooter } from './DisclaimerFooter';
import { avisoLegal } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/DisclaimerFooter',
  component: DisclaimerFooter,
  args: { children: avisoLegal },
} satisfies Meta<typeof DisclaimerFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
