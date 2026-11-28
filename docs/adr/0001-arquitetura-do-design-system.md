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
