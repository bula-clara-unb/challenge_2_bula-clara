import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AnswerHeadline } from './AnswerHeadline';

const meta = {
  title: 'Componentes/Domínio/AnswerHeadline',
  component: AnswerHeadline,
  args: {
    pergunta: 'Posso tomar ibuprofeno com losartana?',
    consideradosTambem: ['Metformina'],
    children: 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.',
  },
} satisfies Meta<typeof AnswerHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

export const RecebeOFoco: Story = {
  name: 'Recebe o foco quando a resposta chega',
  args: { focarAoMontar: true },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('heading', { name: args.children })).toHaveFocus();
  },
};

export const NomeComprido: Story = {
  name: 'Nome comprido com texto em 140%',
  args: {
    pergunta: 'Posso tomar ibuprofeno com hidroclorotiazida?',
    consideradosTambem: [],
    children: 'A bula da hidroclorotiazida pede cuidado com anti-inflamatórios, como o ibuprofeno.',
  },
  globals: { escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
