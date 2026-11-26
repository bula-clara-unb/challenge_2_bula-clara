import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';
import { Dialog, DialogTrigger } from './Dialog';

function Exemplo({ papel }: { papel?: 'dialog' | 'alertdialog' }) {
  return (
    <DialogTrigger>
      <Button>Apagar tudo</Button>
      <Dialog titulo="Apagar a lista?" papel={papel}>
        {({ fechar }) => (
          <>
            <p>Os remédios saem deste aparelho.</p>
            <Button onPress={fechar}>Sim, apagar a lista</Button>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

describe('Dialog', () => {
  it('abre pelo botão, com o título como nome', async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(screen.getByRole('dialog', { name: 'Apagar a lista?' })).toBeInTheDocument();
  });

  it('fecha com Esc e devolve o foco para quem abriu', async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apagar tudo' })).toHaveFocus());
  });

  it('fecha pelo X e pelas ações do conteúdo', async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sim, apagar a lista' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('como alertdialog, não tem X', async () => {
    render(<Exemplo papel="alertdialog" />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(screen.getByRole('alertdialog', { name: 'Apagar a lista?' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
  });

  it('não compila sem título', () => {
    // @ts-expect-error titulo é obrigatório: é o nome acessível do diálogo
    const elemento = <Dialog>conteúdo</Dialog>;
    expect(elemento).toBeTruthy();
  });
});
