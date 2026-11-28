import { Camera, Info, Microphone } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from '../../components/Button';
import { EmergencyBar } from '../../components/EmergencyBar';
import { Heading } from '../../components/Heading';
import { InputDock } from '../../components/InputDock';
import { SuggestionChip } from '../../components/SourceChip';
import { Text } from '../../components/Text';

const EXEMPLOS = [
  'Posso tomar ibuprofeno com losartana?',
  'Para que serve a losartana?',
  'Posso dobrar a dose da losartana?',
];

interface PrimeiraVisitaProps {
  onPerguntar: (pergunta: string) => void;
  onAbrirCamera: () => void;
  onGravar: () => void;
}

/** Perguntar, na primeira visita: nenhuma resposta ainda e a lista de remédios vazia. */
function PrimeiraVisita({ onPerguntar, onAbrirCamera, onGravar }: PrimeiraVisitaProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <EmergencyBar />
      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        <Heading nivel={1}>Tire sua dúvida sobre um remédio</Heading>
        <Text>Eu explico a bula oficial da ANVISA com palavras simples.</Text>
        <div className="flex flex-col gap-3">
          <Button larguraTotal icone={Camera} onPress={onAbrirCamera}>
            Fotografar a caixa
          </Button>
          <Button variante="secundaria" larguraTotal icone={Microphone} onPress={onGravar}>
            Perguntar falando
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Text variante="apoio">Ou toque num exemplo</Text>
          <div className="flex flex-col items-start gap-2">
            {EXEMPLOS.map((exemplo) => (
              <SuggestionChip key={exemplo} onPress={() => onPerguntar(exemplo)}>
                {exemplo}
              </SuggestionChip>
            ))}
          </div>
        </div>
        <Link
          href="#meus-remedios"
          className={
            'flex max-w-medida gap-3 rounded-controle border border-border-field p-4 text-text-default no-underline ' +
            'data-focus-visible:foco-visivel data-hovered:bg-action-primary-subtle alto-contraste:border-(length:--bc-borda-controle)'
          }
        >
          <Info size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0 text-action-primary" />
          <span className="flex flex-col gap-1">
            <b className="font-bold">Seus remédios: nenhum ainda</b>
            <span className="text-apoio text-text-muted">Adicione os remédios que você usa para eu checar interações.</span>
            <span className="font-bold text-action-primary underline underline-offset-3">Adicionar</span>
          </span>
        </Link>
      </main>
      <InputDock
        destinoAtual="perguntar"
        enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
        onPerguntar={onPerguntar}
        onAbrirCamera={onAbrirCamera}
        onGravar={onGravar}
      />
    </div>
  );
}

const meta = {
  title: 'Padrões/Primeira visita',
  component: PrimeiraVisita,
  parameters: { layout: 'fullscreen' },
  args: { onPerguntar: fn(), onAbrirCamera: fn(), onGravar: fn() },
} satisfies Meta<typeof PrimeiraVisita>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EstadoVazio: Story = {
  name: 'Estado vazio',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: 'Tire sua dúvida sobre um remédio' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Posso tomar ibuprofeno com losartana?' }));
    await expect(args.onPerguntar).toHaveBeenCalledWith('Posso tomar ibuprofeno com losartana?');
    // Câmera e microfone aparecem duas vezes: no corpo e na caixa de pergunta. Os dois abrem o mesmo fluxo.
    await expect(canvas.getAllByRole('button', { name: 'Fotografar a caixa' })).toHaveLength(2);
    await expect(canvas.getByRole('link', { name: /Seus remédios: nenhum ainda/ })).toBeInTheDocument();
  },
};

export const TextoGrande: Story = {
  name: 'Texto em 140%, alto contraste',
  globals: { escala: '140', contraste: 'alto' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
