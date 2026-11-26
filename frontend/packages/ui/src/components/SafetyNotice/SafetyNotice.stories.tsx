import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SafetyNotice } from './SafetyNotice';
import { alteracaoDeDose, grupoEspecial } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/SafetyNotice',
  component: SafetyNotice,
} satisfies Meta<typeof SafetyNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MudancaDeDose: Story = {
  name: 'Mudança de dose',
  args: { ...alteracaoDeDose, acao: { rotulo: 'Fazer outra pergunta', onPress: fn() } },
};

export const GrupoEspecial: Story = {
  name: 'Grupo especial',
  args: grupoEspecial,
  play: async ({ canvas }) => {
    // Neutro: o mesmo fundo do aviso informativo.
    await expect(getComputedStyle(canvas.getByRole('note')).backgroundColor).toBe('rgb(241, 244, 249)');
  },
};

export const ComFoco: Story = {
  name: 'Recebe o foco ao aparecer',
  args: { ...alteracaoDeDose, focarAoMontar: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: alteracaoDeDose.titulo })).toHaveFocus();
  },
};

export const AltoContraste: Story = {
  name: 'Mudança de dose no alto contraste',
  args: MudancaDeDose.args,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('note')).borderTopColor).toBe('rgb(0, 0, 0)');
  },
};
