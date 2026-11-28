import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatarVersao, ProvenanceSeal } from './ProvenanceSeal';

describe('ProvenanceSeal', () => {
  it('mostra a bula e a versão', () => {
    render(<ProvenanceSeal bulas={[{ remedio: 'Losartana', versao: '03/2025' }]} />);
    expect(screen.getByText('Bula oficial ANVISA · Losartana, versão de 03/2025')).toBeInTheDocument();
  });

  it('sem data, diz que a data não foi informada e não inventa nenhuma', () => {
    const { container } = render(<ProvenanceSeal bulas={[{ remedio: 'Hidroclorotiazida', versao: null }]} />);
    expect(screen.getByText('Bula oficial ANVISA · Hidroclorotiazida · data da versão não informada')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\d{2}\/\d{4}/);
  });

  it('texto vazio conta como sem data', () => {
    render(<ProvenanceSeal bulas={[{ remedio: 'Dipirona', versao: '  ' }]} />);
    expect(screen.getByText(/Dipirona · data da versão não informada/)).toBeInTheDocument();
  });

  it('junta duas bulas na ordem recebida', () => {
    render(
      <ProvenanceSeal
        bulas={[
          { remedio: 'Losartana', versao: '03/2025' },
          { remedio: 'Ibuprofeno', versao: '11/2024' },
        ]}
      />,
    );
    expect(
      screen.getByText('Bula oficial ANVISA · Losartana, versão de 03/2025 · Ibuprofeno, versão de 11/2024'),
    ).toBeInTheDocument();
  });

  it('na ficha, sem o nome do remédio', () => {
    render(<ProvenanceSeal bulas={[{ versao: '03/2025' }]} />);
    expect(screen.getByText('Bula oficial ANVISA · versão de 03/2025')).toBeInTheDocument();
  });

  it('data ISO vira mês e ano sem mudar o mês por causa do fuso', () => {
    // Em Brasília, new Date('2025-03-01') cai em 28/02. O fuso é fixado aqui para o teste valer no CI (UTC).
    const fuso = process.env.TZ;
    process.env.TZ = 'America/Sao_Paulo';
    try {
      expect(formatarVersao('2025-03-01')).toBe('03/2025');
      expect(formatarVersao('2025-03')).toBe('03/2025');
      expect(formatarVersao('03/2025')).toBe('03/2025');
    } finally {
      if (fuso === undefined) delete process.env.TZ;
      else process.env.TZ = fuso;
    }
  });

  it('ícone decorativo', () => {
    const { container } = render(<ProvenanceSeal bulas={[{ remedio: 'Losartana', versao: '03/2025' }]} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
