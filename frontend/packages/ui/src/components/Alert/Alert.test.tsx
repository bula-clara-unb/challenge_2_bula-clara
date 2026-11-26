import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('tem título como heading e texto', () => {
    render(
      <Alert tom="cuidado" titulo="A bula pede cuidado com essa combinação">
        Converse com o farmacêutico antes de tomar os dois juntos.
      </Alert>,
    );
    expect(screen.getByRole('note')).toHaveTextContent('Converse com o farmacêutico');
    expect(screen.getByRole('heading', { level: 3, name: 'A bula pede cuidado com essa combinação' })).toBeInTheDocument();
  });

  it('só interrompe o leitor de tela quando pedido', () => {
    const { rerender } = render(<Alert tom="info" titulo="Sem conexão" anunciar="polite" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sem conexão');
    rerender(<Alert tom="perigo" titulo="Não consegui montar a resposta com segurança" anunciar="assertive" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('marca o tom com ícone e cor, nunca só cor', () => {
    const { container } = render(<Alert tom="perigo" titulo="A bula diz para não usar junto" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('note')).toHaveClass('bg-danger-bg', 'text-danger-text');
  });

  it('não tem tom verde', () => {
    // @ts-expect-error verde só confirma ação (Toast); nunca indica que algo é seguro
    const elemento = <Alert tom="sucesso" titulo="Pode tomar tranquilo" />;
    expect(elemento).toBeTruthy();
  });
});
