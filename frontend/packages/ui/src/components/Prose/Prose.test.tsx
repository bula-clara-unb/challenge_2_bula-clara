import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Prose } from './Prose';

describe('Prose', () => {
  it('limita a linha pelo token de 65 caracteres', () => {
    render(
      <Prose>
        <p>Tome com água.</p>
      </Prose>,
    );
    expect(screen.getByText('Tome com água.').parentElement).toHaveClass('max-w-medida');
  });

  it('mantém a estrutura do conteúdo', () => {
    render(
      <Prose>
        <ul>
          <li>Tontura</li>
          <li>Dor de cabeça</li>
        </ul>
      </Prose>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
