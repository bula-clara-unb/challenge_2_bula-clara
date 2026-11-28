import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Heading } from './Heading';

const meta = {
  title: 'Componentes/Primitivos/Heading',
  component: Heading,
  args: { nivel: 1, children: 'Losartana' },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Titulo1: Story = { name: 'Título 1' };

export const FraseResposta: Story = {
  name: 'Frase-resposta',
  args: { nivel: 2, estilo: 'resposta', children: 'A losartana pode ser tomada com ou sem comida.' },
};

export const Titulo2: Story = { name: 'Título 2', args: { nivel: 2, children: 'Como tomar' } };

export const Titulo3: Story = { name: 'Título 3', args: { nivel: 3, children: 'Se esquecer uma dose' } };

/** Reflow (WCAG 1.4.10): nome longo, texto a 140% e tela de 320px. Não pode vazar. */
export const NomeLongoEm320px: Story = {
  name: 'Nome longo em 320px a 140%',
  args: { children: 'Hidroclorotiazida' },
  globals: { escala: '140' },
  render: (args) => (
    <div style={{ width: 320 }} data-testid="tela">
      <Heading {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const titulo = canvas.getByRole('heading', { level: 1 });
    const estilo = getComputedStyle(titulo);
    await expect(estilo.overflowWrap).toBe('anywhere');
    await expect(estilo.hyphens).toBe('auto');
    await expect(estilo.fontWeight).toBe('600');
    await expect(titulo.scrollWidth).toBeLessThanOrEqual(titulo.clientWidth);
    await expect(canvas.getByTestId('tela').scrollWidth).toBeLessThanOrEqual(320);
  },
};
