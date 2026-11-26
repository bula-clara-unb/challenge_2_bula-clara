import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { simularAudio, simularVozes, VOZ_LOCAL, VOZ_REMOTA, type VozesSimuladas } from '../../test/stubs';
import { ListenButton } from './ListenButton';

// Nada toca de verdade: a voz e o áudio são simulados (o Chromium sem interface não tem voz).
let vozes: VozesSimuladas | undefined;

const meta = {
  title: 'Componentes/Domínio/ListenButton',
  component: ListenButton,
  args: { texto: 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.' },
  beforeEach: () => {
    vozes = simularVozes([VOZ_REMOTA, VOZ_LOCAL]);
    return vozes.desfazer;
  },
} satisfies Meta<typeof ListenButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Parado: Story = {};

export const Tocando: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir resposta' }));
    await expect(await canvas.findByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    await expect(vozes?.falas[0]?.voice).toBe(VOZ_LOCAL);
  },
};

export const Pausado: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir resposta' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Pausar' }));
    await expect(canvas.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  },
};

export const Carregando: Story = {
  name: 'Carregando o áudio do servidor',
  args: { obterAudio: () => new Promise<Blob>(() => undefined) },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir resposta' }));
    await expect(canvas.getByRole('button', { name: 'Preparando o áudio…' })).toBeInTheDocument();
  },
};

export const DoServidor: Story = {
  name: 'Áudio do servidor, na ficha',
  args: { rotulo: 'Ouvir esta página', obterAudio: async () => new Blob(['áudio'], { type: 'audio/wav' }) },
  beforeEach: () => simularAudio().desfazer,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir esta página' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Pausar' })).toBeInTheDocument());
  },
};

export const SemVoz: Story = {
  name: 'Sem voz permitida: não aparece',
  beforeEach: () => {
    vozes?.trocarVozes([VOZ_REMOTA]);
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};
