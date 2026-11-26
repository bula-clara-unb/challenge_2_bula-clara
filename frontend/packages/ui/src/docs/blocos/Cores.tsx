import { Tabela } from './Tabela';
import { contraste, doGrupo, pares, razao, temaAlto, temaPadrao, temas, valor, type Par, type Tema } from './tokens';

// O papel de cada cor, com o texto aprovado no artifact do design system (sem os números
// de contraste, que esta página calcula). `artifact` é o nome do token no artifact.
const usos: Record<string, { artifact: string; uso: string }> = {
  'color.surface.default': { artifact: 'surface', uso: 'Fundo das telas e dos cartões.' },
  'color.surface.info': {
    artifact: 'surface-info',
    uso: 'Fundo de aviso neutro ("A bula não fala dessa combinação") e de blocos de apoio. No alto contraste vira branco com borda preta.',
  },
  'color.text.default': { artifact: 'text', uso: 'Texto principal.' },
  'color.text.muted': {
    artifact: 'text-muted',
    uso: 'Texto de apoio (fonte, data, rótulos). Nunca para informação de segurança.',
  },
  'color.text.on-solid': { artifact: 'on-action', uso: 'Texto e ícone sobre action-primary e emergency-solid.' },
  'color.border.subtle': { artifact: 'border-subtle', uso: 'Divisores decorativos entre blocos. Não identifica controle.' },
  'color.border.field': { artifact: 'border-field', uso: 'Borda de campos e controles.' },
  'color.action.primary': { artifact: 'action-primary', uso: 'Botão principal, links e ícones de ação.' },
  'color.action.primary-strong': {
    artifact: 'action-primary-strong',
    uso: 'Hover e pressionado da ação primária; texto de chip sobre action-primary-subtle.',
  },
  'color.action.primary-subtle': {
    artifact: 'action-primary-subtle',
    uso: 'Fundo de chips (SourceChip, sugestões). Texto em action-primary-strong.',
  },
  'color.caution.text': { artifact: 'caution-text', uso: 'Texto do nível "A bula pede cuidado".' },
  'color.caution.bg': { artifact: 'caution-bg', uso: 'Fundo do nível "A bula pede cuidado".' },
  'color.caution.border': { artifact: 'caution-border', uso: 'Barra lateral e ícone do nível de cuidado.' },
  'color.danger.text': { artifact: 'danger-text', uso: 'Texto do nível "A bula diz para não usar junto" e do botão Apagar tudo.' },
  'color.danger.bg': { artifact: 'danger-bg', uso: 'Fundo do nível "não usar junto" e da EmergencyBar.' },
  'color.danger.border': { artifact: 'danger-border', uso: 'Barra lateral e ícone do nível "não usar junto"; borda do botão Apagar tudo.' },
  'color.emergency.solid': { artifact: 'emergency-solid', uso: 'Fundo do EmergencyCard. Exclusivo dele.' },
  'color.confirm': {
    artifact: 'confirm',
    uso: 'Só para confirmar ações ("Lista apagada"). Nunca indica que um remédio é seguro.',
  },
  'color.focus.ring': { artifact: 'focus-ring', uso: 'Contorno de foco de 3px, com afastamento de 2px.' },
  'color.focus.halo': { artifact: 'focus-halo', uso: 'Halo amarelo de 4px fora do contorno de foco: visível sobre qualquer fundo.' },
  'color.overlay': { artifact: 'overlay', uso: 'Véu escuro atrás do Dialog e do Sheet. Decorativo: não carrega texto.' },
};

function Amostra({ cor }: { cor: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-8 shrink-0 rounded-aviso border border-text-default align-middle"
      style={{ background: cor }}
    />
  );
}

function CorDoTema({ cor }: { cor: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Amostra cor={cor} />
      <code>{cor}</code>
    </span>
  );
}

/** Todas as cores semânticas, nos dois temas, lidas do build dos tokens. */
export function PaletaDeCores() {
  return (
    <Tabela
      titulo="Cores semânticas nos dois temas"
      colunas={['Token', 'No artifact', temaPadrao.nome, temaAlto.nome, 'Uso']}
      linhas={doGrupo(temaPadrao.tokens, 'color').map(([nome, cor]) => [
        <code key="n">{nome}</code>,
        <code key="art">{usos[nome]?.artifact ?? ''}</code>,
        <CorDoTema key="p" cor={cor} />,
        <CorDoTema key="a" cor={valor(temaAlto.tokens, nome)} />,
        usos[nome]?.uso ?? 'Sem descrição ainda: acrescente em src/docs/blocos/Cores.tsx',
      ])}
    />
  );
}

function Exemplo({ par, tema }: { par: Par; tema: Tema }) {
  const frente = valor(tema.tokens, par.texto);
  const fundo = valor(tema.tokens, par.fundo);
  // Meta de 3:1 é de borda ou ícone, não de texto: a amostra é uma borda grossa.
  if (par.minimo < 4.5) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-8 w-16 rounded-aviso p-1"
        style={{ background: fundo }}
      >
        <span className="block size-full rounded-aviso" style={{ border: `3px solid ${frente}` }} />
      </span>
    );
  }
  return (
    <span className="inline-block whitespace-nowrap rounded-aviso px-2 py-1 font-bold" style={{ color: frente, background: fundo }}>
      Losartana 50 mg
    </span>
  );
}

/** Contraste de cada par declarado em pares-contraste.json, calculado na hora. */
export function TabelaDeContraste({ tema: idTema }: { tema: Tema['id'] }) {
  const tema = temas.find((t) => t.id === idTema);
  if (!tema) throw new Error(`tema ${idTema} não existe`);
  return (
    <Tabela
      titulo={`Contraste dos pares no tema ${tema.nome.toLowerCase()}`}
      colunas={['Uso', 'Cor da frente', 'Fundo', 'Exemplo', 'Contraste', 'Meta', 'Resultado']}
      linhas={pares.map((par) => {
        const r = contraste(valor(tema.tokens, par.texto), valor(tema.tokens, par.fundo));
        return [
          par.uso,
          <code key="t">{par.texto}</code>,
          <code key="f">{par.fundo}</code>,
          <Exemplo key="e" par={par} tema={tema} />,
          razao(r),
          `${String(par.minimo).replace('.', ',')}:1`,
          r >= par.minimo ? 'Atinge a meta' : <strong key="r" data-abaixo-da-meta="">Abaixo da meta</strong>,
        ];
      })}
    />
  );
}
