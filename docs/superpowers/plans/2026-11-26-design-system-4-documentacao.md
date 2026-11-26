# Design system, plano 4 de 4: a documentação

> **Para quem for executar com agentes:** use a skill `superpowers:subagent-driven-development` (recomendada) ou `superpowers:executing-plans`, tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhar o andamento.
>
> **Commits:** cada tarefa termina com um commit. Commits **locais** no worktree de execução estão autorizados pelo Matheus. **Push e PR, não**: esses esperam o OK dele. As mensagens seguem o padrão do repositório (conventional commits em português, uma linha, citando a #25) e não levam rodapé de co-autoria nem menção a ferramentas de IA. Nunca inclua `.claude/` nem arquivos fora do que a tarefa lista.

**Objetivo:** escrever as páginas gerais do Storybook (Introdução, Fundamentos, Conteúdo e voz, o modelo de página de componente e o Changelog), o ADR da arquitetura e o checklist manual de acessibilidade, com os valores lidos dos tokens e cada página conferida pelo axe.

**Arquitetura:** as páginas são MDX em `frontend/packages/ui/src/docs/`, que o `.storybook/main.ts` do plano 1 já carrega. Tudo o que é valor (cor, contraste, tamanho de texto, espaço, raio, borda, sombra) vem de `@bula-clara/tokens/padrao.json` e `alto-contraste.json`, por meio de pequenos componentes de documentação em `src/docs/blocos/`. O contraste usa a mesma função do teste dos tokens. Como o addon de Vitest só testa stories, um script fora do repositório abre cada página do build num Chromium e roda o axe nela. O ADR e o checklist são Markdown em `docs/`.

**Stack:** a do plano 1, sem dependência nova: Storybook 10.6 com `@storybook/addon-docs` (MDX 3), React 19, Tailwind 4.3 (só tokens), `@phosphor-icons/react` e o Playwright e o axe-core que já vêm com o Storybook.

**Spec:** `docs/design-system.md`. **Visual aprovado:** `/Users/matheusperillo/dev/challenge_2_bula-clara/.superpowers/referencias/design-system/README.md` e `tokens.json` (artifact do design system) e as telas em `/Users/matheusperillo/dev/challenge_2_bula-clara/.superpowers/referencias/canvas/`. **Issue:** #25.

---

## Os quatro planos

1. **A base:** workspace, tokens, teste de contraste, Storybook com axe, CI e os três primeiros primitivos (`Button`, `IconButton`, `VisuallyHidden`).
2. **Os primitivos restantes.**
3. **Os componentes do domínio** e as páginas de **Padrões**.
4. **A documentação (este plano):** as páginas gerais do Storybook, o ADR e o checklist manual.

Este plano roda em paralelo com o plano 2, num worktree próprio, depois do plano 1. Ele só depende do plano 1: dos tokens e dos componentes `Button`, `IconButton` e `VisuallyHidden`.

## Decisões que este plano fecha

Tudo abaixo foi testado antes de entrar aqui, numa cópia do plano 1 já com as correções do visual aprovado (47 testes nos tokens e 23 no `ui`):

- **As páginas gerais ficam em `src/docs/`, em pastas numeradas** (`1-introducao/`, `2-fundamentos/`, `3-conteudo-e-voz/`, `4-componentes/`, `6-changelog/`), e os arquivos de cada pasta também são numerados. Sem `storySort` no `preview.tsx`, o Storybook ordena a barra lateral pela ordem dos arquivos, e assim ela segue a ordem da spec. O número 5 fica livre para os **Padrões** do plano 3 (`src/docs/5-padroes/`), que assim caem entre Componentes e Changelog.
- **A página de cada componente fica na pasta dele**, como `src/components/<Nome>/<Nome>.mdx`, com `<Meta of={Stories}>`. O plano 4 escreve só o modelo (Componentes/Modelo de página). As páginas de cada componente nascem com eles, nos planos 2 e 3.
- **Os valores nunca são digitados.** Os blocos de `src/docs/blocos/` leem `@bula-clara/tokens/padrao.json` e `alto-contraste.json`, e o contraste é calculado com `packages/tokens/src/contraste.ts`, a mesma função do teste. O `contraste.ts` e o `pares-contraste.json` são importados por caminho relativo (`../../../../tokens/src/...`), porque o pacote de tokens não exporta esses arquivos e este plano não mexe no `package.json`. Depois que o plano 2 acrescentar o export `@bula-clara/tokens/pares-contraste.json`, dá para trocar a linha do `blocos/tokens.tsx` por `import paresJson from '@bula-clara/tokens/pares-contraste.json';`. Funciona igual.
- **Os textos de uso de cada token vêm do artifact aprovado** (`tokens.json`), sem os números de contraste, que a página calcula. Uma coluna "No artifact" dá o nome do token lá (`on-action`, `space-5`, `radius-md`), porque o artifact e o código usam nomes diferentes.
- **Tabelas com um componente `Tabela`**, e não em Markdown. O MDX do Storybook não traz tabelas GFM sem o `remark-gfm`, que pediria mudar o `package.json` e o `.storybook/main.ts`. A `Tabela` ainda dá `<caption>` e cabeçalhos de linha e de coluna.
- **Listas numeradas dentro de `ListaNumerada`.** O reset do Tailwind (`preflight`) tira os números de `<ol>`, e o Storybook não devolve. Isso vale para qualquer MDX do projeto (ver "Para o coordenador", no fim).
- **Índice de Flesch calculado na página.** O bloco `Legibilidade` repete a conta de `scripts/avaliar.py` (`flesch_pt`). O índice só aparece em textos com 10 palavras ou mais: numa frase curta, uma palavra comprida decide tudo ("Checando interações…" daria menos de zero). Só texto escrito pela interface reprova a conferência. Texto do backend abaixo da meta fica marcado na página, para a #23.
- **Os textos da interface são os das telas aprovadas** (canvas e protótipo). Onde as telas não têm texto (sem conexão, API fora do ar, câmera e microfone negados), o texto é novo e segue as regras. Duas diferenças em relação à spec escrita: a mensagem de resposta fora do formato termina com "O farmacêutico pode te ajudar." (a frase da spec dava 41 no Flesch, e esta dá 52), e os modelos de "Perguntar mais" levam artigo que concorda com o remédio ("Para que serve o ibuprofeno?"), como nas telas aprovadas. Enquanto o app não souber o gênero de cada nome, a sugestão sai sem artigo.
- **O axe também passa nas páginas MDX.** O `@storybook/addon-vitest` só testa stories, então as páginas não estão na suíte automática. Um script fora do repositório (`/tmp/bula-clara-conferir-docs.mjs`, Tarefa 2) serve o build, abre cada página de `src/docs/` num Chromium, confere que renderiza sem erro, roda o axe-core e procura qualquer valor marcado como abaixo da meta. Ele usa o Playwright e o axe-core que já estão no `node_modules` do Storybook.
- **O Changelog não importa `CHANGELOG.md`.** Esses arquivos só aparecem quando alguém roda `pnpm changeset version`. A página explica onde ficam e mostra um trecho real, gerado numa cópia de teste.
- **O ADR fica em `docs/adr/0001-arquitetura-do-design-system.md`** e o checklist em `docs/acessibilidade/checklist-manual.md`. Os registros de cada rodada de teste vão para `docs/acessibilidade/registros/`, que nasce no primeiro registro.
- **Fora deste plano:** as páginas de Padrões (plano 3), as páginas de cada componente (planos 2 e 3) e qualquer mudança em `package.json`, lockfile, `.storybook/`, `vitest.config.ts`, `src/index.ts`, `src/styles/index.css` ou `packages/tokens`.

## Arquivos

```
frontend/packages/ui/src/docs/
├── blocos/
│   ├── tokens.tsx              lê os tokens dos dois temas; contraste, px no A+, formatação
│   ├── Tabela.tsx              tabela acessível (o MDX não tem tabela GFM)
│   ├── ListaNumerada.tsx       devolve os números das listas <ol>
│   ├── Cores.tsx               paleta e contraste de cada par, nos dois temas
│   ├── Tipografia.tsx          estilos de texto nos três níveis do A+
│   ├── EspacoEForma.tsx        espaço, raios, bordas, sombra, foco e medidas
│   ├── Temas.tsx               o que o alto contraste troca
│   ├── FacaNaoFaca.tsx         par de exemplos "Faça" e "Não faça"
│   └── Legibilidade.tsx        textos da interface com o índice de Flesch
├── 1-introducao/
│   ├── 1-ComeceAqui.mdx        princípios, para quem é, organização
│   └── 2-ComoContribuir.mdx    regra do app, CI, axe, Changesets
├── 2-fundamentos/
│   ├── 1-Cores.mdx
│   ├── 2-Tipografia.mdx
│   ├── 3-Espacamento.mdx
│   ├── 4-Forma.mdx
│   ├── 5-Movimento.mdx
│   ├── 6-Icones.mdx
│   └── 7-Temas.mdx
├── 3-conteudo-e-voz/
│   ├── 1-VozERegras.mdx        as 8 regras, sem emoji, metas
│   ├── 2-Glossario.mdx         trocas, as 9 seções da bula, palavras proibidas
│   └── 3-TextosDaInterface.mdx textos de cada estado, consentimento, Perguntar mais
├── 4-componentes/
│   └── ModeloDePagina.mdx      o que toda página de componente tem
└── 6-changelog/
    └── Changelog.mdx           onde fica e como ler o changelog do Changesets
docs/adr/0001-arquitetura-do-design-system.md
docs/acessibilidade/checklist-manual.md
```

Fora do repositório, só durante a execução: `/tmp/bula-clara-conferir-docs.mjs`.

---

### Tarefa 0: Preparar o worktree

- [ ] **Passo 1: Conferir onde você está**

A execução roda num worktree criado a partir da `feat/design-system-base` com o plano 1 já aplicado. Quem coordena junta o worktree de volta nela no fim.

```bash
git log --oneline -3
ls frontend/packages/ui/src/components   # Button  IconButton  VisuallyHidden
ls frontend/packages/ui/src/docs 2>/dev/null || echo "sem docs ainda: ok"
```

Não crie outra branch nem faça push.

- [ ] **Passo 2: Instalar e conferir a base**

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm --filter @bula-clara/ui exec playwright install chromium   # se ainda não tiver
pnpm --filter @bula-clara/tokens test
pnpm --filter @bula-clara/ui test
```

Esperado: `Tests  47 passed (47)` nos tokens e `Tests  23 passed (23)` no `ui`. Se os números forem outros, a base mudou depois deste plano: confira os nomes de token usados nos blocos (Tarefas 1 a 7) contra `packages/tokens/dist/padrao.json` antes de seguir.

Todos os comandos das próximas tarefas rodam dentro de `frontend/`. Comandos que podem esperar resposta no terminal levam `< /dev/null`.

---

### Tarefa 1: Blocos básicos

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/blocos/tokens.tsx`, `frontend/packages/ui/src/docs/blocos/Tabela.tsx`, `frontend/packages/ui/src/docs/blocos/ListaNumerada.tsx`

Os três são usados por todas as páginas. O `tokens.tsx` não desenha nada, mas fica como `.tsx` para que toda a pasta `docs/` tenha só MDX e componentes de documentação.

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/blocos/tokens.tsx`**

```tsx
// Leitura dos tokens para as páginas de documentação. Nenhum valor é digitado aqui:
// tudo vem do build do @bula-clara/tokens, e o contraste usa a mesma fórmula do teste.
import altoContraste from '@bula-clara/tokens/alto-contraste.json';
import padrao from '@bula-clara/tokens/padrao.json';
import { contraste } from '../../../../tokens/src/contraste';
import paresJson from '../../../../tokens/src/pares-contraste.json';

export type Tokens = Record<string, string | number>;

export interface Tema {
  id: 'padrao' | 'alto-contraste';
  nome: string;
  tokens: Tokens;
}

export interface Par {
  texto: string;
  fundo: string;
  minimo: number;
  uso: string;
}

export const temaPadrao: Tema = { id: 'padrao', nome: 'Padrão', tokens: padrao };
export const temaAlto: Tema = { id: 'alto-contraste', nome: 'Alto contraste', tokens: altoContraste };
export const temas: Tema[] = [temaPadrao, temaAlto];

export const pares: Par[] = paresJson;

export { contraste };

/** Tokens cujo nome começa com o prefixo, na ordem em que saem do build. */
export function doGrupo(tokens: Tokens, prefixo: string): [string, string][] {
  return Object.entries(tokens)
    .filter(([nome]) => nome.startsWith(`${prefixo}.`))
    .map(([nome, valor]) => [nome, String(valor)]);
}

export function valor(tokens: Tokens, nome: string): string {
  const v = tokens[nome];
  if (v === undefined) throw new Error(`token ${nome} não existe`);
  return String(v);
}

/** Nome da variável CSS que o build gera para um token (color.text.default → --bc-color-text-default). */
export function variavelCss(nome: string): string {
  return `--bc-${nome.replaceAll('.', '-')}`;
}

/**
 * Tamanho em px de um valor de fonte quando a raiz está em `escala` (1, 1.2 ou 1.4).
 * Aceita os formatos que os tokens usam: `1.125rem`, `16px` e `calc(19px + 0.9375rem)`.
 */
export function pxNaEscala(valorCss: string, escala: number): number {
  const raiz = 16 * escala;
  const partes = valorCss.replace(/^calc\((.*)\)$/, '$1').split('+');
  return partes.reduce((total, parte) => {
    const texto = parte.trim();
    const numero = parseFloat(texto);
    if (texto.endsWith('rem')) return total + numero * raiz;
    if (texto.endsWith('px')) return total + numero;
    throw new Error(`valor de fonte inesperado: ${valorCss}`);
  }, 0);
}

/** 7.3312 → "7,33:1" */
export function razao(n: number): string {
  return `${n.toFixed(2).replace('.', ',')}:1`;
}

/** 25.2 → "25,2 px" */
export function px(n: number): string {
  return `${String(Math.round(n * 10) / 10).replace('.', ',')} px`;
}
```

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/blocos/Tabela.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface TabelaProps {
  /** Vira o <caption>: o leitor de tela anuncia o nome da tabela antes das linhas. */
  titulo: string;
  colunas: string[];
  /** A primeira célula de cada linha vira o cabeçalho da linha. */
  linhas: ReactNode[][];
}

// O MDX do Storybook não traz tabelas em Markdown (precisaria do remark-gfm),
// então as páginas usam esta tabela, com cabeçalhos de linha e de coluna.
export function Tabela({ titulo, colunas, linhas }: TabelaProps) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-apoio">
        <caption className="mb-2 text-left font-bold">{titulo}</caption>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna}
                scope="col"
                className="border-b-2 border-text-default bg-surface-info p-2 align-bottom font-bold"
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-b border-border-subtle">
              {linha.map((celula, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="p-2 align-top font-bold">
                    {celula}
                  </th>
                ) : (
                  <td key={j} className="p-2 align-top">
                    {celula}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Passo 3: Criar `frontend/packages/ui/src/docs/blocos/ListaNumerada.tsx`**

```tsx
import type { ReactNode } from 'react';

// O reset do Tailwind tira os números de <ol>, e o Storybook não devolve.
// Envolva a lista numerada em Markdown com este bloco, deixando uma linha em branco antes e depois.
export function ListaNumerada({ children }: { children: ReactNode }) {
  return <div className="[&_ol]:list-decimal [&_ol]:ps-8">{children}</div>;
}
```

- [ ] **Passo 4: Conferir tipos e lint**

```bash
pnpm typecheck
pnpm lint
```

Esperado: os dois sem erro. Se o `typecheck` reclamar do import relativo de `contraste.ts`, confira que o caminho sobe quatro níveis (`blocos` → `docs` → `src` → `ui` → `packages`).

- [ ] **Passo 5: Commit**

```bash
git add frontend/packages/ui/src/docs/blocos/tokens.tsx frontend/packages/ui/src/docs/blocos/Tabela.tsx frontend/packages/ui/src/docs/blocos/ListaNumerada.tsx
git commit -m "docs: blocos de leitura dos tokens para o Storybook (#25)"
```

---

### Tarefa 2: Conferência das páginas com o axe

**Arquivos:**
- Criar, fora do repositório: `/tmp/bula-clara-conferir-docs.mjs`

O script não entra no repositório. Ele serve `packages/ui/storybook-static` só em `127.0.0.1`, abre cada página de documentação de `src/docs/` num Chromium e, para cada uma, confere três coisas: que a página renderiza sem erro de JavaScript, que o axe não acha violação (regras WCAG 2.0, 2.1 e 2.2 nível A e AA, e boas práticas) e que nenhum valor está marcado como abaixo da meta (`data-abaixo-da-meta`, que os blocos de contraste e de Flesch põem quando um valor reprova).

- [ ] **Passo 1: Criar o script**

```bash
cat > /tmp/bula-clara-conferir-docs.mjs <<'EOF'
// Abre cada página de documentação do build do Storybook num Chromium, confere que
// renderiza sem erro e roda o axe nela. Uso: node conferir-docs.mjs <caminho do frontend>
// Com um id de página no segundo argumento, só imprime o texto daquela página.
import { createReadStream, readFileSync, realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const frontend = resolve(process.argv[2] ?? '.');
const soTextoDe = process.argv[3];
const ui = join(frontend, 'packages/ui');
const estatico = join(ui, 'storybook-static');
const { chromium } = await import(pathToFileURL(join(ui, 'node_modules/playwright/index.mjs')).href);
const doA11y = createRequire(realpathSync(join(ui, 'node_modules/@storybook/addon-a11y/package.json')));
const axe = readFileSync(doA11y.resolve('axe-core/axe.min.js'), 'utf8');

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const servidor = createServer((req, res) => {
  const caminho = join(estatico, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  res.setHeader('Content-Type', tipos[extname(caminho)] ?? 'application/octet-stream');
  createReadStream(caminho).on('error', () => res.writeHead(404).end()).pipe(res);
});
await new Promise((pronto) => servidor.listen(0, '127.0.0.1', pronto));
const porta = servidor.address().port;

const indice = JSON.parse(readFileSync(join(estatico, 'index.json'), 'utf8'));
const paginas = Object.values(indice.entries).filter((e) => e.type === 'docs' && e.importPath.startsWith('./src/docs/'));

if (soTextoDe) {
  const navegador = await chromium.launch();
  const aba = await navegador.newPage();
  await aba.goto(`http://127.0.0.1:${porta}/iframe.html?viewMode=docs&id=${soTextoDe}`);
  await aba.waitForSelector('.sbdocs-content h1', { timeout: 20000 });
  console.log((await aba.$eval('.sbdocs-content', (el) => el.innerText)).replaceAll('\t', ' | '));
  await navegador.close();
  servidor.close();
  process.exit(0);
}

if (paginas.length === 0) {
  console.log('FALHA: nenhuma página de src/docs/ no build');
  servidor.close();
  process.exit(1);
}

const navegador = await chromium.launch();
let falhas = 0;
for (const pagina of paginas) {
  const aba = await navegador.newPage();
  const erros = [];
  aba.on('pageerror', (e) => erros.push(String(e)));
  await aba.goto(`http://127.0.0.1:${porta}/iframe.html?viewMode=docs&id=${pagina.id}`);
  await aba.waitForSelector('.sbdocs-content h1', { timeout: 20000 });
  await aba.addScriptTag({ content: axe });
  const violacoes = await aba.evaluate(async () => {
    const r = await window.axe.run('.sbdocs-content', { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] });
    return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
  });
  // Os blocos marcam com data-abaixo-da-meta o contraste ou o Flesch (de texto da interface) que reprova.
  const abaixo = await aba.$$eval('[data-abaixo-da-meta]', (els) => els.map((el) => el.textContent ?? ''));
  const ok = erros.length === 0 && violacoes.length === 0 && abaixo.length === 0;
  if (!ok) falhas++;
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${pagina.title}${erros.length ? ` | erros: ${erros.join('; ')}` : ''}${violacoes.length ? ` | axe: ${violacoes.join(', ')}` : ''}${abaixo.length ? ` | abaixo da meta: ${abaixo.length}` : ''}`);
  await aba.close();
}
await navegador.close();
servidor.close();
console.log(`${paginas.length} páginas, ${falhas} com problema`);
process.exit(falhas ? 1 : 0);
EOF
```

Com um segundo argumento (o id de uma página, como `fundamentos-cores--docs`), ele só imprime o texto daquela página, com as células de tabela separadas por ` | `. As Tarefas 4 a 6 usam isso para conferir valores que só existem depois que a página roda.

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `FALHA: nenhuma página de src/docs/ no build` e código de saída 1, porque ainda não existe nenhuma página. Nada para commitar nesta tarefa.

---

### Tarefa 3: Introdução

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/1-introducao/1-ComeceAqui.mdx`, `frontend/packages/ui/src/docs/1-introducao/2-ComoContribuir.mdx`

A Introdução parte do texto aprovado no artifact do design system: a personalidade, os seis princípios e o público. O guia de contribuição traz a regra de que o app só usa o que está no design system, o que o CI confere, o axe obrigatório e os Changesets.

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/1-introducao/1-ComeceAqui.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Introdução/Comece aqui" />

# Design system do Bula Clara

O Bula Clara explica a bula oficial da ANVISA com palavras simples, sempre mostrando de qual seção da bula saiu cada informação. Este Storybook é o design system da interface: os tokens, os componentes, o guia de conteúdo e as regras de acessibilidade. A spec completa está em `docs/design-system.md`, e as decisões de arquitetura, em `docs/adr/0001-arquitetura-do-design-system.md`.

## Para quem é

O design system existe para quem mais sofre com bula, e toda decisão aqui sai daí:

- pessoas idosas, que muitas vezes tomam vários remédios ao mesmo tempo;
- cuidadores e familiares, que cuidam dos remédios de outra pessoa;
- quem enxerga mal e usa letra grande, lupa, alto contraste ou leitor de tela;
- quem tem dificuldade de leitura. Segundo o Inaf 2024, 29% dos brasileiros de 15 a 64 anos são analfabetos funcionais.

Na prática, isso quer dizer corpo de texto de 18 px no mínimo, botões com pelo menos 48 px, contraste alto e textos que funcionam também quando são ouvidos.

## Personalidade

O Bula Clara fala como um farmacêutico de confiança que trabalha num serviço público: calmo, direto, respeitoso, sem infantilizar. O visual é institucional, azul e branco, no espírito do gov.br, porque isso passa confiança. A frase-resposta vem em serifa, porque soa como alguém explicando, e não como um formulário.

## Princípios

### 1. A mensagem principal vem primeiro

Toda resposta abre com uma frase só, no estilo `resposta`. Os detalhes vêm depois, para quem quiser ler. Avisos seguem a mesma ordem: primeiro o que fazer, depois o porquê.

### 2. Nunca dizer "é seguro"

Quando a bula não fala de algo, a interface diz exatamente isso: "A bula não fala dessa combinação. Isso não garante que seja seguro." Nenhuma cor, ícone ou frase sugere que um remédio ou uma combinação é segura.

### 3. Cor nunca sozinha

Todo estado tem ícone e texto, além da cor. Quem não distingue vermelho de verde, quem usa alto contraste e quem ouve a tela pelo leitor recebem a mesma informação.

### 4. Informar e tranquilizar sem assustar

Vermelho só aparece para perigo real e para emergência. Um bloqueio por pedido de mudança de dose não é perigo e não fica vermelho.

### 5. Toda recusa tem um próximo passo

Quando o Bula Clara não pode ou não sabe responder, ele diz a quem perguntar: o farmacêutico, o médico ou o 192.

### 6. Privacidade é parte do design

Nada de saúde vai para a URL, para o cache ou para o armazenamento do aparelho sem a pessoa pedir. Não há login, nem fonte ou serviço de terceiros. Todo texto sobre privacidade descreve exatamente o que acontece com os dados. O `docs/etica.md` é uma restrição: o que ferir esse documento não entra, nem como opção com aviso.

## Segurança

Os textos de segurança (emergência, pedido de mudança de dose, grupos especiais, autolesão) e o aviso legal vêm do backend, que usa regras fixas e testadas. A interface escolhe o componente certo e cuida do layout e dos botões de ligar, sem reescrever nem completar esses textos.

## Acessibilidade

WCAG 2.2 AA em tudo e AAA no contraste de texto, nos alvos de toque e no tema de alto contraste. As referências brasileiras são a ABNT NBR 17225 e o eMAG. Um componente que reprova no axe não entra, e o que o axe não vê é conferido à mão com o checklist de `docs/acessibilidade/checklist-manual.md`.

## Como este Storybook está organizado

- **Introdução:** esta página e o guia de contribuição.
- **Fundamentos:** cores, tipografia, espaçamento, forma, movimento, ícones e temas. Os valores dessas páginas são lidos dos tokens, nunca digitados.
- **Conteúdo e voz:** as regras de escrita, o glossário e os textos de cada estado da interface.
- **Componentes:** uma página por componente, com uso, anatomia, props, estados e acessibilidade.
- **Padrões:** como os componentes se juntam numa tela (resposta, ficha do remédio, emergência).
- **Changelog:** o que mudou em cada versão dos pacotes.

Na barra de cima, os controles **Contraste** e **Texto** trocam o tema e o tamanho do texto (A+) das stories. Use os dois antes de dar um componente por pronto.

O logotipo ainda não existe. Por enquanto, o nome "Bula Clara" aparece em texto, no estilo `botao`, na cor `action-primary`.
```

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/1-introducao/2-ComoContribuir.mdx`**

````mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { ListaNumerada } from '../blocos/ListaNumerada';

<Meta title="Introdução/Como contribuir" />

# Como contribuir

## A regra principal

O app (`apps/web`) só usa o que está no design system. Se faltar um componente, uma cor ou um tamanho, ele entra primeiro aqui, em `@bula-clara/tokens` ou `@bula-clara/ui`, com story, teste e documentação. Só depois o app passa a usar. Componente feito direto no app, "só desta vez", vira uma segunda versão de algo que já existe, e as duas acabam se afastando.

## Antes de começar

<ListaNumerada>

1. Abra uma issue dizendo o que falta e onde vai ser usado. Se a issue já existe, comente nela.
2. Crie a branch a partir da `dev`. A `main` só recebe PR vindo da `dev`.
3. Leia a página do componente mais parecido com o seu e o **Modelo de página**, em Componentes. Ali está o que toda página de componente precisa ter.

</ListaNumerada>

## Onde cada coisa mora

- **Tokens:** `frontend/packages/tokens/src/tokens/`. Os primitivos (`primitivos/`) guardam os valores brutos e nunca viram CSS. Os temas (`temas/`) dão o papel de cada cor. Componente nunca usa primitivo direto.
- **Componentes:** `frontend/packages/ui/src/components/<Nome>/`, com quatro arquivos: `<Nome>.tsx`, `<Nome>.stories.tsx`, `<Nome>.test.tsx` e `index.ts`. Exporte o componente em `src/index.ts`.
- **Documentação:** a página de um componente fica na pasta dele, como `<Nome>.mdx`. As páginas gerais (como esta) ficam em `frontend/packages/ui/src/docs/`.

## O que o CI confere

O job `frontend` roda a cada PR, e o PR só entra com tudo verde:

<ListaNumerada>

1. Contraste dos tokens. Se você criar um par de texto e fundo, declare o par em `packages/tokens/src/pares-contraste.json`, com a meta (7:1 para corpo e texto de segurança, 4,5:1 para o resto, 3:1 para borda e ícone). O teste recalcula todos os pares nos dois temas.
2. Lint com `jsx-a11y` no modo estrito.
3. Tipos com TypeScript strict.
4. Testes de unidade (Vitest e Testing Library), sempre buscando por papel e por rótulo: `getByRole` e `getByLabelText`.
5. Axe em todas as stories. Cada story roda num Chromium e passa pelo axe. Qualquer violação reprova o teste, e não existe exceção por story. Se o axe reclamar, corrija o componente.
6. Build do Storybook, que sai como artefato do PR.

</ListaNumerada>

O axe acha só uma parte dos problemas de acessibilidade. Ordem de leitura, nomes que não fazem sentido em voz alta e foco que some se conferem à mão, com o checklist de `docs/acessibilidade/checklist-manual.md` (leitor de tela, só teclado, zoom de 200% e tela de 320px).

Para rodar tudo na sua máquina, dentro de `frontend/`:

```bash
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm build-storybook
```

## Changesets

Toda mudança que alguém vá notar em `@bula-clara/tokens` ou `@bula-clara/ui` leva um changeset:

```bash
pnpm changeset
```

Escolha o pacote, o tipo e escreva uma frase para quem usa o pacote, dizendo o que mudou e, se for o caso, o que a pessoa precisa fazer.

- **patch:** correção que não muda como se usa (um contraste ajustado, um bug de foco).
- **minor:** algo novo que não quebra nada (um componente, uma variante, um token).
- **major:** algo que obriga quem usa a mudar o código (uma prop renomeada, um token removido).

Mudança só de documentação, de story ou de teste não precisa de changeset. A página **Changelog** explica onde essas frases aparecem depois.

## Antes de pedir revisão

Confira no seu PR:

- O componente só usa tokens (nada de cor, fonte ou tamanho escrito à mão).
- Tem story para cada variante e estado, e todas passam no axe.
- Os testes cobrem teclado e o nome acessível.
- A página do componente segue o modelo.
- Os textos seguem **Conteúdo e voz**.
- Funciona nos dois temas e nos três tamanhos de texto.
- Tem changeset, se alguém vai notar a mudança.
- Nada fere o `docs/etica.md`. Se você ficou na dúvida, escreva a dúvida no PR.
````

- [ ] **Passo 3: Build e conferência**

```bash
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `Storybook build completed successfully` e:

```
ok    Introdução/Comece aqui
ok    Introdução/Como contribuir
2 páginas, 0 com problema
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/packages/ui/src/docs/1-introducao
git commit -m "docs: introdução e guia de contribuição do design system (#25)"
```

---

### Tarefa 4: Fundamentos, cores

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/blocos/Cores.tsx`, `frontend/packages/ui/src/docs/2-fundamentos/1-Cores.mdx`

A paleta mostra cada cor semântica nos dois temas, com o nome no artifact e o uso aprovado. A tabela de contraste percorre os pares de `pares-contraste.json` e calcula a razão de cada um na hora. Pares com meta de 3:1 são de borda ou ícone, e a amostra é uma borda grossa, e não um texto (um texto com 3:1 seria, com razão, uma violação do axe).

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/blocos/Cores.tsx`**

```tsx
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
```

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/2-fundamentos/1-Cores.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { PaletaDeCores, TabelaDeContraste } from '../blocos/Cores';

<Meta title="Fundamentos/Cores" />

# Cores

O visual é institucional, azul e branco, no espírito do gov.br, porque isso passa confiança. As outras cores existem para avisos, e cada uma tem um significado só.

Os tokens têm três camadas. Os primitivos guardam os valores brutos (`primitivo.cor.azul.600`) e nunca viram CSS. Os semânticos dão o papel de cada cor (`color.action.primary`), e são eles que os componentes usam. Os de componente, quando existirem, apontam para os semânticos. Um tema troca só a camada semântica.

Os valores desta página são lidos do build de `@bula-clara/tokens`, e o contraste é calculado com a mesma fórmula do teste (`packages/tokens/src/contraste.ts`). Se um token mudar, a página muda junto. A coluna "No artifact" dá o nome do mesmo token no artifact do design system aprovado pelo grupo, para quem vier de lá.

## Paleta

<PaletaDeCores />

## Como as cores se combinam

- Fundo em `surface.default`, texto em `text.default`, apoio em `text.muted`. Ação em `action.primary`, com texto em `text.on-solid`.
- Chips usam `action.primary-subtle` com texto em `action.primary-strong`.
- Os três níveis de interação têm cada um seu conjunto de cores, sempre com ícone e título:
  - `danger.bg`, `danger.text` e `danger.border`: "A bula diz para não usar junto";
  - `caution.bg`, `caution.text` e `caution.border`: "A bula pede cuidado com essa combinação";
  - `surface.info`, `text.default` e `border.field`: "A bula não fala dessa combinação". Esse nível nunca é verde: a bula não falar não quer dizer que a combinação é segura.
- `emergency.solid` é exclusivo do EmergencyCard.
- `confirm` (verde) só confirma ações, como "Lista apagada". Nunca aparece numa resposta sobre remédio, porque a pessoa poderia ler como "pode tomar".
- O aviso de bloqueio por pedido de mudança de dose (SafetyNotice) não é vermelho: um bloqueio não quer dizer perigo.

Cor nunca é a única pista. Todo estado tem ícone e texto, para quem não distingue cores e para quem usa leitor de tela.

## Contraste

A meta é por par de cor da frente e fundo, pela fórmula da WCAG 2.x:

- 7:1 para texto de corpo e para todo texto de segurança (avisos, emergência, interação);
- 4,5:1 para o resto do texto;
- 3:1 para bordas de controle, ícones e foco.

O tema de alto contraste leva todo texto a 7:1 ou mais. Os pares ficam em `packages/tokens/src/pares-contraste.json`. O teste do pacote de tokens recalcula cada um nos dois temas e reprova o build se algum ficar abaixo da meta. Criou um par novo num componente? Declare o par nesse arquivo.

### Tema padrão

<TabelaDeContraste tema="padrao" />

### Tema de alto contraste

<TabelaDeContraste tema="alto-contraste" />

## Como usar nos componentes

As classes do Tailwind saem dos tokens: `bg-action-primary`, `text-text-default`, `border-caution-border`. A paleta padrão do Tailwind está desligada, então `bg-blue-600` não gera nada. Fora do Tailwind, use a variável CSS: `var(--bc-color-action-primary)`.
```

- [ ] **Passo 3: Conferir**

```bash
pnpm typecheck && pnpm lint
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: tipos e lint sem erro, e `ok    Fundamentos/Cores` na lista, com `3 páginas, 0 com problema`.

- [ ] **Passo 4: Conferir alguns valores contra a spec**

Os valores são calculados no navegador, então a conferência abre a página e imprime o texto dela (o segundo argumento é o id da página):

```bash
node /tmp/bula-clara-conferir-docs.mjs . fundamentos-cores--docs | grep -E "^(link e botão secundário|cartão de emergência) "
```

Esperado, primeiro no tema padrão e depois no alto contraste:

```
link e botão secundário | color.action.primary | color.surface.default | Losartana 50 mg | 7,33:1 | 7:1 | Atinge a meta
cartão de emergência | color.text.on-solid | color.emergency.solid | Losartana 50 mg | 7,44:1 | 7:1 | Atinge a meta
link e botão secundário | color.action.primary | color.surface.default | Losartana 50 mg | 12,34:1 | 7:1 | Atinge a meta
cartão de emergência | color.text.on-solid | color.emergency.solid | Losartana 50 mg | 11,09:1 | 7:1 | Atinge a meta
```

Os dois primeiros batem com a tabela de cores da spec (7,33:1 e 7,44:1).

- [ ] **Passo 5: Commit**

```bash
git add frontend/packages/ui/src/docs/blocos/Cores.tsx frontend/packages/ui/src/docs/2-fundamentos/1-Cores.mdx
git commit -m "docs: página de cores com contraste calculado dos tokens (#25)"
```

---

### Tarefa 5: Fundamentos, tipografia, espaçamento e forma

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/blocos/Tipografia.tsx`, `frontend/packages/ui/src/docs/blocos/EspacoEForma.tsx`, `frontend/packages/ui/src/docs/2-fundamentos/2-Tipografia.mdx`, `frontend/packages/ui/src/docs/2-fundamentos/3-Espacamento.mdx`, `frontend/packages/ui/src/docs/2-fundamentos/4-Forma.mdx`

A tabela de tipografia calcula o tamanho de cada estilo nos três níveis do A+ a partir do `calc(px + rem)` dos tokens. A de espaçamento mostra a numeração do código (Tailwind, `p-6` = 24 px) ao lado da do artifact (`space-5`).

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/blocos/Tipografia.tsx`**

```tsx
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
```

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/blocos/EspacoEForma.tsx`**

```tsx
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
```

- [ ] **Passo 3: Criar `frontend/packages/ui/src/docs/2-fundamentos/2-Tipografia.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { AmostrasDeTexto, EscalaTipografica } from '../blocos/Tipografia';

<Meta title="Fundamentos/Tipografia" />

# Tipografia

Duas fontes, cada uma com seu papel:

- **Literata** (família `voz`) aparece só nos estilos `titulo-1` e `resposta`: o nome do remédio, o título de página e a frase-resposta. A serifa faz a resposta soar como alguém explicando, e não como um formulário.
- **Atkinson Hyperlegible** (família `texto`) é para todo o resto. Foi criada para quem enxerga mal: letras parecidas, como I, l e 1, ficam bem diferentes umas das outras. Também é mais estreita que as alternativas, então quebra menos linha. Os pesos usados são 400 e 700.

As duas vêm do Fontsource e fazem parte do build. Nada vem do Google Fonts, para que nenhuma visita avise um terceiro. O navegador baixa só o subconjunto latino, que cobre os acentos, o ç e o til.

## Estilos

Os tamanhos abaixo são calculados a partir dos tokens `font.tamanho.*` para cada nível do controle A+.

<EscalaTipografica />

<AmostrasDeTexto />

## O controle A+

O A+ muda o tamanho da raiz do documento para 100%, 120% ou 140% (`data-escala` no `<html>`), e o layout inteiro acompanha, porque as medidas estão em `rem`. Use o controle **Texto** na barra de cima para ver qualquer story nos três tamanhos.

Os títulos crescem menos que o corpo. Cada título é uma parte fixa em px somada a uma parte em `rem`, e por isso o título 1 vai a 40 px no nível de 140%, em vez de 48 px. Assim um nome comprido ainda cabe na tela do celular.

## Regras

- O corpo de texto nunca fica abaixo de 18 px.
- O texto corrido tem no máximo 65 caracteres por linha (token `tamanho.medida`, classe `max-w-medida`).
- Nenhuma tela pode quebrar ou pedir rolagem para o lado, em nenhum tamanho de texto, a partir de 320 px de largura.
- O documento tem `lang="pt-BR"` e os títulos usam `hyphens: auto` e `overflow-wrap: anywhere`. Assim "Hidroclorotiazida" quebra com hífen em vez de vazar.
- Caixa alta só no estilo `rotulo`, em palavras curtas, e sempre pelo CSS (`uppercase`). O texto fica escrito normalmente no código, para o leitor de tela não soletrar.
- Negrito marca título, rótulo e botão. No meio do texto, só para o que a pessoa não pode deixar passar, como um horário.

## Como usar nos componentes

Classes `text-titulo-1`, `text-resposta`, `text-titulo-2`, `text-titulo-3`, `text-corpo`, `text-botao`, `text-apoio` e `text-rotulo`, que já trazem a altura de linha. O rótulo leva também `tracking-rotulo` e `uppercase`. Famílias `font-voz` e `font-texto`.
```

- [ ] **Passo 4: Criar `frontend/packages/ui/src/docs/2-fundamentos/3-Espacamento.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { EscalaDeEspaco } from '../blocos/EspacoEForma';

<Meta title="Fundamentos/Espaçamento" />

# Espaçamento

O espaçamento vai em múltiplos de 4 px, com poucos passos. Na dúvida entre dois valores, fique com o maior: espaço sobrando ajuda quem tem dificuldade de leitura a ver onde termina um assunto e começa outro.

<EscalaDeEspaco />

## Duas numerações para os mesmos valores

O artifact do design system numera os passos em sequência, de `space-1` a `space-8`. No código, a numeração é a do Tailwind, em que o número vezes 4 dá o tamanho em px. Por isso o `space-5` do artifact (24 px) é o `p-6`, o `gap-6` ou o `mt-6` aqui. A tabela acima mostra as duas lado a lado.

As classes do Tailwind fora da escala, como `p-5` ou `p-10`, ainda funcionam, mas não use: elas saem da escala.

## Na resposta

Entre as camadas de uma resposta (frase-resposta, botão Ouvir, aviso de interação, explicação, chips), use 24 px (`gap-6`). Entre uma resposta e a anterior, 32 px (`gap-8`). No celular, a margem lateral da tela é de 16 px (`px-4`).
```

- [ ] **Passo 5: Criar `frontend/packages/ui/src/docs/2-fundamentos/4-Forma.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { AmostraDeFoco, Bordas, Medidas, Raios, Sombra } from '../blocos/EspacoEForma';

<Meta title="Fundamentos/Forma" />

# Forma

## Raios

<Raios />

## Bordas em vez de sombras

A separação entre as coisas é feita com borda. Os controles têm borda de 2 px nos dois temas.

Os avisos (InteractionCallout, SafetyNotice) usam uma barra lateral grossa na cor do nível, que é o padrão do gov.br e do NHS para aviso institucional. No tema padrão, a barra basta. No alto contraste, a barra engrossa e o aviso ganha contorno, porque ali nenhum fundo colorido aparece sem borda.

<Bordas />

A única sombra do sistema é a dos painéis que flutuam por cima da tela. As sombras padrão do Tailwind estão desligadas.

<Sombra />

## Área de toque, foco e largura do texto

Tudo que se toca tem pelo menos 48 por 48 px, mesmo que o desenho seja menor: um ícone de 24 px dentro de um `IconButton` ocupa 48 px de área. Isso ajuda quem tem tremor nas mãos ou pouca precisão no toque.

O foco do teclado aparece em todo controle: contorno escuro de 3 px, afastado 2 px do controle, com um halo amarelo de 4 px por fora. A combinação fica visível sobre qualquer fundo, nos dois temas, inclusive o azul e o vermelho de emergência.

<Medidas />

<AmostraDeFoco />

Nos componentes, use a classe `foco-visivel` junto com o estado de foco do React Aria: `data-focus-visible:foco-visivel`. O contorno aparece para quem navega pelo teclado, e não a cada toque.
```

- [ ] **Passo 6: Conferir**

```bash
pnpm typecheck && pnpm lint
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `6 páginas, 0 com problema`. Depois, confira o A+ e a numeração do artifact:

```bash
node /tmp/bula-clara-conferir-docs.mjs . fundamentos-tipografia--docs | grep -E "^text-(titulo-1|corpo) "
node /tmp/bula-clara-conferir-docs.mjs . fundamentos-espaçamento--docs | grep -E "^space\.6 "
```

Esperado:

```
text-titulo-1 | Literata 600 | 34 px | 37 px | 40 px | 1,2 | Nome do remédio e título de página.
text-corpo | Atkinson Hyperlegible 400 | 18 px | 21,6 px | 25,2 px | 1,5 | Todo texto corrido. Nunca menor que isso.
space.6 | space-5 | 24px | 
```

O título 1 vai de 34 a 40 px enquanto o corpo vai de 18 a 25,2 px: é o A+ da spec, com o título crescendo menos que o corpo.

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/docs/blocos/Tipografia.tsx frontend/packages/ui/src/docs/blocos/EspacoEForma.tsx frontend/packages/ui/src/docs/2-fundamentos/2-Tipografia.mdx frontend/packages/ui/src/docs/2-fundamentos/3-Espacamento.mdx frontend/packages/ui/src/docs/2-fundamentos/4-Forma.mdx
git commit -m "docs: tipografia, espaçamento e forma lidos dos tokens (#25)"
```

---

### Tarefa 6: Fundamentos, movimento, ícones e temas

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/blocos/Temas.tsx`, `frontend/packages/ui/src/docs/2-fundamentos/5-Movimento.mdx`, `frontend/packages/ui/src/docs/2-fundamentos/6-Icones.mdx`, `frontend/packages/ui/src/docs/2-fundamentos/7-Temas.mdx`

A página de ícones usa o `Button` e o `IconButton` do plano 1 de verdade, para mostrar o ícone decorativo escondido e o `aria-label` obrigatório. A de temas lista só o que o alto contraste troca, comparando os dois JSON.

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/blocos/Temas.tsx`**

```tsx
import { Tabela } from './Tabela';
import { temaAlto as alto, temaPadrao as padrao, variavelCss } from './tokens';

/** Os tokens que o alto contraste troca. Todo o resto é igual nos dois temas. */
export function DiferencasEntreTemas() {
  const diferentes = Object.entries(padrao.tokens).filter(([nome, v]) => alto.tokens[nome] !== v);
  return (
    <Tabela
      titulo="O que muda no tema de alto contraste"
      colunas={['Token', 'Variável CSS', padrao.nome, alto.nome]}
      linhas={diferentes.map(([nome, v]) => [
        <code key="n">{nome}</code>,
        <code key="v">{variavelCss(nome)}</code>,
        <code key="p">{String(v)}</code>,
        <code key="a">{String(alto.tokens[nome])}</code>,
      ])}
    />
  );
}
```

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/2-fundamentos/5-Movimento.mdx`**

````mdx
import { Meta } from '@storybook/addon-docs/blocks';
import padrao from '@bula-clara/tokens/padrao.json';
import { Tabela } from '../blocos/Tabela';

<Meta title="Fundamentos/Movimento" />

# Movimento

Movimento aqui serve para mostrar que algo mudou de estado: o botão foi pressionado, o painel abriu. Nunca é enfeite, e nada se mexe sozinho na tela.

<Tabela
  titulo="Durações"
  colunas={['Token', 'Valor', 'Classe', 'Para quê']}
  linhas={[
    [<code>duracao.rapida</code>, padrao['duracao.rapida'], <code>duration-rapida</code>, 'Cor e fundo de botão, chip e campo'],
    [<code>duracao.media</code>, padrao['duracao.media'], <code>duration-media</code>, 'Abrir e fechar acordeão, Sheet e Dialog'],
  ]}
/>

A curva é sempre `ease-out`: o movimento começa rápido e desacelera no fim.

## Movimento reduzido

Quando o sistema da pessoa pede menos movimento (`prefers-reduced-motion: reduce`), nada se move: os dois tokens de duração viram `0ms` e a mudança acontece na hora. Isso já está no CSS gerado pelos tokens, então quem usa `duration-rapida` ou `duration-media` não precisa fazer mais nada.

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --bc-duracao-rapida: 0ms;
    --bc-duracao-media: 0ms;
  }
}
```

## Regras

- Use só as duas durações. Nada de `duration-300` ou `transition: all 1s`.
- Anime cor, fundo e opacidade. Posição e tamanho só em painel que abre ou fecha, e com movimento reduzido não há transição de posição.
- Nada pisca nem fica em loop, e nada se mexe sem a pessoa ter feito alguma coisa. A exceção é o status de carregamento, que fica sem animação quando o movimento reduzido está ligado.
- O estado nunca depende só da animação. Se o botão Ouvir está tocando, o texto dele também muda.
````

- [ ] **Passo 3: Criar `frontend/packages/ui/src/docs/2-fundamentos/6-Icones.mdx`**

````mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { Camera, Check, Info, Microphone, Prohibit, SpeakerHigh, Trash, Warning } from '@phosphor-icons/react';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Tabela } from '../blocos/Tabela';

<Meta title="Fundamentos/Ícones" />

# Ícones

Os ícones são do [Phosphor](https://phosphoricons.com), em SVG, pelo pacote `@phosphor-icons/react`, nos pesos regular e bold. Todo ícone vem com um texto ao lado ou com `aria-label`.

Emoji nunca aparece como ícone, nem no meio do texto. Cada sistema desenha o emoji de um jeito, e o leitor de tela lê o nome dele em voz alta ("sinal de aviso"), o que atrapalha mais do que ajuda.

Nas prévias do artifact do design system e no protótipo, os ícones são desenhos provisórios. No código, são sempre os do Phosphor.

## Ícones com significado fixo

<Tabela
  titulo="Ícones que sempre querem dizer a mesma coisa"
  colunas={['Significado', 'Ícone', 'Nome no Phosphor']}
  linhas={[
    ['A bula diz para não usar junto', <Prohibit size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Prohibit</code>],
    ['A bula pede cuidado com essa combinação', <Warning size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Warning</code>],
    ['A bula não fala dessa combinação, e avisos neutros', <Info size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Info</code>],
    ['Fotografar a caixa', <Camera size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Camera</code>],
    ['Perguntar falando', <Microphone size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Microphone</code>],
    ['Ouvir resposta', <SpeakerHigh size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>SpeakerHigh</code>],
    ['Confirmar ("Sim, perguntar sobre ele")', <Check size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Check</code>],
    ['Apagar tudo', <Trash size={24} weight="bold" aria-hidden="true" focusable="false" />, <code>Trash</code>],
  ]}
/>

## Tamanho e peso

- 24 px nos botões, ao lado do texto ou sozinho no `IconButton`.
- Peso bold nos controles, para o traço não sumir em tela pequena ou para quem enxerga mal. O regular serve para ícone grande e decorativo.
- O ícone herda a cor do texto (`currentColor`), então segue o tema sozinho.

## Leitor de tela

Quase todo ícone fica ao lado de um texto que já diz a mesma coisa. Nesse caso ele é decorativo e precisa ficar escondido do leitor de tela, senão a informação é lida duas vezes:

```tsx
<Warning size={24} weight="bold" aria-hidden="true" focusable="false" />
```

O `Button` já faz isso com o ícone que recebe pela prop `icone`:

```tsx
<Button icone={SpeakerHigh}>Ouvir resposta</Button>
```

<div className="my-6 flex flex-wrap gap-4">
  <Button icone={SpeakerHigh}>Ouvir resposta</Button>
  <Button variante="perigo" icone={Trash}>Apagar tudo</Button>
</div>

Quando o ícone é o único conteúdo de um botão, o nome vai no botão, e não no ícone. Para isso existe o `IconButton`, que não compila sem `aria-label`:

```tsx
<IconButton aria-label="Perguntar falando" icone={Microphone} />
```

<div className="my-6 flex gap-4">
  <IconButton aria-label="Perguntar falando" icone={Microphone} />
  <IconButton aria-label="Fotografar a caixa" icone={Camera} variante="primaria" />
</div>

O `aria-label` diz a ação ("Perguntar falando"), e não o desenho ("Microfone").
````

- [ ] **Passo 4: Criar `frontend/packages/ui/src/docs/2-fundamentos/7-Temas.mdx`**

````mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { ListaNumerada } from '../blocos/ListaNumerada';
import { DiferencasEntreTemas } from '../blocos/Temas';

<Meta title="Fundamentos/Temas" />

# Temas

Há dois temas: o padrão e o de alto contraste. Um tema troca só os tokens semânticos (cores e espessura de borda). Componentes, espaços e tamanhos de texto continuam os mesmos.

## Alto contraste

O tema de alto contraste segue o nível AAA: texto preto puro sobre branco (21:1), todo texto com 7:1 ou mais, ação primária mais escura e bordas pretas em todo elemento interativo e em todo aviso. A barra lateral dos avisos engrossa, e nenhum fundo colorido aparece sem borda, porque com contraste alto a diferença entre dois fundos claros pode sumir. O amarelo do aviso de cuidado continua, agora com texto preto.

<DiferencasEntreTemas />

## Como o tema liga

O tema liga de dois jeitos:

<ListaNumerada>

1. Pelo sistema: se a pessoa pediu mais contraste no celular ou no computador, o navegador avisa com `prefers-contrast: more` e o tema liga sozinho.
2. Pela interface: um controle no app põe `data-contraste="alto"` no `<html>`. Para quem pediu alto contraste no sistema mas prefere o padrão no Bula Clara, o app põe `data-contraste="padrao"`, que vence o sistema.

</ListaNumerada>

```css
[data-contraste='alto'] { /* tokens do alto contraste */ }

@media (prefers-contrast: more) {
  :root:not([data-contraste='padrao']) { /* os mesmos tokens */ }
}
```

No Storybook, o controle **Contraste** da barra de cima faz o mesmo nas stories.

## Modo escuro

O modo escuro não existe ainda. Os tokens já estão prontos para ele, porque os componentes só usam tokens semânticos, e um tema escuro seria mais um arquivo em `packages/tokens/src/tokens/temas/`. Mas a paleta escura não foi desenhada nem validada, e por isso o sistema não reage a `prefers-color-scheme: dark`. Antes de ligar, cada par de `pares-contraste.json` precisa passar no tema novo.
````

- [ ] **Passo 5: Conferir**

```bash
pnpm typecheck && pnpm lint
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `9 páginas, 0 com problema`. Depois, confira a tabela de temas:

```bash
node /tmp/bula-clara-conferir-docs.mjs . fundamentos-temas--docs | grep -E "^(color\.text\.default|borda\.barra-aviso|space|font) "
```

Esperado (sem nenhuma linha de `space` ou `font`, que não mudam entre os temas):

```
color.text.default | --bc-color-text-default | #0B1B33 | #000000
borda.barra-aviso | --bc-borda-barra-aviso | 6px | 10px
```

- [ ] **Passo 6: Commit**

```bash
git add frontend/packages/ui/src/docs/blocos/Temas.tsx frontend/packages/ui/src/docs/2-fundamentos/5-Movimento.mdx frontend/packages/ui/src/docs/2-fundamentos/6-Icones.mdx frontend/packages/ui/src/docs/2-fundamentos/7-Temas.mdx
git commit -m "docs: movimento, ícones e temas (#25)"
```

---

### Tarefa 7: Conteúdo e voz

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/blocos/FacaNaoFaca.tsx`, `frontend/packages/ui/src/docs/blocos/Legibilidade.tsx`, `frontend/packages/ui/src/docs/3-conteudo-e-voz/1-VozERegras.mdx`, `frontend/packages/ui/src/docs/3-conteudo-e-voz/2-Glossario.mdx`, `frontend/packages/ui/src/docs/3-conteudo-e-voz/3-TextosDaInterface.mdx`

As oito regras da spec, cada uma com um par de faça e não faça. O glossário começa pelas cinco trocas aprovadas no artifact. A página de textos traz os textos de cada estado como estão nas telas aprovadas, diz quem escreve cada um (interface ou backend) e mostra o índice de Flesch. Os textos de segurança ficam de fora de propósito: vêm sempre do backend.

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/blocos/FacaNaoFaca.tsx`**

```tsx
import { Check, X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

export interface FacaNaoFacaProps {
  faca: ReactNode[];
  naoFaca: ReactNode[];
}

// O título de cada coluna diz "Faça" ou "Não faça" por escrito: a cor e o ícone só reforçam.
// Sem verde e sem vermelho, porque aqui ninguém está em perigo.
function Coluna({ titulo, itens, icone }: { titulo: string; itens: ReactNode[]; icone: 'faca' | 'nao' }) {
  const Icone = icone === 'faca' ? Check : X;
  return (
    <div
      className={`flex-1 rounded-painel border-2 p-4 ${icone === 'faca' ? 'border-action-primary' : 'border-text-muted'}`}
    >
      <p className="mb-2 flex items-center gap-2 font-bold">
        <Icone size={24} weight="bold" aria-hidden="true" focusable="false" />
        {titulo}
      </p>
      <ul className="flex list-none flex-col gap-3 p-0">
        {itens.map((item, i) => (
          <li key={i} className="m-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FacaNaoFaca({ faca, naoFaca }: FacaNaoFacaProps) {
  return (
    <div className="my-6 flex flex-col gap-4 sm:flex-row">
      <Coluna titulo="Faça" itens={faca} icone="faca" />
      <Coluna titulo="Não faça" itens={naoFaca} icone="nao" />
    </div>
  );
}
```

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/blocos/Legibilidade.tsx`**

```tsx
import { Tabela } from './Tabela';

// Mesma conta de scripts/avaliar.py (flesch_pt): índice de Flesch adaptado ao
// português por Martins et al. (1996). Se mudar lá, mude aqui.
function silabas(palavra: string): number {
  return Math.max(1, (palavra.toLowerCase().match(/[aeiouáéíóúâêôãõà]+/g) ?? []).length);
}

export function fleschPt(texto: string): number | null {
  const limpo = texto.replace(/\[\d+\]/g, '');
  const palavras = limpo.match(/[A-Za-zÀ-ú]+/g) ?? [];
  const frases = Math.max(1, (limpo.match(/[.!?]+/g) ?? []).length);
  if (palavras.length === 0) return null;
  const totalSilabas = palavras.reduce((soma, p) => soma + silabas(p), 0);
  return 248.835 - 1.015 * (palavras.length / frases) - 84.6 * (totalSilabas / palavras.length);
}

/**
 * O Flesch foi feito para trechos de texto. Numa frase curta, uma palavra comprida decide tudo:
 * "Apagar tudo" daria 35 e "Checando interações…", menos de zero. Abaixo disso, a tabela não mostra o índice.
 */
const MINIMO_DE_PALAVRAS = 10;

function contarPalavras(texto: string): number {
  return (texto.match(/[A-Za-zÀ-ú]+/g) ?? []).length;
}

export interface TextoDaInterface {
  situacao: string;
  texto: string;
  /** Quem escreve o texto: a interface ou o backend. */
  dono: 'interface' | 'backend';
  acao?: string;
}

/** Textos de estado com o índice de Flesch calculado na hora. A meta é 50 ou mais. */
export function TextosComLeitura({ titulo, textos }: { titulo: string; textos: TextoDaInterface[] }) {
  return (
    <Tabela
      titulo={titulo}
      colunas={['Situação', 'Texto', 'Botão ou próximo passo', 'Quem escreve', 'Flesch']}
      linhas={textos.map((t) => {
        const indice = contarPalavras(t.texto) < MINIMO_DE_PALAVRAS ? null : fleschPt(t.texto);
        return [
          t.situacao,
          t.texto,
          t.acao ?? '',
          t.dono === 'interface' ? 'Interface' : 'Backend',
          indice === null ? (
            'Texto curto'
          ) : indice < 50 ? (
            // Só texto da interface reprova a conferência das páginas. Texto do backend fica marcado para a #23.
            <strong key="f" {...(t.dono === 'interface' ? { 'data-abaixo-da-meta': '' } : {})}>
              {Math.round(indice)} (abaixo da meta)
            </strong>
          ) : (
            String(Math.round(indice))
          ),
        ];
      })}
    />
  );
}
```

- [ ] **Passo 3: Criar `frontend/packages/ui/src/docs/3-conteudo-e-voz/1-VozERegras.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { FacaNaoFaca } from '../blocos/FacaNaoFaca';

<Meta title="Conteúdo e voz/Voz e regras" />

# Voz e regras

O Bula Clara fala como um farmacêutico de confiança que trabalha num serviço público: calmo, direto e respeitoso. Explica o que a bula diz sem assustar e sem tratar ninguém como criança. Quando não sabe, diz que não sabe e indica quem sabe.

Estas regras valem para todo texto da interface: títulos, botões, avisos, mensagens de erro e o que o leitor de tela anuncia. Os textos de segurança (emergência, mudança de dose, grupos especiais) e o aviso legal são exceção: vêm prontos do backend e a interface não reescreve nem completa.

## As oito regras

### 1. A mensagem principal vem primeiro

Em voz ativa e numa frase só. Os detalhes vêm depois.

<FacaNaoFaca
  faca={['Tome 1 comprimido por dia, de manhã. A bula recomenda tomar sempre no mesmo horário.']}
  naoFaca={['De acordo com as informações presentes na bula do medicamento, recomenda-se que a administração seja realizada uma vez ao dia.']}
/>

### 2. Palavras do dia a dia

Use as palavras do **Glossário**: "posologia" vira "como tomar", "contraindicação" vira "quando não usar". O termo técnico só aparece entre parênteses quando ajuda a pessoa a achar o trecho na bula de papel ou na caixa.

<FacaNaoFaca
  faca={['Quando não usar (contraindicação)']}
  naoFaca={['Contraindicações']}
/>

### 3. Frases curtas

Até cerca de 20 palavras e um assunto por frase. Números escritos como na embalagem: "50 mg", "a cada 8 horas", "2 comprimidos".

<FacaNaoFaca
  faca={['Tome a cada 8 horas. Não passe de 4 comprimidos por dia.']}
  naoFaca={['A posologia recomendada é de um comprimido a cada oito horas, não devendo ser ultrapassada a dose máxima diária de quatro comprimidos.']}
/>

### 4. Informar e tranquilizar, sem assustar

Vermelho e palavras fortes ficam para perigo real. Uma reação rara listada na bula é informação, e não motivo de alarme.

<FacaNaoFaca
  faca={['A bula cita tontura entre as reações que podem acontecer. Se acontecer com você, fale com o médico.']}
  naoFaca={['ATENÇÃO! Este remédio pode causar tontura!']}
/>

### 5. Toda recusa vem com o próximo passo

Quando o Bula Clara não pode ou não sabe responder, ele diz quem pode ajudar.

<FacaNaoFaca
  faca={['Isso a bula não responde. O farmacêutico pode te ajudar.']}
  naoFaca={['Não é possível responder a essa pergunta.']}
/>

### 6. Honestidade sobre o que não sabemos

A bula não falar de uma combinação não quer dizer que a combinação é segura.

<FacaNaoFaca
  faca={['A bula não fala dessa combinação. Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.']}
  naoFaca={['Não encontramos interações. Pode tomar tranquilo!']}
/>

### 7. "Você", com linguagem neutra de gênero

Fale direto com a pessoa. Prefira construções que não marcam gênero, em vez de "(a)" ou "@".

<FacaNaoFaca
  faca={['Você tem com quem contar.']}
  naoFaca={['Você não está sozinho(a).']}
/>

O exemplo de "não faça" está hoje numa mensagem do backend (`bula_clara/agentes/seguranca.py`). A revisão desses textos é parte da issue #23.

### 8. Botões dizem a ação

O texto do botão diz o que vai acontecer quando a pessoa tocar.

<FacaNaoFaca
  faca={['Ligar 192', 'Apagar tudo', 'Sim, perguntar sobre ele']}
  naoFaca={['OK', 'Enviar', 'Sim']}
/>

## Sem emoji

Emoji não aparece no texto da interface, nem nos textos que vêm do backend. Cada sistema desenha o emoji de um jeito, e o leitor de tela lê o nome dele em voz alta ("sinal de aviso"). Quem dá o sinal visual são os ícones da interface (veja **Fundamentos/Ícones**). Os textos de `seguranca.py` ainda têm emoji, e a issue #23 tira.

<FacaNaoFaca
  faca={['A bula pede cuidado com essa combinação. (com o ícone de alerta do componente)']}
  naoFaca={['⚠️ Atenção: possível interação!']}
/>

## Tudo o que é falado também aparece escrito

A resposta pode ser ouvida, mas nunca só ouvida. O texto lido pelo botão Ouvir é o mesmo que está na tela. Na gravação de voz, o começo e o fim são avisados por som, vibração e texto.

## Metas

- **Legibilidade:** índice de Flesch adaptado ao português (Martins et al., 1996) de 50 ou mais. É a mesma meta das respostas (`docs/definicoes.md`) e a mesma conta de `scripts/avaliar.py`. A página **Textos da interface** mostra o índice de cada texto, calculado na hora.
- **Clareza:** cada texto novo passa pelo [CDC Clear Communication Index](https://www.cdc.gov/ccindex/). Na prática, as perguntas que mais pegam: a mensagem principal está no começo? Diz o que a pessoa deve fazer? Usa palavras que ela usaria? Explica números e riscos sem jargão?

O Flesch é só um termômetro. Num texto de uma frase ele varia muito, e um número bom não salva uma frase confusa. Se o índice ficar abaixo de 50, encurte a frase ou troque a palavra difícil antes de mexer em qualquer outra coisa.
```

- [ ] **Passo 4: Criar `frontend/packages/ui/src/docs/3-conteudo-e-voz/2-Glossario.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { Tabela } from '../blocos/Tabela';

<Meta title="Conteúdo e voz/Glossário" />

# Glossário de troca

A bula usa a linguagem do fabricante e da ANVISA. A interface usa a da pessoa. Quando o termo técnico ajudar a achar o trecho na bula de papel ou na caixa, ele vem entre parênteses, depois da palavra simples: "quando não usar (contraindicação)".

## As cinco trocas principais

Estas são as trocas aprovadas com o design system. Aparecem em quase toda resposta.

<Tabela
  titulo="Trocas principais"
  colunas={['Na bula', 'No Bula Clara', 'Exemplo']}
  linhas={[
    ['posologia', 'como tomar', '"Como tomar a losartana?"'],
    ['contraindicação', 'quando não usar', '"Quando não devo usar?"'],
    ['reação adversa', 'o que pode fazer mal', '"O que pode me fazer mal?"'],
    ['uso concomitante', 'usar junto', '"Converse com o farmacêutico antes de usar os dois juntos."'],
    ['superdosagem', 'tomar mais do que devia', '"E se eu tomar mais do que devia?"'],
  ]}
/>

## Outras trocas

<Tabela
  titulo="Outras palavras da bula e o que usar no lugar"
  colunas={['Na bula', 'No Bula Clara', 'Exemplo']}
  linhas={[
    ['interação medicamentosa', 'usar junto, combinação', '"A bula pede cuidado com essa combinação"'],
    ['medicamento', 'remédio', '"Meus remédios". No selo de procedência continua "Bula oficial ANVISA"'],
    ['administrar, ingerir', 'tomar', '"Tome com água"'],
    ['via oral', 'pela boca, engolir', '"Engula o comprimido inteiro"'],
    ['hipersensibilidade', 'alergia', '"Se você tem alergia à dipirona"'],
    ['suspender, interromper o tratamento', 'parar de tomar', '"Não pare nenhum remédio por conta própria"'],
    ['prescrição', 'receita', '"Siga a dose da sua receita"'],
    ['profissional de saúde', 'médico ou farmacêutico', '"Pergunte ao farmacêutico"'],
    ['gestante', 'grávida', '"Se você está grávida"'],
    ['lactante', 'quem está amamentando', '"Se você está amamentando"'],
    ['uso pediátrico', 'para crianças', '"Este remédio é para crianças a partir de 12 anos"'],
    ['em jejum', 'em jejum (sem comer antes)', '"Tome em jejum (sem comer antes)"'],
    ['cefaleia', 'dor de cabeça', '"Pode dar dor de cabeça"'],
    ['náusea', 'enjoo', '"Pode dar enjoo"'],
    ['prurido', 'coceira', '"Coceira na pele"'],
    ['edema', 'inchaço', '"Inchaço nas pernas"'],
    ['hipertensão arterial, anti-hipertensivo', 'pressão alta, remédio para pressão', '"Pode diminuir o efeito do remédio para pressão"'],
    ['hipoglicemia', 'açúcar baixo no sangue', '"Pode baixar demais o açúcar no sangue"'],
    ['insuficiência renal, função renal', 'problema nos rins, os rins', '"Pode forçar os rins"'],
    ['insuficiência hepática', 'problema no fígado', '"Se você tem problema no fígado"'],
  ]}
/>

## As 9 seções da bula

A bula do paciente segue a RDC 47/2009, com 9 seções escritas como perguntas. Na ficha do remédio elas aparecem numeradas, na mesma ordem da bula de papel, com uma pergunta mais curta.

<Tabela
  titulo="Títulos das seções na ficha do remédio"
  colunas={['Seção', 'Na bula', 'Na ficha']}
  linhas={[
    ['1', 'Para que este medicamento é indicado?', 'Para que serve?'],
    ['2', 'Como este medicamento funciona?', 'Como ele funciona?'],
    ['3', 'Quando não devo usar este medicamento?', 'Quando não devo usar?'],
    ['4', 'O que devo saber antes de usar este medicamento?', 'O que devo saber antes de usar?'],
    ['5', 'Onde, como e por quanto tempo posso guardar este medicamento?', 'Onde e como guardar?'],
    ['6', 'Como devo usar este medicamento?', 'Como devo usar?'],
    ['7', 'O que devo fazer quando eu me esquecer de usar este medicamento?', 'E se eu esquecer uma dose?'],
    ['8', 'Quais os males que este medicamento pode me causar?', 'O que pode me fazer mal?'],
    ['9', 'O que fazer se alguém usar uma quantidade maior do que a indicada deste medicamento?', 'E se eu tomar mais do que devia?'],
  ]}
/>

O chip de fonte cita a seção pelo número ("Losartana · seção 4"), que é o mesmo da bula de papel.

## Palavras que a interface não usa

- **"Seguro" e "pode tomar"** sobre um remédio ou uma combinação. A bula não garante segurança para uma pessoa específica, e a interface também não.
- **"Recomendamos" e "você deve"** sobre dose, troca ou suspensão. Isso é papel do médico. A interface diz o que a bula diz: "A bula diz para tomar…".
- **"Infelizmente", "Ops" e pedidos de desculpa** em mensagem de erro. Diga o que aconteceu e o que fazer.
- **"Usuário" e "paciente"** falando com a pessoa. Use "você".
- **Siglas sem explicação.** "SAMU 192" pode, porque o número vem junto. "RDC" e "DCB" não aparecem na interface.
```

- [ ] **Passo 5: Criar `frontend/packages/ui/src/docs/3-conteudo-e-voz/3-TextosDaInterface.mdx`**

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { FacaNaoFaca } from '../blocos/FacaNaoFaca';
import { Tabela } from '../blocos/Tabela';
import { TextosComLeitura } from '../blocos/Legibilidade';

<Meta title="Conteúdo e voz/Textos da interface" />

# Textos da interface

Estes são os textos fixos da interface, estado por estado, como aparecem nas telas aprovadas pelo grupo. Use como estão. Se precisar mudar um, mude aqui primeiro e confira o índice de Flesch, calculado na hora pela mesma conta de `scripts/avaliar.py`. A meta é 50 ou mais. O Flesch foi pensado para trechos de texto. Numa frase de menos de 10 palavras, uma palavra comprida decide o resultado ("Checando interações…" daria menos de zero), e a tabela mostra "Texto curto". Nesses casos, vale a regra de usar palavras do dia a dia.

## Quem escreve cada texto

A coluna "Quem escreve" diz de onde o texto vem:

- **Interface:** o texto está nesta página e o app usa exatamente ele.
- **Backend:** o texto vem pronto da API, e a interface só mostra. Aparece aqui para quem desenha a tela saber o que vai caber. Mudanças nesses textos são feitas no backend, nunca no app.

Os textos de segurança não aparecem nesta página de propósito. Emergência (intoxicação, overdose e autolesão), mudança de dose, grupos especiais e o aviso legal vêm sempre do backend, com regras fixas e testadas em `bula_clara/agentes/seguranca.py`, como o `docs/etica.md` exige. A interface escolhe o componente pela `categoria_risco` e cuida só do layout e dos botões de ligar, na ordem dos `contatos` que o backend mandar.

## Rótulos fixos

<Tabela
  titulo="Rótulos que aparecem em várias telas"
  colunas={['Onde', 'Texto']}
  linhas={[
    ['Faixa fixa no topo (EmergencyBar)', 'Emergência? Ligue 192'],
    ['Barra de navegação', 'Perguntar · Meus remédios · Sobre'],
    ['Rótulo acima da pergunta feita', 'Sua pergunta'],
    ['Remédios da lista considerados na resposta', 'Considerando também: metformina'],
    ['Botão de ouvir, na resposta e na ficha', 'Ouvir resposta · Ouvir esta página'],
    ['Chip de fonte (SourceChip)', '[1] Na bula: Losartana · seção 4'],
    ['Passos da resposta, recolhidos (ReasoningSteps)', 'Como chegamos nesta resposta'],
    ['Sugestões de seguimento', 'Perguntar mais'],
    ['Ação de saída depois de uma resposta', 'Outra pergunta'],
    ['Índice da ficha do remédio', 'Nesta bula'],
    ['Trecho destacado na ficha', 'Citado na sua resposta'],
  ]}
/>

Rótulos de bloco, como "Sua pergunta", usam o estilo `rotulo`, em caixa alta. O texto continua escrito normalmente no código, e a caixa alta vem do CSS, para o leitor de tela não soletrar.

## Primeira visita e lista vazia

<TextosComLeitura
  titulo="Estados vazios"
  textos={[
    { situacao: 'Perguntar, primeira visita (título)', texto: 'Tire sua dúvida sobre um remédio', dono: 'interface' },
    { situacao: 'Perguntar, primeira visita (explicação)', texto: 'Eu explico a bula oficial da ANVISA com palavras simples.', dono: 'interface', acao: 'Fotografar a caixa · Perguntar falando' },
    { situacao: 'Perguntar, acima dos exemplos', texto: 'Ou toque num exemplo', dono: 'interface' },
    { situacao: 'Perguntar, atalho da lista vazia', texto: 'Seus remédios: nenhum ainda. Adicione os remédios que você usa para eu checar interações.', dono: 'interface', acao: 'Adicionar' },
    { situacao: 'Meus remédios, explicação no topo', texto: 'Uso esta lista para checar interações em cada pergunta.', dono: 'interface', acao: 'Adicionar remédio' },
    { situacao: 'Meus remédios, lista vazia', texto: 'Nenhum remédio na lista.', dono: 'interface' },
  ]}
/>

Os exemplos de pergunta da primeira visita são "Posso tomar ibuprofeno com losartana?" e "Posso dobrar a dose da losartana?". O segundo mostra, de propósito, como o Bula Clara recusa um pedido de mudança de dose.

## Carregando

A resposta pode levar mais de 10 segundos, então o status mostra a etapa atual. O texto vai numa região `aria-live="polite"`, e é a única coisa anunciada por ela. Quando a resposta chega, o foco vai para o título da resposta e o leitor de tela começa dali, sem ler a resposta duas vezes.

<TextosComLeitura
  titulo="Etapas do carregamento (LoadingStatus no artifact)"
  textos={[
    { situacao: 'Etapa 1', texto: 'Identificando os remédios…', dono: 'interface' },
    { situacao: 'Etapa 2', texto: 'Lendo a bula…', dono: 'interface' },
    { situacao: 'Etapa 3', texto: 'Checando interações…', dono: 'interface' },
    { situacao: 'Etapa 4', texto: 'Conferindo a segurança…', dono: 'interface' },
    { situacao: 'Etapa 2, quando o remédio já é conhecido', texto: 'Lendo a bula da losartana…', dono: 'interface' },
  ]}
/>

## Confirmar antes de perguntar

Depois da foto ou da voz, a pessoa sempre confirma o que o sistema entendeu antes de a pergunta ir para a API. Isso reduz o risco de responder sobre o remédio errado (risco R3 em `docs/definicoes.md`).

<TextosComLeitura
  titulo="Confirmação da foto e da voz (OcrConfirm e TranscriptConfirm; CaptureConfirm no artifact)"
  textos={[
    { situacao: 'Foto lida (rótulo)', texto: 'Li na caixa', dono: 'interface' },
    { situacao: 'Foto lida (o que foi lido, em destaque)', texto: 'Losartana potássica 50 mg', dono: 'interface' },
    { situacao: 'Foto lida (pergunta)', texto: 'É esse o remédio?', dono: 'interface', acao: 'Sim, perguntar sobre ele · Não, vou digitar o nome' },
    { situacao: 'Foto lida (nota abaixo dos botões)', texto: 'A foto é usada só para ler o nome e não é guardada.', dono: 'interface' },
    { situacao: 'Câmera, guia de enquadramento', texto: 'Enquadre o nome do remédio aqui', dono: 'interface' },
    { situacao: 'Foto sem nenhum remédio reconhecido', texto: 'Não consegui ler o nome na foto. Tente com mais luz, ou digite o nome que está na caixa.', dono: 'interface', acao: 'Tirar outra foto · Digitar o nome' },
    { situacao: 'Voz transcrita (rótulo)', texto: 'Entendi', dono: 'interface' },
    { situacao: 'Voz transcrita (o que foi entendido, em destaque)', texto: '“Posso tomar ibuprofeno com losartana?”', dono: 'interface' },
    { situacao: 'Voz transcrita (pergunta)', texto: 'Está certo?', dono: 'interface', acao: 'Sim, perguntar · Não, vou escrever' },
  ]}
/>

O nome lido e a pergunta transcrita mudam a cada vez. O resto do texto é fixo. A nota "A foto é usada só para ler o nome e não é guardada" só vale se o endpoint `/ler-caixa` (issue #24) de fato não guardar a imagem. Se isso mudar, o texto muda junto.

## Erros

<TextosComLeitura
  titulo="Mensagens de erro"
  textos={[
    { situacao: 'API fora do ar', texto: 'Não consegui falar com o Bula Clara agora. Tente de novo em alguns minutos. Se a dúvida não pode esperar, fale com o farmacêutico.', dono: 'interface', acao: 'Tentar de novo' },
    { situacao: 'Resposta da API fora do formato esperado', texto: 'Não consegui montar a resposta com segurança. O farmacêutico pode te ajudar.', dono: 'interface' },
    { situacao: 'Sem conexão', texto: 'Sem conexão: preciso da internet para ler a bula.', dono: 'interface', acao: 'Tentar de novo' },
    { situacao: 'Câmera negada', texto: 'A câmera está bloqueada para o Bula Clara. Você pode digitar o nome do remédio.', dono: 'interface', acao: 'Digitar o nome' },
    { situacao: 'Microfone negado', texto: 'O microfone está bloqueado para o Bula Clara. Você pode escrever a sua pergunta.', dono: 'interface', acao: 'Escrever a pergunta' },
    { situacao: 'Meus remédios, nome não encontrado na busca', texto: 'Não achei esse remédio. Confira o nome na caixa.', dono: 'interface' },
    { situacao: 'Remédio não identificado na pergunta (título)', texto: 'Não consegui identificar o remédio.', dono: 'backend' },
    { situacao: 'Remédio não identificado na pergunta (explicação)', texto: 'Escreva o nome como aparece na caixa, por exemplo "losartana". Ou fotografe a caixa. Na dúvida, pergunte ao farmacêutico.', dono: 'backend', acao: 'Fotografar a caixa' },
    { situacao: 'A bula não tem a informação', texto: 'Não encontrei essa informação na bula dos medicamentos que tenho na base. Pergunte ao farmacêutico — ele pode ajudar na hora.', dono: 'backend' },
  ]}
/>

Quando a resposta da API vem fora do formato, a faixa de emergência continua na tela e nenhum aviso de segurança aparece pela metade. Essa mensagem é a da spec com o fim trocado: "Pergunte ao farmacêutico" deixava o índice em 41, e "O farmacêutico pode te ajudar", que é a forma da regra 5, leva a 52. Nas mensagens de câmera e microfone negados, uma linha abaixo explica como liberar o acesso nas configurações do navegador, para quem quiser.

Os textos do backend são os das telas aprovadas. A explicação de remédio não identificado fica abaixo da meta de Flesch, e a #23 pode simplificar quando levar o texto para o backend. Hoje o `seguranca.py` ainda manda versões mais antigas (por exemplo, "Não consegui identificar o medicamento, ou ele ainda não está na minha base…"), e a issue #23 alinha as mensagens a este guia.

## Interação entre remédios

Os títulos saem da seção da bula onde a frase foi achada, sem nenhuma inferência. A frase da bula sempre aparece logo abaixo, como evidência, com o remédio e a seção.

<TextosComLeitura
  titulo="Textos do InteractionCallout"
  textos={[
    { situacao: 'Frase achada em "Quando não devo usar?" (título)', texto: 'A bula diz para não usar junto', dono: 'interface' },
    { situacao: 'Frase achada em "O que devo saber antes de usar?" (título)', texto: 'A bula pede cuidado com essa combinação', dono: 'interface' },
    { situacao: 'Ação abaixo dos dois primeiros níveis', texto: 'Converse com o farmacêutico antes de tomar os dois juntos.', dono: 'interface' },
    { situacao: 'Nenhuma frase achada para o par (título)', texto: 'Ibuprofeno e metformina: a bula não fala dessa combinação', dono: 'interface' },
    { situacao: 'Nenhuma frase achada para o par (sempre junto)', texto: 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.', dono: 'interface' },
  ]}
/>

O primeiro título ainda depende de uma validação. Uma frase na seção "Quando não devo usar" nem sempre quer dizer "não use os dois juntos". Antes de o app fixar esse texto, o agente de interações precisa rodar nos pares do gabarito (`data/avaliacao/interacoes.jsonl`) com as bulas reais. Se aparecerem falsos "não usar junto", o título passa a ser "A bula cita essa combinação em 'Quando não usar'", com a ação "Fale com o médico antes de usar os dois juntos".

## Selo de procedência

<Tabela
  titulo="Selo de procedência (ProvenanceSeal)"
  colunas={['Situação', 'Texto']}
  linhas={[
    ['Bula com data registrada', 'Bula oficial ANVISA · Losartana, versão de 03/2025'],
    ['Bula sem data registrada', 'Bula oficial ANVISA · Hidroclorotiazida · data da versão não informada'],
    ['Resposta com duas bulas', 'Bula oficial ANVISA · Losartana, versão de 03/2025 · Ibuprofeno, versão de 11/2024'],
    ['Na ficha do remédio, abaixo do nome', 'Bula oficial ANVISA · versão de 03/2025'],
  ]}
/>

Sem data, o selo diz que a data não foi informada. Ele nunca mostra uma data inventada ou estimada.

## Perguntar mais

As sugestões de seguimento saem de modelos fixos no frontend, sem LLM, e aparecem como chips.

<Tabela
  titulo="Modelos de Perguntar mais"
  colunas={['Modelo', 'Quando aparece', 'Exemplo']}
  linhas={[
    [<code>Como tomar {'{o/a remédio}'}?</code>, 'Quando a resposta não foi sobre como tomar', '"Como tomar a losartana?"'],
    [<code>Para que serve {'{o/a remédio}'}?</code>, 'Quando a resposta não foi sobre para que serve', '"Para que serve o ibuprofeno?"'],
    [<code>E com {'{outro remédio da lista}'}?</code>, 'Uma vez para cada outro remédio da lista', '"E com paracetamol?"'],
  ]}
/>

O artigo concorda com o remédio: "a losartana", mas "o ibuprofeno" e "o omeprazol". Para isso, o app precisa saber o gênero de cada nome da base. Enquanto essa informação não existir, a sugestão sai sem artigo ("Como tomar omeprazol?"), que soa um pouco seca mas nunca sai errada.

Nenhum modelo sugere pergunta sobre dose, troca ou suspensão. Essas perguntas são bloqueadas pelo backend, e oferecer uma seria mandar a pessoa direto para um bloqueio.

## Meus remédios e consentimento

O texto de privacidade precisa ser verdadeiro. A lista vai para a API a cada pergunta (`medicamentos_em_uso`), porque é assim que as interações são checadas. Por isso a interface nunca diz que "nada é enviado". O que ela pode dizer, porque é verdade, é que a lista não fica guardada em servidor nenhum.

<TextosComLeitura
  titulo="Textos de Meus remédios (MedicationList e Switch)"
  textos={[
    { situacao: 'Interruptor (título)', texto: 'Lembrar neste aparelho', dono: 'interface' },
    { situacao: 'Interruptor desligado (explicação)', texto: 'Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor.', dono: 'interface' },
    { situacao: 'Interruptor ligado (explicação)', texto: 'Ligado: a lista fica salva só neste navegador. Desligar apaga na hora.', dono: 'interface' },
    { situacao: 'Botão (variante perigo)', texto: 'Apagar tudo', dono: 'interface' },
    { situacao: 'Depois de apagar (Toast)', texto: 'Lista apagada deste aparelho.', dono: 'interface' },
    { situacao: 'Botão de remover um remédio (nome acessível)', texto: 'Remover losartana', dono: 'interface' },
  ]}
/>

O interruptor começa sempre desligado, e a explicação aparece antes de a pessoa ligar. "Apagar tudo" apaga na hora e confirma com o Toast. Desligar o interruptor também apaga a lista do aparelho na hora.

<FacaNaoFaca
  faca={['Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor.']}
  naoFaca={['Seus dados ficam só no seu aparelho. Nada é enviado para servidores.', 'Ao continuar, você concorda com o armazenamento de dados.']}
/>

A voz segue a mesma regra. Qualquer texto sobre o que acontece com o áudio, ou com a resposta lida em voz alta, só é escrito depois da issue #24, que decide como a voz vai funcionar, e precisa descrever exatamente o que ela faz.
```

- [ ] **Passo 6: Conferir**

```bash
pnpm typecheck && pnpm lint
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `12 páginas, 0 com problema`.

- [ ] **Passo 7: Conferir a conta do Flesch contra `scripts/avaliar.py`**

Na raiz do repositório (fora de `frontend/`), este trecho tira as duas funções de `scripts/avaliar.py` sem importar o resto do arquivo, que carrega o pipeline inteiro:

```bash
cd ..
python3 - <<'EOF'
import ast, re
mod = ast.parse(open('scripts/avaliar.py').read())
ns = {'re': re}
for n in mod.body:
    if isinstance(n, ast.FunctionDef) and n.name in ('silabas', 'flesch_pt'):
        exec(compile(ast.Module([n], []), 'avaliar.py', 'exec'), ns)
for t in ['Não consegui falar com o Bula Clara agora. Tente de novo em alguns minutos. Se a dúvida não pode esperar, fale com o farmacêutico.',
          'Não consegui montar a resposta com segurança. O farmacêutico pode te ajudar.',
          'A câmera está bloqueada para o Bula Clara. Você pode digitar o nome do remédio.']:
    print(round(ns['flesch_pt'](t)))
EOF
cd frontend
```

Esperado: `79`, `52` e `72`, os mesmos números da coluna Flesch da página Conteúdo e voz/Textos da interface, nas linhas "API fora do ar", "Resposta da API fora do formato esperado" e "Câmera negada".

- [ ] **Passo 8: Ver a conferência pegar um texto difícil**

Guarde uma cópia da página, troque um texto da interface por um texto difícil e rode a conferência:

```bash
cp packages/ui/src/docs/3-conteudo-e-voz/3-TextosDaInterface.mdx /tmp/textos-da-interface.mdx
sed -i.bak "s/texto: 'Converse com o farmacêutico antes de tomar os dois juntos.'/texto: 'Recomenda-se consultar o profissional farmacêutico anteriormente à administração concomitante dos medicamentos mencionados.'/" packages/ui/src/docs/3-conteudo-e-voz/3-TextosDaInterface.mdx
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `FALHA Conteúdo e voz/Textos da interface | abaixo da meta: 1` e `12 páginas, 1 com problema`. Volte o arquivo e confira de novo:

```bash
cp /tmp/textos-da-interface.mdx packages/ui/src/docs/3-conteudo-e-voz/3-TextosDaInterface.mdx
rm packages/ui/src/docs/3-conteudo-e-voz/3-TextosDaInterface.mdx.bak
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `12 páginas, 0 com problema`.

- [ ] **Passo 9: Commit**

```bash
git add frontend/packages/ui/src/docs/blocos/FacaNaoFaca.tsx frontend/packages/ui/src/docs/blocos/Legibilidade.tsx frontend/packages/ui/src/docs/3-conteudo-e-voz
git commit -m "docs: guia de conteúdo e voz com glossário e textos da interface (#25)"
```

---

### Tarefa 8: Modelo de página de componente e Changelog

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/4-componentes/ModeloDePagina.mdx`, `frontend/packages/ui/src/docs/6-changelog/Changelog.mdx`

O modelo é o que os planos 2 e 3 seguem ao escrever a página de cada componente. Ele usa as stories do `Button` como exemplo vivo (`<Canvas>` e `<ArgTypes>`), sem virar a página do `Button`: a página é avulsa e não tem `<Meta of>`. O trecho de changelog da página veio de um `pnpm changeset version` rodado numa cópia descartável do plano 1.

- [ ] **Passo 1: Criar `frontend/packages/ui/src/docs/4-componentes/ModeloDePagina.mdx`**

````mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as ButtonStories from '../../components/Button/Button.stories';
import { ListaNumerada } from '../blocos/ListaNumerada';

<Meta title="Componentes/Modelo de página" />

# Modelo de página de componente

Todo componente tem uma página de documentação, escrita junto com ele, no mesmo PR. A página fica na pasta do componente, ao lado das stories: `src/components/<Nome>/<Nome>.mdx`. Ela aparece no Storybook como "Docs", dentro do componente.

## O que toda página tem

Nesta ordem, e sem pular seção. Se uma seção não se aplica, escreva por quê numa frase.

<ListaNumerada>

1. **Nome e uma frase** dizendo o que o componente faz, do ponto de vista de quem usa o app.
2. **Exemplo principal**, com a story mais comum (`<Canvas>`).
3. **Quando usar.**
4. **Quando não usar**, apontando o componente certo para cada caso. Exemplo: "Para confirmar uma ação, use `Toast`. Para avisar sobre o estado da tela, use `Alert`."
5. **Anatomia:** as partes do componente, com o nome de cada uma. Uma lista basta.
6. **Props**, com o bloco `<ArgTypes>`. Escreva um comentário `/** … */` em cada prop no `.tsx`, porque é dali que sai a descrição da tabela.
7. **Estados**, com uma story para cada um: normal, foco, pressionado, desabilitado, carregando, erro, o que se aplicar.
8. **Acessibilidade:** papel (`role`), nome acessível, o que o teclado faz, o que o leitor de tela anuncia e o que muda no alto contraste e no A+ de 140%.
9. **Conteúdo:** que texto vai no componente e qual regra de **Conteúdo e voz** se aplica.
10. **Faça e não faça**, com pelo menos um par.

</ListaNumerada>

## Esqueleto

Copie e preencha. O `<Meta of>` liga a página às stories do componente.

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Nome.stories';

<Meta of={Stories} />

# Nome

Uma frase sobre o que ele faz.

<Canvas of={Stories.Principal} />

## Quando usar

## Quando não usar

## Anatomia

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Desabilitado} />

## Acessibilidade

## Conteúdo

## Faça e não faça
```

## Como fica, usando o Button

O exemplo principal do `Button`:

<Canvas of={ButtonStories.Primaria} />

E a tabela de props, gerada a partir do `.tsx`:

<ArgTypes of={ButtonStories} />

Uma seção de acessibilidade do `Button` ficaria assim:

> Usa o `Button` do React Aria, que tem papel `button` e responde a Enter e a Espaço. O nome acessível é o texto do botão, que diz a ação ("Apagar tudo", e nunca "OK"). O ícone é decorativo e fica escondido do leitor de tela. O foco pelo teclado mostra o contorno de 3 px com halo. A área de toque tem pelo menos 48 px nos três tamanhos de texto. A variante `perigo` não depende só da cor: o texto já diz que a ação apaga.

## Antes de dar a página por pronta

- Todas as stories da página passam no axe (o teste falha se não passarem).
- Os exemplos usam dados realistas: nomes de remédio da base, como losartana e metformina, e nunca "Lorem ipsum" ou "Remédio 1".
- Os textos dos exemplos seguem **Conteúdo e voz**.
- A página foi lida com o controle **Contraste** em "Alto contraste" e o **Texto** em 140%.
````

- [ ] **Passo 2: Criar `frontend/packages/ui/src/docs/6-changelog/Changelog.mdx`**

````mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Changelog" />

# Changelog

O histórico de versões dos pacotes é gerado pelo [Changesets](https://github.com/changesets/changesets), a partir das frases que cada PR deixa em `frontend/.changeset/`. Esta página explica onde ele fica e como ler.

## Onde fica

Cada pacote tem o seu:

- `frontend/packages/tokens/CHANGELOG.md`, de `@bula-clara/tokens`;
- `frontend/packages/ui/CHANGELOG.md`, de `@bula-clara/ui`.

Os dois arquivos só aparecem na primeira vez que alguém fecha uma versão. Até lá, as mudanças ficam esperando em `frontend/.changeset/`, uma por arquivo `.md`. Para ver o que está esperando:

```bash
cd frontend
pnpm changeset status
```

## Como uma versão é fechada

Quando o grupo decide fechar uma versão, normalmente antes do PR da `dev` para a `main`, alguém roda:

```bash
cd frontend
pnpm changeset version
```

O comando junta os changesets pendentes, sobe a versão em cada `package.json`, escreve as frases no `CHANGELOG.md` de cada pacote e apaga os arquivos de `.changeset/` que usou. O resultado entra num commit normal, revisado no PR como qualquer outra mudança. Os pacotes são privados (`"private": true`) e não são publicados no npm: a versão serve para o grupo saber o que mudou e quando.

## Como ler

Um trecho de `frontend/packages/ui/CHANGELOG.md`:

```md
# @bula-clara/ui

## 0.1.0

### Minor Changes

- Primeira versão: tokens dos temas padrão e alto contraste, e os componentes Button, IconButton e VisuallyHidden.

### Patch Changes

- Updated dependencies
  - @bula-clara/tokens@0.1.0
```

- `## 0.1.0` é a versão. A mais nova fica no topo.
- **Major Changes** são mudanças que obrigam quem usa a mexer no código, como uma prop renomeada ou um token removido. Leia sempre antes de atualizar.
- **Minor Changes** trazem algo novo sem quebrar o que já existe, como um componente ou uma variante.
- **Patch Changes** são correções. "Updated dependencies" quer dizer que o pacote subiu de versão só porque um pacote de que ele depende subiu, aqui o `@bula-clara/tokens`.

Os títulos das seções saem em inglês, porque são gerados pelo Changesets. As frases de cada mudança são escritas por quem fez o PR, em português, para quem usa o pacote.

Enquanto os pacotes estiverem em `0.x`, evite changeset do tipo major: ele leva a versão direto para `1.0.0`. A primeira versão estável fica para quando o grupo decidir.
````

- [ ] **Passo 3: Conferir**

```bash
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `14 páginas, 0 com problema`, com `ok    Componentes/Modelo de página` e `ok    Changelog` no fim.

- [ ] **Passo 4: Conferir a ordem da barra lateral**

```bash
node -e "const e=require('./packages/ui/storybook-static/index.json').entries; for (const v of Object.values(e)) if (v.type==='docs') console.log(v.title)"
```

Esperado, nesta ordem:

```
Introdução/Comece aqui
Introdução/Como contribuir
Fundamentos/Cores
Fundamentos/Tipografia
Fundamentos/Espaçamento
Fundamentos/Forma
Fundamentos/Movimento
Fundamentos/Ícones
Fundamentos/Temas
Conteúdo e voz/Voz e regras
Conteúdo e voz/Glossário
Conteúdo e voz/Textos da interface
Componentes/Modelo de página
Changelog
```

Se o plano 2 ou o 3 já tiver entrado no seu worktree, as páginas de componente e de padrões aparecem também. Elas não mudam a ordem das páginas acima.

- [ ] **Passo 5: Commit**

```bash
git add frontend/packages/ui/src/docs/4-componentes frontend/packages/ui/src/docs/6-changelog
git commit -m "docs: modelo de página de componente e changelog (#25)"
```

---

### Tarefa 9: ADR da arquitetura

**Arquivos:**
- Criar: `docs/adr/0001-arquitetura-do-design-system.md`

O ADR registra as decisões de arquitetura da spec num formato curto: contexto, decisão, consequências e alternativas consideradas.

- [ ] **Passo 1: Criar `docs/adr/0001-arquitetura-do-design-system.md`**

```md
# ADR 0001: arquitetura do design system e da interface web

**Status:** aceito
**Data:** 26/11/2026
**Issue:** #25
**Spec:** `docs/design-system.md`

## Contexto

O Bula Clara funciona pela linha de comando e por uma API em FastAPI. Para chegar a idosos, cuidadores, pessoas com baixa visão e pessoas com dificuldade de leitura, ele precisa de uma interface web. Essa interface mostra informação de saúde, então erro de leitura, de contraste ou de foco tem custo alto. Ela também precisa respeitar o `docs/etica.md`: nenhum dado de saúde vai para terceiros e nada é guardado sem consentimento.

O grupo é pequeno e a interface vai crescer aos poucos. Sem uma base comum, cada tela acaba com seu próprio botão e sua própria cor, e a acessibilidade fica para ser conferida no fim, quando sobra tempo.

## Decisão

1. **Um pnpm workspace em `frontend/`**, no mesmo repositório do backend, com três pacotes: `@bula-clara/tokens`, `@bula-clara/ui` e, na próxima frente, `apps/web`. O app só usa o que está nos dois pacotes do design system. Se faltar um componente, ele entra primeiro em `packages/ui`.
2. **Tokens em JSON no formato DTCG, gerados pelo Style Dictionary**, em três camadas: primitivos, semânticos e de componente. Componentes só usam tokens semânticos ou de componente, e um tema troca só a camada semântica. O build gera variáveis CSS e um bloco `@theme` do Tailwind v4 que aponta para elas. A paleta e as fontes padrão do Tailwind ficam desligadas.
3. **Dois temas: padrão e alto contraste (AAA).** O alto contraste liga por `prefers-contrast: more` ou por `data-contraste="alto"` no `<html>`. O modo escuro fica só preparado.
4. **Componentes sobre React Aria Components**, com React 19 e TypeScript strict. Teclado, foco e ARIA vêm do React Aria, que é testado com leitores de tela, em vez de serem escritos à mão.
5. **Acessibilidade verificada no CI.** Um teste recalcula o contraste de cada par de cores nos dois temas. Cada story do Storybook roda num Chromium pelo `@storybook/addon-vitest` e passa pelo axe em modo de erro. O lint usa `jsx-a11y` no modo estrito. O que o axe não pega fica num checklist manual (`docs/acessibilidade/checklist-manual.md`).
6. **O Storybook é o site do design system.** Ele sai como artefato de cada PR. Publicar no GitHub Pages depende de um admin da organização e fica como passo opcional.
7. **Versões com Changesets** nos pacotes `tokens` e `ui`, que são privados e não vão para o npm.
8. **Contrato com a API gerado a partir do OpenAPI.** O backend declara `response_model` em todos os endpoints. Um script exporta o OpenAPI sem subir o servidor, o frontend gera dele o cliente, os tipos e os schemas zod, e toda resposta é validada ao chegar. Se vier fora do formato, a interface falha de forma segura e mantém a faixa de emergência. A API não é versionada, porque front e back saem juntos do mesmo repositório e da mesma origem.
9. **Privacidade na arquitetura.** Fontes auto-hospedadas (Fontsource), nenhum nome de remédio na URL do app, `Cache-Control: no-store` nas respostas com dado de saúde, service worker que guarda só o shell do app e voz só por caminhos que não mandam texto ou áudio para terceiros.
10. **O texto de segurança tem uma fonte só: o backend.** A interface escolhe o componente pela `categoria_risco` e cuida do layout, sem reescrever nem completar mensagens de emergência ou de bloqueio.

## Consequências

- Mudar uma cor é mudar um token: o teste de contraste diz na hora se o par ainda passa, e as páginas de Fundamentos do Storybook mostram o valor novo.
- Toda tela nova depende de componentes que já existem ou que entram primeiro no design system. Isso deixa a primeira tela mais lenta e as seguintes bem mais rápidas.
- O CI do frontend roda um Chromium, então o job fica mais lento que o do Python.
- O React Aria e o Storybook são dependências grandes de desenvolvimento. O que vai para o navegador da pessoa é só o que o app importa, e a meta continua sendo menos de 150 KB de JavaScript inicial (gzip).
- O axe nas stories não cobre as páginas de documentação em MDX nem a ordem de leitura com leitor de tela. Esses casos dependem do checklist manual.
- Tirar o gTTS da interface e criar `/ler-caixa` e `/transcrever` passa a ser pré-requisito do app (issues #22, #23 e #24).

## Alternativas consideradas

- **App nativo:** fica fora agora. A web responsiva instalável como PWA chega a qualquer celular sem loja de aplicativos.
- **Componentes estilizados sem uma biblioteca de comportamento (só Tailwind):** teclado e ARIA ficariam por conta do grupo, que é exatamente onde mais se erra.
- **Test-runner antigo do Storybook:** o addon de Vitest roda as stories no mesmo Vitest dos testes de unidade, com um comando só.
- **Google Fonts:** cada visita avisaria o Google, o que fere o `docs/etica.md`.
```

- [ ] **Passo 2: Conferir os caminhos citados**

```bash
cd ..
for f in docs/design-system.md docs/etica.md docs/acessibilidade/checklist-manual.md; do test -e "$f" && echo "ok $f" || echo "falta $f"; done
cd frontend
```

Esperado: `ok` nos dois primeiros e `falta docs/acessibilidade/checklist-manual.md`, que nasce na próxima tarefa.

- [ ] **Passo 3: Commit**

```bash
git add ../docs/adr/0001-arquitetura-do-design-system.md
git commit -m "docs: ADR da arquitetura do design system (#25)"
```

---

### Tarefa 10: Checklist manual de acessibilidade

**Arquivos:**
- Criar: `docs/acessibilidade/checklist-manual.md`

O checklist cobre o que o axe não vê: VoiceOver no iOS, TalkBack no Android, só teclado, zoom de 200% e reflow em 320 px. Ele tem uma parte geral, uma por componente (inclusive os que ainda não existem, para quem for fazê-los saber o que vai ser conferido), o roteiro do teste com colegas da #13 e o modelo de registro.

- [ ] **Passo 1: Criar `docs/acessibilidade/checklist-manual.md`**

````md
# Checklist manual de acessibilidade

O axe roda em todas as stories do Storybook e reprova o CI quando acha um problema, mas ele só vê o que dá para medir no código. Se o leitor de tela lê as coisas na ordem certa, se um nome faz sentido em voz alta, se o foco some atrás de um painel ou se a tela vaza com o texto em 140%, só uma pessoa testando descobre. Este checklist cobre essa parte.

Quando usar:

- antes de dar um componente novo por pronto (seção "Por componente");
- antes de cada PR da `dev` para a `main` (seção "Geral", nas telas que mudaram);
- no teste de uso com colegas, a issue #13 (seção "Roteiro do teste com colegas").

O critério de pronto do design system (#25) pede este checklist feito pelo menos uma vez com VoiceOver ou TalkBack.

## Preparação

### Abrir o Storybook no celular

No computador, dentro de `frontend/`, gere o build e sirva a pasta na rede local:

```bash
pnpm --filter @bula-clara/tokens build
pnpm build-storybook
python3 -m http.server 6006 --bind 0.0.0.0 --directory packages/ui/storybook-static
```

O celular precisa estar na mesma rede Wi-Fi. Descubra o IP do computador (`ipconfig getifaddr en0` no macOS, `hostname -I` no Linux) e abra no celular `http://<ip>:6006`. Se não abrir, o firewall do computador pode estar bloqueando a porta 6006. Também dá para baixar o artefato `storybook` de um PR, no GitHub Actions, e servir a pasta do mesmo jeito.

A interface do Storybook é apertada no celular. Para testar um componente, abra a story sozinha, sem a moldura:

```
http://<ip>:6006/iframe.html?viewMode=story&id=componentes-primitivos-button--primaria
```

O `id` de cada story aparece na barra de endereço quando você clica nela no Storybook. Para ligar o alto contraste e o texto em 140% direto pela URL, acrescente:

```
&globals=contraste:alto;escala:140
```

### Ligar os leitores de tela

**VoiceOver (iPhone):** Ajustes > Acessibilidade > VoiceOver. Para ligar e desligar rápido, configure o atalho em Ajustes > Acessibilidade > Atalho de Acessibilidade e clique três vezes no botão lateral. Gestos básicos: deslizar um dedo para a direita ou para a esquerda passa de um item para outro, toque duplo ativa, o rotor (girar dois dedos na tela) escolhe navegar por títulos, links ou controles de formulário.

**TalkBack (Android):** Configurações > Acessibilidade > TalkBack. O atalho mais comum é segurar as duas teclas de volume por 3 segundos. Gestos básicos: deslizar para a direita ou para a esquerda passa de item, toque duplo ativa, deslizar para cima e depois para a direita abre o menu do TalkBack.

Anote a versão do sistema e do navegador. O mesmo componente pode se comportar diferente no Safari e no Chrome.

### Só teclado

No computador, sem tocar no mouse: `Tab` e `Shift+Tab` andam entre os controles, `Enter` e `Espaço` ativam, `Esc` fecha painéis e as setas andam dentro de grupos (abas, opções de um rádio, itens de uma lista).

### Zoom de 200% e reflow em 320 px

- Zoom: `Ctrl` e `+` (ou `Cmd` e `+` no Mac) até 200%.
- Reflow: nas ferramentas do desenvolvedor do navegador, use o modo responsivo com 320 px de largura. Teste também com o texto em 140% (`escala:140` na URL).

## Geral

Vale para qualquer tela ou story. Marque cada item como passou, falhou ou não se aplica.

### Leitor de tela

- [ ] Tudo o que aparece na tela é lido, e nada escondido (ícone decorativo, texto repetido) é lido.
- [ ] A ordem de leitura segue a ordem visual.
- [ ] Os títulos são anunciados como títulos e dá para navegar por eles com o rotor (VoiceOver) ou com o menu do TalkBack.
- [ ] Todo botão e todo link têm um nome que diz a ação ("Perguntar falando", e não "botão" ou "microfone").
- [ ] Todo campo anuncia o rótulo visível, e o erro do campo é anunciado quando aparece.
- [ ] Estados são anunciados: selecionado, ligado ou desligado, expandido ou recolhido, desabilitado.
- [ ] A palavra é lida em português (o documento tem `lang="pt-BR"`). Nomes como "losartana" não saem soletrados.
- [ ] Quando a resposta chega, o foco vai para o título dela e a leitura começa dali, sem repetir a resposta.
- [ ] O status de carregamento ("Lendo a bula da losartana…") é anunciado uma vez só.

### Teclado

- [ ] Todo controle é alcançável com `Tab`, na ordem da tela.
- [ ] O foco é sempre visível: contorno escuro com halo amarelo, sobre qualquer fundo.
- [ ] Nada prende o foco, a não ser um Dialog ou Sheet aberto. Ao fechar, o foco volta para o controle que abriu.
- [ ] `Esc` fecha o que está aberto por cima.
- [ ] O link "Pular para o conteúdo" é o primeiro item do `Tab` e funciona.

### Zoom, reflow e tamanho de texto

- [ ] Com zoom de 200%, nada some, nada se sobrepõe e dá para usar tudo.
- [ ] Em 320 px de largura não aparece rolagem para o lado, nem com o texto em 140%.
- [ ] Nomes longos ("Hidroclorotiazida") quebram com hífen em vez de vazar.
- [ ] Nos três tamanhos do A+ (100%, 120% e 140%), os botões continuam com pelo menos 48 px.

### Alto contraste e cor

- [ ] Com `contraste:alto`, todo controle e todo aviso têm borda preta visível.
- [ ] Nenhuma informação depende só de cor: avisos têm título escrito e ícone.
- [ ] Nada fica verde para dizer que um remédio ou uma combinação é segura.
- [ ] Com movimento reduzido ligado no sistema, nada desliza nem gira.

## Por componente

Faça a seção "Geral" na story do componente e acrescente os itens dele. Os componentes ainda não feitos estão aqui para quem for fazê-los saber o que vai ser conferido.

### Button e LinkButton

- [ ] O leitor anuncia "botão" (ou "link", no LinkButton) e o texto. O ícone, quando houver, não é lido.
- [ ] A variante `perigo` ("Apagar tudo") é entendida sem a cor, pelo texto.
- [ ] `Enter` e `Espaço` ativam o Button. O LinkButton abre com `Enter`.
- [ ] Desabilitado é anunciado como indisponível e não recebe toque.

### IconButton

- [ ] O nome anunciado é o `aria-label` e diz a ação. O ícone não é lido.
- [ ] A área de toque tem 48 por 48 px, mesmo com o ícone menor.

### VisuallyHidden e SkipLink

- [ ] O texto escondido é lido junto com o texto visível, na ordem certa ("Na bula: seção 4 (abre a ficha do remédio)").
- [ ] O SkipLink aparece na tela quando recebe foco.

### TextField, TextArea e SearchField

- [ ] O rótulo é visível e é lido. O placeholder nunca é o único rótulo.
- [ ] O erro é anunciado na hora em que aparece, sem a pessoa precisar voltar ao campo.
- [ ] No SearchField, o botão de limpar tem nome ("Limpar busca").

### ComboBox (busca de remédios)

- [ ] O número de sugestões é anunciado enquanto a pessoa digita.
- [ ] As setas andam pelas sugestões, e cada uma é lida.
- [ ] Um nome com erro de digitação ("lozartana") ainda sugere "losartana".
- [ ] Sem resultado, a mensagem "Não achei esse remédio. Confira o nome na caixa." é anunciada.

### Switch, Checkbox e RadioGroup

- [ ] O estado (ligado, marcado, selecionado) é anunciado e muda quando a pessoa ativa.
- [ ] No "Lembrar neste aparelho", a explicação é lida antes de a pessoa ligar.
- [ ] No RadioGroup, as setas mudam a opção e `Tab` sai do grupo.

### Disclosure e Accordion

- [ ] "Expandido" e "recolhido" são anunciados.
- [ ] Na ficha do remédio, a seção citada abre já expandida e o leitor chega nela.

### Dialog e Sheet

- [ ] Ao abrir, o foco vai para dentro e o leitor anuncia o título.
- [ ] O foco não sai do painel enquanto ele está aberto.
- [ ] `Esc` e o botão de fechar fecham, e o foco volta para quem abriu.

### Tabs

- [ ] As setas trocam de aba e o leitor anuncia "aba 1 de 3".

### Tag e TagGroup (chips)

- [ ] Cada chip é lido com o texto inteiro ("Na bula: Losartana · seção 4").
- [ ] Se o chip pode ser removido, o botão de remover tem nome ("Remover losartana").

### Alert e Toast

- [ ] O Alert é anunciado quando aparece, sem tirar o foco do lugar.
- [ ] O Toast só confirma ações ("Lista apagada") e fica na tela tempo suficiente para ser lido, ou até a pessoa fechar.
- [ ] Nenhum aviso de segurança aparece num Toast.

### Spinner, Skeleton, ProgressSteps e o status de carregamento (LoadingStatus no artifact)

- [ ] O status de carregamento tem texto ("Lendo a bula…") e o leitor anuncia cada etapa uma vez.
- [ ] O Skeleton não é lido.
- [ ] O ProgressSteps anuncia a etapa atual ("etapa 2 de 3").

### Heading, Text e Prose

- [ ] Os níveis de título não pulam (de 1 para 3).
- [ ] O texto corrido não passa de 65 caracteres por linha.

### AnswerHeadline e ListenButton

- [ ] A frase-resposta é o primeiro título lido da resposta e recebe o foco quando chega.
- [ ] O ListenButton anuncia o estado ("Ouvir resposta", carregando, tocando, pausado) e não aparece quando não há voz local disponível.
- [ ] Com o VoiceOver ou o TalkBack ligado, a voz do app não atropela a do leitor de tela.

### SourceChip e ProvenanceSeal

- [ ] O chip diz para onde leva ("abre a ficha do remédio").
- [ ] O selo é lido inteiro, inclusive "data da versão não informada" quando faltar a data.

### InteractionCallout e SafetyNotice

- [ ] O título do nível ("A bula pede cuidado com essa combinação") é lido antes da frase da bula.
- [ ] O nível é entendido sem a cor: ícone e título dizem a mesma coisa.
- [ ] O SafetyNotice (bloqueio por dose ou grupo especial) não é vermelho e aponta o próximo passo.

### EmergencyCard e EmergencyBar

- [ ] O EmergencyCard é anunciado na hora (`role="alert"`) e é o primeiro conteúdo da tela.
- [ ] Os botões dizem o número ("Ligar 192 · SAMU"), têm 56 px de altura e abrem o discador.
- [ ] Os telefones aparecem na ordem que o backend mandou.
- [ ] A EmergencyBar não cobre conteúdo com o texto em 140% nem com zoom de 200%.

### MedicationList

- [ ] Cada remédio tem um botão de remover com nome ("Remover dipirona").
- [ ] "Apagar tudo" está visível, apaga na hora e o Toast "Lista apagada deste aparelho." é anunciado.
- [ ] Depois de apagar, o foco vai para um lugar que faz sentido (o campo de busca) e não se perde.

### ReasoningSteps e DemoTrace

- [ ] "Como chegamos nesta resposta" abre e fecha como um Disclosure.
- [ ] O DemoTrace só aparece com `?demo=1`.

### InputDock, CameraCapture, OcrConfirm, VoiceRecorder e TranscriptConfirm (CaptureConfirm no artifact)

- [ ] A caixa de pergunta tem rótulo e não fica escondida pelo teclado do celular.
- [ ] Câmera e microfone têm nome ("Fotografar a caixa", "Perguntar falando").
- [ ] Começo e fim da gravação são avisados por som, vibração e texto.
- [ ] Na confirmação, o que foi lido ou entendido ("Losartana potássica 50 mg") recebe o foco e é lido junto com a pergunta ("É esse o remédio?").
- [ ] Com a câmera ou o microfone negados, aparece a explicação e o caminho por digitação.

### DisclaimerFooter

- [ ] O aviso legal é lido no fim de toda resposta, inclusive nas bloqueadas.

## Roteiro do teste com colegas (#13)

O teste da #13 é com 5 a 8 colegas usando o sistema com perguntas próprias. Ele precisa do app (próxima frente). Enquanto o app não existe, use as partes deste roteiro que funcionam nas stories.

### Regras

- Não colete dados pessoais nem de saúde dos participantes (LGPD). Nada de nome, idade, e-mail ou remédios que a pessoa usa de verdade.
- Use só os remédios do cartão de exemplo abaixo. Se a pessoa quiser perguntar sobre um remédio dela, peça para trocar por um do cartão.
- Identifique cada participante por um código (P1, P2…).
- Quem conduz não ajuda durante a tarefa. Se a pessoa travar por mais de 2 minutos, anote e passe para a próxima.

### Cartão de exemplo

> Você cuida de uma vizinha de 72 anos. Ela toma **losartana 50 mg** para pressão alta e **metformina** para diabetes. Hoje ela está com dor de cabeça e tem **dipirona** em casa.

### Tarefas

1. Descubra para que serve a losartana.
2. Descubra como a metformina deve ser tomada.
3. Descubra se a dipirona pode ser usada junto com a losartana.
4. Coloque os três remédios na lista "Meus remédios" e depois apague a lista inteira.
5. Faça uma pergunta por voz ou por foto da caixa (se o participante quiser e o aparelho permitir).
6. Uma das tarefas acima com o texto em 140% ou com o alto contraste ligado.

Se o participante usa leitor de tela no dia a dia, faça as tarefas com o leitor dele, no aparelho dele.

### O que perguntar depois de cada tarefa

- Você entendeu a resposta? (sim ou não)
- De 1 a 5, quanto você confiaria nessa resposta? (1 = nada, 5 = totalmente)

## Como registrar

Cada rodada de teste vira um arquivo em `docs/acessibilidade/registros/`, com o nome `AAAA-MM-DD-<o-que-foi-testado>.md` (por exemplo, `2026-12-03-voiceover-componentes.md` ou `2026-12-10-teste-colegas.md`). Use o modelo abaixo. Cada item que falhou vira uma issue, com link para o registro, e o registro ganha o número da issue.

```md
# Registro de acessibilidade: <o que foi testado>

- Data: 03/12/2026
- Quem testou: <nome de quem é do grupo>
- Aparelho e sistema: iPhone 12, iOS 26.1
- Navegador: Safari
- Tecnologia: VoiceOver (ou TalkBack, só teclado, zoom 200%, reflow 320 px)
- Versão testada: commit `abc1234` ou link do artefato do PR

## Resultado

| Item | Story ou tela | Resultado | Observação | Issue |
|---|---|---|---|---|
| Nome do botão diz a ação | IconButton / Microfone | passou | | |
| Foco volta para quem abriu | Dialog / Padrão | falhou | O foco vai para o topo da página | #40 |

## Resumo

<duas ou três frases: o que funcionou, o que falhou e o que mais atrapalharia alguém de verdade>
```

Para o teste com colegas, acrescente uma tabela por participante:

```md
## P1

- Usa leitor de tela no dia a dia: não
- Aparelho: Android, Chrome

| Tarefa | Entendeu? | Confiaria (1 a 5) | Tempo | Problemas |
|---|---|---|---|---|
| 1. Para que serve a losartana | sim | 4 | 0:45 | Não achou o botão Ouvir |
| 3. Dipirona com losartana | não | 2 | 2:10 | Achou que "a bula não fala" queria dizer "pode tomar" |
```

O item 3 do exemplo é o tipo de achado mais importante: se alguém entendeu "a bula não fala dessa combinação" como "pode tomar junto", isso é um problema de segurança (risco R4) e vai para o topo da lista.
````

- [ ] **Passo 2: Conferir os nomes citados**

O checklist cita textos e ids de story. Confira que o id do exemplo existe no build e que os textos dos botões batem com as stories do plano 1:

```bash
pnpm build-storybook < /dev/null
node -e "const e=require('./packages/ui/storybook-static/index.json').entries; console.log(Boolean(e['componentes-primitivos-button--primaria']))"
grep -c "Perguntar falando" packages/ui/src/components/IconButton/IconButton.stories.tsx
```

Esperado: `true` e `1`. O endereço com `globals=contraste:alto;escala:140` foi conferido ao escrever este plano: a story abre com `data-contraste="alto"`, `data-escala="140"`, fonte da raiz em 22,4 px e sem rolagem para o lado em 320 px.

- [ ] **Passo 3: Commit**

```bash
git add ../docs/acessibilidade/checklist-manual.md
git commit -m "docs: checklist manual de acessibilidade e roteiro do teste com colegas (#25)"
```

---

### Tarefa 11: Verificação final

- [ ] **Passo 1: Rodar tudo a partir de uma instalação limpa**

```bash
rm -rf node_modules packages/*/node_modules packages/tokens/dist packages/ui/storybook-static
pnpm install --frozen-lockfile
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm build-storybook < /dev/null
node /tmp/bula-clara-conferir-docs.mjs .
```

Esperado: `47 passed` nos tokens, lint e tipos sem erro, `23 passed` no `ui` (as páginas MDX não criam testes), `Storybook build completed successfully` e:

```
ok    Introdução/Comece aqui
ok    Introdução/Como contribuir
ok    Fundamentos/Cores
ok    Fundamentos/Tipografia
ok    Fundamentos/Espaçamento
ok    Fundamentos/Forma
ok    Fundamentos/Movimento
ok    Fundamentos/Ícones
ok    Fundamentos/Temas
ok    Conteúdo e voz/Voz e regras
ok    Conteúdo e voz/Glossário
ok    Conteúdo e voz/Textos da interface
ok    Componentes/Modelo de página
ok    Changelog
14 páginas, 0 com problema
```

- [ ] **Passo 2: Conferir que nada fora do escopo mudou**

```bash
cd ..
git diff --stat HEAD~9 -- . ':(exclude)frontend/packages/ui/src/docs' ':(exclude)docs/adr' ':(exclude)docs/acessibilidade'
```

Esperado: saída vazia. Este plano só cria arquivos em `frontend/packages/ui/src/docs/`, `docs/adr/` e `docs/acessibilidade/`.

- [ ] **Passo 3: PR (não faça nesta execução)**

Quem coordena abre um PR só, depois que os quatro planos estiverem juntos na `feat/design-system-base`, e só com o OK do Matheus. O PR fecha a #25.

---

## Para o coordenador

Coisas que este plano não pode fazer sozinho, por estarem fora dos arquivos dele:

- **Números das listas em MDX.** O reset do Tailwind tira os números de `<ol>` em qualquer página MDX. Este plano contorna com o `ListaNumerada`. A correção de verdade seria uma regra como `.sbdocs ol { list-style: decimal; padding-inline-start: 2rem; }` num CSS carregado só pelo Storybook (importado no `.storybook/preview.tsx`), para não mexer no CSS que o app usa. Os planos 2 e 3 vão esbarrar nisso nas páginas de componente.
- **Ordem da barra lateral.** Hoje ela depende dos nomes de pasta. Um `parameters.options.storySort` no `.storybook/preview.tsx` com a ordem Introdução, Fundamentos, Conteúdo e voz, Componentes, Padrões e Changelog tiraria essa dependência. Se o plano 3 puser os Padrões fora de `src/docs/5-padroes/`, eles podem aparecer depois do Changelog.
- **Páginas do `Button`, do `IconButton` e do `VisuallyHidden`.** Nenhum plano escreve essas três, porque nasceram no plano 1, antes do modelo. Elas seguem o Modelo de página e podem entrar no plano 2.
- **Export do `contraste.ts`.** Se o pacote de tokens exportar `./contraste` (e o `pares-contraste.json`, que o plano 2 já prevê), os imports relativos do `blocos/tokens.tsx` viram imports do pacote.
- **Axe nas páginas MDX no CI.** O script da Tarefa 2 roda só na mão. Para entrar no CI, ele precisaria virar um arquivo do repositório e um passo do job `frontend`.

## Autorrevisão

**Cobertura da spec e do visual aprovado:**
- Introdução com princípios, público e como contribuir (regra do app, Changesets, axe obrigatório): Tarefa 3. Os seis princípios e a personalidade são os do artifact aprovado.
- Fundamentos: cores com amostras e contraste calculado nos dois temas, lido dos JSON (Tarefa 4); tipografia com as escalas e o A+ de 100, 120 e 140%, espaçamento e forma (Tarefa 5); movimento com movimento reduzido, ícones Phosphor sem emoji e com ícone decorativo escondido, e temas com alto contraste, `prefers-contrast` e o modo escuro só preparado (Tarefa 6).
- Conteúdo e voz: as 8 regras, o glossário (com as 5 trocas aprovadas), os textos de cada estado (vazio, carregando, erro, fora da base, permissão negada, sem conexão), os modelos de "Perguntar mais", o texto de consentimento verdadeiro, faça e não faça, e as metas (Flesch 50 ou mais e CDC Clear Communication Index): Tarefa 7.
- Modelo de página de componente: Tarefa 8. Changelog: Tarefa 8.
- ADR: Tarefa 9. Checklist manual (VoiceOver, TalkBack, teclado, zoom de 200%, reflow em 320 px), por componente e geral, com roteiro da #13 e modelo de registro: Tarefa 10.

**Fica para os outros planos:** as páginas de cada componente (planos 2 e 3), as páginas de Padrões (plano 3) e a execução do checklist com VoiceOver ou TalkBack, que é critério de pronto da #25 e precisa de uma pessoa com o celular na mão.
