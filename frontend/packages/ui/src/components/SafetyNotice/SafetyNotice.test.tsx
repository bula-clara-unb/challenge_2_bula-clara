import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SafetyNotice } from './SafetyNotice';
import { alteracaoDeDose, grupoEspecial } from './exemplos';

describe('SafetyNotice', () => {
  it('mostra o título e a mensagem do backend, sem acrescentar nada', () => {
    render(<SafetyNotice {...alteracaoDeDose} />);
    const aviso = screen.getByRole('note');
    expect(screen.getByRole('heading', { level: 2, name: alteracaoDeDose.titulo })).toBeInTheDocument();
    expect(aviso.textContent).toBe(alteracaoDeDose.titulo + alteracaoDeDose.mensagem);
  });

  it('não é vermelho nem interrompe o leitor de tela', () => {
    render(<SafetyNotice {...grupoEspecial} />);
    const aviso = screen.getByRole('note');
    expect(aviso.className).not.toMatch(/danger|emergencia|confirm/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tem uma saída opcional', async () => {
    const onPress = vi.fn();
    render(<SafetyNotice {...alteracaoDeDose} acao={{ rotulo: 'Fazer outra pergunta', onPress }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fazer outra pergunta' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('leva o foco ao título quando pedido e expõe o título por ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<SafetyNotice {...alteracaoDeDose} focarAoMontar ref={ref} />);
    const titulo = screen.getByRole('heading', { name: alteracaoDeDose.titulo });
    expect(titulo).toHaveFocus();
    expect(ref.current).toBe(titulo);
  });

  it('não aceita tom', () => {
    // @ts-expect-error o bloqueio tem um tom só, e ele não é de perigo
    const elemento = <SafetyNotice {...alteracaoDeDose} tom="perigo" />;
    expect(elemento).toBeTruthy();
  });
});
