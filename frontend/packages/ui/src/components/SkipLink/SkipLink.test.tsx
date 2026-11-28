import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('aponta para o conteúdo principal', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute('href', '#conteudo');
  });

  it('é o primeiro a receber foco', async () => {
    render(
      <>
        <SkipLink />
        <button type="button">Perguntar</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus();
  });

  it('só aceita âncora da própria página', () => {
    // @ts-expect-error o destino precisa começar com #
    const elemento = <SkipLink href="/perguntar" />;
    expect(elemento).toBeTruthy();
  });
});
