import { Camera, Check, SpeakerHigh, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Componentes/Primitivos/Button',
  component: Button,
  args: { children: 'Perguntar', onPress: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primaria: Story = { args: { icone: SpeakerHigh, children: 'Ouvir resposta' } };

export const Secundaria: Story = {
  args: { variante: 'secundaria', icone: Camera, children: 'Fotografar a caixa' },
};

export const Discreta: Story = { args: { variante: 'discreta', children: 'Digitar o nome' } };

export const Perigo: Story = { args: { variante: 'perigo', icone: Trash, children: 'Apagar tudo' } };

export const Desabilitado: Story = { args: { isDisabled: true } };

export const LarguraTotal: Story = {
  args: { larguraTotal: true, icone: Check, children: 'Sim, perguntar sobre ele' },
};

export const FocoPeloTeclado: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Perguntar' })).toHaveFocus();
  },
};
