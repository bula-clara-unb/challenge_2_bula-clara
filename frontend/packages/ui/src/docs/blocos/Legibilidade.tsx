import { Tabela } from './Tabela';

// Mesma conta de scripts/avaliar.py (flesch_pt): índice de Flesch adaptado ao
// português por Martins et al. (1996). Se mudar lá, mude aqui.
function silabas(palavra: string): number {
  return Math.max(1, (palavra.toLowerCase().match(/[aeiouáéíóúâêôãõà]+/g) ?? []).length);
}

export function fleschPt(texto: string): number | null {
  const limpo = texto.replace(/\[\d+\]/g, '');
  const palavras = limpo.match(/[A-Za-zÀ-ú]+/g) ?? [];
  const frases = Math.max(1, (limpo.match(/[.!?]+/g) ?? []).length);
  if (palavras.length === 0) return null;
  const totalSilabas = palavras.reduce((soma, p) => soma + silabas(p), 0);
  return 248.835 - 1.015 * (palavras.length / frases) - 84.6 * (totalSilabas / palavras.length);
}

/**
 * O Flesch foi feito para trechos de texto. Numa frase curta, uma palavra comprida decide tudo:
 * "Apagar tudo" daria 35 e "Checando interações…", menos de zero. Abaixo disso, a tabela não mostra o índice.
 */
const MINIMO_DE_PALAVRAS = 10;

function contarPalavras(texto: string): number {
  return (texto.match(/[A-Za-zÀ-ú]+/g) ?? []).length;
}

export interface TextoDaInterface {
  situacao: string;
  texto: string;
  /** Quem escreve o texto: a interface ou o backend. */
  dono: 'interface' | 'backend';
  acao?: string;
}

/** Textos de estado com o índice de Flesch calculado na hora. A meta é 50 ou mais. */
export function TextosComLeitura({ titulo, textos }: { titulo: string; textos: TextoDaInterface[] }) {
  return (
    <Tabela
      titulo={titulo}
      colunas={['Situação', 'Texto', 'Botão ou próximo passo', 'Quem escreve', 'Flesch']}
      linhas={textos.map((t) => {
        const indice = contarPalavras(t.texto) < MINIMO_DE_PALAVRAS ? null : fleschPt(t.texto);
        return [
          t.situacao,
          t.texto,
          t.acao ?? '',
          t.dono === 'interface' ? 'Interface' : 'Backend',
          indice === null ? (
            'Texto curto'
          ) : indice < 50 ? (
            // Só texto da interface reprova a conferência das páginas. Texto do backend fica marcado para a #23.
            <strong key="f" {...(t.dono === 'interface' ? { 'data-abaixo-da-meta': '' } : {})}>
              {Math.round(indice)} (abaixo da meta)
            </strong>
          ) : (
            String(Math.round(indice))
          ),
        ];
      })}
    />
  );
}
