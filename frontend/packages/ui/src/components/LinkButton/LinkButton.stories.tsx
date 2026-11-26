import { BookOpen } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { LinkButton } from './LinkButton';

const meta = {
  title: 'Componentes/Primitivos/LinkButton',
  component: LinkButton,
  args: { href: '#bula', children: 'Ver a bula inteira', icone: BookOpen },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {
  name: 'Primário',
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Ver a bula inteira' });
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await expect(getComputedStyle(link).textDecorationLine).toBe('none');
  },
};

export const Secundario: Story = { name: 'Secundário', args: { variante: 'secundaria' } };

export const Discreto: Story = {
  args: { variante: 'discreta', icone: undefined, href: '#sobre', children: 'Saber mais sobre o Bula Clara' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Saber mais sobre o Bula Clara' });
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
};
