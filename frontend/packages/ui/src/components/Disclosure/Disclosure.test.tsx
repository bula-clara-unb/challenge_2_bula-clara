import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('começa fechado, com o botão dentro de um título', () => {
    render(<Disclosure titulo="Como chegamos nesta resposta">Lemos a seção 4 das duas bulas.</Disclosure>);
    const botao = screen.getByRole('button', { name: 'Como chegamos nesta resposta' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('heading', { level: 3 })).toContainElement(botao);
    expect(screen.queryByText('Lemos a seção 4 das duas bulas.')).not.toBeVisible();
  });

  it('abre e fecha pelo teclado', async () => {
    render(<Disclosure titulo="Como chegamos nesta resposta">Lemos a seção 4 das duas bulas.</Disclosure>);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Lemos a seção 4 das duas bulas.')).toBeVisible();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Accordion', () => {
  it('abre a seção pedida e deixa abrir outras sem fechar a primeira', async () => {
    render(
      <Accordion defaultExpandedKeys={['s4']}>
        <Disclosure id="s1" titulo="1. Para que serve?">
          Texto da seção 1.
        </Disclosure>
        <Disclosure id="s4" titulo="4. O que devo saber antes de usar?">
          Texto da seção 4.
        </Disclosure>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: '1. Para que serve?' }));
    expect(screen.getByText('Texto da seção 1.')).toBeVisible();
    expect(screen.getByText('Texto da seção 4.')).toBeVisible();
  });

  it('pode permitir só uma aberta', async () => {
    render(
      <Accordion permiteVariosAbertos={false} defaultExpandedKeys={['s4']}>
        <Disclosure id="s1" titulo="1. Para que serve?">
          Texto da seção 1.
        </Disclosure>
        <Disclosure id="s4" titulo="4. O que devo saber antes de usar?">
          Texto da seção 4.
        </Disclosure>
      </Accordion>,
    );
    await userEvent.click(screen.getByRole('button', { name: '1. Para que serve?' }));
    expect(screen.getByText('Texto da seção 4.')).not.toBeVisible();
  });
});
