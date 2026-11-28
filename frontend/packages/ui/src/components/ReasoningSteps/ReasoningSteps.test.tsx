import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { passosDeExemplo } from './exemplos';
import { ReasoningSteps } from './ReasoningSteps';

describe('ReasoningSteps', () => {
  it('começa recolhido e abre pelo botão', async () => {
    render(<ReasoningSteps passos={passosDeExemplo} />);
    const botao = screen.getByRole('button', { name: 'Como chegamos nesta resposta' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(passosDeExemplo);
  });

  it('lista numerada mesmo com o reset do Tailwind', () => {
    render(<ReasoningSteps passos={passosDeExemplo} />);
    expect(screen.getByRole('list', { hidden: true })).toHaveClass('list-decimal');
  });

  it('sem passos, não aparece', () => {
    const { container } = render(<ReasoningSteps passos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
