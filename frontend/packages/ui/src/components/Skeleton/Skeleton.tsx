export interface SkeletonProps {
  /** `texto`: linhas com a altura do corpo; `bloco`: um retângulo (cartão, imagem). */
  forma?: 'texto' | 'bloco';
  /** Quantas linhas, na forma `texto`. A última sai mais curta. */
  linhas?: number;
}

const cor = 'border border-esqueleto-borda bg-esqueleto-fundo animate-pulse motion-reduce:animate-none';

/**
 * Lugar reservado enquanto o conteúdo carrega. Fica escondido do leitor de tela:
 * quem espera ouve o Spinner ou o status, e o contêiner leva aria-busy="true".
 */
export function Skeleton({ forma = 'texto', linhas = 3 }: SkeletonProps) {
  if (forma === 'bloco') {
    return <div aria-hidden="true" data-skeleton="" className={`h-24 w-full rounded-painel ${cor}`} />;
  }
  return (
    <div aria-hidden="true" data-skeleton="" className="flex max-w-medida flex-col gap-3 text-corpo">
      {Array.from({ length: linhas }, (_, i) => (
        <span key={i} className={`block h-[1em] rounded-aviso ${cor} ${i === linhas - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
