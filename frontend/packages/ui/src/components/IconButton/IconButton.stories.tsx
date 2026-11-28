import { Camera, Microphone, X } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { IconButton } from './IconButton';

const meta = {
  title: 'Componentes/Primitivos/IconButton',
  component: IconButton,
  args: { onPress: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Microfone: Story = { args: { 'aria-label': 'Perguntar falando', icone: Microphone } };

export const CameraNaCaixaDePergunta: Story = {
  name: 'Câmera na caixa de pergunta',
  args: { 'aria-label': 'Fotografar a caixa', icone: Camera, variante: 'primaria' },
};

export const Fechar: Story = { args: { 'aria-label': 'Fechar', icone: X, variante: 'discreta' } };
