import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';
import { afterEach, describe, expect, it } from 'vitest';
import { confirmarAcao, filaDeToasts, TEMPO_DO_TOAST, ToastRegion, type ConfirmacaoDeAcao } from './Toast';

afterEach(() => {
  act(() => filaDeToasts.clear());
});

describe('Toast', () => {
  it('confirmarAcao mostra a frase numa região com nome', async () => {
    render(<ToastRegion />);
    act(() => {
      confirmarAcao('Lista apagada deste aparelho.');
    });
    expect(await screen.findByText('Lista apagada deste aparelho.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Confirmações' })).toBeInTheDocument();
  });

  it('some sozinho só depois de pelo menos 5 segundos', () => {
    act(() => {
      confirmarAcao('Lista apagada deste aparelho.');
    });
    expect(TEMPO_DO_TOAST).toBeGreaterThanOrEqual(5000);
    expect(filaDeToasts.visibleToasts[0]?.timeout).toBe(TEMPO_DO_TOAST);
  });

  it('fecha pelo botão', async () => {
    const fila = new ToastQueue<ConfirmacaoDeAcao>();
    render(<ToastRegion fila={fila} />);
    act(() => {
      fila.add({ mensagem: 'Remédio adicionado.' });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Fechar' }));
    expect(screen.queryByText('Remédio adicionado.')).not.toBeInTheDocument();
  });

  it('não aceita tom nem variante', () => {
    // @ts-expect-error toast só confirma ação; aviso de segurança é Alert
    const chamada = () => confirmarAcao('Não use junto', { tom: 'perigo' });
    expect(chamada).toBeTypeOf('function');
  });
});
