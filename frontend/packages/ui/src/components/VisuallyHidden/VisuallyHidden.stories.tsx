import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { VisuallyHidden } from './VisuallyHidden';

const meta = {
  title: 'Componentes/Primitivos/VisuallyHidden',
  component: VisuallyHidden,
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DentroDeUmLink: Story = {
  args: { children: ' (abre a ficha do remédio)' },
  render: (args) => (
    <a href="#ficha">
      Na bula: seção 4<VisuallyHidden {...args} />
    </a>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Na bula: seção 4 (abre a ficha do remédio)' }),
    ).toBeInTheDocument();
  },
};
