import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('liga o rótulo visível ao campo', () => {
    render(<TextField rotulo="Nome do remédio" />);
    expect(screen.getByLabelText('Nome do remédio')).toBeInTheDocument();
    expect(screen.getByText('Nome do remédio')).toBeVisible();
  });

  it('liga a descrição ao campo', () => {
    render(<TextField rotulo="Nome do remédio" descricao="Como está escrito na caixa." />);
    expect(screen.getByRole('textbox', { name: 'Nome do remédio' })).toHaveAccessibleDescription(
      'Como está escrito na caixa.',
    );
  });

  it('chama onChange ao digitar', async () => {
    const onChange = vi.fn();
    render(<TextField rotulo="Nome do remédio" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Nome do remédio'), 'losartana');
    expect(onChange).toHaveBeenLastCalledWith('losartana');
  });

  it('mostra o erro dentro de uma região aria-live que já existia antes', () => {
    const { container, rerender } = render(<TextField rotulo="Nome do remédio" mensagemErro="Escreva o nome." />);
    const regiao = container.querySelector('[aria-live="polite"]');
    expect(regiao).toBeEmptyDOMElement();

    rerender(<TextField rotulo="Nome do remédio" mensagemErro="Escreva o nome." isInvalid />);
    expect(container.querySelector('[aria-live="polite"]')).toBe(regiao);
    expect(regiao).toHaveTextContent('Escreva o nome.');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Escreva o nome.');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <TextField />;
    expect(elemento).toBeTruthy();
  });

  it('mostra o exemplo sem tirar o rótulo', () => {
    render(<TextField rotulo="Adicionar remédio" exemplo="ex.: metformina" />);
    expect(screen.getByRole('textbox', { name: 'Adicionar remédio' })).toHaveAttribute('placeholder', 'ex.: metformina');
  });

  it('não aceita placeholder solto', () => {
    // @ts-expect-error o exemplo entra por `exemplo`, que convive com o rótulo obrigatório
    const elemento = <TextField rotulo="Nome do remédio" placeholder="ex.: losartana" />;
    expect(elemento).toBeTruthy();
  });
});
