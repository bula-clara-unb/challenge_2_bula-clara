import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { AnswerHeadline } from './AnswerHeadline';

const frase = 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.';

describe('AnswerHeadline', () => {
  it('mostra a pergunta, os remédios considerados e a frase-resposta como título', () => {
    render(
      <AnswerHeadline pergunta="Posso tomar ibuprofeno com losartana?" consideradosTambem={['Metformina', 'Enalapril']}>
        {frase}
      </AnswerHeadline>,
    );
    expect(screen.getByText('Sua pergunta')).toBeInTheDocument();
    expect(screen.getByText('“Posso tomar ibuprofeno com losartana?”')).toBeInTheDocument();
    expect(screen.getByText('Considerando também: metformina e enalapril')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: frase })).toHaveAttribute('tabindex', '-1');
  });

  it('sem remédios da lista, não fala em "considerando"', () => {
    render(<AnswerHeadline pergunta="Para que serve a losartana?">A losartana serve para tratar a pressão alta.</AnswerHeadline>);
    expect(screen.queryByText(/Considerando/)).not.toBeInTheDocument();
  });

  it('recebe o foco quando a resposta chega e expõe o título por ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <AnswerHeadline pergunta="Posso tomar ibuprofeno com losartana?" focarAoMontar ref={ref} nivel={1}>
        {frase}
      </AnswerHeadline>,
    );
    const titulo = screen.getByRole('heading', { level: 1, name: frase });
    expect(titulo).toHaveFocus();
    expect(ref.current).toBe(titulo);
  });

  it('não é região aria-live (quem anuncia é o LoadingStatus)', () => {
    const { container } = render(<AnswerHeadline pergunta="Posso tomar ibuprofeno com losartana?">{frase}</AnswerHeadline>);
    expect(container.querySelector('[aria-live]')).toBeNull();
  });
});
