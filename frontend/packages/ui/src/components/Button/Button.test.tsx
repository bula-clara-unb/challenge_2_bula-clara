import { Trash } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('aparece como botão com o texto da ação', () => {
    render(<Button>Apagar tudo</Button>);
    expect(screen.getByRole('button', { name: 'Apagar tudo' })).toBeInTheDocument();
  });

  it('chama onPress no clique', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Ouvir resposta</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('chama onPress pelo teclado (Enter e espaço)', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Perguntar</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Perguntar' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('não chama onPress quando desabilitado', async () => {
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Perguntar
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('garante a área de toque mínima de 48px pela classe min-h-12', () => {
    render(<Button>Perguntar</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-12', 'min-w-12');
  });

  it('mostra o ícone sem mudar o nome acessível', () => {
    render(
      <Button variante="perigo" icone={Trash}>
        Apagar tudo
      </Button>,
    );
    const botao = screen.getByRole('button', { name: 'Apagar tudo' });
    expect(botao.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
