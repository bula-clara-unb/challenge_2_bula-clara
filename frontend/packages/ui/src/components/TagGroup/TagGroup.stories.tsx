import { BookOpen } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { Tag, TagGroup } from './TagGroup';

const meta = {
  title: 'Componentes/Primitivos/TagGroup',
  component: TagGroup,
  args: { rotulo: 'Na bula', children: null },
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chips: Story = {
  render: (args) => (
    <TagGroup {...args}>
      <Tag id="l4" icone={BookOpen}>
        Losartana · seção 4
      </Tag>
      <Tag id="i4" icone={BookOpen}>
        Ibuprofeno · seção 4
      </Tag>
    </TagGroup>
  ),
  play: async ({ canvas }) => {
    for (const chip of canvas.getAllByRole('row')) {
      await expect(chip.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
  },
};

function ListaRemovivel() {
  const [remedios, setRemedios] = useState([
    { id: 'losartana', nome: 'Losartana' },
    { id: 'metformina', nome: 'Metformina' },
  ]);
  return (
    <TagGroup
      rotulo="Seus remédios"
      items={remedios}
      textoVazio="Nenhum remédio na lista."
      onRemove={(chaves) => setRemedios((lista) => lista.filter((r) => !chaves.has(r.id)))}
    >
      {(remedio) => <Tag id={remedio.id}>{remedio.nome}</Tag>}
    </TagGroup>
  );
}

export const Removivel: Story = {
  name: 'Com remover',
  render: () => <ListaRemovivel />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remover Losartana' }));
    await expect(canvas.queryByText('Losartana')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Remover Metformina' }).getBoundingClientRect().width).toBe(48);
  },
};
