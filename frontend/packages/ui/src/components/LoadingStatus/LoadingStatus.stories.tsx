import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { LoadingStatus } from './LoadingStatus';

const meta = {
  title: 'Componentes/Domínio/LoadingStatus',
  component: LoadingStatus,
  args: { children: 'Lendo a bula da losartana…' },
} satisfies Meta<typeof LoadingStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

const ETAPAS = ['Identificando os remédios…', 'Lendo a bula…', 'Checando interações…', 'Conferindo a segurança…'];

function Etapas() {
  const [etapa, setEtapa] = useState(0);
  useEffect(() => {
    if (etapa >= ETAPAS.length - 1) return;
    const espera = setTimeout(() => setEtapa((atual) => atual + 1), 150);
    return () => clearTimeout(espera);
  }, [etapa]);
  return <LoadingStatus>{ETAPAS[etapa]}</LoadingStatus>;
}

export const EtapaPorEtapa: Story = {
  name: 'Etapa por etapa',
  render: () => <Etapas />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText('Conferindo a segurança…')).toBeInTheDocument());
  },
};
