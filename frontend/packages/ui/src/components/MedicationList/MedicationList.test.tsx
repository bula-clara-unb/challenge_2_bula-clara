import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { filaDeToasts } from '../Toast';
import { baseDeRemedios, listaDeExemplo } from './exemplos';
import { MedicationList, TEXTOS_DO_CONSENTIMENTO, type RemedioDaLista } from './MedicationList';

function ComEstado({ inicial = listaDeExemplo, onApagarTudo = () => undefined }: { inicial?: RemedioDaLista[]; onApagarTudo?: () => void }) {
  const [remedios, setRemedios] = useState(inicial);
  const [lembrar, setLembrar] = useState(false);
  return (
    <MedicationList
      remedios={remedios}
      opcoes={baseDeRemedios}
      onAdicionar={(remedio) => setRemedios((atual) => [...atual, remedio])}
      onRemover={(id) => setRemedios((atual) => atual.filter((remedio) => remedio.id !== id))}
      lembrar={lembrar}
      onLembrarChange={setLembrar}
      onApagarTudo={() => {
        onApagarTudo();
        setRemedios([]);
      }}
    />
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  act(() => filaDeToasts.clear());
});

describe('MedicationList', () => {
  it('lista os remédios com um botão de remover para cada um', () => {
    render(<ComEstado />);
    const lista = screen.getByRole('list', { name: 'Remédios da lista' });
    expect(lista.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remover losartana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover metformina' })).toBeInTheDocument();
  });

  it('remove e leva o foco para o próximo item, e depois para a busca', async () => {
    render(<ComEstado />);
    await userEvent.click(screen.getByRole('button', { name: 'Remover losartana' }));
    expect(screen.queryByText('Losartana')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover metformina' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Remover metformina' }));
    expect(screen.getByRole('combobox', { name: 'Adicionar remédio' })).toHaveFocus();
    expect(screen.getByText('Nenhum remédio na lista.')).toBeInTheDocument();
  });

  it('adiciona pela busca tolerante a erro e limpa o campo', async () => {
    render(<ComEstado inicial={[]} />);
    const busca = screen.getByRole('combobox', { name: 'Adicionar remédio' });
    await userEvent.type(busca, 'sinvastatna');
    await userEvent.click(await screen.findByRole('option', { name: 'Sinvastatina' }));
    expect(await screen.findByRole('button', { name: 'Remover sinvastatina' })).toBeInTheDocument();
    const novaBusca = screen.getByRole('combobox', { name: 'Adicionar remédio' });
    expect(novaBusca).toHaveValue('');
    expect(novaBusca).toHaveFocus();
    expect(novaBusca).toHaveAttribute('aria-expanded', 'false');
  });

  it('não oferece o que já está na lista', async () => {
    render(<ComEstado />);
    await userEvent.type(screen.getByRole('combobox'), 'losartana');
    expect(screen.queryByRole('option', { name: 'Losartana' })).not.toBeInTheDocument();
  });

  it('o consentimento começa desligado, com o texto aprovado', async () => {
    render(<ComEstado />);
    const interruptor = screen.getByRole('switch', { name: 'Lembrar neste aparelho' });
    expect(interruptor).not.toBeChecked();
    expect(interruptor).toHaveAccessibleDescription(TEXTOS_DO_CONSENTIMENTO.desligado);
    await userEvent.click(interruptor);
    expect(interruptor).toBeChecked();
    expect(interruptor).toHaveAccessibleDescription(TEXTOS_DO_CONSENTIMENTO.ligado);
  });

  it('"Apagar tudo" usa a variante de perigo, apaga e confirma com o Toast', async () => {
    const apagou = vi.fn();
    render(<ComEstado onApagarTudo={apagou} />);
    const botao = screen.getByRole('button', { name: 'Apagar tudo' });
    expect(botao).toHaveClass('text-danger-text');
    await userEvent.click(botao);
    expect(apagou).toHaveBeenCalledOnce();
    expect(filaDeToasts.visibleToasts.map((toast) => toast.content.mensagem)).toEqual(['Lista apagada deste aparelho.']);
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('"Apagar tudo" só aparece com a lista cheia, como na tela aprovada', () => {
    render(<ComEstado inicial={[]} />);
    expect(screen.queryByRole('button', { name: 'Apagar tudo' })).not.toBeInTheDocument();
  });

  it('não grava nada no navegador: guardar é do app', async () => {
    const gravar = vi.spyOn(Storage.prototype, 'setItem');
    render(<ComEstado />);
    await userEvent.click(screen.getByRole('switch'));
    await userEvent.click(screen.getByRole('button', { name: 'Remover losartana' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(gravar).not.toHaveBeenCalled();
  });
});
