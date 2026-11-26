import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ComboBox, type OpcaoComboBox } from './ComboBox';

const remedios: OpcaoComboBox[] = [
  { id: 'losartana', rotulo: 'Losartana' },
  { id: 'dipirona', rotulo: 'Dipirona Sódica' },
  { id: 'hidroclorotiazida', rotulo: 'Hidroclorotiazida' },
  { id: 'varfarina', rotulo: 'Varfarina' },
  { id: 'omeprazol', rotulo: 'Omeprazol' },
];

const meta = {
  title: 'Componentes/Primitivos/ComboBox',
  component: ComboBox<OpcaoComboBox>,
  args: {
    rotulo: 'Adicionar remédio',
    exemplo: 'ex.: metformina',
    opcoes: remedios,
    textoSemResultado: 'Esse remédio ainda não está na base.',
  },
} satisfies Meta<typeof ComboBox<OpcaoComboBox>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: 'Padrão' };

export const Aberto: Story = {
  name: 'Aberto, filtrando',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'ar');
    const lista = within(canvasElement.ownerDocument.body);
    const opcoes = await lista.findAllByRole('option');
    await expect(opcoes.map((o) => o.textContent)).toEqual(['Losartana', 'Varfarina']);
    for (const opcao of opcoes) {
      await expect(opcao.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
  },
};

export const ErroDeDigitacao: Story = {
  name: 'Com erro de digitação',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'lozartana');
    const lista = within(canvasElement.ownerDocument.body);
    const opcoes = await lista.findAllByRole('option');
    await expect(opcoes.map((o) => o.textContent)).toEqual(['Losartana']);
  },
};

export const SemResultado: Story = {
  name: 'Sem resultado',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'xyz');
    const lista = within(canvasElement.ownerDocument.body);
    await expect(await lista.findByText('Esse remédio ainda não está na base.')).toBeVisible();
  },
};
