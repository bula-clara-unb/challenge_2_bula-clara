import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmergencyBar } from './EmergencyBar';

describe('EmergencyBar', () => {
  it('liga para o 192 sem precisar de nenhuma prop', () => {
    render(<EmergencyBar />);
    const faixa = screen.getByRole('link', { name: 'Emergência? Ligue 192' });
    expect(faixa).toHaveAttribute('href', 'tel:192');
    expect(faixa).toHaveClass('min-h-12');
  });

  it('pode levar para a página de contatos, com o mesmo texto', () => {
    render(<EmergencyBar href="/emergencia" />);
    expect(screen.getByRole('link', { name: 'Emergência? Ligue 192' })).toHaveAttribute('href', '/emergencia');
  });

  it('o texto é fixo', () => {
    // @ts-expect-error a faixa não recebe texto: é sempre "Emergência? Ligue 192"
    const elemento = <EmergencyBar>Ligue já</EmergencyBar>;
    expect(elemento).toBeTruthy();
  });
});
