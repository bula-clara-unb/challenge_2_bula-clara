import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComboBox } from './ComboBox';

const remedios = [
  { id: 'losartana', rotulo: 'Losartana' },
  { id: 'dipirona', rotulo: 'Dipirona Sódica' },
  { id: 'hidroclorotiazida', rotulo: 'Hidroclorotiazida' },
];

describe('ComboBox', () => {
  it('é uma combobox com rótulo', () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} />);
    expect(screen.getByRole('combobox', { name: 'Adicionar remédio' })).toBeInTheDocument();
  });

  it('filtra sem ligar para maiúsculas e acentos', async () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} />);
    await userEvent.type(screen.getByRole('combobox'), 'sodica');
    const opcoes = await screen.findAllByRole('option');
    expect(opcoes.map((o) => o.textContent)).toEqual(['Dipirona Sódica']);
  });

  it('aceita erro de digitação', async () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} />);
    await userEvent.type(screen.getByRole('combobox'), 'lozartana');
    const opcoes = await screen.findAllByRole('option');
    expect(opcoes.map((o) => o.textContent)).toEqual(['Losartana']);
  });

  it('escolhe pelo teclado', async () => {
    const onSelectionChange = vi.fn();
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} onSelectionChange={onSelectionChange} />);
    await userEvent.type(screen.getByRole('combobox'), 'losar');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('losartana');
    expect(screen.getByRole('combobox')).toHaveValue('Losartana');
  });

  it('avisa quando nada combina', async () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} textoSemResultado="Esse remédio não está na base." />);
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    expect(await screen.findByText('Esse remédio não está na base.')).toBeInTheDocument();
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <ComboBox opcoes={remedios} />;
    expect(elemento).toBeTruthy();
  });
});
