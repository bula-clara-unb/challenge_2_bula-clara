# Design system, plano 1 de 4: a base

> **Para quem for executar com agentes:** use a skill `superpowers:subagent-driven-development` (recomendada) ou `superpowers:executing-plans`, tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhar o andamento.
>
> **Commits:** cada tarefa termina com um commit. Commits **locais** no worktree de execução estão autorizados pelo Matheus. **Push e PR, não**: esses esperam o OK dele. As mensagens seguem o padrão do repositório (conventional commits em português, uma linha, citando a #25) e não levam rodapé de co-autoria nem menção a ferramentas de IA. Nunca inclua `.claude/` nem arquivos fora do que a tarefa lista.

**Objetivo:** montar o `frontend/` com os tokens do Bula Clara, o teste de contraste, o Storybook com axe em cada story, o job de CI e os três primeiros componentes (`Button`, `IconButton`, `VisuallyHidden`), provando o caminho inteiro de ponta a ponta.

**Arquitetura:** um pnpm workspace em `frontend/` com dois pacotes. O `@bula-clara/tokens` guarda os tokens em JSON no formato DTCG e gera, com o Style Dictionary, as variáveis CSS dos dois temas e o bloco `@theme` do Tailwind v4, que só aponta para essas variáveis. O `@bula-clara/ui` traz os componentes sobre React Aria Components, estilizados com Tailwind, e o Storybook dele roda cada story como teste no Vitest (modo navegador, Chromium) com o axe ligado em modo de erro.

**Stack (versões conferidas no registro do npm em 26/11/2026):** Node 24, pnpm 11.3, TypeScript 6.0 (o 7.0 ainda não é aceito pelo `typescript-eslint`), React 19.3, React Aria Components 1.22, Tailwind 4.3, Style Dictionary 5.8, Storybook 10.6, Vitest 5.1.1, Phosphor Icons 2.1 e Fontsource (Literata variável e Atkinson Hyperlegible 400 e 700).

**Spec:** `docs/design-system.md`. **Issue:** #25.

**Referência visual (vale mais que a spec quando as duas divergem):** o design system e o canvas das telas aprovados pelo grupo em 25/11/2026. As cópias locais ficam em `/Users/matheusperillo/dev/challenge_2_bula-clara/.superpowers/referencias/` (pasta fora do git; comece pelo `LEIA.md`). Os tokens e o `Button` deste plano já foram acertados com o `design-system/tokens.json` e o `design-system/components/bundle.css` de lá.

---

## Os quatro planos

A #25 foi dividida em quatro planos. Cada um entrega algo que funciona sozinho:

1. **A base (este plano):** workspace, tokens, teste de contraste, Storybook com axe, CI e os três primeiros primitivos.
2. **Os primitivos restantes:** `LinkButton`, campos, `ComboBox`, `Switch`, `Checkbox`, `RadioGroup`, `Disclosure`/`Accordion`, `Dialog`, `Sheet`, `Tabs`, `Tag`/`TagGroup`, `Alert`, `Toast`, `Spinner`, `Skeleton`, `ProgressSteps`, `SkipLink`, `Icon`, `Heading`, `Text` e `Prose`.
3. **Os componentes do domínio:** `AnswerHeadline`, `InteractionCallout`, `EmergencyCard` e os demais da tabela da spec.
4. **A documentação:** as páginas do Storybook (princípios, fundamentos, conteúdo e voz, padrões, changelog), o ADR e o checklist manual com VoiceOver ou TalkBack.

## Decisões que este plano fecha

A spec deixou algumas escolhas para o plano. Elas foram testadas antes de entrar aqui:

- **Testes das stories:** addon de Vitest do Storybook (`@storybook/addon-vitest`), e não o test-runner antigo. Ele roda cada story num Chromium sem interface, e o `@storybook/addon-a11y` com `a11y: { test: 'error' }` faz qualquer violação do axe reprovar o teste. Foi confirmado com uma story de propósito quebrada: botão sem nome (`button-name`) e texto cinza-claro (`color-contrast`) reprovaram.
- **Fonte do texto:** fica a **Atkinson Hyperlegible original**, que é a do design aprovado. A spec abria a porta para a versão Next, mas ela muda o desenho das letras, e o grupo aprovou a original. O pacote do Fontsource tem arquivos só com o subconjunto latino (`latin-400.css` e `latin-700.css`), que cobrem á, â, ã, ç, é, ê, í, ó, ô, õ e ú. A Literata vem do Fontsource também. Tudo fica dentro do build, sem Google Fonts.
- **O que foi acertado com o design aprovado:** quatro variantes de botão (`primaria`, `secundaria`, `discreta` e `perigo`) com borda de 2px. O botão de ligar do cartão de emergência é um link do próprio `EmergencyCard`, no plano 3, e não uma variante de botão. A borda de perigo é `#A4221A`. No alto contraste, o confirmar é `#0B3D24` e o fundo de cuidado continua amarelo. A borda sutil é `#D6DFEA`. Entram os estilos de texto `botao` e `rotulo`, a barra lateral dos avisos (6px, ou 10px no alto contraste), `radius-total`, `max-w-medida` (65ch) e `shadow-flutuante`. As sombras padrão do Tailwind ficam desligadas ("bordas em vez de sombras").
- **Nomes do espaçamento:** a numeração segue a do Tailwind (`p-6` = 24px). O artifact numera de 1 a 8 (`space-5` = 24px). Os valores são os mesmos.
- **Escala dos títulos com o A+:** cada título é `calc(parte fixa em px + parte em rem)`. Assim o título 1 vai de 34px (texto em 100%) a 40px (140%), enquanto o corpo vai de 18px a 25,2px.
- **Tema de alto contraste:** `data-contraste="alto"` no `<html>` liga o tema. `prefers-contrast: more` também liga, a menos que a pessoa tenha escolhido `data-contraste="padrao"` de propósito.
- **Versão do Vitest fixada em 5.1.1:** o pnpm 11 recusa versões publicadas há menos de um dia (`minimumReleaseAge`), e isso fazia o `vitest` e o `@vitest/browser` saírem em versões diferentes. Fixar as três dependências do Vitest na mesma versão resolve.
- **Fora deste plano:** a geração do cliente da API a partir do OpenAPI e o `needs:` do job Python ficam para a frente 2 (o app) e para a #23. O GitHub Pages também fica de fora: a spec deixou como opcional, e o Storybook sai como artefato do CI.

## Arquivos

```
frontend/
├── package.json               scripts da raiz e ferramentas de lint
├── pnpm-workspace.yaml        pacotes do workspace e builds permitidos
├── tsconfig.base.json         TypeScript strict compartilhado
├── eslint.config.js           ESLint com jsx-a11y (strict), hooks e Storybook
├── .gitignore
├── .changeset/                config do Changesets
└── packages/
    ├── tokens/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── scripts/build.mjs              Style Dictionary → dist/
    │   ├── src/tokens/primitivos/cor.json valores brutos (nunca viram CSS)
    │   ├── src/tokens/primitivos/base.json espaço, raio, foco, duração, fontes
    │   ├── src/tokens/temas/padrao.json   camada semântica do tema padrão
    │   ├── src/tokens/temas/alto-contraste.json
    │   ├── src/contraste.ts               fórmula WCAG 2.x
    │   ├── src/pares-contraste.json       pares texto/fundo e a meta de cada um
    │   └── test/contraste.test.ts
    └── ui/
        ├── package.json
        ├── tsconfig.json
        ├── vitest.config.ts               projetos "unit" (jsdom) e "storybook" (Chromium)
        ├── .storybook/main.ts
        ├── .storybook/preview.tsx         temas, A+ e axe em modo de erro
        └── src/
            ├── index.ts
            ├── styles/index.css           Tailwind + tokens + fontes + foco
            ├── test/setup.ts
            └── components/
                ├── Button/        Button.tsx, .test.tsx, .stories.tsx, index.ts
                ├── IconButton/    idem
                └── VisuallyHidden/ idem
.github/workflows/ci.yml       ganha o job "frontend"
docs/design-system.md          corrige um valor de contraste da tabela
```

---

### Tarefa 0: Preparar a branch

- [ ] **Passo 1: Conferir onde você está**

O plano e a implementação sobem juntos num PR só, a partir da branch `feat/design-system-base`. A execução roda num worktree criado a partir dela, e quem coordena junta o worktree de volta na `feat/design-system-base` no fim.

```bash
git log --oneline -3   # o commit mais recente traz os planos em docs/superpowers/plans/
ls docs/superpowers/plans/2026-11-26-design-system-1-base.md
ls frontend 2>/dev/null || echo "sem frontend ainda: ok"
```

Esperado: o plano existe e ainda não há `frontend/`. Não crie outra branch nem faça push.

- [ ] **Passo 2: Conferir as ferramentas**

```bash
node -v   # v22 ou mais nova (o CI usa a 24)
pnpm -v   # 11.x. Se não tiver: corepack enable && corepack prepare pnpm@11.3.0 --activate
```

---

### Tarefa 1: Workspace da raiz

**Arquivos:**
- Criar: `frontend/package.json`, `frontend/pnpm-workspace.yaml`, `frontend/tsconfig.base.json`, `frontend/.gitignore`

- [ ] **Passo 1: Criar `frontend/package.json`**

```json
{
  "name": "bula-clara-frontend",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.3.0",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "eslint .",
    "storybook": "pnpm --filter @bula-clara/ui storybook",
    "build-storybook": "pnpm --filter @bula-clara/ui build-storybook"
  },
  "devDependencies": {
    "@changesets/cli": "^3.0.3",
    "@eslint/js": "^10.0.1",
    "eslint": "^9.39.5",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-storybook": "^10.6.8",
    "globals": "^17.14.0",
    "typescript": "~6.0.3",
    "typescript-eslint": "^8.74.0"
  }
}
```

- [ ] **Passo 2: Criar `frontend/pnpm-workspace.yaml`**

O `allowBuilds` libera o script de instalação do esbuild, que o pnpm 11 bloqueia por padrão. A pasta `apps/*` já fica declarada para o app da frente 2.

```yaml
packages:
  - "packages/*"
  - "apps/*"

allowBuilds:
  esbuild: true
```

- [ ] **Passo 3: Criar `frontend/tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

- [ ] **Passo 4: Criar `frontend/.gitignore`**

```gitignore
node_modules/
dist/
storybook-static/
*.log
```

- [ ] **Passo 5: Instalar e conferir**

```bash
cd frontend
pnpm install
```

Esperado: termina com `Done in …` e cria `pnpm-lock.yaml`. O `pnpm-lock.yaml` é versionado.

- [ ] **Passo 6: Commit**

```bash
git add frontend/package.json frontend/pnpm-workspace.yaml frontend/tsconfig.base.json frontend/.gitignore frontend/pnpm-lock.yaml
git commit -m "chore: cria o workspace do frontend (#25)"
```

---

### Tarefa 2: Arquivos de tokens

**Arquivos:**
- Criar: `frontend/packages/tokens/package.json`, `frontend/packages/tokens/tsconfig.json`
- Criar: `frontend/packages/tokens/src/tokens/primitivos/cor.json`, `.../primitivos/base.json`
- Criar: `frontend/packages/tokens/src/tokens/temas/padrao.json`, `.../temas/alto-contraste.json`

Os tokens têm três camadas. Os **primitivos** ficam em `primitivo.*` e nunca viram CSS. Os **semânticos** (`color.*`, `borda.*`) mudam de valor entre os temas. Os **de base** (espaço, raio, foco, duração, fontes) são iguais nos dois temas. Os tokens de componente entram no plano 2, quando os primeiros componentes precisarem deles.

- [ ] **Passo 1: Criar `frontend/packages/tokens/package.json`**

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
    "./alto-contraste.json": "./dist/alto-contraste.json"
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

- [ ] **Passo 2: Criar `frontend/packages/tokens/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": ["node"] },
  "include": ["src", "test", "scripts"]
}
```

- [ ] **Passo 3: Criar `src/tokens/primitivos/cor.json`**

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
      }
    }
  }
}
```

- [ ] **Passo 4: Criar `src/tokens/primitivos/base.json`**

```json
{
  "space": {
    "$type": "dimension",
    "1": {
      "$value": "4px"
    },
    "2": {
      "$value": "8px"
    },
    "3": {
      "$value": "12px"
    },
    "4": {
      "$value": "16px"
    },
    "6": {
      "$value": "24px"
    },
    "8": {
      "$value": "32px"
    },
    "12": {
      "$value": "48px"
    },
    "16": {
      "$value": "64px"
    }
  },
  "radius": {
    "$type": "dimension",
    "aviso": {
      "$value": "4px"
    },
    "controle": {
      "$value": "8px"
    },
    "painel": {
      "$value": "16px"
    },
    "total": {
      "$value": "999px"
    }
  },
  "tamanho": {
    "$type": "dimension",
    "alvo-toque": {
      "$value": "48px"
    },
    "foco-contorno": {
      "$value": "3px"
    },
    "foco-afastamento": {
      "$value": "2px"
    },
    "foco-halo": {
      "$value": "4px"
    },
    "medida": {
      "$value": "65ch"
    }
  },
  "duracao": {
    "$type": "duration",
    "rapida": {
      "$value": "150ms"
    },
    "media": {
      "$value": "250ms"
    }
  },
  "font": {
    "familia": {
      "$type": "fontFamily",
      "voz": {
        "$value": "'Literata Variable', Georgia, serif"
      },
      "texto": {
        "$value": "'Atkinson Hyperlegible', system-ui, sans-serif"
      }
    },
    "peso": {
      "$type": "fontWeight",
      "regular": {
        "$value": 400
      },
      "semibold": {
        "$value": 600
      },
      "bold": {
        "$value": 700
      }
    },
    "tamanho": {
      "$type": "dimension",
      "$description": "Títulos crescem menos que o corpo com o A+: parte fixa em px + parte em rem. Em 100% (16px) e 140% (22,4px) dão os valores do comentário.",
      "titulo-1": {
        "$value": "calc(19px + 0.9375rem)",
        "$description": "34px → 40px"
      },
      "resposta": {
        "$value": "calc(13.5px + 0.78125rem)",
        "$description": "26px → 31px"
      },
      "titulo-2": {
        "$value": "calc(11.5px + 0.78125rem)",
        "$description": "24px → 29px"
      },
      "titulo-3": {
        "$value": "calc(8.5px + 0.78125rem)",
        "$description": "21px → 26px"
      },
      "corpo": {
        "$value": "1.125rem",
        "$description": "18px a 100%"
      },
      "apoio": {
        "$value": "1rem",
        "$description": "16px a 100%"
      },
      "botao": {
        "$value": "1.125rem",
        "$description": "18px a 100%"
      },
      "rotulo": {
        "$value": "0.875rem",
        "$description": "14px a 100%. Só palavras curtas, em caixa alta."
      }
    },
    "altura-linha": {
      "$type": "number",
      "titulo-1": {
        "$value": 1.2
      },
      "resposta": {
        "$value": 1.3
      },
      "titulo-2": {
        "$value": 1.25
      },
      "titulo-3": {
        "$value": 1.3
      },
      "corpo": {
        "$value": 1.5
      },
      "apoio": {
        "$value": 1.45
      },
      "botao": {
        "$value": 1.2
      },
      "rotulo": {
        "$value": 1.3
      }
    },
    "espacamento-letra": {
      "$type": "dimension",
      "rotulo": {
        "$value": "0.06em"
      }
    }
  },
  "sombra": {
    "flutuante": {
      "$value": "0 8px 24px rgba(11, 27, 51, 0.16)",
      "$description": "Só painéis flutuantes (sheet, dialog). O resto usa bordas."
    }
  }
}
```

- [ ] **Passo 5: Criar `src/tokens/temas/padrao.json`**

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

- [ ] **Passo 6: Criar `src/tokens/temas/alto-contraste.json`**

Texto preto puro, ação em `azul.800`, perigo em `vermelho.900` e confirmar em `verde.900`. Os avisos ganham borda inteira de 2px e barra lateral de 10px. O fundo de cuidado continua amarelo, como no design aprovado, mas sempre com borda preta.

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

- [ ] **Passo 7: Instalar**

```bash
cd frontend
pnpm install
```

Esperado: `Done in …`, com `style-dictionary` e `vitest` no lockfile.

---

### Tarefa 3: Build dos tokens

**Arquivos:**
- Criar: `frontend/packages/tokens/scripts/build.mjs`

O script roda o Style Dictionary uma vez por tema e junta o resultado em quatro arquivos:
- `dist/tokens.css`: as variáveis `--bc-*`. O tema padrão fica no `:root`, o alto contraste fica em `[data-contraste='alto']` e dentro de `@media (prefers-contrast: more)`, e as durações vão a 0ms com `prefers-reduced-motion`.
- `dist/tailwind.css`: o bloco `@theme inline` do Tailwind v4. Ele aponta para as variáveis, então trocar o tema no `<html>` troca as classes sem gerar outro CSS. A paleta e as fontes padrão do Tailwind são zeradas (`--color-*: initial`), o que impede o uso de qualquer cor fora dos tokens.
- `dist/padrao.json` e `dist/alto-contraste.json`: os valores resolvidos de cada tema, usados pelo teste de contraste.

- [ ] **Passo 1: Criar `scripts/build.mjs`**

```js
// Gera dist/tokens.css, dist/tailwind.css e um JSON plano por tema.
// Os primitivos nunca viram CSS: só os tokens semânticos e de base saem do build.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import StyleDictionary from 'style-dictionary';

const PREFIXO = 'bc';
const TEMAS = ['padrao', 'alto-contraste'];
const SEM_PRIMITIVOS = (token) => token.path[0] !== 'primitivo';
const DE_TEMA = (token) => SEM_PRIMITIVOS(token) && token.filePath.includes('/temas/');
const DE_BASE = (token) => SEM_PRIMITIVOS(token) && !token.filePath.includes('/temas/');

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

async function gerar(tema) {
  const sd = new StyleDictionary({
    source: ['src/tokens/primitivos/*.json', `src/tokens/temas/${tema}.json`],
    usesDtcg: true,
    log: { verbosity: 'silent' },
    platforms: {
      saida: {
        buildPath: 'dist/tmp/',
        files: [
          { destination: `${tema}.json`, format: 'bc/json-plano', filter: SEM_PRIMITIVOS },
          { destination: `${tema}.tema.css`, format: 'bc/css-bloco', filter: DE_TEMA },
          { destination: `${tema}.base.css`, format: 'bc/css-bloco', filter: DE_BASE },
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
  const ler = (arquivo) => readFile(`dist/tmp/${arquivo}`, 'utf8');
  return { json: await ler(`${tema}.json`), tema: await ler(`${tema}.tema.css`), base: await ler(`${tema}.base.css`) };
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
const [padrao, alto] = await Promise.all(TEMAS.map(gerar));

const css = `/* Gerado por scripts/build.mjs. Não edite à mão. */
:root {
${padrao.base}${padrao.tema}}

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
  duracao: 'duration',
  sombra: 'shadow',
  'font.espacamento-letra': 'tracking',
  'tamanho.medida': 'container-medida',
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

- [ ] **Passo 2: Rodar o build**

```bash
cd frontend
pnpm --filter @bula-clara/tokens build
```

Esperado: `tokens gerados em dist/`.

- [ ] **Passo 3: Conferir a saída**

```bash
grep -c -- '--bc-' packages/tokens/dist/tokens.css
grep -- '--bc-color-action-primary:' packages/tokens/dist/tokens.css
grep -- 'primitivo' packages/tokens/dist/tokens.css || echo "sem primitivos: ok"
grep -- '--text-titulo-1--line-height' packages/tokens/dist/tailwind.css
```

Esperado: um número acima de 90, `--bc-color-action-primary: #1351B4;` (tema padrão) e `--bc-color-action-primary: #0C326F;` (as duas cópias do alto contraste), `sem primitivos: ok` e a linha de altura de linha do título 1.

- [ ] **Passo 4: Commit**

```bash
git add frontend/packages/tokens frontend/pnpm-lock.yaml
git commit -m "feat: tokens do design system com temas padrão e alto contraste (#25)"
```

---

### Tarefa 4: Teste de contraste

**Arquivos:**
- Criar: `frontend/packages/tokens/test/contraste.test.ts`
- Criar: `frontend/packages/tokens/src/pares-contraste.json`
- Criar: `frontend/packages/tokens/src/contraste.ts`

Cada par diz qual token é o texto (ou a borda), qual é o fundo e a meta. A meta é 7:1 para texto de corpo e todo texto de segurança, 4,5:1 para o resto do texto e 3:1 para bordas e contornos que identificam um controle. O teste roda todos os pares nos dois temas.

- [ ] **Passo 1: Escrever o teste**

```ts
import { describe, expect, it } from 'vitest';
import { contraste } from '../src/contraste';
import pares from '../src/pares-contraste.json';
import padrao from '../dist/padrao.json';
import altoContraste from '../dist/alto-contraste.json';

describe('contraste()', () => {
  it('dá 21:1 entre preto e branco', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('dá 1:1 para a mesma cor', () => {
    expect(contraste('#1351B4', '#1351B4')).toBeCloseTo(1, 5);
  });

  it('bate com o valor da spec para o azul de ação', () => {
    expect(contraste('#1351B4', '#FFFFFF')).toBeCloseTo(7.33, 2);
  });

  it('recusa cor fora do formato #RRGGBB', () => {
    expect(() => contraste('azul', '#FFFFFF')).toThrow('cor inválida');
  });
});

const temas: Record<string, Record<string, string | number>> = {
  padrao,
  'alto-contraste': altoContraste,
};

describe.each(Object.entries(temas))('tema %s', (_nome, tokens) => {
  it.each(pares)('$uso: $texto sobre $fundo atinge $minimo:1', ({ texto, fundo, minimo }) => {
    const corTexto = tokens[texto];
    const corFundo = tokens[fundo];
    expect(corTexto, `token ${texto} não existe`).toBeTypeOf('string');
    expect(corFundo, `token ${fundo} não existe`).toBeTypeOf('string');
    expect(contraste(String(corTexto), String(corFundo))).toBeGreaterThanOrEqual(minimo);
  });
});

describe('tema alto-contraste', () => {
  it('usa texto preto puro (21:1)', () => {
    expect(contraste(String(altoContraste['color.text.default']), '#FFFFFF')).toBeCloseTo(21, 2);
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
cd frontend
pnpm --filter @bula-clara/tokens test
```

Esperado: FAIL, porque `../src/contraste` e `../src/pares-contraste.json` ainda não existem (`Failed to resolve import`).

- [ ] **Passo 3: Criar `src/pares-contraste.json`**

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
  }
]
```

- [ ] **Passo 4: Criar `src/contraste.ts`**

```ts
// Razão de contraste da WCAG 2.x: (L1 + 0,05) / (L2 + 0,05), com L a luminância relativa.
function canal(valor8bits: number): number {
  const c = valor8bits / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const limpo = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) throw new Error(`cor inválida: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => canal(parseInt(limpo.slice(i, i + 2), 16))) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (escuro + 0.05);
}
```

- [ ] **Passo 5: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/tokens test
```

Esperado: `Tests  47 passed (47)`.

- [ ] **Passo 6: Provar que o teste pega uma cor fraca**

Troque, só para testar, o `cinza.700` em `src/tokens/primitivos/cor.json` de `#40506A` para `#9AA5B5` e rode de novo:

```bash
pnpm --filter @bula-clara/tokens test
```

Esperado: FAIL em `texto de apoio: color.text.muted sobre color.surface.default atinge 4.5:1` e em `apoio dentro de aviso neutro`. Volte o valor para `#40506A` e confira que os 47 passam.

- [ ] **Passo 7: Conferir os tipos**

```bash
pnpm --filter @bula-clara/tokens typecheck
```

Esperado: sai sem erro. (Ele precisa do `dist/`, que o `test` já gerou.)

- [ ] **Passo 8: Commit**

```bash
git add frontend/packages/tokens
git commit -m "test: teste de contraste WCAG dos tokens nos dois temas (#25)"
```

---

### Tarefa 5: Corrigir um valor da tabela de cores da spec

**Arquivos:**
- Modificar: `docs/design-system.md` (linha do `caution-text` / `caution-bg` / `caution-border` na tabela "Cores do tema padrão")

Recalculando a tabela, a borda `#9E6A00` dá 4,23:1 sobre o fundo `#FFF5C2`. O 4,65:1 da spec é o contraste dela sobre o branco. A cor continua acima da meta de 3:1, então só o número muda.

- [ ] **Passo 1: Trocar o valor**

Em `docs/design-system.md`, troque:

```
| `caution-text` / `caution-bg` / `caution-border` | `#3D2A00` / `#FFF5C2` / `#9E6A00` | "pede cuidado" | 12,48:1; borda 4,65:1 |
```

por:

```
| `caution-text` / `caution-bg` / `caution-border` | `#3D2A00` / `#FFF5C2` / `#9E6A00` | "pede cuidado" | 12,48:1; borda 4,23:1 sobre o fundo |
```

- [ ] **Passo 2: Commit**

```bash
git add docs/design-system.md
git commit -m "docs: corrige o contraste da borda de cuidado na spec (#25)"
```

---

### Tarefa 6: Pacote `ui`, estilos e testes de unidade

**Arquivos:**
- Criar: `frontend/packages/ui/package.json`, `frontend/packages/ui/tsconfig.json`
- Criar: `frontend/packages/ui/src/styles/index.css`, `frontend/packages/ui/src/test/setup.ts`
- Criar: `frontend/packages/ui/vitest.config.ts` (só o projeto `unit` por enquanto)

- [ ] **Passo 1: Criar `frontend/packages/ui/package.json`**

```json
{
  "name": "@bula-clara/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./styles.css": "./src/styles/index.css"
  },
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build -o storybook-static"
  },
  "dependencies": {
    "@bula-clara/tokens": "workspace:*",
    "@fontsource-variable/literata": "^5.3.0",
    "@fontsource/atkinson-hyperlegible": "^5.3.0",
    "@phosphor-icons/react": "^2.1.10",
    "react": "^19.3.1",
    "react-aria-components": "^1.22.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "^10.6.8",
    "@storybook/addon-docs": "^10.6.8",
    "@storybook/addon-vitest": "^10.6.8",
    "@storybook/react-vite": "^10.6.8",
    "@tailwindcss/vite": "^4.3.5",
    "@testing-library/jest-dom": "^8.0.0",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.13",
    "@types/react": "^19.3.1",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.3.0",
    "@vitest/browser": "5.1.1",
    "@vitest/browser-playwright": "5.1.1",
    "jsdom": "^31.0.1",
    "playwright": "^1.65.1",
    "storybook": "^10.6.8",
    "tailwindcss": "^4.3.5",
    "vite": "^8.3.8",
    "vitest": "5.1.1"
  }
}
```

- [ ] **Passo 2: Criar `frontend/packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vite/client", "@testing-library/jest-dom/vitest"]
  },
  "include": ["src", ".storybook", "vitest.config.ts"]
}
```

- [ ] **Passo 3: Criar `src/styles/index.css`**

A utilidade `foco-visivel` desenha o contorno de 3px em `focus-ring`, afastado 2px, e o halo de 4px em `focus-halo` por fora, com `box-shadow`. O halo também preenche o espaço do afastamento, então o foco fica visível sobre qualquer fundo. O `data-escala` no `<html>` é o controle A+.

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

- [ ] **Passo 4: Criar `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
```

- [ ] **Passo 5: Criar `vitest.config.ts` só com o projeto `unit`**

O projeto `storybook` entra na Tarefa 10.

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
});
```

- [ ] **Passo 6: Instalar**

```bash
cd frontend
pnpm install
pnpm --filter @bula-clara/ui exec playwright install chromium
```

Esperado: `Done in …` e o Chromium baixado. Ele só é usado a partir da Tarefa 10.

---

### Tarefa 7: `Button`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/Button/Button.test.tsx`
- Criar: `frontend/packages/ui/src/components/Button/Button.tsx`
- Criar: `frontend/packages/ui/src/components/Button/index.ts`
- Criar: `frontend/packages/ui/src/index.ts`

Quatro variantes, como no design aprovado: `primaria` (a ação principal, uma por tela), `secundaria` (ações de mesmo peso, como foto e voz), `discreta` (alternativas, como "Digitar o nome") e `perigo` (só "Apagar tudo"). O texto é sempre uma string e diz a ação ("Ouvir resposta", "Apagar tudo"), nunca "OK". O ícone Phosphor opcional fica à esquerda e é escondido do leitor de tela. A área de toque mínima é 48px (`min-h-12`, `min-w-12`). O React Aria cuida do teclado e expõe `data-hovered`, `data-pressed`, `data-focus-visible` e `data-disabled`, que viram variantes do Tailwind.

- [ ] **Passo 1: Escrever o teste**

```tsx
import { Trash } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('aparece como botão com o texto da ação', () => {
    render(<Button>Apagar tudo</Button>);
    expect(screen.getByRole('button', { name: 'Apagar tudo' })).toBeInTheDocument();
  });

  it('chama onPress no clique', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Ouvir resposta</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('chama onPress pelo teclado (Enter e espaço)', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Perguntar</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Perguntar' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('não chama onPress quando desabilitado', async () => {
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Perguntar
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('garante a área de toque mínima de 48px pela classe min-h-12', () => {
    render(<Button>Perguntar</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-12', 'min-w-12');
  });

  it('mostra o ícone sem mudar o nome acessível', () => {
    render(
      <Button variante="perigo" icone={Trash}>
        Apagar tudo
      </Button>,
    );
    const botao = screen.getByRole('button', { name: 'Apagar tudo' });
    expect(botao.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
cd frontend
pnpm --filter @bula-clara/ui test
```

Esperado: FAIL com `Failed to resolve import "./Button"`.

- [ ] **Passo 3: Criar `Button.tsx`**

```tsx
import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

/**
 * - `primaria`: a ação principal da tela (uma por tela).
 * - `secundaria`: ações de mesmo peso, como foto e voz.
 * - `discreta`: alternativas, como "Digitar o nome".
 * - `perigo`: só para "Apagar tudo".
 */
export type ButtonVariante = 'primaria' | 'secundaria' | 'discreta' | 'perigo';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children'> {
  children: string;
  variante?: ButtonVariante;
  /** Ícone Phosphor à esquerda do texto. É decorativo: o texto já diz a ação. */
  icone?: Icon;
  /** Ocupa a largura toda do contêiner. Útil no celular. */
  larguraTotal?: boolean;
}

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

export function Button({
  variante = 'primaria',
  icone: Icone,
  larguraTotal = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={`${base} ${variantes[variante]}${larguraTotal ? ' w-full' : ''}`}
    >
      {Icone ? <Icone size={24} weight="bold" aria-hidden="true" focusable="false" /> : null}
      {children}
    </AriaButton>
  );
}
```

- [ ] **Passo 4: Criar `Button/index.ts` e `src/index.ts`**

`frontend/packages/ui/src/components/Button/index.ts`:

```ts
export { Button, type ButtonProps, type ButtonVariante } from './Button';
```

`frontend/packages/ui/src/index.ts` (as outras linhas entram nas próximas tarefas):

```ts
export * from './components/Button';
```

- [ ] **Passo 5: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui test
```

Esperado: `Tests  6 passed (6)`.

- [ ] **Passo 6: Commit**

```bash
git add frontend/packages/ui frontend/pnpm-lock.yaml
git commit -m "feat: pacote ui com o componente Button (#25)"
```

---

### Tarefa 8: `IconButton`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/IconButton/IconButton.test.tsx`
- Criar: `frontend/packages/ui/src/components/IconButton/IconButton.tsx`
- Criar: `frontend/packages/ui/src/components/IconButton/index.ts`
- Modificar: `frontend/packages/ui/src/index.ts`

O `aria-label` é obrigatório no tipo. O último teste usa `@ts-expect-error`: se alguém deixar o `aria-label` opcional, o `typecheck` quebra ali, porque a diretiva passa a sobrar. O ícone é Phosphor, escondido do leitor de tela. As variantes seguem as do `Button`: a `primaria` é a da caixa de pergunta (câmera e microfone), e a `secundaria` é o padrão.

- [ ] **Passo 1: Escrever o teste**

```tsx
import { Microphone } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('usa o aria-label como nome acessível', () => {
    render(<IconButton aria-label="Perguntar falando" icone={Microphone} />);
    expect(screen.getByRole('button', { name: 'Perguntar falando' })).toBeInTheDocument();
  });

  it('esconde o ícone do leitor de tela', () => {
    render(<IconButton aria-label="Perguntar falando" icone={Microphone} />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('chama onPress no clique', async () => {
    const onPress = vi.fn();
    render(<IconButton aria-label="Perguntar falando" icone={Microphone} onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar falando' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('não compila sem aria-label', () => {
    // @ts-expect-error aria-label é obrigatório; se ficar opcional, o typecheck quebra aqui
    const elemento = <IconButton icone={Microphone} />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
cd frontend
pnpm --filter @bula-clara/ui test
```

Esperado: FAIL com `Failed to resolve import "./IconButton"`.

- [ ] **Passo 3: Criar `IconButton.tsx`**

```tsx
import type { Icon } from '@phosphor-icons/react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

/** Mesmas cores do Button. `primaria` é a usada na caixa de pergunta (câmera e microfone). */
export type IconButtonVariante = 'primaria' | 'secundaria' | 'discreta';

export interface IconButtonProps
  extends Omit<AriaButtonProps, 'className' | 'style' | 'children' | 'aria-label'> {
  /** Obrigatório: é o único nome que o leitor de tela anuncia. */
  'aria-label': string;
  icone: Icon;
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

- [ ] **Passo 4: Criar `IconButton/index.ts` e exportar**

`frontend/packages/ui/src/components/IconButton/index.ts`:

```ts
export { IconButton, type IconButtonProps, type IconButtonVariante } from './IconButton';
```

Em `frontend/packages/ui/src/index.ts`, acrescente:

```ts
export * from './components/IconButton';
```

- [ ] **Passo 5: Rodar os testes e os tipos**

```bash
pnpm --filter @bula-clara/ui test
pnpm --filter @bula-clara/ui typecheck
```

Esperado: `Tests  10 passed (10)` e o `tsc` sem erro.

- [ ] **Passo 6: Provar que o tipo exige o `aria-label`**

Em `IconButton.tsx`, troque, só para testar, `'aria-label': string;` por `'aria-label'?: string;` e rode `pnpm --filter @bula-clara/ui typecheck`. Esperado: erro `TS2578: Unused '@ts-expect-error' directive` em `IconButton.test.tsx`. Desfaça a troca.

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui
git commit -m "feat: componente IconButton com aria-label obrigatório (#25)"
```

---

### Tarefa 9: `VisuallyHidden`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.test.tsx`
- Criar: `frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.tsx`
- Criar: `frontend/packages/ui/src/components/VisuallyHidden/index.ts`
- Modificar: `frontend/packages/ui/src/index.ts`

- [ ] **Passo 1: Escrever o teste**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('mantém o texto acessível', () => {
    render(
      <button type="button">
        <VisuallyHidden>Abrir a seção 4 da bula</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Abrir a seção 4 da bula' })).toBeInTheDocument();
  });

  it('usa a classe sr-only do Tailwind', () => {
    render(<VisuallyHidden>só para leitor de tela</VisuallyHidden>);
    expect(screen.getByText('só para leitor de tela')).toHaveClass('sr-only');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
cd frontend
pnpm --filter @bula-clara/ui test
```

Esperado: FAIL com `Failed to resolve import "./VisuallyHidden"`.

- [ ] **Passo 3: Criar `VisuallyHidden.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface VisuallyHiddenProps {
  children: ReactNode;
}

/** Texto que só o leitor de tela lê. Continua no fluxo de leitura, mas não aparece na tela. */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className="sr-only">{children}</span>;
}
```

- [ ] **Passo 4: Criar `VisuallyHidden/index.ts` e exportar**

`frontend/packages/ui/src/components/VisuallyHidden/index.ts`:

```ts
export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';
```

O `frontend/packages/ui/src/index.ts` fica assim:

```ts
export * from './components/Button';
export * from './components/IconButton';
export * from './components/VisuallyHidden';
```

- [ ] **Passo 5: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui test
```

Esperado: `Tests  12 passed (12)`.

- [ ] **Passo 6: Commit**

```bash
git add frontend/packages/ui
git commit -m "feat: componente VisuallyHidden (#25)"
```

---

### Tarefa 10: Storybook com axe em cada story

**Arquivos:**
- Criar: `frontend/packages/ui/.storybook/main.ts`, `frontend/packages/ui/.storybook/preview.tsx`
- Modificar: `frontend/packages/ui/vitest.config.ts` (acrescenta o projeto `storybook`)
- Criar: `Button.stories.tsx`, `IconButton.stories.tsx`, `VisuallyHidden.stories.tsx`

O `preview.tsx` põe dois controles na barra do Storybook, "Contraste" e "Texto" (100, 120 e 140%), e aplica `lang="pt-BR"`, `data-contraste` e `data-escala` no `<html>`, do mesmo jeito que o app vai fazer. A telemetria do Storybook fica desligada.

- [ ] **Passo 1: Criar `.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
```

- [ ] **Passo 2: Criar `.storybook/preview.tsx`**

```tsx
import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

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

- [ ] **Passo 3: Trocar o `vitest.config.ts` pela versão com os dois projetos**

```ts
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [tailwindcss(), storybookTest({ configDir: `${dirname}.storybook` })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
```

- [ ] **Passo 4: Criar as stories**

`frontend/packages/ui/src/components/Button/Button.stories.tsx`:

```tsx
import { Camera, Check, SpeakerHigh, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Componentes/Primitivos/Button',
  component: Button,
  args: { children: 'Perguntar', onPress: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primaria: Story = { args: { icone: SpeakerHigh, children: 'Ouvir resposta' } };

export const Secundaria: Story = {
  args: { variante: 'secundaria', icone: Camera, children: 'Fotografar a caixa' },
};

export const Discreta: Story = { args: { variante: 'discreta', children: 'Digitar o nome' } };

export const Perigo: Story = { args: { variante: 'perigo', icone: Trash, children: 'Apagar tudo' } };

export const Desabilitado: Story = { args: { isDisabled: true } };

export const LarguraTotal: Story = {
  args: { larguraTotal: true, icone: Check, children: 'Sim, perguntar sobre ele' },
};

export const FocoPeloTeclado: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Perguntar' })).toHaveFocus();
  },
};
```

`frontend/packages/ui/src/components/IconButton/IconButton.stories.tsx`:

```tsx
import { Camera, Microphone, X } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { IconButton } from './IconButton';

const meta = {
  title: 'Componentes/Primitivos/IconButton',
  component: IconButton,
  args: { onPress: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Microfone: Story = { args: { 'aria-label': 'Perguntar falando', icone: Microphone } };

export const CameraNaCaixaDePergunta: Story = {
  name: 'Câmera na caixa de pergunta',
  args: { 'aria-label': 'Fotografar a caixa', icone: Camera, variante: 'primaria' },
};

export const Fechar: Story = { args: { 'aria-label': 'Fechar', icone: X, variante: 'discreta' } };
```

`frontend/packages/ui/src/components/VisuallyHidden/VisuallyHidden.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { VisuallyHidden } from './VisuallyHidden';

const meta = {
  title: 'Componentes/Primitivos/VisuallyHidden',
  component: VisuallyHidden,
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DentroDeUmLink: Story = {
  args: { children: ' (abre a ficha do remédio)' },
  render: (args) => (
    <a href="#ficha">
      Na bula: seção 4<VisuallyHidden {...args} />
    </a>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Na bula: seção 4 (abre a ficha do remédio)' }),
    ).toBeInTheDocument();
  },
};
```

- [ ] **Passo 5: Rodar os dois projetos**

```bash
cd frontend
pnpm --filter @bula-clara/tokens build
pnpm --filter @bula-clara/ui test
```

Esperado: `Test Files  6 passed (6)` e `Tests  23 passed (23)`, sendo 12 de unidade e 11 de story. Não pode aparecer o aviso `Running mixed versions is not supported`. Se aparecer, as três dependências do Vitest saíram em versões diferentes: confira se estão todas em `5.1.1` no `package.json`.

- [ ] **Passo 6: Provar que o axe reprova violações**

Crie, só para testar, `frontend/packages/ui/src/components/Button/Quebrado.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'Teste/Quebrado' } satisfies Meta;
export default meta;

export const SemNome: StoryObj = {
  render: () => (
    <button type="button">
      <svg width="10" height="10" />
    </button>
  ),
};

export const BaixoContraste: StoryObj = {
  render: () => <p style={{ color: '#ccc' }}>texto fraco</p>,
};
```

```bash
pnpm --filter @bula-clara/ui test
```

Esperado: `Tests  2 failed | 23 passed (25)`, com `Buttons must have discernible text (button-name)` e `Elements must meet minimum color contrast ratio thresholds (color-contrast)`. Apague o arquivo e confira que os 23 voltam a passar.

- [ ] **Passo 7: Abrir o Storybook e olhar**

```bash
pnpm storybook
```

Abra `http://localhost:6006`. Confira:
- os botões em Atkinson Hyperlegible, com o mesmo desenho do `design-system/components/Button/preview.html` das referências;
- o foco pelo teclado (Tab) com contorno escuro e halo amarelo;
- "Contraste → Alto contraste" deixa o botão secundário com texto `#0C326F` e o de perigo com borda `#7A0E06`;
- "Texto → 140%" aumenta o botão e o texto sem cortar nada;
- a aba "Accessibility" sem violações.

Feche com Ctrl+C.

- [ ] **Passo 8: Build estático**

```bash
pnpm build-storybook
grep -rl "googleapis\|gstatic" packages/ui/storybook-static || echo "sem fontes do Google: ok"
```

Esperado: `Storybook build completed successfully` e `sem fontes do Google: ok`.

- [ ] **Passo 9: Commit**

```bash
git add frontend/packages/ui
git commit -m "feat: Storybook com axe em modo de erro nas stories (#25)"
```

---

### Tarefa 11: ESLint

**Arquivos:**
- Criar: `frontend/eslint.config.js`

Usa o `jsx-a11y` no modo `strict`, as regras de hooks do React e as do Storybook.

- [ ] **Passo 1: Criar `frontend/eslint.config.js`**

```js
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/storybook-static/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  jsxA11y.flatConfigs.strict,
  reactHooks.configs.flat.recommended,
  ...storybook.configs['flat/recommended'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
);
```

- [ ] **Passo 2: Rodar**

```bash
cd frontend
pnpm lint
```

Esperado: sai sem nenhum problema. (Se o decorator do `preview.tsx` usasse `useEffect`, a regra `react-hooks/rules-of-hooks` reclamaria. Por isso ele aplica os atributos direto.)

- [ ] **Passo 3: Provar que o `jsx-a11y` está ligado**

Acrescente, só para testar, no fim de `VisuallyHidden.tsx`:

```tsx
export const Teste = () => <img src="x.png" />;
```

Rode `pnpm lint`. Esperado: erro `jsx-a11y/alt-text`. Desfaça.

- [ ] **Passo 4: Commit**

```bash
git add frontend/eslint.config.js
git commit -m "chore: ESLint com jsx-a11y no frontend (#25)"
```

---

### Tarefa 12: Changesets

**Arquivos:**
- Criar: `frontend/.changeset/config.json`, `frontend/.changeset/README.md`

O `pnpm changeset init` é interativo e trava em terminal sem entrada, então os arquivos são criados à mão. Os dois pacotes são privados: o Changesets versiona e escreve o changelog, mas não publica nada no npm.

- [ ] **Passo 1: Criar `frontend/.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "dev",
  "updateInternalDependencies": "patch",
  "ignore": [],
  "privatePackages": { "version": true, "tag": false }
}
```

- [ ] **Passo 2: Criar `frontend/.changeset/README.md`**

```md
# Changesets

Toda mudança em `@bula-clara/tokens` ou `@bula-clara/ui` que alguém vá notar leva um changeset. Rode `pnpm changeset`, escolha os pacotes, o tipo (patch, minor, major) e escreva uma frase dizendo o que mudou para quem usa o pacote.
```

- [ ] **Passo 3: Registrar a primeira versão**

Crie `frontend/.changeset/base-do-design-system.md`:

```md
---
'@bula-clara/tokens': minor
'@bula-clara/ui': minor
---

Primeira versão: tokens dos temas padrão e alto contraste, e os componentes Button, IconButton e VisuallyHidden.
```

- [ ] **Passo 4: Conferir**

```bash
cd frontend
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

- [ ] **Passo 5: Commit**

```bash
git add frontend/.changeset
git commit -m "chore: Changesets nos pacotes do design system (#25)"
```

---

### Tarefa 13: Job `frontend` no CI

**Arquivos:**
- Modificar: `.github/workflows/ci.yml` (acrescenta um job no fim, depois do `testes`)

O job roda os tokens antes do lint e dos tipos, porque o `typecheck` dos tokens e os estilos do `ui` dependem do `dist/`. O Storybook sai como artefato, por 14 dias, para quem quiser baixar e abrir.

- [ ] **Passo 1: Acrescentar o job no fim de `.github/workflows/ci.yml`**

Com a mesma indentação do job `testes` (dois espaços dentro de `jobs:`):

```yaml
  frontend:
    name: Frontend (lint, tipos, testes, axe, Storybook)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v6
        with:
          package_json_file: frontend/package.json

      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Dependências
        run: pnpm install --frozen-lockfile

      - name: Chromium para os testes das stories
        run: pnpm --filter @bula-clara/ui exec playwright install --with-deps chromium

      - name: Tokens (build + teste de contraste)
        run: pnpm --filter @bula-clara/tokens test

      - name: Lint
        run: pnpm lint

      - name: Tipos
        run: pnpm typecheck

      - name: Testes dos componentes e das stories (com axe)
        run: pnpm --filter @bula-clara/ui test

      - name: Build do Storybook
        run: pnpm build-storybook

      - name: Publicar o Storybook como artefato
        uses: actions/upload-artifact@v7
        with:
          name: storybook
          path: frontend/packages/ui/storybook-static
          retention-days: 14
```

- [ ] **Passo 2: Simular o job localmente, a partir de uma instalação limpa**

```bash
cd frontend
rm -rf node_modules packages/*/node_modules packages/tokens/dist packages/ui/storybook-static
pnpm install --frozen-lockfile
pnpm --filter @bula-clara/tokens test
pnpm lint
pnpm typecheck
pnpm --filter @bula-clara/ui test
pnpm build-storybook
```

Esperado: `47 passed` nos tokens, lint e tipos sem erro, `23 passed` no `ui` e `Storybook build completed successfully`.

- [ ] **Passo 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: job do frontend com lint, tipos, testes, axe e Storybook (#25)"
```

---

### Tarefa 14: README do frontend

**Arquivos:**
- Criar: `frontend/README.md`
- Modificar: `README.md` da raiz (uma linha apontando para o frontend)

- [ ] **Passo 1: Criar `frontend/README.md`**

```md
# Frontend do Bula Clara

Aqui fica o design system (e, mais adiante, o app). A spec está em `docs/design-system.md`.

## Pacotes

- `packages/tokens` (`@bula-clara/tokens`): cores, tipografia, espaço e movimento em JSON (formato DTCG). O build gera as variáveis CSS dos temas padrão e alto contraste e o tema do Tailwind.
- `packages/ui` (`@bula-clara/ui`): os componentes, feitos sobre React Aria Components. Cada componente tem o `.tsx`, as stories e os testes na mesma pasta.

## Comandos

Precisa de Node 22 ou mais novo e do pnpm 11 (`corepack enable`).

    pnpm install
    pnpm --filter @bula-clara/ui exec playwright install chromium   # uma vez só
    pnpm --filter @bula-clara/tokens test   # gera os tokens e testa o contraste
    pnpm storybook                          # http://localhost:6006
    pnpm --filter @bula-clara/ui test       # testes de unidade + stories com axe
    pnpm lint
    pnpm typecheck

## Regras

- Componente nunca usa cor, fonte ou sombra fora dos tokens: a paleta, as fontes e as sombras padrão do Tailwind estão desligadas de propósito. Para espaço, raio e tamanho de texto, use as classes que vêm dos tokens (`p-4`, `rounded-controle`, `text-corpo`), mesmo que as padrão do Tailwind ainda funcionem.
- Toda story passa pelo axe. Se o axe reclamar, o teste falha.
- Toda mudança que alguém vá notar leva um changeset (`pnpm changeset`).
- Nada de fonte, script ou serviço de terceiros: as fontes vêm do Fontsource, dentro do build, e a telemetria do Storybook está desligada.
```

- [ ] **Passo 2: Apontar para o frontend no `README.md` da raiz**

Na tabela "Pasta/arquivo" da seção "Arquitetura", acrescente uma linha no fim:

```md
| `frontend/` | design system e interface web ([`frontend/README.md`](frontend/README.md)) |
```

- [ ] **Passo 3: Commit**

```bash
git add frontend/README.md README.md
git commit -m "docs: README do frontend (#25)"
```

---

### Tarefa 15: Verificação final e PR

- [ ] **Passo 1: Rodar tudo uma última vez**

```bash
cd frontend
pnpm --filter @bula-clara/tokens test && pnpm lint && pnpm typecheck && pnpm --filter @bula-clara/ui test && pnpm build-storybook
```

Esperado: tudo passa, como na Tarefa 13.

- [ ] **Passo 2: Conferir que o pytest continua passando**

```bash
cd ..
BULA_RECUPERADOR=tfidf python -m pytest -q
```

Esperado: mesmo resultado de antes (este plano não toca no Python).

- [ ] **Passo 3: PR (não faça nesta execução)**

Quem coordena abre um PR só, depois que os quatro planos estiverem juntos na `feat/design-system-base`, e só com o OK do Matheus. Fica aqui como referência:

```bash
git push -u origin feat/design-system-base
gh pr create --base dev --assignee matheusperillo03 \
  --title "feat: base do design system (tokens, Storybook com axe e CI)" \
  --body "Primeiro dos quatro planos da #25. Traz o plano (docs/superpowers/plans/2026-11-26-design-system-1-base.md) e a implementação dele. Monta o frontend/ com os tokens dos dois temas, o teste de contraste, o Storybook com axe em cada story, o job de CI e os componentes Button, IconButton e VisuallyHidden. O Storybook sai como artefato do CI."
```

O PR não fecha a #25. Ela fecha no fim do plano 4.

---

## Autorrevisão

**Cobertura da spec neste plano:**
- Workspace `frontend/` com `packages/tokens` e `packages/ui`: Tarefas 1, 2 e 6.
- Tokens em três camadas, DTCG → Style Dictionary → CSS + tema do Tailwind v4: Tarefas 2 e 3. Os tokens de componente entram no plano 2.
- Tema padrão e alto contraste (com `prefers-contrast: more` e controle manual): Tarefas 2 e 3.
- Teste automatizado de contraste que falha o build: Tarefa 4.
- Tipografia (Literata e Atkinson Hyperlegible, estilos `botao` e `rotulo` do design aprovado, A+ 100/120/140% com títulos crescendo menos): Tarefas 2, 3 e 6. `hyphens` e `overflow-wrap` dos títulos entram com o `Heading`, no plano 2.
- Foco de 3px com afastamento de 2px e halo de 4px, área de toque de 48px e movimento reduzido: Tarefas 3, 6 e 7.
- Fontes auto-hospedadas e telemetria desligada: Tarefas 6 e 10.
- React Aria Components, `IconButton` com `aria-label` obrigatório no tipo e ícones Phosphor: Tarefas 7 e 8.
- Storybook com axe em cada story, CI falhando em violação: Tarefas 10 e 13.
- ESLint com `jsx-a11y`, typecheck, Vitest e Testing Library: Tarefas 6 a 11.
- Changesets: Tarefa 12.
- Build do Storybook como artefato do CI: Tarefa 13.

**Fica para os próximos planos:** os demais primitivos (plano 2), os componentes do domínio (plano 3), as páginas de documentação, o ADR e o checklist manual (plano 4).
