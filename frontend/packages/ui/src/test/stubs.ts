// Simulações de voz, câmera e microfone para testes (jsdom) e stories (Chromium sem interface).
// Nenhuma faz chamada de rede nem pede permissão de verdade. Não importa o vitest, porque as
// stories também usam este arquivo. Cada função devolve outra que desfaz a simulação.

type Desfazer = () => void;

/** Troca uma propriedade (mesmo as que são getters, como window.speechSynthesis) e devolve como desfazer. */
function trocar<T extends object>(alvo: T, nome: string, valor: unknown): Desfazer {
  const original = Object.getOwnPropertyDescriptor(alvo, nome);
  Object.defineProperty(alvo, nome, { configurable: true, writable: true, value: valor });
  return () => {
    if (original) Object.defineProperty(alvo, nome, original);
    else Reflect.deleteProperty(alvo, nome);
  };
}

function juntar(desfazeres: Desfazer[]): Desfazer {
  return () => {
    for (const desfazer of [...desfazeres].reverse()) desfazer();
  };
}

// ---------------------------------------------------------------------------------------------
// Voz do aparelho (speechSynthesis)
// ---------------------------------------------------------------------------------------------

export interface VozFalsa {
  name: string;
  lang: string;
  localService: boolean;
}

/** Vozes de exemplo: uma do próprio aparelho e uma remota, que o ListenButton precisa ignorar. */
export const VOZ_LOCAL: VozFalsa = { name: 'Luciana (no aparelho)', lang: 'pt-BR', localService: true };
export const VOZ_REMOTA: VozFalsa = { name: 'Google português do Brasil', lang: 'pt-BR', localService: false };

class FalaFalsa extends EventTarget {
  text: string;
  lang = '';
  voice: VozFalsa | null = null;
  rate = 1;
  onstart: ((evento: Event) => void) | null = null;
  onend: ((evento: Event) => void) | null = null;
  onerror: ((evento: Event) => void) | null = null;
  onpause: ((evento: Event) => void) | null = null;
  onresume: ((evento: Event) => void) | null = null;

  constructor(text = '') {
    super();
    this.text = text;
  }

  emitir(tipo: 'start' | 'end' | 'error' | 'pause' | 'resume') {
    const evento = new Event(tipo);
    this.dispatchEvent(evento);
    this[`on${tipo}`]?.(evento);
  }
}

export interface VozesSimuladas {
  /** Tudo o que foi mandado falar, em ordem. */
  falas: FalaFalsa[];
  /** Termina a fala atual, como se a leitura tivesse chegado ao fim. */
  terminar: () => void;
  /** Troca as vozes e avisa com voiceschanged, como o navegador faz quando elas carregam. */
  trocarVozes: (vozes: VozFalsa[]) => void;
  desfazer: Desfazer;
}

/**
 * Substitui speechSynthesis e SpeechSynthesisUtterance. A fala começa no próximo ciclo (onstart)
 * e só termina com terminar(). Sem vozes, simula um aparelho sem nenhuma voz.
 */
export function simularVozes(vozesIniciais: VozFalsa[] = [VOZ_LOCAL]): VozesSimuladas {
  let vozes = vozesIniciais;
  const falas: FalaFalsa[] = [];
  let atual: FalaFalsa | null = null;
  const sintese = Object.assign(new EventTarget(), {
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null as ((evento: Event) => void) | null,
    getVoices: () => vozes,
    speak(fala: FalaFalsa) {
      falas.push(fala);
      atual = fala;
      sintese.speaking = true;
      setTimeout(() => fala.emitir('start'), 0);
    },
    pause() {
      if (!atual || sintese.paused) return;
      sintese.paused = true;
      atual.emitir('pause');
    },
    resume() {
      if (!atual || !sintese.paused) return;
      sintese.paused = false;
      atual.emitir('resume');
    },
    cancel() {
      const fala = atual;
      atual = null;
      sintese.speaking = false;
      sintese.paused = false;
      fala?.emitir('error');
    },
  });
  const terminar = () => {
    const fala = atual;
    atual = null;
    sintese.speaking = false;
    sintese.paused = false;
    fala?.emitir('end');
  };
  const trocarVozes = (novas: VozFalsa[]) => {
    vozes = novas;
    const evento = new Event('voiceschanged');
    sintese.dispatchEvent(evento);
    sintese.onvoiceschanged?.(evento);
  };
  const desfazer = juntar([
    trocar(window, 'speechSynthesis', sintese),
    trocar(window, 'SpeechSynthesisUtterance', FalaFalsa),
  ]);
  return { falas, terminar, trocarVozes, desfazer };
}

/** Simula um navegador sem speechSynthesis nenhuma (alguns navegadores embutidos não têm). */
export function simularSemSinteseDeVoz(): Desfazer {
  return juntar([trocar(window, 'speechSynthesis', undefined), trocar(window, 'SpeechSynthesisUtterance', undefined)]);
}

// ---------------------------------------------------------------------------------------------
// Áudio vindo do servidor (HTMLAudioElement)
// ---------------------------------------------------------------------------------------------

export interface AudioSimulado {
  /** Quantas vezes play() foi chamado. */
  tocou: () => number;
  /** Termina o áudio atual (dispara "ended"). */
  terminar: () => void;
  desfazer: Desfazer;
}

/** Substitui play/pause dos elementos de mídia e URL.createObjectURL. Nada é decodificado. */
export function simularAudio(): AudioSimulado {
  const tocados: HTMLMediaElement[] = [];
  const prototipo = HTMLMediaElement.prototype;
  const desfazer = juntar([
    trocar(prototipo, 'play', function (this: HTMLMediaElement) {
      tocados.push(this);
      setTimeout(() => this.dispatchEvent(new Event('playing')), 0);
      return Promise.resolve();
    }),
    trocar(prototipo, 'pause', function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('pause'));
    }),
    trocar(URL, 'createObjectURL', () => 'blob:simulado'),
    trocar(URL, 'revokeObjectURL', () => undefined),
  ]);
  return {
    tocou: () => tocados.length,
    terminar: () => tocados.at(-1)?.dispatchEvent(new Event('ended')),
    desfazer,
  };
}

// ---------------------------------------------------------------------------------------------
// Câmera e microfone (getUserMedia e MediaRecorder)
// ---------------------------------------------------------------------------------------------

export type ResultadoDaPermissao = 'permitir' | 'negar' | 'sem-dispositivo';

export interface TrilhaFalsa {
  kind: 'audio' | 'video';
  parada: boolean;
  stop: () => void;
}

export interface MidiaSimulada {
  /** Quantas vezes getUserMedia foi chamado. */
  pedidos: () => number;
  /** Trilhas entregues até agora. Servem para conferir que tudo foi desligado. */
  trilhas: TrilhaFalsa[];
  desfazer: Desfazer;
}

function erroDeMidia(resultado: ResultadoDaPermissao) {
  return resultado === 'negar'
    ? new DOMException('Permissão negada', 'NotAllowedError')
    : new DOMException('Nenhum dispositivo', 'NotFoundError');
}

function fluxoFalso(trilhas: TrilhaFalsa[]) {
  return {
    getTracks: () => trilhas,
    getAudioTracks: () => trilhas.filter((t) => t.kind === 'audio'),
    getVideoTracks: () => trilhas.filter((t) => t.kind === 'video'),
  };
}

function trilhaFalsa(kind: 'audio' | 'video'): TrilhaFalsa {
  const trilha: TrilhaFalsa = {
    kind,
    parada: false,
    stop: () => {
      trilha.parada = true;
    },
  };
  return trilha;
}

/**
 * Câmera falsa. No Chromium, entrega um fluxo de verdade, desenhado num canvas com o nome de um
 * remédio, para o <video> funcionar sem pedir permissão. No jsdom, entrega um objeto parecido com
 * MediaStream e faz o canvas devolver uma imagem vazia.
 */
export function simularCamera(resultado: ResultadoDaPermissao = 'permitir'): MidiaSimulada {
  let pedidos = 0;
  const trilhas: TrilhaFalsa[] = [];
  const desfazeres: Desfazer[] = [];
  const temCaptura = typeof HTMLCanvasElement.prototype.captureStream === 'function';
  if (!temCaptura) {
    desfazeres.push(
      trocar(HTMLCanvasElement.prototype, 'getContext', () => ({ drawImage: () => undefined })),
      trocar(HTMLCanvasElement.prototype, 'toBlob', function (callback: BlobCallback, tipo?: string) {
        callback(new Blob(['foto simulada'], { type: tipo ?? 'image/png' }));
      }),
    );
  }
  const getUserMedia = async () => {
    pedidos++;
    if (resultado !== 'permitir') throw erroDeMidia(resultado);
    if (temCaptura) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const contexto = canvas.getContext('2d');
      if (contexto) {
        contexto.fillStyle = '#F1F4F9';
        contexto.fillRect(0, 0, 640, 480);
        contexto.fillStyle = '#0B1B33';
        contexto.font = 'bold 56px sans-serif';
        contexto.fillText('LOSARTANA', 140, 230);
        contexto.font = '40px sans-serif';
        contexto.fillText('potássica 50 mg', 170, 290);
      }
      const fluxo = canvas.captureStream(5);
      for (const trilha of fluxo.getTracks()) {
        const espia = trilhaFalsa('video');
        const pararDeVerdade = trilha.stop.bind(trilha);
        trilha.stop = () => {
          espia.stop();
          pararDeVerdade();
        };
        trilhas.push(espia);
      }
      return fluxo;
    }
    const trilha = trilhaFalsa('video');
    trilhas.push(trilha);
    return fluxoFalso([trilha]);
  };
  desfazeres.push(trocarMediaDevices(getUserMedia));
  return { pedidos: () => pedidos, trilhas, desfazer: juntar(desfazeres) };
}

function trocarMediaDevices(getUserMedia: () => Promise<unknown>): Desfazer {
  return trocar(navigator, 'mediaDevices', { getUserMedia });
}

export interface MicrofoneSimulado extends MidiaSimulada {
  /** Gravações que chegaram ao fim, com o tipo de áudio escolhido. */
  gravacoes: { tipo: string }[];
  /** Quantas vezes o aparelho vibrou. */
  vibracoes: () => number;
}

/**
 * Microfone falso: getUserMedia, MediaRecorder e navigator.vibrate. `tiposAceitos` diz o que
 * MediaRecorder.isTypeSupported aceita (o Safari do iPhone grava audio/mp4, não webm).
 */
export function simularMicrofone(
  resultado: ResultadoDaPermissao = 'permitir',
  tiposAceitos: string[] = ['audio/webm;codecs=opus', 'audio/webm'],
): MicrofoneSimulado {
  let pedidos = 0;
  let vibracoes = 0;
  const trilhas: TrilhaFalsa[] = [];
  const gravacoes: { tipo: string }[] = [];

  class GravadorFalso extends EventTarget {
    static isTypeSupported(tipo: string) {
      return tiposAceitos.includes(tipo);
    }
    state: 'inactive' | 'recording' = 'inactive';
    mimeType: string;
    ondataavailable: ((evento: Event & { data: Blob }) => void) | null = null;
    onstart: ((evento: Event) => void) | null = null;
    onstop: ((evento: Event) => void) | null = null;
    constructor(_fluxo: unknown, opcoes?: { mimeType?: string }) {
      super();
      this.mimeType = opcoes?.mimeType ?? '';
    }
    start() {
      this.state = 'recording';
      const evento = new Event('start');
      this.dispatchEvent(evento);
      this.onstart?.(evento);
    }
    stop() {
      if (this.state === 'inactive') return;
      this.state = 'inactive';
      const dados = Object.assign(new Event('dataavailable'), {
        data: new Blob(['áudio simulado'], { type: this.mimeType || 'audio/webm' }),
      });
      this.dispatchEvent(dados);
      this.ondataavailable?.(dados);
      gravacoes.push({ tipo: this.mimeType });
      const fim = new Event('stop');
      this.dispatchEvent(fim);
      this.onstop?.(fim);
    }
  }

  const getUserMedia = async () => {
    pedidos++;
    if (resultado !== 'permitir') throw erroDeMidia(resultado);
    const trilha = trilhaFalsa('audio');
    trilhas.push(trilha);
    return fluxoFalso([trilha]);
  };
  const desfazer = juntar([
    trocarMediaDevices(getUserMedia),
    trocar(window, 'MediaRecorder', GravadorFalso),
    trocar(navigator, 'vibrate', () => {
      vibracoes++;
      return true;
    }),
  ]);
  return { pedidos: () => pedidos, trilhas, gravacoes, vibracoes: () => vibracoes, desfazer };
}
