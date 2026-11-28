import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { simularMicrofone } from '../../test/stubs';
import { VoiceRecorder } from './VoiceRecorder';

let desfazer: () => void = () => undefined;
afterEach(() => desfazer());

const acoes = () => ({ onGravacao: vi.fn(), onFechar: vi.fn(), onEscrever: vi.fn() });

describe('VoiceRecorder', () => {
  it('começa a gravar e avisa por texto e vibração', async () => {
    const microfone = simularMicrofone();
    desfazer = microfone.desfazer;
    render(<VoiceRecorder {...acoes()} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Ouvindo… fale sua pergunta');
    expect(microfone.vibracoes()).toBe(1);
  });

  it('ao parar, entrega o áudio com o tipo, desliga o microfone e avisa que terminou', async () => {
    const microfone = simularMicrofone();
    desfazer = microfone.desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Parar de gravar' }));
    expect(funcoes.onGravacao).toHaveBeenCalledOnce();
    const audio = funcoes.onGravacao.mock.calls[0]?.[0] as Blob;
    expect(audio.type).toBe('audio/webm;codecs=opus');
    expect(microfone.trilhas.every((trilha) => trilha.parada)).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Gravação terminada.');
    expect(microfone.vibracoes()).toBe(2);
  });

  it('no iPhone, grava em audio/mp4', async () => {
    const microfone = simularMicrofone('permitir', ['audio/mp4']);
    desfazer = microfone.desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Parar de gravar' }));
    expect((funcoes.onGravacao.mock.calls[0]?.[0] as Blob).type).toBe('audio/mp4');
  });

  it('para sozinha no tempo máximo', async () => {
    desfazer = simularMicrofone().desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} duracaoMaximaMs={30} />);
    await waitFor(() => expect(funcoes.onGravacao).toHaveBeenCalledOnce());
  });

  it('fechar descarta a gravação e desliga o microfone', async () => {
    const microfone = simularMicrofone();
    desfazer = microfone.desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await screen.findByRole('button', { name: 'Parar de gravar' });
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(funcoes.onFechar).toHaveBeenCalledOnce();
    expect(funcoes.onGravacao).not.toHaveBeenCalled();
    expect(microfone.trilhas.every((trilha) => trilha.parada)).toBe(true);
  });

  it('microfone negado: explica e oferece a escrita', async () => {
    desfazer = simularMicrofone('negar').desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await screen.findByText('O microfone está bloqueado para o Bula Clara');
    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent('Você pode escrever a sua pergunta.');
    await userEvent.click(screen.getByRole('button', { name: 'Escrever a pergunta' }));
    expect(funcoes.onEscrever).toHaveBeenCalledOnce();
  });

  it('sem microfone no aparelho, diz isso', async () => {
    desfazer = simularMicrofone('sem-dispositivo').desfazer;
    render(<VoiceRecorder {...acoes()} />);
    await screen.findByText('Não achei um microfone neste aparelho');
    expect(screen.getByRole('status')).toHaveTextContent('Você pode escrever a sua pergunta.');
  });

  it('nunca toca na SpeechRecognition do navegador', async () => {
    const microfone = simularMicrofone();
    let leituras = 0;
    for (const nome of ['SpeechRecognition', 'webkitSpeechRecognition']) {
      Object.defineProperty(window, nome, {
        configurable: true,
        get: () => {
          leituras++;
          return undefined;
        },
      });
    }
    desfazer = () => {
      microfone.desfazer();
      Reflect.deleteProperty(window, 'SpeechRecognition');
      Reflect.deleteProperty(window, 'webkitSpeechRecognition');
    };
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Parar de gravar' }));
    expect(funcoes.onGravacao).toHaveBeenCalledOnce();
    expect(leituras).toBe(0);
  });
});
