import { Camera, X } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState } from 'react';
import { Alert } from '../Alert';
import { Button } from '../Button';

export interface CameraCaptureProps {
  /** Recebe a foto (JPEG) para o app mandar ao /ler-caixa. A foto não é guardada. */
  onFoto: (foto: Blob) => void;
  /** Fecha a câmera e volta para onde a pessoa estava. */
  onFechar: () => void;
  /** O caminho por digitação, sempre disponível. */
  onDigitar: () => void;
}

type EstadoDaCamera = 'pedindo' | 'pronta' | 'negada' | 'indisponivel';

/** Câmera traseira, quando houver. */
const PEDIDO: MediaStreamConstraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };

/**
 * Visor para fotografar a caixa do remédio. Se a câmera for negada ou não existir, explica o que
 * houve e oferece a digitação. A câmera desliga quando o componente sai da tela.
 */
export function CameraCapture({ onFoto, onFechar, onDigitar }: CameraCaptureProps) {
  const idTitulo = useId();
  const video = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<EstadoDaCamera>('pedindo');

  useEffect(() => {
    let fluxo: MediaStream | null = null;
    let ativo = true;
    const midia = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
    if (!midia?.getUserMedia) {
      queueMicrotask(() => setEstado('indisponivel'));
      return;
    }
    midia.getUserMedia(PEDIDO).then(
      (recebido) => {
        if (!ativo) {
          for (const trilha of recebido.getTracks()) trilha.stop();
          return;
        }
        fluxo = recebido;
        if (video.current) video.current.srcObject = recebido;
        setEstado('pronta');
      },
      (erro: unknown) => {
        if (!ativo) return;
        const negada = erro instanceof DOMException && (erro.name === 'NotAllowedError' || erro.name === 'SecurityError');
        setEstado(negada ? 'negada' : 'indisponivel');
      },
    );
    return () => {
      ativo = false;
      for (const trilha of fluxo?.getTracks() ?? []) trilha.stop();
    };
  }, []);

  function fotografar() {
    const quadro = video.current;
    if (!quadro) return;
    const canvas = document.createElement('canvas');
    canvas.width = quadro.videoWidth || 1280;
    canvas.height = quadro.videoHeight || 960;
    canvas.getContext('2d')?.drawImage(quadro, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((foto) => {
      if (foto) onFoto(foto);
    }, 'image/jpeg');
  }

  const semCamera = estado === 'negada' || estado === 'indisponivel';

  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variante="discreta" icone={X} onPress={onFechar}>
          Fechar
        </Button>
        <h1 id={idTitulo} className="text-titulo-3 font-bold">
          Foto da caixa
        </h1>
      </div>

      {semCamera ? (
        <Alert
          tom="info"
          anunciar="polite"
          nivelTitulo={2}
          titulo={estado === 'negada' ? 'A câmera está bloqueada para o Bula Clara' : 'Não achei uma câmera neste aparelho'}
        >
          <p>Você pode digitar o nome do remédio.</p>
          {estado === 'negada' ? (
            <p className="mt-1 text-apoio">Se quiser usar a câmera, libere nos ajustes do seu navegador.</p>
          ) : null}
        </Alert>
      ) : (
        <div className="relative aspect-3/4 max-h-[60dvh] w-full overflow-hidden rounded-painel bg-sobreposicao-fundo">
          <video ref={video} autoPlay muted playsInline className="size-full object-cover" />
          <div className="pointer-events-none absolute inset-6 flex items-end justify-center rounded-controle border-3 border-dashed border-text-on-solid">
            <p className="mb-3 rounded-controle bg-sobreposicao-fundo px-3 py-1 text-apoio font-bold text-text-on-solid">
              Enquadre o nome do remédio aqui
            </p>
          </div>
        </div>
      )}

      {semCamera ? null : (
        <Button larguraTotal icone={Camera} isDisabled={estado !== 'pronta'} onPress={fotografar}>
          Tirar foto
        </Button>
      )}
      {/* A chave troca o botão inteiro: sem ela, a transição de cor passaria por um meio-termo sem contraste. */}
      <Button
        key={semCamera ? 'principal' : 'alternativa'}
        larguraTotal
        variante={semCamera ? 'primaria' : 'discreta'}
        onPress={onDigitar}
      >
        Digitar o nome
      </Button>
    </section>
  );
}
