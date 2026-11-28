import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { SearchField } from './SearchField';

const meta = {
  title: 'Componentes/Primitivos/SearchField',
  component: SearchField,
  args: { rotulo: 'Buscar na bula', onSubmit: fn() },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  name: 'Vazio (sem botão de limpar)',
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument();
  },
};

export const ComTexto: Story = {
  args: { defaultValue: 'tontura' },
  play: async ({ canvas, args }) => {
    const limpar = canvas.getByRole('button', { name: 'Limpar busca' });
    await expect(limpar.getBoundingClientRect().width).toBeGreaterThanOrEqual(48);
    await userEvent.type(canvas.getByRole('searchbox'), '{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('tontura');
  },
};
