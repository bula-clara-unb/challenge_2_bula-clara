import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { sugestoesDePerguntarMais } from './perguntarMais';
import { SourceChip, SuggestionChip } from './SourceChip';

const meta = {
  title: 'Componentes/Domínio/SourceChip',
  component: SourceChip,
  args: { numero: 1, remedio: 'Losartana', secao: 4, onPress: fn() },
} satisfies Meta<typeof SourceChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const DuasFontes: Story = {
  name: 'Duas fontes',
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <SourceChip {...args} />
      <SourceChip numero={2} remedio="Ibuprofeno" secao={4} onPress={args.onPress} />
    </div>
  ),
};

export const Sugestoes: Story = {
  name: 'Sugestões de Perguntar mais',
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {sugestoesDePerguntarMais({
        remedio: { nome: 'Losartana', artigo: 'a' },
        outros: ['Paracetamol'],
        pergunta: 'Posso tomar ibuprofeno com losartana?',
      }).map((sugestao) => (
        <SuggestionChip key={sugestao} onPress={args.onPress}>
          {sugestao}
        </SuggestionChip>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(3);
  },
};

export const AltoContraste: Story = {
  name: 'Alto contraste',
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('button')).borderTopWidth).toBe('2px');
  },
};
