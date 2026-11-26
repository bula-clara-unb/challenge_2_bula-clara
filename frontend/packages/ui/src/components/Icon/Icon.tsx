import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

export type IconTamanho = 'pequeno' | 'medio' | 'grande';

/** Em rem, para o ícone crescer com o controle A+: 20, 24 e 32px com o texto em 100%. */
const tamanhos: Record<IconTamanho, string> = {
  pequeno: '1.25rem',
  medio: '1.5rem',
  grande: '2rem',
};

interface IconBase {
  /** Ícone Phosphor, sempre no peso `bold`. */
  icone: PhosphorIcon;
  /** 20, 24 ou 32px com o texto em 100%. Cresce com o A+. */
  tamanho?: IconTamanho;
}

/**
 * Todo ícone precisa dizer o que é: ou tem `rotulo` (o leitor de tela lê) ou é `decorativo`
 * (fica escondido, porque o texto ao lado já diz tudo). Sem nenhum dos dois, não compila.
 */
export type IconProps = IconBase & ({ rotulo: string; decorativo?: never } | { decorativo: true; rotulo?: never });

export function Icon({ icone: Icone, tamanho = 'medio', rotulo }: IconProps) {
  const size = tamanhos[tamanho];
  if (rotulo) {
    return <Icone size={size} weight="bold" role="img" aria-label={rotulo} focusable="false" className="shrink-0" />;
  }
  return <Icone size={size} weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />;
}
