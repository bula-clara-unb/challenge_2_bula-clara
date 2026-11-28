import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { TextField } from './TextField';

const meta = {
  title: 'Componentes/Primitivos/TextField',
  component: TextField,
  args: { rotulo: 'Nome do remédio', descricao: 'Como está escrito na caixa.' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  play: async ({ canvas }) => {
    const campo = canvas.getByLabelText('Nome do remédio');
    await expect(campo.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

export const ComErro: Story = {
  args: {
    defaultValue: 'lozartana xyz',
    descricao: undefined,
    isInvalid: true,
    mensagemErro: 'Não achei esse remédio. Confira o nome na caixa.',
  },
  play: async ({ canvas }) => {
    const campo = canvas.getByLabelText('Nome do remédio');
    await expect(getComputedStyle(campo).borderTopWidth).toBe('3px');
  },
};

export const ValidacaoAoDigitar: Story = {
  name: 'Validação ao apagar o texto',
  args: {
    isRequired: true,
    validationBehavior: 'aria',
    validate: (valor: string) => (valor.trim() ? null : 'Escreva o nome do remédio para continuar.'),
  },
  play: async ({ canvas }) => {
    const campo = canvas.getByLabelText('Nome do remédio');
    await userEvent.type(campo, 'a');
    await userEvent.clear(campo);
    await expect(await canvas.findByText('Escreva o nome do remédio para continuar.')).toBeVisible();
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Desabilitado: Story = { args: { isDisabled: true, defaultValue: 'Losartana' } };
