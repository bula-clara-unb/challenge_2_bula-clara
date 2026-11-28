import { BookOpen } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('é um link, com o destino no href', () => {
    render(<LinkButton href="#bula">Ver a bula inteira</LinkButton>);
    expect(screen.getByRole('link', { name: 'Ver a bula inteira' })).toHaveAttribute('href', '#bula');
  });

  it('recebe foco pelo teclado', async () => {
    render(<LinkButton href="#sobre">Saber mais</LinkButton>);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Saber mais' })).toHaveFocus();
  });

  it('tem a mesma área de toque e o mesmo ícone decorativo do Button', () => {
    render(
      <LinkButton href="#bula" icone={BookOpen}>
        Ver a bula inteira
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'Ver a bula inteira' });
    expect(link).toHaveClass('min-h-alvo', 'min-w-12');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('não compila sem href', () => {
    // @ts-expect-error href é obrigatório; ação sem destino é Button
    const elemento = <LinkButton>Ver a bula inteira</LinkButton>;
    expect(elemento).toBeTruthy();
  });
});
