import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Accordion, Disclosure } from './Disclosure';

const meta = {
  title: 'Componentes/Primitivos/Disclosure',
  component: Disclosure,
  args: {
    titulo: 'Como chegamos nesta resposta',
    children: (
      <ol className="list-decimal ps-6">
        <li>Identificamos: losartana e ibuprofeno.</li>
        <li>Lemos a seção 4 das duas bulas.</li>
        <li>Checamos se uma bula fala da outra.</li>
        <li>Conferimos as regras de segurança.</li>
      </ol>
    ),
  },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fechado: Story = {
  play: async ({ canvas }) => {
    const botao = canvas.getByRole('button', { name: 'Como chegamos nesta resposta' });
    await expect(botao.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await userEvent.click(botao);
    await expect(canvas.getByText('Lemos a seção 4 das duas bulas.')).toBeVisible();
  },
};

export const Aberto: Story = { args: { defaultExpanded: true } };

export const FichaDoRemedio: Story = {
  name: 'Acordeão da ficha do remédio',
  render: () => (
    <Accordion defaultExpandedKeys={['s4']}>
      <Disclosure id="s1" titulo="1. Para que serve?">
        Texto da seção 1, em linguagem simples.
      </Disclosure>
      <Disclosure id="s3" titulo="3. Quando não devo usar?">
        Texto da seção 3.
      </Disclosure>
      <Disclosure id="s4" titulo="4. O que devo saber antes de usar?">
        Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito da losartana.
      </Disclosure>
    </Accordion>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};
