import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Dialog, DialogTrigger } from './Dialog';

const meta = {
  title: 'Componentes/Primitivos/Dialog',
  component: Dialog,
  args: { titulo: 'Apagar a lista?', children: null },
  render: (args) => (
    <DialogTrigger>
      <Button variante="perigo">Apagar tudo</Button>
      <Dialog {...args}>
        {({ fechar }) => (
          <>
            <p className="text-corpo">Os remédios saem deste aparelho. Não dá para desfazer.</p>
            <div className="flex flex-wrap gap-3">
              <Button variante="perigo" onPress={fechar}>
                Sim, apagar a lista
              </Button>
              <Button variante="secundaria" onPress={fechar}>
                Manter a lista
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Aberto: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const dialogo = await pagina.findByRole('dialog', { name: 'Apagar a lista?' });
    // Espera o fim da animação de entrada (250ms, ou 0ms com movimento reduzido).
    await waitFor(() => expect(dialogo).toBeVisible());
    await expect(pagina.getByRole('button', { name: 'Fechar' })).toBeVisible();
  },
};

export const Confirmacao: Story = {
  name: 'Confirmação (alertdialog)',
  args: { papel: 'alertdialog' },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const dialogo = await pagina.findByRole('alertdialog', { name: 'Apagar a lista?' });
    await waitFor(() => expect(dialogo).toBeVisible());
    await userEvent.click(pagina.getByRole('button', { name: 'Manter a lista' }));
    await waitFor(() => expect(pagina.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};
