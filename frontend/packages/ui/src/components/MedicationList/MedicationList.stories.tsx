import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ToastRegion } from '../Toast';
import { baseDeRemedios, listaDeExemplo } from './exemplos';
import { MedicationList, type MedicationListProps } from './MedicationList';

// O estado fica na memória da story. Nada vai para sessionStorage nem localStorage.
function ComEstado(args: MedicationListProps) {
  const [remedios, setRemedios] = useState(args.remedios);
  const [lembrar, setLembrar] = useState(args.lembrar);
  return (
    <>
      <MedicationList
        {...args}
        remedios={remedios}
        lembrar={lembrar}
        onAdicionar={(remedio) => {
          args.onAdicionar(remedio);
          setRemedios((atual) => [...atual, remedio]);
        }}
        onRemover={(id) => {
          args.onRemover(id);
          setRemedios((atual) => atual.filter((remedio) => remedio.id !== id));
        }}
        onLembrarChange={(ligado) => {
          args.onLembrarChange(ligado);
          setLembrar(ligado);
        }}
        onApagarTudo={() => {
          args.onApagarTudo();
          setRemedios([]);
        }}
      />
      <ToastRegion />
    </>
  );
}

const meta = {
  title: 'Componentes/Domínio/MedicationList',
  component: MedicationList,
  args: {
    remedios: listaDeExemplo,
    opcoes: baseDeRemedios,
    lembrar: false,
    onAdicionar: fn(),
    onRemover: fn(),
    onLembrarChange: fn(),
    onApagarTudo: fn(),
  },
  render: (args) => <ComEstado {...args} />,
} satisfies Meta<typeof MedicationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComRemedios: Story = { name: 'Com remédios' };

export const Vazia: Story = { args: { remedios: [] } };

export const Adicionar: Story = {
  args: { remedios: [] },
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Adicionar remédio' }), 'lozartana');
    const pagina = within(canvasElement.ownerDocument.body);
    await userEvent.click(await pagina.findByRole('option', { name: 'Losartana' }));
    await expect(args.onAdicionar).toHaveBeenCalledWith({ id: 'losartana', nome: 'Losartana' });
    await expect(await canvas.findByRole('button', { name: 'Remover losartana' })).toBeInTheDocument();
  },
};

export const LembrarLigado: Story = {
  name: 'Lembrar neste aparelho ligado',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('switch', { name: 'Lembrar neste aparelho' }));
    await expect(args.onLembrarChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByText(/^Ligado: a lista fica salva só neste navegador/)).toBeVisible();
  },
};

export const ApagarTudo: Story = {
  name: 'Apagar tudo',
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    await expect(args.onApagarTudo).toHaveBeenCalledOnce();
    const pagina = within(canvasElement.ownerDocument.body);
    await expect(await pagina.findByText('Lista apagada deste aparelho.')).toBeVisible();
    await expect(canvas.getByText('Nenhum remédio na lista.')).toBeVisible();
    await userEvent.click(pagina.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(pagina.queryByText('Lista apagada deste aparelho.')).toBeNull());
  },
};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
