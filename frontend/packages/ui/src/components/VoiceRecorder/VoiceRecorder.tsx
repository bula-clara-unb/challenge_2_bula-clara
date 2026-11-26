import { Microphone, Stop, X } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState } from 'react';
import { Alert } from '../Alert';
import { Button } from '../Button';

export interface VoiceRecorderProps {
  /**
   * Recebe o áudio gravado, para o app mandar ao /transcrever (Whisper no nosso servidor).
   * O tipo do arquivo vem em `audio.type` (audio/webm no Chrome e no Android, audio/mp4 no iPhone).
   */
  onGravacao: (audio: Blob) => void;
  /** Fecha sem mandar nada. Se estiver gravando, a gravação é descartada. */
  onFechar: () => void;
  /** O caminho por digitação, sempre disponível. */
  onEscrever: () => void;
  /** A gravação para sozinha depois desse tempo. */
  duracaoMaximaMs?: number;
}

type EstadoDaGravacao = 'pedindo' | 'gravando' | 'terminou' | 'negado' | 'indisponivel';

/** Em ordem de preferência. O Safari do iPhone só grava audio/mp4. */
export const TIPOS_DE_AUDIO = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'] as const;

export function escolherTipoDeAudio(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return TIPOS_DE_AUDIO.find((tipo) => MediaRecorder.isTypeSupported(tipo)) ?? '';
}

/** Retorno sonoro e tátil: um bipe agudo ao começar, um grave ao terminar, e uma vibração. */
function sinalizar(momento: 'inicio' | 'fim') {
  navigator.vibrate?.(momento === 'inicio' ? 80 : [60, 40, 60]);
  const Contexto = typeof window === 'undefined' ? undefined : window.AudioContext;
  if (!Contexto) return;
  try {
    const contexto = new Contexto();
    const oscilador = contexto.createOscillator();
    const volume = contexto.createGain();
    volume.gain.value = 0.1;
    oscilador.frequency.value = momento === 'inicio' ? 880 : 440;
    oscilador.connect(volume).connect(contexto.destination);
    oscilador.onended = () => void contexto.close();
    oscilador.start();
    oscilador.stop(contexto.currentTime + 0.15);
  } catch {
    // Sem som, ainda ficam a vibração e o texto.
  }
}

const textoDoEstado: Partial<Record<EstadoDaGravacao, string>> = {
  pedindo: 'Preparando o microfone…',
  gravando: 'Ouvindo… fale sua pergunta',
  terminou: 'Gravação terminada. Vou conferir o que entendi.',
};

/**
 * Grava a pergunta falada com MediaRecorder e entrega o áudio. Nunca usa a SpeechRecognition do
 * navegador, que no Chrome manda o áudio para o Google. Avisa por som, vibração e texto quando
 * começa e quando termina.
 */
export function VoiceRecorder({ onGravacao, onFechar, onEscrever, duracaoMaximaMs = 30000 }: VoiceRecorderProps) {
  const idTitulo = useId();
  const [estado, setEstado] = useState<EstadoDaGravacao>('pedindo');
  const gravador = useRef<MediaRecorder | null>(null);
  const descartar = useRef(false);
  const aoGravar = useRef(onGravacao);

  useEffect(() => {
    aoGravar.current = onGravacao;
  }, [onGravacao]);

  useEffect(() => {
    let ativo = true;
    descartar.current = false;
    let fluxo: MediaStream | null = null;
    let limite: ReturnType<typeof setTimeout> | undefined;
    const desligar = () => {
      for (const trilha of fluxo?.getTracks() ?? []) trilha.stop();
    };
    const midia = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
    if (!midia?.getUserMedia || typeof MediaRecorder === 'undefined') {
      queueMicrotask(() => setEstado('indisponivel'));
      return;
    }
    midia.getUserMedia({ audio: true, video: false }).then(
      (recebido) => {
        fluxo = recebido;
        if (!ativo) {
          desligar();
          return;
        }
        const tipo = escolherTipoDeAudio();
        const novo = new MediaRecorder(recebido, tipo ? { mimeType: tipo } : undefined);
        const pedacos: Blob[] = [];
        novo.addEventListener('dataavailable', (evento) => {
          if (evento.data.size > 0) pedacos.push(evento.data);
        });
        novo.addEventListener('stop', () => {
          clearTimeout(limite);
          desligar();
          if (descartar.current) return;
          sinalizar('fim');
          setEstado('terminou');
          aoGravar.current(new Blob(pedacos, { type: novo.mimeType || tipo || 'audio/webm' }));
        });
        gravador.current = novo;
        novo.start();
        sinalizar('inicio');
        setEstado('gravando');
        limite = setTimeout(() => novo.stop(), duracaoMaximaMs);
      },
      (erro: unknown) => {
        if (!ativo) return;
        const negado = erro instanceof DOMException && (erro.name === 'NotAllowedError' || erro.name === 'SecurityError');
        setEstado(negado ? 'negado' : 'indisponivel');
      },
    );
    return () => {
      ativo = false;
      clearTimeout(limite);
      descartar.current = true;
      if (gravador.current?.state === 'recording') gravador.current.stop();
      desligar();
    };
  }, [duracaoMaximaMs]);

  function parar() {
    if (gravador.current?.state === 'recording') gravador.current.stop();
  }

  function fechar() {
    descartar.current = true;
    parar();
    onFechar();
  }

  const semMicrofone = estado === 'negado' || estado === 'indisponivel';

  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variante="discreta" icone={X} onPress={fechar}>
          Fechar
        </Button>
        <h1 id={idTitulo} className="text-titulo-3 font-bold">
          Pergunta falada
        </h1>
      </div>

      {semMicrofone ? (
        <Alert
          tom="info"
          anunciar="polite"
          nivelTitulo={2}
          titulo={estado === 'negado' ? 'O microfone está bloqueado para o Bula Clara' : 'Não achei um microfone neste aparelho'}
        >
          <p>Você pode escrever a sua pergunta.</p>
          {estado === 'negado' ? (
            <p className="mt-1 text-apoio">Se quiser usar o microfone, libere nos ajustes do seu navegador.</p>
          ) : null}
        </Alert>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <span
            aria-hidden="true"
            className={
              'flex size-24 items-center justify-center rounded-total bg-action-primary text-text-on-solid ' +
              (estado === 'gravando' ? 'animate-pulse motion-reduce:animate-none' : '')
            }
          >
            <Microphone size="3rem" weight="bold" />
          </span>
          <p role="status" className="text-center text-corpo font-bold">
            {textoDoEstado[estado]}
          </p>
        </div>
      )}

      {estado === 'gravando' ? (
        <Button larguraTotal icone={Stop} onPress={parar}>
          Parar de gravar
        </Button>
      ) : null}
      {/* A chave troca o botão inteiro: sem ela, a transição de cor passaria por um meio-termo sem contraste. */}
      <Button
        key={semMicrofone ? 'principal' : 'alternativa'}
        larguraTotal
        variante={semMicrofone ? 'primaria' : 'discreta'}
        onPress={onEscrever}
      >
        Escrever a pergunta
      </Button>
    </section>
  );
}
