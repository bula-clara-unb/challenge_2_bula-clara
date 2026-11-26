import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InteractionCallout } from './InteractionCallout';

const meta = {
  title: 'Componentes/Domínio/InteractionCallout',
  component: InteractionCallout,
} satisfies Meta<typeof InteractionCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NaoUsarJunto: Story = {
  name: 'Não usar junto',
  args: {
    remedios: ['Varfarina', 'Ácido acetilsalicílico'],
    secao: 'contraindicacao',
    evidencia: {
      frase:
        'Não use este medicamento junto com ácido acetilsalicílico sem orientação médica, pelo risco aumentado de sangramento.',
      remedio: 'Varfarina',
    },
  },
};

export const PedeCuidado: Story = {
  name: 'Pede cuidado',
  args: {
    remedios: ['Losartana', 'Ibuprofeno'],
    secao: 'precaucoes_interacoes',
    evidencia: {
      frase: 'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana.',
      remedio: 'Losartana',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('note')).toHaveTextContent('Losartana, seção 4');
  },
};

export const NaoFala: Story = {
  name: 'Não fala',
  args: { remedios: ['Ibuprofeno', 'Metformina'], secao: null },
  play: async ({ canvas }) => {
    const aviso = canvas.getByRole('note');
    await expect(aviso).toHaveTextContent('Isso não garante que seja seguro.');
    // Fundo neutro: nem verde, nem branco liso.
    await expect(getComputedStyle(aviso).backgroundColor).toBe('rgb(241, 244, 249)');
  },
};

export const AltoContraste: Story = {
  name: 'Não usar junto no alto contraste',
  args: NaoUsarJunto.args,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    const estilo = getComputedStyle(canvas.getByRole('note'));
    await expect(estilo.borderTopWidth).toBe('2px');
    await expect(estilo.borderInlineStartWidth).toBe('10px');
  },
};

export const TextoGrande: Story = {
  name: 'Texto em 140%',
  args: PedeCuidado.args,
  globals: { escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
