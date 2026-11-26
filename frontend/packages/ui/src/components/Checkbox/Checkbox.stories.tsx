import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Componentes/Primitivos/Checkbox',
  component: Checkbox,
  args: { children: 'Tomo esse remédio todo dia' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desmarcado: Story = {};

export const Marcado: Story = { args: { defaultSelected: true } };

export const Indeterminado: Story = { args: { isIndeterminate: true, children: 'Todos os remédios da lista' } };

export const PeloTeclado: Story = {
  name: 'Marca pelo teclado',
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: 'Tomo esse remédio todo dia' })).toBeChecked();
  },
};
