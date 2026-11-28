import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmergencyBar } from '../../components/EmergencyBar';
import { Heading } from '../../components/Heading';
import { InputDock } from '../../components/InputDock';
import { MedicationList, TEXTOS_DO_CONSENTIMENTO, type RemedioDaLista } from '../../components/MedicationList';
import { baseDeRemedios, listaDeExemplo } from '../../components/MedicationList/exemplos';
import { Text } from '../../components/Text';
import { ToastRegion } from '../../components/Toast';

interface MeusRemediosProps {
  inicial: RemedioDaLista[];
  /** O que o app faria com o armazenamento. Aqui só registra, sem gravar nada. */
  onGuardar: (onde: 'sessionStorage' | 'localStorage', lista: RemedioDaLista[]) => void;
  onLimparDoAparelho: () => void;
}

/**
 * A tela Meus remédios. A regra de guardar é do app: sessionStorage por padrão, localStorage só com o
 * consentimento ligado, e desligar limpa o localStorage na hora. Aqui as chamadas só são registradas.
 */
function MeusRemedios({ inicial, onGuardar, onLimparDoAparelho }: MeusRemediosProps) {
  const [remedios, setRemedios] = useState(inicial);
  const [lembrar, setLembrar] = useState(false);
  const mudar = (lista: RemedioDaLista[]) => {
    setRemedios(lista);
    onGuardar(lembrar ? 'localStorage' : 'sessionStorage', lista);
  };
  return (
    <div className="flex flex-col gap-4">
      <EmergencyBar />
      <div className="flex flex-col gap-4 px-4">
        <Heading nivel={1}>Meus remédios</Heading>
        <Text>Uso esta lista para checar interações em cada pergunta.</Text>
        <MedicationList
          remedios={remedios}
          opcoes={baseDeRemedios}
          onAdicionar={(remedio) => mudar([...remedios, remedio])}
          onRemover={(id) => mudar(remedios.filter((remedio) => remedio.id !== id))}
          lembrar={lembrar}
          onLembrarChange={(ligado) => {
            setLembrar(ligado);
            if (ligado) onGuardar('localStorage', remedios);
            else onLimparDoAparelho();
          }}
          onApagarTudo={() => {
            setRemedios([]);
            onLimparDoAparelho();
          }}
        />
      </div>
      <InputDock
        mostrarCaixa={false}
        destinoAtual="remedios"
        enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
        onPerguntar={() => undefined}
        onAbrirCamera={() => undefined}
        onGravar={() => undefined}
      />
      <ToastRegion />
    </div>
  );
}

const meta = {
  title: 'Padrões/Consentimento',
  component: MeusRemedios,
  parameters: { layout: 'fullscreen' },
  args: { inicial: listaDeExemplo, onGuardar: fn(), onLimparDoAparelho: fn() },
} satisfies Meta<typeof MeusRemedios>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComecaDesligado: Story = {
  name: 'Começa desligado',
  play: async ({ canvas }) => {
    const interruptor = canvas.getByRole('switch', { name: 'Lembrar neste aparelho' });
    await expect(interruptor).not.toBeChecked();
    await expect(interruptor).toHaveAccessibleDescription(TEXTOS_DO_CONSENTIMENTO.desligado);
  },
};

export const LigarEDesligar: Story = {
  name: 'Ligar e desligar',
  play: async ({ canvas, args }) => {
    const interruptor = canvas.getByRole('switch', { name: 'Lembrar neste aparelho' });
    await userEvent.click(interruptor);
    await expect(args.onGuardar).toHaveBeenCalledWith('localStorage', listaDeExemplo);
    await userEvent.click(interruptor);
    await expect(args.onLimparDoAparelho).toHaveBeenCalledOnce();
  },
};

export const ApagarTudo: Story = {
  name: 'Apagar tudo',
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    await expect(args.onLimparDoAparelho).toHaveBeenCalledOnce();
    const pagina = within(canvasElement.ownerDocument.body);
    await expect(await pagina.findByText(TEXTOS_DO_CONSENTIMENTO.apagada)).toBeVisible();
    await userEvent.click(pagina.getByRole('button', { name: 'Fechar' }));
  },
};
