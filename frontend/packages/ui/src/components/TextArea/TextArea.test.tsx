import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('é uma caixa de texto de várias linhas com rótulo', () => {
    render(<TextArea rotulo="Sua pergunta" />);
    const campo = screen.getByRole('textbox', { name: 'Sua pergunta' });
    expect(campo.tagName).toBe('TEXTAREA');
    expect(campo).toHaveAttribute('rows', '4');
  });

  it('aceita quebra de linha', async () => {
    render(<TextArea rotulo="Sua pergunta" />);
    await userEvent.type(screen.getByLabelText('Sua pergunta'), 'Posso tomar{Enter}com café?');
    expect(screen.getByLabelText('Sua pergunta')).toHaveValue('Posso tomar\ncom café?');
  });

  it('anuncia o erro por aria-live', () => {
    const { container } = render(<TextArea rotulo="Sua pergunta" isInvalid mensagemErro="Escreva sua pergunta." />);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Escreva sua pergunta.');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <TextArea />;
    expect(elemento).toBeTruthy();
  });
});
