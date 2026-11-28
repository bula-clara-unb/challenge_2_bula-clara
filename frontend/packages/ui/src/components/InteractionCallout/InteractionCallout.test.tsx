import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InteractionCallout, nivelDaInteracao, TEXTOS_DA_INTERACAO } from './InteractionCallout';

const NAO_GARANTE = 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.';

describe('InteractionCallout', () => {
  it('frase em "Quando não usar" vira perigo, com a frase da bula e a seção 3', () => {
    render(
      <InteractionCallout
        remedios={['Varfarina', 'Ácido acetilsalicílico']}
        secao="contraindicacao"
        evidencia={{ frase: 'Não use este medicamento junto com ácido acetilsalicílico.', remedio: 'Varfarina' }}
      />,
    );
    const aviso = screen.getByRole('note');
    expect(
      screen.getByRole('heading', { name: 'Varfarina e ácido acetilsalicílico: a bula diz para não usar junto' }),
    ).toBeInTheDocument();
    expect(aviso).toHaveClass('bg-danger-bg');
    expect(aviso).toHaveTextContent('“Não use este medicamento junto com ácido acetilsalicílico.”');
    expect(aviso).toHaveTextContent('Varfarina, seção 3');
  });

  it('frase em "O que devo saber antes" vira cuidado, com a seção 4', () => {
    render(
      <InteractionCallout
        remedios={['Losartana', 'Ibuprofeno']}
        secao="precaucoes_interacoes"
        evidencia={{ frase: 'Anti-inflamatórios podem reduzir o efeito.', remedio: 'Losartana' }}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Losartana e ibuprofeno: a bula pede cuidado com essa combinação' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveClass('bg-caution-bg');
    expect(screen.getByRole('note')).toHaveTextContent('Losartana, seção 4');
  });

  it('"não fala" é neutro, nunca verde, e sempre diz que isso não garante segurança', () => {
    render(<InteractionCallout remedios={['Ibuprofeno', 'Metformina']} secao={null} />);
    const aviso = screen.getByRole('note');
    expect(
      screen.getByRole('heading', { name: 'Ibuprofeno e metformina: a bula não fala dessa combinação' }),
    ).toBeInTheDocument();
    expect(aviso).toHaveTextContent(NAO_GARANTE);
    expect(aviso).toHaveClass('bg-surface-info');
    expect(aviso.className).not.toMatch(/confirm|toast/);
    expect(aviso.querySelector('blockquote')).toBeNull();
  });

  it('o nível sai só da seção', () => {
    expect(nivelDaInteracao('contraindicacao')).toBe('nao-usar');
    expect(nivelDaInteracao('precaucoes_interacoes')).toBe('cuidado');
    expect(nivelDaInteracao(null)).toBe('nao-fala');
    expect(TEXTOS_DA_INTERACAO['nao-fala'].acao).toBe(NAO_GARANTE);
  });

  it('não aceita tom, seção desconhecida nem seção sem a frase da bula', () => {
    const elementos = [
      // @ts-expect-error o tom nunca é escolhido por quem usa: sai da seção, e não existe verde
      <InteractionCallout key="1" remedios={['Losartana', 'Ibuprofeno']} secao={null} tom="sucesso" />,
      // @ts-expect-error só as duas seções do agente de interações valem
      <InteractionCallout key="2" remedios={['Losartana', 'Ibuprofeno']} secao="indicacao" />,
      // @ts-expect-error com seção, a frase da bula é obrigatória
      <InteractionCallout key="3" remedios={['Losartana', 'Ibuprofeno']} secao="contraindicacao" />,
    ];
    expect(elementos).toHaveLength(3);
  });
});
