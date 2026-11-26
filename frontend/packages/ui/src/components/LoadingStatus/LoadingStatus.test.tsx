import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingStatus } from './LoadingStatus';

describe('LoadingStatus', () => {
  it('a região aria-live existe antes do texto, e só troca o conteúdo', () => {
    const { container, rerender } = render(<LoadingStatus />);
    const regiao = container.querySelector('[aria-live="polite"]');
    expect(regiao).toBeEmptyDOMElement();
    rerender(<LoadingStatus>Identificando os remédios…</LoadingStatus>);
    expect(container.querySelector('[aria-live="polite"]')).toBe(regiao);
    rerender(<LoadingStatus>Lendo a bula da losartana…</LoadingStatus>);
    expect(regiao).toHaveTextContent('Lendo a bula da losartana…');
    expect(screen.getByRole('progressbar', { name: 'Lendo a bula da losartana…' })).toBeInTheDocument();
  });

  it('com movimento reduzido, o círculo para', () => {
    const { container } = render(<LoadingStatus>Checando interações…</LoadingStatus>);
    expect(container.querySelector('.animate-spin')).toHaveClass('motion-reduce:animate-none');
  });
});
