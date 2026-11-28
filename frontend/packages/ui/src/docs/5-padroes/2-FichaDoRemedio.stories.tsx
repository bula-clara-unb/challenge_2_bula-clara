import { ArrowLeft } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from '../../components/Button';
import { Accordion, Disclosure } from '../../components/Disclosure';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { Heading } from '../../components/Heading';
import { ListenButton } from '../../components/ListenButton';
import { ProvenanceSeal } from '../../components/ProvenanceSeal';
import { SECOES_DA_BULA } from '../../components/SourceChip';
import { Text } from '../../components/Text';
import { simularVozes, VOZ_LOCAL } from '../../test/stubs';

// No app, o texto de cada seção vem do GET /medicamentos/{nome} (issue #22), já em linguagem simples.
const textoDaSecao: Record<number, string> = {
  1: 'A losartana serve para tratar a pressão alta.',
  4: 'Avise o médico se você tem problema nos rins ou no fígado.',
};

interface FichaProps {
  /** A seção citada na resposta, que abre sozinha. */
  secaoCitada: number;
  /** A frase da bula usada na resposta, destacada dentro da seção citada. */
  fraseCitada?: string;
  /** Data da versão da bula, ou null quando não há. */
  versao: string | null;
  onVoltar: () => void;
}

/** Ficha do remédio: nome, selo, "Ouvir esta página" e as 9 seções como perguntas, num acordeão. */
function FichaDoRemedio({ secaoCitada, fraseCitada, versao, onVoltar }: FichaProps) {
  const leitura = SECOES_DA_BULA.map((secao) => `${secao.pergunta} ${textoDaSecao[secao.numero] ?? ''}`).join(' ');
  return (
    <div className="flex max-w-medida flex-col gap-4">
      <div>
        <Button variante="discreta" icone={ArrowLeft} onPress={onVoltar}>
          Voltar
        </Button>
      </div>
      <Heading nivel={1}>Losartana</Heading>
      <ProvenanceSeal bulas={[{ versao }]} />
      <ListenButton texto={`Losartana. ${leitura}`} rotulo="Ouvir esta página" />
      <Text variante="rotulo" elemento="p">
        Nesta bula
      </Text>
      <Accordion defaultExpandedKeys={[String(secaoCitada)]}>
        {SECOES_DA_BULA.map((secao) => (
          <Disclosure key={secao.numero} id={String(secao.numero)} titulo={`${secao.numero}. ${secao.pergunta}`} nivelTitulo={2}>
            {secao.numero === secaoCitada && fraseCitada ? (
              <div className="flex flex-col gap-2">
                <Text variante="rotulo" elemento="p">
                  Citado na sua resposta
                </Text>
                <p>
                  <mark className="bg-caution-bg text-caution-text">“{fraseCitada}”</mark>
                </p>
                {textoDaSecao[secao.numero] ? <p>{textoDaSecao[secao.numero]}</p> : null}
              </div>
            ) : (
              <p>{textoDaSecao[secao.numero] ?? `Texto da seção ${secao.numero} da bula, em linguagem simples.`}</p>
            )}
          </Disclosure>
        ))}
      </Accordion>
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </div>
  );
}

const meta = {
  title: 'Padrões/Ficha do remédio',
  component: FichaDoRemedio,
  args: {
    secaoCitada: 4,
    versao: '03/2025',
    fraseCitada:
      'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana. O uso junto também pode piorar a função dos rins.',
    onVoltar: fn(),
  },
  beforeEach: () => simularVozes([VOZ_LOCAL]).desfazer,
} satisfies Meta<typeof FichaDoRemedio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AbertaNaSecaoCitada: Story = {
  name: 'Aberta na seção citada',
  play: async ({ canvas }) => {
    const secoes = canvas.getAllByRole('button', { name: /^\d\. / });
    await expect(secoes).toHaveLength(9);
    await expect(canvas.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: '1. Para que serve?' })).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText('Citado na sua resposta')).toBeVisible();
    await expect(canvas.getByText(/Anti-inflamatórios, como o ibuprofeno/).tagName).toBe('MARK');
    await expect(canvas.getByText('Bula oficial ANVISA · versão de 03/2025')).toBeInTheDocument();
  },
};

export const OutraSecao: Story = {
  name: 'Abrindo outra seção',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '6. Como devo usar?' }));
    // Abrir uma seção não fecha a citada.
    await expect(canvas.getByRole('button', { name: '6. Como devo usar?' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute('aria-expanded', 'true');
  },
};

export const SemData: Story = {
  name: 'Bula sem data, em alto contraste',
  args: { versao: null },
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Bula oficial ANVISA · data da versão não informada')).toBeInTheDocument();
  },
};
