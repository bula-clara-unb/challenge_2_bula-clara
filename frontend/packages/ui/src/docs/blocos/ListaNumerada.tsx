import type { ReactNode } from 'react';

// O reset do Tailwind tira os números de <ol>, e o Storybook não devolve.
// Envolva a lista numerada em Markdown com este bloco, deixando uma linha em branco antes e depois.
export function ListaNumerada({ children }: { children: ReactNode }) {
  return <div className="[&_ol]:list-decimal [&_ol]:ps-8">{children}</div>;
}
