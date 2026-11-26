import { Trash, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type Key } from 'react';
import { Button } from '../Button';
import { ComboBox, type OpcaoComboBox } from '../ComboBox';
import { IconButton } from '../IconButton';
import { Switch } from '../Switch';
import { confirmarAcao } from '../Toast';

export interface RemedioDaLista {
  /** O nome normalizado da base (`/medicamentos`), que vai em `medicamentos_em_uso`. */
  id: string;
  /** Como aparece na lista ("Losartana"). */
  nome: string;
}

export interface MedicationListProps {
  /** A lista atual. Quem guarda (sessionStorage ou localStorage) é o app, nunca o componente. */
  remedios: readonly RemedioDaLista[];
  /** Os remédios da base, para a busca tolerante a erro. */
  opcoes: readonly RemedioDaLista[];
  onAdicionar: (remedio: RemedioDaLista) => void;
  onRemover: (id: string) => void;
  /** Estado do consentimento "Lembrar neste aparelho". Começa desligado. */
  lembrar: boolean;
  /** Ao desligar, o app apaga a lista do localStorage na hora. */
  onLembrarChange: (ligado: boolean) => void;
  /** Apaga a lista. O componente confirma com o Toast "Lista apagada deste aparelho.". */
  onApagarTudo: () => void;
}

/** Os textos do consentimento, exatamente os das telas aprovadas. */
export const TEXTOS_DO_CONSENTIMENTO = {
  titulo: 'Lembrar neste aparelho',
  desligado:
    'Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor.',
  ligado: 'Ligado: a lista fica salva só neste navegador. Desligar apaga na hora.',
  apagada: 'Lista apagada deste aparelho.',
} as const;

type AlvoDoFoco = { tipo: 'remover'; id: string } | { tipo: 'busca' };

/** A lista "Meus remédios": busca, remoção, consentimento e "Apagar tudo". */
export function MedicationList({
  remedios,
  opcoes,
  onAdicionar,
  onRemover,
  lembrar,
  onLembrarChange,
  onApagarTudo,
}: MedicationListProps) {
  // Trocar a chave remonta a busca vazia e fechada depois de adicionar. Limpar o texto com a busca
  // em foco faria a lista de opções abrir de novo, com a base inteira.
  const [chaveDaBusca, setChaveDaBusca] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const focoPendente = useRef<AlvoDoFoco | null>(null);

  // Quando um item some, o foco iria para o fim da página. Ele vai para o próximo item, ou para a busca.
  useEffect(() => {
    const alvo = focoPendente.current;
    if (!alvo) return;
    focoPendente.current = null;
    const seletor =
      alvo.tipo === 'remover' ? `[data-remedio="${CSS.escape(alvo.id)}"] button` : 'input[role="combobox"]';
    const elemento = raiz.current?.querySelector<HTMLElement>(seletor);
    elemento?.focus();
  }, [remedios]);

  const naLista = new Set(remedios.map((remedio) => remedio.id));
  const disponiveis: OpcaoComboBox[] = opcoes
    .filter((opcao) => !naLista.has(opcao.id))
    .map((opcao) => ({ id: opcao.id, rotulo: opcao.nome }));

  function adicionar(chave: Key | null) {
    const escolhido = opcoes.find((opcao) => opcao.id === chave);
    if (!escolhido) return;
    focoPendente.current = { tipo: 'busca' };
    onAdicionar(escolhido);
    setChaveDaBusca((chave) => chave + 1);
  }

  function remover(posicao: number) {
    const proximo = remedios[posicao + 1] ?? remedios[posicao - 1];
    focoPendente.current = proximo ? { tipo: 'remover', id: proximo.id } : { tipo: 'busca' };
    const remedio = remedios[posicao];
    if (remedio) onRemover(remedio.id);
  }

  function apagarTudo() {
    focoPendente.current = { tipo: 'busca' };
    onApagarTudo();
    confirmarAcao(TEXTOS_DO_CONSENTIMENTO.apagada);
  }

  return (
    <div ref={raiz} className="flex max-w-medida flex-col gap-4">
      <ComboBox
        key={chaveDaBusca}
        rotulo="Adicionar remédio"
        exemplo="ex.: metformina"
        opcoes={disponiveis}
        textoSemResultado="Não achei esse remédio. Confira o nome na caixa."
        selectedKey={null}
        onSelectionChange={adicionar}
      />
      {remedios.length > 0 ? (
        <ul aria-label="Remédios da lista" className="flex flex-col gap-2">
          {remedios.map((remedio, posicao) => (
            <li
              key={remedio.id}
              data-remedio={remedio.id}
              className={
                'flex min-h-12 items-center justify-between gap-2 rounded-controle border border-border-field ps-4 ' +
                'text-corpo alto-contraste:border-(length:--bc-borda-controle)'
              }
            >
              <span className="wrap-anywhere">{remedio.nome}</span>
              <IconButton
                variante="discreta"
                icone={X}
                aria-label={`Remover ${remedio.nome.toLocaleLowerCase('pt-BR')}`}
                onPress={() => remover(posicao)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-corpo text-text-muted">Nenhum remédio na lista.</p>
      )}
      <Switch
        isSelected={lembrar}
        onChange={onLembrarChange}
        descricao={(ligado) => (ligado ? TEXTOS_DO_CONSENTIMENTO.ligado : TEXTOS_DO_CONSENTIMENTO.desligado)}
      >
        {TEXTOS_DO_CONSENTIMENTO.titulo}
      </Switch>
      {/* Sempre visível, mesmo com a lista vazia: o docs/etica.md promete que a pessoa sempre
          consegue apagar o que ficou no aparelho, e o app limpa o armazenamento no onApagarTudo. */}
      <div>
        <Button variante="perigo" icone={Trash} onPress={apagarTudo}>
          Apagar tudo
        </Button>
      </div>
    </div>
  );
}
