import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { DialogTrigger } from '../Dialog';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('abre como diálogo com rótulo e título', async () => {
    render(
      <DialogTrigger>
        <Button>Fotografar a caixa</Button>
        <Sheet rotulo="Li na caixa" titulo="Losartana potássica 50 mg">
          <p>É esse o remédio?</p>
        </Sheet>
      </DialogTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fotografar a caixa' }));
    expect(screen.getByRole('dialog', { name: 'Losartana potássica 50 mg' })).toBeInTheDocument();
    expect(screen.getByText('Li na caixa')).toBeInTheDocument();
  });

  it('funciona controlada e fecha pelas ações', async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet isOpen onOpenChange={onOpenChange} titulo="Losartana potássica 50 mg">
        {({ fechar }) => <Button onPress={fechar}>Não, vou digitar o nome</Button>}
      </Sheet>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou digitar o nome' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('fecha com Esc', async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet isOpen onOpenChange={onOpenChange} titulo="Losartana potássica 50 mg">
        <Button>Sim, perguntar sobre ele</Button>
      </Sheet>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('não compila sem título', () => {
    // @ts-expect-error titulo é obrigatório: é o nome acessível da folha
    const elemento = <Sheet isOpen>conteúdo</Sheet>;
    expect(elemento).toBeTruthy();
  });
});
