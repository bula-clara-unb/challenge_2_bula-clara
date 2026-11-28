import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { simularAudio, simularSemSinteseDeVoz, simularVozes, VOZ_LOCAL, VOZ_REMOTA } from '../../test/stubs';
import { ListenButton } from './ListenButton';

const texto = 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana.';
let desfazer: () => void = () => undefined;
afterEach(() => desfazer());

describe('ListenButton', () => {
  it('não aparece sem voz do aparelho e sem áudio do servidor', () => {
    desfazer = simularVozes([]).desfazer;
    const { container } = render(<ListenButton texto={texto} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ignora vozes remotas e vozes do aparelho em outra língua', () => {
    desfazer = simularVozes([VOZ_REMOTA, { name: 'Samantha', lang: 'en-US', localService: true }]).desfazer;
    const { container } = render(<ListenButton texto={texto} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('não quebra num navegador sem speechSynthesis', () => {
    desfazer = simularSemSinteseDeVoz();
    const { container } = render(<ListenButton texto={texto} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('aparece quando a voz do aparelho termina de carregar', () => {
    const vozes = simularVozes([]);
    desfazer = vozes.desfazer;
    render(<ListenButton texto={texto} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    act(() => vozes.trocarVozes([VOZ_REMOTA, VOZ_LOCAL]));
    expect(screen.getByRole('button', { name: 'Ouvir resposta' })).toBeInTheDocument();
  });

  it('com a voz do aparelho: parado, carregando, tocando, pausado e de volta', async () => {
    const vozes = simularVozes([VOZ_REMOTA, VOZ_LOCAL]);
    desfazer = vozes.desfazer;
    render(<ListenButton texto={texto} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    expect(vozes.falas).toHaveLength(1);
    expect(vozes.falas[0]?.text).toBe(texto);
    expect(vozes.falas[0]?.voice).toBe(VOZ_LOCAL);
    await screen.findByRole('button', { name: 'Pausar' });
    await userEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    act(() => vozes.terminar());
    expect(screen.getByRole('button', { name: 'Ouvir resposta' })).toBeInTheDocument();
  });

  it('mostra "Preparando o áudio…" sem perder o foco enquanto carrega', async () => {
    desfazer = simularAudio().desfazer;
    const obterAudio = vi.fn(() => new Promise<Blob>(() => undefined));
    render(<ListenButton texto={texto} obterAudio={obterAudio} />);
    const botao = screen.getByRole('button', { name: 'Ouvir resposta' });
    await userEvent.click(botao);
    expect(botao).toHaveAccessibleName('Preparando o áudio…');
    expect(botao).toHaveAttribute('aria-disabled', 'true');
    expect(botao).toHaveFocus();
    await userEvent.click(botao);
    expect(obterAudio).toHaveBeenCalledOnce();
  });

  it('com o áudio do servidor, toca o que veio e não usa a voz do aparelho', async () => {
    const vozes = simularVozes();
    const audio = simularAudio();
    desfazer = () => {
      audio.desfazer();
      vozes.desfazer();
    };
    const obterAudio = vi.fn(async () => new Blob(['áudio'], { type: 'audio/wav' }));
    render(<ListenButton texto={texto} rotulo="Ouvir esta página" obterAudio={obterAudio} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir esta página' }));
    expect(obterAudio).toHaveBeenCalledWith(texto);
    await screen.findByRole('button', { name: 'Pausar' });
    expect(audio.tocou()).toBe(1);
    expect(vozes.falas).toHaveLength(0);
    act(() => audio.terminar());
    expect(screen.getByRole('button', { name: 'Ouvir esta página' })).toBeInTheDocument();
  });

  it('continua tocando quando a tela redesenha com outra função obterAudio', async () => {
    const audio = simularAudio();
    desfazer = audio.desfazer;
    const pausar = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    const { rerender } = render(
      <ListenButton texto={texto} obterAudio={async () => new Blob(['áudio'], { type: 'audio/wav' })} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    await screen.findByRole('button', { name: 'Pausar' });
    // O app costuma passar uma função nova a cada desenho (obterAudio={(t) => api.falar(t)}).
    rerender(<ListenButton texto={texto} obterAudio={async () => new Blob(['áudio'], { type: 'audio/wav' })} />);
    expect(pausar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
  });

  it('avisa por escrito quando o servidor não manda o áudio', async () => {
    desfazer = simularAudio().desfazer;
    render(<ListenButton texto={texto} obterAudio={() => Promise.reject(new Error('fora do ar'))} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Não consegui preparar o áudio agora.'));
    expect(screen.getByRole('button', { name: 'Ouvir resposta' })).toBeInTheDocument();
  });

  it('para de falar quando sai da tela', async () => {
    const vozes = simularVozes();
    desfazer = vozes.desfazer;
    const cancelar = vi.spyOn(window.speechSynthesis, 'cancel');
    const { unmount } = render(<ListenButton texto={texto} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    cancelar.mockClear();
    unmount();
    expect(cancelar).toHaveBeenCalled();
  });
});
