import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AnswerHeadline } from '../../components/AnswerHeadline';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { EmergencyBar } from '../../components/EmergencyBar';
import { EmergencyCard, type EmergencyCardProps } from '../../components/EmergencyCard';
import { autolesao, intoxicacao } from '../../components/EmergencyCard/exemplos';
import { Text } from '../../components/Text';

interface TelaDeEmergenciaProps {
  pergunta: string;
  cartao: EmergencyCardProps;
}

/**
 * Quando a categoria_risco é "emergencia", a resposta inteira vira o cartão. A faixa continua no
 * topo, e o aviso legal no fim.
 */
function TelaDeEmergencia({ pergunta, cartao }: TelaDeEmergenciaProps) {
  return (
    <div className="flex flex-col gap-4">
      <EmergencyBar />
      <div className="flex flex-col gap-1">
        <Text variante="rotulo">Sua pergunta</Text>
        <Text>“{pergunta}”</Text>
      </div>
      <EmergencyCard {...cartao} nivelTitulo={1} />
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </div>
  );
}

const meta = {
  title: 'Padrões/Emergência',
  component: TelaDeEmergencia,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TelaDeEmergencia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Intoxicacao: Story = {
  name: 'Intoxicação',
  args: { pergunta: 'Meu neto engoliu uns comprimidos da minha cartela', cartao: intoxicacao },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    await expect(canvas.getByRole('link', { name: 'Emergência? Ligue 192' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(intoxicacao.titulo);
    // Nenhuma resposta comum aparece junto.
    await expect(canvas.queryByRole('button', { name: 'Ouvir resposta' })).toBeNull();
  },
};

export const Autolesao: Story = {
  name: 'Autolesão',
  args: { pergunta: 'Não aguento mais, quero acabar com a minha vida', cartao: autolesao },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    const ligar = canvas.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('tel:1'));
    await expect(ligar.map((link) => link.getAttribute('href'))).toEqual(['tel:192', 'tel:188', 'tel:192']);
    await expect(canvas.queryByText('Enquanto espera')).toBeNull();
  },
};

export const NoHistorico: Story = {
  name: 'Depois de uma resposta comum',
  args: { pergunta: 'Tomei a cartela toda de dipirona', cartao: intoxicacao },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <EmergencyBar />
      <AnswerHeadline pergunta="Para que serve a dipirona?">A dipirona serve para aliviar a dor e baixar a febre.</AnswerHeadline>
      <EmergencyCard {...args.cartao} />
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
  },
};
