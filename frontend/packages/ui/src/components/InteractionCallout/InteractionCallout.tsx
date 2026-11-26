import { Alert, type AlertTom } from '../Alert';

/** Seção da bula onde o agente de interações achou a frase que cita o outro remédio. */
export type SecaoDaInteracao = 'contraindicacao' | 'precaucoes_interacoes';

/** Os três níveis. Saem só da seção, sem nenhuma inferência de gravidade. */
export type NivelDaInteracao = 'nao-usar' | 'cuidado' | 'nao-fala';

/**
 * Todos os textos do componente, num lugar só. O título de `nao-usar` ainda depende da validação
 * com as bulas reais (spec, "Validar antes de fechar o texto"). Se aparecerem falsos "não usar
 * junto", troque aqui por `titulo: "A bula cita essa combinação em 'Quando não usar'"` e
 * `acao: 'Fale com o médico antes de usar os dois juntos.'`.
 */
export const TEXTOS_DA_INTERACAO = {
  'nao-usar': {
    titulo: 'A bula diz para não usar junto',
    acao: 'Fale com o médico antes. Não pare nenhum remédio por conta própria.',
  },
  cuidado: {
    titulo: 'A bula pede cuidado com essa combinação',
    acao: 'Converse com o farmacêutico antes de tomar os dois juntos.',
  },
  'nao-fala': {
    titulo: 'A bula não fala dessa combinação',
    acao: 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.',
  },
} as const satisfies Record<NivelDaInteracao, { titulo: string; acao: string }>;

/** O tom vem do Alert, que não tem verde: nenhum nível pode parecer "seguro". */
const TOM_DO_NIVEL: Record<NivelDaInteracao, AlertTom> = {
  'nao-usar': 'perigo',
  cuidado: 'cuidado',
  'nao-fala': 'info',
};

/** Número da seção na bula de papel (RDC 47/2009): 3 é "Quando não devo usar", 4 é "O que devo saber antes". */
export const NUMERO_DA_SECAO: Record<SecaoDaInteracao, number> = {
  contraindicacao: 3,
  precaucoes_interacoes: 4,
};

export function nivelDaInteracao(secao: SecaoDaInteracao | null): NivelDaInteracao {
  if (secao === 'contraindicacao') return 'nao-usar';
  if (secao === 'precaucoes_interacoes') return 'cuidado';
  return 'nao-fala';
}

/** A frase da bula que cita o outro remédio, exatamente como veio do backend. */
export interface EvidenciaDaBula {
  /** O trecho da bula, sem aspas. */
  frase: string;
  /** De qual bula é a frase ("Losartana"). */
  remedio: string;
}

interface InteractionCalloutBase {
  /** O par checado, na ordem em que deve aparecer no título ("Losartana", "Ibuprofeno"). */
  remedios: readonly [string, string];
  nivelTitulo?: 2 | 3 | 4;
}

export type InteractionCalloutProps = InteractionCalloutBase &
  (
    | {
        /** Onde a frase foi achada. Decide o nível. */
        secao: SecaoDaInteracao;
        /** Obrigatória quando há seção: a frase da bula sempre aparece como evidência. */
        evidencia: EvidenciaDaBula;
      }
    | {
        /** `null`: nenhuma frase achada para o par. */
        secao: null;
        evidencia?: never;
      }
  );

function comInicialMinuscula(texto: string) {
  return texto.charAt(0).toLocaleLowerCase('pt-BR') + texto.slice(1);
}

/** O que a bula diz sobre um par de remédios, com a frase da bula como evidência. */
export function InteractionCallout({ remedios, secao, evidencia, nivelTitulo = 3 }: InteractionCalloutProps) {
  const nivel = nivelDaInteracao(secao);
  const { titulo, acao } = TEXTOS_DA_INTERACAO[nivel];
  const [primeiro, segundo] = remedios;
  return (
    <Alert
      tom={TOM_DO_NIVEL[nivel]}
      nivelTitulo={nivelTitulo}
      titulo={`${primeiro} e ${segundo.toLocaleLowerCase('pt-BR')}: ${comInicialMinuscula(titulo)}`}
    >
      <p>{acao}</p>
      {secao && evidencia ? (
        <figure className="mt-2">
          <blockquote className="text-apoio italic">“{evidencia.frase}”</blockquote>
          <figcaption className="text-apoio font-bold">
            {evidencia.remedio}, seção {NUMERO_DA_SECAO[secao]}
          </figcaption>
        </figure>
      ) : null}
    </Alert>
  );
}
