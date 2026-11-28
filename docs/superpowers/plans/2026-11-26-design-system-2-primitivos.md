# Design system, plano 2 de 4: os primitivos restantes

> **Para quem for executar com agentes:** use a skill `superpowers:subagent-driven-development` (recomendada) ou `superpowers:executing-plans`, tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhar o andamento.
>
> **Commits:** cada tarefa termina com um commit. Commits **locais** no worktree de execução estão autorizados pelo Matheus. **Push e PR, não**: esses esperam o OK dele. As mensagens seguem o padrão do repositório (conventional commits em português, uma linha, citando a #25) e não levam rodapé de co-autoria nem menção a ferramentas de IA. Nunca inclua `.claude/` nem arquivos fora do que a tarefa lista.

**Objetivo:** entregar os 23 primitivos que faltam no `@bula-clara/ui`, cada um com teste de unidade, stories conferidas pelo axe e a página de documentação, mais os tokens de componente que eles usam e as páginas que faltavam para o `Button`, o `IconButton` e o `VisuallyHidden`.

**Arquitetura:** uma tarefa de preparação mexe em tudo o que é compartilhado (tokens, `index.css`, `index.ts`, `.storybook/` e o estilo do `Button`). Depois dela, os componentes ficam em quatro grupos independentes, e cada grupo só cria as pastas dos seus componentes e preenche o seu barrel em `src/grupos/`. Assim os quatro grupos rodam em paralelo, em worktrees separados, sem conflito na hora de juntar. Os componentes seguem o padrão do plano 1: React Aria Components por baixo, Tailwind só com tokens, stories testadas no Chromium com o axe em modo de erro.

**Stack:** a do plano 1, sem dependência nova. React Aria Components 1.22, Tailwind 4.3, Storybook 10.6, Vitest 5.1.1, Testing Library e Phosphor Icons 2.1. Nenhum polyfill novo no jsdom: `src/test/setup.ts`, `vitest.config.ts`, `package.json` e o lockfile não mudam.

**Spec:** `docs/design-system.md`. **Visual aprovado:** `/Users/matheusperillo/dev/challenge_2_bula-clara/.superpowers/referencias/design-system/README.md`, `tokens.json` e `components/bundle.css`, e as telas em `/Users/matheusperillo/dev/challenge_2_bula-clara/.superpowers/referencias/canvas/`. **Issue:** #25.

---

## Os quatro planos

1. **A base:** workspace, tokens, teste de contraste, Storybook com axe, CI e os três primeiros primitivos (`Button`, `IconButton`, `VisuallyHidden`).
2. **Os primitivos restantes (este plano).**
3. **Os componentes do domínio** e as páginas de **Padrões**.
4. **A documentação:** as páginas gerais do Storybook, o ADR e o checklist manual.

Este plano roda depois do plano 1 e em paralelo com o plano 4. Ele não toca em `src/docs/`, que é do plano 4.

## Como as tarefas rodam

```
Tarefa 0  preparar o worktree
Tarefa 1  preparação (tokens, CSS, barrels, estilo do Button, .storybook, páginas do plano 1)
             │
             ├── Grupo A  ações e tipografia   Tarefas A1 a A7   worktree próprio
             ├── Grupo B  campos               Tarefas B1 a B8   worktree próprio
             ├── Grupo C  sobreposições        Tarefas C1 a C4   worktree próprio
             └── Grupo D  estrutura e status   Tarefas D1 a D8   worktree próprio
             │
Tarefa 2  juntar os grupos e conferir tudo (quem coordena)
```

Cada grupo parte do commit da Tarefa 1 e só cria arquivos dentro de `src/components/<Nome>/` dos seus componentes, o seu barrel (`src/grupos/<grupo>.ts`) e o seu changeset. Nenhum grupo depende de outro. Dentro de um grupo, as tarefas rodam na ordem: TextArea, SearchField e ComboBox usam o `Campo/partes.tsx` que nasce com o TextField, e o Sheet usa o `Dialog/Painel.tsx` que nasce com o Dialog.

Contagens conferidas, em worktree separado, com a preparação e um grupo só:

| | Tokens | `ui` (total) | `ui` (unidade) |
|---|---|---|---|
| Depois da Tarefa 1 | 69 | 23 | 12 |
| Tarefa 1 + Grupo A | 69 | 59 | 32 |
| Tarefa 1 + Grupo B | 69 | 81 | 50 |
| Tarefa 1 + Grupo C | 69 | 40 | 25 |
| Tarefa 1 + Grupo D | 69 | 63 | 36 |
| Tudo junto | 69 | 174 | 107 |

## Decisões que este plano fecha

Tudo abaixo foi testado antes de entrar aqui, numa cópia do plano 1 já com as correções do visual aprovado (47 testes nos tokens e 23 no `ui`). Cada garantia que os testes dizem conferir foi quebrada de propósito no componente, uma de cada vez, para confirmar que o teste reprova.

- **Tokens de componente seguem o tema sem gerar outro CSS.** Ficam em `src/tokens/componentes/cor.json` e saem do `build.mjs` como `var(--bc-color-…)` do semântico, por um formato novo (`bc/css-referencias`). Eles aparecem uma vez só, no `:root`. Quando o alto contraste troca o semântico, o de componente vai junto. No Tailwind, `componente` vira `color`, e as classes ficam `border-campo-borda`, `bg-chip-fundo` e assim por diante. Os componentes novos usam esses tokens. O `Button` do plano 1 continua nos semânticos.
- **Véu atrás de diálogos e folhas:** primitivo `veu` (`#0B1B33B3`, e `#000000D9` no alto contraste) e semântico `color.overlay` nos dois temas. Ele nunca fica atrás de texto, por isso não entra nos pares de contraste.
- **Oito pares novos de contraste** em `pares-contraste.json` (campo, seleção, chip, aba, toast e erro). O teste dos tokens passa de 47 para 69: 8 pares vezes 2 temas, mais os 6 testes de `componentes.test.ts`.
- **`@bula-clara/tokens/pares-contraste.json` passa a ser exportado.** O plano 4 importa esse arquivo por caminho relativo e pode trocar pelo import do pacote depois que os dois planos estiverem juntos.
- **Variante `alto-contraste:` no Tailwind** (`@custom-variant` no `index.css`), ligada por `data-contraste="alto"` ou por `prefers-contrast: more`, a menos que a pessoa tenha escolhido o padrão. Serve para dar borda a quem não tem borda no tema padrão (Alert, Tag, Switch, Disclosure, painéis).
- **Animações de entrada e saída** (`aparecer` e `subir`) com a duração dos tokens, que vai a 0ms com `prefers-reduced-motion`. Assim não há uma regra separada de movimento reduzido para cada componente.
- **Estilo do `Button` num arquivo próprio** (`Button/estilo.ts`, `classesDeBotao`), para o `LinkButton` usar as mesmas classes. O comportamento do `Button` não muda, e os testes dele continuam iguais.
- **Barrels por grupo.** `src/index.ts` exporta `./grupos/acoes-e-tipografia`, `./grupos/campos`, `./grupos/sobreposicoes` e `./grupos/estrutura-e-status`. Na preparação, cada um tem só `export {};`, porque um arquivo vazio não é módulo e o TypeScript reclama (TS2306). Cada grupo preenche o seu.
- **Sheet é um `Modal` do React Aria ancorado embaixo**, e não o `Sheet` novo do React Aria 1.22. Aquele depende de `scrollend` e de `IntersectionObserver`, e a rolagem suave dele ignora o movimento reduzido.
- **A regra do Toast está na API.** A única entrada é `confirmarAcao(mensagem)`: sem tom, sem variante e sempre com a cor de confirmação. Dura 8 segundos, para enquanto tem foco ou mouse em cima e tem X de fechar. Os nomes `UNSTABLE_` do React Aria ficam escondidos atrás dessa API.
- **Alert sem tom verde.** Um teste com `@ts-expect-error` garante que `tom="sucesso"` não compila. O papel padrão é `note`, como no design aprovado. `anunciar` troca para `status` ou `alert` quando o aviso aparece depois que a página carregou.
- **Erro dos campos numa região `aria-live` sempre montada**, para o leitor de tela anunciar a mensagem quando ela aparece.
- **O placeholder se chama `exemplo`** e convive com o `rotulo` obrigatório, porque a tela aprovada usa "ex.: metformina". Não existe prop `placeholder`: ela não compila.
- **ComboBox tolera erro de digitação.** O filtro padrão, `filtroTolerante`, ignora acentos e maiúsculas e aceita um erro a cada 4 letras, no máximo 2. Veio do README aprovado ("lozartana" sugere losartana).
- **Switch em cartão**, com `descricao` que pode ser uma função do estado, para o texto de consentimento mudar junto com o interruptor. Os textos da story são os aprovados no plano 4 (Conteúdo e voz, Textos da interface).
- **Ícones Phosphor no peso `bold`**, com o tamanho em rem, para crescer com o A+.
- **O reflow do `Heading` é testado pela largura** (`scrollWidth` até 320px com o texto a 140%), e não procurando o hífen. O Chromium do CI não tem os dicionários de hifenização.
- **Cada componente tem uma página MDX** na pasta dele (`src/components/<Nome>/<Nome>.mdx`), com `<Meta of={Stories}>`, seguindo o Modelo de página do plano 4: nome e frase, exemplo, quando usar, quando não usar, anatomia, props (`<ArgTypes>`), estados, acessibilidade, conteúdo e faça e não faça. Como o plano 4 roda em paralelo, as páginas não importam nada de `src/docs/blocos/`: "Faça e não faça" é uma lista, e não o bloco `FacaNaoFaca`. Também não há tabela em Markdown, porque o MDX do projeto não tem `remark-gfm`. As stories com `play` aparecem paradas na página (o Storybook só roda o `play` na story sozinha), então os diálogos não abrem por cima da documentação.
- **Toda prop própria tem comentário `/** … */`**, porque é dali que sai a descrição da tabela do `<ArgTypes>`. Isso inclui as props do `Button`, do `IconButton` e do `VisuallyHidden` que estavam sem comentário.
- **Listas numeradas nas páginas MDX.** O reset do Tailwind tira os números de `<ol>`. A Tarefa 1 devolve os números com `.sbdocs-content > ol { list-style: decimal; }`, num CSS carregado só pelo Storybook (`.storybook/docs.css`). O seletor pega só as listas escritas em Markdown, que ficam direto dentro de `.sbdocs-content`. As listas dentro das stories, como a do `ProgressSteps`, continuam sem número. O Storybook não põe classe nenhuma nessas listas (não existe `sbdocs-ol`), e as listas com marcador já aparecem com bolinha.

**Diferenças em relação à spec e ao visual aprovado:**

- O título do `.bc-callout` aprovado tem 19px, que não existe na escala. O próprio `tokens.json` aprovado diz que `titulo-3` é o título dos avisos, e o `Alert` usa `titulo-3` (21px).
- As `Tabs` seguem o `.bc-tab` aprovado, que é o desenho da barra de navegação de baixo, com texto de 14px. É pequeno para o público do app, por isso a página pede poucas abas e nomes curtos. A barra de navegação de verdade são links com `aria-current` e fica com o `InputDock`, no plano 3.
- No alto contraste, as abas não selecionadas não ganham borda própria.
- `ProgressSteps`, `Skeleton`, `Dialog`, `Checkbox` e `Radio` não têm referência aprovada e seguem os tokens.
- Não foi conferido o movimento reduzido emulado no navegador. Ele está garantido pelas durações de 0ms nos tokens.

## API pública

É o que o plano 3 usa. Todas as props de texto são em português, e as do React Aria continuam disponíveis.

- `Heading({ nivel: 1|2|3|4, estilo?: 'titulo-1'|'resposta'|'titulo-2'|'titulo-3', children, ref?, tabIndex?, id? })`
- `Icon({ icone, tamanho?: 'pequeno'|'medio'|'grande' } & ({ rotulo: string } | { decorativo: true }))`
- `LinkButton({ href, children: string, variante?, icone?, larguraTotal? })`
- `Text({ variante?: 'corpo'|'apoio'|'rotulo', elemento?: 'p'|'span'|'div', id?, children })`, `Prose({ children })`, `SkipLink({ href?: '#…' (padrão '#conteudo'), children? })`
- Campos com `rotulo` (obrigatório), `descricao?` e `mensagemErro?: string | (validação) => string`: `TextField` (+ `exemplo?`), `TextArea` (+ `exemplo?`, `linhas?`), `SearchField` (+ `rotuloLimpar?`, sem `mensagemErro`) e `ComboBox<T extends { id, rotulo }>` (+ `opcoes`, `exemplo?`, `textoSemResultado?`, `rotuloAbrir?`, `defaultFilter?`). Também saem `filtroTolerante` e `normalizar`.
- `Checkbox({ children })`, `RadioGroup({ rotulo, descricao?, mensagemErro?, children })` e `Radio({ value, children })`, `Switch({ children: string, descricao?: string | (ligado) => string, isSelected?, defaultSelected?, onChange? })`
- `Dialog({ titulo, papel?: 'dialog'|'alertdialog', rotuloFechar?, children: ReactNode | ({ fechar }) => ReactNode, isOpen?, onOpenChange? })` e `DialogTrigger`; `Sheet({ titulo, rotulo?, rotuloFechar?, children, isOpen?, onOpenChange? })`, que abre com `DialogTrigger`
- `ToastRegion({ fila?, rotuloRegiao?, rotuloFechar? })`, `confirmarAcao(mensagem)`, `filaDeToasts` e `TEMPO_DO_TOAST`
- `Alert({ tom: 'info'|'cuidado'|'perigo', titulo, children?, nivelTitulo?, anunciar?: 'polite'|'assertive' })`
- `Disclosure({ titulo, nivelTitulo?, children, id?, defaultExpanded? })` e `Accordion({ children, permiteVariosAbertos? (padrão true), defaultExpandedKeys? })`
- `Tabs`, `TabList({ 'aria-label' })`, `Tab({ id, children: string, icone? })` e `TabPanel({ id, children })`
- `TagGroup({ rotulo, items?, children, textoVazio?, onRemove?, selectionMode? })` e `Tag({ id, children: string, icone?, rotuloRemover? (padrão 'Remover') })`
- `Spinner({ rotulo, mostrarRotulo? })` (não é `aria-live`), `Skeleton({ forma?: 'texto'|'bloco', linhas? })` e `ProgressSteps({ rotulo, passos, atual })`

## Arquivos

```
frontend/
├── .changeset/
│   ├── primitivos-preparacao.md            Tarefa 1
│   ├── primitivos-acoes-e-tipografia.md    Grupo A
│   ├── primitivos-campos.md                Grupo B
│   ├── primitivos-sobreposicoes.md         Grupo C
│   └── primitivos-estrutura-e-status.md    Grupo D
└── packages/
    ├── tokens/
    │   ├── package.json                    exporta pares-contraste.json
    │   ├── scripts/build.mjs               tokens de componente como var(--bc-…)
    │   ├── src/pares-contraste.json        8 pares novos
    │   ├── src/tokens/primitivos/cor.json  primitivo veu
    │   ├── src/tokens/temas/padrao.json    color.overlay
    │   ├── src/tokens/temas/alto-contraste.json
    │   ├── src/tokens/componentes/cor.json novo
    │   └── test/componentes.test.ts        novo
    └── ui/
        ├── .storybook/preview.tsx          importa docs.css
        ├── .storybook/docs.css             novo: números das listas nas páginas MDX
        └── src/
            ├── index.ts                    exporta os quatro barrels
            ├── styles/index.css            variante alto-contraste e animações
            ├── grupos/                     um barrel por grupo
            └── components/
                ├── Button/                 estilo.ts (novo), Button.tsx, Button.mdx (novo)
                ├── IconButton/             IconButton.tsx (comentários), IconButton.mdx (novo)
                ├── VisuallyHidden/         VisuallyHidden.tsx (comentário), VisuallyHidden.mdx (novo)
                ├── Heading/ Icon/ LinkButton/ Prose/ SkipLink/ Text/                       Grupo A
                ├── Campo/ TextField/ TextArea/ SearchField/ ComboBox/ Checkbox/
                │   RadioGroup/ Switch/                                                     Grupo B
                ├── Dialog/ Sheet/ Toast/                                                   Grupo C
                └── Alert/ Disclosure/ ProgressSteps/ Skeleton/ Spinner/ Tabs/ TagGroup/    Grupo D
```

Cada pasta de componente tem `<Nome>.tsx`, `<Nome>.test.tsx`, `<Nome>.stories.tsx`, `<Nome>.mdx` e `index.ts`. `Campo/` e `Dialog/Painel.tsx` são peças internas, que o pacote não exporta.

Fora do repositório, só na Tarefa 2: `/tmp/bula-clara-conferir-paginas.mjs`.

---

### Tarefa 0: Preparar o worktree

- [ ] **Passo 1: Conferir onde você está**

A execução roda num worktree criado a partir da `feat/design-system-base` com o plano 1 já aplicado. Quem coordena junta o worktree de volta nela no fim.

```bash
git log --oneline -3
ls frontend/packages/ui/src/components   # Button  IconButton  VisuallyHidden
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

Esperado: `Tests  47 passed (47)` nos tokens e `Tests  23 passed (23)` no `ui`. Se os números forem outros, a base mudou depois deste plano: confira os nomes de token usados aqui contra `packages/tokens/dist/padrao.json` antes de seguir.

Todos os comandos das próximas tarefas rodam dentro de `frontend/`. Comandos que podem esperar resposta no terminal levam `< /dev/null`.

---

### Tarefa 1: Preparação

**Arquivos:**
- Modificar: `frontend/packages/tokens/package.json`, `frontend/packages/tokens/scripts/build.mjs`, `frontend/packages/tokens/src/pares-contraste.json`, `frontend/packages/tokens/src/tokens/primitivos/cor.json`, `frontend/packages/tokens/src/tokens/temas/padrao.json`, `frontend/packages/tokens/src/tokens/temas/alto-contraste.json`
- Criar: `frontend/packages/tokens/src/tokens/componentes/cor.json`, `frontend/packages/tokens/test/componentes.test.ts`
- Modificar: `frontend/packages/ui/src/styles/index.css`, `frontend/packages/ui/src/index.ts`, `frontend/packages/ui/src/components/Button/Button.tsx`, `frontend/packages/ui/src/components/IconButton/IconButton.tsx`, `frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.tsx`, `frontend/packages/ui/.storybook/preview.tsx`
- Criar: `frontend/packages/ui/src/components/Button/estilo.ts`, `frontend/packages/ui/src/grupos/acoes-e-tipografia.ts`, `frontend/packages/ui/src/grupos/campos.ts`, `frontend/packages/ui/src/grupos/sobreposicoes.ts`, `frontend/packages/ui/src/grupos/estrutura-e-status.ts`, `frontend/packages/ui/.storybook/docs.css`
- Criar: `frontend/packages/ui/src/components/Button/Button.mdx`, `frontend/packages/ui/src/components/IconButton/IconButton.mdx`, `frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.mdx`
- Criar: `frontend/.changeset/primitivos-preparacao.md`

Esta tarefa mexe em tudo o que os quatro grupos compartilham, para que eles não precisem mexer. Os arquivos modificados vêm inteiros: substitua o conteúdo todo.

- [ ] **Passo 1: Escrever o teste dos tokens de componente**

`frontend/packages/tokens/test/componentes.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import padrao from '../dist/padrao.json';
import altoContraste from '../dist/alto-contraste.json';

const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../dist/tailwind.css', import.meta.url), 'utf8');
const linhasDeComponente = css.split('\n').filter((linha) => linha.includes('--bc-componente-'));
const nomesDeComponente = Object.keys(padrao).filter((caminho) => caminho.startsWith('componente.'));

describe('tokens de componente', () => {
  it('existem', () => {
    expect(nomesDeComponente.length).toBeGreaterThan(0);
  });

  it('saem no CSS como referência a um semântico, nunca como cor fixa', () => {
    for (const linha of linhasDeComponente) {
      expect(linha).toMatch(/: var\(--bc-color-[a-z-]+\);$/);
    }
  });

  it('aparecem uma vez só, no :root (o tema troca o semântico, não eles)', () => {
    expect(linhasDeComponente).toHaveLength(nomesDeComponente.length);
  });

  it('seguem o tema de alto contraste', () => {
    expect(padrao['componente.campo.borda']).toBe('#6B7A90');
    expect(altoContraste['componente.campo.borda']).toBe('#000000');
  });

  it('viram cores do Tailwind', () => {
    expect(tailwind).toContain('--color-campo-borda: var(--bc-componente-campo-borda);');
  });
});

describe('fundo de sobreposição', () => {
  it('é semitransparente e mais escuro no alto contraste', () => {
    expect(padrao['color.overlay']).toMatch(/^#[0-9A-F]{8}$/);
    expect(altoContraste['color.overlay']).toBe('#000000D9');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/tokens test
```

Esperado: os testes de `componentes.test.ts` falham, porque ainda não existe nenhum token `componente.*`.

- [ ] **Passo 3: Primitivo do véu e `color.overlay`**

`frontend/packages/tokens/src/tokens/primitivos/cor.json`:

```json
{
  "primitivo": {
    "cor": {
      "$type": "color",
      "branco": {
        "$value": "#FFFFFF"
      },
      "preto": {
        "$value": "#000000"
      },
      "azul": {
        "50": {
          "$value": "#EDF3FC"
        },
        "600": {
          "$value": "#1351B4"
        },
        "800": {
          "$value": "#0C326F"
        }
      },
      "cinza": {
        "50": {
          "$value": "#F1F4F9"
        },
        "200": {
          "$value": "#D6DFEA"
        },
        "500": {
          "$value": "#6B7A90"
        },
        "700": {
          "$value": "#40506A"
        },
        "950": {
          "$value": "#0B1B33"
        }
      },
      "ambar": {
        "50": {
          "$value": "#FFF5C2"
        },
        "300": {
          "$value": "#FFD54A"
        },
        "700": {
          "$value": "#9E6A00"
        },
        "950": {
          "$value": "#3D2A00"
        }
      },
      "vermelho": {
        "50": {
          "$value": "#FDECEA"
        },
        "700": {
          "$value": "#A4221A"
        },
        "800": {
          "$value": "#8A1C12"
        },
        "900": {
          "$value": "#7A0E06"
        }
      },
      "verde": {
        "800": {
          "$value": "#1A5E3C"
        },
        "900": {
          "$value": "#0B3D24"
        }
      },
      "veu": {
        "$description": "Fundo semitransparente atrás de Dialog e Sheet. Nunca fica atrás de texto.",
        "padrao": {
          "$value": "#0B1B33B3"
        },
        "alto": {
          "$value": "#000000D9"
        }
      }
    }
  }
}
```

`frontend/packages/tokens/src/tokens/temas/padrao.json`:

```json
{
  "color": {
    "$type": "color",
    "action": {
      "primary": {
        "$value": "{primitivo.cor.azul.600}"
      },
      "primary-strong": {
        "$value": "{primitivo.cor.azul.800}"
      },
      "primary-subtle": {
        "$value": "{primitivo.cor.azul.50}"
      }
    },
    "text": {
      "default": {
        "$value": "{primitivo.cor.cinza.950}"
      },
      "muted": {
        "$value": "{primitivo.cor.cinza.700}"
      },
      "on-solid": {
        "$value": "{primitivo.cor.branco}"
      }
    },
    "border": {
      "field": {
        "$value": "{primitivo.cor.cinza.500}"
      },
      "subtle": {
        "$value": "{primitivo.cor.cinza.200}"
      }
    },
    "surface": {
      "default": {
        "$value": "{primitivo.cor.branco}"
      },
      "info": {
        "$value": "{primitivo.cor.cinza.50}"
      }
    },
    "caution": {
      "text": {
        "$value": "{primitivo.cor.ambar.950}"
      },
      "bg": {
        "$value": "{primitivo.cor.ambar.50}"
      },
      "border": {
        "$value": "{primitivo.cor.ambar.700}"
      }
    },
    "danger": {
      "text": {
        "$value": "{primitivo.cor.vermelho.800}"
      },
      "bg": {
        "$value": "{primitivo.cor.vermelho.50}"
      },
      "border": {
        "$value": "{primitivo.cor.vermelho.700}"
      }
    },
    "emergency": {
      "solid": {
        "$value": "{primitivo.cor.vermelho.700}"
      }
    },
    "confirm": {
      "$value": "{primitivo.cor.verde.800}"
    },
    "focus": {
      "ring": {
        "$value": "{primitivo.cor.cinza.950}"
      },
      "halo": {
        "$value": "{primitivo.cor.ambar.300}"
      }
    },
    "overlay": {
      "$value": "{primitivo.cor.veu.padrao}"
    }
  },
  "borda": {
    "$type": "dimension",
    "controle": {
      "$value": "2px"
    },
    "aviso": {
      "$value": "0px"
    },
    "barra-aviso": {
      "$value": "6px"
    }
  }
}
```

`frontend/packages/tokens/src/tokens/temas/alto-contraste.json`:

```json
{
  "color": {
    "$type": "color",
    "action": {
      "primary": {
        "$value": "{primitivo.cor.azul.800}"
      },
      "primary-strong": {
        "$value": "{primitivo.cor.preto}"
      },
      "primary-subtle": {
        "$value": "{primitivo.cor.branco}"
      }
    },
    "text": {
      "default": {
        "$value": "{primitivo.cor.preto}"
      },
      "muted": {
        "$value": "{primitivo.cor.preto}"
      },
      "on-solid": {
        "$value": "{primitivo.cor.branco}"
      }
    },
    "border": {
      "field": {
        "$value": "{primitivo.cor.preto}"
      },
      "subtle": {
        "$value": "{primitivo.cor.preto}"
      }
    },
    "surface": {
      "default": {
        "$value": "{primitivo.cor.branco}"
      },
      "info": {
        "$value": "{primitivo.cor.branco}"
      }
    },
    "caution": {
      "text": {
        "$value": "{primitivo.cor.preto}"
      },
      "bg": {
        "$value": "{primitivo.cor.ambar.50}"
      },
      "border": {
        "$value": "{primitivo.cor.preto}"
      }
    },
    "danger": {
      "text": {
        "$value": "{primitivo.cor.vermelho.900}"
      },
      "bg": {
        "$value": "{primitivo.cor.branco}"
      },
      "border": {
        "$value": "{primitivo.cor.vermelho.900}"
      }
    },
    "emergency": {
      "solid": {
        "$value": "{primitivo.cor.vermelho.900}"
      }
    },
    "confirm": {
      "$value": "{primitivo.cor.verde.900}"
    },
    "focus": {
      "ring": {
        "$value": "{primitivo.cor.preto}"
      },
      "halo": {
        "$value": "{primitivo.cor.ambar.300}"
      }
    },
    "overlay": {
      "$value": "{primitivo.cor.veu.alto}"
    }
  },
  "borda": {
    "$type": "dimension",
    "controle": {
      "$value": "2px"
    },
    "aviso": {
      "$value": "2px"
    },
    "barra-aviso": {
      "$value": "10px"
    }
  }
}
```

- [ ] **Passo 4: Tokens de componente**

Cada um aponta para um semântico. Nenhum tem cor fixa.

`frontend/packages/tokens/src/tokens/componentes/cor.json`:

```json
{
  "componente": {
    "$type": "color",
    "$description": "Terceira camada: cada token aponta para um semântico. No CSS sai como var(--bc-color-…), então segue o tema sozinho.",
    "campo": {
      "fundo": {
        "$value": "{color.surface.default}"
      },
      "borda": {
        "$value": "{color.border.field}"
      },
      "borda-invalida": {
        "$value": "{color.danger.border}"
      },
      "texto-erro": {
        "$value": "{color.danger.text}"
      }
    },
    "selecao": {
      "borda": {
        "$value": "{color.border.field}"
      },
      "marcado": {
        "$value": "{color.action.primary}"
      },
      "marca": {
        "$value": "{color.text.on-solid}"
      }
    },
    "chip": {
      "fundo": {
        "$value": "{color.action.primary-subtle}"
      },
      "texto": {
        "$value": "{color.action.primary-strong}"
      }
    },
    "aba": {
      "indicador": {
        "$value": "{color.action.primary}"
      }
    },
    "painel": {
      "fundo": {
        "$value": "{color.surface.default}"
      }
    },
    "sobreposicao": {
      "fundo": {
        "$value": "{color.overlay}"
      }
    },
    "toast": {
      "fundo": {
        "$value": "{color.surface.default}"
      },
      "destaque": {
        "$value": "{color.confirm}"
      }
    },
    "esqueleto": {
      "fundo": {
        "$value": "{color.surface.info}"
      },
      "borda": {
        "$value": "{color.border.subtle}"
      }
    }
  }
}
```

- [ ] **Passo 5: Build com os tokens de componente**

`frontend/packages/tokens/scripts/build.mjs`:

```js
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
```

- [ ] **Passo 6: Pares de contraste novos e export**

`frontend/packages/tokens/src/pares-contraste.json`:

```json
[
  {
    "texto": "color.text.default",
    "fundo": "color.surface.default",
    "minimo": 7,
    "uso": "texto de corpo"
  },
  {
    "texto": "color.text.muted",
    "fundo": "color.surface.default",
    "minimo": 4.5,
    "uso": "texto de apoio"
  },
  {
    "texto": "color.text.default",
    "fundo": "color.surface.info",
    "minimo": 7,
    "uso": "aviso neutro"
  },
  {
    "texto": "color.text.muted",
    "fundo": "color.surface.info",
    "minimo": 4.5,
    "uso": "apoio dentro de aviso neutro"
  },
  {
    "texto": "color.action.primary",
    "fundo": "color.surface.default",
    "minimo": 7,
    "uso": "link e botão secundário"
  },
  {
    "texto": "color.text.on-solid",
    "fundo": "color.action.primary",
    "minimo": 7,
    "uso": "botão primário"
  },
  {
    "texto": "color.text.on-solid",
    "fundo": "color.action.primary-strong",
    "minimo": 7,
    "uso": "botão primário pressionado"
  },
  {
    "texto": "color.action.primary-strong",
    "fundo": "color.action.primary-subtle",
    "minimo": 4.5,
    "uso": "chip"
  },
  {
    "texto": "color.caution.text",
    "fundo": "color.caution.bg",
    "minimo": 7,
    "uso": "aviso pede cuidado"
  },
  {
    "texto": "color.caution.border",
    "fundo": "color.surface.default",
    "minimo": 3,
    "uso": "barra lateral do aviso de cuidado"
  },
  {
    "texto": "color.danger.text",
    "fundo": "color.danger.bg",
    "minimo": 7,
    "uso": "aviso não usar junto"
  },
  {
    "texto": "color.danger.border",
    "fundo": "color.surface.default",
    "minimo": 3,
    "uso": "barra lateral do aviso de perigo"
  },
  {
    "texto": "color.text.on-solid",
    "fundo": "color.emergency.solid",
    "minimo": 7,
    "uso": "cartão de emergência"
  },
  {
    "texto": "color.confirm",
    "fundo": "color.surface.default",
    "minimo": 7,
    "uso": "confirmação de ação"
  },
  {
    "texto": "color.text.default",
    "fundo": "color.focus.halo",
    "minimo": 7,
    "uso": "texto sobre o halo de foco"
  },
  {
    "texto": "color.border.field",
    "fundo": "color.surface.default",
    "minimo": 3,
    "uso": "borda de campo"
  },
  {
    "texto": "color.caution.border",
    "fundo": "color.caution.bg",
    "minimo": 3,
    "uso": "borda do aviso de cuidado"
  },
  {
    "texto": "color.danger.border",
    "fundo": "color.danger.bg",
    "minimo": 3,
    "uso": "borda do aviso de perigo"
  },
  {
    "texto": "color.focus.ring",
    "fundo": "color.surface.default",
    "minimo": 3,
    "uso": "contorno de foco"
  },
  {
    "texto": "color.danger.text",
    "fundo": "color.surface.default",
    "minimo": 7,
    "uso": "botão de perigo (Apagar tudo)"
  },
  {
    "texto": "color.danger.text",
    "fundo": "color.danger.bg",
    "minimo": 4.5,
    "uso": "faixa de emergência"
  },
  {
    "texto": "componente.campo.texto-erro",
    "fundo": "componente.campo.fundo",
    "minimo": 4.5,
    "uso": "mensagem de erro de campo"
  },
  {
    "texto": "componente.campo.borda",
    "fundo": "componente.campo.fundo",
    "minimo": 3,
    "uso": "borda de campo"
  },
  {
    "texto": "componente.campo.borda-invalida",
    "fundo": "componente.campo.fundo",
    "minimo": 3,
    "uso": "borda de campo inválido"
  },
  {
    "texto": "componente.selecao.borda",
    "fundo": "componente.campo.fundo",
    "minimo": 3,
    "uso": "caixa de Checkbox, Radio e Switch desligados"
  },
  {
    "texto": "componente.selecao.marca",
    "fundo": "componente.selecao.marcado",
    "minimo": 3,
    "uso": "marca de seleção sobre o fundo marcado"
  },
  {
    "texto": "componente.chip.texto",
    "fundo": "componente.chip.fundo",
    "minimo": 4.5,
    "uso": "texto da Tag"
  },
  {
    "texto": "componente.aba.indicador",
    "fundo": "color.surface.default",
    "minimo": 3,
    "uso": "indicador da aba selecionada"
  },
  {
    "texto": "componente.toast.destaque",
    "fundo": "componente.toast.fundo",
    "minimo": 7,
    "uso": "texto, borda e ícone do Toast"
  }
]
```

`frontend/packages/tokens/package.json`:

```json
{
  "name": "@bula-clara/tokens",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./tokens.css": "./dist/tokens.css",
    "./tailwind.css": "./dist/tailwind.css",
    "./padrao.json": "./dist/padrao.json",
    "./alto-contraste.json": "./dist/alto-contraste.json",
    "./pares-contraste.json": "./src/pares-contraste.json"
  },
  "scripts": {
    "build": "node scripts/build.mjs",
    "test": "pnpm build && vitest run",
    "typecheck": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@types/node": "^26.6.7",
    "style-dictionary": "^5.8.0",
    "vitest": "5.1.1"
  }
}
```

- [ ] **Passo 7: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/tokens test
grep -c -- '--bc-componente-' packages/tokens/dist/tokens.css
grep -- '--color-campo-borda' packages/tokens/dist/tailwind.css
```

Esperado: `Tests  69 passed (69)`, a contagem de linhas `--bc-componente-` igual ao número de tokens em `componentes/cor.json`, e `--color-campo-borda: var(--bc-componente-campo-borda);` no tema do Tailwind.

- [ ] **Passo 8: Variante de alto contraste e animações**

`frontend/packages/ui/src/styles/index.css`:

```css
@import 'tailwindcss';
@import '@bula-clara/tokens/tokens.css';
@import '@bula-clara/tokens/tailwind.css';
@import '@fontsource-variable/literata/wght.css';
@import '@fontsource/atkinson-hyperlegible/latin-400.css';
@import '@fontsource/atkinson-hyperlegible/latin-700.css';

@source '../';

/* Foco visível sobre qualquer fundo: contorno escuro com halo amarelo por fora. */
@utility foco-visivel {
  outline: var(--bc-tamanho-foco-contorno) solid var(--bc-color-focus-ring);
  outline-offset: var(--bc-tamanho-foco-afastamento);
  box-shadow: 0 0 0
    calc(var(--bc-tamanho-foco-afastamento) + var(--bc-tamanho-foco-contorno) + var(--bc-tamanho-foco-halo))
    var(--bc-color-focus-halo);
}

/* Alto contraste: ligado por data-contraste="alto" ou por prefers-contrast: more (a menos que a
   pessoa tenha escolhido o padrão). Serve para dar borda a quem, no tema padrão, não tem. */
@custom-variant alto-contraste {
  &:where([data-contraste='alto'] *) {
    @slot;
  }
  @media (prefers-contrast: more) {
    &:where(:root:not([data-contraste='padrao']) *) {
      @slot;
    }
  }
}

/* Entrada e saída de Dialog e Sheet. A duração vem dos tokens, que vão a 0ms com
   prefers-reduced-motion: aí nada se move. */
@theme {
  --animate-aparecer: aparecer var(--bc-duracao-media) ease-out;
  --animate-sumir: aparecer var(--bc-duracao-rapida) ease-out reverse;
  --animate-subir: subir var(--bc-duracao-media) ease-out;
  --animate-descer: subir var(--bc-duracao-rapida) ease-out reverse;

  @keyframes aparecer {
    from {
      opacity: 0;
    }
  }

  @keyframes subir {
    from {
      transform: translateY(100%);
    }
  }
}

@layer base {
  html {
    font-family: var(--bc-font-familia-texto);
    font-size: 100%;
    color: var(--bc-color-text-default);
    background: var(--bc-color-surface-default);
  }

  html[data-escala='120'] {
    font-size: 120%;
  }

  html[data-escala='140'] {
    font-size: 140%;
  }

  body {
    font-size: var(--bc-font-tamanho-corpo);
    line-height: var(--bc-font-altura-linha-corpo);
  }
}
```

- [ ] **Passo 9: Estilo do `Button` num arquivo próprio**

`frontend/packages/ui/src/components/Button/estilo.ts`:

```ts
// Classes do Button, separadas para o LinkButton ter exatamente a mesma cara.

/**
 * - `primaria`: a ação principal da tela (uma por tela).
 * - `secundaria`: ações de mesmo peso, como foto e voz.
 * - `discreta`: alternativas, como "Digitar o nome".
 * - `perigo`: só para "Apagar tudo".
 */
export type ButtonVariante = 'primaria' | 'secundaria' | 'discreta' | 'perigo';

const base =
  'inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center gap-2 rounded-controle ' +
  'text-botao font-bold transition-colors duration-rapida ease-out ' +
  'border-(length:--bc-borda-controle) data-focus-visible:foco-visivel ' +
  'data-disabled:cursor-not-allowed data-disabled:opacity-55';

const variantes: Record<ButtonVariante, string> = {
  primaria:
    'px-6 border-action-primary bg-action-primary text-text-on-solid ' +
    'data-hovered:border-action-primary-strong data-hovered:bg-action-primary-strong ' +
    'data-pressed:border-action-primary-strong data-pressed:bg-action-primary-strong',
  secundaria:
    'px-6 border-action-primary bg-surface-default text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle',
  discreta:
    'px-3 border-transparent bg-transparent text-action-primary underline underline-offset-3 ' +
    'data-hovered:text-action-primary-strong data-pressed:text-action-primary-strong',
  perigo:
    'px-6 border-danger-border bg-surface-default text-danger-text ' +
    'data-hovered:bg-danger-bg data-pressed:bg-danger-bg',
};

export function classesDeBotao(variante: ButtonVariante, larguraTotal: boolean): string {
  return `${base} ${variantes[variante]}${larguraTotal ? ' w-full' : ''}`;
}
```

`frontend/packages/ui/src/components/Button/Button.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { classesDeBotao, type ButtonVariante } from './estilo';

export type { ButtonVariante } from './estilo';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
  /** O texto diz a ação ("Apagar tudo", nunca "OK"). É o nome acessível. */
  children: string;
  /** `primaria` para a ação principal da tela, `secundaria` e `discreta` para as outras, `perigo` para apagar. */
  variante?: ButtonVariante;
  /** Ícone Phosphor à esquerda do texto. É decorativo: o texto já diz a ação. */
  icone?: Icon;
  /** Ocupa a largura toda do contêiner. Útil no celular. */
  larguraTotal?: boolean;
}

export function Button({
  variante = 'primaria',
  icone: Icone,
  larguraTotal = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton {...props} className={classesDeBotao(variante, larguraTotal)}>
      {Icone ? <Icone size={24} weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaButton>
  );
}
```

- [ ] **Passo 10: Comentários nas props do `IconButton` e do `VisuallyHidden`**

São só comentários, para a tabela de props das páginas. O código não muda.

`frontend/packages/ui/src/components/IconButton/IconButton.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

/** Mesmas cores do Button. `primaria` é a usada na caixa de pergunta (câmera e microfone). */
export type IconButtonVariante = 'primaria' | 'secundaria' | 'discreta';

export interface IconButtonProps
  extends Omit<AriaButtonProps, 'className' | 'style' | 'children' | 'aria-label'> {
  /** Obrigatório: é o único nome que o leitor de tela anuncia. */
  'aria-label': string;
  /** Ícone Phosphor. Fica escondido do leitor de tela, que lê o `aria-label`. */
  icone: Icon;
  /** Mesmas cores do Button, sem a de perigo. */
  variante?: IconButtonVariante;
}

const variantes: Record<IconButtonVariante, string> = {
  primaria:
    'border-action-primary bg-action-primary text-text-on-solid ' +
    'data-hovered:border-action-primary-strong data-hovered:bg-action-primary-strong ' +
    'data-pressed:border-action-primary-strong data-pressed:bg-action-primary-strong',
  secundaria:
    'border-action-primary bg-surface-default text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle',
  discreta:
    'border-transparent bg-transparent text-action-primary ' +
    'data-hovered:bg-action-primary-subtle data-pressed:bg-action-primary-subtle',
};

export function IconButton({ icone: Icone, variante = 'secundaria', ...props }: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      className={
        'inline-flex size-12 flex-none cursor-pointer items-center justify-center rounded-controle ' +
        'border-(length:--bc-borda-controle) transition-colors duration-rapida ease-out ' +
        'data-focus-visible:foco-visivel data-disabled:cursor-not-allowed data-disabled:opacity-55 ' +
        variantes[variante]
      }
    >
      <Icone size={24} weight="bold" aria-hidden="true" focusable="false" />
    </AriaButton>
  );
}
```

`frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.tsx`:

```tsx
import type { ReactNode } from 'react';

export interface VisuallyHiddenProps {
  /** O texto que só o leitor de tela lê. */
  children: ReactNode;
}

/** Texto que só o leitor de tela lê. Continua no fluxo de leitura, mas não aparece na tela. */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className="sr-only">{children}</span>;
}
```

- [ ] **Passo 11: Barrels dos grupos**

Os quatro arquivos começam iguais. Cada grupo troca o conteúdo do seu na última tarefa dele.

`frontend/packages/ui/src/grupos/acoes-e-tipografia.ts`, `frontend/packages/ui/src/grupos/campos.ts`, `frontend/packages/ui/src/grupos/sobreposicoes.ts` e `frontend/packages/ui/src/grupos/estrutura-e-status.ts`:

```ts
// Grupo do plano 2. Cada componente novo deste grupo é exportado aqui.
export {};
```

`frontend/packages/ui/src/index.ts`:

```ts
export * from './components/Button';
export * from './components/IconButton';
export * from './components/VisuallyHidden';
export * from './grupos/acoes-e-tipografia';
export * from './grupos/campos';
export * from './grupos/sobreposicoes';
export * from './grupos/estrutura-e-status';
```

- [ ] **Passo 12: Números das listas nas páginas MDX**

`frontend/packages/ui/.storybook/docs.css`:

```css
/*
 * O reset do Tailwind (preflight) tira os números de <ol>, e o Storybook não devolve.
 * Esta regra devolve os números só nas listas escritas em Markdown nas páginas MDX, que ficam
 * direto dentro de .sbdocs-content. As listas dos componentes, dentro das stories (como a do
 * ProgressSteps), continuam sem número.
 */
.sbdocs-content > ol {
  list-style: decimal;
}
```

`frontend/packages/ui/.storybook/preview.tsx` (só ganha a linha `import './docs.css';`):

```tsx
import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles/index.css';
import './docs.css';

// Aplica tema e tamanho de texto no <html>, igual o app vai fazer.
const comTemaEEscala: Decorator = (Story, context) => {
  const { contraste, escala } = context.globals as { contraste: string; escala: string };
  const html = document.documentElement;
  html.lang = 'pt-BR';
  html.dataset.contraste = contraste;
  html.dataset.escala = escala;
  return <Story />;
};

const preview: Preview = {
  decorators: [comTemaEEscala],
  globalTypes: {
    contraste: {
      description: 'Tema de contraste',
      toolbar: {
        title: 'Contraste',
        icon: 'contrast',
        items: [
          { value: 'padrao', title: 'Padrão' },
          { value: 'alto', title: 'Alto contraste' },
        ],
        dynamicTitle: true,
      },
    },
    escala: {
      description: 'Tamanho do texto (A+)',
      toolbar: {
        title: 'Texto',
        icon: 'zoom',
        items: [
          { value: '100', title: '100%' },
          { value: '120', title: '120%' },
          { value: '140', title: '140%' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { contraste: 'padrao', escala: '100' },
  parameters: {
    // 'error' faz qualquer violação do axe reprovar o teste da story no Vitest.
    a11y: { test: 'error' },
    controls: { expanded: true },
  },
};

export default preview;
```

- [ ] **Passo 13: Páginas do `Button`, do `IconButton` e do `VisuallyHidden`**

Nenhum outro plano escreve estas três, porque os componentes nasceram no plano 1, antes do Modelo de página.

`frontend/packages/ui/src/components/Button/Button.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Button.stories';

<Meta of={Stories} />

# Button

Faz uma ação na própria tela: perguntar, ouvir a resposta, fotografar a caixa, apagar a lista.

<Canvas of={Stories.Primaria} />

## Quando usar

Para qualquer ação que acontece ali mesmo, sem levar a pessoa para outro endereço. Cada tela tem uma ação principal, na variante `primaria`. As outras ficam em `secundaria` ou `discreta`.

## Quando não usar

- Para ir a outra página ou a outra parte da página, use `LinkButton`. Um botão que muda de endereço confunde o leitor de tela, que anuncia "botão" e não "link".
- Para um botão só com ícone, use `IconButton`.
- Para ligar e desligar uma opção, use `Switch`.

## Anatomia

- Contêiner com borda de 2px e altura mínima de 48px.
- Ícone Phosphor opcional, à esquerda, sempre decorativo.
- Texto, que diz a ação.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Secundaria} />

<Canvas of={Stories.Discreta} />

<Canvas of={Stories.Perigo} />

<Canvas of={Stories.Desabilitado} />

<Canvas of={Stories.LarguraTotal} />

A story **Foco pelo teclado** mostra o contorno de foco. Abra a story sozinha e aperte Tab para ver.

## Acessibilidade

- Usa o `Button` do React Aria: papel `button`, responde a Enter e a Espaço, e o foco pelo teclado mostra o contorno de 3px com halo. O clique com mouse ou dedo não mostra o contorno.
- O nome acessível é o texto do botão. O ícone fica escondido do leitor de tela, porque o texto já diz tudo.
- A área de toque tem pelo menos 48px de altura nos três tamanhos de texto do A+.
- A variante `perigo` não depende só da cor: o texto já diz que a ação apaga ("Apagar tudo").
- No alto contraste, as cores vêm do tema `alto-contraste` e a borda continua.

## Conteúdo

O texto é um verbo que diz o que acontece, de preferência com o objeto: "Fotografar a caixa", "Apagar tudo", "Sim, perguntar sobre ele". Vale a regra 8 de **Conteúdo e voz**: botões dizem a ação.

## Faça e não faça

- Faça: "Ouvir resposta". A pessoa sabe o que vai acontecer antes de tocar.
- Não faça: "OK", "Enviar" ou "Clique aqui". O texto não diz a ação.
- Faça: uma ação `primaria` por tela.
- Não faça: dois botões `primaria` lado a lado, disputando a atenção.
```

`frontend/packages/ui/src/components/IconButton/IconButton.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './IconButton.stories';

<Meta of={Stories} />

# IconButton

Botão só com ícone, para ações que já têm um ícone conhecido: microfone, câmera e fechar.

<Canvas of={Stories.Microfone} />

## Quando usar

Na caixa de pergunta (câmera e microfone) e no X de fechar diálogos, folhas e toasts. São lugares com pouco espaço, onde o ícone é reconhecido por quase todo mundo.

## Quando não usar

- Quando houver espaço para texto, use `Button` com ícone. Texto visível ajuda quem tem pouca familiaridade com celular.
- Para ações de perigo, como apagar, use `Button` na variante `perigo`. Uma lixeira sozinha é fácil de tocar sem querer.

## Anatomia

- Contêiner quadrado de 48px, com borda de 2px.
- Ícone Phosphor de 24px, no peso `bold`.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.CameraNaCaixaDePergunta} />

<Canvas of={Stories.Fechar} />

## Acessibilidade

- Papel `button`. O `aria-label` é obrigatório: sem ele, o código não compila, porque é o único nome que o leitor de tela anuncia.
- O ícone fica escondido do leitor de tela.
- 48px de largura e de altura, nos três tamanhos de texto.
- Responde a Enter e a Espaço. O foco pelo teclado mostra o contorno de 3px com halo.

## Conteúdo

O `aria-label` diz a ação, igual ao texto de um `Button`: "Perguntar falando", "Fotografar a caixa", "Fechar". Nunca descreve o desenho ("Microfone", "Ícone de câmera").

## Faça e não faça

- Faça: `aria-label="Fotografar a caixa"`.
- Não faça: `aria-label="Câmera"`. O nome descreve o ícone e não o que acontece.
```

`frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './VisuallyHidden.stories';

<Meta of={Stories} />

# VisuallyHidden

Texto que só o leitor de tela lê. Ele continua no fluxo de leitura, mas não aparece na tela.

<Canvas of={Stories.DentroDeUmLink} />

O exemplo acima é um link. Na tela aparece só "Na bula: seção 4". O leitor de tela lê "Na bula: seção 4 (abre a ficha do remédio)".

## Quando usar

Para completar o que a tela já mostra com uma informação que, para quem vê, está implícita no desenho: para onde um link leva, que um passo já foi feito, o que um número significa.

## Quando não usar

- Para dar nome a um botão só com ícone, use o `aria-label` do `IconButton`.
- Para esconder algo de todo mundo, não use este componente: tire o elemento da tela.
- Para texto que ajudaria qualquer pessoa, deixe o texto visível. Se é útil, quem enxerga também quer ler.

## Anatomia

Um `span` com a classe `sr-only` do Tailwind, sem mais nada.

## Props

<ArgTypes of={Stories} />

## Estados

Não tem estados. O texto está sempre lá para o leitor de tela.

## Acessibilidade

O texto entra no nome acessível do elemento em volta (no exemplo, o nome do link). Ele não recebe foco e não ocupa espaço na tela. Por isso, não ponha nele nada que precise de interação.

## Conteúdo

Frase curta, que continua a frase visível. Comece com espaço quando vier colado no texto de antes, como em `" (abre a ficha do remédio)"`.

## Faça e não faça

- Faça: completar "Foto" com " (feito)" num passo concluído.
- Não faça: repetir o texto visível. O leitor de tela lê duas vezes a mesma coisa.
```

- [ ] **Passo 14: Changeset**

`frontend/.changeset/primitivos-preparacao.md`:

```md
---
'@bula-clara/tokens': minor
'@bula-clara/ui': patch
---

Tokens de componente (campo, seleção, chip, aba, painel, sobreposição, toast e esqueleto), que seguem o tema, o véu atrás de diálogos e folhas, e o export `@bula-clara/tokens/pares-contraste.json`. No `ui`, as páginas de documentação do Button, do IconButton e do VisuallyHidden.
```

- [ ] **Passo 15: Conferir tudo**

```bash
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm build-storybook
rm -rf packages/ui/storybook-static
```

Esperado: `Tests  69 passed (69)` nos tokens, lint e tipos sem erro, `Tests  23 passed (23)` no `ui` (os testes do `Button` não mudam) e o build do Storybook sem erro, com as três páginas novas em "Docs".

- [ ] **Passo 16: Commit**

```bash
git add frontend/packages/tokens frontend/packages/ui/src frontend/packages/ui/.storybook frontend/.changeset/primitivos-preparacao.md
git commit -m "feat: tokens de componente e preparação dos primitivos (#25)"
```

A partir daqui, os quatro grupos podem rodar em paralelo, cada um num worktree criado a partir deste commit.

---

## Grupo A: ações e tipografia

`Heading`, `Icon`, `LinkButton`, `Prose`, `SkipLink` e `Text`. Barrel: `src/grupos/acoes-e-tipografia.ts`.

### Tarefa A1: `Heading`

**Arquivos:** criar `frontend/packages/ui/src/components/Heading/` (`Heading.tsx`, `Heading.test.tsx`, `Heading.stories.tsx`, `Heading.mdx`, `index.ts`).

Nível e aparência separados: `nivel` decide o `h1` a `h4`, e `estilo` decide a letra. Assim ninguém pula um nível só porque o título 3 parece grande demais. Nomes longos quebram com hífen ou em qualquer ponto (`hyphens-auto wrap-anywhere`). O `ref` e o `tabIndex={-1}` servem para o app levar o foco à frase-resposta quando ela chega.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Heading/Heading.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('usa o nível pedido', () => {
    render(<Heading nivel={2}>Como tomar</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Como tomar' })).toBeInTheDocument();
  });

  it('separa nível de aparência', () => {
    render(
      <Heading nivel={2} estilo="resposta">
        Pode tomar com comida.
      </Heading>,
    );
    const titulo = screen.getByRole('heading', { level: 2 });
    expect(titulo).toHaveClass('font-voz', 'text-resposta');
  });

  it('quebra palavra longa em vez de vazar', () => {
    render(<Heading nivel={1}>Hidroclorotiazida</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('hyphens-auto', 'wrap-anywhere');
  });

  it('aceita ref e tabIndex para receber o foco quando a resposta chega', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading nivel={2} ref={ref} tabIndex={-1}>
        Losartana
      </Heading>,
    );
    ref.current?.focus();
    expect(screen.getByRole('heading', { name: 'Losartana' })).toHaveFocus();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Heading/
```

Esperado: falha, porque `./Heading` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Heading/Heading.tsx`:

```tsx
import type { ReactNode, Ref } from 'react';
import { Heading as AriaHeading, type HeadingProps as AriaHeadingProps } from 'react-aria-components';

export type HeadingNivel = 1 | 2 | 3 | 4;
export type HeadingEstilo = 'titulo-1' | 'resposta' | 'titulo-2' | 'titulo-3';

export interface HeadingProps extends Omit<AriaHeadingProps, 'className' | 'style' | 'level' | 'render'> {
  /** Nível no documento (h1 a h4). Separado do estilo para não pular nível por causa da aparência. */
  nivel: HeadingNivel;
  /** Aparência. Se não vier, segue o nível. */
  estilo?: HeadingEstilo;
  /** O texto do título. */
  children: ReactNode;
  /** Para levar o foco ao título quando a resposta chega (use junto com tabIndex={-1}). */
  ref?: Ref<HTMLHeadingElement>;
}

const estiloDoNivel: Record<HeadingNivel, HeadingEstilo> = {
  1: 'titulo-1',
  2: 'titulo-2',
  3: 'titulo-3',
  4: 'titulo-3',
};

const estilos: Record<HeadingEstilo, string> = {
  'titulo-1': 'font-voz font-semibold text-titulo-1',
  resposta: 'font-voz font-semibold text-resposta',
  'titulo-2': 'font-texto font-bold text-titulo-2',
  'titulo-3': 'font-texto font-bold text-titulo-3',
};

/** Nomes como "Hidroclorotiazida" quebram com hífen (ou em qualquer ponto) em vez de vazar da tela. */
const quebra = 'hyphens-auto wrap-anywhere';

export function Heading({ nivel, estilo, ...props }: HeadingProps) {
  return (
    <AriaHeading
      {...props}
      level={nivel}
      className={`${estilos[estilo ?? estiloDoNivel[nivel]]} ${quebra} text-text-default focus:outline-none`}
    />
  );
}
```

`frontend/packages/ui/src/components/Heading/index.ts`:

```ts
export { Heading, type HeadingEstilo, type HeadingNivel, type HeadingProps } from './Heading';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Heading/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Heading/Heading.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Heading } from './Heading';

const meta = {
  title: 'Componentes/Primitivos/Heading',
  component: Heading,
  args: { nivel: 1, children: 'Losartana' },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Titulo1: Story = { name: 'Título 1' };

export const FraseResposta: Story = {
  name: 'Frase-resposta',
  args: { nivel: 2, estilo: 'resposta', children: 'A losartana pode ser tomada com ou sem comida.' },
};

export const Titulo2: Story = { name: 'Título 2', args: { nivel: 2, children: 'Como tomar' } };

export const Titulo3: Story = { name: 'Título 3', args: { nivel: 3, children: 'Se esquecer uma dose' } };

/** Reflow (WCAG 1.4.10): nome longo, texto a 140% e tela de 320px. Não pode vazar. */
export const NomeLongoEm320px: Story = {
  name: 'Nome longo em 320px a 140%',
  args: { children: 'Hidroclorotiazida' },
  globals: { escala: '140' },
  render: (args) => (
    <div style={{ width: 320 }} data-testid="tela">
      <Heading {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const titulo = canvas.getByRole('heading', { level: 1 });
    const estilo = getComputedStyle(titulo);
    await expect(estilo.overflowWrap).toBe('anywhere');
    await expect(estilo.hyphens).toBe('auto');
    await expect(estilo.fontWeight).toBe('600');
    await expect(titulo.scrollWidth).toBeLessThanOrEqual(titulo.clientWidth);
    await expect(canvas.getByTestId('tela').scrollWidth).toBeLessThanOrEqual(320);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Heading/
```

Esperado: `Tests  5 passed (5)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Heading/Heading.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Heading.stories';

<Meta of={Stories} />

# Heading

Título de página, de seção ou da frase-resposta. O nível no documento e a aparência são escolhidos separados.

<Canvas of={Stories.Titulo1} />

## Quando usar

Em todo título: o nome do remédio no topo da ficha, as seções da resposta e a frase-resposta, que é a mensagem principal da tela.

## Quando não usar

- Para o rótulo curto em caixa alta acima de um bloco ("SUA PERGUNTA"), use `Text` na variante `rotulo`. Ele não é título de seção.
- Para deixar um texto maior ou em negrito sem que ele abra uma seção, use `Text`. O leitor de tela lista os títulos da página, e um título falso atrapalha a navegação.

## Anatomia

Um elemento `h1` a `h4`, com o estilo de texto escolhido. Os títulos 1 e a frase-resposta usam a Literata. Os títulos 2 e 3 usam a Atkinson Hyperlegible em negrito.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.FraseResposta} />

<Canvas of={Stories.Titulo2} />

<Canvas of={Stories.Titulo3} />

<Canvas of={Stories.NomeLongoEm320px} />

## Acessibilidade

- `nivel` decide o elemento (`h1` a `h4`) e `estilo` decide a aparência. Assim nenhum nível é pulado por causa do tamanho da letra.
- Nomes longos, como "Hidroclorotiazida", quebram com hífen ou em qualquer ponto, em vez de vazar da tela. A story **Nome longo em 320px a 140%** confere isso com a tela de 320px e o texto em 140% (WCAG 1.4.10).
- Quando a resposta chega, o app leva o foco para a frase-resposta. Para isso, passe `ref` e `tabIndex={-1}`. O título recebe o foco sem mostrar contorno, porque não é um controle.
- Os tamanhos crescem com o A+ e continuam acima do corpo do texto nos três níveis.

## Conteúdo

O título diz do que trata a seção, em poucas palavras ("Como tomar", "Se esquecer uma dose"). A frase-resposta é uma frase completa, com a resposta e não com o assunto ("A losartana pode ser tomada com ou sem comida."). Vale a regra 1 de **Conteúdo e voz**: a mensagem principal vem primeiro.

## Faça e não faça

- Faça: `<Heading nivel={2} estilo="resposta">` para a frase-resposta logo abaixo do `h1`.
- Não faça: `nivel={4}` só porque o título 3 parece grande demais. Troque o `estilo` e mantenha o nível certo.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Heading
git commit -m "feat: componente Heading (#25)"
```

---

### Tarefa A2: `Icon`

**Arquivos:** criar `frontend/packages/ui/src/components/Icon/`.

Todo ícone diz o que é: ou tem `rotulo` (vira `role="img"`) ou é `decorativo` (fica com `aria-hidden`). Sem nenhum dos dois, não compila. O tamanho é em rem.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Icon/Icon.test.tsx`:

```tsx
import { Info } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('com rótulo, é uma imagem com nome', () => {
    render(<Icon icone={Info} rotulo="Informação" />);
    expect(screen.getByRole('img', { name: 'Informação' })).toBeInTheDocument();
  });

  it('decorativo, fica escondido do leitor de tela', () => {
    const { container } = render(<Icon icone={Info} decorativo />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('cresce com o A+ (tamanho em rem)', () => {
    const { container } = render(<Icon icone={Info} decorativo tamanho="grande" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '2rem');
  });

  it('não compila sem rótulo nem decorativo', () => {
    // @ts-expect-error o ícone precisa ter rotulo ou ser decorativo
    const elemento = <Icon icone={Info} />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Icon/
```

Esperado: falha, porque `./Icon` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Icon/Icon.tsx`:

```tsx
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

export type IconTamanho = 'pequeno' | 'medio' | 'grande';

/** Em rem, para o ícone crescer com o controle A+: 20, 24 e 32px com o texto em 100%. */
const tamanhos: Record<IconTamanho, string> = {
  pequeno: '1.25rem',
  medio: '1.5rem',
  grande: '2rem',
};

interface IconBase {
  /** Ícone Phosphor, sempre no peso `bold`. */
  icone: PhosphorIcon;
  /** 20, 24 ou 32px com o texto em 100%. Cresce com o A+. */
  tamanho?: IconTamanho;
}

/**
 * Todo ícone precisa dizer o que é: ou tem `rotulo` (o leitor de tela lê) ou é `decorativo`
 * (fica escondido, porque o texto ao lado já diz tudo). Sem nenhum dos dois, não compila.
 */
export type IconProps = IconBase & ({ rotulo: string; decorativo?: never } | { decorativo: true; rotulo?: never });

export function Icon({ icone: Icone, tamanho = 'medio', rotulo }: IconProps) {
  const size = tamanhos[tamanho];
  if (rotulo) {
    return <Icone size={size} weight="bold" role="img" aria-label={rotulo} focusable="false" className="shrink-0" />;
  }
  return <Icone size={size} weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />;
}
```

`frontend/packages/ui/src/components/Icon/index.ts`:

```ts
export { Icon, type IconProps, type IconTamanho } from './Icon';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Icon/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Icon/Icon.stories.tsx`:

```tsx
import { Info, Prohibit, Warning } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon } from './Icon';

const meta = {
  title: 'Componentes/Primitivos/Icon',
  component: Icon,
  args: { icone: Info, rotulo: 'Informação' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComRotulo: Story = {
  name: 'Com rótulo',
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Informação' })).toBeInTheDocument();
  },
};

export const DecorativoAoLadoDoTexto: Story = {
  name: 'Decorativo, ao lado do texto',
  render: () => (
    <p className="flex items-center gap-2 text-corpo text-caution-text">
      <Icon icone={Warning} decorativo />A bula pede cuidado com essa combinação
    </p>
  ),
};

export const Tamanhos: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-danger-text">
      <Icon icone={Prohibit} rotulo="Não usar junto (pequeno)" tamanho="pequeno" />
      <Icon icone={Prohibit} rotulo="Não usar junto (médio)" tamanho="medio" />
      <Icon icone={Prohibit} rotulo="Não usar junto (grande)" tamanho="grande" />
    </div>
  ),
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Icon/
```

Esperado: `Tests  3 passed (3)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Icon/Icon.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Icon.stories';

<Meta of={Stories} />

# Icon

Ícone Phosphor solto, fora de um botão, que ou diz o que é ou fica escondido do leitor de tela.

<Canvas of={Stories.ComRotulo} />

## Quando usar

Ao lado de um texto, para reforçar o sentido (um aviso, uma seção da bula), ou sozinho, quando o ícone carrega informação, como o sinal de "não usar junto".

## Quando não usar

- Dentro de botões, use a prop `icone` do `Button`, do `LinkButton` ou do `IconButton`. Eles já cuidam do tamanho e de esconder o ícone.
- Nunca use emoji no lugar do ícone. O leitor de tela lê o nome do emoji, que muda de aparelho para aparelho.

## Anatomia

Um `svg` do Phosphor no peso `bold`, com a cor do texto em volta. O tamanho é em rem e cresce com o A+.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.DecorativoAoLadoDoTexto} />

<Canvas of={Stories.Tamanhos} />

## Acessibilidade

- Todo ícone tem que dizer o que é. Com `rotulo`, ele vira `role="img"` com esse nome. Com `decorativo`, fica com `aria-hidden`. Sem nenhum dos dois, o código não compila.
- O ícone nunca é a única forma de passar a informação: a cor e o desenho vêm junto com texto, em algum lugar da tela.
- O ícone herda a cor do texto. No alto contraste, ele muda junto.

## Conteúdo

O `rotulo` diz o significado, e não o desenho: "Não usar junto", e não "Círculo cortado".

## Faça e não faça

- Faça: `<Icon icone={Warning} decorativo />` ao lado de "A bula pede cuidado com essa combinação".
- Não faça: um ícone com `rotulo` ao lado de um texto que diz a mesma coisa. O leitor de tela lê duas vezes.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Icon
git commit -m "feat: componente Icon (#25)"
```

---

### Tarefa A3: `LinkButton`

**Arquivos:** criar `frontend/packages/ui/src/components/LinkButton/`.

Link com a cara do `Button`, nas mesmas variantes, usando o `classesDeBotao` da Tarefa 1. `href` é obrigatório. Na variante `discreta`, o sublinhado fica, para continuar parecendo link.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/LinkButton/LinkButton.test.tsx`:

```tsx
import { BookOpen } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('é um link, com o destino no href', () => {
    render(<LinkButton href="#bula">Ver a bula inteira</LinkButton>);
    expect(screen.getByRole('link', { name: 'Ver a bula inteira' })).toHaveAttribute('href', '#bula');
  });

  it('recebe foco pelo teclado', async () => {
    render(<LinkButton href="#sobre">Saber mais</LinkButton>);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Saber mais' })).toHaveFocus();
  });

  it('tem a mesma área de toque e o mesmo ícone decorativo do Button', () => {
    render(
      <LinkButton href="#bula" icone={BookOpen}>
        Ver a bula inteira
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'Ver a bula inteira' });
    expect(link).toHaveClass('min-h-12', 'min-w-12');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('não compila sem href', () => {
    // @ts-expect-error href é obrigatório; ação sem destino é Button
    const elemento = <LinkButton>Ver a bula inteira</LinkButton>;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/LinkButton/
```

Esperado: falha, porque `./LinkButton` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/LinkButton/LinkButton.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react';
import { Link as AriaLink, type LinkProps as AriaLinkProps } from 'react-aria-components';
import { classesDeBotao, type ButtonVariante } from '../Button/estilo';

export interface LinkButtonProps extends Omit<AriaLinkProps, 'className' | 'style' | 'href' | 'children'> {
  /** Obrigatório: um LinkButton sempre leva a algum lugar. Para ação na própria tela, use Button. */
  href: string;
  /** O texto diz para onde o link leva ("Ver a bula inteira"). */
  children: string;
  /** As mesmas do Button. Na `discreta`, o link fica sublinhado. */
  variante?: ButtonVariante;
  /** Ícone Phosphor à esquerda do texto. É decorativo. */
  icone?: Icon;
  /** Ocupa a largura toda do contêiner. */
  larguraTotal?: boolean;
}

/** Link com a cara do Button, nas mesmas variantes. */
export function LinkButton({
  variante = 'primaria',
  icone: Icone,
  larguraTotal = false,
  children,
  ...props
}: LinkButtonProps) {
  const classes = classesDeBotao(variante, larguraTotal) + (variante === 'discreta' ? '' : ' no-underline');
  return (
    <AriaLink {...props} className={classes}>
      {Icone ? <Icone size={24} weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaLink>
  );
}
```

`frontend/packages/ui/src/components/LinkButton/index.ts`:

```ts
export { LinkButton, type LinkButtonProps } from './LinkButton';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/LinkButton/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/LinkButton/LinkButton.stories.tsx`:

```tsx
import { BookOpen } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { LinkButton } from './LinkButton';

const meta = {
  title: 'Componentes/Primitivos/LinkButton',
  component: LinkButton,
  args: { href: '#bula', children: 'Ver a bula inteira', icone: BookOpen },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {
  name: 'Primário',
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Ver a bula inteira' });
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await expect(getComputedStyle(link).textDecorationLine).toBe('none');
  },
};

export const Secundario: Story = { name: 'Secundário', args: { variante: 'secundaria' } };

export const Discreto: Story = {
  args: { variante: 'discreta', icone: undefined, href: '#sobre', children: 'Saber mais sobre o Bula Clara' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Saber mais sobre o Bula Clara' });
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/LinkButton/
```

Esperado: `Tests  3 passed (3)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/LinkButton/LinkButton.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './LinkButton.stories';

<Meta of={Stories} />

# LinkButton

Link com a aparência do `Button`, para levar a pessoa a outra página ou a outra parte da tela.

<Canvas of={Stories.Primario} />

## Quando usar

Quando o destino é um endereço: ver a bula inteira, abrir a ficha do remédio, ir para "Meus remédios".

## Quando não usar

- Para uma ação na própria tela (perguntar, apagar, abrir um diálogo), use `Button`.
- Para um link dentro de um parágrafo, use um `a` comum dentro de `Prose`.

## Anatomia

As mesmas partes do `Button`: contêiner com borda de 2px e 48px de altura, ícone opcional à esquerda e o texto. Na variante `discreta`, o texto fica sublinhado, para continuar parecendo link.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Secundario} />

<Canvas of={Stories.Discreto} />

## Acessibilidade

- Usa o `Link` do React Aria: papel `link` e Enter para abrir. O leitor de tela anuncia "link", e a pessoa sabe que vai mudar de lugar.
- `href` é obrigatório. Sem destino, o certo é `Button`.
- O ícone é decorativo e fica escondido do leitor de tela.
- 48px de altura, foco com contorno de 3px e as mesmas cores do `Button` nos dois temas.

## Conteúdo

O texto diz para onde o link leva: "Ver a bula inteira", "Saber mais sobre o Bula Clara".

## Faça e não faça

- Faça: "Ver a bula inteira".
- Não faça: "Clique aqui" ou "Saiba mais" sozinho. Fora do contexto, numa lista de links do leitor de tela, o texto não diz nada.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/LinkButton
git commit -m "feat: componente LinkButton (#25)"
```

---

### Tarefa A4: `Prose`

**Arquivos:** criar `frontend/packages/ui/src/components/Prose/`.

Texto corrido com no máximo 65 caracteres por linha e ritmo entre os blocos. Estiliza o HTML simples de dentro (parágrafos, listas, links, ênfase) e devolve os marcadores das listas, que o reset do Tailwind tira.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Prose/Prose.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Prose } from './Prose';

describe('Prose', () => {
  it('limita a linha pelo token de 65 caracteres', () => {
    render(
      <Prose>
        <p>Tome com água.</p>
      </Prose>,
    );
    expect(screen.getByText('Tome com água.').parentElement).toHaveClass('max-w-medida');
  });

  it('mantém a estrutura do conteúdo', () => {
    render(
      <Prose>
        <ul>
          <li>Tontura</li>
          <li>Dor de cabeça</li>
        </ul>
      </Prose>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Prose/
```

Esperado: falha, porque `./Prose` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Prose/Prose.tsx`:

```tsx
import type { ReactNode } from 'react';

export interface ProseProps {
  /** HTML simples: parágrafos, listas, links e ênfase. */
  children: ReactNode;
}

/**
 * Texto corrido: no máximo 65 caracteres por linha e ritmo vertical entre os blocos.
 * Estiliza os elementos de dentro (p, listas, links, ênfase), para receber HTML simples.
 */
const classes = [
  'max-w-medida text-corpo text-text-default',
  '[&>*+*]:mt-3 [&>:is(h2,h3)]:mt-6',
  '[&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:ps-6 [&_li+li]:mt-2',
  '[&_strong]:font-bold',
  '[&_a]:text-action-primary [&_a]:underline [&_a]:underline-offset-4',
  '[&_a:hover]:text-action-primary-strong [&_a:focus-visible]:foco-visivel',
].join(' ');

export function Prose({ children }: ProseProps) {
  return <div className={classes}>{children}</div>;
}
```

`frontend/packages/ui/src/components/Prose/index.ts`:

```ts
export { Prose, type ProseProps } from './Prose';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Prose/
pnpm typecheck
```

Esperado: `Tests  2 passed (2)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Prose/Prose.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Prose } from './Prose';

const meta = {
  title: 'Componentes/Primitivos/Prose',
  component: Prose,
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explicacao: Story = {
  name: 'Explicação com lista e link',
  args: {
    children: (
      <>
        <p>
          A losartana ajuda a controlar a pressão alta. Ela costuma ser tomada uma vez por dia, com ou sem comida
          [1].
        </p>
        <p>O que pode fazer mal, segundo a bula:</p>
        <ul>
          <li>tontura, principalmente ao levantar rápido;</li>
          <li>
            cansaço nos primeiros dias de uso <strong>(passa com o tempo)</strong>.
          </li>
        </ul>
        <p>
          Se tiver dúvida, <a href="#farmaceutico">fale com o farmacêutico</a>.
        </p>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await document.fonts.ready;
    const prose = canvas.getByText(/A losartana ajuda/).parentElement as HTMLElement;
    const zero = document.createElement('span');
    zero.textContent = '0';
    prose.appendChild(zero);
    const larguraDoZero = zero.getBoundingClientRect().width;
    zero.remove();
    // 65ch = 65 vezes a largura do "0" na fonte do texto.
    await expect(prose.getBoundingClientRect().width).toBeLessThanOrEqual(larguraDoZero * 65 + 1);
    await expect(prose.getBoundingClientRect().width).toBeGreaterThan(larguraDoZero * 60);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Prose/
```

Esperado: `Tests  1 passed (1)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Prose/Prose.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Prose.stories';

<Meta of={Stories} />

# Prose

Caixa para texto corrido: limita a linha a 65 caracteres e dá espaço entre parágrafos, listas e links.

<Canvas of={Stories.Explicacao} />

## Quando usar

Em explicações com mais de um parágrafo, como o texto da resposta e as seções da bula na ficha do remédio. Também serve para HTML simples vindo da API (parágrafos, listas, links e ênfase).

## Quando não usar

- Para uma frase só, use `Text`.
- Para avisos, use `Alert`. Texto de segurança nunca fica perdido no meio de um parágrafo.

## Anatomia

Um `div` que estiliza o que está dentro: parágrafos com 12px entre eles, títulos com 24px antes, listas com marcador, links sublinhados e `strong` em negrito.

## Props

<ArgTypes of={Stories} />

## Estados

Não tem estados próprios. Os links dentro dele mostram o contorno de foco pelo teclado.

## Acessibilidade

- 65 caracteres por linha, no máximo. A story confere a largura com a fonte já carregada.
- As listas voltam a ter marcador, que o reset do Tailwind tira. O leitor de tela anuncia "lista, 2 itens".
- Os links ficam sublinhados e com a cor de ação, e mudam de cor no hover. A cor nunca é o único sinal.
- Com o A+ em 140%, a linha continua em 65 caracteres, porque a medida é em `ch`.

## Conteúdo

Frases curtas, uma ideia por parágrafo, e listas quando houver três itens ou mais. Valem as regras 2 e 3 de **Conteúdo e voz**: palavras do dia a dia e frases curtas.

## Faça e não faça

- Faça: quebrar "tontura e cansaço nos primeiros dias" numa lista.
- Não faça: um parágrafo de seis linhas com todos os efeitos da bula.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Prose
git commit -m "feat: componente Prose (#25)"
```

---

### Tarefa A5: `SkipLink`

**Arquivos:** criar `frontend/packages/ui/src/components/SkipLink/`.

Primeiro item da página. Fica em `sr-only` até receber foco pelo teclado, e aí aparece no canto de cima com 48px de altura. `href` aceita só uma âncora da própria página.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/SkipLink/SkipLink.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('aponta para o conteúdo principal', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute('href', '#conteudo');
  });

  it('é o primeiro a receber foco', async () => {
    render(
      <>
        <SkipLink />
        <button type="button">Perguntar</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus();
  });

  it('só aceita âncora da própria página', () => {
    // @ts-expect-error o destino precisa começar com #
    const elemento = <SkipLink href="/perguntar" />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SkipLink/
```

Esperado: falha, porque `./SkipLink` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/SkipLink/SkipLink.tsx`:

```tsx
import type { ReactNode } from 'react';

export interface SkipLinkProps {
  /** Âncora do conteúdo principal, sempre um fragmento da própria página. */
  href?: `#${string}`;
  /** O texto do link. */
  children?: ReactNode;
}

/** Primeiro item da página: some da tela até receber foco pelo teclado. */
export function SkipLink({ href = '#conteudo', children = 'Pular para o conteúdo' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={
        'sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 ' +
        'focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-controle focus:px-6 ' +
        'focus:bg-surface-default focus:text-botao focus:font-bold focus:text-action-primary focus:foco-visivel'
      }
    >
      {children}
    </a>
  );
}
```

`frontend/packages/ui/src/components/SkipLink/index.ts`:

```ts
export { SkipLink, type SkipLinkProps } from './SkipLink';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SkipLink/
pnpm typecheck
```

Esperado: `Tests  3 passed (3)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/SkipLink/SkipLink.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { SkipLink } from './SkipLink';

const meta = {
  title: 'Componentes/Primitivos/SkipLink',
  component: SkipLink,
  render: (args) => (
    <>
      <SkipLink {...args} />
      <main id="conteudo">
        <p>Conteúdo principal da página.</p>
      </main>
    </>
  ),
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AparecePeloTeclado: Story = {
  name: 'Aparece com o Tab',
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/SkipLink/
```

Esperado: `Tests  1 passed (1)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/SkipLink/SkipLink.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './SkipLink.stories';

<Meta of={Stories} />

# SkipLink

O primeiro item da página: um link que pula o cabeçalho e leva direto ao conteúdo. Some da tela até receber foco pelo teclado.

<Canvas of={Stories.AparecePeloTeclado} />

O link está aí em cima, escondido. Abra a story sozinha e aperte Tab para ele aparecer.

## Quando usar

Uma vez em cada página do app, como primeiro elemento do `body`, apontando para o `main`.

## Quando não usar

Para navegar entre seções da mesma página, use um índice de links visíveis. O `SkipLink` é só para pular o que se repete em toda página.

## Anatomia

- Link com o texto "Pular para o conteúdo".
- Quando recebe foco: caixa branca no canto de cima, 48px de altura, texto azul em negrito e contorno de foco.

## Props

<ArgTypes of={Stories} />

## Estados

Escondido (o normal) e visível com foco. A story **Aparece com o Tab** confere os dois.

Para conferir na mão:

1. Abra a story sozinha, fora desta página.
2. Aperte Tab uma vez. O link aparece no canto de cima, com o contorno de foco.
3. Aperte Enter. O foco vai para o conteúdo principal.

## Acessibilidade

- É lido pelo leitor de tela mesmo escondido, porque usa `sr-only`, e não `display: none`.
- Com foco, fica por cima de tudo, com 48px de altura.
- `href` aceita só uma âncora da própria página (`#conteudo`). O `main` precisa ter esse `id`.

## Conteúdo

"Pular para o conteúdo". Se mudar, mantenha o verbo e o destino.

## Faça e não faça

- Faça: `<SkipLink />` antes do cabeçalho, com `<main id="conteudo">` logo depois.
- Não faça: deixar o link sempre visível ou sempre escondido. Ele aparece só com o foco.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/SkipLink
git commit -m "feat: componente SkipLink (#25)"
```

---

### Tarefa A6: `Text`

**Arquivos:** criar `frontend/packages/ui/src/components/Text/`.

Os três estilos de texto do sistema: `corpo`, `apoio` e `rotulo` (o título curto em caixa alta, como "SUA PERGUNTA").

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Text/Text.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('é um parágrafo de corpo por padrão', () => {
    render(<Text>Tome um comprimido por dia.</Text>);
    const texto = screen.getByText('Tome um comprimido por dia.');
    expect(texto.tagName).toBe('P');
    expect(texto).toHaveClass('text-corpo', 'text-text-default');
  });

  it('tem a variante de apoio', () => {
    render(
      <Text variante="apoio" elemento="span">
        Bula oficial ANVISA
      </Text>,
    );
    const texto = screen.getByText('Bula oficial ANVISA');
    expect(texto.tagName).toBe('SPAN');
    expect(texto).toHaveClass('text-apoio', 'text-text-muted');
  });

  it('tem o rótulo de bloco em caixa alta', () => {
    render(<Text variante="rotulo">Sua pergunta</Text>);
    expect(screen.getByText('Sua pergunta')).toHaveClass('text-rotulo', 'uppercase', 'tracking-rotulo');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Text/
```

Esperado: falha, porque `./Text` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Text/Text.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Text as AriaText } from 'react-aria-components';

export type TextVariante = 'corpo' | 'apoio' | 'rotulo';

export interface TextProps {
  /**
   * `corpo` para o texto normal; `apoio` para fonte, metadados e dicas;
   * `rotulo` para o título curto de bloco em caixa alta ("SUA PERGUNTA"), só com palavras curtas.
   */
  variante?: TextVariante;
  /** O elemento HTML. `span` para usar dentro de outra linha. */
  elemento?: 'p' | 'span' | 'div';
  /** Para ligar o texto a um controle com aria-describedby. */
  id?: string;
  /** O texto. */
  children: ReactNode;
}

const variantes: Record<TextVariante, string> = {
  corpo: 'text-corpo text-text-default',
  apoio: 'text-apoio text-text-muted',
  rotulo: 'text-rotulo font-bold uppercase tracking-rotulo text-text-muted',
};

export function Text({ variante = 'corpo', elemento = 'p', ...props }: TextProps) {
  return <AriaText {...props} elementType={elemento} className={variantes[variante]} />;
}
```

`frontend/packages/ui/src/components/Text/index.ts`:

```ts
export { Text, type TextProps, type TextVariante } from './Text';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Text/
pnpm typecheck
```

Esperado: `Tests  3 passed (3)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Text/Text.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'Componentes/Primitivos/Text',
  component: Text,
  args: { children: 'Tome um comprimido de 50 mg uma vez por dia, sempre no mesmo horário.' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Corpo: Story = {};

export const Apoio: Story = {
  args: { variante: 'apoio', children: 'Bula oficial ANVISA · Losartana, versão de 03/2025' },
};

export const Rotulo: Story = {
  name: 'Rótulo de bloco',
  args: { variante: 'rotulo', children: 'Sua pergunta' },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Text/
```

Esperado: `Tests  3 passed (3)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Text/Text.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Text.stories';

<Meta of={Stories} />

# Text

Texto com um dos três estilos do sistema: corpo, apoio e rótulo de bloco.

<Canvas of={Stories.Corpo} />

## Quando usar

- `corpo` para o texto normal, de 18px com o texto em 100%.
- `apoio` para a fonte da informação, datas, metadados e dicas.
- `rotulo` para o título curto em caixa alta acima de um bloco ("SUA PERGUNTA").

## Quando não usar

- Para títulos de seção, use `Heading`.
- Para mais de um parágrafo, use `Prose`.
- Não use `apoio` para informação que a pessoa precisa para decidir. Ele é menor e mais claro.

## Anatomia

Um `p`, `span` ou `div` com o estilo de texto escolhido.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Apoio} />

<Canvas of={Stories.Rotulo} />

## Acessibilidade

- Os três estilos passam no contraste AA nos dois temas, inclusive o `apoio`, que é cinza.
- O `rotulo` fica em caixa alta só pelo CSS. O leitor de tela lê a palavra normal, e não letra por letra.
- Com `id`, o texto pode descrever um controle (`aria-describedby`).

## Conteúdo

O `rotulo` leva no máximo três palavras curtas. Texto em caixa alta é mais difícil de ler.

## Faça e não faça

- Faça: `<Text variante="apoio">Bula oficial ANVISA · Losartana, versão de 03/2025</Text>`.
- Não faça: uma frase inteira na variante `rotulo`.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Text
git commit -m "feat: componente Text (#25)"
```

---

### Tarefa A7: Barrel, changeset e conferência do grupo A

**Arquivos:** modificar `frontend/packages/ui/src/grupos/acoes-e-tipografia.ts`; criar `frontend/.changeset/primitivos-acoes-e-tipografia.md`.

- [ ] **Passo 1: Barrel**

`frontend/packages/ui/src/grupos/acoes-e-tipografia.ts`:

```ts
// Grupo A do plano 2: ações e tipografia.
export * from '../components/Heading';
export * from '../components/Icon';
export * from '../components/LinkButton';
export * from '../components/Prose';
export * from '../components/SkipLink';
export * from '../components/Text';
```

- [ ] **Passo 2: Changeset**

`frontend/.changeset/primitivos-acoes-e-tipografia.md`:

```md
---
'@bula-clara/ui': minor
---

Novos componentes de ação e de texto: Heading, Icon, LinkButton, Prose, SkipLink e Text.
```

- [ ] **Passo 3: Conferir o grupo**

```bash
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm --filter @bula-clara/ui exec vitest run --project unit
```

Esperado: `Tests  69 passed (69)` nos tokens, lint e tipos sem erro, `Tests  59 passed (59)` no `ui` e `Tests  32 passed (32)` só na unidade. Se o worktree já tiver outro grupo junto, os números são os da tabela de "Como as tarefas rodam".

- [ ] **Passo 4: Commit**

```bash
git add frontend/packages/ui/src/grupos/acoes-e-tipografia.ts frontend/.changeset/primitivos-acoes-e-tipografia.md
git commit -m "feat: exporta os primitivos de ação e de texto (#25)"
```

---

## Grupo B: campos

`TextField`, `TextArea`, `SearchField`, `ComboBox`, `Checkbox`, `RadioGroup` e `Switch`. Barrel: `src/grupos/campos.ts`. As peças comuns aos campos (rótulo, dica, erro e as classes da entrada) ficam em `src/components/Campo/partes.tsx`, que nasce na Tarefa B1 e não é exportado pelo pacote.

### Tarefa B1: `TextField` e as peças dos campos

**Arquivos:** criar `frontend/packages/ui/src/components/Campo/partes.tsx` e `frontend/packages/ui/src/components/TextField/`.

Rótulo visível obrigatório, dica ligada por `aria-describedby` e erro numa região `aria-live` sempre montada. O placeholder entra como `exemplo`. Inválido, a borda passa a 3px na cor de perigo, e o erro vem com ícone. O contorno de foco aparece sempre, até no clique, porque é um campo de texto.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/TextField/TextField.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('liga o rótulo visível ao campo', () => {
    render(<TextField rotulo="Nome do remédio" />);
    expect(screen.getByLabelText('Nome do remédio')).toBeInTheDocument();
    expect(screen.getByText('Nome do remédio')).toBeVisible();
  });

  it('liga a descrição ao campo', () => {
    render(<TextField rotulo="Nome do remédio" descricao="Como está escrito na caixa." />);
    expect(screen.getByRole('textbox', { name: 'Nome do remédio' })).toHaveAccessibleDescription(
      'Como está escrito na caixa.',
    );
  });

  it('chama onChange ao digitar', async () => {
    const onChange = vi.fn();
    render(<TextField rotulo="Nome do remédio" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Nome do remédio'), 'losartana');
    expect(onChange).toHaveBeenLastCalledWith('losartana');
  });

  it('mostra o erro dentro de uma região aria-live que já existia antes', () => {
    const { container, rerender } = render(<TextField rotulo="Nome do remédio" mensagemErro="Escreva o nome." />);
    const regiao = container.querySelector('[aria-live="polite"]');
    expect(regiao).toBeEmptyDOMElement();

    rerender(<TextField rotulo="Nome do remédio" mensagemErro="Escreva o nome." isInvalid />);
    expect(container.querySelector('[aria-live="polite"]')).toBe(regiao);
    expect(regiao).toHaveTextContent('Escreva o nome.');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Escreva o nome.');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <TextField />;
    expect(elemento).toBeTruthy();
  });

  it('mostra o exemplo sem tirar o rótulo', () => {
    render(<TextField rotulo="Adicionar remédio" exemplo="ex.: metformina" />);
    expect(screen.getByRole('textbox', { name: 'Adicionar remédio' })).toHaveAttribute('placeholder', 'ex.: metformina');
  });

  it('não aceita placeholder solto', () => {
    // @ts-expect-error o exemplo entra por `exemplo`, que convive com o rótulo obrigatório
    const elemento = <TextField rotulo="Nome do remédio" placeholder="ex.: losartana" />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TextField/
```

Esperado: falha, porque `./TextField` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Campo/partes.tsx`:

```tsx
// Peças internas dos campos do grupo B (não são exportadas pelo pacote).
import { Warning } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { FieldError, Label, Text, type ValidationResult } from 'react-aria-components';

export type MensagemErro = string | ((validacao: ValidationResult) => string);

/** Rótulo, entrada, dica e erro empilhados com 4px entre eles; no máximo 420px de largura. */
export const classesDoCampo = 'flex max-w-105 flex-col gap-1';

/** Borda de 2px; quando inválido, 3px em danger-border. O foco aparece sempre, até no clique. */
export const classesDaEntrada =
  'min-h-12 w-full rounded-controle border-(length:--bc-borda-controle) border-campo-borda bg-campo-fundo ' +
  'px-3 py-2 text-corpo text-text-default placeholder:text-text-muted transition-colors duration-rapida ease-out ' +
  'data-focused:foco-visivel data-invalid:border-3 data-invalid:border-campo-borda-invalida ' +
  'data-disabled:cursor-not-allowed data-disabled:opacity-55';

export function Rotulo({ children }: { children: ReactNode }) {
  return <Label className="text-corpo font-bold text-text-default">{children}</Label>;
}

export function Descricao({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <Text slot="description" className="text-apoio text-text-muted">
      {children}
    </Text>
  );
}

/**
 * A região aria-live fica sempre montada: assim o leitor de tela anuncia o erro quando ele aparece.
 * O FieldError só desenha alguma coisa quando o campo está inválido.
 */
export function ErroDoCampo({ mensagem }: { mensagem?: MensagemErro | undefined }) {
  return (
    <div aria-live="polite">
      <FieldError className="flex items-center gap-1 text-apoio font-bold text-campo-texto-erro">
        {(validacao) => (
          <>
            <Warning size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
            {typeof mensagem === 'function' ? mensagem(validacao) : (mensagem ?? validacao.validationErrors.join(' '))}
          </>
        )}
      </FieldError>
    </div>
  );
}
```

`frontend/packages/ui/src/components/TextField/TextField.tsx`:

```tsx
import { Input, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'className' | 'style' | 'children' | 'render'> {
  /** Rótulo visível. Obrigatório: o exemplo (placeholder) nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo ("Como está escrito na caixa."). */
  descricao?: string;
  /** Exemplo dentro do campo vazio ("ex.: metformina"). Some ao digitar, por isso nunca é o rótulo. */
  exemplo?: string;
  /** Texto do erro. Sem ele, aparece a mensagem de validação do navegador. */
  mensagemErro?: MensagemErro;
}

export function TextField({ rotulo, descricao, exemplo, mensagemErro, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={classesDoCampo}>
      <Rotulo>{rotulo}</Rotulo>
      <Input placeholder={exemplo} className={classesDaEntrada} />
      <Descricao>{descricao}</Descricao>
      <ErroDoCampo mensagem={mensagemErro} />
    </AriaTextField>
  );
}
```

`frontend/packages/ui/src/components/TextField/index.ts`:

```ts
export { TextField, type TextFieldProps } from './TextField';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TextField/
pnpm typecheck
```

Esperado: `Tests  7 passed (7)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/TextField/TextField.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { TextField } from './TextField';

const meta = {
  title: 'Componentes/Primitivos/TextField',
  component: TextField,
  args: { rotulo: 'Nome do remédio', descricao: 'Como está escrito na caixa.' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  play: async ({ canvas }) => {
    const campo = canvas.getByLabelText('Nome do remédio');
    await expect(campo.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

export const ComErro: Story = {
  args: {
    defaultValue: 'lozartana xyz',
    descricao: undefined,
    isInvalid: true,
    mensagemErro: 'Não achei esse remédio. Confira o nome na caixa.',
  },
  play: async ({ canvas }) => {
    const campo = canvas.getByLabelText('Nome do remédio');
    await expect(getComputedStyle(campo).borderTopWidth).toBe('3px');
  },
};

export const ValidacaoAoDigitar: Story = {
  name: 'Validação ao apagar o texto',
  args: {
    isRequired: true,
    validationBehavior: 'aria',
    validate: (valor: string) => (valor.trim() ? null : 'Escreva o nome do remédio para continuar.'),
  },
  play: async ({ canvas }) => {
    const campo = canvas.getByLabelText('Nome do remédio');
    await userEvent.type(campo, 'a');
    await userEvent.clear(campo);
    await expect(await canvas.findByText('Escreva o nome do remédio para continuar.')).toBeVisible();
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Desabilitado: Story = { args: { isDisabled: true, defaultValue: 'Losartana' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/TextField/
```

Esperado: `Tests  4 passed (4)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/TextField/TextField.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './TextField.stories';

<Meta of={Stories} />

# TextField

Campo de uma linha, com rótulo visível, dica e mensagem de erro.

<Canvas of={Stories.Padrao} />

## Quando usar

Para texto curto e livre, como o nome de um remédio que a pessoa vai digitar.

## Quando não usar

- Para escolher um remédio da base, use `ComboBox`. Ele sugere os nomes e aceita erro de digitação.
- Para a pergunta, que pode ser longa, use `TextArea`.
- Para buscar dentro de um texto, use `SearchField`.

## Anatomia

- Rótulo, em negrito, acima do campo.
- Entrada com borda de 2px e 48px de altura.
- Dica, em texto de apoio, abaixo da entrada.
- Mensagem de erro, com ícone de aviso, abaixo da dica.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.ComErro} />

<Canvas of={Stories.Desabilitado} />

A story **Validação ao apagar o texto** mostra o erro aparecendo enquanto a pessoa digita. Abra a story sozinha para ver.

## Acessibilidade

- O rótulo é obrigatório e sempre visível. O `exemplo` (placeholder) some ao digitar e nunca faz esse papel. Não existe a prop `placeholder`: ela não compila.
- A dica fica ligada ao campo por `aria-describedby`, e o leitor de tela lê a dica depois do rótulo.
- O erro fica numa região `aria-live` sempre montada. Assim o leitor de tela anuncia a mensagem no momento em que ela aparece.
- Inválido, a borda passa a 3px na cor de perigo e o erro vem com ícone e texto. A cor nunca é o único sinal.
- O contorno de foco aparece sempre, até com clique ou toque, para a pessoa ver onde está digitando.

## Conteúdo

- Rótulo: o que a pessoa escreve ("Nome do remédio").
- Dica: onde achar a informação ("Como está escrito na caixa.").
- Erro: o que aconteceu e o que fazer ("Não achei esse remédio. Confira o nome na caixa."). Vale a regra 5 de **Conteúdo e voz**: toda recusa tem um próximo passo.

## Faça e não faça

- Faça: rótulo "Nome do remédio" e exemplo "ex.: metformina".
- Não faça: campo sem rótulo, só com "Digite o nome do remédio" dentro dele.
- Faça: "Escreva o nome do remédio para continuar."
- Não faça: "Campo obrigatório" ou "Entrada inválida".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Campo frontend/packages/ui/src/components/TextField
git commit -m "feat: componente TextField (#25)"
```

---

### Tarefa B2: `TextArea`

**Arquivos:** criar `frontend/packages/ui/src/components/TextArea/`.

As mesmas peças do `TextField`, com a entrada de várias linhas (4 por padrão) que a pessoa pode esticar.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/TextArea/TextArea.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('é uma caixa de texto de várias linhas com rótulo', () => {
    render(<TextArea rotulo="Sua pergunta" />);
    const campo = screen.getByRole('textbox', { name: 'Sua pergunta' });
    expect(campo.tagName).toBe('TEXTAREA');
    expect(campo).toHaveAttribute('rows', '4');
  });

  it('aceita quebra de linha', async () => {
    render(<TextArea rotulo="Sua pergunta" />);
    await userEvent.type(screen.getByLabelText('Sua pergunta'), 'Posso tomar{Enter}com café?');
    expect(screen.getByLabelText('Sua pergunta')).toHaveValue('Posso tomar\ncom café?');
  });

  it('anuncia o erro por aria-live', () => {
    const { container } = render(<TextArea rotulo="Sua pergunta" isInvalid mensagemErro="Escreva sua pergunta." />);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Escreva sua pergunta.');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <TextArea />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TextArea/
```

Esperado: falha, porque `./TextArea` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/TextArea/TextArea.tsx`:

```tsx
import { TextArea as AriaTextArea, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';

export interface TextAreaProps extends Omit<AriaTextFieldProps, 'className' | 'style' | 'children' | 'render' | 'type'> {
  /** Rótulo visível. Obrigatório: placeholder nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo. */
  descricao?: string;
  /** Texto do erro. Sem ele, aparece a mensagem de validação do navegador. */
  mensagemErro?: MensagemErro;
  /** Altura inicial, em linhas. */
  linhas?: number;
}

export function TextArea({ rotulo, descricao, mensagemErro, linhas = 4, ...props }: TextAreaProps) {
  return (
    <AriaTextField {...props} className={classesDoCampo}>
      <Rotulo>{rotulo}</Rotulo>
      <AriaTextArea rows={linhas} className={`${classesDaEntrada} resize-y`} />
      <Descricao>{descricao}</Descricao>
      <ErroDoCampo mensagem={mensagemErro} />
    </AriaTextField>
  );
}
```

`frontend/packages/ui/src/components/TextArea/index.ts`:

```ts
export { TextArea, type TextAreaProps } from './TextArea';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TextArea/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/TextArea/TextArea.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

const meta = {
  title: 'Componentes/Primitivos/TextArea',
  component: TextArea,
  args: { rotulo: 'Sua pergunta', descricao: 'Escreva do seu jeito. Ex.: posso tomar losartana com café?' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: 'Padrão' };

export const ComErro: Story = { args: { isInvalid: true, mensagemErro: 'Escreva sua pergunta para continuar.' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/TextArea/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/TextArea/TextArea.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './TextArea.stories';

<Meta of={Stories} />

# TextArea

Campo de várias linhas, para a pessoa escrever a pergunta do jeito dela.

<Canvas of={Stories.Padrao} />

## Quando usar

Para texto livre que pode passar de uma linha, como a pergunta digitada.

## Quando não usar

- Para o nome de um remédio, use `ComboBox` ou `TextField`.
- Para buscar, use `SearchField`.

## Anatomia

As mesmas partes do `TextField` (rótulo, entrada, dica e erro), com a entrada mais alta. A altura começa em 4 linhas e a pessoa pode aumentar.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.ComErro} />

## Acessibilidade

- Rótulo obrigatório e visível. A dica fica ligada por `aria-describedby`.
- O erro fica numa região `aria-live` sempre montada e vem com ícone e borda de 3px.
- A área cresce com o A+ e continua com o contorno de foco sempre visível.
- Enter quebra a linha e não envia. O envio fica no botão ao lado.

## Conteúdo

O rótulo é curto ("Sua pergunta"). A dica pode dar um exemplo do tipo de pergunta ("Ex.: posso tomar losartana com café?").

## Faça e não faça

- Faça: dar um exemplo de pergunta na dica.
- Não faça: limitar o número de caracteres sem avisar.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/TextArea
git commit -m "feat: componente TextArea (#25)"
```

---

### Tarefa B3: `SearchField`

**Arquivos:** criar `frontend/packages/ui/src/components/SearchField/`.

Lupa decorativa à esquerda e botão de limpar de 48px à direita, que some com o campo vazio. Enter busca e Esc limpa.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/SearchField/SearchField.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('é uma busca com rótulo', () => {
    render(<SearchField rotulo="Buscar na bula" />);
    expect(screen.getByRole('searchbox', { name: 'Buscar na bula' })).toBeInTheDocument();
  });

  it('envia com Enter', async () => {
    const onSubmit = vi.fn();
    render(<SearchField rotulo="Buscar na bula" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('searchbox'), 'tontura{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('tontura');
  });

  it('limpa pelo botão com nome', async () => {
    const onClear = vi.fn();
    render(<SearchField rotulo="Buscar na bula" defaultValue="tontura" onClear={onClear} />);
    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <SearchField />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SearchField/
```

Esperado: falha, porque `./SearchField` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/SearchField/SearchField.tsx`:

```tsx
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import {
  Button as AriaButton,
  Input,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, Rotulo } from '../Campo/partes';

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'style' | 'children' | 'render'> {
  /** Rótulo visível. Obrigatório: placeholder nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo. */
  descricao?: string;
  /** Nome do botão que limpa a busca. */
  rotuloLimpar?: string;
}

export function SearchField({ rotulo, descricao, rotuloLimpar = 'Limpar busca', ...props }: SearchFieldProps) {
  return (
    <AriaSearchField {...props} className={`group ${classesDoCampo}`}>
      <Rotulo>{rotulo}</Rotulo>
      <div className="relative">
        <MagnifyingGlass
          size="1.5rem"
          weight="bold"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <Input
          className={`${classesDaEntrada} ps-12 pe-12 [&::-webkit-search-cancel-button]:hidden`}
        />
        <AriaButton
          aria-label={rotuloLimpar}
          className={
            'absolute end-0 top-0 inline-flex size-12 cursor-pointer items-center justify-center rounded-controle ' +
            'text-action-primary data-hovered:bg-action-primary-subtle data-focus-visible:foco-visivel ' +
            'group-data-empty:hidden'
          }
        >
          <X size="1.5rem" weight="bold" aria-hidden="true" focusable="false" />
        </AriaButton>
      </div>
      <Descricao>{descricao}</Descricao>
    </AriaSearchField>
  );
}
```

`frontend/packages/ui/src/components/SearchField/index.ts`:

```ts
export { SearchField, type SearchFieldProps } from './SearchField';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SearchField/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/SearchField/SearchField.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { SearchField } from './SearchField';

const meta = {
  title: 'Componentes/Primitivos/SearchField',
  component: SearchField,
  args: { rotulo: 'Buscar na bula', onSubmit: fn() },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  name: 'Vazio (sem botão de limpar)',
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument();
  },
};

export const ComTexto: Story = {
  args: { defaultValue: 'tontura' },
  play: async ({ canvas, args }) => {
    const limpar = canvas.getByRole('button', { name: 'Limpar busca' });
    await expect(limpar.getBoundingClientRect().width).toBeGreaterThanOrEqual(48);
    await userEvent.type(canvas.getByRole('searchbox'), '{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('tontura');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/SearchField/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/SearchField/SearchField.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './SearchField.stories';

<Meta of={Stories} />

# SearchField

Campo de busca com lupa e botão de limpar.

<Canvas of={Stories.Vazio} />

## Quando usar

Para procurar uma palavra dentro de um conteúdo que já está na tela, como buscar "tontura" na bula.

## Quando não usar

- Para escolher um remédio, use `ComboBox`.
- Para a pergunta principal, use `TextArea`. A pergunta não é uma busca, e a resposta não é uma lista de resultados.

## Anatomia

- Rótulo visível.
- Entrada com a lupa à esquerda, decorativa.
- Botão de limpar (X) à direita, com 48px. Aparece só quando há texto.
- Dica opcional.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.ComTexto} />

## Acessibilidade

- Papel `searchbox`, com o rótulo visível como nome.
- Enter busca e Esc limpa o campo.
- O botão de limpar tem nome ("Limpar busca") e some quando o campo está vazio, para não ser um botão que não faz nada.
- A lupa fica escondida do leitor de tela.

## Conteúdo

O rótulo diz onde a busca acontece ("Buscar na bula").

## Faça e não faça

- Faça: "Buscar na bula".
- Não faça: rótulo só "Buscar". A pessoa não sabe em que lugar está procurando.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/SearchField
git commit -m "feat: componente SearchField (#25)"
```

---

### Tarefa B4: `ComboBox`

**Arquivos:** criar `frontend/packages/ui/src/components/ComboBox/` (com `filtroTolerante.ts` e `filtroTolerante.test.tsx`).

Sugere os remédios enquanto a pessoa digita. O filtro padrão ignora acentos e maiúsculas e aceita um erro a cada 4 letras, no máximo 2, para "lozartana" achar Losartana. A lista vazia mostra um texto com o próximo passo. As opções têm 48px.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/ComboBox/ComboBox.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComboBox } from './ComboBox';

const remedios = [
  { id: 'losartana', rotulo: 'Losartana' },
  { id: 'dipirona', rotulo: 'Dipirona Sódica' },
  { id: 'hidroclorotiazida', rotulo: 'Hidroclorotiazida' },
];

describe('ComboBox', () => {
  it('é uma combobox com rótulo', () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} />);
    expect(screen.getByRole('combobox', { name: 'Adicionar remédio' })).toBeInTheDocument();
  });

  it('filtra sem ligar para maiúsculas e acentos', async () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} />);
    await userEvent.type(screen.getByRole('combobox'), 'sodica');
    const opcoes = await screen.findAllByRole('option');
    expect(opcoes.map((o) => o.textContent)).toEqual(['Dipirona Sódica']);
  });

  it('aceita erro de digitação', async () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} />);
    await userEvent.type(screen.getByRole('combobox'), 'lozartana');
    const opcoes = await screen.findAllByRole('option');
    expect(opcoes.map((o) => o.textContent)).toEqual(['Losartana']);
  });

  it('escolhe pelo teclado', async () => {
    const onSelectionChange = vi.fn();
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} onSelectionChange={onSelectionChange} />);
    await userEvent.type(screen.getByRole('combobox'), 'losar');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('losartana');
    expect(screen.getByRole('combobox')).toHaveValue('Losartana');
  });

  it('avisa quando nada combina', async () => {
    render(<ComboBox rotulo="Adicionar remédio" opcoes={remedios} textoSemResultado="Esse remédio não está na base." />);
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    expect(await screen.findByText('Esse remédio não está na base.')).toBeInTheDocument();
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <ComboBox opcoes={remedios} />;
    expect(elemento).toBeTruthy();
  });
});
```

`frontend/packages/ui/src/components/ComboBox/filtroTolerante.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { filtroTolerante, normalizar } from './filtroTolerante';

describe('filtroTolerante', () => {
  it('ignora acento e maiúscula', () => {
    expect(normalizar('Dipirona Sódica')).toBe('dipirona sodica');
    expect(filtroTolerante('Dipirona Sódica', 'SODICA')).toBe(true);
  });

  it('acha pelo começo e pelo meio do nome', () => {
    expect(filtroTolerante('Losartana', 'losar')).toBe(true);
    expect(filtroTolerante('Varfarina', 'ar')).toBe(true);
  });

  it('aceita um erro a cada 4 letras', () => {
    expect(filtroTolerante('Losartana', 'lozartana')).toBe(true);
    expect(filtroTolerante('Losartana', 'lozar')).toBe(true);
    expect(filtroTolerante('Metformina', 'metfromina')).toBe(true);
  });

  it('não inventa parecido em busca curta ou muito diferente', () => {
    expect(filtroTolerante('Losartana', 'lz')).toBe(false);
    expect(filtroTolerante('Losartana', 'xyz')).toBe(false);
    expect(filtroTolerante('Omeprazol', 'losartana')).toBe(false);
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ComboBox/
```

Esperado: falha, porque `./ComboBox` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/ComboBox/filtroTolerante.ts`:

```ts
/** Tira acentos e maiúsculas: "Sódica" e "sodica" ficam iguais. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** Distância de edição (Levenshtein): quantas letras trocar, pôr ou tirar para ir de a até b. */
function distancia(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      const troca = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min((anterior[j] ?? 0) + 1, (atual[j - 1] ?? 0) + 1, (anterior[j - 1] ?? 0) + troca);
    }
    anterior = atual;
  }
  return anterior[b.length] ?? 0;
}

/**
 * Filtro padrão do ComboBox: acha pelo pedaço do nome, sem ligar para acento e maiúscula,
 * e aceita erro de digitação ("lozartana" acha "Losartana"): 1 erro a cada 4 letras, no máximo 2.
 */
export function filtroTolerante(opcao: string, digitado: string): boolean {
  const alvo = normalizar(opcao);
  const busca = normalizar(digitado);
  if (!busca || alvo.includes(busca)) return true;
  const limite = Math.min(2, Math.floor(busca.length / 4));
  if (limite === 0) return false;
  return alvo.split(/\s+/).some((palavra) => distancia(palavra.slice(0, busca.length), busca) <= limite);
}
```

`frontend/packages/ui/src/components/ComboBox/ComboBox.tsx`:

```tsx
import { CaretDown } from '@phosphor-icons/react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  type ComboBoxProps as AriaComboBoxProps,
} from 'react-aria-components';
import { classesDaEntrada, classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';
import { filtroTolerante } from './filtroTolerante';

export interface OpcaoComboBox {
  id: string;
  rotulo: string;
}

export interface ComboBoxProps<T extends OpcaoComboBox>
  extends Omit<AriaComboBoxProps<T>, 'className' | 'style' | 'children' | 'render' | 'items' | 'defaultItems'> {
  /** Rótulo visível. Obrigatório: o exemplo nunca faz esse papel. */
  rotulo: string;
  /** Dica abaixo do campo. */
  descricao?: string;
  /** Exemplo dentro do campo vazio ("ex.: metformina"). */
  exemplo?: string;
  /** Texto do erro. Sem ele, aparece a mensagem de validação do navegador. */
  mensagemErro?: MensagemErro;
  /** Todas as opções. O filtro padrão (filtroTolerante) aceita erro de digitação; troque com defaultFilter. */
  opcoes: Iterable<T>;
  /** O que aparece quando nada combina com o que foi digitado. */
  textoSemResultado?: string;
  /** Nome do botão que abre a lista. */
  rotuloAbrir?: string;
}

export function ComboBox<T extends OpcaoComboBox>({
  rotulo,
  descricao,
  exemplo,
  mensagemErro,
  opcoes,
  textoSemResultado = 'Não achei esse nome. Confira como está escrito na caixa.',
  rotuloAbrir = 'Mostrar opções',
  defaultFilter = filtroTolerante,
  ...props
}: ComboBoxProps<T>) {
  return (
    <AriaComboBox
      {...props}
      defaultFilter={defaultFilter}
      defaultItems={opcoes}
      allowsEmptyCollection
      className={classesDoCampo}
    >
      <Rotulo>{rotulo}</Rotulo>
      <div className="relative">
        <Input placeholder={exemplo} className={`${classesDaEntrada} pe-12`} />
        <AriaButton
          aria-label={rotuloAbrir}
          className={
            'absolute end-0 top-0 inline-flex size-12 cursor-pointer items-center justify-center rounded-controle ' +
            'text-action-primary data-hovered:bg-action-primary-subtle data-focus-visible:foco-visivel'
          }
        >
          <CaretDown size="1.5rem" weight="bold" aria-hidden="true" focusable="false" />
        </AriaButton>
      </div>
      <Descricao>{descricao}</Descricao>
      <ErroDoCampo mensagem={mensagemErro} />
      <Popover
        className={
          'w-(--trigger-width) overflow-auto rounded-controle border-(length:--bc-borda-controle) border-campo-borda ' +
          'bg-painel-fundo shadow-flutuante'
        }
      >
        <ListBox
          className="max-h-80 p-1 outline-none"
          renderEmptyState={() => <p className="px-3 py-3 text-corpo text-text-muted">{textoSemResultado}</p>}
        >
          {(opcao: T) => (
            <ListBoxItem
              id={opcao.id}
              textValue={opcao.rotulo}
              className={
                'flex min-h-12 cursor-pointer items-center rounded-controle px-3 text-corpo text-text-default outline-none ' +
                'data-focused:bg-action-primary-subtle data-focused:text-action-primary-strong ' +
                'data-focus-visible:foco-visivel data-selected:font-bold'
              }
            >
              {opcao.rotulo}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}
```

`frontend/packages/ui/src/components/ComboBox/index.ts`:

```ts
export { ComboBox, type ComboBoxProps, type OpcaoComboBox } from './ComboBox';
export { filtroTolerante, normalizar } from './filtroTolerante';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ComboBox/
pnpm typecheck
```

Esperado: `Tests  10 passed (10)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/ComboBox/ComboBox.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ComboBox, type OpcaoComboBox } from './ComboBox';

const remedios: OpcaoComboBox[] = [
  { id: 'losartana', rotulo: 'Losartana' },
  { id: 'dipirona', rotulo: 'Dipirona Sódica' },
  { id: 'hidroclorotiazida', rotulo: 'Hidroclorotiazida' },
  { id: 'varfarina', rotulo: 'Varfarina' },
  { id: 'omeprazol', rotulo: 'Omeprazol' },
];

const meta = {
  title: 'Componentes/Primitivos/ComboBox',
  component: ComboBox<OpcaoComboBox>,
  args: {
    rotulo: 'Adicionar remédio',
    exemplo: 'ex.: metformina',
    opcoes: remedios,
    textoSemResultado: 'Esse remédio ainda não está na base.',
  },
} satisfies Meta<typeof ComboBox<OpcaoComboBox>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: 'Padrão' };

export const Aberto: Story = {
  name: 'Aberto, filtrando',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'ar');
    const lista = within(canvasElement.ownerDocument.body);
    const opcoes = await lista.findAllByRole('option');
    await expect(opcoes.map((o) => o.textContent)).toEqual(['Losartana', 'Varfarina']);
    for (const opcao of opcoes) {
      await expect(opcao.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
  },
};

export const ErroDeDigitacao: Story = {
  name: 'Com erro de digitação',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'lozartana');
    const lista = within(canvasElement.ownerDocument.body);
    const opcoes = await lista.findAllByRole('option');
    await expect(opcoes.map((o) => o.textContent)).toEqual(['Losartana']);
  },
};

export const SemResultado: Story = {
  name: 'Sem resultado',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'xyz');
    const lista = within(canvasElement.ownerDocument.body);
    await expect(await lista.findByText('Esse remédio ainda não está na base.')).toBeVisible();
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/ComboBox/
```

Esperado: `Tests  4 passed (4)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/ComboBox/ComboBox.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './ComboBox.stories';

<Meta of={Stories} />

# ComboBox

Campo que sugere nomes de remédio enquanto a pessoa digita, e aceita erro de digitação.

<Canvas of={Stories.Padrao} />

## Quando usar

Para escolher um item de uma lista conhecida e longa, como os remédios da base, em "Adicionar remédio".

## Quando não usar

- Para texto livre, use `TextField`.
- Para duas a cinco opções, use `RadioGroup`. Todas ficam à vista.

## Anatomia

- Rótulo visível.
- Entrada, com o exemplo dentro quando vazia.
- Botão que abre a lista, à direita, com 48px.
- Lista de sugestões, numa caixa flutuante. Cada opção tem 48px de altura.
- Texto de lista vazia, quando nada combina.
- Dica e erro, como no `TextField`.

## Props

<ArgTypes of={Stories} />

## Estados

As stories **Aberto, filtrando**, **Com erro de digitação** e **Sem resultado** digitam no campo e mostram a lista. Abra cada uma sozinha para ver.

## Acessibilidade

- Papel `combobox`, com a lista em `listbox`. Seta para baixo abre a lista e passa pelas opções, Enter escolhe e Esc fecha.
- O leitor de tela anuncia quantas opções apareceram e qual está em destaque.
- O filtro padrão, `filtroTolerante`, ignora acentos e maiúsculas e aceita um erro a cada 4 letras, até 2 erros. "lozartana" acha Losartana. Quem tem pouca prática com o teclado ou não sabe a grafia exata chega no remédio do mesmo jeito.
- Quando nada combina, a lista mostra o `textoSemResultado`, que o leitor de tela também lê.
- O botão de abrir tem nome ("Mostrar opções").

## Conteúdo

- Exemplo: um nome de remédio comum ("ex.: metformina").
- Sem resultado: diga o que aconteceu e o que fazer ("Esse remédio ainda não está na base.", ou o padrão "Não achei esse nome. Confira como está escrito na caixa.").

## Faça e não faça

- Faça: deixar o `filtroTolerante`, que é o padrão.
- Não faça: um filtro que só acha o nome escrito do jeito certo, com acento.
- Faça: dizer o próximo passo quando não acha nada.
- Não faça: uma lista vazia, sem texto.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/ComboBox
git commit -m "feat: componente ComboBox (#25)"
```

---

### Tarefa B5: `Checkbox`

**Arquivos:** criar `frontend/packages/ui/src/components/Checkbox/`.

Caixa de 28px com visto (ou traço, no indeterminado), e a linha inteira de 48px como área de toque.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Checkbox/Checkbox.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('usa o texto como rótulo', () => {
    render(<Checkbox>Tomo esse remédio todo dia</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'Tomo esse remédio todo dia' })).not.toBeChecked();
  });

  it('marca pelo clique no texto e pelo espaço', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Tomo esse remédio todo dia</Checkbox>);
    await userEvent.click(screen.getByText('Tomo esse remédio todo dia'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('tem a área de toque mínima', () => {
    const { container } = render(<Checkbox>Tomo esse remédio todo dia</Checkbox>);
    expect(container.querySelector('label')).toHaveClass('min-h-12');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error o texto (children) é o rótulo e é obrigatório
    const elemento = <Checkbox />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Checkbox/
```

Esperado: falha, porque `./Checkbox` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Checkbox/Checkbox.tsx`:

```tsx
import { Check, Minus } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'className' | 'style' | 'children' | 'render'> {
  /** O texto ao lado da caixa. É o rótulo, e clicar nele também marca. */
  children: ReactNode;
}

export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className="group flex min-h-12 cursor-pointer items-center gap-3 text-corpo text-text-default data-disabled:cursor-not-allowed data-disabled:opacity-60"
    >
      {({ isSelected, isIndeterminate }) => (
        <>
          <span
            className={
              'flex size-7 shrink-0 items-center justify-center rounded-aviso border-2 border-selecao-borda bg-campo-fundo ' +
              'text-selecao-marca transition-colors duration-rapida ease-out ' +
              'group-data-selected:border-selecao-marcado group-data-selected:bg-selecao-marcado ' +
              'group-data-indeterminate:border-selecao-marcado group-data-indeterminate:bg-selecao-marcado ' +
              'group-data-invalid:border-campo-borda-invalida group-data-focus-visible:foco-visivel'
            }
          >
            {isIndeterminate ? (
              <Minus size="1.25rem" weight="bold" aria-hidden="true" focusable="false" />
            ) : isSelected ? (
              <Check size="1.25rem" weight="bold" aria-hidden="true" focusable="false" />
            ) : null}
          </span>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
```

`frontend/packages/ui/src/components/Checkbox/index.ts`:

```ts
export { Checkbox, type CheckboxProps } from './Checkbox';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Checkbox/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Checkbox/Checkbox.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Componentes/Primitivos/Checkbox',
  component: Checkbox,
  args: { children: 'Tomo esse remédio todo dia' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desmarcado: Story = {};

export const Marcado: Story = { args: { defaultSelected: true } };

export const Indeterminado: Story = { args: { isIndeterminate: true, children: 'Todos os remédios da lista' } };

export const PeloTeclado: Story = {
  name: 'Marca pelo teclado',
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: 'Tomo esse remédio todo dia' })).toBeChecked();
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Checkbox/
```

Esperado: `Tests  4 passed (4)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Checkbox/Checkbox.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Checkbox.stories';

<Meta of={Stories} />

# Checkbox

Caixa de marcar, para uma opção que a pessoa liga ou desliga dentro de um formulário.

<Canvas of={Stories.Desmarcado} />

## Quando usar

Para uma escolha de sim ou não que só vale quando a pessoa confirma o formulário, ou para marcar vários itens de uma lista.

## Quando não usar

- Para uma opção que muda na hora, como "Lembrar neste aparelho", use `Switch`.
- Para escolher uma entre várias opções, use `RadioGroup`.

## Anatomia

- Caixa de 28px, com borda de 2px.
- Marca (um visto, ou um traço no estado indeterminado), na cor do texto sobre a caixa marcada.
- Texto ao lado, que é o rótulo. Tocar nele também marca.
- A linha toda tem 48px de altura.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Marcado} />

<Canvas of={Stories.Indeterminado} />

A story **Marca pelo teclado** marca a caixa com Tab e Espaço. Abra a story sozinha para ver.

## Acessibilidade

- Papel `checkbox`. Espaço marca e desmarca. O leitor de tela anuncia "marcado", "não marcado" ou "misto".
- Marcado não depende só da cor: a caixa ganha o visto. Indeterminado ganha o traço.
- A área de toque é a linha inteira, com 48px de altura.
- O contorno de foco aparece na caixa.

## Conteúdo

O texto é uma afirmação que a pessoa confirma ("Tomo esse remédio todo dia"), e não uma pergunta.

## Faça e não faça

- Faça: "Tomo esse remédio todo dia".
- Não faça: "Não quero deixar de receber avisos". Negação dupla confunde.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Checkbox
git commit -m "feat: componente Checkbox (#25)"
```

---

### Tarefa B6: `RadioGroup`

**Arquivos:** criar `frontend/packages/ui/src/components/RadioGroup/`.

Grupo com a pergunta visível como nome e o `Radio` de cada opção. As setas trocam a opção.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/RadioGroup/RadioGroup.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from './RadioGroup';

function Exemplo(props: { onChange?: (valor: string) => void; isInvalid?: boolean }) {
  return (
    <RadioGroup rotulo="Para quem é o remédio?" mensagemErro="Escolha uma opção." {...props}>
      <Radio value="eu">Para mim</Radio>
      <Radio value="outra">Para outra pessoa</Radio>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('é um grupo com o rótulo visível', () => {
    render(<Exemplo />);
    expect(screen.getByRole('radiogroup', { name: 'Para quem é o remédio?' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('muda pelas setas do teclado', async () => {
    const onChange = vi.fn();
    render(<Exemplo onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Para mim' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('outra');
    expect(screen.getByRole('radio', { name: 'Para outra pessoa' })).toBeChecked();
  });

  it('anuncia o erro por aria-live', () => {
    const { container } = render(<Exemplo isInvalid />);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Escolha uma opção.');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <RadioGroup>{null}</RadioGroup>;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/RadioGroup/
```

Esperado: falha, porque `./RadioGroup` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/RadioGroup/RadioGroup.tsx`:

```tsx
import type { ReactNode } from 'react';
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from 'react-aria-components';
import { classesDoCampo, Descricao, ErroDoCampo, Rotulo, type MensagemErro } from '../Campo/partes';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'style' | 'children' | 'render'> {
  /** Pergunta do grupo, visível. */
  rotulo: string;
  /** Dica abaixo da pergunta. */
  descricao?: string;
  /** Texto do erro, quando nenhuma opção foi escolhida e era preciso. */
  mensagemErro?: MensagemErro;
  /** Os Radio do grupo. */
  children: ReactNode;
}

export function RadioGroup({ rotulo, descricao, mensagemErro, children, ...props }: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} className={classesDoCampo}>
      <Rotulo>{rotulo}</Rotulo>
      <Descricao>{descricao}</Descricao>
      <div className="flex flex-col gap-1">{children}</div>
      <ErroDoCampo mensagem={mensagemErro} />
    </AriaRadioGroup>
  );
}

export interface RadioProps extends Omit<AriaRadioProps, 'className' | 'style' | 'children' | 'render'> {
  /** O texto da opção. É o rótulo. */
  children: ReactNode;
}

export function Radio({ children, ...props }: RadioProps) {
  return (
    <AriaRadio
      {...props}
      className="group flex min-h-12 cursor-pointer items-center gap-3 text-corpo text-text-default data-disabled:cursor-not-allowed data-disabled:opacity-60"
    >
      <span
        className={
          'flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-selecao-borda bg-campo-fundo ' +
          'transition-colors duration-rapida ease-out group-data-selected:border-selecao-marcado ' +
          'group-data-invalid:border-campo-borda-invalida group-data-focus-visible:foco-visivel'
        }
      >
        <span className="hidden size-3.5 rounded-full bg-selecao-marcado group-data-selected:block" />
      </span>
      {children}
    </AriaRadio>
  );
}
```

`frontend/packages/ui/src/components/RadioGroup/index.ts`:

```ts
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from './RadioGroup';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/RadioGroup/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/RadioGroup/RadioGroup.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Radio, RadioGroup } from './RadioGroup';

const meta = {
  title: 'Componentes/Primitivos/RadioGroup',
  component: RadioGroup,
  args: {
    rotulo: 'Para quem é o remédio?',
    children: (
      <>
        <Radio value="eu">Para mim</Radio>
        <Radio value="outra">Para outra pessoa</Radio>
      </>
    ),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Para outra pessoa' })).toBeChecked();
  },
};

export const ComErro: Story = { args: { isInvalid: true, mensagemErro: 'Escolha uma opção para continuar.' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/RadioGroup/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/RadioGroup/RadioGroup.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './RadioGroup.stories';

<Meta of={Stories} />

# RadioGroup

Grupo de opções em que a pessoa escolhe uma só. Inclui o `Radio`, que é cada opção.

<Canvas of={Stories.Padrao} />

## Quando usar

Para duas a cinco opções que se excluem, todas à vista ("Para mim" ou "Para outra pessoa").

## Quando não usar

- Para uma opção de sim ou não, use `Checkbox` ou `Switch`.
- Para muitas opções, como os remédios da base, use `ComboBox`.

## Anatomia

- Pergunta do grupo, visível, em negrito.
- Dica opcional.
- Opções (`Radio`): círculo de 28px com borda de 2px e o texto ao lado. A linha toda tem 48px.
- Mensagem de erro, como nos campos.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.ComErro} />

## Acessibilidade

- Papel `radiogroup`, com a pergunta como nome. Cada opção tem papel `radio`.
- Tab entra no grupo e as setas trocam a opção. A story **Padrão** confere isso.
- A opção escolhida ganha o círculo cheio, e não só uma cor.
- O erro é anunciado pela região `aria-live` dos campos.

## Conteúdo

A pergunta do grupo é uma pergunta de verdade ("Para quem é o remédio?"), e cada opção responde a ela em poucas palavras.

## Faça e não faça

- Faça: "Para mim" e "Para outra pessoa".
- Não faça: opções que se sobrepõem, como "Para mim" e "Para a família".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/RadioGroup
git commit -m "feat: componente RadioGroup (#25)"
```

---

### Tarefa B7: `Switch`

**Arquivos:** criar `frontend/packages/ui/src/components/Switch/`.

Interruptor em cartão, como no consentimento de "Meus remédios". A `descricao` pode ser uma função do estado e fica ligada ao interruptor por `aria-describedby`, para o leitor de tela ler a explicação nova quando o estado muda.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Switch/Switch.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

const explicacao = (ligado: boolean) =>
  ligado
    ? 'Ligado: a lista fica salva só neste navegador.'
    : 'Desligado: a lista some quando você fecha a página.';

describe('Switch', () => {
  it('é um interruptor com rótulo, desligado por padrão', () => {
    render(<Switch>Lembrar neste aparelho</Switch>);
    expect(screen.getByRole('switch', { name: 'Lembrar neste aparelho' })).not.toBeChecked();
  });

  it('liga pelo clique e pelo espaço', async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>Lembrar neste aparelho</Switch>);
    await userEvent.click(screen.getByText('Lembrar neste aparelho'));
    expect(onChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('troca a explicação junto com o estado', async () => {
    render(<Switch descricao={explicacao}>Lembrar neste aparelho</Switch>);
    const interruptor = screen.getByRole('switch');
    expect(interruptor).toHaveAccessibleDescription('Desligado: a lista some quando você fecha a página.');
    await userEvent.click(interruptor);
    expect(interruptor).toHaveAccessibleDescription('Ligado: a lista fica salva só neste navegador.');
  });

  it('respeita o valor controlado', () => {
    render(
      <Switch isSelected descricao={explicacao}>
        Lembrar neste aparelho
      </Switch>,
    );
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByText(/^Ligado/)).toBeInTheDocument();
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error o texto (children) é o rótulo e é obrigatório
    const elemento = <Switch />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Switch/
```

Esperado: falha, porque `./Switch` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Switch/Switch.tsx`:

```tsx
import { useId, useState } from 'react';
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components';

export interface SwitchProps extends Omit<AriaSwitchProps, 'className' | 'style' | 'children' | 'render'> {
  /** O que o interruptor liga ("Lembrar neste aparelho"). É o rótulo. */
  children: string;
  /**
   * Explica o que acontece. Pode mudar com o estado, como no consentimento:
   * `(ligado) => ligado ? 'Ligado: …' : 'Desligado: …'`. Fica ligada ao interruptor por aria-describedby.
   */
  descricao?: string | ((ligado: boolean) => string);
}

/** Interruptor em cartão, como no consentimento de "Meus remédios". */
export function Switch({ children, descricao, isSelected, defaultSelected = false, onChange, ...props }: SwitchProps) {
  const [interno, setInterno] = useState(defaultSelected);
  const ligado = isSelected ?? interno;
  const idDescricao = useId();
  const texto = typeof descricao === 'function' ? descricao(ligado) : descricao;

  return (
    <div
      className={
        'flex max-w-medida flex-col gap-1 rounded-controle border border-border-subtle px-4 py-3 ' +
        'alto-contraste:border-(length:--bc-borda-controle)'
      }
    >
      <AriaSwitch
        {...props}
        isSelected={ligado}
        onChange={(valor) => {
          setInterno(valor);
          onChange?.(valor);
        }}
        aria-describedby={texto ? idDescricao : undefined}
        className={
          'group flex min-h-12 cursor-pointer items-start gap-3 text-corpo font-bold text-text-default ' +
          'data-disabled:cursor-not-allowed data-disabled:opacity-55'
        }
      >
        <span
          className={
            'relative mt-0.5 h-8 w-13 shrink-0 rounded-total border-(length:--bc-borda-controle) border-selecao-borda ' +
            'bg-campo-fundo transition-colors duration-rapida ease-out ' +
            'group-data-selected:border-selecao-marcado group-data-selected:bg-selecao-marcado ' +
            'group-data-focus-visible:foco-visivel'
          }
        >
          <span
            className={
              'absolute start-1 top-1 size-5 rounded-total bg-selecao-borda transition-[inset-inline-start] ' +
              'duration-rapida ease-out group-data-selected:start-6 group-data-selected:bg-selecao-marca'
            }
          />
        </span>
        <span className="pt-0.5">{children}</span>
      </AriaSwitch>
      {texto ? (
        <p id={idDescricao} className="ps-16 text-apoio text-text-muted">
          {texto}
        </p>
      ) : null}
    </div>
  );
}
```

`frontend/packages/ui/src/components/Switch/index.ts`:

```ts
export { Switch, type SwitchProps } from './Switch';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Switch/
pnpm typecheck
```

Esperado: `Tests  5 passed (5)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Switch/Switch.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Componentes/Primitivos/Switch',
  component: Switch,
  args: {
    children: 'Lembrar neste aparelho',
    descricao: (ligado: boolean) =>
      ligado
        ? 'Ligado: a lista fica salva só neste navegador. Desligar apaga na hora.'
        : 'Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor.',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desligado: Story = {
  play: async ({ canvas }) => {
    const interruptor = canvas.getByRole('switch', { name: 'Lembrar neste aparelho' });
    await expect(interruptor).not.toBeChecked();
    await userEvent.click(canvas.getByText('Lembrar neste aparelho'));
    await expect(interruptor).toBeChecked();
    await expect(canvas.getByText(/^Ligado/)).toBeVisible();
  },
};

export const Ligado: Story = { args: { defaultSelected: true } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Switch/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Switch/Switch.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Switch.stories';

<Meta of={Stories} />

# Switch

Interruptor em cartão, para uma opção que vale na hora em que muda. A explicação acompanha o estado.

<Canvas of={Stories.Desligado} />

## Quando usar

Para uma escolha que tem efeito imediato, como "Lembrar neste aparelho" no consentimento de "Meus remédios".

## Quando não usar

- Para uma opção que só vale quando a pessoa confirma um formulário, use `Checkbox`.
- Para escolher entre opções que não são liga e desliga, use `RadioGroup`.

## Anatomia

- Cartão com borda fina (mais grossa no alto contraste).
- Trilho de 52 por 32px, com a bolinha que anda para o lado.
- Texto em negrito ao lado, que é o rótulo.
- Explicação abaixo, que pode mudar com o estado.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Ligado} />

## Acessibilidade

- Papel `switch`. Espaço liga e desliga, e o leitor de tela anuncia "ligado" ou "desligado".
- A explicação fica ligada ao interruptor por `aria-describedby`. Quando o estado muda, o leitor de tela lê a nova explicação.
- Ligado não depende só da cor: a bolinha muda de lado.
- O contorno de foco aparece no trilho, e a área de toque é a linha inteira, com 48px.
- Com movimento reduzido, a bolinha muda de lado sem animação.

## Conteúdo

O texto de cada estado precisa ser verdadeiro. A lista vai para a API a cada pergunta, então a explicação nunca diz que nada é enviado. Os textos aprovados estão em **Conteúdo e voz** > **Textos da interface**:

- Desligado: "Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor."
- Ligado: "Ligado: a lista fica salva só neste navegador. Desligar apaga na hora."

## Faça e não faça

- Faça: o interruptor começa desligado, e a explicação aparece antes de a pessoa ligar.
- Não faça: "Seus dados ficam só com você". A lista sai do aparelho a cada pergunta.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Switch
git commit -m "feat: componente Switch (#25)"
```

---

### Tarefa B8: Barrel, changeset e conferência do grupo B

**Arquivos:** modificar `frontend/packages/ui/src/grupos/campos.ts`; criar `frontend/.changeset/primitivos-campos.md`.

- [ ] **Passo 1: Barrel**

`frontend/packages/ui/src/grupos/campos.ts`:

```ts
// Grupo B do plano 2: campos.
export * from '../components/TextField';
export * from '../components/TextArea';
export * from '../components/SearchField';
export * from '../components/ComboBox';
export * from '../components/Checkbox';
export * from '../components/RadioGroup';
export * from '../components/Switch';
```

- [ ] **Passo 2: Changeset**

`frontend/.changeset/primitivos-campos.md`:

```md
---
'@bula-clara/ui': minor
---

Novos campos: TextField, TextArea, SearchField, ComboBox (que aceita erro de digitação), Checkbox, RadioGroup e Switch. Todos têm rótulo visível obrigatório e anunciam o erro para o leitor de tela.
```

- [ ] **Passo 3: Conferir o grupo**

```bash
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm --filter @bula-clara/ui exec vitest run --project unit
```

Esperado: `Tests  69 passed (69)` nos tokens, lint e tipos sem erro, `Tests  81 passed (81)` no `ui` e `Tests  50 passed (50)` só na unidade.

- [ ] **Passo 4: Commit**

```bash
git add frontend/packages/ui/src/grupos/campos.ts frontend/.changeset/primitivos-campos.md
git commit -m "feat: exporta os campos (#25)"
```

---

## Grupo C: sobreposições

`Dialog`, `Sheet` e `Toast`. Barrel: `src/grupos/sobreposicoes.ts`. O painel comum ao `Dialog` e ao `Sheet` (título, rótulo, X de fechar, véu e borda do alto contraste) fica em `src/components/Dialog/Painel.tsx`, que nasce na Tarefa C1 e não é exportado pelo pacote.

### Tarefa C1: `Dialog` e o painel

**Arquivos:** criar `frontend/packages/ui/src/components/Dialog/` (com `Painel.tsx`).

`dialog` tem X e fecha tocando fora. `alertdialog` é para confirmar o que não dá para desfazer: sem X e sem fechar tocando fora. O conteúdo pode ser uma função que recebe `fechar`, para os botões fecharem o diálogo. O `DialogTrigger` do React Aria sai junto.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Dialog/Dialog.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';
import { Dialog, DialogTrigger } from './Dialog';

function Exemplo({ papel }: { papel?: 'dialog' | 'alertdialog' }) {
  return (
    <DialogTrigger>
      <Button>Apagar tudo</Button>
      <Dialog titulo="Apagar a lista?" papel={papel}>
        {({ fechar }) => (
          <>
            <p>Os remédios saem deste aparelho.</p>
            <Button onPress={fechar}>Sim, apagar a lista</Button>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

describe('Dialog', () => {
  it('abre pelo botão, com o título como nome', async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(screen.getByRole('dialog', { name: 'Apagar a lista?' })).toBeInTheDocument();
  });

  it('fecha com Esc e devolve o foco para quem abriu', async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apagar tudo' })).toHaveFocus());
  });

  it('fecha pelo X e pelas ações do conteúdo', async () => {
    render(<Exemplo />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sim, apagar a lista' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('como alertdialog, não tem X', async () => {
    render(<Exemplo papel="alertdialog" />);
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(screen.getByRole('alertdialog', { name: 'Apagar a lista?' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
  });

  it('não compila sem título', () => {
    // @ts-expect-error titulo é obrigatório: é o nome acessível do diálogo
    const elemento = <Dialog>conteúdo</Dialog>;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Dialog/
```

Esperado: falha, porque `./Dialog` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Dialog/Painel.tsx`:

```tsx
// Peças internas de Dialog e Sheet (grupo C). Não são exportadas pelo pacote.
import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Dialog as AriaDialog, Heading } from 'react-aria-components';
import { IconButton } from '../IconButton';

export type ConteudoDoPainel = ReactNode | ((opcoes: { fechar: () => void }) => ReactNode);

export interface PainelProps {
  titulo: string;
  estiloDoTitulo: 'titulo-3' | 'resposta';
  /** Linha curta em caixa alta acima do título ("Li na caixa"). */
  rotulo?: string | undefined;
  papel: 'dialog' | 'alertdialog';
  /** Sem rótulo, não aparece o botão de fechar. */
  rotuloFechar?: string | undefined;
  children: ConteudoDoPainel;
}

const estilosDoTitulo = {
  'titulo-3': 'font-texto text-titulo-3 font-bold',
  resposta: 'font-voz text-resposta font-semibold',
};

export function Painel({ titulo, estiloDoTitulo, rotulo, papel, rotuloFechar, children }: PainelProps) {
  return (
    <AriaDialog role={papel} className="flex flex-col gap-3 outline-none">
      {({ close }) => (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {rotulo ? (
                <p className="text-rotulo font-bold uppercase tracking-rotulo text-text-muted">{rotulo}</p>
              ) : null}
              <Heading
                slot="title"
                className={`${estilosDoTitulo[estiloDoTitulo]} hyphens-auto wrap-anywhere text-text-default`}
              >
                {titulo}
              </Heading>
            </div>
            {rotuloFechar ? <IconButton aria-label={rotuloFechar} icone={X} onPress={close} /> : null}
          </div>
          {typeof children === 'function' ? children({ fechar: close }) : children}
        </>
      )}
    </AriaDialog>
  );
}

/** Véu escuro atrás do painel. A animação usa os tokens de duração, que vão a 0ms com movimento reduzido. */
export const classesDoVeu =
  'fixed inset-0 z-40 flex bg-sobreposicao-fundo data-entering:animate-aparecer data-exiting:animate-sumir';

/** No alto contraste, a sombra não basta: o painel ganha borda preta de 3px. */
export const classesDoPainel =
  'bg-painel-fundo text-text-default shadow-flutuante outline-none alto-contraste:border-3 alto-contraste:border-text-default';
```

`frontend/packages/ui/src/components/Dialog/Dialog.tsx`:

```tsx
import { Modal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';
import { classesDoPainel, classesDoVeu, Painel, type ConteudoDoPainel } from './Painel';

export { DialogTrigger } from 'react-aria-components';

export interface DialogProps extends Pick<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> {
  /** Título visível e nome acessível do diálogo. */
  titulo: string;
  /**
   * `alertdialog` para confirmar uma ação que não dá para desfazer ("Apagar a lista?"):
   * não fecha tocando fora e não tem o X, a pessoa precisa escolher um dos botões.
   */
  papel?: 'dialog' | 'alertdialog';
  /** Nome do X de fechar. O `alertdialog` não tem X. */
  rotuloFechar?: string;
  /** O conteúdo. Pode ser uma função que recebe `fechar`, para os botões fecharem o diálogo. */
  children: ConteudoDoPainel;
}

export function Dialog({ titulo, papel = 'dialog', rotuloFechar = 'Fechar', children, ...props }: DialogProps) {
  const alerta = papel === 'alertdialog';
  return (
    <ModalOverlay {...props} isDismissable={!alerta} className={`${classesDoVeu} items-center justify-center p-4`}>
      <Modal
        className={`${classesDoPainel} max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-auto rounded-painel p-6`}
      >
        <Painel titulo={titulo} estiloDoTitulo="titulo-3" papel={papel} rotuloFechar={alerta ? undefined : rotuloFechar}>
          {children}
        </Painel>
      </Modal>
    </ModalOverlay>
  );
}
```

`frontend/packages/ui/src/components/Dialog/index.ts`:

```ts
export { Dialog, DialogTrigger, type DialogProps } from './Dialog';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Dialog/
pnpm typecheck
```

Esperado: `Tests  5 passed (5)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Dialog/Dialog.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Dialog, DialogTrigger } from './Dialog';

const meta = {
  title: 'Componentes/Primitivos/Dialog',
  component: Dialog,
  args: { titulo: 'Apagar a lista?', children: null },
  render: (args) => (
    <DialogTrigger>
      <Button variante="perigo">Apagar tudo</Button>
      <Dialog {...args}>
        {({ fechar }) => (
          <>
            <p className="text-corpo">Os remédios saem deste aparelho. Não dá para desfazer.</p>
            <div className="flex flex-wrap gap-3">
              <Button variante="perigo" onPress={fechar}>
                Sim, apagar a lista
              </Button>
              <Button variante="secundaria" onPress={fechar}>
                Manter a lista
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Aberto: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const dialogo = await pagina.findByRole('dialog', { name: 'Apagar a lista?' });
    // Espera o fim da animação de entrada (250ms, ou 0ms com movimento reduzido).
    await waitFor(() => expect(dialogo).toBeVisible());
    await expect(pagina.getByRole('button', { name: 'Fechar' })).toBeVisible();
  },
};

export const Confirmacao: Story = {
  name: 'Confirmação (alertdialog)',
  args: { papel: 'alertdialog' },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const dialogo = await pagina.findByRole('alertdialog', { name: 'Apagar a lista?' });
    await waitFor(() => expect(dialogo).toBeVisible());
    await userEvent.click(pagina.getByRole('button', { name: 'Manter a lista' }));
    await waitFor(() => expect(pagina.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Dialog/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Dialog/Dialog.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Dialog.stories';

<Meta of={Stories} />

# Dialog

Janela por cima da tela, para uma decisão que precisa de atenção antes de seguir.

<Canvas of={Stories.Aberto} />

Toque em "Apagar tudo" para abrir.

## Quando usar

- `dialog`: uma informação ou escolha curta que interrompe a tela, com X para fechar.
- `alertdialog`: confirmar uma ação que não dá para desfazer ("Apagar a lista?"). Não tem X e não fecha tocando fora: a pessoa escolhe um dos botões.

## Quando não usar

- Para confirmar o que a foto ou a voz entendeu, use `Sheet`, que sobe da borda de baixo e fica perto do polegar.
- Para avisar que deu certo, use `Toast`.
- Para avisos de segurança sobre a resposta, use `Alert`, dentro da própria tela. Aviso de segurança nunca some com um toque.

## Anatomia

- Véu escuro atrás, sobre a tela toda.
- Painel de até 512px, com borda arredondada e sombra. No alto contraste, borda preta de 3px.
- Título, que é o nome do diálogo.
- X de fechar, só no `dialog`.
- Conteúdo, com os botões no fim.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Confirmacao} />

## Acessibilidade

- Papel `dialog` ou `alertdialog`, com o título como nome.
- Ao abrir, o foco vai para dentro do diálogo e fica preso nele. Ao fechar, volta para o botão que abriu.
- Esc fecha os dois tipos. Tocar fora fecha só o `dialog`.
- O resto da página fica inerte enquanto o diálogo está aberto: o leitor de tela não sai dele.
- A entrada usa os tokens de duração. Com movimento reduzido, o diálogo aparece sem animação.

## Conteúdo

- Título em forma de pergunta, quando é uma decisão ("Apagar a lista?").
- Uma frase dizendo o que acontece ("Os remédios saem deste aparelho. Não dá para desfazer.").
- Botões que dizem a ação dos dois lados ("Sim, apagar a lista" e "Manter a lista"), e nunca "Sim" e "Não" sozinhos.

## Faça e não faça

- Faça: `papel="alertdialog"` para apagar a lista.
- Não faça: abrir um diálogo sem que a pessoa tenha pedido, por exemplo ao entrar na tela.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Dialog
git commit -m "feat: componente Dialog (#25)"
```

---

### Tarefa C2: `Sheet`

**Arquivos:** criar `frontend/packages/ui/src/components/Sheet/`.

Um `Modal` do React Aria encostado na borda de baixo, com o título no estilo da frase-resposta. Sobe com a animação `subir`, que vai a 0ms com movimento reduzido. Abre com o `DialogTrigger`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Sheet/Sheet.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { DialogTrigger } from '../Dialog';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('abre como diálogo com rótulo e título', async () => {
    render(
      <DialogTrigger>
        <Button>Fotografar a caixa</Button>
        <Sheet rotulo="Li na caixa" titulo="Losartana potássica 50 mg">
          <p>É esse o remédio?</p>
        </Sheet>
      </DialogTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fotografar a caixa' }));
    expect(screen.getByRole('dialog', { name: 'Losartana potássica 50 mg' })).toBeInTheDocument();
    expect(screen.getByText('Li na caixa')).toBeInTheDocument();
  });

  it('funciona controlada e fecha pelas ações', async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet isOpen onOpenChange={onOpenChange} titulo="Losartana potássica 50 mg">
        {({ fechar }) => <Button onPress={fechar}>Não, vou digitar o nome</Button>}
      </Sheet>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou digitar o nome' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('fecha com Esc', async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet isOpen onOpenChange={onOpenChange} titulo="Losartana potássica 50 mg">
        <Button>Sim, perguntar sobre ele</Button>
      </Sheet>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('não compila sem título', () => {
    // @ts-expect-error titulo é obrigatório: é o nome acessível da folha
    const elemento = <Sheet isOpen>conteúdo</Sheet>;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Sheet/
```

Esperado: falha, porque `./Sheet` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Sheet/Sheet.tsx`:

```tsx
import { Modal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';
import { classesDoPainel, classesDoVeu, Painel, type ConteudoDoPainel } from '../Dialog/Painel';

export interface SheetProps extends Pick<ModalOverlayProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> {
  /** Título visível e nome acessível da folha. Sai no estilo da frase-resposta. */
  titulo: string;
  /** Linha curta em caixa alta acima do título ("Li na caixa"). */
  rotulo?: string;
  /** Mostra um X com esse nome. Sem ele, a folha fecha com Esc, tocando fora ou pelas ações do conteúdo. */
  rotuloFechar?: string;
  /** O conteúdo. Pode ser uma função que recebe `fechar`. */
  children: ConteudoDoPainel;
}

/** Folha que sobe da borda de baixo. Usada na confirmação da foto e da voz. Abre com DialogTrigger. */
export function Sheet({ titulo, rotulo, rotuloFechar, children, ...props }: SheetProps) {
  return (
    <ModalOverlay {...props} isDismissable className={`${classesDoVeu} items-end justify-center`}>
      <Modal
        className={
          `${classesDoPainel} max-h-[85dvh] w-full max-w-2xl overflow-auto rounded-t-painel px-4 py-6 ` +
          'data-entering:animate-subir data-exiting:animate-descer'
        }
      >
        <Painel titulo={titulo} estiloDoTitulo="resposta" rotulo={rotulo} papel="dialog" rotuloFechar={rotuloFechar}>
          {children}
        </Painel>
      </Modal>
    </ModalOverlay>
  );
}
```

`frontend/packages/ui/src/components/Sheet/index.ts`:

```ts
export { Sheet, type SheetProps } from './Sheet';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Sheet/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Sheet/Sheet.stories.tsx`:

```tsx
import { Check } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { DialogTrigger } from '../Dialog';
import { Sheet } from './Sheet';

const meta = {
  title: 'Componentes/Primitivos/Sheet',
  component: Sheet,
  args: { rotulo: 'Li na caixa', titulo: 'Losartana potássica 50 mg', children: null },
  render: (args) => (
    <DialogTrigger>
      <Button variante="secundaria">Fotografar a caixa</Button>
      <Sheet {...args}>
        {({ fechar }) => (
          <>
            <p className="text-corpo">É esse o remédio?</p>
            <Button larguraTotal icone={Check} onPress={fechar}>
              Sim, perguntar sobre ele
            </Button>
            <Button larguraTotal variante="secundaria" onPress={fechar}>
              Não, vou digitar o nome
            </Button>
            <p className="text-apoio text-text-muted">A foto é usada só para ler o nome e não é guardada.</p>
          </>
        )}
      </Sheet>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmarFoto: Story = {
  name: 'Confirmar a foto',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: 'Losartana potássica 50 mg' });
    await waitFor(() => expect(folha).toBeVisible());
    // Depois de subir, a folha encosta na borda de baixo da tela.
    const painel = folha.parentElement as HTMLElement;
    await waitFor(() => expect(Math.round(painel.getBoundingClientRect().bottom)).toBe(window.innerHeight));
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Sheet/
```

Esperado: `Tests  1 passed (1)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Sheet/Sheet.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Sheet.stories';

<Meta of={Stories} />

# Sheet

Folha que sobe da borda de baixo da tela, para confirmar o que o app entendeu da foto ou da voz.

<Canvas of={Stories.ConfirmarFoto} />

Toque em "Fotografar a caixa" para abrir.

## Quando usar

Depois de ler a caixa pela câmera ou ouvir a pergunta pelo microfone: a folha mostra o que foi entendido e pergunta se está certo, com os botões perto do polegar.

## Quando não usar

- Para confirmar uma ação que não dá para desfazer, use `Dialog` com `papel="alertdialog"`.
- Para conteúdo longo, como a bula, use uma página.

## Anatomia

- Véu escuro atrás.
- Painel de até 672px, encostado na borda de baixo, com os cantos de cima arredondados. No alto contraste, borda preta de 3px.
- Rótulo curto em caixa alta, opcional ("LI NA CAIXA").
- Título no estilo da frase-resposta, que é o nome da folha.
- Conteúdo, com os botões em largura total.

## Props

<ArgTypes of={Stories} />

## Estados

Fechada e aberta. Abre com `DialogTrigger`, como o `Dialog`.

## Acessibilidade

- Papel `dialog`, com o título como nome. O foco entra na folha e volta para o botão que abriu.
- Fecha com Esc, tocando no véu ou pelas ações do conteúdo. Com `rotuloFechar`, ganha também um X.
- A folha é um `Modal` do React Aria, e não o `Sheet` do React Aria 1.22, que depende de rolagem suave e ignora o movimento reduzido.
- Com movimento reduzido, a folha aparece sem subir.

## Conteúdo

O título é o que o app entendeu ("Losartana potássica 50 mg"). Os botões confirmam ou corrigem, com a ação escrita ("Sim, perguntar sobre ele" e "Não, vou digitar o nome"). Se houver foto, diga o que acontece com ela ("A foto é usada só para ler o nome e não é guardada.").

## Faça e não faça

- Faça: sempre um caminho para corrigir, como "Não, vou digitar o nome".
- Não faça: seguir direto para a resposta sem a pessoa confirmar o nome lido.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Sheet
git commit -m "feat: componente Sheet (#25)"
```

---

### Tarefa C3: `Toast`

**Arquivos:** criar `frontend/packages/ui/src/components/Toast/`.

A única entrada é `confirmarAcao(mensagem)`. Sem tom e sem variante, para nunca virar aviso. Fica 8 segundos, para com foco ou mouse em cima e tem X. O `ToastRegion` é montado uma vez, no fim do layout do app.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Toast/Toast.test.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';
import { afterEach, describe, expect, it } from 'vitest';
import { confirmarAcao, filaDeToasts, TEMPO_DO_TOAST, ToastRegion, type ConfirmacaoDeAcao } from './Toast';

afterEach(() => {
  act(() => filaDeToasts.clear());
});

describe('Toast', () => {
  it('confirmarAcao mostra a frase numa região com nome', async () => {
    render(<ToastRegion />);
    act(() => {
      confirmarAcao('Lista apagada deste aparelho.');
    });
    expect(await screen.findByText('Lista apagada deste aparelho.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Confirmações' })).toBeInTheDocument();
  });

  it('some sozinho só depois de pelo menos 5 segundos', () => {
    act(() => {
      confirmarAcao('Lista apagada deste aparelho.');
    });
    expect(TEMPO_DO_TOAST).toBeGreaterThanOrEqual(5000);
    expect(filaDeToasts.visibleToasts[0]?.timeout).toBe(TEMPO_DO_TOAST);
  });

  it('fecha pelo botão', async () => {
    const fila = new ToastQueue<ConfirmacaoDeAcao>();
    render(<ToastRegion fila={fila} />);
    act(() => {
      fila.add({ mensagem: 'Remédio adicionado.' });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Fechar' }));
    expect(screen.queryByText('Remédio adicionado.')).not.toBeInTheDocument();
  });

  it('não aceita tom nem variante', () => {
    // @ts-expect-error toast só confirma ação; aviso de segurança é Alert
    const chamada = () => confirmarAcao('Não use junto', { tom: 'perigo' });
    expect(chamada).toBeTypeOf('function');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Toast/
```

Esperado: falha, porque `./Toast` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Toast/Toast.tsx`:

```tsx
import { CheckCircle, X } from '@phosphor-icons/react';
import {
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
} from 'react-aria-components';
import { IconButton } from '../IconButton';

/** O toast só carrega uma frase curta. Não tem tom nem variante: ele nunca é aviso. */
export interface ConfirmacaoDeAcao {
  mensagem: string;
}

/** 8 segundos, e o tempo para enquanto o toast está com foco ou com o mouse em cima (WCAG 2.2.1). */
export const TEMPO_DO_TOAST = 8000;

export const filaDeToasts = new ToastQueue<ConfirmacaoDeAcao>({ maxVisibleToasts: 1 });

/**
 * Confirma uma ação que a pessoa acabou de fazer ("Lista apagada deste aparelho.").
 * Nunca use para informação de segurança, erro ou estado da tela: isso é Alert.
 */
export function confirmarAcao(mensagem: string): string {
  return filaDeToasts.add({ mensagem }, { timeout: TEMPO_DO_TOAST });
}

export interface ToastRegionProps {
  /** Só para testes e stories. O app usa a fila padrão, alimentada por confirmarAcao. */
  fila?: ToastQueue<ConfirmacaoDeAcao>;
  /** Nome da região, que o leitor de tela anuncia ao entrar nela com F6. */
  rotuloRegiao?: string;
  /** Nome do X de fechar o toast. */
  rotuloFechar?: string;
}

/** Monte uma vez só, no fim do layout do app. */
export function ToastRegion({
  fila = filaDeToasts,
  rotuloRegiao = 'Confirmações',
  rotuloFechar = 'Fechar',
}: ToastRegionProps) {
  return (
    <AriaToastRegion
      queue={fila}
      aria-label={rotuloRegiao}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg flex-col gap-2 outline-none data-focus-visible:foco-visivel"
    >
      {({ toast }) => (
        <AriaToast
          toast={toast}
          className={
            'flex items-center gap-3 rounded-controle border-(length:--bc-borda-controle) border-toast-destaque ' +
            'bg-toast-fundo py-1 ps-4 pe-1 shadow-flutuante outline-none data-focus-visible:foco-visivel'
          }
        >
          <CheckCircle
            size="1.5rem"
            weight="bold"
            aria-hidden="true"
            focusable="false"
            className="shrink-0 text-toast-destaque"
          />
          <ToastContent className="flex-1 py-2">
            <Text slot="title" className="text-corpo font-bold text-toast-destaque">
              {toast.content.mensagem}
            </Text>
          </ToastContent>
          <IconButton slot="close" aria-label={rotuloFechar} icone={X} />
        </AriaToast>
      )}
    </AriaToastRegion>
  );
}
```

`frontend/packages/ui/src/components/Toast/index.ts`:

```ts
export {
  confirmarAcao,
  filaDeToasts,
  TEMPO_DO_TOAST,
  ToastRegion,
  type ConfirmacaoDeAcao,
  type ToastRegionProps,
} from './Toast';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Toast/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Toast/Toast.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { confirmarAcao, ToastRegion } from './Toast';

const meta = {
  title: 'Componentes/Primitivos/Toast',
  component: ToastRegion,
  render: () => (
    <>
      <Button variante="perigo" onPress={() => confirmarAcao('Lista apagada deste aparelho.')}>
        Apagar tudo
      </Button>
      <ToastRegion />
    </>
  ),
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmaAcao: Story = {
  name: 'Confirma uma ação',
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    const pagina = within(canvasElement.ownerDocument.body);
    await expect(await pagina.findByText('Lista apagada deste aparelho.')).toBeVisible();
    await userEvent.click(pagina.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(pagina.queryByText('Lista apagada deste aparelho.')).not.toBeInTheDocument());
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Toast/
```

Esperado: `Tests  1 passed (1)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Toast/Toast.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Toast.stories';

<Meta of={Stories} />

# Toast

Confirma, com uma frase curta, uma ação que a pessoa acabou de fazer.

<Canvas of={Stories.ConfirmaAcao} />

Toque em "Apagar tudo" para ver a confirmação.

## Quando usar

Depois de uma ação feita pela pessoa: "Lista apagada deste aparelho.", "Remédio adicionado.". Chame `confirmarAcao(mensagem)` e monte o `ToastRegion` uma vez só, no fim do layout do app.

## Quando não usar

- Para qualquer informação de segurança, erro ou estado da tela, use `Alert`. O toast some sozinho, e um aviso de segurança não pode sumir.
- Para pedir uma decisão, use `Dialog`.

O toast não tem tom nem variante, de propósito. A única entrada é `confirmarAcao`, com a cor de confirmação, e não há como fazer um toast de aviso.

## Anatomia

- Região fixa no fim da tela, com até 512px de largura.
- Toast com borda verde-escura, ícone de confirmação decorativo, a frase em negrito e o X de fechar.

## Props

<ArgTypes of={Stories} />

## Estados

Aparece um toast por vez na tela (a fila tem `maxVisibleToasts: 1`). O X fecha o que está aberto.

## Acessibilidade

- A região é um ponto de referência com nome ("Confirmações"). F6 leva o foco até ela.
- O leitor de tela anuncia a frase quando o toast aparece, sem tirar o foco de onde a pessoa estava.
- Fica 8 segundos na tela, e o tempo para enquanto o toast está com foco ou com o mouse em cima (WCAG 2.2.1). O X fecha antes.
- Com movimento reduzido, aparece sem animação.

## Conteúdo

Uma frase no passado, que diz o que foi feito ("Lista apagada deste aparelho."). Sem "Sucesso!" e sem emoji.

## Faça e não faça

- Faça: `confirmarAcao('Lista apagada deste aparelho.')`.
- Não faça: um toast para dizer que um remédio "é seguro" ou que a combinação "está liberada". Verde só confirma ação.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Toast
git commit -m "feat: componente Toast (#25)"
```

---

### Tarefa C4: Barrel, changeset e conferência do grupo C

**Arquivos:** modificar `frontend/packages/ui/src/grupos/sobreposicoes.ts`; criar `frontend/.changeset/primitivos-sobreposicoes.md`.

- [ ] **Passo 1: Barrel**

`frontend/packages/ui/src/grupos/sobreposicoes.ts`:

```ts
// Grupo C do plano 2: sobreposições.
export * from '../components/Dialog';
export * from '../components/Sheet';
export * from '../components/Toast';
```

- [ ] **Passo 2: Changeset**

`frontend/.changeset/primitivos-sobreposicoes.md`:

```md
---
'@bula-clara/ui': minor
---

Novos componentes Dialog, Sheet e Toast. O Toast só confirma uma ação feita pela pessoa, pelo `confirmarAcao(mensagem)`, e não tem variante de aviso.
```

- [ ] **Passo 3: Conferir o grupo**

```bash
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm --filter @bula-clara/ui exec vitest run --project unit
```

Esperado: `Tests  69 passed (69)` nos tokens, lint e tipos sem erro, `Tests  40 passed (40)` no `ui` e `Tests  25 passed (25)` só na unidade.

- [ ] **Passo 4: Commit**

```bash
git add frontend/packages/ui/src/grupos/sobreposicoes.ts frontend/.changeset/primitivos-sobreposicoes.md
git commit -m "feat: exporta Dialog, Sheet e Toast (#25)"
```

---

## Grupo D: estrutura e status

`Alert`, `Disclosure` (com `Accordion`), `ProgressSteps`, `Skeleton`, `Spinner`, `Tabs` e `TagGroup`. Barrel: `src/grupos/estrutura-e-status.ts`.

### Tarefa D1: `Alert`

**Arquivos:** criar `frontend/packages/ui/src/components/Alert/`.

Três tons (`perigo`, `cuidado` e `info`) e nenhum verde. Barra lateral de 6px (10px no alto contraste, com borda preta em volta). O papel padrão é `note`. Com `anunciar`, vira `status` ou `alert`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Alert/Alert.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('tem título como heading e texto', () => {
    render(
      <Alert tom="cuidado" titulo="A bula pede cuidado com essa combinação">
        Converse com o farmacêutico antes de tomar os dois juntos.
      </Alert>,
    );
    expect(screen.getByRole('note')).toHaveTextContent('Converse com o farmacêutico');
    expect(screen.getByRole('heading', { level: 3, name: 'A bula pede cuidado com essa combinação' })).toBeInTheDocument();
  });

  it('só interrompe o leitor de tela quando pedido', () => {
    const { rerender } = render(<Alert tom="info" titulo="Sem conexão" anunciar="polite" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sem conexão');
    rerender(<Alert tom="perigo" titulo="Não consegui montar a resposta com segurança" anunciar="assertive" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('marca o tom com ícone e cor, nunca só cor', () => {
    const { container } = render(<Alert tom="perigo" titulo="A bula diz para não usar junto" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('note')).toHaveClass('bg-danger-bg', 'text-danger-text');
  });

  it('não tem tom verde', () => {
    // @ts-expect-error verde só confirma ação (Toast); nunca indica que algo é seguro
    const elemento = <Alert tom="sucesso" titulo="Pode tomar tranquilo" />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Alert/
```

Esperado: falha, porque `./Alert` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Alert/Alert.tsx`:

```tsx
import { Info, Prohibit, Warning, type Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

/**
 * Três tons, e nenhum é verde: verde só confirma ação (Toast) e nunca diz que algo é seguro.
 * - `perigo`: perigo real ("A bula diz para não usar junto").
 * - `cuidado`: pede atenção ("A bula pede cuidado com essa combinação").
 * - `info`: neutro ("A bula não fala dessa combinação").
 */
export type AlertTom = 'info' | 'cuidado' | 'perigo';

export interface AlertProps {
  /** `perigo`, `cuidado` ou `info`. Não existe tom verde. */
  tom: AlertTom;
  /** A mensagem principal, em uma frase. */
  titulo: string;
  /** O próximo passo ou o detalhe. */
  children?: ReactNode;
  /** Nível do título no documento. */
  nivelTitulo?: 2 | 3 | 4;
  /**
   * Só quando o aviso aparece depois que a página já carregou: `polite` vira role="status",
   * `assertive` vira role="alert". Sem isso, é role="note" e não interrompe o leitor de tela.
   */
  anunciar?: 'polite' | 'assertive';
}

const tons: Record<AlertTom, { classes: string; icone: Icon }> = {
  perigo: { classes: 'bg-danger-bg text-danger-text border-danger-border', icone: Prohibit },
  cuidado: { classes: 'bg-caution-bg text-caution-text border-caution-border', icone: Warning },
  info: { classes: 'bg-surface-info text-text-default border-border-field', icone: Info },
};

const papel = { polite: 'status', assertive: 'alert' } as const;

/** Estado da tela, com barra lateral (padrão do gov.br e do NHS). No alto contraste, borda preta inteira. */
export function Alert({ tom, titulo, children, nivelTitulo = 3, anunciar }: AlertProps) {
  const { classes, icone: Icone } = tons[tom];
  const Titulo = `h${nivelTitulo}` as const;
  return (
    <div
      role={anunciar ? papel[anunciar] : 'note'}
      className={
        `flex max-w-medida gap-3 rounded-aviso px-4 py-3 border-(length:--bc-borda-aviso) ` +
        `border-s-(length:--bc-borda-barra-aviso) alto-contraste:border-text-default ${classes}`
      }
    >
      <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <Titulo className="text-titulo-3 font-bold">{titulo}</Titulo>
        {children ? <div className="text-corpo">{children}</div> : null}
      </div>
    </div>
  );
}
```

`frontend/packages/ui/src/components/Alert/index.ts`:

```ts
export { Alert, type AlertProps, type AlertTom } from './Alert';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Alert/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Alert/Alert.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Alert } from './Alert';

const meta = {
  title: 'Componentes/Primitivos/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Perigo: Story = {
  args: {
    tom: 'perigo',
    titulo: 'A bula diz para não usar junto',
    children: 'Fale com o médico antes. Não pare nenhum remédio por conta própria.',
  },
};

export const Cuidado: Story = {
  args: {
    tom: 'cuidado',
    titulo: 'A bula pede cuidado com essa combinação',
    children: 'Converse com o farmacêutico antes de tomar os dois juntos.',
  },
  play: async ({ canvas }) => {
    const aviso = canvas.getByRole('note');
    await expect(getComputedStyle(aviso).borderInlineStartWidth).toBe('6px');
  },
};

export const Info: Story = {
  args: {
    tom: 'info',
    titulo: 'A bula não fala dessa combinação',
    children: 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.',
  },
};

export const AltoContraste: Story = {
  name: 'Perigo no alto contraste',
  args: Perigo.args,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    const aviso = canvas.getByRole('note');
    const estilo = getComputedStyle(aviso);
    await expect(estilo.borderTopWidth).toBe('2px');
    await expect(estilo.borderInlineStartWidth).toBe('10px');
    await expect(estilo.borderTopColor).toBe('rgb(0, 0, 0)');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Alert/
```

Esperado: `Tests  4 passed (4)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Alert/Alert.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Alert.stories';

<Meta of={Stories} />

# Alert

Aviso dentro da tela, com barra lateral, sobre o estado da resposta: perigo, cuidado ou informação.

## Exemplo

O título do componente é um `h3`, por isso o exemplo fica dentro de uma seção.

<Canvas of={Stories.Perigo} />

## Quando usar

- `perigo`: a bula diz para não fazer ("A bula diz para não usar junto").
- `cuidado`: a bula pede atenção ("A bula pede cuidado com essa combinação").
- `info`: algo neutro que a pessoa precisa saber ("A bula não fala dessa combinação").

## Quando não usar

- Para confirmar uma ação, use `Toast`.
- Para dizer que algo é seguro, não use nada. Não existe tom verde, e `tom="sucesso"` não compila. A ausência de aviso na bula nunca vira "pode usar".

## Anatomia

- Contêiner com fundo do tom e barra de 6px no lado de início. No alto contraste, ganha borda preta de 2px em volta, e a barra passa a 10px.
- Ícone decorativo do tom: proibido, triângulo de aviso ou "i".
- Título, na escala `titulo-3`.
- Texto com o próximo passo, opcional.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Cuidado} />

<Canvas of={Stories.Info} />

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

- Por padrão, `role="note"`: o aviso faz parte da tela e não interrompe o leitor de tela.
- Quando o aviso aparece depois que a página carregou, use `anunciar`. `polite` vira `role="status"` e `assertive` vira `role="alert"`. Guarde `assertive` para perigo.
- O tom nunca é passado só pela cor: o ícone e o título dizem o mesmo.
- O título é um `h3` por padrão. Ajuste com `nivelTitulo` para não pular nível.
- Os três tons passam no contraste AA nos dois temas.

## Conteúdo

O título é a mensagem principal, em uma frase. O texto diz o próximo passo ("Fale com o médico antes. Não pare nenhum remédio por conta própria."). Valem as regras 4 e 5 de **Conteúdo e voz**: informar sem assustar, e toda recusa com o próximo passo.

## Faça e não faça

- Faça: "A bula não fala dessa combinação. Isso não garante que seja seguro."
- Não faça: um aviso de `info` com "Pode tomar sem problema".
- Faça: `perigo` só quando a bula diz para não usar.
- Não faça: `perigo` para coisas comuns, como "tomar com água". Vermelho demais perde o sentido.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Alert
git commit -m "feat: componente Alert (#25)"
```

---

### Tarefa D2: `Disclosure` e `Accordion`

**Arquivos:** criar `frontend/packages/ui/src/components/Disclosure/`.

O botão fica dentro de um título, para a pessoa achar as seções pela lista de títulos do leitor de tela. Aberto, a borda fica azul e mais grossa e a seta gira. O `Accordion` deixa várias seções abertas por padrão, como as 9 seções da bula.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Disclosure/Disclosure.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('começa fechado, com o botão dentro de um título', () => {
    render(<Disclosure titulo="Como chegamos nesta resposta">Lemos a seção 4 das duas bulas.</Disclosure>);
    const botao = screen.getByRole('button', { name: 'Como chegamos nesta resposta' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('heading', { level: 3 })).toContainElement(botao);
    expect(screen.queryByText('Lemos a seção 4 das duas bulas.')).not.toBeVisible();
  });

  it('abre e fecha pelo teclado', async () => {
    render(<Disclosure titulo="Como chegamos nesta resposta">Lemos a seção 4 das duas bulas.</Disclosure>);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Lemos a seção 4 das duas bulas.')).toBeVisible();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Accordion', () => {
  it('abre a seção pedida e deixa abrir outras sem fechar a primeira', async () => {
    render(
      <Accordion defaultExpandedKeys={['s4']}>
        <Disclosure id="s1" titulo="1. Para que serve?">
          Texto da seção 1.
        </Disclosure>
        <Disclosure id="s4" titulo="4. O que devo saber antes de usar?">
          Texto da seção 4.
        </Disclosure>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: '1. Para que serve?' }));
    expect(screen.getByText('Texto da seção 1.')).toBeVisible();
    expect(screen.getByText('Texto da seção 4.')).toBeVisible();
  });

  it('pode permitir só uma aberta', async () => {
    render(
      <Accordion permiteVariosAbertos={false} defaultExpandedKeys={['s4']}>
        <Disclosure id="s1" titulo="1. Para que serve?">
          Texto da seção 1.
        </Disclosure>
        <Disclosure id="s4" titulo="4. O que devo saber antes de usar?">
          Texto da seção 4.
        </Disclosure>
      </Accordion>,
    );
    await userEvent.click(screen.getByRole('button', { name: '1. Para que serve?' }));
    expect(screen.getByText('Texto da seção 4.')).not.toBeVisible();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Disclosure/
```

Esperado: falha, porque `./Disclosure` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Disclosure/Disclosure.tsx`:

```tsx
import { CaretDown } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type DisclosureGroupProps,
  type DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components';

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'className' | 'style' | 'children' | 'render'> {
  /** O texto do botão que abre e fecha. Na ficha do remédio, a pergunta da seção ("4. O que devo saber antes de usar?"). */
  titulo: string;
  /** Nível do título que envolve o botão. */
  nivelTitulo?: 2 | 3 | 4;
  /** O conteúdo que aparece quando abre. */
  children: ReactNode;
}

/** Bloco que abre e fecha. Aberto, a borda fica azul e mais grossa. */
export function Disclosure({ titulo, nivelTitulo = 3, children, ...props }: DisclosureProps) {
  return (
    <AriaDisclosure
      {...props}
      className={
        'group max-w-medida rounded-controle border border-border-field ' +
        'data-expanded:border-(length:--bc-borda-controle) data-expanded:border-action-primary ' +
        'alto-contraste:border-(length:--bc-borda-controle)'
      }
    >
      <Heading level={nivelTitulo} className="text-corpo font-bold">
        <AriaButton
          slot="trigger"
          className={
            'flex min-h-13 w-full cursor-pointer items-center justify-between gap-2 rounded-controle px-4 py-2 ' +
            'text-start text-text-default data-focus-visible:foco-visivel'
          }
        >
          {titulo}
          <CaretDown
            size="1.5rem"
            weight="bold"
            aria-hidden="true"
            focusable="false"
            className="shrink-0 transition-transform duration-rapida ease-out group-data-expanded:rotate-180"
          />
        </AriaButton>
      </Heading>
      <DisclosurePanel className="px-4 pb-4 text-corpo">{children}</DisclosurePanel>
    </AriaDisclosure>
  );
}

export interface AccordionProps extends Omit<DisclosureGroupProps, 'className' | 'style' | 'children' | 'render' | 'allowsMultipleExpanded'> {
  /** Vários Disclosure, cada um com `id`. */
  children: ReactNode;
  /** Por padrão, abrir uma seção não fecha as outras. */
  permiteVariosAbertos?: boolean;
}

/** Grupo de Disclosure, como as 9 seções da bula na ficha do remédio. */
export function Accordion({ permiteVariosAbertos = true, ...props }: AccordionProps) {
  return <DisclosureGroup {...props} allowsMultipleExpanded={permiteVariosAbertos} className="flex flex-col gap-4" />;
}
```

`frontend/packages/ui/src/components/Disclosure/index.ts`:

```ts
export { Accordion, Disclosure, type AccordionProps, type DisclosureProps } from './Disclosure';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Disclosure/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Disclosure/Disclosure.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Accordion, Disclosure } from './Disclosure';

const meta = {
  title: 'Componentes/Primitivos/Disclosure',
  component: Disclosure,
  args: {
    titulo: 'Como chegamos nesta resposta',
    children: (
      <ol className="list-decimal ps-6">
        <li>Identificamos: losartana e ibuprofeno.</li>
        <li>Lemos a seção 4 das duas bulas.</li>
        <li>Checamos se uma bula fala da outra.</li>
        <li>Conferimos as regras de segurança.</li>
      </ol>
    ),
  },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fechado: Story = {
  play: async ({ canvas }) => {
    const botao = canvas.getByRole('button', { name: 'Como chegamos nesta resposta' });
    await expect(botao.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await userEvent.click(botao);
    await expect(canvas.getByText('Lemos a seção 4 das duas bulas.')).toBeVisible();
  },
};

export const Aberto: Story = { args: { defaultExpanded: true } };

export const FichaDoRemedio: Story = {
  name: 'Acordeão da ficha do remédio',
  render: () => (
    <Accordion defaultExpandedKeys={['s4']}>
      <Disclosure id="s1" titulo="1. Para que serve?">
        Texto da seção 1, em linguagem simples.
      </Disclosure>
      <Disclosure id="s3" titulo="3. Quando não devo usar?">
        Texto da seção 3.
      </Disclosure>
      <Disclosure id="s4" titulo="4. O que devo saber antes de usar?">
        Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito da losartana.
      </Disclosure>
    </Accordion>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Disclosure/
```

Esperado: `Tests  3 passed (3)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Disclosure/Disclosure.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Disclosure.stories';

<Meta of={Stories} />

# Disclosure

Bloco que abre e fecha. Junto com o `Accordion`, organiza as seções da bula na ficha do remédio.

## Exemplo

O título do componente é um `h3`, por isso o exemplo fica dentro de uma seção.

<Canvas of={Stories.Fechado} />

## Quando usar

- `Disclosure` sozinho: um detalhe que nem todo mundo quer ler, como "Como chegamos nesta resposta".
- `Accordion`: várias seções em sequência, como as 9 seções da bula. Por padrão, abrir uma não fecha as outras.

## Quando não usar

- Para a resposta principal ou um aviso de segurança, deixe o texto aberto na tela. O que é importante não fica escondido.
- Para trocar entre partes do mesmo conteúdo, lado a lado, use `Tabs`.

## Anatomia

- Contêiner com borda de 1px. Aberto, a borda fica azul e com 2px.
- Título (um `h3`, por padrão) com o botão dentro, de 52px de altura, e a seta que gira ao abrir.
- Painel com o conteúdo.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Aberto} />

<Canvas of={Stories.FichaDoRemedio} />

## Acessibilidade

- O botão fica dentro de um título, e a pessoa acha as seções pela lista de títulos do leitor de tela.
- O botão tem `aria-expanded` e controla o painel. Enter e Espaço abrem e fecham.
- Aberto não depende só da cor: a seta vira para cima e a borda fica mais grossa.
- O conteúdo fechado fica escondido de todo mundo, inclusive do leitor de tela.
- O `nivelTitulo` acerta o nível do título com o resto da página.

## Conteúdo

Nas seções da bula, o título é a pergunta da seção, com o número ("4. O que devo saber antes de usar?"), igual ao padrão da ANVISA. Nos outros casos, o título diz o que tem dentro.

## Faça e não faça

- Faça: abrir a seção que responde à pergunta (`defaultExpandedKeys`).
- Não faça: esconder dentro de um `Disclosure` fechado o aviso de que dois remédios não devem ser usados juntos.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Disclosure
git commit -m "feat: componente Disclosure (#25)"
```

---

### Tarefa D3: `ProgressSteps`

**Arquivos:** criar `frontend/packages/ui/src/components/ProgressSteps/`.

Um `ol` com nome, o passo atual com `aria-current="step"` e " (feito)" escondido nos passos feitos. O texto "Passo 2 de 3" diz tudo, e a barra só reforça.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/ProgressSteps/ProgressSteps.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressSteps } from './ProgressSteps';

const passos = ['Foto', 'Confirmar', 'Resposta'];

describe('ProgressSteps', () => {
  it('é uma lista ordenada com nome e o passo atual marcado', () => {
    render(<ProgressSteps rotulo="Perguntar por foto" passos={passos} atual={1} />);
    expect(screen.getByRole('list', { name: 'Perguntar por foto' })).toBeInTheDocument();
    const itens = screen.getAllByRole('listitem');
    expect(itens[1]).toHaveAttribute('aria-current', 'step');
    expect(itens[0]).toHaveTextContent('Foto (feito)');
  });

  it('diz em texto em que passo a pessoa está', () => {
    render(<ProgressSteps rotulo="Perguntar por foto" passos={passos} atual={1} />);
    expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument();
  });

  it('não sai da faixa de passos', () => {
    render(<ProgressSteps rotulo="Perguntar por foto" passos={passos} atual={9} />);
    expect(screen.getByText('Passo 3 de 3')).toBeInTheDocument();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ProgressSteps/
```

Esperado: falha, porque `./ProgressSteps` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/ProgressSteps/ProgressSteps.tsx`:

```tsx
import { Check } from '@phosphor-icons/react';
import { VisuallyHidden } from '../VisuallyHidden';

export interface ProgressStepsProps {
  /** Nome da sequência ("Perguntar por foto"). */
  rotulo: string;
  /** Os nomes curtos dos passos, na ordem ("Foto", "Confirmar", "Resposta"). */
  passos: readonly string[];
  /** Índice do passo atual, a partir de 0. */
  atual: number;
}

/** Onde a pessoa está num fluxo de poucos passos. O texto diz tudo; a barra só reforça. */
export function ProgressSteps({ rotulo, passos, atual }: ProgressStepsProps) {
  const indice = Math.min(Math.max(atual, 0), passos.length - 1);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-apoio text-text-muted">
        Passo {indice + 1} de {passos.length}
      </p>
      <ol aria-label={rotulo} className="flex gap-2">
        {passos.map((passo, i) => {
          const feito = i < indice;
          const agora = i === indice;
          return (
            <li
              key={passo}
              aria-current={agora ? 'step' : undefined}
              className={`flex flex-1 flex-col gap-1 text-apoio ${agora ? 'font-bold text-action-primary' : 'text-text-muted'}`}
            >
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-total ${feito || agora ? 'bg-action-primary' : 'bg-border-subtle'}`}
              />
              <span className="flex items-center gap-1">
                {feito ? <Check size="1.25rem" weight="bold" aria-hidden="true" focusable="false" /> : null}
                {passo}
                {feito ? <VisuallyHidden> (feito)</VisuallyHidden> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

`frontend/packages/ui/src/components/ProgressSteps/index.ts`:

```ts
export { ProgressSteps, type ProgressStepsProps } from './ProgressSteps';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ProgressSteps/
pnpm typecheck
```

Esperado: `Tests  3 passed (3)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/ProgressSteps/ProgressSteps.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressSteps } from './ProgressSteps';

const meta = {
  title: 'Componentes/Primitivos/ProgressSteps',
  component: ProgressSteps,
  args: { rotulo: 'Perguntar por foto', passos: ['Foto', 'Confirmar', 'Resposta'], atual: 1 },
} satisfies Meta<typeof ProgressSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoMeio: Story = { name: 'No meio do caminho' };

export const Comeco: Story = { name: 'Começo', args: { atual: 0 } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/ProgressSteps/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/ProgressSteps/ProgressSteps.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './ProgressSteps.stories';

<Meta of={Stories} />

# ProgressSteps

Mostra em que passo a pessoa está, num fluxo de poucos passos, como perguntar por foto.

<Canvas of={Stories.NoMeio} />

## Quando usar

Em fluxos de 2 a 5 passos que a pessoa faz em sequência: foto, confirmar, resposta.

## Quando não usar

- Para uma espera, use `Spinner`.
- Para navegar entre partes que a pessoa escolhe, use `Tabs`. Os passos não são clicáveis.

## Anatomia

- Texto "Passo 2 de 3", acima.
- Lista dos passos, cada um com uma barra e o nome. A barra fica azul nos passos feitos e no atual.
- Os passos feitos ganham o visto.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Comeco} />

## Acessibilidade

- A lista é um `ol` com o `rotulo` como nome, e o leitor de tela anuncia "lista, 3 itens".
- O passo atual tem `aria-current="step"`. Os passos feitos têm " (feito)" escondido para o leitor de tela.
- O texto diz tudo: a barra e a cor só reforçam.
- Os números da lista não aparecem: o texto "Passo 2 de 3" já faz esse papel.

## Conteúdo

Nomes curtos, com uma ou duas palavras ("Foto", "Confirmar", "Resposta").

## Faça e não faça

- Faça: três passos com nomes curtos.
- Não faça: mais de cinco passos. Se o fluxo é longo, ele precisa ser mais simples.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/ProgressSteps
git commit -m "feat: componente ProgressSteps (#25)"
```

---

### Tarefa D4: `Skeleton`

**Arquivos:** criar `frontend/packages/ui/src/components/Skeleton/`.

Lugar reservado, escondido do leitor de tela. Pulsa devagar e fica parado com movimento reduzido. Tem borda fina, para aparecer no alto contraste.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Skeleton/Skeleton.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('fica escondido do leitor de tela', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('desenha as linhas pedidas, a última mais curta', () => {
    const { container } = render(<Skeleton linhas={4} />);
    const linhas = container.querySelectorAll('span');
    expect(linhas).toHaveLength(4);
    expect(linhas[3]).toHaveClass('w-2/3');
  });

  it('para de pulsar com movimento reduzido', () => {
    const { container } = render(<Skeleton forma="bloco" />);
    expect(container.firstChild).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Skeleton/
```

Esperado: falha, porque `./Skeleton` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Skeleton/Skeleton.tsx`:

```tsx
export interface SkeletonProps {
  /** `texto`: linhas com a altura do corpo; `bloco`: um retângulo (cartão, imagem). */
  forma?: 'texto' | 'bloco';
  /** Quantas linhas, na forma `texto`. A última sai mais curta. */
  linhas?: number;
}

const cor = 'border border-esqueleto-borda bg-esqueleto-fundo animate-pulse motion-reduce:animate-none';

/**
 * Lugar reservado enquanto o conteúdo carrega. Fica escondido do leitor de tela:
 * quem espera ouve o Spinner ou o status, e o contêiner leva aria-busy="true".
 */
export function Skeleton({ forma = 'texto', linhas = 3 }: SkeletonProps) {
  if (forma === 'bloco') {
    return <div aria-hidden="true" data-skeleton="" className={`h-24 w-full rounded-painel ${cor}`} />;
  }
  return (
    <div aria-hidden="true" data-skeleton="" className="flex max-w-medida flex-col gap-3 text-corpo">
      {Array.from({ length: linhas }, (_, i) => (
        <span key={i} className={`block h-[1em] rounded-aviso ${cor} ${i === linhas - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
```

`frontend/packages/ui/src/components/Skeleton/index.ts`:

```ts
export { Skeleton, type SkeletonProps } from './Skeleton';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Skeleton/
pnpm typecheck
```

Esperado: `Tests  3 passed (3)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Skeleton/Skeleton.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Componentes/Primitivos/Skeleton',
  component: Skeleton,
  render: (args) => (
    <div aria-busy="true" className="flex flex-col gap-4">
      <Skeleton {...args} />
    </div>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Texto: Story = {};

export const Bloco: Story = { args: { forma: 'bloco' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Skeleton/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Skeleton/Skeleton.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Skeleton.stories';

<Meta of={Stories} />

# Skeleton

Lugar reservado, em cinza claro, enquanto o conteúdo carrega. Evita que a tela pule quando a resposta chega.

<Canvas of={Stories.Texto} />

## Quando usar

Onde o conteúdo vai aparecer e já se sabe o formato: linhas de texto da resposta ou um cartão.

## Quando não usar

- Sozinho, sem dizer o que está acontecendo. Junto com ele vai sempre um `Spinner` ou um texto de status, que é o que o leitor de tela ouve.
- Para esperas curtas, de menos de um segundo, não use nada.

## Anatomia

- `texto`: linhas com a altura do corpo do texto, a última mais curta.
- `bloco`: um retângulo com o raio dos painéis.
- Borda fina, para continuar visível no alto contraste.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Bloco} />

## Acessibilidade

- Fica escondido do leitor de tela (`aria-hidden`). Quem usa leitor de tela ouve o `Spinner` ou o status.
- O contêiner que espera leva `aria-busy="true"`, como nas stories.
- Pulsa devagar e, com movimento reduzido, fica parado.
- As linhas crescem com o A+, porque a altura é em `em`.

## Conteúdo

Não tem texto. O texto da espera fica no `Spinner` ("Lendo a bula da losartana…").

## Faça e não faça

- Faça: três linhas de `texto` onde a resposta vai aparecer, com o `Spinner` acima.
- Não faça: um esqueleto sem nenhum texto de status na tela.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Skeleton
git commit -m "feat: componente Skeleton (#25)"
```

---

### Tarefa D5: `Spinner`

**Arquivos:** criar `frontend/packages/ui/src/components/Spinner/`.

`ProgressBar` indeterminado do React Aria, com o `rotulo` como nome. Não é região `aria-live`: quem quiser anunciar cada etapa põe o `Spinner` dentro de uma (o `LoadingStatus` do plano 3 faz isso). Com movimento reduzido, para de girar.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Spinner/Spinner.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('é uma barra de progresso sem valor, com o texto visível como nome', () => {
    render(<Spinner rotulo="Lendo a bula da losartana…" />);
    const barra = screen.getByRole('progressbar', { name: 'Lendo a bula da losartana…' });
    expect(barra).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByText('Lendo a bula da losartana…')).toBeVisible();
  });

  it('pode esconder o texto sem perder o nome', () => {
    render(<Spinner rotulo="Carregando" mostrarRotulo={false} />);
    expect(screen.getByRole('progressbar', { name: 'Carregando' })).toBeInTheDocument();
    expect(screen.queryByText('Carregando')).not.toBeInTheDocument();
  });

  it('para de girar com movimento reduzido', () => {
    const { container } = render(<Spinner rotulo="Carregando" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('animate-spin', 'motion-reduce:animate-none');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Spinner/
```

Esperado: falha, porque `./Spinner` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Spinner/Spinner.tsx`:

```tsx
import { Label, ProgressBar } from 'react-aria-components';

export interface SpinnerProps {
  /** O que está acontecendo ("Lendo a bula da losartana…"). É o nome da barra de progresso. */
  rotulo: string;
  /** Mostra o texto ao lado do círculo. Desligue só quando o texto já aparece em outro lugar. */
  mostrarRotulo?: boolean;
}

/**
 * Espera sem prazo conhecido. Não é região aria-live: quem quiser anunciar a etapa põe o Spinner
 * dentro de um aria-live="polite" (é o que o LoadingStatus faz). Com movimento reduzido, o círculo fica parado.
 */
export function Spinner({ rotulo, mostrarRotulo = true }: SpinnerProps) {
  return (
    <ProgressBar
      isIndeterminate
      aria-label={mostrarRotulo ? undefined : rotulo}
      className="flex items-center gap-3 text-apoio text-text-muted"
    >
      <span
        aria-hidden="true"
        className="size-6 shrink-0 animate-spin rounded-full border-3 border-border-subtle border-t-action-primary motion-reduce:animate-none"
      />
      {mostrarRotulo ? <Label>{rotulo}</Label> : null}
    </ProgressBar>
  );
}
```

`frontend/packages/ui/src/components/Spinner/index.ts`:

```ts
export { Spinner, type SpinnerProps } from './Spinner';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Spinner/
pnpm typecheck
```

Esperado: `Tests  3 passed (3)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Spinner/Spinner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Componentes/Primitivos/Spinner',
  component: Spinner,
  args: { rotulo: 'Lendo a bula da losartana…' },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComTexto: Story = {};

export const SoOCirculo: Story = { name: 'Só o círculo', args: { rotulo: 'Carregando', mostrarRotulo: false } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Spinner/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Spinner/Spinner.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Spinner.stories';

<Meta of={Stories} />

# Spinner

Círculo que gira, com um texto do que está acontecendo, para esperas sem prazo conhecido.

<Canvas of={Stories.ComTexto} />

## Quando usar

Enquanto o app espera a API: lendo a bula, checando interações.

## Quando não usar

- Para mostrar em que passo de um fluxo a pessoa está, use `ProgressSteps`.
- Para reservar o espaço do conteúdo, use `Skeleton`, junto com o `Spinner`.

## Anatomia

- Círculo de 24px, com o arco azul.
- Texto ao lado, em texto de apoio.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.SoOCirculo} />

## Acessibilidade

- Papel `progressbar`, sem valor, com o `rotulo` como nome.
- Não é região `aria-live`. Para anunciar cada etapa, ponha o `Spinner` dentro de um `aria-live="polite"`. É o que o `LoadingStatus` do plano 3 faz.
- Com movimento reduzido, o círculo fica parado. O texto continua dizendo o que acontece.
- Esconda o texto (`mostrarRotulo={false}`) só quando ele já aparece em outro lugar da tela.

## Conteúdo

O que o app está fazendo, com o nome do remédio quando houver ("Lendo a bula da losartana…"). Termine com reticências.

## Faça e não faça

- Faça: "Checando interações…".
- Não faça: "Carregando…" quando dá para dizer o que está acontecendo.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Spinner
git commit -m "feat: componente Spinner (#25)"
```

---

### Tarefa D6: `Tabs`

**Arquivos:** criar `frontend/packages/ui/src/components/Tabs/`.

Abas com a cara do `.bc-tab` aprovado: ícone em cima, texto embaixo e barra azul de 3px no topo da selecionada. A `TabList` exige `aria-label`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/Tabs/Tabs.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

function Exemplo() {
  return (
    <Tabs>
      <TabList aria-label="Partes da bula">
        <Tab id="tomar">Como tomar</Tab>
        <Tab id="mal">O que pode fazer mal</Tab>
      </TabList>
      <TabPanel id="tomar">Um comprimido por dia.</TabPanel>
      <TabPanel id="mal">Tontura e cansaço.</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('liga abas e painéis', () => {
    render(<Exemplo />);
    expect(screen.getByRole('tablist', { name: 'Partes da bula' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Como tomar' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Como tomar' })).toHaveTextContent('Um comprimido por dia.');
  });

  it('troca de aba pelas setas', async () => {
    render(<Exemplo />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'O que pode fazer mal' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Tontura e cansaço.');
  });

  it('não compila sem aria-label na lista', () => {
    // @ts-expect-error a lista de abas precisa dizer do que é
    const elemento = <TabList>{null}</TabList>;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Tabs/
```

Esperado: falha, porque `./Tabs` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/Tabs/Tabs.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';

export type TabsProps = Omit<AriaTabsProps, 'className' | 'style' | 'render'>;

export function Tabs(props: TabsProps) {
  return <AriaTabs {...props} className="flex flex-col gap-4" />;
}

export interface TabListProps<T extends object>
  extends Omit<AriaTabListProps<T>, 'className' | 'style' | 'aria-label' | 'render'> {
  /** Obrigatório: diz do que são as abas ("Partes da resposta"). */
  'aria-label': string;
}

export function TabList<T extends object>(props: TabListProps<T>) {
  return <AriaTabList {...props} className="flex border-t border-border-subtle" />;
}

export interface TabProps extends Omit<AriaTabProps, 'className' | 'style' | 'children' | 'render'> {
  /** Liga a aba ao TabPanel de mesmo `id`. */
  id: string;
  /** O texto da aba, curto. */
  children: string;
  /** Ícone Phosphor acima do texto. É decorativo. */
  icone?: Icon;
}

/** Aba com a cara da barra de navegação aprovada: ícone em cima, texto embaixo, barra azul no topo quando selecionada. */
export function Tab({ icone: Icone, children, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      className={
        'flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-t-3 border-transparent ' +
        'px-2 text-center text-rotulo text-text-muted outline-none transition-colors duration-rapida ease-out ' +
        'data-hovered:text-action-primary data-selected:border-aba-indicador data-selected:font-bold ' +
        'data-selected:text-action-primary data-focus-visible:foco-visivel'
      }
    >
      {Icone ? <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className' | 'style' | 'children' | 'render'> {
  /** O mesmo `id` da Tab que mostra este painel. */
  id: string;
  /** O conteúdo do painel. */
  children: ReactNode;
}

export function TabPanel(props: TabPanelProps) {
  return <AriaTabPanel {...props} className="rounded-controle outline-none data-focus-visible:foco-visivel" />;
}
```

`frontend/packages/ui/src/components/Tabs/index.ts`:

```ts
export { Tab, TabList, TabPanel, Tabs, type TabListProps, type TabPanelProps, type TabProps, type TabsProps } from './Tabs';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/Tabs/
pnpm typecheck
```

Esperado: `Tests  3 passed (3)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/Tabs/Tabs.stories.tsx`:

```tsx
import { BookOpen, Pill, Question } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const meta = {
  title: 'Componentes/Primitivos/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComIcones: Story = {
  name: 'Com ícones',
  render: () => (
    <Tabs>
      <TabList aria-label="Partes da bula">
        <Tab id="serve" icone={Question}>
          Para que serve
        </Tab>
        <Tab id="tomar" icone={Pill}>
          Como tomar
        </Tab>
        <Tab id="bula" icone={BookOpen}>
          Bula inteira
        </Tab>
      </TabList>
      <TabPanel id="serve">Ajuda a controlar a pressão alta.</TabPanel>
      <TabPanel id="tomar">Um comprimido de 50 mg por dia, com ou sem comida.</TabPanel>
      <TabPanel id="bula">As 9 seções da bula oficial.</TabPanel>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const aba = canvas.getByRole('tab', { name: 'Como tomar' });
    await expect(aba.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await userEvent.click(aba);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Um comprimido de 50 mg por dia');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/Tabs/
```

Esperado: `Tests  1 passed (1)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/Tabs/Tabs.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './Tabs.stories';

<Meta of={Stories} />

# Tabs

Abas para trocar entre partes do mesmo conteúdo, sem sair da tela. Inclui `TabList`, `Tab` e `TabPanel`.

<Canvas of={Stories.ComIcones} />

## Quando usar

Para duas a quatro partes do mesmo assunto que a pessoa olha uma de cada vez, como partes da ficha de um remédio.

## Quando não usar

- Para a navegação do app (Perguntar, Meus remédios), use links com `aria-current`. Essa barra é do `InputDock`, no plano 3, e não uma lista de abas.
- Para partes que a pessoa quer ler em sequência, use `Accordion`.

## Anatomia

- Lista de abas, com borda fina em cima.
- Cada aba: ícone decorativo em cima, texto embaixo e uma barra azul de 3px no topo quando selecionada. 56px de altura.
- Painel da aba selecionada.

## Props

<ArgTypes of={Stories} />

## Estados

Uma aba selecionada por vez. A selecionada fica em azul, em negrito e com a barra no topo.

## Acessibilidade

- Papéis `tablist`, `tab` e `tabpanel`. A `TabList` exige `aria-label`.
- Tab entra na aba selecionada. As setas trocam de aba, e Tab de novo vai para o painel.
- A selecionada não depende só da cor: tem a barra e o negrito.
- O texto das abas usa o estilo de rótulo, que fica pequeno. Por isso, poucas abas e nomes curtos. No alto contraste, as abas não selecionadas não ganham borda própria.

## Conteúdo

Nomes de uma a três palavras ("Para que serve", "Como tomar", "Bula inteira").

## Faça e não faça

- Faça: três abas com nomes curtos.
- Não faça: esconder um aviso de segurança numa aba que não abre sozinha.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/Tabs
git commit -m "feat: componente Tabs (#25)"
```

---

### Tarefa D7: `TagGroup`

**Arquivos:** criar `frontend/packages/ui/src/components/TagGroup/`.

Chips de 48px, com fundo azul-claro e texto azul-escuro. Com `onRemove` no grupo, cada chip ganha um X de 48px, e o React Aria junta o verbo ao texto do chip: "Remover Losartana".

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/TagGroup/TagGroup.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tag, TagGroup } from './TagGroup';

describe('TagGroup', () => {
  it('é uma lista com rótulo visível', () => {
    render(
      <TagGroup rotulo="Seus remédios">
        <Tag id="losartana">Losartana</Tag>
        <Tag id="metformina">Metformina</Tag>
      </TagGroup>,
    );
    expect(screen.getByRole('grid', { name: 'Seus remédios' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('remove pelo botão com nome', async () => {
    const onRemove = vi.fn();
    render(
      <TagGroup rotulo="Seus remédios" onRemove={onRemove}>
        <Tag id="losartana">Losartana</Tag>
      </TagGroup>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remover Losartana' }));
    expect(onRemove).toHaveBeenCalledWith(new Set(['losartana']));
  });

  it('remove pelo teclado (Delete)', async () => {
    const onRemove = vi.fn();
    render(
      <TagGroup rotulo="Seus remédios" onRemove={onRemove}>
        <Tag id="losartana">Losartana</Tag>
      </TagGroup>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{Delete}');
    expect(onRemove).toHaveBeenCalledWith(new Set(['losartana']));
  });

  it('mostra o texto de lista vazia', () => {
    render(
      <TagGroup rotulo="Seus remédios" items={[]} textoVazio="Nenhum remédio na lista.">
        {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
      </TagGroup>,
    );
    expect(screen.getByText('Nenhum remédio na lista.')).toBeInTheDocument();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TagGroup/
```

Esperado: falha, porque `./TagGroup` ainda não existe.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/TagGroup/TagGroup.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react';
import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList,
  type TagGroupProps as AriaTagGroupProps,
  type TagProps as AriaTagProps,
} from 'react-aria-components';

export interface TagGroupProps<T extends object> extends Omit<AriaTagGroupProps, 'className' | 'style' | 'children' | 'render'> {
  /** Rótulo de bloco, visível e em caixa alta ("Seus remédios"). */
  rotulo: string;
  /** Os itens, quando a lista muda (como os remédios da pessoa). Cada um precisa de `id`. */
  items?: Iterable<T>;
  /** Os Tag, ou uma função que desenha um Tag para cada item. */
  children: ReactNode | ((item: T) => ReactNode);
  /** O que aparece quando a lista está vazia. */
  textoVazio?: string;
}

export function TagGroup<T extends object>({ rotulo, items, children, textoVazio, ...props }: TagGroupProps<T>) {
  return (
    <AriaTagGroup {...props} className="flex flex-col gap-2">
      <Label className="text-rotulo font-bold uppercase tracking-rotulo text-text-muted">{rotulo}</Label>
      <TagList
        items={items}
        className="flex flex-wrap gap-2"
        renderEmptyState={textoVazio ? () => <p className="text-apoio text-text-muted">{textoVazio}</p> : undefined}
      >
        {children}
      </TagList>
    </AriaTagGroup>
  );
}

export interface TagProps extends Omit<AriaTagProps, 'className' | 'style' | 'children' | 'textValue' | 'render'> {
  /** O texto do chip. */
  children: string;
  /** Ícone Phosphor à esquerda. É decorativo. */
  icone?: Icon;
  /** Verbo do botão de remover. O React Aria junta o texto do chip: "Remover Losartana". */
  rotuloRemover?: string;
}

/** Chip: fundo azul-claro, texto azul-escuro, 48px de altura. Com onRemove no grupo, ganha o botão de remover. */
export function Tag({ children, icone: Icone, rotuloRemover = 'Remover', ...props }: TagProps) {
  return (
    <AriaTag
      {...props}
      textValue={children}
      className={
        'inline-flex min-h-12 cursor-default items-center gap-2 rounded-controle border border-transparent bg-chip-fundo ' +
        'px-3 text-apoio text-chip-texto outline-none transition-colors duration-rapida ease-out ' +
        'data-hovered:border-chip-texto data-selected:border-chip-texto data-selected:font-bold ' +
        'data-focus-visible:foco-visivel alto-contraste:border-(length:--bc-borda-controle) alto-contraste:border-text-default'
      }
    >
      {({ allowsRemoving }) => (
        <>
          {Icone ? <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" /> : null}
          {children}
          {allowsRemoving ? (
            <AriaButton
              slot="remove"
              aria-label={rotuloRemover}
              className={
                '-me-3 inline-flex size-12 cursor-pointer items-center justify-center rounded-controle ' +
                'data-hovered:bg-surface-default data-focus-visible:foco-visivel'
              }
            >
              <X size="1.25rem" weight="bold" aria-hidden="true" focusable="false" />
            </AriaButton>
          ) : null}
        </>
      )}
    </AriaTag>
  );
}
```

`frontend/packages/ui/src/components/TagGroup/index.ts`:

```ts
export { Tag, TagGroup, type TagGroupProps, type TagProps } from './TagGroup';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TagGroup/
pnpm typecheck
```

Esperado: `Tests  4 passed (4)` e o typecheck sem erro. O typecheck é o que confere os `@ts-expect-error` dos testes.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/TagGroup/TagGroup.stories.tsx`:

```tsx
import { BookOpen } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { Tag, TagGroup } from './TagGroup';

const meta = {
  title: 'Componentes/Primitivos/TagGroup',
  component: TagGroup,
  args: { rotulo: 'Na bula', children: null },
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chips: Story = {
  render: (args) => (
    <TagGroup {...args}>
      <Tag id="l4" icone={BookOpen}>
        Losartana · seção 4
      </Tag>
      <Tag id="i4" icone={BookOpen}>
        Ibuprofeno · seção 4
      </Tag>
    </TagGroup>
  ),
  play: async ({ canvas }) => {
    for (const chip of canvas.getAllByRole('row')) {
      await expect(chip.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
  },
};

function ListaRemovivel() {
  const [remedios, setRemedios] = useState([
    { id: 'losartana', nome: 'Losartana' },
    { id: 'metformina', nome: 'Metformina' },
  ]);
  return (
    <TagGroup
      rotulo="Seus remédios"
      items={remedios}
      textoVazio="Nenhum remédio na lista."
      onRemove={(chaves) => setRemedios((lista) => lista.filter((r) => !chaves.has(r.id)))}
    >
      {(remedio) => <Tag id={remedio.id}>{remedio.nome}</Tag>}
    </TagGroup>
  );
}

export const Removivel: Story = {
  name: 'Com remover',
  render: () => <ListaRemovivel />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remover Losartana' }));
    await expect(canvas.queryByText('Losartana')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Remover Metformina' }).getBoundingClientRect().width).toBe(48);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/TagGroup/
```

Esperado: `Tests  2 passed (2)`, com o axe ligado em cada story.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/TagGroup/TagGroup.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './TagGroup.stories';

<Meta of={Stories} />

# TagGroup

Grupo de chips. Mostra os remédios da lista da pessoa e as fontes da resposta. Inclui o `Tag`, que é cada chip.

<Canvas of={Stories.Chips} />

## Quando usar

- Para mostrar uma lista curta de itens, como "Na bula: Losartana · seção 4".
- Com `onRemove`, para a pessoa tirar itens da lista, como em "Seus remédios".

## Quando não usar

- Para escolher opções de um formulário, use `Checkbox` ou `RadioGroup`.
- Para ações, use `Button`. Um chip não é botão.

## Anatomia

- Rótulo de bloco em caixa alta ("SEUS REMÉDIOS").
- Chips com fundo azul-claro, texto azul-escuro e 48px de altura, com ícone opcional.
- Botão de remover (X) de 48px, quando o grupo tem `onRemove`.
- Texto de lista vazia, opcional.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Removivel} />

## Acessibilidade

- O grupo é uma grade (`grid`) com o rótulo como nome. Cada chip é uma linha (`row`).
- As setas andam entre os chips. Com `onRemove`, Delete e Backspace removem o chip com foco.
- O botão de remover diz o que remove: o React Aria junta o verbo ao texto do chip, "Remover Losartana".
- No alto contraste, os chips ganham borda preta de 2px.

## Conteúdo

O texto do chip é o nome do remédio, como a pessoa conhece. Nas fontes, o remédio e a seção da bula ("Ibuprofeno · seção 4").

## Faça e não faça

- Faça: `textoVazio="Nenhum remédio na lista."`.
- Não faça: remover sem o nome no botão. "Remover" sozinho não diz qual remédio sai da lista.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/TagGroup
git commit -m "feat: componente TagGroup (#25)"
```

---

### Tarefa D8: Barrel, changeset e conferência do grupo D

**Arquivos:** modificar `frontend/packages/ui/src/grupos/estrutura-e-status.ts`; criar `frontend/.changeset/primitivos-estrutura-e-status.md`.

- [ ] **Passo 1: Barrel**

`frontend/packages/ui/src/grupos/estrutura-e-status.ts`:

```ts
// Grupo D do plano 2: estrutura e status.
export * from '../components/Alert';
export * from '../components/Disclosure';
export * from '../components/ProgressSteps';
export * from '../components/Skeleton';
export * from '../components/Spinner';
export * from '../components/Tabs';
export * from '../components/TagGroup';
```

- [ ] **Passo 2: Changeset**

`frontend/.changeset/primitivos-estrutura-e-status.md`:

```md
---
'@bula-clara/ui': minor
---

Novos componentes de estrutura e de status: Alert (sem tom verde), Disclosure e Accordion, ProgressSteps, Skeleton, Spinner, Tabs e TagGroup.
```

- [ ] **Passo 3: Conferir o grupo**

```bash
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm --filter @bula-clara/ui exec vitest run --project unit
```

Esperado: `Tests  69 passed (69)` nos tokens, lint e tipos sem erro, `Tests  63 passed (63)` no `ui` e `Tests  36 passed (36)` só na unidade.

- [ ] **Passo 4: Commit**

```bash
git add frontend/packages/ui/src/grupos/estrutura-e-status.ts frontend/.changeset/primitivos-estrutura-e-status.md
git commit -m "feat: exporta os primitivos de estrutura e de status (#25)"
```

---

### Tarefa 2: Juntar os grupos e conferir tudo

Quem coordena faz esta tarefa, no worktree do plano 2, depois que os quatro grupos terminarem.

- [ ] **Passo 1: Juntar os quatro grupos**

Cada grupo é um conjunto de commits sobre o commit da Tarefa 1. Traga os quatro, um de cada vez (merge ou cherry-pick, como preferir). Não deve haver conflito: cada grupo só criou as pastas dele, o barrel dele e o changeset dele.

```bash
git log --oneline | head -30
ls frontend/packages/ui/src/components | wc -l   # 27: os 3 do plano 1, os 23 deste plano e Campo
ls frontend/.changeset/primitivos-*.md | wc -l   # 5
```

- [ ] **Passo 2: Instalação limpa**

```bash
cd frontend
rm -rf node_modules packages/*/node_modules packages/tokens/dist
pnpm install --frozen-lockfile < /dev/null
```

Esperado: instala sem mudar o `pnpm-lock.yaml` (`git status` limpo).

- [ ] **Passo 3: Sequência completa**

```bash
pnpm --filter @bula-clara/tokens test && pnpm lint && pnpm typecheck && pnpm --filter @bula-clara/ui test && pnpm build-storybook
pnpm --filter @bula-clara/ui exec vitest run --project unit
```

Esperado: `Tests  69 passed (69)` nos tokens, lint e tipos sem erro, `Tests  174 passed (174)` no `ui` (107 de unidade e 67 stories) e o build do Storybook sem erro.

- [ ] **Passo 4: Conferir as páginas de documentação com o axe**

O addon de Vitest só testa stories, e as páginas MDX ficam de fora. Este script serve o build, abre cada página de componente (e as de `src/docs/`, se o plano 4 já estiver junto) num Chromium, confere que renderiza sem erro, roda o axe e confere as listas: as do Markdown com número, as das stories sem. Ele usa o Playwright e o axe-core que já estão no `node_modules` do Storybook.

Crie `/tmp/bula-clara-conferir-paginas.mjs`:

```js
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
const paginas = Object.values(indice.entries).filter((e) => e.type === 'docs' && (e.importPath.startsWith('./src/docs/') || e.importPath.startsWith('./src/components/')));

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
  // Listas do Markdown com marcador; listas dos componentes (dentro das stories) sem.
  const listas = await aba.evaluate(() => {
    const md = [...document.querySelectorAll('.sbdocs-content > ol')].filter((l) => getComputedStyle(l).listStyleType !== 'decimal').length;
    const comp = [...document.querySelectorAll('.docs-story ol:not(.list-decimal)')].filter((l) => getComputedStyle(l).listStyleType !== 'none').length;
    const semStory = document.body.innerText.includes('to true to view this story') ? 1 : 0;
    return { md, comp, semStory, total: document.querySelectorAll('.sbdocs-content > ol').length };
  });
  if (listas.md) erros.push(`${listas.md} lista(s) do Markdown sem marcador`);
  if (listas.comp) erros.push(`${listas.comp} lista(s) de componente com marcador`);
  if (listas.semStory) erros.push('story não renderizada no docs');
  const ok = erros.length === 0 && violacoes.length === 0 && abaixo.length === 0;
  if (!ok) falhas++;
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${pagina.title} [ol do Markdown: ${listas.total}]${erros.length ? ` | erros: ${erros.join('; ')}` : ''}${violacoes.length ? ` | axe: ${violacoes.join(', ')}` : ''}${abaixo.length ? ` | abaixo da meta: ${abaixo.length}` : ''}`);
  await aba.close();
}
await navegador.close();
servidor.close();
console.log(`${paginas.length} páginas, ${falhas} com problema`);
process.exit(falhas ? 1 : 0);
```

```bash
node /tmp/bula-clara-conferir-paginas.mjs .
```

Esperado: `ok` em cada página e `26 páginas, 0 com problema` (mais as do plano 4, se ele já estiver junto). A linha do SkipLink mostra `[ol do Markdown: 1]`. Uma página com `heading-order` quase sempre é um exemplo cujo título (`h3`) vem logo depois do `h1` da página: ponha o exemplo dentro de uma seção `##`, como nas páginas do `Alert` e do `Disclosure`.

- [ ] **Passo 5: Changesets**

```bash
pnpm changeset status < /dev/null
```

Esperado:

```
🦋 changeset v3.0.3

Packages to be bumped:
- minor
  - @bula-clara/tokens
  - @bula-clara/ui
```

- [ ] **Passo 6: Limpar**

```bash
rm -rf packages/ui/storybook-static
rm /tmp/bula-clara-conferir-paginas.mjs
git status   # limpo
```

- [ ] **Passo 7: PR (não faça nesta execução)**

O PR é um só, depois que os quatro planos estiverem juntos na `feat/design-system-base`, e só com o OK do Matheus.

---

## Para o coordenador

- **Plano 4 e as listas numeradas.** O plano 4 contorna o reset do Tailwind com o bloco `ListaNumerada`. Com a regra da Tarefa 1 (`.sbdocs-content > ol`), as listas em Markdown escritas direto na página já ganham número. As que estão dentro do `ListaNumerada` continuam com o número dele, porque ficam dentro de um `div` e a regra não pega. Os dois convivem, e o `ListaNumerada` pode sair depois, se o grupo quiser.
- **Plano 4 e o `pares-contraste.json`.** Depois de juntar os dois planos, o `blocos/tokens.tsx` do plano 4 pode trocar o import relativo por `import paresJson from '@bula-clara/tokens/pares-contraste.json';`. As páginas de cores passam a mostrar os 8 pares novos.
- **Ordem da barra lateral.** As páginas deste plano ficam em "Componentes/Primitivos/<Nome>/Docs", ao lado das stories. Elas não mexem no `storySort`.
- **Plano 3.** Os componentes do domínio usam a API pública acima. O `InputDock` é quem faz a barra de navegação de baixo, com links e `aria-current`, e não com `Tabs`.

## Autorrevisão

**Cobertura da spec e do visual aprovado:**
- Os 23 primitivos da lista do plano 1 ("Os quatro planos"): Grupos A a D. `Tag` e `Radio` saem junto com `TagGroup` e `RadioGroup`, e `Accordion` junto com `Disclosure`.
- Tokens de componente, véu e pares de contraste novos: Tarefa 1.
- Alto contraste com borda onde o tema padrão não tem, área de toque de 48px, foco visível, movimento reduzido e reflow em 320px a 140%: em cada componente, com teste ou story.
- Verde só confirma ação (Toast) e nunca diz que algo é seguro (Alert sem tom verde): Tarefas C3 e D1.
- Texto de consentimento verdadeiro no `Switch`: Tarefa B7, com os textos aprovados no plano 4.
- Página de documentação de cada componente, no formato do Modelo de página do plano 4: em cada tarefa de componente, e as do `Button`, do `IconButton` e do `VisuallyHidden` na Tarefa 1.
- Changesets: Tarefa 1 e a última tarefa de cada grupo.

**Fica para os outros planos:** os componentes do domínio e as páginas de Padrões (plano 3), as páginas gerais e o checklist manual com VoiceOver ou TalkBack (plano 4).
