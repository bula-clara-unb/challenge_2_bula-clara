// Gera dist/tokens.css, dist/tailwind.css e um JSON plano por tema.
// Os primitivos nunca viram CSS: só os tokens semânticos, de base e de componente saem do build.
// Os de componente saem como var(--bc-…) do semântico, para seguir o tema sem gerar outro CSS.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import StyleDictionary from 'style-dictionary';

const PREFIXO = 'bc';
const TEMAS = ['padrao', 'alto-contraste'];
const SEM_PRIMITIVOS = (token) => token.path[0] !== 'primitivo';
const DE_TEMA = (token) => SEM_PRIMITIVOS(token) && token.filePath.includes('/temas/');
const DE_COMPONENTE = (token) => token.filePath.includes('/componentes/');
const DE_BASE = (token) => SEM_PRIMITIVOS(token) && !DE_TEMA(token) && !DE_COMPONENTE(token);

const nomeCss = (token) => `--${PREFIXO}-${token.path.join('-')}`;
const linhas = (tokens, recuo) =>
  tokens.map((t) => `${recuo}${nomeCss(t)}: ${t.$value};`).join('\n');

StyleDictionary.registerFormat({
  name: 'bc/json-plano',
  format: ({ dictionary }) =>
    JSON.stringify(
      Object.fromEntries(dictionary.allTokens.map((t) => [t.path.join('.'), t.$value])),
      null,
      2,
    ) + '\n',
});

StyleDictionary.registerFormat({
  name: 'bc/css-bloco',
  format: ({ dictionary }) => linhas(dictionary.allTokens, '  ') + '\n',
});

// {color.action.primary} → var(--bc-color-action-primary)
const comoReferencia = (valor) =>
  String(valor).replace(/\{([^}]+)\}/g, (_, caminho) => `var(--${PREFIXO}-${caminho.replaceAll('.', '-')})`);

StyleDictionary.registerFormat({
  name: 'bc/css-referencias',
  format: ({ dictionary }) =>
    dictionary.allTokens.map((t) => `  ${nomeCss(t)}: ${comoReferencia(t.original.$value)};`).join('\n') + '\n',
});

async function gerar(tema) {
  const sd = new StyleDictionary({
    source: ['src/tokens/primitivos/*.json', `src/tokens/temas/${tema}.json`, 'src/tokens/componentes/*.json'],
    usesDtcg: true,
    log: { verbosity: 'silent' },
    platforms: {
      saida: {
        buildPath: 'dist/tmp/',
        files: [
          { destination: `${tema}.json`, format: 'bc/json-plano', filter: SEM_PRIMITIVOS },
          { destination: `${tema}.tema.css`, format: 'bc/css-bloco', filter: DE_TEMA },
          { destination: `${tema}.base.css`, format: 'bc/css-bloco', filter: DE_BASE },
          { destination: `${tema}.componentes.css`, format: 'bc/css-referencias', filter: DE_COMPONENTE },
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
  const ler = (arquivo) => readFile(`dist/tmp/${arquivo}`, 'utf8');
  return {
    json: await ler(`${tema}.json`),
    tema: await ler(`${tema}.tema.css`),
    base: await ler(`${tema}.base.css`),
    componentes: await ler(`${tema}.componentes.css`),
  };
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
const [padrao, alto] = await Promise.all(TEMAS.map(gerar));

const css = `/* Gerado por scripts/build.mjs. Não edite à mão. */
:root {
${padrao.base}${padrao.tema}${padrao.componentes}}

[data-contraste='alto'] {
${alto.tema}}

@media (prefers-contrast: more) {
  :root:not([data-contraste='padrao']) {
${alto.tema.replace(/^/gm, '  ').trimEnd()}
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --${PREFIXO}-duracao-rapida: 0ms;
    --${PREFIXO}-duracao-media: 0ms;
  }
}
`;

// Tailwind v4: @theme inline aponta para as variáveis, então trocar o tema no :root
// troca as classes utilitárias sem gerar outro CSS.
const nomes = JSON.parse(padrao.json);
const mapaTailwind = {
  color: 'color',
  space: 'spacing',
  radius: 'radius',
  'font.familia': 'font',
  'font.tamanho': 'text',
  duracao: 'transition-duration', // o Tailwind 4.3 lê as durações de --transition-duration-*
  sombra: 'shadow',
  'font.espacamento-letra': 'tracking',
  'tamanho.medida': 'container-medida',
  componente: 'color',
};
const linhasTheme = Object.keys(nomes)
  .map((caminho) => {
    const prefixo = Object.keys(mapaTailwind).find((p) => caminho === p || caminho.startsWith(`${p}.`));
    if (!prefixo) return null;
    const resto = caminho.slice(prefixo.length + 1).replaceAll('.', '-');
    const nome = resto ? `${mapaTailwind[prefixo]}-${resto}` : mapaTailwind[prefixo];
    return `  --${nome}: var(--${PREFIXO}-${caminho.replaceAll('.', '-')});`;
  })
  .filter(Boolean)
  .concat(
    Object.keys(nomes)
      .filter((caminho) => caminho.startsWith('font.altura-linha.'))
      .map((caminho) => {
        const papel = caminho.split('.').at(-1);
        return `  --text-${papel}--line-height: var(--${PREFIXO}-${caminho.replaceAll('.', '-')});`;
      }),
  )
  .join('\n');
const tailwind = `/* Gerado por scripts/build.mjs. Não edite à mão. */
@theme inline {
  --color-*: initial;
  --font-*: initial;
  --shadow-*: initial;
${linhasTheme}
}
`;

await writeFile('dist/tokens.css', css);
await writeFile('dist/tailwind.css', tailwind);
await writeFile('dist/padrao.json', padrao.json);
await writeFile('dist/alto-contraste.json', alto.json);
await rm('dist/tmp', { recursive: true, force: true });
console.log('tokens gerados em dist/');
