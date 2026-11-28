import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TranscriptConfirm } from './TranscriptConfirm';

const acoes = () => ({ onConfirmar: vi.fn(), onEscrever: vi.fn(), onGravarDeNovo: vi.fn() });

describe('TranscriptConfirm', () => {
  it('mostra o que entendeu entre aspas e só pergunta depois do "sim"', async () => {
    const funcoes = acoes();
    render(<TranscriptConfirm isOpen transcricao="Posso tomar ibuprofeno com losartana?" {...funcoes} />);
    expect(screen.getByRole('dialog', { name: '“Posso tomar ibuprofeno com losartana?”' })).toHaveTextContent('Entendi');
    expect(screen.getByText('Está certo?')).toBeInTheDocument();
    expect(funcoes.onConfirmar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sim, perguntar' }));
    expect(funcoes.onConfirmar).toHaveBeenCalledOnce();
  });

  it('"Não, vou escrever" leva à digitação', async () => {
    const funcoes = acoes();
    render(<TranscriptConfirm isOpen transcricao="Posso tomar ibuprofeno com losartana?" {...funcoes} />);
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou escrever' }));
    expect(funcoes.onEscrever).toHaveBeenCalledOnce();
  });

  it('sem transcrição, oferece gravar de novo ou escrever', async () => {
    const funcoes = acoes();
    render(<TranscriptConfirm isOpen transcricao="  " {...funcoes} />);
    expect(screen.getByRole('dialog', { name: 'Não consegui entender a gravação' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Gravar de novo' }));
    expect(funcoes.onGravarDeNovo).toHaveBeenCalledOnce();
  });
});
