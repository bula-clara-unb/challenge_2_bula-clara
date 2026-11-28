import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Prose } from './Prose';

const meta = {
  title: 'Componentes/Primitivos/Prose',
  component: Prose,
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explicacao: Story = {
  name: 'Explicação com lista e link',
  args: {
    children: (
      <>
        <p>
          A losartana ajuda a controlar a pressão alta. Ela costuma ser tomada uma vez por dia, com ou sem comida
          [1].
        </p>
        <p>O que pode fazer mal, segundo a bula:</p>
        <ul>
          <li>tontura, principalmente ao levantar rápido;</li>
          <li>
            cansaço nos primeiros dias de uso <strong>(passa com o tempo)</strong>.
          </li>
        </ul>
        <p>
          Se tiver dúvida, <a href="#farmaceutico">fale com o farmacêutico</a>.
        </p>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await document.fonts.ready;
    const prose = canvas.getByText(/A losartana ajuda/).parentElement as HTMLElement;
    const zero = document.createElement('span');
    zero.textContent = '0';
    prose.appendChild(zero);
    const larguraDoZero = zero.getBoundingClientRect().width;
    zero.remove();
    // 65ch = 65 vezes a largura do "0" na fonte do texto.
    await expect(prose.getBoundingClientRect().width).toBeLessThanOrEqual(larguraDoZero * 65 + 1);
    await expect(prose.getBoundingClientRect().width).toBeGreaterThan(larguraDoZero * 60);
  },
};
