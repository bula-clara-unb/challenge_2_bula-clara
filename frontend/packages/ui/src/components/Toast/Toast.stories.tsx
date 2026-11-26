import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { confirmarAcao, ToastRegion } from './Toast';

const meta = {
  title: 'Componentes/Primitivos/Toast',
  component: ToastRegion,
  render: () => (
    <>
      <Button variante="perigo" onPress={() => confirmarAcao('Lista apagada deste aparelho.')}>
        Apagar tudo
      </Button>
      <ToastRegion />
    </>
  ),
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmaAcao: Story = {
  name: 'Confirma uma ação',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    const pagina = within(canvasElement.ownerDocument.body);
    await expect(await pagina.findByText('Lista apagada deste aparelho.')).toBeVisible();
    await userEvent.click(pagina.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(pagina.queryByText('Lista apagada deste aparelho.')).not.toBeInTheDocument());
  },
};
