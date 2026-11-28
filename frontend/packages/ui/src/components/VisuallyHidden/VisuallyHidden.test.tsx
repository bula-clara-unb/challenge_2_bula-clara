import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('mantém o texto acessível', () => {
    render(
      <button type="button">
        <VisuallyHidden>Abrir a seção 4 da bula</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Abrir a seção 4 da bula' })).toBeInTheDocument();
  });

  it('usa a classe sr-only do Tailwind', () => {
    render(<VisuallyHidden>só para leitor de tela</VisuallyHidden>);
    expect(screen.getByText('só para leitor de tela')).toHaveClass('sr-only');
  });
});
