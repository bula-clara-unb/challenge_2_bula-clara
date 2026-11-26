import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('é uma barra de progresso sem valor, com o texto visível como nome', () => {
    render(<Spinner rotulo="Lendo a bula da losartana…" />);
    const barra = screen.getByRole('progressbar', { name: 'Lendo a bula da losartana…' });
    expect(barra).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByText('Lendo a bula da losartana…')).toBeVisible();
  });

  it('pode esconder o texto sem perder o nome', () => {
    render(<Spinner rotulo="Carregando" mostrarRotulo={false} />);
    expect(screen.getByRole('progressbar', { name: 'Carregando' })).toBeInTheDocument();
    expect(screen.queryByText('Carregando')).not.toBeInTheDocument();
  });

  it('para de girar com movimento reduzido', () => {
    const { container } = render(<Spinner rotulo="Carregando" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('animate-spin', 'motion-reduce:animate-none');
  });
});
