# Design system do Bula Clara

**Data:** 24/11/2026
**Responsável:** Matheus Perillo
**Status:** aprovado no brainstorming, aguardando revisão da spec escrita
**Issue:** #25

## Por que isso existe

Hoje o Bula Clara funciona pela linha de comando e por uma API. Para chegar nas pessoas para quem ele foi pensado (idosos, cuidadores, quem tem baixa visão e quem tem dificuldade de leitura), ele precisa de uma interface. E, como essa interface vai lidar com informação de saúde, ela precisa ser clara, confiável e acessível de verdade, e não só bonita.

Esta spec descreve o design system que sustenta essa interface: a linguagem visual, os tokens, os componentes, o guia de conteúdo e o jeito de garantir acessibilidade. Ela também registra a arquitetura de informação do app, porque é isso que diz quais componentes o design system precisa ter.

A pesquisa de mercado feita antes do design mostrou um espaço vazio. Os produtos brasileiros entregam a bula inteira, sem ajudar a entender (Bulário da ANVISA, bula digital por QR code, apps de bulário), ou ficam presos ao portfólio de um fabricante (chatbots da Cimed e da Medley). Os bons exemplos de UX estão lá fora (NHS, MedlinePlus, Drugs.com, Apple Saúde), mas exigem login, cobram, ou não servem para o Brasil. Ninguém junta bula oficial, linguagem simples, citação da fonte, checagem de interação sem cadastro e voz nos dois sentidos. É esse o lugar do Bula Clara.

## Escopo

O trabalho de interface foi dividido em três frentes. Cada uma tem sua spec, seu plano e suas issues:

1. **Design system (esta spec, issue #25):** tokens, componentes acessíveis, guia de conteúdo, documentação no Storybook e testes.
2. **App PWA:** as telas descritas aqui, montadas com o design system, mais a câmera, a voz e o modo demonstração. Fica para a próxima spec.
3. **Backend para a interface:** as issues #22 (página do remédio e data da bula), #23 (resposta estruturada) e #24 (confirmar foto e voz antes de responder). Ver "Dependências do backend".

O design system não depende do backend para ser construído: os componentes são desenvolvidos e documentados com dados de exemplo no Storybook.

**Fora do escopo agora:** o modo escuro (os tokens ficam preparados, mas a paleta escura não é feita nem validada), o app nativo, a internacionalização para outros idiomas e o logotipo (por enquanto o nome em texto basta).

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Plataforma | Web responsiva, mobile-first, instalável como PWA |
| Stack | Vite + React + TypeScript (strict), React Aria Components, Tailwind v4, Storybook |
| Organização | pnpm workspace em `frontend/`, com `packages/tokens`, `packages/ui` e `apps/web` |
| Direção visual | "H2: institucional com voz humana": a estrutura azul e branca do gov.br, com a frase-resposta em serifa |
| Tipografia | Literata para a voz (resposta e títulos de página) e Atkinson Hyperlegible para todo o resto |
| Acessibilidade | Controle A+ com 3 níveis, tema de alto contraste AAA e movimento reduzido. O modo escuro fica só preparado nos tokens |
| Navegação | Modelo híbrido: cada resposta é uma página completa, com a caixa de pergunta sempre embaixo e sugestões de seguimento |
| Lista de remédios | Fica na sessão por padrão. Só vai para o aparelho com consentimento explícito, e "Apagar tudo" está sempre visível |
| Transparência | Duas camadas: "Como chegamos nesta resposta" para todo mundo, e o trace técnico só no modo demonstração |
| Ficha do remédio | Incluída, e depende da issue #22 |
| Ícones | Phosphor (SVG), no lugar de emoji |

## Arquitetura

```
frontend/                       pnpm workspace · TypeScript strict
├── packages/tokens/            tokens em JSON (formato DTCG) → Style Dictionary
│                               → CSS custom properties + tema do Tailwind v4
├── packages/ui/                componentes (@bula-clara/ui) sobre React Aria Components
│                               cada componente: .tsx, .stories.tsx, .test.tsx
└── apps/web/                   o PWA (vite-plugin-pwa, TanStack Query, React Router)
                                consome só @bula-clara/ui e @bula-clara/tokens
```

- O app só pode usar o que está no design system. Se um componente fizer falta, ele entra primeiro em `packages/ui`. É essa regra que faz o design system amadurecer, em vez de virar uma pasta de componentes soltos.
- **Em desenvolvimento:** o Vite faz proxy de `/api` para o FastAPI em `localhost:8000`, e não é preciso configurar CORS.
- **No deploy:** o FastAPI pode servir o build estático na mesma origem. Fica mais simples e mantém o processamento local.
- **Contrato com a API**, em camadas:
  1. **O contrato nasce no backend.** Todos os endpoints declaram `response_model` com modelos Pydantic (`RespostaPergunta`, `Trecho`, `Interacao`, `Contato`…). Hoje eles devolvem `dict` solto e o OpenAPI não descreve as respostas, então isso entra na #23.
  2. **Uma fonte da verdade e um único comando.** O `scripts/exportar_openapi.py` chama `app.openapi()` sem subir servidor nem carregar modelo (torch, transformers e chromadb só são importados quando usados). O mesmo comando roda no CI e na máquina de quem desenvolve. Nenhum `openapi.json` é versionado, e o código gerado fica no `.gitignore`.
  3. **Cliente gerado com validação em tempo de execução.** `@hey-api/openapi-ts` ou `orval` (escolha no plano) geram os tipos, o cliente HTTP, os schemas zod e os hooks do TanStack Query. Toda resposta é validada com zod ao chegar. Se vier fora do formato, a interface falha de forma segura: mostra "Não consegui montar a resposta com segurança. Pergunte ao farmacêutico." e mantém a faixa de emergência, sem exibir aviso de segurança pela metade.
  4. **O CI barra quebra de contrato.** O job Python exporta o OpenAPI como artefato. O job `frontend` depende dele (`needs:`), gera o cliente e roda typecheck e testes, e o PR falha se o backend mudar algo que o frontend usa.
  5. **Opcional, mais adiante:** `oasdiff` compara o OpenAPI do PR com o da `dev` e comenta as mudanças que quebram compatibilidade.

  A API não é versionada (`/v1`): front e back saem juntos do mesmo repositório e são servidos na mesma origem.
- **Versionamento:** Changesets nos pacotes `tokens` e `ui`.
- **CI:** um job `frontend` em `.github/workflows/ci.yml`, ao lado do pytest, roda lint (ESLint com `jsx-a11y`), typecheck, Vitest, os testes das stories com axe e build. A ferramenta exata dos testes de story (test-runner ou o addon de Vitest do Storybook) é escolhida no plano, conforme a versão atual do Storybook.

## Fundamentos (tokens)

Os tokens têm três camadas. Os **primitivos** são os valores brutos (`blue-600: #1351B4`). Os **semânticos** dão o papel de cada um (`color-action-primary`). Os **de componente** usam os semânticos (`button-primary-bg`). Componentes nunca usam primitivos diretamente. Os temas trocam apenas a camada semântica.

### Cores do tema padrão

Contraste medido pela fórmula WCAG 2.x. A meta é por par texto/fundo: **7:1** para texto de corpo e para todo texto de segurança (avisos, emergência, interação) e **4,5:1** para o resto. Bordas e ícones que identificam um controle pedem pelo menos 3:1.

| Token semântico | Valor | Uso | Contraste |
|---|---|---|---|
| `action-primary` | `#1351B4` | botões, links, chips | 7,33:1 sobre branco |
| `action-primary-strong` | `#0C326F` | hover e pressionado | 12,34:1 |
| `action-primary-subtle` | `#EDF3FC` | fundo de chip (texto do chip em `action-primary-strong`) | 11,07:1 |
| `text-default` | `#0B1B33` | texto | 17,23:1 |
| `text-muted` | `#40506A` | texto de apoio | 8,16:1 |
| `border-field` | `#6B7A90` | bordas de campos | 4,36:1 |
| `border-subtle` | `#D6DEEA` | divisores (decorativos) | n/a |
| `surface-default` | `#FFFFFF` | fundo | n/a |
| `surface-info` | `#F1F4F9` | avisos neutros | texto 15,63:1 |
| `caution-text` / `caution-bg` / `caution-border` | `#3D2A00` / `#FFF5C2` / `#9E6A00` | "pede cuidado" | 12,48:1; borda 4,65:1 |
| `danger-text` / `danger-bg` | `#8A1C12` / `#FDECEA` | "não usar junto" | 8,14:1 |
| `emergency-solid` | `#A4221A` | cartão e botão de emergência | branco sobre ele 7,44:1 |
| `confirm` | `#1A5E3C` | confirmação de ação | 7,75:1 |
| `focus-ring` / `focus-halo` | `#0B1B33` / `#FFD54A` | foco | texto sobre o halo 12,2:1 |

O verde serve só para confirmar ações ("Lista apagada"). Ele nunca indica que um remédio ou uma combinação é segura.

### Tema de alto contraste (AAA)

Ativa sozinho com `prefers-contrast: more` ou por um controle na interface. Texto `#000000` (21:1), ação primária `#0C326F`, perigo `#7A0E06` (11,09:1), bordas pretas de 2px a 3px em todo elemento interativo e em todo aviso, e nenhum fundo colorido sem borda.

### Tipografia

| Papel | Fonte | Tamanho / altura de linha |
|---|---|---|
| Título 1 (nome do remédio, título de página) | Literata 600 | 34 / 1,2 |
| Frase-resposta | Literata 600 | 26 / 1,3 |
| Título 2 | Atkinson Hyperlegible 700 | 24 / 1,25 |
| Título 3 | Atkinson Hyperlegible 700 | 21 / 1,3 |
| Corpo | Atkinson Hyperlegible 400 | 18 / 1,5 |
| Apoio (fonte, metadados) | Atkinson Hyperlegible 400 | 16 / 1,45 |

- Medidas em `rem`, com o texto corrido limitado a 65 caracteres por linha.
- O controle A+ muda a escala da raiz para 100%, 120% ou 140%, e o layout acompanha. Os títulos crescem menos que o corpo (no nível de 140%, o título 1 vai a cerca de 40px, e não a 48px), para que nomes longos caibam na tela.
- A tela nunca pode quebrar nem pedir rolagem horizontal, em nenhum tamanho de texto, a partir de 320px de largura. Para isso, o documento tem `lang="pt-BR"` e os títulos usam `hyphens: auto` e `overflow-wrap: anywhere`: "Hidroclorotiazida" quebra com hífen em vez de vazar.
- **A avaliar no plano:** a Atkinson Hyperlegible Next, versão mais nova e variável da fonte. Se cobrir bem o português (acentos, ç, til), substitui a original.
- As fontes são auto-hospedadas (sem Google Fonts em produção, por privacidade), em subconjunto latino e com `font-display: swap`.

### Espaço, forma e movimento

- **Espaçamento:** 4, 8, 12, 16, 24, 32, 48, 64 px.
- **Raios:** 4 nos avisos, 8 em botões, campos e chips, 16 em painéis.
- **Elevação:** bordas de 1px. Sombra só em painéis flutuantes (sheet, dialog).
- **Área de toque:** mínimo de 48px.
- **Foco:** contorno de 3px em `focus-ring`, com afastamento de 2px e halo de 4px em `focus-halo`. Fica visível sobre qualquer fundo.
- **Movimento:** 150ms e 250ms com ease-out. Com `prefers-reduced-motion`, vira 0ms, sem transições de posição.

## Componentes

### Primitivos (sem conhecimento de domínio)

`Button`, `IconButton`, `LinkButton`, `TextField`, `TextArea`, `SearchField`, `ComboBox`, `Switch`, `Checkbox`, `RadioGroup`, `Disclosure`/`Accordion`, `Dialog`, `Sheet`, `Tabs`, `Tag`/`TagGroup`, `Alert`, `Toast`, `Spinner`, `Skeleton`, `ProgressSteps`, `VisuallyHidden`, `SkipLink`, `Icon`, `Heading`, `Text`, `Prose`.

Regras que valem para todos:
- `IconButton` exige `aria-label`, e o tipo TypeScript não compila sem ele.
- Campos sempre têm rótulo visível. O placeholder nunca faz o papel de rótulo.
- Erros de campo são anunciados por `aria-live`.
- `Alert` comunica o estado da tela. `Toast` só confirma ações e nunca leva informação de segurança.
- `Prose` aplica o limite de 65 caracteres e o ritmo vertical.

### Componentes do domínio

| Componente | Função |
|---|---|
| `AnswerHeadline` | Frase-resposta em Literata |
| `ListenButton` | Toca a resposta pelo `/falar`. Estados: parado, carregando, tocando, pausado |
| `SourceChip` | "Na bula: seção 4". Liga a citação `[n]` ao trecho e abre a ficha do remédio |
| `ProvenanceSeal` | "Bula oficial ANVISA · Losartana, versão de 03/2025". Sem data registrada, mostra "Bula oficial ANVISA · Losartana · data da versão não informada" e nunca inventa uma data |
| `InteractionCallout` | Os três níveis de interação (ver abaixo), com a frase da bula como evidência |
| `EmergencyCard` | Cartão de emergência no estilo do NHS. Mostra o texto e os telefones que o backend manda, na ordem em que vierem (para autolesão, o CVV 188 vem primeiro). No máximo um por tela, sempre no topo |
| `SafetyNotice` | Bloqueios por mudança de dose e grupo especial, cada um com seu tom |
| `EmergencyBar` | Faixa fixa "Emergência? Ligue 192" |
| `MedicationList` | Lista de remédios, interruptor de consentimento e "Apagar tudo" |
| `ReasoningSteps` | "Como chegamos nesta resposta", em linguagem simples |
| `DemoTrace` | Trace técnico dos agentes, só no modo demonstração |
| `InputDock` | Caixa de pergunta fixa com texto, câmera e microfone |
| `CameraCapture` + `OcrConfirm` | Captura da caixa e "Li: Losartana 50 mg. É esse o remédio?" |
| `VoiceRecorder` + `TranscriptConfirm` | Gravação com retorno visual, sonoro e tátil, e "Entendi: … Está certo?" |
| `DisclaimerFooter` | Aviso legal, presente em toda resposta |

**Confirmar antes de agir.** Depois da leitura da foto ou da transcrição da voz, a pessoa sempre confirma o que o sistema entendeu antes de a pergunta ir para a API. Isso reduz o risco de identificar o remédio errado (R3 em `docs/definicoes.md`).

### Níveis de interação

O agente de interações não classifica gravidade. Ele acha, na bula de um remédio, frases que mencionam o outro. Os níveis saem da seção onde a frase foi achada, sem nenhuma inferência:

| Situação no backend | Título | Visual |
|---|---|---|
| Frase encontrada na seção `contraindicacao` ("Quando não devo usar este medicamento?") | **A bula diz para não usar junto** | ícone de proibido, `danger` |
| Frase encontrada na seção `precaucoes_interacoes` ("O que devo saber antes de usar este medicamento?") | **A bula pede cuidado com essa combinação** | ícone de alerta, `caution` |
| Nenhuma frase encontrada para o par | **A bula não fala dessa combinação** | ícone de informação, `info` (nunca verde) |

O terceiro nível sempre traz a frase "Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico." (risco R4).

**Validar antes de fechar o texto.** Uma menção na seção `contraindicacao` nem sempre quer dizer "não use os dois juntos". Pode ser algo como "pacientes com úlcera causada por anti-inflamatórios". Os fixtures de `tests/fixtures/` não têm esse tipo de caso. Antes de o plano do app fixar o texto, é preciso rodar o agente nos pares do gabarito (`data/avaliacao/interacoes.jsonl`) com as bulas reais e conferir o que cai nessa seção. Se aparecerem falsos "não usar junto", o título do primeiro nível passa a ser mais descritivo: **"A bula cita essa combinação em 'Quando não usar'"**, com a ação "Fale com o médico antes de usar os dois juntos". De qualquer forma, a frase da bula sempre aparece como evidência.

### Padrões documentados

Bloco de resposta completo, ficha do remédio, emergência, consentimento, captura de foto, captura de voz, primeira visita (estado vazio) e erros: API fora do ar, remédio fora da base, câmera ou microfone negados, sem conexão.

## Arquitetura de informação do app

Barra inferior com três destinos: **Perguntar**, **Meus remédios** e **Sobre** (privacidade, limites do sistema, contatos de emergência). A faixa de emergência e o controle A+ aparecem em todas as telas.

**Perguntar, na primeira visita:** título, uma frase explicando o que o Bula Clara faz, as entradas por foto e por voz, exemplos de perguntas que podem ser tocados e um atalho para adicionar remédios. A caixa de texto fica no `InputDock`.

**Resposta (página inteira).** As camadas, nesta ordem, cada uma aparecendo só quando há dados:

1. a pergunta feita e os remédios considerados
2. a frase-resposta
3. o botão Ouvir
4. a interação (`InteractionCallout`)
5. a explicação completa com citações `[n]`
6. os chips de seção da bula
7. o selo de procedência
8. "Como chegamos nesta resposta" (recolhido)
9. sugestões de "Perguntar mais"
10. o aviso legal

As respostas anteriores continuam acima, cada uma como um bloco completo.

As sugestões de "Perguntar mais" saem de modelos fixos no frontend, sem LLM: "Como tomar a {remédio}?", "Para que serve a {remédio}?", "E com {outro remédio da lista}?".

**Emergência:** quando `categoria_risco` é `emergencia`, a resposta inteira é substituída pelo `EmergencyCard`. Os outros bloqueios usam `SafetyNotice`.

**O texto de segurança tem uma fonte só: o backend.** As regras de segurança são determinísticas e testadas no `seguranca.py`, como o `docs/etica.md` exige, e a interface não reescreve nem complementa esses textos. Ela recebe a mensagem e a lista de `contatos` e cuida só do layout e dos botões `tel:`. A categoria `emergencia` continua cobrindo intoxicação, overdose e autolesão. O que muda o cartão é o conteúdo que vem do backend: para autolesão, a mensagem acolhedora com o CVV 188 primeiro e sem orientações de intoxicação; para intoxicação, o SAMU, o Disque-Intoxicação e o "enquanto espera".

**Ficha do remédio:** aberta pelo `SourceChip`. Mostra o nome, o selo de procedência, "Ouvir esta página" e as 9 seções da RDC 47/2009 como perguntas, num acordeão com índice. A seção citada vem aberta, e a frase usada vem destacada.

**Nenhum nome de remédio na URL do app.** A ficha abre por estado de navegação (por exemplo `/remedio` com o nome no estado do router), e não por `/remedio/varfarina`. Assim o histórico do navegador de um celular compartilhado não registra quais remédios a pessoa consultou. Pelo mesmo motivo, as respostas da API com dado de saúde levam `Cache-Control: no-store`.

**Meus remédios:** busca tolerante a erro (`ComboBox` com a lista de `/medicamentos`), remoção individual e o interruptor "Lembrar neste aparelho", que começa desligado. "Apagar tudo" fica sempre visível.

**Persistência:** a lista vive em `sessionStorage`. Com o consentimento ligado, passa para `localStorage`. Ao desligar o consentimento, o `localStorage` é limpo na hora. Respostas não são guardadas em lugar nenhum além da memória da página.

**O texto de privacidade precisa ser verdadeiro.** A lista é enviada à API a cada pergunta (`medicamentos_em_uso`), porque é assim que as interações são checadas. Então a interface não pode dizer "nada é enviado para servidores". O texto certo é algo como "Sua lista é usada só para responder esta pergunta e não fica guardada em nenhum servidor". O mesmo cuidado vale para a voz:
- **Fala para texto:** sempre pelo Whisper do backend (`/transcrever`, issue #24). Nunca pela `SpeechRecognition` do navegador, que no Chrome manda o áudio para o Google.
- **Texto para fala:** só com voz que roda no próprio aparelho ou no nosso servidor. O gTTS, que hoje é o padrão do `voz.py`, manda o texto da resposta (com nome de remédio) para o Google, o que fere o `docs/etica.md`. Por isso ele não é usado pela interface, nem como opção com aviso. Há dois caminhos aceitos: o `pyttsx3` (offline) no `/falar`, ou a `speechSynthesis` do navegador **filtrada para vozes com `localService: true`**. Vozes remotas, como a "Google português do Brasil" do Chrome, ficam de fora. A escolha entre os dois é feita na issue #24. Se nenhum dos dois estiver disponível no aparelho, o `ListenButton` não aparece.

**Modo demonstração:** ativado por `?demo=1`. Mostra o `DemoTrace` em cada resposta: agentes, tempos, trechos recuperados, OCR e categoria de risco.

## Conteúdo e voz

A voz é a de um farmacêutico de confiança que trabalha num serviço público: calmo, direto, respeitoso, sem infantilizar ninguém.

1. A mensagem principal vem primeiro, em voz ativa e numa frase. Os detalhes vêm depois.
2. Palavras do dia a dia. O guia traz um glossário de troca ("posologia" vira "como tomar", "contraindicação" vira "quando não usar", "reação adversa" vira "o que pode fazer mal", "concomitante" vira "junto"). O termo técnico só aparece entre parênteses quando ajuda a reconhecer o que está escrito na caixa.
3. Frases curtas, de até cerca de 20 palavras, com um assunto por frase. Números escritos como na embalagem ("50 mg", "a cada 8 horas").
4. Informar e tranquilizar, sem assustar. Vermelho e palavras fortes ficam para perigo real.
5. Toda recusa vem com o próximo passo: "Isso a bula não responde. O farmacêutico pode te ajudar."
6. Honestidade sobre o que não sabemos: "A bula não fala dessa combinação", nunca "é seguro".
7. Tratar por "você", com linguagem neutra de gênero ("Você tem com quem contar", e não "Você não está sozinho(a)").
8. Botões dizem a ação ("Ligar 192", "Apagar tudo", "Sim, perguntar sobre ele"), nunca "OK" ou "Enviar".

**Metas:** índice Flesch adaptado ao português de 50 ou mais (já é meta do `docs/definicoes.md`) e revisão dos textos da interface com o CDC Clear Communication Index.

O guia de conteúdo no Storybook traz o glossário, os textos de cada estado (vazio, carregando, erro, fora da base, permissão negada, sem conexão), os modelos de "Perguntar mais", o texto de consentimento e exemplos de faça e não faça.

## Acessibilidade e qualidade

**Meta:** WCAG 2.2 AA em tudo. AAA no contraste de texto, nas áreas de toque e no tema de alto contraste. Referências brasileiras: ABNT NBR 17225 e eMAG.

| Camada | Garantia |
|---|---|
| Tokens | Um teste recalcula o contraste de cada par texto/fundo declarado nos temas e falha o build se algum cair abaixo da meta |
| Componentes | React Aria cuida de teclado, foco e ARIA. Cada story passa pelo axe nos testes de story do Storybook, e o CI falha em qualquer violação. Os testes usam `getByRole` e `getByLabelText` |
| App | Playwright com `@axe-core/playwright` nas telas principais, nos três tamanhos de texto e no alto contraste. Reflow em 320px de largura (WCAG 1.4.10) |
| Manual | Checklist por componente: VoiceOver no iOS, TalkBack no Android, só teclado e zoom de 200%. O checklist também serve de roteiro para o teste com colegas (#13) |

Regras específicas do projeto:
- Quando a resposta chega, o foco vai para o título dela, e o leitor de tela lê a partir dali. A região `aria-live="polite"` serve só para o status de carregamento ("Lendo a bula da losartana…"), para que a resposta não seja anunciada duas vezes. A emergência usa `role="alert"`.
- Tudo o que é falado também aparece escrito. A gravação de voz avisa por som, vibração e texto quando começa e quando termina.
- Se a câmera ou o microfone forem negados, aparece uma explicação e o caminho alternativo por digitação.
- O service worker guarda só o shell do app. Respostas e lista de remédios nunca entram no cache. Sem conexão, aparece "Sem conexão: preciso da internet para ler a bula".
- **Desempenho:** LCP abaixo de 2,5 s num celular intermediário em 4G e menos de 150 KB de JavaScript inicial (gzip).

## Documentação

O Storybook é o site do design system. O CI gera o build estático como artefato a cada PR, e qualquer pessoa do grupo pode baixar e abrir. Publicar no GitHub Pages depende de um admin da organização ativar o Pages, então fica como passo opcional. Estrutura:

1. **Introdução:** princípios, para quem é, como contribuir
2. **Fundamentos:** cores (com contraste), tipografia, espaçamento, forma, movimento, ícones, temas
3. **Conteúdo e voz**
4. **Componentes:** uso, quando não usar, anatomia, props, estados, acessibilidade, faça e não faça
5. **Padrões**
6. **Changelog** (Changesets)

As decisões de arquitetura desta spec também ficam registradas num ADR curto em `docs/`.

## Conformidade com a ética do projeto

O `docs/etica.md` é uma restrição: o que ferir esse documento não entra, nem como opção com aviso. Na revisão desta spec, ficou assim:

| Ponto | Situação |
|---|---|
| Voz da resposta (gTTS manda o texto para o Google) | Fere o "nenhum envio para API de terceiros". A interface só usa voz offline (`pyttsx3` ou vozes locais do navegador). Ver #24 |
| Fala para texto | Sempre pelo Whisper local do backend, nunca pela `SpeechRecognition` do navegador |
| Lista "Meus remédios" no aparelho | Permitida com consentimento explícito, só no navegador e apagável. Registrada no `docs/etica.md` |
| Fontes | Auto-hospedadas. Nada de Google Fonts em produção |
| Cache do PWA | Só o shell do app. Respostas e lista de remédios nunca vão para o cache |
| Aviso legal | Presente em toda resposta (`DisclaimerFooter`), inclusive nas bloqueadas |
| Segurança antes do LLM | A interface nunca contorna um bloqueio. `categoria_risco` decide o componente (`EmergencyCard` ou `SafetyNotice`) |
| Histórico e cache do navegador | Sem nome de remédio na URL do app e `Cache-Control: no-store` nas respostas da API com dado de saúde |
| Autolesão | Continua na categoria `emergencia`, com mensagem e telefones vindos do backend: CVV 188 primeiro e sem orientações de intoxicação |
| Grupos especiais | Encaminhamento mantido, como definido. Os falsos positivos da regra atual ("comprimidos" casando com `idos`) estão na #26 |

## Dependências do backend

O design system não espera pelo backend, mas o app (frente 2) precisa destas mudanças:

1. **Issue #22:** `GET /medicamentos/{nome}` com as seções da bula, e procedência (fonte e data da bula) nos trechos. Quando não houver data, o campo vem `null`, nunca com uma data inventada. A resposta leva `Cache-Control: no-store`.
2. **Issue #23, resposta estruturada:** hoje `/perguntar` devolve um texto único com alertas, fontes e aviso já colados. A interface precisa receber separadamente:
   - `alertas`
   - `explicacao`: a resposta da LLM com as citações `[n]`
   - os trechos citados
   - as interações com o id da seção (`secao`: `contraindicacao` ou `precaucoes_interacoes`)
   - os pares checados sem menção
   - `categoria_risco`, mantendo `emergencia` para intoxicação, overdose e autolesão
   - `contatos`: lista de telefones para o cartão de emergência, na ordem de prioridade (autolesão: `["188", "192", "08007226001"]`; intoxicação: `["192", "08007226001"]`)
   - `aviso_legal`

   As respostas do `/perguntar` levam `Cache-Control: no-store`.

   Todos os endpoints passam a declarar `response_model` com modelos Pydantic, para que o OpenAPI descreva as respostas e o frontend gere o cliente validado (ver "Contrato com a API").

   A mesma issue cobre a revisão das mensagens de `bula_clara/agentes/seguranca.py` segundo o guia de conteúdo (sem emoji no texto, com linguagem neutra de gênero). A interface escolhe o componente pela `categoria_risco`.
3. **Issue #24, confirmar antes de responder:** hoje uma chamada só com foto ao `/perguntar-multimodal` já monta a pergunta padrão e roda o pipeline inteiro, com LLM e tudo. Com áudio, ele transcreve e responde na mesma requisição. Assim o fluxo "Li: Losartana 50 mg. É esse o remédio?" não tem como acontecer antes da resposta. São precisos dois endpoints só de leitura: `POST /ler-caixa`, que devolve só o resultado do `AgenteLeitorImagem.ler()` (`medicamentos`, `ocr`, `mensagem`), e `POST /transcrever`, que devolve só o resultado do `transcrever()`. Depois da confirmação, o app chama o `/perguntar` normal. A mesma issue troca o texto para fala para uma opção sem terceiros (ver "O texto de privacidade precisa ser verdadeiro").

## Critérios de pronto (frente 1)

- `packages/tokens` gera as CSS custom properties e o tema do Tailwind para os temas padrão e alto contraste, e o teste de contraste passa.
- Todos os componentes listados existem em `packages/ui`, com stories, testes e zero violações de axe.
- O Storybook tem todas as páginas de documentação listadas, e o build dele sai como artefato no CI.
- O job `frontend` do CI roda lint, typecheck, testes, axe e build, e passa.
- O checklist manual de acessibilidade foi feito pelo menos uma vez com VoiceOver ou TalkBack.
