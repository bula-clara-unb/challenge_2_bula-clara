import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmergencyCard, formatarTelefone } from './EmergencyCard';
import { autolesao, intoxicacao } from './exemplos';

const hrefs = () => screen.getAllByRole('link').map((link) => link.getAttribute('href'));

afterEach(() => vi.restoreAllMocks());

describe('EmergencyCard', () => {
  it('autolesão: CVV 188 primeiro e nada de "enquanto espera"', () => {
    render(<EmergencyCard {...autolesao} />);
    expect(screen.getByRole('alert')).toHaveAccessibleName('Ligue agora para o CVV');
    expect(hrefs()).toEqual(['tel:188', 'tel:192']);
    expect(screen.getAllByRole('link')[0]).toHaveAccessibleName('Ligar CVV 188 · grátis, 24h');
    expect(screen.queryByText('Enquanto espera')).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('vômito');
  });

  it('intoxicação: SAMU, Disque-Intoxicação com o número agrupado e o "enquanto espera"', () => {
    render(<EmergencyCard {...intoxicacao} />);
    expect(hrefs()).toEqual(['tel:192', 'tel:08007226001']);
    expect(screen.getByRole('link', { name: 'Ligar Disque-Intoxicação 0800 722 6001 · grátis, 24h' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Enquanto espera');
    expect(screen.getByRole('note')).toHaveTextContent('Não provoque vômito sem orientação.');
  });

  it('mantém a ordem recebida, mesmo que pareça "fora de ordem"', () => {
    render(<EmergencyCard {...autolesao} contatos={[...autolesao.contatos].reverse()} />);
    expect(hrefs()).toEqual(['tel:192', 'tel:188']);
  });

  it('o cartão só tem o texto que veio por props', () => {
    render(<EmergencyCard {...intoxicacao} />);
    const cartao = screen.getByRole('alert');
    const contatos = within(cartao)
      .getAllByRole('link')
      .map((link) => link.textContent)
      .join('');
    expect(cartao.textContent).toBe(
      intoxicacao.titulo + intoxicacao.mensagem + 'Ligar SAMU 192' + 'Ligar Disque-Intoxicação 0800 722 6001 · grátis, 24h',
    );
    expect(contatos).toBe('Ligar SAMU 192Ligar Disque-Intoxicação 0800 722 6001 · grátis, 24h');
  });

  it('botões de ligar com 56px ou mais (classe min-h-14)', () => {
    render(<EmergencyCard {...intoxicacao} />);
    for (const link of screen.getAllByRole('link')) expect(link).toHaveClass('min-h-14');
  });

  it('reclama no console se houver dois cartões na tela', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <>
        <EmergencyCard {...intoxicacao} />
        <EmergencyCard {...autolesao} />
      </>,
    );
    expect(erro).toHaveBeenCalledWith(expect.stringContaining('mais de um cartão de emergência'));
  });

  it('formata o 0800 e deixa os números curtos como estão', () => {
    expect(formatarTelefone('08007226001')).toBe('0800 722 6001');
    expect(formatarTelefone('0800-722-6001')).toBe('0800 722 6001');
    expect(formatarTelefone('188')).toBe('188');
  });
});
