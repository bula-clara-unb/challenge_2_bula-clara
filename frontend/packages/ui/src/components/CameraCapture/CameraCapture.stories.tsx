import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { simularCamera } from '../../test/stubs';
import { CameraCapture } from './CameraCapture';

// A câmera é simulada: um canvas com o nome do remédio vira o fluxo de vídeo. Nada pede permissão.
const meta = {
  title: 'Componentes/Domínio/CameraCapture',
  component: CameraCapture,
  args: { onFoto: fn(), onFechar: fn(), onDigitar: fn() },
} satisfies Meta<typeof CameraCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visor: Story = {
  beforeEach: () => simularCamera('permitir').desfazer,
  play: async ({ canvas, args }) => {
    const tirar = canvas.getByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    await waitFor(() => expect(args.onFoto).toHaveBeenCalledOnce());
  },
};

export const Negada: Story = {
  name: 'Câmera negada',
  beforeEach: () => simularCamera('negar').desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('A câmera está bloqueada para o Bula Clara')).toBeVisible();
  },
};

export const SemCamera: Story = {
  name: 'Sem câmera',
  beforeEach: () => simularCamera('sem-dispositivo').desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Não achei uma câmera neste aparelho')).toBeVisible();
  },
};
