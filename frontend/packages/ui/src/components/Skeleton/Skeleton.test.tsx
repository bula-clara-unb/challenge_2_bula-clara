import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('fica escondido do leitor de tela', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('desenha as linhas pedidas, a última mais curta', () => {
    const { container } = render(<Skeleton linhas={4} />);
    const linhas = container.querySelectorAll('span');
    expect(linhas).toHaveLength(4);
    expect(linhas[3]).toHaveClass('w-2/3');
  });

  it('para de pulsar com movimento reduzido', () => {
    const { container } = render(<Skeleton forma="bloco" />);
    expect(container.firstChild).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
  });
});
