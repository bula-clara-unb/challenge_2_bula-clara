import { Tabela } from './Tabela';
import { px, pxNaEscala, temaPadrao, valor, variavelCss } from './tokens';

interface Papel {
  id: string;
  nome: string;
  familia: 'voz' | 'texto';
  peso: 'regular' | 'semibold' | 'bold';
  exemplo: string;
  uso: string;
  caixaAlta?: boolean;
}

// Exemplos e usos aprovados no artifact do design system. Tamanhos e alturas vêm dos tokens.
const papeis: Papel[] = [
  { id: 'titulo-1', nome: 'Título 1', familia: 'voz', peso: 'semibold', exemplo: 'Losartana', uso: 'Nome do remédio e título de página.' },
  { id: 'resposta', nome: 'Frase-resposta', familia: 'voz', peso: 'semibold', exemplo: 'Pode ser perigoso tomar os dois juntos.', uso: 'A frase-resposta, sempre a primeira coisa da resposta.' },
  { id: 'titulo-2', nome: 'Título 2', familia: 'texto', peso: 'bold', exemplo: 'Como devo usar?', uso: 'Títulos de seção.' },
  { id: 'titulo-3', nome: 'Título 3', familia: 'texto', peso: 'bold', exemplo: 'A bula pede cuidado com essa combinação', uso: 'Título de aviso e de cartão.' },
  { id: 'corpo', nome: 'Corpo', familia: 'texto', peso: 'regular', exemplo: 'O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.', uso: 'Todo texto corrido. Nunca menor que isso.' },
  { id: 'botao', nome: 'Botão', familia: 'texto', peso: 'bold', exemplo: 'Ouvir resposta', uso: 'Rótulos de botão.' },
  { id: 'apoio', nome: 'Apoio', familia: 'texto', peso: 'regular', exemplo: 'Bula oficial ANVISA · versão de 03/2025', uso: 'Fonte, data, metadados. Em text-muted.' },
  { id: 'rotulo', nome: 'Rótulo', familia: 'texto', peso: 'bold', exemplo: 'Sua pergunta', uso: 'Rótulo de bloco em caixa alta. Só palavras curtas.', caixaAlta: true },
];

const escalas = [1, 1.2, 1.4];
const nomeDaFamilia = { voz: 'Literata', texto: 'Atkinson Hyperlegible' };

/** Tamanho de cada estilo nos três níveis do A+, calculado a partir dos tokens. */
export function EscalaTipografica() {
  const tokens = temaPadrao.tokens;
  return (
    <Tabela
      titulo="Estilos de texto e tamanho em cada nível do A+"
      colunas={['Estilo', 'Fonte e peso', '100%', '120%', '140%', 'Altura de linha', 'Uso']}
      linhas={papeis.map((papel) => {
        const tamanho = valor(tokens, `font.tamanho.${papel.id}`);
        return [
          <span key="n">
            {papel.nome}
            <br />
            <code>text-{papel.id}</code>
          </span>,
          `${nomeDaFamilia[papel.familia]} ${valor(tokens, `font.peso.${papel.peso}`)}`,
          ...escalas.map((e) => px(pxNaEscala(tamanho, e))),
          String(valor(tokens, `font.altura-linha.${papel.id}`)).replace('.', ','),
          papel.caixaAlta
            ? `${papel.uso} Espaço entre letras de ${valor(tokens, `font.espacamento-letra.${papel.id}`)}.`
            : papel.uso,
        ];
      })}
    />
  );
}

/** Uma linha de cada estilo, desenhada com as variáveis CSS dos tokens. */
export function AmostrasDeTexto() {
  return (
    <div className="my-6 flex flex-col gap-4 rounded-painel border border-border-subtle p-6">
      {papeis.map((papel) => (
        <div key={papel.id}>
          <p className="text-apoio text-text-muted">{papel.nome}</p>
          <p
            lang="pt-BR"
            className={`hyphens-auto wrap-anywhere${papel.caixaAlta ? ' uppercase' : ''}`}
            style={{
              fontFamily: `var(${variavelCss(`font.familia.${papel.familia}`)})`,
              fontWeight: `var(${variavelCss(`font.peso.${papel.peso}`)})`,
              fontSize: `var(${variavelCss(`font.tamanho.${papel.id}`)})`,
              lineHeight: `var(${variavelCss(`font.altura-linha.${papel.id}`)})`,
              letterSpacing: papel.caixaAlta ? `var(${variavelCss(`font.espacamento-letra.${papel.id}`)})` : undefined,
              margin: 0,
            }}
          >
            {papel.exemplo}
          </p>
        </div>
      ))}
    </div>
  );
}
