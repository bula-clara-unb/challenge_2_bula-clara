import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

const meta = {
  title: 'Componentes/Primitivos/TextArea',
  component: TextArea,
  args: { rotulo: 'Sua pergunta', descricao: 'Escreva do seu jeito. Ex.: posso tomar losartana com café?' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: 'Padrão' };

export const ComErro: Story = { args: { isInvalid: true, mensagemErro: 'Escreva sua pergunta para continuar.' } };
