import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Componentes/Primitivos/Switch',
  component: Switch,
  args: {
    children: 'Lembrar neste aparelho',
    descricao: (ligado: boolean) =>
      ligado
        ? 'Ligado: a lista fica salva só neste navegador. Desligar apaga na hora.'
        : 'Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor.',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desligado: Story = {
  play: async ({ canvas }) => {
    const interruptor = canvas.getByRole('switch', { name: 'Lembrar neste aparelho' });
    await expect(interruptor).not.toBeChecked();
    await userEvent.click(canvas.getByText('Lembrar neste aparelho'));
    await expect(interruptor).toBeChecked();
    await expect(canvas.getByText(/^Ligado/)).toBeVisible();
  },
};

export const Ligado: Story = { args: { defaultSelected: true } };
