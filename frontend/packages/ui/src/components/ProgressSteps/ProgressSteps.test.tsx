import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressSteps } from './ProgressSteps';

const passos = ['Foto', 'Confirmar', 'Resposta'];

describe('ProgressSteps', () => {
  it('é uma lista ordenada com nome e o passo atual marcado', () => {
    render(<ProgressSteps rotulo="Perguntar por foto" passos={passos} atual={1} />);
    expect(screen.getByRole('list', { name: 'Perguntar por foto' })).toBeInTheDocument();
    const itens = screen.getAllByRole('listitem');
    expect(itens[1]).toHaveAttribute('aria-current', 'step');
    expect(itens[0]).toHaveTextContent('Foto (feito)');
  });

  it('diz em texto em que passo a pessoa está', () => {
    render(<ProgressSteps rotulo="Perguntar por foto" passos={passos} atual={1} />);
    expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument();
  });

  it('não sai da faixa de passos', () => {
    render(<ProgressSteps rotulo="Perguntar por foto" passos={passos} atual={9} />);
    expect(screen.getByText('Passo 3 de 3')).toBeInTheDocument();
  });
});
