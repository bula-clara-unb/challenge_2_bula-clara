import { Check, X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

export interface FacaNaoFacaProps {
  faca: ReactNode[];
  naoFaca: ReactNode[];
}

// O título de cada coluna diz "Faça" ou "Não faça" por escrito: a cor e o ícone só reforçam.
// Sem verde e sem vermelho, porque aqui ninguém está em perigo.
function Coluna({ titulo, itens, icone }: { titulo: string; itens: ReactNode[]; icone: 'faca' | 'nao' }) {
  const Icone = icone === 'faca' ? Check : X;
  return (
    <div
      className={`flex-1 rounded-painel border-2 p-4 ${icone === 'faca' ? 'border-action-primary' : 'border-text-muted'}`}
    >
      <p className="mb-2 flex items-center gap-2 font-bold">
        <Icone size={24} weight="bold" aria-hidden="true" focusable="false" />
        {titulo}
      </p>
      <ul className="flex list-none flex-col gap-3 p-0">
        {itens.map((item, i) => (
          <li key={i} className="m-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FacaNaoFaca({ faca, naoFaca }: FacaNaoFacaProps) {
  return (
    <div className="my-6 flex flex-col gap-4 sm:flex-row">
      <Coluna titulo="Faça" itens={faca} icone="faca" />
      <Coluna titulo="Não faça" itens={naoFaca} icone="nao" />
    </div>
  );
}
