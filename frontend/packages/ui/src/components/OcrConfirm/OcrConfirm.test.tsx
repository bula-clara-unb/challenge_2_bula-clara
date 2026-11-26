import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OcrConfirm } from './OcrConfirm';

const acoes = () => ({ onConfirmar: vi.fn(), onDigitar: vi.fn(), onTentarDeNovo: vi.fn() });

describe('OcrConfirm', () => {
  it('mostra o que leu e só pergunta depois do "sim"', async () => {
    const funcoes = acoes();
    render(<OcrConfirm isOpen medicamento="Losartana potássica 50 mg" {...funcoes} />);
    expect(screen.getByRole('dialog', { name: 'Losartana potássica 50 mg' })).toHaveTextContent('Li na caixa');
    expect(screen.getByText('A foto é usada só para ler o nome e não é guardada.')).toBeInTheDocument();
    expect(funcoes.onConfirmar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sim, perguntar sobre ele' }));
    expect(funcoes.onConfirmar).toHaveBeenCalledOnce();
  });

  it('"Não, vou digitar o nome" leva à digitação', async () => {
    const funcoes = acoes();
    render(<OcrConfirm isOpen medicamento="Losartana potássica 50 mg" {...funcoes} />);
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou digitar o nome' }));
    expect(funcoes.onDigitar).toHaveBeenCalledOnce();
    expect(funcoes.onConfirmar).not.toHaveBeenCalled();
  });

  it('sem leitura, oferece outra foto ou a digitação, e nunca um "sim"', async () => {
    const funcoes = acoes();
    render(<OcrConfirm isOpen medicamento={null} {...funcoes} />);
    expect(screen.getByRole('dialog', { name: 'Não consegui ler o nome na foto' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sim/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tirar outra foto' }));
    expect(funcoes.onTentarDeNovo).toHaveBeenCalledOnce();
  });
});
