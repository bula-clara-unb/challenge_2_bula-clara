import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('usa o nível pedido', () => {
    render(<Heading nivel={2}>Como tomar</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Como tomar' })).toBeInTheDocument();
  });

  it('separa nível de aparência', () => {
    render(
      <Heading nivel={2} estilo="resposta">
        Pode tomar com comida.
      </Heading>,
    );
    const titulo = screen.getByRole('heading', { level: 2 });
    expect(titulo).toHaveClass('font-voz', 'text-resposta');
  });

  it('quebra palavra longa em vez de vazar', () => {
    render(<Heading nivel={1}>Hidroclorotiazida</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('hyphens-auto', 'wrap-anywhere');
  });

  it('aceita ref e tabIndex para receber o foco quando a resposta chega', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading nivel={2} ref={ref} tabIndex={-1}>
        Losartana
      </Heading>,
    );
    ref.current?.focus();
    expect(screen.getByRole('heading', { name: 'Losartana' })).toHaveFocus();
  });
});
