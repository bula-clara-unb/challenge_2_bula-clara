import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('é um parágrafo de corpo por padrão', () => {
    render(<Text>Tome um comprimido por dia.</Text>);
    const texto = screen.getByText('Tome um comprimido por dia.');
    expect(texto.tagName).toBe('P');
    expect(texto).toHaveClass('text-corpo', 'text-text-default');
  });

  it('tem a variante de apoio', () => {
    render(
      <Text variante="apoio" elemento="span">
        Bula oficial ANVISA
      </Text>,
    );
    const texto = screen.getByText('Bula oficial ANVISA');
    expect(texto.tagName).toBe('SPAN');
    expect(texto).toHaveClass('text-apoio', 'text-text-muted');
  });

  it('tem o rótulo de bloco em caixa alta', () => {
    render(<Text variante="rotulo">Sua pergunta</Text>);
    expect(screen.getByText('Sua pergunta')).toHaveClass('text-rotulo', 'uppercase', 'tracking-rotulo');
  });
});
