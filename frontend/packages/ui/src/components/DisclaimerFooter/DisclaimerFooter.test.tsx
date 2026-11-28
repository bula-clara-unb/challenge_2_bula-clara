import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DisclaimerFooter } from './DisclaimerFooter';
import { avisoLegal } from './exemplos';

describe('DisclaimerFooter', () => {
  it('mostra o aviso legal como veio, em texto de apoio', () => {
    render(<DisclaimerFooter>{avisoLegal}</DisclaimerFooter>);
    expect(screen.getByText(avisoLegal)).toHaveClass('text-apoio', 'text-text-muted');
  });

  it('não reescreve o texto do backend, nem para tirar o emoji (isso é da #23)', () => {
    const doBackendHoje = '⚠️ Projeto acadêmico. Não substitui orientação médica.';
    render(<DisclaimerFooter>{doBackendHoje}</DisclaimerFooter>);
    expect(screen.getByText(doBackendHoje)).toBeInTheDocument();
  });
});
