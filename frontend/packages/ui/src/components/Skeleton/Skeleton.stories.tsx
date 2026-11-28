import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Componentes/Primitivos/Skeleton',
  component: Skeleton,
  render: (args) => (
    <div aria-busy="true" className="flex flex-col gap-4">
      <Skeleton {...args} />
    </div>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Texto: Story = {};

export const Bloco: Story = { args: { forma: 'bloco' } };
