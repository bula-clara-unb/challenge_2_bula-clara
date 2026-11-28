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
