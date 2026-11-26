import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Radio, RadioGroup } from './RadioGroup';

const meta = {
  title: 'Componentes/Primitivos/RadioGroup',
  component: RadioGroup,
  args: {
    rotulo: 'Para quem é o remédio?',
    children: (
      <>
        <Radio value="eu">Para mim</Radio>
        <Radio value="outra">Para outra pessoa</Radio>
      </>
    ),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Para outra pessoa' })).toBeChecked();
  },
};

export const ComErro: Story = { args: { isInvalid: true, mensagemErro: 'Escolha uma opção para continuar.' } };
