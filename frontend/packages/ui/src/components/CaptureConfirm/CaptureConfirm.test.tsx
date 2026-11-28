import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CaptureConfirm } from './CaptureConfirm';

const textos = {
  rotulo: 'Li na caixa',
  titulo: 'Losartana potássica 50 mg',
  pergunta: 'É esse o remédio?',
  rotuloConfirmar: 'Sim, perguntar sobre ele',
  rotuloCorrigir: 'Não, vou digitar o nome',
};

describe('CaptureConfirm', () => {
  it('é uma folha com o que foi lido como nome', () => {
    render(<CaptureConfirm isOpen {...textos} onConfirmar={vi.fn()} onCorrigir={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Losartana potássica 50 mg' })).toBeInTheDocument();
    expect(screen.getByText('Li na caixa')).toBeInTheDocument();
    expect(screen.getByText('É esse o remédio?')).toBeInTheDocument();
  });

  it('nada acontece antes de a pessoa escolher', () => {
    const onConfirmar = vi.fn();
    render(<CaptureConfirm isOpen {...textos} onConfirmar={onConfirmar} onCorrigir={vi.fn()} />);
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it('confirmar fecha a folha e avisa', async () => {
    const onConfirmar = vi.fn();
    const onOpenChange = vi.fn();
    render(<CaptureConfirm isOpen onOpenChange={onOpenChange} {...textos} onConfirmar={onConfirmar} onCorrigir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sim, perguntar sobre ele' }));
    expect(onConfirmar).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('o caminho por digitação está sempre lá', async () => {
    const onCorrigir = vi.fn();
    render(<CaptureConfirm isOpen {...textos} onConfirmar={vi.fn()} onCorrigir={onCorrigir} />);
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou digitar o nome' }));
    expect(onCorrigir).toHaveBeenCalledOnce();
  });

  it('Esc fecha sem confirmar', async () => {
    const onConfirmar = vi.fn();
    const onOpenChange = vi.fn();
    render(<CaptureConfirm isOpen onOpenChange={onOpenChange} {...textos} onConfirmar={onConfirmar} onCorrigir={vi.fn()} />);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirmar).not.toHaveBeenCalled();
  });
});
