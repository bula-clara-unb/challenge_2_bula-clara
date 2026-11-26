import { Check } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { DialogTrigger } from '../Dialog';
import { Sheet } from './Sheet';

const meta = {
  title: 'Componentes/Primitivos/Sheet',
  component: Sheet,
  args: { rotulo: 'Li na caixa', titulo: 'Losartana potássica 50 mg', children: null },
  render: (args) => (
    <DialogTrigger>
      <Button variante="secundaria">Fotografar a caixa</Button>
      <Sheet {...args}>
        {({ fechar }) => (
          <>
            <p className="text-corpo">É esse o remédio?</p>
            <Button larguraTotal icone={Check} onPress={fechar}>
              Sim, perguntar sobre ele
            </Button>
            <Button larguraTotal variante="secundaria" onPress={fechar}>
              Não, vou digitar o nome
            </Button>
            <p className="text-apoio text-text-muted">A foto é usada só para ler o nome e não é guardada.</p>
          </>
        )}
      </Sheet>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmarFoto: Story = {
  name: 'Confirmar a foto',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: 'Losartana potássica 50 mg' });
    await waitFor(() => expect(folha).toBeVisible());
    // Depois de subir, a folha encosta na borda de baixo da tela.
    const painel = folha.parentElement as HTMLElement;
    await waitFor(() => expect(Math.round(painel.getBoundingClientRect().bottom)).toBe(window.innerHeight));
  },
};
