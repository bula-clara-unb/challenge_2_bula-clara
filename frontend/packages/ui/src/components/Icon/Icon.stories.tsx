import { Info, Prohibit, Warning } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon } from './Icon';

const meta = {
  title: 'Componentes/Primitivos/Icon',
  component: Icon,
  args: { icone: Info, rotulo: 'Informação' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComRotulo: Story = {
  name: 'Com rótulo',
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Informação' })).toBeInTheDocument();
  },
};

export const DecorativoAoLadoDoTexto: Story = {
  name: 'Decorativo, ao lado do texto',
  render: () => (
    <p className="flex items-center gap-2 text-corpo text-caution-text">
      <Icon icone={Warning} decorativo />A bula pede cuidado com essa combinação
    </p>
  ),
};

export const Tamanhos: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-danger-text">
      <Icon icone={Prohibit} rotulo="Não usar junto (pequeno)" tamanho="pequeno" />
      <Icon icone={Prohibit} rotulo="Não usar junto (médio)" tamanho="medio" />
      <Icon icone={Prohibit} rotulo="Não usar junto (grande)" tamanho="grande" />
    </div>
  ),
};
