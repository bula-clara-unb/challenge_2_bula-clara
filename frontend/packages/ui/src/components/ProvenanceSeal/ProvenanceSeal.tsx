import { SealCheck } from '@phosphor-icons/react';

export interface BulaDeOrigem {
  /** Nome do remédio ("Losartana"). Na ficha, onde o nome já é o título, deixe de fora. */
  remedio?: string;
  /**
   * Data da versão da bula, como o backend manda: "03/2025", "2025-03" ou "2025-03-01".
   * `null` quando não há data registrada. O selo nunca inventa nem estima uma data.
   */
  versao: string | null;
}

export interface ProvenanceSealProps {
  /** Uma entrada para cada bula usada na resposta, na ordem das citações. */
  bulas: readonly BulaDeOrigem[];
}

/**
 * "2025-03-01" e "2025-03" viram "03/2025" por texto, sem passar por Date: new Date('2025-03-01')
 * em Brasília cai em 28/02 e mudaria o mês. Outros formatos saem como vieram.
 */
export function formatarVersao(versao: string): string {
  const iso = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(versao.trim());
  return iso ? `${iso[2]}/${iso[1]}` : versao.trim();
}

function descrever({ remedio, versao }: BulaDeOrigem): string {
  const temData = versao !== null && versao.trim() !== '';
  if (remedio) return temData ? `${remedio}, versão de ${formatarVersao(versao)}` : `${remedio} · data da versão não informada`;
  return temData ? `versão de ${formatarVersao(versao)}` : 'data da versão não informada';
}

/** Selo de procedência: de qual bula oficial a informação veio e de quando ela é. */
export function ProvenanceSeal({ bulas }: ProvenanceSealProps) {
  if (bulas.length === 0) return null;
  return (
    <p className="flex max-w-medida items-start gap-2 border-t border-border-subtle pt-3 text-apoio text-text-muted">
      <SealCheck size="1.25rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0 text-selo-icone" />
      <span>Bula oficial ANVISA · {bulas.map(descrever).join(' · ')}</span>
    </p>
  );
}
