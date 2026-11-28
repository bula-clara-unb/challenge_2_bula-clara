import { Microphone } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('usa o aria-label como nome acessível', () => {
    render(<IconButton aria-label="Perguntar falando" icone={Microphone} />);
    expect(screen.getByRole('button', { name: 'Perguntar falando' })).toBeInTheDocument();
  });

  it('esconde o ícone do leitor de tela', () => {
    render(<IconButton aria-label="Perguntar falando" icone={Microphone} />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('chama onPress no clique', async () => {
    const onPress = vi.fn();
    render(<IconButton aria-label="Perguntar falando" icone={Microphone} onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar falando' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('não compila sem aria-label', () => {
    // @ts-expect-error aria-label é obrigatório; se ficar opcional, o typecheck quebra aqui
    const elemento = <IconButton icone={Microphone} />;
    expect(elemento).toBeTruthy();
  });
});
