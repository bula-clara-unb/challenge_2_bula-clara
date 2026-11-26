import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('é uma busca com rótulo', () => {
    render(<SearchField rotulo="Buscar na bula" />);
    expect(screen.getByRole('searchbox', { name: 'Buscar na bula' })).toBeInTheDocument();
  });

  it('envia com Enter', async () => {
    const onSubmit = vi.fn();
    render(<SearchField rotulo="Buscar na bula" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('searchbox'), 'tontura{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('tontura');
  });

  it('limpa pelo botão com nome', async () => {
    const onClear = vi.fn();
    render(<SearchField rotulo="Buscar na bula" defaultValue="tontura" onClear={onClear} />);
    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <SearchField />;
    expect(elemento).toBeTruthy();
  });
});
