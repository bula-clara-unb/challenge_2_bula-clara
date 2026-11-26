import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

const explicacao = (ligado: boolean) =>
  ligado
    ? 'Ligado: a lista fica salva só neste navegador.'
    : 'Desligado: a lista some quando você fecha a página.';

describe('Switch', () => {
  it('é um interruptor com rótulo, desligado por padrão', () => {
    render(<Switch>Lembrar neste aparelho</Switch>);
    expect(screen.getByRole('switch', { name: 'Lembrar neste aparelho' })).not.toBeChecked();
  });

  it('liga pelo clique e pelo espaço', async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>Lembrar neste aparelho</Switch>);
    await userEvent.click(screen.getByText('Lembrar neste aparelho'));
    expect(onChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('troca a explicação junto com o estado', async () => {
    render(<Switch descricao={explicacao}>Lembrar neste aparelho</Switch>);
    const interruptor = screen.getByRole('switch');
    expect(interruptor).toHaveAccessibleDescription('Desligado: a lista some quando você fecha a página.');
    await userEvent.click(interruptor);
    expect(interruptor).toHaveAccessibleDescription('Ligado: a lista fica salva só neste navegador.');
  });

  it('respeita o valor controlado', () => {
    render(
      <Switch isSelected descricao={explicacao}>
        Lembrar neste aparelho
      </Switch>,
    );
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByText(/^Ligado/)).toBeInTheDocument();
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error o texto (children) é o rótulo e é obrigatório
    const elemento = <Switch />;
    expect(elemento).toBeTruthy();
  });
});
