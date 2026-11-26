import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'Componentes/Primitivos/Text',
  component: Text,
  args: { children: 'Tome um comprimido de 50 mg uma vez por dia, sempre no mesmo horário.' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Corpo: Story = {};

export const Apoio: Story = {
  args: { variante: 'apoio', children: 'Bula oficial ANVISA · Losartana, versão de 03/2025' },
};

export const Rotulo: Story = {
  name: 'Rótulo de bloco',
  args: { variante: 'rotulo', children: 'Sua pergunta' },
};
