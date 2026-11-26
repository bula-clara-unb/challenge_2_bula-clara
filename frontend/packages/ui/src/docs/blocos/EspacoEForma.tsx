import { Tabela } from './Tabela';
import { doGrupo, temaAlto as alto, temaPadrao as padrao, valor } from './tokens';

// Uso de cada passo, aprovado no artifact. O artifact numera os passos de 1 a 8 (space-1 a space-8);
// aqui a numeração é a do Tailwind, em que o número vezes 4 dá o tamanho em px (p-6 = 24px).
const usosDoEspaco = [
  'Entre ícone e texto pequeno.',
  'Entre ícone e rótulo de botão; entre chips.',
  'Padding interno de avisos e chips.',
  'Margem lateral da tela no celular; padding de cartão.',
  'Entre camadas da resposta.',
  'Entre blocos de resposta.',
  'Topo de página; separação de seções grandes.',
  'Respiro no desktop.',
];

/** A escala de espaço, com uma barra do tamanho de cada passo. */
export function EscalaDeEspaco() {
  return (
    <Tabela
      titulo="Escala de espaçamento"
      colunas={['Token', 'No artifact', 'Valor', 'Tamanho', 'Classes', 'Uso']}
      linhas={doGrupo(padrao.tokens, 'space').map(([nome, medida], i) => {
        const passo = nome.split('.')[1];
        return [
          <code key="n">{nome}</code>,
          <code key="a">space-{i + 1}</code>,
          medida,
          <span key="b" aria-hidden="true" className="block h-4 bg-action-primary" style={{ width: medida }} />,
          <code key="c">
            p-{passo}, gap-{passo}, m-{passo}
          </code>,
          usosDoEspaco[i] ?? '',
        ];
      })}
    />
  );
}

const usosDoRaio: Record<string, { artifact: string; uso: string }> = {
  aviso: { artifact: 'radius-sm', uso: 'Avisos (InteractionCallout, SafetyNotice).' },
  controle: { artifact: 'radius-md', uso: 'Botões, campos, chips, EmergencyCard.' },
  painel: { artifact: 'radius-lg', uso: 'Painéis (sheet, dialog) e topo da folha de confirmação.' },
  total: { artifact: 'radius-full', uso: 'Só o trilho do Switch.' },
};

/** Os raios, com uma amostra de cada. */
export function Raios() {
  return (
    <Tabela
      titulo="Raios de canto"
      colunas={['Token', 'No artifact', 'Valor', 'Amostra', 'Uso', 'Classe']}
      linhas={doGrupo(padrao.tokens, 'radius').map(([nome, medida]) => {
        const id = nome.split('.')[1] ?? '';
        return [
          <code key="n">{nome}</code>,
          <code key="a">{usosDoRaio[id]?.artifact ?? ''}</code>,
          medida,
          <span
            key="s"
            aria-hidden="true"
            className="block h-12 w-20 border-2 border-text-default bg-surface-info"
            style={{ borderRadius: medida }}
          />,
          usosDoRaio[id]?.uso ?? '',
          <code key="c">rounded-{id}</code>,
        ];
      })}
    />
  );
}

const usosDaBorda: Record<string, string> = {
  'borda.controle': 'Botões, campos e outros controles.',
  'borda.aviso': 'Contorno dos avisos. No tema padrão o aviso não tem contorno, só a barra lateral.',
  'borda.barra-aviso': 'Barra lateral dos avisos (no artifact, border-accent).',
};

/** Espessuras de borda, que mudam no alto contraste. */
export function Bordas() {
  return (
    <Tabela
      titulo="Espessura das bordas em cada tema"
      colunas={['Token', padrao.nome, alto.nome, 'Onde']}
      linhas={doGrupo(padrao.tokens, 'borda').map(([nome, medida]) => [
        <code key="n">{nome}</code>,
        medida,
        valor(alto.tokens, nome),
        usosDaBorda[nome] ?? '',
      ])}
    />
  );
}

/** A sombra única do sistema, com uma amostra. */
export function Sombra() {
  const sombra = valor(padrao.tokens, 'sombra.flutuante');
  return (
    <Tabela
      titulo="Sombra"
      colunas={['Token', 'Valor', 'Amostra', 'Uso', 'Classe']}
      linhas={[
        [
          <code key="n">sombra.flutuante</code>,
          <code key="v">{sombra}</code>,
          <span key="a" aria-hidden="true" className="block h-12 w-20 rounded-painel bg-surface-default" style={{ boxShadow: sombra }} />,
          'Só painéis flutuantes (Sheet, Dialog). O resto usa bordas.',
          <code key="c">shadow-flutuante</code>,
        ],
      ]}
    />
  );
}

/** Medidas de foco, área de toque e largura de texto. */
export function Medidas() {
  const linha = (nome: string, artifact: string, uso: string) => [
    <code key="n">{nome}</code>,
    <code key="a">{artifact}</code>,
    valor(padrao.tokens, nome),
    uso,
  ];
  return (
    <Tabela
      titulo="Foco, área de toque e largura do texto"
      colunas={['Token', 'No artifact', 'Valor', 'Para quê']}
      linhas={[
        linha('tamanho.foco-contorno', 'focus-ring', 'Espessura do contorno em color.focus.ring.'),
        linha('tamanho.foco-afastamento', 'focus-ring', 'Distância entre o controle e o contorno.'),
        linha('tamanho.foco-halo', 'focus-halo', 'Halo em color.focus.halo, por fora do contorno.'),
        linha('tamanho.alvo-toque', 'target-min', 'Altura e largura mínimas de qualquer alvo de toque.'),
        linha('tamanho.medida', 'measure', 'Largura máxima de texto corrido (classe max-w-medida).'),
      ]}
    />
  );
}

/** Três amostras com o foco aplicado, para ver o contorno e o halo. */
export function AmostraDeFoco() {
  return (
    <div className="my-6 flex flex-wrap gap-8 p-4">
      <span aria-hidden="true" className="foco-visivel inline-flex h-12 items-center rounded-controle bg-surface-default px-6 font-bold text-action-primary">
        Sobre o branco
      </span>
      <span aria-hidden="true" className="foco-visivel inline-flex h-12 items-center rounded-controle bg-action-primary px-6 font-bold text-text-on-solid">
        Sobre o azul
      </span>
      <span aria-hidden="true" className="foco-visivel inline-flex h-12 items-center rounded-controle bg-emergency-solid px-6 font-bold text-text-on-solid">
        Sobre a emergência
      </span>
    </div>
  );
}
