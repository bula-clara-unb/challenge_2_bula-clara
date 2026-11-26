import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';
import { AnswerHeadline } from '../../components/AnswerHeadline';
import { DemoTrace } from '../../components/DemoTrace';
import { traceDeExemplo } from '../../components/DemoTrace/exemplos';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { InteractionCallout } from '../../components/InteractionCallout';
import { ListenButton } from '../../components/ListenButton';
import { LoadingStatus } from '../../components/LoadingStatus';
import { Prose } from '../../components/Prose';
import { ProvenanceSeal } from '../../components/ProvenanceSeal';
import { ReasoningSteps } from '../../components/ReasoningSteps';
import { passosDeExemplo } from '../../components/ReasoningSteps/exemplos';
import { SourceChip, SuggestionChip, sugestoesDePerguntarMais } from '../../components/SourceChip';
import { Text } from '../../components/Text';
import { simularVozes, VOZ_LOCAL } from '../../test/stubs';

const frase = 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.';
const explicacao = [
  'A bula da losartana diz que anti-inflamatórios, como o ibuprofeno, podem diminuir o efeito do remédio para pressão.',
  'Em algumas pessoas, usar os dois juntos também pode prejudicar os rins, principalmente em quem já tem problema renal ou é mais velho.',
  'A bula do ibuprofeno pede cuidado em quem usa remédios para pressão.',
];

interface BlocoDeRespostaProps {
  /** Abrir a ficha do remédio na seção citada (estado de navegação, nunca URL com o nome). */
  onAbrirFicha: (remedio: string, secao: number) => void;
  onPerguntar: (pergunta: string) => void;
  focarAoMontar?: boolean;
  /** Só no modo demonstração (?demo=1). */
  demonstracao?: boolean;
}

/** As 10 camadas da resposta, na ordem da spec. Cada camada só aparece quando há dados. */
function BlocoDeResposta({ onAbrirFicha, onPerguntar, focarAoMontar = false, demonstracao = false }: BlocoDeRespostaProps) {
  const sugestoes = sugestoesDePerguntarMais({
    remedio: { nome: 'Losartana', artigo: 'a' },
    outros: ['Paracetamol'],
    pergunta: 'Posso tomar ibuprofeno com losartana?',
  });
  return (
    // <article>, e não <section> com nome: cada resposta do histórico é um bloco completo, e várias
    // regiões chamadas "Resposta" na mesma tela confundiriam a navegação por regiões.
    <article className="flex max-w-medida flex-col gap-6">
      {/* 1 e 2: a pergunta, os remédios considerados e a frase-resposta */}
      <AnswerHeadline
        pergunta="Posso tomar ibuprofeno com losartana?"
        consideradosTambem={['Metformina']}
        focarAoMontar={focarAoMontar}
      >
        {frase}
      </AnswerHeadline>
      {/* 3: Ouvir */}
      <ListenButton texto={[frase, ...explicacao].join(' ')} />
      {/* 4: as interações, as com frase achada primeiro */}
      <div className="flex flex-col gap-3">
        <InteractionCallout
          remedios={['Losartana', 'Ibuprofeno']}
          secao="precaucoes_interacoes"
          evidencia={{
            frase: 'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana.',
            remedio: 'Losartana',
          }}
        />
        <InteractionCallout remedios={['Ibuprofeno', 'Metformina']} secao={null} />
      </div>
      {/* 5: a explicação com as citações */}
      <Prose>
        <p>
          {explicacao[0]} <sup>[1]</sup>
        </p>
        <p>
          {explicacao[1]} <sup>[1]</sup>
        </p>
        <p>
          {explicacao[2]} <sup>[2]</sup>
        </p>
      </Prose>
      {/* 6: os chips de seção */}
      <div className="flex flex-wrap gap-2">
        <SourceChip numero={1} remedio="Losartana" secao={4} onPress={() => onAbrirFicha('losartana', 4)} />
        <SourceChip numero={2} remedio="Ibuprofeno" secao={4} onPress={() => onAbrirFicha('ibuprofeno', 4)} />
      </div>
      {/* 7: o selo de procedência */}
      <ProvenanceSeal
        bulas={[
          { remedio: 'Losartana', versao: '03/2025' },
          { remedio: 'Ibuprofeno', versao: '11/2024' },
        ]}
      />
      {/* 8: como chegamos nesta resposta (e o trace, só no modo demonstração) */}
      <ReasoningSteps passos={passosDeExemplo} />
      {demonstracao ? <DemoTrace {...traceDeExemplo} /> : null}
      {/* 9: Perguntar mais, de modelos fixos */}
      <div className="flex flex-col gap-2">
        <Text variante="rotulo" elemento="p">
          Perguntar mais
        </Text>
        <div className="flex flex-wrap gap-2">
          {sugestoes.map((sugestao) => (
            <SuggestionChip key={sugestao} onPress={() => onPerguntar(sugestao)}>
              {sugestao}
            </SuggestionChip>
          ))}
        </div>
      </div>
      {/* 10: o aviso legal */}
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </article>
  );
}

const ETAPAS = ['Identificando os remédios…', 'Lendo a bula da losartana…', 'Checando interações…', 'Conferindo a segurança…'];

/** A espera e a chegada: o status muda na região aria-live e, quando a resposta chega, o foco vai para ela. */
function Chegada(props: BlocoDeRespostaProps) {
  const [etapa, setEtapa] = useState(0);
  const chegou = etapa >= ETAPAS.length;
  useEffect(() => {
    if (chegou) return;
    const espera = setTimeout(() => setEtapa((atual) => atual + 1), 120);
    return () => clearTimeout(espera);
  }, [chegou, etapa]);
  return (
    <div className="flex flex-col gap-6">
      {chegou ? <BlocoDeResposta {...props} focarAoMontar /> : null}
      <LoadingStatus>{chegou ? '' : ETAPAS[etapa]}</LoadingStatus>
    </div>
  );
}

const meta = {
  title: 'Padrões/Bloco de resposta',
  component: BlocoDeResposta,
  args: { onAbrirFicha: fn(), onPerguntar: fn() },
  beforeEach: () => simularVozes([VOZ_LOCAL]).desfazer,
} satisfies Meta<typeof BlocoDeResposta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {
  play: async ({ canvas, args }) => {
    // As camadas aparecem na ordem da spec.
    const camadas = [
      canvas.getByText('Sua pergunta'),
      canvas.getByRole('heading', { name: frase }),
      canvas.getByRole('button', { name: 'Ouvir resposta' }),
      canvas.getAllByRole('note')[0],
      canvas.getByText(explicacao[0] ?? '', { exact: false }),
      canvas.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' }),
      canvas.getByText(/^Bula oficial ANVISA/),
      canvas.getByRole('button', { name: 'Como chegamos nesta resposta' }),
      canvas.getByText('Perguntar mais'),
      canvas.getByText(avisoLegal),
    ];
    for (let i = 1; i < camadas.length; i++) {
      const antes = camadas[i - 1] as Node;
      await expect(antes.compareDocumentPosition(camadas[i] as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    canvas.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' }).click();
    await expect(args.onAbrirFicha).toHaveBeenCalledWith('losartana', 4);
    await expect(canvas.getAllByRole('button', { name: /^(Como tomar|Para que serve|E com)/ })).toHaveLength(3);
  },
};

export const Chegando: Story = {
  name: 'Carregando e chegando',
  render: (args) => <Chegada {...args} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[aria-live]')).toHaveLength(1);
    await waitFor(() => expect(canvas.getByRole('heading', { name: frase })).toHaveFocus(), { timeout: 3000 });
    // Na chegada, a região aria-live fica vazia: a resposta é lida a partir do foco, uma vez só.
    await expect(canvasElement.querySelector('[aria-live]')).toBeEmptyDOMElement();
  },
};

export const ModoDemonstracao: Story = {
  name: 'No modo demonstração',
  args: { demonstracao: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Modo demonstração: o que os agentes fizeram' })).toBeInTheDocument();
  },
};

export const AltoContrasteETextoGrande: Story = {
  name: 'Alto contraste e texto em 140%',
  globals: { contraste: 'alto', escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
