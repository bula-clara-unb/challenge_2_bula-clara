import type { ReactNode } from 'react';

export interface TabelaProps {
  /** Vira o <caption>: o leitor de tela anuncia o nome da tabela antes das linhas. */
  titulo: string;
  colunas: string[];
  /** A primeira célula de cada linha vira o cabeçalho da linha. */
  linhas: ReactNode[][];
}

// O MDX do Storybook não traz tabelas em Markdown (precisaria do remark-gfm),
// então as páginas usam esta tabela, com cabeçalhos de linha e de coluna.
export function Tabela({ titulo, colunas, linhas }: TabelaProps) {
  return (
    // Tabela larga rola para o lado. Quem usa só o teclado precisa poder focar a área para rolar,
    // por isso ela é uma região com nome e tabIndex (regra scrollable-region-focusable do axe).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- região rolável precisa de foco
    <div role="region" aria-label={titulo} tabIndex={0} className="my-6 overflow-x-auto rounded-aviso focus-visible:foco-visivel">
      <table className="w-full border-collapse text-left text-apoio">
        <caption className="mb-2 text-left font-bold">{titulo}</caption>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna}
                scope="col"
                className="border-b-2 border-text-default bg-surface-info p-2 align-bottom font-bold"
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-b border-border-subtle">
              {linha.map((celula, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="p-2 align-top font-bold">
                    {celula}
                  </th>
                ) : (
                  <td key={j} className="p-2 align-top">
                    {celula}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
