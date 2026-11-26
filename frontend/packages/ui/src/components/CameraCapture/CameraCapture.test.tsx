import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { simularCamera } from '../../test/stubs';
import { CameraCapture } from './CameraCapture';

let desfazer: () => void = () => undefined;
afterEach(() => desfazer());

const acoes = () => ({ onFoto: vi.fn(), onFechar: vi.fn(), onDigitar: vi.fn() });

describe('CameraCapture', () => {
  it('pede a câmera, mostra o visor e entrega a foto', async () => {
    const camera = simularCamera('permitir');
    desfazer = camera.desfazer;
    const funcoes = acoes();
    render(<CameraCapture {...funcoes} />);
    expect(screen.getByRole('region', { name: 'Foto da caixa' })).toBeInTheDocument();
    expect(screen.getByText('Enquadre o nome do remédio aqui')).toBeInTheDocument();
    const tirar = screen.getByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    expect(funcoes.onFoto).toHaveBeenCalledWith(expect.any(Blob));
    expect(camera.pedidos()).toBe(1);
  });

  it('desliga a câmera quando sai da tela', async () => {
    const camera = simularCamera('permitir');
    desfazer = camera.desfazer;
    const { unmount } = render(<CameraCapture {...acoes()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeEnabled());
    unmount();
    expect(camera.trilhas).toHaveLength(1);
    expect(camera.trilhas.every((trilha) => trilha.parada)).toBe(true);
  });

  it('câmera negada: explica e oferece a digitação', async () => {
    desfazer = simularCamera('negar').desfazer;
    const funcoes = acoes();
    render(<CameraCapture {...funcoes} />);
    const aviso = await screen.findByRole('status');
    expect(aviso).toHaveTextContent('A câmera está bloqueada para o Bula Clara');
    expect(aviso).toHaveTextContent('Você pode digitar o nome do remédio.');
    expect(screen.queryByRole('button', { name: 'Tirar foto' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Digitar o nome' }));
    expect(funcoes.onDigitar).toHaveBeenCalledOnce();
  });

  it('sem câmera no aparelho, diz isso, sem falar em bloqueio', async () => {
    desfazer = simularCamera('sem-dispositivo').desfazer;
    render(<CameraCapture {...acoes()} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Não achei uma câmera neste aparelho');
  });

  it('a digitação e o fechar estão sempre disponíveis', async () => {
    desfazer = simularCamera('permitir').desfazer;
    const funcoes = acoes();
    render(<CameraCapture {...funcoes} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Digitar o nome' }));
    expect(funcoes.onFechar).toHaveBeenCalledOnce();
    expect(funcoes.onDigitar).toHaveBeenCalledOnce();
  });
});
