import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { SkipLink } from './SkipLink';

const meta = {
  title: 'Componentes/Primitivos/SkipLink',
  component: SkipLink,
  render: (args) => (
    <>
      <SkipLink {...args} />
      <main id="conteudo">
        <p>Conteúdo principal da página.</p>
      </main>
    </>
  ),
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AparecePeloTeclado: Story = {
  name: 'Aparece com o Tab',
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};
