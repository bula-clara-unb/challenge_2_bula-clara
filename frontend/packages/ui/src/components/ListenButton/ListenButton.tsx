import { Pause, Play, SpeakerHigh, type Icon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { classesDeBotao, type ButtonVariante } from '../Button/estilo';

export type EstadoDaLeitura = 'parado' | 'carregando' | 'tocando' | 'pausado';

export interface ListenButtonProps {
  /** O texto que vai ser lido: a frase-resposta e a explicação, sem as citações [n]. */
  texto: string;
  /** O que o botão diz quando está parado. Na ficha do remédio: "Ouvir esta página". */
  rotulo?: string;
  /**
   * Busca o áudio no nosso servidor (o /falar, com voz offline). Quando vem, é ele que toca.
   * Sem ele, o botão usa uma voz do próprio aparelho. Sem nenhum dos dois, o botão não aparece.
   */
  obterAudio?: (texto: string) => Promise<Blob>;
}

/** Só vozes que rodam no aparelho e falam português. Vozes remotas mandam o texto para terceiros. */
export function ehVozPermitida(voz: Pick<SpeechSynthesisVoice, 'localService' | 'lang'>): boolean {
  return voz.localService && /^pt([-_]|$)/i.test(voz.lang);
}

function sintese(): SpeechSynthesis | undefined {
  return typeof window === 'undefined' ? undefined : window.speechSynthesis;
}

function vozDoAparelho(): SpeechSynthesisVoice | undefined {
  return sintese()
    ?.getVoices()
    .find((voz) => ehVozPermitida(voz));
}

// As vozes chegam depois (voiceschanged). O nome da voz é o "retrato" estável para o React.
function assinarVozes(avisar: () => void) {
  const s = sintese();
  s?.addEventListener('voiceschanged', avisar);
  return () => s?.removeEventListener('voiceschanged', avisar);
}
const nomeDaVoz = () => vozDoAparelho()?.name ?? null;
const semVozNoServidor = () => null;

const aparencia: Record<EstadoDaLeitura, { variante: ButtonVariante; icone?: Icon }> = {
  parado: { variante: 'primaria', icone: SpeakerHigh },
  carregando: { variante: 'secundaria' },
  tocando: { variante: 'secundaria', icone: Pause },
  pausado: { variante: 'secundaria', icone: Play },
};

/**
 * Lê a resposta em voz alta, só com voz sem terceiros: a do nosso servidor (obterAudio) ou uma voz
 * do próprio aparelho (speechSynthesis com localService). Nunca gTTS, nunca voz remota.
 */
export function ListenButton({ texto, rotulo = 'Ouvir resposta', obterAudio }: ListenButtonProps) {
  const voz = useSyncExternalStore(assinarVozes, nomeDaVoz, semVozNoServidor);
  const [estado, setEstado] = useState<EstadoDaLeitura>('parado');
  const [falhou, setFalhou] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const endereco = useRef<string | null>(null);
  const falandoNoAparelho = useRef(false);

  // Só ao sair da tela. O app costuma passar uma função obterAudio nova a cada desenho, e depender
  // dela pararia o áudio no meio sempre que a tela redesenhasse.
  useEffect(
    () => () => {
      audio.current?.pause();
      if (endereco.current) URL.revokeObjectURL(endereco.current);
      if (falandoNoAparelho.current) sintese()?.cancel();
    },
    [],
  );

  if (!obterAudio && !voz) return null;

  const terminar = () => {
    setEstado('parado');
    if (endereco.current) URL.revokeObjectURL(endereco.current);
    endereco.current = null;
    audio.current = null;
  };

  async function tocarDoServidor(buscar: (texto: string) => Promise<Blob>) {
    setEstado('carregando');
    try {
      const arquivo = await buscar(texto);
      endereco.current = URL.createObjectURL(arquivo);
      const elemento = new Audio(endereco.current);
      audio.current = elemento;
      elemento.addEventListener('playing', () => setEstado('tocando'));
      elemento.addEventListener('ended', terminar);
      await elemento.play();
    } catch {
      terminar();
      setFalhou(true);
    }
  }

  function tocarNoAparelho() {
    const s = sintese();
    const escolhida = vozDoAparelho();
    if (!s || !escolhida) return;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.voice = escolhida;
    fala.lang = escolhida.lang;
    fala.rate = 0.95;
    fala.onstart = () => setEstado('tocando');
    fala.onend = () => {
      falandoNoAparelho.current = false;
      setEstado('parado');
    };
    fala.onerror = () => {
      falandoNoAparelho.current = false;
      setEstado('parado');
    };
    s.cancel();
    setEstado('carregando');
    falandoNoAparelho.current = true;
    s.speak(fala);
  }

  function aoPressionar() {
    setFalhou(false);
    if (estado === 'parado') {
      if (obterAudio) void tocarDoServidor(obterAudio);
      else tocarNoAparelho();
    } else if (estado === 'tocando') {
      if (audio.current) audio.current.pause();
      else sintese()?.pause();
      setEstado('pausado');
    } else if (estado === 'pausado') {
      if (audio.current) void audio.current.play();
      else sintese()?.resume();
      setEstado('tocando');
    }
  }

  const { variante, icone: Icone } = aparencia[estado];
  const textoDoBotao = {
    parado: rotulo,
    carregando: 'Preparando o áudio…',
    tocando: 'Pausar',
    pausado: 'Continuar',
  }[estado];

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Sem isPending: o React Aria anuncia por um nó role="img" que o axe reprova. Carregando,
          o botão continua focável e só ignora o toque. */}
      <AriaButton
        aria-disabled={estado === 'carregando' ? true : undefined}
        onPress={aoPressionar}
        className={classesDeBotao(variante, false) + ' aria-disabled:cursor-wait'}
      >
        {estado === 'carregando' ? (
          <span
            aria-hidden="true"
            className="size-6 shrink-0 animate-spin rounded-full border-3 border-border-subtle border-t-action-primary motion-reduce:animate-none"
          />
        ) : Icone ? (
          <Icone size={24} weight="bold" aria-hidden="true" focusable="false" />
        ) : null}
        {textoDoBotao}
      </AriaButton>
      <p role="status" className="text-apoio text-text-muted empty:hidden">
        {falhou ? 'Não consegui preparar o áudio agora. A resposta continua escrita aqui.' : ''}
      </p>
    </div>
  );
}
