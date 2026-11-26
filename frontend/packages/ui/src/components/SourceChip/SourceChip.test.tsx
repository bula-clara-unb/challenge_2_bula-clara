import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sugestoesDePerguntarMais } from './perguntarMais';
import { SECOES_DA_BULA } from './secoes';
import { SourceChip, SuggestionChip } from './SourceChip';

describe('SourceChip', () => {
  it('liga a citação à seção da bula e abre a ficha pelo botão', async () => {
    const onPress = vi.fn();
    render(<SourceChip numero={1} remedio="Losartana" secao={4} onPress={onPress} />);
    const chip = screen.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' });
    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('é botão, nunca link: o nome do remédio não vai para a URL', () => {
    render(<SourceChip remedio="Varfarina" secao={3} onPress={() => undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('href');
    // @ts-expect-error o chip não aceita href
    const elemento = <SourceChip remedio="Varfarina" secao={3} onPress={() => undefined} href="/remedio/varfarina" />;
    expect(elemento).toBeTruthy();
  });

  it('a sugestão tem o mesmo visual e faz a pergunta', async () => {
    const onPress = vi.fn();
    render(<SuggestionChip onPress={onPress}>Como tomar a losartana?</SuggestionChip>);
    const chip = screen.getByRole('button', { name: 'Como tomar a losartana?' });
    expect(chip).toHaveClass('bg-chip-fundo', 'min-h-12');
    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
  });
});

describe('sugestoesDePerguntarMais', () => {
  it('usa os modelos fixos, com o artigo certo', () => {
    expect(
      sugestoesDePerguntarMais({
        remedio: { nome: 'Losartana', artigo: 'a' },
        outros: ['Paracetamol'],
        pergunta: 'Posso tomar ibuprofeno com losartana?',
      }),
    ).toEqual(['Como tomar a losartana?', 'Para que serve a losartana?', 'E com paracetamol?']);
  });

  it('sem artigo conhecido, sai sem artigo (nunca com o artigo errado)', () => {
    expect(sugestoesDePerguntarMais({ remedio: { nome: 'Omeprazol' } })).toEqual([
      'Como tomar omeprazol?',
      'Para que serve omeprazol?',
    ]);
  });

  it('não repete o assunto da pergunta nem o remédio que já estava nela', () => {
    expect(
      sugestoesDePerguntarMais({
        remedio: { nome: 'Losartana', artigo: 'a' },
        outros: ['Metformina', 'Ibuprofeno'],
        pergunta: 'Como tomar os comprimidos de losartana com ibuprofeno?',
      }),
    ).toEqual(['Para que serve a losartana?', 'E com metformina?']);
  });

  it('nenhuma sugestão fala de dose, troca ou suspensão', () => {
    const todas = sugestoesDePerguntarMais({ remedio: { nome: 'Losartana', artigo: 'a' }, outros: ['Metformina'] });
    for (const sugestao of todas) expect(sugestao).not.toMatch(/dose|parar|trocar|suspender|dobrar/i);
  });

  it('as 9 seções da bula, na ordem', () => {
    expect(SECOES_DA_BULA.map((secao) => secao.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(SECOES_DA_BULA[3]?.pergunta).toBe('O que devo saber antes de usar?');
  });
});
