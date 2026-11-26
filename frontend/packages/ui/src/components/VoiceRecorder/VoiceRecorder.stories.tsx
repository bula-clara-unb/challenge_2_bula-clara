import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { simularMicrofone } from '../../test/stubs';
import { VoiceRecorder } from './VoiceRecorder';

// Microfone e gravador simulados: nada é gravado nem pede permissão.
const meta = {
  title: 'Componentes/Domínio/VoiceRecorder',
  component: VoiceRecorder,
  args: { onGravacao: fn(), onFechar: fn(), onEscrever: fn() },
} satisfies Meta<typeof VoiceRecorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gravando: Story = {
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Ouvindo… fale sua pergunta')).toBeVisible();
  },
};

export const Terminou: Story = {
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas, args }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Parar de gravar' }));
    await expect(args.onGravacao).toHaveBeenCalledOnce();
    await expect(canvas.getByText('Gravação terminada. Vou conferir o que entendi.')).toBeVisible();
  },
};

export const Negado: Story = {
  name: 'Microfone negado',
  beforeEach: () => simularMicrofone('negar').desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('O microfone está bloqueado para o Bula Clara')).toBeVisible();
  },
};
