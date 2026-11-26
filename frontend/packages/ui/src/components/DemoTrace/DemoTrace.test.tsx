import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DemoTrace, formatarDuracao } from './DemoTrace';
import { traceDeExemplo } from './exemplos';

describe('DemoTrace', () => {
  it('só aparece quando há dados', () => {
    const { container } = render(<DemoTrace etapas={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra agentes, tempos, categoria de risco e trechos', async () => {
    render(<DemoTrace {...traceDeExemplo} ocr="LOSARTANA POTÁSSICA 50mg" />);
    await userEvent.click(screen.getByRole('button', { name: 'Modo demonstração: o que os agentes fizeram' }));
    const tabela = screen.getByRole('table', { name: /Etapas, em 9,2 s no total/ });
    expect(tabela).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'AgenteInteracoes' })).toBeInTheDocument();
    expect(screen.getByText('categoria_risco:')).toBeInTheDocument();
    expect(screen.getByText('LOSARTANA POTÁSSICA 50mg')).toBeInTheDocument();
    expect(screen.getByText(/precaucoes_interacoes · 0,21/)).toBeInTheDocument();
  });

  it('formata o tempo em ms ou s', () => {
    expect(formatarDuracao(48)).toBe('48 ms');
    expect(formatarDuracao(8420)).toBe('8,4 s');
  });
});
