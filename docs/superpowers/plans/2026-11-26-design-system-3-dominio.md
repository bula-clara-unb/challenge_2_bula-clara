# Design system, plano 3 de 4: os componentes do domínio e os Padrões

> **Para quem for executar com agentes:** use a skill `superpowers:subagent-driven-development` (recomendada) ou `superpowers:executing-plans`, tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhar o andamento.
>
> **Commits:** cada tarefa termina com um commit. Commits **locais** no worktree de execução estão autorizados pelo Matheus. **Push e PR, não**: esses esperam o OK dele. As mensagens seguem o padrão do repositório (conventional commits em português, uma linha, citando a #25) e não levam rodapé de co-autoria nem menção a ferramentas de IA. Nunca inclua `.claude/` nem arquivos fora do que a tarefa lista.

**Objetivo:** entregar os 19 componentes do domínio do Bula Clara no `@bula-clara/ui` (os 15 da spec, mais `LoadingStatus` e `CaptureConfirm`, que estão no artifact aprovado), cada um com teste de unidade, stories conferidas pelo axe e página de documentação, e as 8 páginas de Padrões, que juntam os componentes em telas de verdade.

**Arquitetura:** uma tarefa de preparação mexe em tudo o que é compartilhado: tokens de componente novos, a ordem da barra lateral do Storybook, as simulações de voz, câmera e microfone (`src/test/stubs.ts`) e um barrel vazio por grupo. Depois dela, os componentes ficam em quatro grupos independentes (resposta, segurança, entrada e a lista de remédios), que rodam em paralelo, cada um só nas suas pastas. Nenhum grupo importa componente de outro grupo deste plano, só os primitivos dos planos 1 e 2. Os Padrões vêm por último, porque usam os quatro grupos. Os tipos das props são do próprio design system: nada importa o cliente da API, que ainda não existe (#23).

**Stack:** a dos planos 1 e 2, sem dependência nova. `package.json`, lockfile, `vitest.config.ts`, `src/test/setup.ts` e `src/styles/index.css` não mudam. A câmera e o microfone usam `getUserMedia` e `MediaRecorder` do próprio navegador, e a voz da resposta usa `speechSynthesis` (só vozes do aparelho) ou um áudio do nosso servidor.

**Spec:** `docs/design-system.md` ("Componentes do domínio", "Níveis de interação", "Arquitetura de informação do app", "Conteúdo e voz", "Acessibilidade e qualidade" e "Conformidade com a ética"). **Ética:** `docs/etica.md`, que é restrição dura, e os riscos R1 a R4 de `docs/definicoes.md`. **Visual aprovado:** `/Users/matheusperillo/dev/challenge_2_bula-clara/.superpowers/referencias/` (comece pelo `LEIA.md`): `design-system/components/<Nome>/README.md` e `preview.html`, `design-system/components/bundle.css`, as telas em `canvas/*.dc.html` e o protótipo `bula-clara-prototipo.html`. **Issue:** #25.

---

## Os quatro planos

1. **A base:** workspace, tokens, teste de contraste, Storybook com axe, CI e os três primeiros primitivos (`Button`, `IconButton`, `VisuallyHidden`).
2. **Os primitivos restantes.**
3. **Os componentes do domínio** e as páginas de **Padrões** (este plano).
4. **A documentação:** as páginas gerais do Storybook, o ADR e o checklist manual.

Este plano roda depois dos planos 1 e 2. Ele não depende do plano 4: as páginas daqui não importam nada de `src/docs/blocos/`, e os Padrões ficam em `src/docs/5-padroes/`, a pasta que o plano 4 deixou livre.

## Como as tarefas rodam

```
Tarefa 0  preparar o worktree (planos 1 e 2 já aplicados)
Tarefa 1  preparação: tokens, .storybook/preview.tsx, src/test/stubs.ts, barrels, index.ts
             │
             ├── Grupo A  resposta     Tarefas A1 a A9   worktree próprio
             ├── Grupo B  segurança    Tarefas B1 a B5   worktree próprio
             ├── Grupo C  entrada      Tarefas C1 a C7   worktree próprio
             └── Grupo D  lista        Tarefas D1 e D2   worktree próprio
             │
Tarefa 2  juntar os grupos (quem coordena)
Tarefa 3  páginas de Padrões (depende dos quatro grupos)
Tarefa 4  integração final: instalação limpa e a sequência completa (quem coordena)
```

Cada grupo parte do commit da Tarefa 1 e só cria arquivos em `src/components/<Nome>/` dos seus componentes, o seu barrel (`src/grupos/<grupo>.ts`) e o seu changeset. Dentro do Grupo C, `OcrConfirm` e `TranscriptConfirm` usam o `CaptureConfirm`, então as tarefas do grupo rodam na ordem. Nos outros grupos, a ordem é livre.

| Grupo | Componentes | Unidade | Stories |
|---|---|---|---|
| A, resposta | `AnswerHeadline`, `ListenButton`, `SourceChip` (com `SuggestionChip`), `ProvenanceSeal`, `ReasoningSteps`, `DemoTrace`, `DisclaimerFooter`, `LoadingStatus` | 39 | 25 |
| B, segurança | `InteractionCallout`, `EmergencyCard`, `SafetyNotice`, `EmergencyBar` | 20 | 15 |
| C, entrada | `InputDock`, `CaptureConfirm`, `OcrConfirm`, `TranscriptConfirm`, `CameraCapture`, `VoiceRecorder` | 30 | 17 |
| D, lista | `MedicationList` | 8 | 6 |
| Padrões | 8 páginas | 0 | 27 |

Contagens conferidas. As de cada grupo foram medidas num worktree separado, com a preparação e um grupo só, depois de uma instalação `--frozen-lockfile`. As do fim, numa cópia limpa do resultado final:

| | Tokens | `ui` (total) | `ui` (unidade) |
|---|---|---|---|
| Base (planos 1 e 2) | 69 | 174 | 107 |
| Depois da Tarefa 1 | 77 | 174 | 107 |
| Tarefa 1 + Grupo A | 77 | 238 | 146 |
| Tarefa 1 + Grupo B | 77 | 209 | 127 |
| Tarefa 1 + Grupo C | 77 | 221 | 137 |
| Tarefa 1 + Grupo D | 77 | 188 | 115 |
| Os quatro grupos juntos | 77 | 334 | 204 |
| Tudo, com os Padrões | 77 | 361 | 204 |

No fim, o `ui` tem 361 testes: 204 de unidade e 157 stories. As 53 páginas MDX (26 dos primitivos, 19 do domínio e 8 de Padrões, sem contar as do plano 4) passam pelo axe na Tarefa 4.

## Decisões que este plano fecha

Tudo abaixo foi testado numa cópia dos planos 1 e 2 juntos (69 testes nos tokens e 174 no `ui`). Cada garantia de segurança e de privacidade foi quebrada de propósito, uma de cada vez, para confirmar que a checagem reprova (Tarefa 4, Passo 5: 25 quebras, 25 reprovações).

**Gerais**

- **Nomes de componente em inglês, como na spec; props, textos e funções em português**, como nos planos 1 e 2. Toda prop tem comentário `/** … */`, que vira a descrição da tabela do `<ArgTypes>`.
- **Os tipos são locais.** Cada componente declara o formato que recebe (`ContatoDeEmergencia`, `EvidenciaDaBula`, `BulaDeOrigem`, `RemedioDaLista`…). O app converte a resposta da API para eles. Assim o design system não espera a #23.
- **Os dados de exemplo ficam num `exemplos.ts` na pasta do componente** (intoxicação e autolesão, aviso legal, trace, a base de 15 remédios). As stories, os testes e os Padrões usam os mesmos dados. O pacote não exporta esses arquivos.
- **Simulações compartilhadas em `src/test/stubs.ts`** (Tarefa 1): `simularVozes`, `simularSemSinteseDeVoz`, `simularAudio`, `simularCamera` e `simularMicrofone`. Cada uma troca a API do navegador por uma falsa e devolve como desfazer. Elas servem nos testes (jsdom, que não tem essas APIs) e nas stories (o Chromium sem interface trava ou nega a câmera e o microfone, e não tem voz). Nenhuma story nem teste pede permissão de verdade ou chama a rede. Na story, a câmera falsa é um canvas desenhado com "LOSARTANA potássica 50 mg", passado como fluxo de vídeo de verdade (`captureStream`). O arquivo não importa o Vitest, porque as stories também o usam.
- **Tokens de componente novos** (Tarefa 1): `emergencia.*` (fundo, texto e o botão de ligar), `faixa-emergencia.*` e `selo.icone`, com quatro pares de contraste novos. Os tokens passam de 69 para 77 testes.
- **Ordem da barra lateral fixada** por `parameters.options.storySort` no `.storybook/preview.tsx`: Introdução, Fundamentos, Conteúdo e voz, Componentes (Modelo de página, Primitivos, Domínio), Padrões e Changelog. Sem isso, as páginas de componente em `src/components/` viriam antes da Introdução do plano 4.
- **Títulos das stories:** `Componentes/Domínio/<Nome>` e `Padrões/<Nome da página>`.
- **Páginas MDX** com as 10 seções do Modelo de página do plano 4, `<Meta of={Stories}>` e o exemplo principal sob `## Exemplo` (um `h3` de story logo depois do `h1` reprova o `heading-order` do axe). Sem tabela em Markdown e sem nada de `src/docs/blocos/`.
- **Foco quando a resposta chega.** `AnswerHeadline` e `SafetyNotice` põem `tabIndex={-1}` no título e aceitam `focarAoMontar` e `ref`. A região `aria-live="polite"` fica só no `LoadingStatus`, que fica montado o tempo todo e só troca o texto, porque região que já nasce com texto nem sempre é anunciada.

**Segurança e privacidade**

- **`InteractionCallout`: o nível sai só da seção.** A prop é `secao: 'contraindicacao' | 'precaucoes_interacoes' | null`, e não um tom. `contraindicacao` vira perigo, `precaucoes_interacoes` vira cuidado e `null` vira informação. O tom vem do `Alert`, que não tem verde. Com seção, `evidencia` (`frase` e `remedio`) é obrigatória no tipo, e o número da seção sai da própria seção (3 ou 4, RDC 47/2009). O nível "não fala" sempre traz "Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.". Todos os textos ficam em `TEXTOS_DA_INTERACAO`, e o título do primeiro nível, que ainda vai ser validado com as bulas reais, troca numa linha só (o comentário em cima da constante diz o texto alternativo da spec).
- **`EmergencyCard` e `SafetyNotice` mostram só o que recebem.** Título, mensagem e contatos são props, e o componente nunca reordena nem completa. Um teste confere que o texto do cartão é exatamente a soma do que veio. O cartão tem `role="alert"`, e o componente reclama no console se houver dois na tela. Os botões de ligar são links `tel:` com 56px ou mais. O primeiro contato ganha o botão cheio, e os outros, contorno. O componente só agrupa os dígitos do 0800 ("0800 722 6001").
- **`ListenButton` só usa voz sem terceiros.** Com `obterAudio` (o `/falar` do backend), toca o áudio que veio. Sem ele, usa `speechSynthesis` filtrada para vozes com `localService: true` e língua `pt`. Sem nenhum dos dois, não desenha nada. As vozes chegam depois (`voiceschanged`), então a lista entra por `useSyncExternalStore`. Carregando, o botão fica com `aria-disabled` e continua focável. A limpeza (pausar o áudio e cancelar a fala) roda só quando o botão sai da tela: o app costuma passar uma função `obterAudio` nova a cada desenho, e depender dela pararia o áudio no meio sempre que a tela redesenhasse. O `isPending` do React Aria foi descartado: ele anuncia por um nó `role="img"` sem nome que o axe reprova.
- **`VoiceRecorder` só grava.** Usa `MediaRecorder` e entrega o áudio por `onGravacao`, com o tipo dentro do `Blob` (`audio/webm` no Chrome e no Android, `audio/mp4` no iPhone, escolhido por `MediaRecorder.isTypeSupported`). Nunca toca na `SpeechRecognition`: um teste põe armadilhas em `window.SpeechRecognition` e `webkitSpeechRecognition` e confere que ninguém leu. Avisa por som (bipe de 880 Hz ao começar e de 440 Hz ao terminar, com `AudioContext`), vibração e texto. Para sozinho em 30 segundos.
- **`SourceChip` é botão, nunca link.** A ficha abre por estado de navegação, sem o nome do remédio na URL. Um teste confere que `href` não compila.
- **`ProvenanceSeal` nunca inventa data.** Sem versão, escreve "data da versão não informada". Data ISO vira mês e ano por texto, sem `Date`: `new Date('2025-03-01')` em Brasília cai em fevereiro. O teste fixa o fuso em `America/Sao_Paulo`, para valer também no CI, que roda em UTC.
- **`MedicationList` não grava nada.** Recebe a lista, o consentimento e callbacks. Um teste espiona `Storage.prototype.setItem` e confere que nada é gravado. O interruptor começa desligado, com os textos exatos do protótipo, em `TEXTOS_DO_CONSENTIMENTO`. "Apagar tudo" usa `Button variante="perigo"` e confirma com `confirmarAcao('Lista apagada deste aparelho.')`.
- **Confirmar antes de perguntar.** `CaptureConfirm` é uma `Sheet` com o que foi lido como nome. Só "Sim, perguntar…" chama `onConfirmar`, e Esc ou toque fora fecham sem confirmar. `OcrConfirm` e `TranscriptConfirm` são o `CaptureConfirm` com os textos de cada um. Quando nada foi lido ou entendido, a folha oferece tentar de novo ou digitar, e nunca um "sim".
- **Câmera e microfone desligam** quando o componente sai da tela (testado com `stop` nas trilhas). Negados, mostram a explicação e o caminho por digitação, que também está sempre presente.

**Acessibilidade**

- **`InputDock`:** o campo tem rótulo escondido da tela (`sr-only`) e lido pelo leitor de tela; o exemplo nunca é o rótulo. `enterKeyHint="send"`. A barra de navegação é um `nav` "Principal" com links do React Aria (que usam o `RouterProvider` do app) e `aria-current="page"` no destino atual, com 56px de altura e texto de 16px.
- **`MedicationList` cuida do foco.** Ao remover, o foco vai para o próximo item (ou o anterior); com a lista vazia, para a busca. Depois de adicionar, a busca volta vazia e fechada: limpar o texto com a busca em foco reabria a lista com a base inteira, então a busca é remontada (`key`).
- **Troca de variante sem transição.** Quando a câmera ou o microfone são negados, "Digitar o nome" e "Escrever a pergunta" viram o botão principal. O botão é trocado inteiro (`key`), porque a transição de cor passava por um meio-termo sem contraste, que o axe pegou nas páginas de documentação.
- **`DisclaimerFooter` é um parágrafo, e não `footer`.** Fora de `main` ou `section`, o `footer` vira o rodapé da página (`contentinfo`), e cada resposta tem o seu aviso.
- **Cada resposta do histórico é um `article`** no padrão Bloco de resposta, e não uma `section` com nome. Várias regiões "Resposta" na mesma tela confundiriam a navegação por regiões.

## Diferenças em relação à spec e ao visual aprovado

As referências aprovadas valem mais que a spec quando as duas divergem. Ficou assim:

- **Título do `InteractionCallout` com o par.** O preview e a spec têm só o nível ("A bula pede cuidado com essa combinação"). A tela de resposta e o protótipo põem o par na frente quando há mais de um aviso ("Ibuprofeno e metformina: a bula não fala dessa combinação"). O componente põe o par nos três níveis, porque uma resposta pode ter vários avisos e o leitor de tela precisa saber de qual par é cada um. O segundo nome sai em minúsculas, como no protótipo.
- **Ação do primeiro nível:** "Fale com o médico antes. Não pare nenhum remédio por conta própria.", como no preview. A tabela de textos do plano 4 dá "Converse com o farmacêutico…" para os dois primeiros níveis (veja "Para o coordenador").
- **Evidência:** `figure` com `blockquote` e `figcaption` em negrito ("Losartana, seção 4"), e não o `q` em itálico com a fonte na mesma linha. O sentido é o mesmo, e o leitor de tela anuncia a citação.
- **Título do `EmergencyCard` é prop.** O protótipo escolhe o título pela interface ("Ligue agora para o CVV" quando o primeiro contato é 188), o que seria a interface escrevendo texto de segurança. Aqui o título vem de fora, como a mensagem. O botão de ligar segue o protótipo ("Ligar SAMU" e, embaixo, "192"), e não o "Ligar 192 · SAMU" do canvas. A linha "Se a ligação não abrir pelo botão, disque o número direto no telefone." vem do protótipo; é ajuda de uso, e não orientação de saúde.
- **A faixa de emergência fica na tela de emergência.** O `canvas/Emergencia.dc.html` não tem a faixa, mas o README da `EmergencyBar` diz para nunca escondê-la.
- **`EmergencyBar` liga para o 192** (`href="tel:192"`), como diz o README. O protótipo abre uma página "Precisa de ajuda agora?" com os três telefones. A prop `href` deixa o app escolher, sem mudar o texto.
- **`SafetyNotice` tem um tom só.** A spec diz "cada um com seu tom" para dose e grupo especial. O preview e o protótipo usam o mesmo aviso nos dois, e o que muda é o texto que vem do backend. O título tem 21px (`titulo-3`), e não os 19px do `.bc-notice`, que não existem na escala, como no `Alert` do plano 2.
- **`ListenButton`:** "Pausar" não leva `aria-pressed` (o preview leva). Um botão que muda de nome e também de estado pressionado é lido em dobro. Entra o estado pausado ("Continuar"), que o preview não mostra.
- **As citações `[n]` dentro do texto não são links.** Na tela aprovada, elas levam à ficha. Aqui, quem leva é o `SourceChip`, que tem 48px; um número pequeno dentro da frase seria difícil de tocar.
- **`SuggestionChip`** é um nome novo. O README do `SourceChip` diz que o mesmo visual serve para as sugestões; o componente das sugestões ganhou nome próprio para não ter ícone nem número.
- **Selo de procedência com ícone verde**, como no `bundle.css` (`--confirm`). A spec diz que o verde só confirma ação. Fica o visual aprovado, com o token `componente.selo.icone` para trocar numa linha (veja "Pendências").
- **`ReasoningSteps`** usa o `Disclosure` do plano 2 (borda azul quando aberto), e não o `details` do preview.
- **`InputDock`:** texto da barra de navegação em 16px, e não 14px: 14px é pequeno para o público e não cresce bem com o A+. Com texto no campo, o microfone vira o botão "Perguntar", que envia. A referência não tem botão de enviar, e só o Enter enviaria, o que não é óbvio para quem usa pouco o celular. A câmera fica na variante primária, como no canvas.
- **Primeira visita:** "Fotografar a caixa" é o botão primário e "Perguntar falando", o secundário, como no `canvas/Main.dc.html`.
- **`CameraCapture`:** a tela não é toda escura como no `canvas/Foto.dc.html`. Só o visor é escuro, e o resto segue o fundo do app, com os tokens que já existem. A confirmação sobe como `Sheet` por cima do visor, e não como seção dentro dele.
- **`MedicationList`:** "Apagar tudo" aparece quando a lista tem itens, como no protótipo. A spec diz "sempre visível" (veja "Pendências"). O protótipo mostrava um toast "Losartana adicionada", que concorda em gênero com o nome; ele saiu, porque a lista já mostra o item novo e o foco volta para a busca. O toast de apagar leva ponto final ("Lista apagada deste aparelho."), como no plano 4.
- **Ficha do remédio:** o índice é o próprio acordeão, com o rótulo "Nesta bula", como no canvas. A frase citada fica num `mark` com as cores de cuidado, e com o rótulo "Citado na sua resposta", para não depender só da cor.
- **Textos novos**, que não estão nas telas aprovadas nem na página Textos da interface do plano 4, todos com Flesch de 50 ou mais pela conta do `scripts/avaliar.py`: "Não achei uma câmera neste aparelho." (60), "Não achei um microfone neste aparelho." (59), "Se quiser usar a câmera, libere nos ajustes do seu navegador." (68), "Se quiser usar o microfone, libere nos ajustes do seu navegador." (61), "Preparando o microfone…", "Gravação terminada. Vou conferir o que entendi." (52), "Não consegui entender a gravação. Tente falar de novo, mais perto do aparelho, ou escreva a sua pergunta." (75), "Gravar de novo", "Tirar foto", "Não consegui preparar o áudio agora. A resposta continua escrita aqui." (51) e "Modo demonstração: o que os agentes fizeram". A mensagem de foto sem leitura do plano 4 foi dividida em título ("Não consegui ler o nome na foto") e explicação ("Tente com mais luz, ou digite o nome que está na caixa."), porque a folha precisa de um título.

## Pendências

**Decisões do Matheus:**

1. **"Apagar tudo" sempre visível ou só com itens.** A spec e o `docs/etica.md` dizem "sempre visível". O protótipo aprovado mostra só com itens, e é o que o componente faz. Para mostrar sempre, basta tirar a condição `remedios.length > 0` do botão no `MedicationList.tsx` (o teste "só aparece com a lista cheia" muda junto).
2. **Ícone verde no selo de procedência.** O visual aprovado usa verde; a spec diz que verde só confirma ação. Para trocar, `componente.selo.icone` passa a apontar para `{color.text.muted}` em `packages/tokens/src/tokens/componentes/cor.json`.
3. **Botão "Perguntar" no lugar do microfone** quando há texto no campo, e o texto da barra de navegação em 16px.
4. **Título do primeiro nível de interação**, que depende de rodar o agente de interações nos pares do gabarito com as bulas reais (spec, "Validar antes de fechar o texto"). A troca é em `TEXTOS_DA_INTERACAO`.
5. **Texto da interface na tela de emergência.** A regra é que a interface não escreve texto de segurança. O `EmergencyCard` acrescenta dois textos que não vêm do backend: o título "Enquanto espera" (em cima da orientação que vem do backend) e a linha "Se a ligação não abrir pelo botão, disque o número direto no telefone.", que vem do protótipo aprovado. Os dois são ajuda de uso, e não orientação de saúde, mas ficam na tela de emergência. Se o Matheus preferir, a linha sai e o título passa a vir do backend junto com a orientação.

**Backend:**

- **#23 (resposta estruturada):** o `EmergencyCard` precisa de título, mensagem e, para cada contato, número, nome e complemento ("grátis, 24h"). A spec prevê `contatos` só com os números (`["188", "192", "08007226001"]`); ou o backend manda os nomes, ou o app mantém um mapa de número para nome, sem mudar a ordem. O `SafetyNotice` precisa de título e mensagem separados. O `InteractionCallout` precisa, para cada par, da seção (`contraindicacao` ou `precaucoes_interacoes`), da frase e do remédio da bula, e da lista de pares sem menção. O `aviso_legal` ainda começa com emoji, e o `DisclaimerFooter` mostra como vier. Os passos do `ReasoningSteps` e o `DemoTrace` saem do `trace`.
- **#22 (página do remédio):** o `ProvenanceSeal` aceita a versão como "03/2025", "2025-03" ou "2025-03-01", ou `null`. O texto de cada seção da ficha vem do `GET /medicamentos/{nome}`.
- **#24 (confirmar foto e voz):** o `/ler-caixa` devolve o nome lido ou nada (`OcrConfirm` recebe `string | null`). O `/transcrever` precisa aceitar `audio/webm` e `audio/mp4`. O `/falar` devolve um áudio que o `ListenButton` recebe como `Blob` por `obterAudio`. A nota "A foto é usada só para ler o nome e não é guardada" só vale se o `/ler-caixa` não guardar a imagem. A escolha entre `pyttsx3` e as vozes do aparelho também é da #24; o componente aceita as duas.

## API pública

- `AnswerHeadline({ pergunta, consideradosTambem?, children: string, nivel?: 1|2, focarAoMontar?, ref? })`
- `ListenButton({ texto, rotulo? (padrão 'Ouvir resposta'), obterAudio?: (texto) => Promise<Blob> })` e `ehVozPermitida(voz)`
- `SourceChip({ numero?, remedio, secao, onPress })`, `SuggestionChip({ children: string, onPress })`, `sugestoesDePerguntarMais({ remedio: { nome, artigo?: 'a'|'o' }, outros?, pergunta? })` e `SECOES_DA_BULA`
- `ProvenanceSeal({ bulas: { remedio?, versao: string | null }[] })` e `formatarVersao(versao)`
- `ReasoningSteps({ passos, nivelTitulo? })`, `DemoTrace({ etapas, trechos?, ocr?, categoriaRisco? })` e `formatarDuracao(ms)`
- `DisclaimerFooter({ children: string })` e `LoadingStatus({ children?: string })`
- `InteractionCallout({ remedios: [string, string], secao: 'contraindicacao'|'precaucoes_interacoes', evidencia: { frase, remedio } } | { remedios, secao: null })`, com `nivelTitulo?`; e `nivelDaInteracao`, `TEXTOS_DA_INTERACAO`, `NUMERO_DA_SECAO`
- `EmergencyCard({ titulo, mensagem, contatos: { numero, nome, detalhe? }[], enquantoEspera?, nivelTitulo?: 1|2 })` e `formatarTelefone(numero)`
- `SafetyNotice({ titulo, mensagem, acao?: { rotulo, onPress }, nivelTitulo?, focarAoMontar?, ref? })` e `EmergencyBar({ href? (padrão 'tel:192') })`
- `InputDock({ onPerguntar, onAbrirCamera, onGravar, destinoAtual: 'perguntar'|'remedios'|'sobre', enderecos?, rotuloCampo?, exemplo?, mostrarCaixa? })`
- `CaptureConfirm({ isOpen, onOpenChange?, rotulo, titulo, pergunta, rotuloConfirmar, iconeConfirmar?, rotuloCorrigir, nota?, onConfirmar, onCorrigir })`
- `OcrConfirm({ isOpen, onOpenChange?, medicamento: string | null, onConfirmar, onDigitar, onTentarDeNovo })` e `TranscriptConfirm({ isOpen, onOpenChange?, transcricao, onConfirmar, onEscrever, onGravarDeNovo })`
- `CameraCapture({ onFoto: (foto: Blob) => void, onFechar, onDigitar })` e `VoiceRecorder({ onGravacao: (audio: Blob) => void, onFechar, onEscrever, duracaoMaximaMs? (padrão 30000) })`, com `escolherTipoDeAudio()` e `TIPOS_DE_AUDIO`
- `MedicationList({ remedios, opcoes, onAdicionar, onRemover, lembrar, onLembrarChange, onApagarTudo })` e `TEXTOS_DO_CONSENTIMENTO`

## Arquivos

```
frontend/
├── .changeset/
│   ├── dominio-tokens.md                  Tarefa 1
│   ├── dominio-resposta.md                Grupo A
│   ├── dominio-seguranca.md               Grupo B
│   ├── dominio-entrada.md                 Grupo C
│   └── dominio-lista.md                   Grupo D
└── packages/
    ├── tokens/
    │   ├── src/tokens/componentes/cor.json   emergencia, faixa-emergencia, selo
    │   └── src/pares-contraste.json          4 pares novos
    └── ui/
        ├── .storybook/preview.tsx            ordem da barra lateral
        └── src/
            ├── index.ts                      exporta os quatro barrels novos
            ├── test/stubs.ts                 voz, áudio, câmera e microfone simulados
            ├── grupos/resposta.ts seguranca.ts entrada.ts lista.ts
            ├── components/
            │   ├── AnswerHeadline/ ListenButton/ SourceChip/ ProvenanceSeal/
            │   │   ReasoningSteps/ DemoTrace/ DisclaimerFooter/ LoadingStatus/      Grupo A
            │   ├── InteractionCallout/ EmergencyCard/ SafetyNotice/ EmergencyBar/   Grupo B
            │   ├── InputDock/ CaptureConfirm/ OcrConfirm/ TranscriptConfirm/
            │   │   CameraCapture/ VoiceRecorder/                                    Grupo C
            │   └── MedicationList/                                                  Grupo D
            └── docs/5-padroes/                Tarefa 3: 8 pares de .stories.tsx e .mdx
```

Cada pasta de componente tem `<Nome>.tsx`, `<Nome>.test.tsx`, `<Nome>.stories.tsx`, `<Nome>.mdx` e `index.ts`. Algumas têm `exemplos.ts` (dados de exemplo, fora do pacote), e o `SourceChip` tem também `perguntarMais.ts` e `secoes.ts`.

Fora do repositório, só na Tarefa 4: `/tmp/bula-clara-conferir-paginas.mjs` e `/tmp/bula-clara-provas-3.py`.

---

### Tarefa 0: Preparar o worktree

- [ ] **Passo 1: Conferir onde você está**

A execução roda num worktree criado a partir da `feat/design-system-base` com os planos 1 e 2 já aplicados. Quem coordena junta o worktree de volta nela no fim.

```bash
git log --oneline -3
ls frontend/packages/ui/src/components | wc -l   # 27: os 26 primitivos e Campo
ls frontend/packages/ui/src/grupos               # acoes-e-tipografia.ts campos.ts estrutura-e-status.ts sobreposicoes.ts
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

Esperado: `Tests  69 passed (69)` nos tokens e `Tests  174 passed (174)` no `ui`. Se os números forem outros, a base mudou depois deste plano: confira a API pública do plano 2 contra o código antes de seguir.

Todos os comandos das próximas tarefas rodam dentro de `frontend/`. Comandos que podem esperar resposta no terminal levam `< /dev/null`.

---

### Tarefa 1: Preparação

**Arquivos:**
- Modificar: `frontend/packages/tokens/src/tokens/componentes/cor.json`, `frontend/packages/tokens/src/pares-contraste.json`
- Modificar: `frontend/packages/ui/.storybook/preview.tsx`, `frontend/packages/ui/src/index.ts`
- Criar: `frontend/packages/ui/src/test/stubs.ts`
- Criar: `frontend/packages/ui/src/grupos/resposta.ts`, `frontend/packages/ui/src/grupos/seguranca.ts`, `frontend/packages/ui/src/grupos/entrada.ts`, `frontend/packages/ui/src/grupos/lista.ts`
- Criar: `frontend/.changeset/dominio-tokens.md`

Esta tarefa mexe em tudo o que os quatro grupos compartilham, para que eles não precisem mexer. Os arquivos modificados vêm inteiros: substitua o conteúdo todo.

- [ ] **Passo 1: Tokens de componente e pares de contraste**

O cartão de emergência (branco sobre `emergency-solid`, e o botão de ligar em `emergency-solid` sobre branco), a faixa "Emergência? Ligue 192" (`danger-text` sobre `danger-bg`) e o ícone do selo (`confirm`). Cada token aponta para um semântico, então segue o tema de alto contraste sozinho. O par do botão de ligar é novo: o texto vermelho sobre o branco não estava conferido.

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
    },
    "emergencia": {
      "fundo": {
        "$value": "{color.emergency.solid}"
      },
      "texto": {
        "$value": "{color.text.on-solid}"
      },
      "botao-fundo": {
        "$value": "{color.surface.default}"
      },
      "botao-texto": {
        "$value": "{color.emergency.solid}"
      }
    },
    "faixa-emergencia": {
      "fundo": {
        "$value": "{color.danger.bg}"
      },
      "texto": {
        "$value": "{color.danger.text}"
      }
    },
    "selo": {
      "icone": {
        "$value": "{color.confirm}"
      }
    }
  }
}
```

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
  },
  {
    "texto": "componente.emergencia.texto",
    "fundo": "componente.emergencia.fundo",
    "minimo": 7,
    "uso": "texto do cartão de emergência"
  },
  {
    "texto": "componente.emergencia.botao-texto",
    "fundo": "componente.emergencia.botao-fundo",
    "minimo": 7,
    "uso": "botão de ligar do cartão de emergência"
  },
  {
    "texto": "componente.faixa-emergencia.texto",
    "fundo": "componente.faixa-emergencia.fundo",
    "minimo": 7,
    "uso": "faixa \"Emergência? Ligue 192\""
  },
  {
    "texto": "componente.selo.icone",
    "fundo": "color.surface.default",
    "minimo": 3,
    "uso": "ícone do selo de procedência"
  }
]
```

- [ ] **Passo 2: Conferir os tokens**

```bash
pnpm --filter @bula-clara/tokens test
grep -E 'emergencia|selo' packages/tokens/dist/tailwind.css
```

Esperado: `Tests  77 passed (77)` (4 pares novos vezes 2 temas) e sete linhas, de `--color-emergencia-fundo` a `--color-selo-icone`.

- [ ] **Passo 3: Simulações de voz, áudio, câmera e microfone**

Os componentes de voz, câmera e microfone usam APIs que o jsdom não tem e que o Chromium sem interface nega ou não tem (`speechSynthesis` sem vozes, `getUserMedia` negado). Este arquivo troca cada API por uma falsa, controlável pelo teste, e devolve como desfazer. As stories usam o mesmo arquivo no `beforeEach`, por isso ele não importa o Vitest.

`frontend/packages/ui/src/test/stubs.ts`:

```ts
// Simulações de voz, câmera e microfone para testes (jsdom) e stories (Chromium sem interface).
// Nenhuma faz chamada de rede nem pede permissão de verdade. Não importa o vitest, porque as
// stories também usam este arquivo. Cada função devolve outra que desfaz a simulação.

type Desfazer = () => void;

/** Troca uma propriedade (mesmo as que são getters, como window.speechSynthesis) e devolve como desfazer. */
function trocar<T extends object>(alvo: T, nome: string, valor: unknown): Desfazer {
  const original = Object.getOwnPropertyDescriptor(alvo, nome);
  Object.defineProperty(alvo, nome, { configurable: true, writable: true, value: valor });
  return () => {
    if (original) Object.defineProperty(alvo, nome, original);
    else Reflect.deleteProperty(alvo, nome);
  };
}

function juntar(desfazeres: Desfazer[]): Desfazer {
  return () => {
    for (const desfazer of [...desfazeres].reverse()) desfazer();
  };
}

// ---------------------------------------------------------------------------------------------
// Voz do aparelho (speechSynthesis)
// ---------------------------------------------------------------------------------------------

export interface VozFalsa {
  name: string;
  lang: string;
  localService: boolean;
}

/** Vozes de exemplo: uma do próprio aparelho e uma remota, que o ListenButton precisa ignorar. */
export const VOZ_LOCAL: VozFalsa = { name: 'Luciana (no aparelho)', lang: 'pt-BR', localService: true };
export const VOZ_REMOTA: VozFalsa = { name: 'Google português do Brasil', lang: 'pt-BR', localService: false };

class FalaFalsa extends EventTarget {
  text: string;
  lang = '';
  voice: VozFalsa | null = null;
  rate = 1;
  onstart: ((evento: Event) => void) | null = null;
  onend: ((evento: Event) => void) | null = null;
  onerror: ((evento: Event) => void) | null = null;
  onpause: ((evento: Event) => void) | null = null;
  onresume: ((evento: Event) => void) | null = null;

  constructor(text = '') {
    super();
    this.text = text;
  }

  emitir(tipo: 'start' | 'end' | 'error' | 'pause' | 'resume') {
    const evento = new Event(tipo);
    this.dispatchEvent(evento);
    this[`on${tipo}`]?.(evento);
  }
}

export interface VozesSimuladas {
  /** Tudo o que foi mandado falar, em ordem. */
  falas: FalaFalsa[];
  /** Termina a fala atual, como se a leitura tivesse chegado ao fim. */
  terminar: () => void;
  /** Troca as vozes e avisa com voiceschanged, como o navegador faz quando elas carregam. */
  trocarVozes: (vozes: VozFalsa[]) => void;
  desfazer: Desfazer;
}

/**
 * Substitui speechSynthesis e SpeechSynthesisUtterance. A fala começa no próximo ciclo (onstart)
 * e só termina com terminar(). Sem vozes, simula um aparelho sem nenhuma voz.
 */
export function simularVozes(vozesIniciais: VozFalsa[] = [VOZ_LOCAL]): VozesSimuladas {
  let vozes = vozesIniciais;
  const falas: FalaFalsa[] = [];
  let atual: FalaFalsa | null = null;
  const sintese = Object.assign(new EventTarget(), {
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null as ((evento: Event) => void) | null,
    getVoices: () => vozes,
    speak(fala: FalaFalsa) {
      falas.push(fala);
      atual = fala;
      sintese.speaking = true;
      setTimeout(() => fala.emitir('start'), 0);
    },
    pause() {
      if (!atual || sintese.paused) return;
      sintese.paused = true;
      atual.emitir('pause');
    },
    resume() {
      if (!atual || !sintese.paused) return;
      sintese.paused = false;
      atual.emitir('resume');
    },
    cancel() {
      const fala = atual;
      atual = null;
      sintese.speaking = false;
      sintese.paused = false;
      fala?.emitir('error');
    },
  });
  const terminar = () => {
    const fala = atual;
    atual = null;
    sintese.speaking = false;
    sintese.paused = false;
    fala?.emitir('end');
  };
  const trocarVozes = (novas: VozFalsa[]) => {
    vozes = novas;
    const evento = new Event('voiceschanged');
    sintese.dispatchEvent(evento);
    sintese.onvoiceschanged?.(evento);
  };
  const desfazer = juntar([
    trocar(window, 'speechSynthesis', sintese),
    trocar(window, 'SpeechSynthesisUtterance', FalaFalsa),
  ]);
  return { falas, terminar, trocarVozes, desfazer };
}

/** Simula um navegador sem speechSynthesis nenhuma (alguns navegadores embutidos não têm). */
export function simularSemSinteseDeVoz(): Desfazer {
  return juntar([trocar(window, 'speechSynthesis', undefined), trocar(window, 'SpeechSynthesisUtterance', undefined)]);
}

// ---------------------------------------------------------------------------------------------
// Áudio vindo do servidor (HTMLAudioElement)
// ---------------------------------------------------------------------------------------------

export interface AudioSimulado {
  /** Quantas vezes play() foi chamado. */
  tocou: () => number;
  /** Termina o áudio atual (dispara "ended"). */
  terminar: () => void;
  desfazer: Desfazer;
}

/** Substitui play/pause dos elementos de mídia e URL.createObjectURL. Nada é decodificado. */
export function simularAudio(): AudioSimulado {
  const tocados: HTMLMediaElement[] = [];
  const prototipo = HTMLMediaElement.prototype;
  const desfazer = juntar([
    trocar(prototipo, 'play', function (this: HTMLMediaElement) {
      tocados.push(this);
      setTimeout(() => this.dispatchEvent(new Event('playing')), 0);
      return Promise.resolve();
    }),
    trocar(prototipo, 'pause', function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('pause'));
    }),
    trocar(URL, 'createObjectURL', () => 'blob:simulado'),
    trocar(URL, 'revokeObjectURL', () => undefined),
  ]);
  return {
    tocou: () => tocados.length,
    terminar: () => tocados.at(-1)?.dispatchEvent(new Event('ended')),
    desfazer,
  };
}

// ---------------------------------------------------------------------------------------------
// Câmera e microfone (getUserMedia e MediaRecorder)
// ---------------------------------------------------------------------------------------------

export type ResultadoDaPermissao = 'permitir' | 'negar' | 'sem-dispositivo';

export interface TrilhaFalsa {
  kind: 'audio' | 'video';
  parada: boolean;
  stop: () => void;
}

export interface MidiaSimulada {
  /** Quantas vezes getUserMedia foi chamado. */
  pedidos: () => number;
  /** Trilhas entregues até agora. Servem para conferir que tudo foi desligado. */
  trilhas: TrilhaFalsa[];
  desfazer: Desfazer;
}

function erroDeMidia(resultado: ResultadoDaPermissao) {
  return resultado === 'negar'
    ? new DOMException('Permissão negada', 'NotAllowedError')
    : new DOMException('Nenhum dispositivo', 'NotFoundError');
}

function fluxoFalso(trilhas: TrilhaFalsa[]) {
  return {
    getTracks: () => trilhas,
    getAudioTracks: () => trilhas.filter((t) => t.kind === 'audio'),
    getVideoTracks: () => trilhas.filter((t) => t.kind === 'video'),
  };
}

function trilhaFalsa(kind: 'audio' | 'video'): TrilhaFalsa {
  const trilha: TrilhaFalsa = {
    kind,
    parada: false,
    stop: () => {
      trilha.parada = true;
    },
  };
  return trilha;
}

/**
 * Câmera falsa. No Chromium, entrega um fluxo de verdade, desenhado num canvas com o nome de um
 * remédio, para o <video> funcionar sem pedir permissão. No jsdom, entrega um objeto parecido com
 * MediaStream e faz o canvas devolver uma imagem vazia.
 */
export function simularCamera(resultado: ResultadoDaPermissao = 'permitir'): MidiaSimulada {
  let pedidos = 0;
  const trilhas: TrilhaFalsa[] = [];
  const desfazeres: Desfazer[] = [];
  const temCaptura = typeof HTMLCanvasElement.prototype.captureStream === 'function';
  if (!temCaptura) {
    desfazeres.push(
      trocar(HTMLCanvasElement.prototype, 'getContext', () => ({ drawImage: () => undefined })),
      trocar(HTMLCanvasElement.prototype, 'toBlob', function (callback: BlobCallback, tipo?: string) {
        callback(new Blob(['foto simulada'], { type: tipo ?? 'image/png' }));
      }),
    );
  }
  const getUserMedia = async () => {
    pedidos++;
    if (resultado !== 'permitir') throw erroDeMidia(resultado);
    if (temCaptura) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const contexto = canvas.getContext('2d');
      if (contexto) {
        contexto.fillStyle = '#F1F4F9';
        contexto.fillRect(0, 0, 640, 480);
        contexto.fillStyle = '#0B1B33';
        contexto.font = 'bold 56px sans-serif';
        contexto.fillText('LOSARTANA', 140, 230);
        contexto.font = '40px sans-serif';
        contexto.fillText('potássica 50 mg', 170, 290);
      }
      const fluxo = canvas.captureStream(5);
      for (const trilha of fluxo.getTracks()) {
        const espia = trilhaFalsa('video');
        const pararDeVerdade = trilha.stop.bind(trilha);
        trilha.stop = () => {
          espia.stop();
          pararDeVerdade();
        };
        trilhas.push(espia);
      }
      return fluxo;
    }
    const trilha = trilhaFalsa('video');
    trilhas.push(trilha);
    return fluxoFalso([trilha]);
  };
  desfazeres.push(trocarMediaDevices(getUserMedia));
  return { pedidos: () => pedidos, trilhas, desfazer: juntar(desfazeres) };
}

function trocarMediaDevices(getUserMedia: () => Promise<unknown>): Desfazer {
  return trocar(navigator, 'mediaDevices', { getUserMedia });
}

export interface MicrofoneSimulado extends MidiaSimulada {
  /** Gravações que chegaram ao fim, com o tipo de áudio escolhido. */
  gravacoes: { tipo: string }[];
  /** Quantas vezes o aparelho vibrou. */
  vibracoes: () => number;
}

/**
 * Microfone falso: getUserMedia, MediaRecorder e navigator.vibrate. `tiposAceitos` diz o que
 * MediaRecorder.isTypeSupported aceita (o Safari do iPhone grava audio/mp4, não webm).
 */
export function simularMicrofone(
  resultado: ResultadoDaPermissao = 'permitir',
  tiposAceitos: string[] = ['audio/webm;codecs=opus', 'audio/webm'],
): MicrofoneSimulado {
  let pedidos = 0;
  let vibracoes = 0;
  const trilhas: TrilhaFalsa[] = [];
  const gravacoes: { tipo: string }[] = [];

  class GravadorFalso extends EventTarget {
    static isTypeSupported(tipo: string) {
      return tiposAceitos.includes(tipo);
    }
    state: 'inactive' | 'recording' = 'inactive';
    mimeType: string;
    ondataavailable: ((evento: Event & { data: Blob }) => void) | null = null;
    onstart: ((evento: Event) => void) | null = null;
    onstop: ((evento: Event) => void) | null = null;
    constructor(_fluxo: unknown, opcoes?: { mimeType?: string }) {
      super();
      this.mimeType = opcoes?.mimeType ?? '';
    }
    start() {
      this.state = 'recording';
      const evento = new Event('start');
      this.dispatchEvent(evento);
      this.onstart?.(evento);
    }
    stop() {
      if (this.state === 'inactive') return;
      this.state = 'inactive';
      const dados = Object.assign(new Event('dataavailable'), {
        data: new Blob(['áudio simulado'], { type: this.mimeType || 'audio/webm' }),
      });
      this.dispatchEvent(dados);
      this.ondataavailable?.(dados);
      gravacoes.push({ tipo: this.mimeType });
      const fim = new Event('stop');
      this.dispatchEvent(fim);
      this.onstop?.(fim);
    }
  }

  const getUserMedia = async () => {
    pedidos++;
    if (resultado !== 'permitir') throw erroDeMidia(resultado);
    const trilha = trilhaFalsa('audio');
    trilhas.push(trilha);
    return fluxoFalso([trilha]);
  };
  const desfazer = juntar([
    trocarMediaDevices(getUserMedia),
    trocar(window, 'MediaRecorder', GravadorFalso),
    trocar(navigator, 'vibrate', () => {
      vibracoes++;
      return true;
    }),
  ]);
  return { pedidos: () => pedidos, trilhas, gravacoes, vibracoes: () => vibracoes, desfazer };
}
```

- [ ] **Passo 4: Ordem da barra lateral**

O `preview.tsx` do plano 2 já importa o `docs.css`. Entra o `storySort`, para a barra lateral seguir a ordem da spec sem depender do nome das pastas.

`frontend/packages/ui/.storybook/preview.tsx`:

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
    // A ordem da barra lateral segue a da spec, sem depender do nome das pastas.
    options: {
      storySort: {
        order: [
          'Introdução',
          'Fundamentos',
          'Conteúdo e voz',
          'Componentes',
          ['Modelo de página', 'Primitivos', 'Domínio'],
          'Padrões',
          'Changelog',
        ],
      },
    },
  },
};

export default preview;
```

- [ ] **Passo 5: Barrels dos grupos**

Um arquivo vazio não é módulo e o TypeScript reclama (TS2306), então cada barrel começa com `export {};`. Cada grupo troca o seu pelo conteúdo final.

`frontend/packages/ui/src/grupos/resposta.ts`:

```ts
// Grupo A do plano 3: a resposta. Cada componente do grupo entra aqui.
export {};
```

`frontend/packages/ui/src/grupos/seguranca.ts`:

```ts
// Grupo B do plano 3: segurança. Cada componente do grupo entra aqui.
export {};
```

`frontend/packages/ui/src/grupos/entrada.ts`:

```ts
// Grupo C do plano 3: entrada (pergunta, foto e voz). Cada componente do grupo entra aqui.
export {};
```

`frontend/packages/ui/src/grupos/lista.ts`:

```ts
// Grupo D do plano 3: a lista Meus remédios.
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
export * from './grupos/resposta';
export * from './grupos/seguranca';
export * from './grupos/entrada';
export * from './grupos/lista';
```

`frontend/.changeset/dominio-tokens.md`:

```md
---
'@bula-clara/tokens': minor
---

Tokens de componente para o cartão de emergência, a faixa "Emergência? Ligue 192" e o ícone do selo de procedência, com os pares de contraste de cada um.
```

- [ ] **Passo 6: Conferir**

```bash
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui test < /dev/null
```

Esperado: lint e tipos sem erro e `Tests  174 passed (174)`. Nenhum teste novo ainda: as simulações entram em uso nos grupos.

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/tokens/src frontend/packages/ui/.storybook/preview.tsx frontend/packages/ui/src/index.ts frontend/packages/ui/src/test/stubs.ts frontend/packages/ui/src/grupos frontend/.changeset/dominio-tokens.md
git commit -m "feat(ui): preparação dos componentes do domínio (#25)"
```

Os quatro grupos partem deste commit.

---

## Grupo A: a resposta

Oito componentes, sem dependência entre eles. Usam `Heading`, `Text`, `Disclosure`, `Spinner` e o estilo do `Button` (`Button/estilo.ts`), todos do plano 2.

### Tarefa A1: `AnswerHeadline`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.test.tsx`, `frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.tsx`, `frontend/packages/ui/src/components/AnswerHeadline/index.ts`, `frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.stories.tsx`, `frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.mdx`

A pergunta feita, os remédios considerados e a frase-resposta: as camadas 1 e 2 da resposta. A frase é um `Heading` no estilo `resposta` (Literata 26px), com `tabIndex={-1}`, e recebe o foco com `focarAoMontar` ou pelo `ref`. "Considerando também" junta os nomes com "e" (`Intl.ListFormat`) e em minúsculas, como na tela aprovada. O componente não é região `aria-live`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { AnswerHeadline } from './AnswerHeadline';

const frase = 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.';

describe('AnswerHeadline', () => {
  it('mostra a pergunta, os remédios considerados e a frase-resposta como título', () => {
    render(
      <AnswerHeadline pergunta="Posso tomar ibuprofeno com losartana?" consideradosTambem={['Metformina', 'Enalapril']}>
        {frase}
      </AnswerHeadline>,
    );
    expect(screen.getByText('Sua pergunta')).toBeInTheDocument();
    expect(screen.getByText('“Posso tomar ibuprofeno com losartana?”')).toBeInTheDocument();
    expect(screen.getByText('Considerando também: metformina e enalapril')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: frase })).toHaveAttribute('tabindex', '-1');
  });

  it('sem remédios da lista, não fala em "considerando"', () => {
    render(<AnswerHeadline pergunta="Para que serve a losartana?">A losartana serve para tratar a pressão alta.</AnswerHeadline>);
    expect(screen.queryByText(/Considerando/)).not.toBeInTheDocument();
  });

  it('recebe o foco quando a resposta chega e expõe o título por ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <AnswerHeadline pergunta="Posso tomar ibuprofeno com losartana?" focarAoMontar ref={ref} nivel={1}>
        {frase}
      </AnswerHeadline>,
    );
    const titulo = screen.getByRole('heading', { level: 1, name: frase });
    expect(titulo).toHaveFocus();
    expect(ref.current).toBe(titulo);
  });

  it('não é região aria-live (quem anuncia é o LoadingStatus)', () => {
    const { container } = render(<AnswerHeadline pergunta="Posso tomar ibuprofeno com losartana?">{frase}</AnswerHeadline>);
    expect(container.querySelector('[aria-live]')).toBeNull();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/AnswerHeadline/
```

Esperado: FAIL com `Failed to resolve import "./AnswerHeadline"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.tsx`:

```tsx
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { Heading } from '../Heading';
import { Text } from '../Text';

export interface AnswerHeadlineProps {
  /** A pergunta como a pessoa fez (ou como confirmou depois da foto ou da voz). Sai entre aspas. */
  pergunta: string;
  /** Remédios da lista que entraram na checagem, além dos que estão na pergunta. */
  consideradosTambem?: readonly string[];
  /** A frase-resposta: uma frase só, em voz ativa. Nunca afirme segurança. */
  children: string;
  /** 1 quando a resposta é a página; 2 quando está no histórico, abaixo de outras. */
  nivel?: 1 | 2;
  /** Leva o foco à frase-resposta quando ela aparece. O leitor de tela começa a ler dali. */
  focarAoMontar?: boolean;
  /** A frase-resposta, para o app levar o foco na hora certa. */
  ref?: Ref<HTMLHeadingElement>;
}

const lista = new Intl.ListFormat('pt-BR', { type: 'conjunction' });

/**
 * A pergunta feita, os remédios considerados e a frase-resposta em Literata. Quando a resposta
 * chega, o foco vem para cá. A região aria-live fica só no LoadingStatus, para nada ser lido duas vezes.
 */
export function AnswerHeadline({
  pergunta,
  consideradosTambem = [],
  children,
  nivel = 2,
  focarAoMontar = false,
  ref,
}: AnswerHeadlineProps) {
  const refDoTitulo = useRef<HTMLHeadingElement>(null);
  useImperativeHandle(ref, () => refDoTitulo.current as HTMLHeadingElement, []);

  useEffect(() => {
    if (focarAoMontar) refDoTitulo.current?.focus();
  }, [focarAoMontar]);

  return (
    <div className="flex max-w-medida flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Text variante="rotulo">Sua pergunta</Text>
        <Text>“{pergunta}”</Text>
        {consideradosTambem.length > 0 ? (
          <Text variante="apoio">
            Considerando também: {lista.format(consideradosTambem.map((nome) => nome.toLocaleLowerCase('pt-BR')))}
          </Text>
        ) : null}
      </div>
      <Heading nivel={nivel} estilo="resposta" tabIndex={-1} ref={refDoTitulo}>
        {children}
      </Heading>
    </div>
  );
}
```

`frontend/packages/ui/src/components/AnswerHeadline/index.ts`:

```ts
export { AnswerHeadline, type AnswerHeadlineProps } from './AnswerHeadline';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/AnswerHeadline/
```

Esperado: `Tests  4 passed (4)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AnswerHeadline } from './AnswerHeadline';

const meta = {
  title: 'Componentes/Domínio/AnswerHeadline',
  component: AnswerHeadline,
  args: {
    pergunta: 'Posso tomar ibuprofeno com losartana?',
    consideradosTambem: ['Metformina'],
    children: 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.',
  },
} satisfies Meta<typeof AnswerHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

export const RecebeOFoco: Story = {
  name: 'Recebe o foco quando a resposta chega',
  args: { focarAoMontar: true },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('heading', { name: args.children })).toHaveFocus();
  },
};

export const NomeComprido: Story = {
  name: 'Nome comprido com texto em 140%',
  args: {
    pergunta: 'Posso tomar ibuprofeno com hidroclorotiazida?',
    consideradosTambem: [],
    children: 'A bula da hidroclorotiazida pede cuidado com anti-inflamatórios, como o ibuprofeno.',
  },
  globals: { escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/AnswerHeadline/
```

Esperado: `Tests  3 passed (3)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/AnswerHeadline/AnswerHeadline.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './AnswerHeadline.stories';

<Meta of={Stories} />

# AnswerHeadline

A pergunta feita, os remédios considerados e a frase-resposta: as duas primeiras camadas da resposta.

## Exemplo

<Canvas of={Stories.Principal} />

## Quando usar

No topo de cada resposta, uma vez por bloco. Também nas respostas anteriores, que continuam acima, cada uma com o seu.

## Quando não usar

- Em emergência, a resposta inteira vira `EmergencyCard`.
- Em bloqueio por dose ou grupo especial, o título é o do `SafetyNotice`.
- Para título de página que não é resposta ("Meus remédios"), use `Heading` com `nivel={1}`.

## Anatomia

- Rótulo "Sua pergunta", em caixa alta.
- A pergunta, entre aspas.
- "Considerando também: metformina", só quando a lista da pessoa entrou na checagem.
- A frase-resposta, em Literata 26px (estilo `resposta`).

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.RecebeOFoco} />

<Canvas of={Stories.NomeComprido} />

## Acessibilidade

- A frase-resposta é um título (`h2`, ou `h1` quando a resposta é a página) com `tabIndex={-1}`. Quando a resposta chega, o app passa `focarAoMontar` (ou usa o `ref`) e o foco vai para ela. O leitor de tela começa a ler dali.
- O componente não é região `aria-live`. Quem anuncia o carregamento é o `LoadingStatus`, e a resposta não é lida duas vezes.
- O rótulo "Sua pergunta" fica escrito normalmente no código; a caixa alta vem do CSS, para o leitor de tela não soletrar.
- Nomes compridos quebram com hífen no A+ de 140%, sem rolagem lateral.

## Conteúdo

A frase-resposta é uma frase só, em voz ativa, com a mensagem principal primeiro (regra 1 de Conteúdo e voz). Ela nunca afirma segurança. O resto vai para a explicação, logo abaixo.

## Faça e não faça

- Faça: "Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins."
- Não faça: "Pode tomar tranquilo." Nem "É seguro usar os dois juntos."
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/AnswerHeadline
git commit -m "feat(ui): AnswerHeadline com foco na chegada da resposta (#25)"
```

---

### Tarefa A2: `ListenButton`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/ListenButton/ListenButton.test.tsx`, `frontend/packages/ui/src/components/ListenButton/ListenButton.tsx`, `frontend/packages/ui/src/components/ListenButton/index.ts`, `frontend/packages/ui/src/components/ListenButton/ListenButton.stories.tsx`, `frontend/packages/ui/src/components/ListenButton/ListenButton.mdx`

Toca a resposta em voz alta, nos estados parado, carregando, tocando e pausado. Só toca com o áudio de `obterAudio` (o `/falar` do backend) ou com uma voz do aparelho (`localService: true`, língua `pt`). Sem nenhum dos dois, não desenha nada. As vozes do navegador chegam depois do primeiro desenho (`voiceschanged`), por isso entram com `useSyncExternalStore`, usando o nome da voz como valor estável. O áudio usa `new Audio()` no código, e não `<audio>` no JSX, que pediria legenda ao `jsx-a11y`. Ao sair da tela, o áudio para e a fala do aparelho é cancelada, e só nessa hora: um teste redesenha a tela com outra função `obterAudio` no meio da leitura e confere que nada parou. O botão é o `Button` do React Aria com as classes do `Button/estilo.ts`, porque o carregando precisa do círculo dentro do botão.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/ListenButton/ListenButton.test.tsx`:

```tsx
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { simularAudio, simularSemSinteseDeVoz, simularVozes, VOZ_LOCAL, VOZ_REMOTA } from '../../test/stubs';
import { ListenButton } from './ListenButton';

const texto = 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana.';
let desfazer: () => void = () => undefined;
afterEach(() => desfazer());

describe('ListenButton', () => {
  it('não aparece sem voz do aparelho e sem áudio do servidor', () => {
    desfazer = simularVozes([]).desfazer;
    const { container } = render(<ListenButton texto={texto} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ignora vozes remotas e vozes do aparelho em outra língua', () => {
    desfazer = simularVozes([VOZ_REMOTA, { name: 'Samantha', lang: 'en-US', localService: true }]).desfazer;
    const { container } = render(<ListenButton texto={texto} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('não quebra num navegador sem speechSynthesis', () => {
    desfazer = simularSemSinteseDeVoz();
    const { container } = render(<ListenButton texto={texto} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('aparece quando a voz do aparelho termina de carregar', () => {
    const vozes = simularVozes([]);
    desfazer = vozes.desfazer;
    render(<ListenButton texto={texto} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    act(() => vozes.trocarVozes([VOZ_REMOTA, VOZ_LOCAL]));
    expect(screen.getByRole('button', { name: 'Ouvir resposta' })).toBeInTheDocument();
  });

  it('com a voz do aparelho: parado, carregando, tocando, pausado e de volta', async () => {
    const vozes = simularVozes([VOZ_REMOTA, VOZ_LOCAL]);
    desfazer = vozes.desfazer;
    render(<ListenButton texto={texto} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    expect(vozes.falas).toHaveLength(1);
    expect(vozes.falas[0]?.text).toBe(texto);
    expect(vozes.falas[0]?.voice).toBe(VOZ_LOCAL);
    await screen.findByRole('button', { name: 'Pausar' });
    await userEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    act(() => vozes.terminar());
    expect(screen.getByRole('button', { name: 'Ouvir resposta' })).toBeInTheDocument();
  });

  it('mostra "Preparando o áudio…" sem perder o foco enquanto carrega', async () => {
    desfazer = simularAudio().desfazer;
    const obterAudio = vi.fn(() => new Promise<Blob>(() => undefined));
    render(<ListenButton texto={texto} obterAudio={obterAudio} />);
    const botao = screen.getByRole('button', { name: 'Ouvir resposta' });
    await userEvent.click(botao);
    expect(botao).toHaveAccessibleName('Preparando o áudio…');
    expect(botao).toHaveAttribute('aria-disabled', 'true');
    expect(botao).toHaveFocus();
    await userEvent.click(botao);
    expect(obterAudio).toHaveBeenCalledOnce();
  });

  it('com o áudio do servidor, toca o que veio e não usa a voz do aparelho', async () => {
    const vozes = simularVozes();
    const audio = simularAudio();
    desfazer = () => {
      audio.desfazer();
      vozes.desfazer();
    };
    const obterAudio = vi.fn(async () => new Blob(['áudio'], { type: 'audio/wav' }));
    render(<ListenButton texto={texto} rotulo="Ouvir esta página" obterAudio={obterAudio} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir esta página' }));
    expect(obterAudio).toHaveBeenCalledWith(texto);
    await screen.findByRole('button', { name: 'Pausar' });
    expect(audio.tocou()).toBe(1);
    expect(vozes.falas).toHaveLength(0);
    act(() => audio.terminar());
    expect(screen.getByRole('button', { name: 'Ouvir esta página' })).toBeInTheDocument();
  });

  it('continua tocando quando a tela redesenha com outra função obterAudio', async () => {
    const audio = simularAudio();
    desfazer = audio.desfazer;
    const pausar = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    const { rerender } = render(
      <ListenButton texto={texto} obterAudio={async () => new Blob(['áudio'], { type: 'audio/wav' })} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    await screen.findByRole('button', { name: 'Pausar' });
    // O app costuma passar uma função nova a cada desenho (obterAudio={(t) => api.falar(t)}).
    rerender(<ListenButton texto={texto} obterAudio={async () => new Blob(['áudio'], { type: 'audio/wav' })} />);
    expect(pausar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
  });

  it('avisa por escrito quando o servidor não manda o áudio', async () => {
    desfazer = simularAudio().desfazer;
    render(<ListenButton texto={texto} obterAudio={() => Promise.reject(new Error('fora do ar'))} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Não consegui preparar o áudio agora.'));
    expect(screen.getByRole('button', { name: 'Ouvir resposta' })).toBeInTheDocument();
  });

  it('para de falar quando sai da tela', async () => {
    const vozes = simularVozes();
    desfazer = vozes.desfazer;
    const cancelar = vi.spyOn(window.speechSynthesis, 'cancel');
    const { unmount } = render(<ListenButton texto={texto} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ouvir resposta' }));
    cancelar.mockClear();
    unmount();
    expect(cancelar).toHaveBeenCalled();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ListenButton/
```

Esperado: FAIL com `Failed to resolve import "./ListenButton"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/ListenButton/ListenButton.tsx`:

```tsx
import { Pause, Play, SpeakerHigh, type Icon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { classesDeBotao, type ButtonVariante } from '../Button/estilo';

export type EstadoDaLeitura = 'parado' | 'carregando' | 'tocando' | 'pausado';

export interface ListenButtonProps {
  /** O texto que vai ser lido: a frase-resposta e a explicação, sem as citações [n]. */
  texto: string;
  /** O que o botão diz quando está parado. Na ficha do remédio: "Ouvir esta página". */
  rotulo?: string;
  /**
   * Busca o áudio no nosso servidor (o /falar, com voz offline). Quando vem, é ele que toca.
   * Sem ele, o botão usa uma voz do próprio aparelho. Sem nenhum dos dois, o botão não aparece.
   */
  obterAudio?: (texto: string) => Promise<Blob>;
}

/** Só vozes que rodam no aparelho e falam português. Vozes remotas mandam o texto para terceiros. */
export function ehVozPermitida(voz: Pick<SpeechSynthesisVoice, 'localService' | 'lang'>): boolean {
  return voz.localService && /^pt([-_]|$)/i.test(voz.lang);
}

function sintese(): SpeechSynthesis | undefined {
  return typeof window === 'undefined' ? undefined : window.speechSynthesis;
}

function vozDoAparelho(): SpeechSynthesisVoice | undefined {
  return sintese()
    ?.getVoices()
    .find((voz) => ehVozPermitida(voz));
}

// As vozes chegam depois (voiceschanged). O nome da voz é o "retrato" estável para o React.
function assinarVozes(avisar: () => void) {
  const s = sintese();
  s?.addEventListener('voiceschanged', avisar);
  return () => s?.removeEventListener('voiceschanged', avisar);
}
const nomeDaVoz = () => vozDoAparelho()?.name ?? null;
const semVozNoServidor = () => null;

const aparencia: Record<EstadoDaLeitura, { variante: ButtonVariante; icone?: Icon }> = {
  parado: { variante: 'primaria', icone: SpeakerHigh },
  carregando: { variante: 'secundaria' },
  tocando: { variante: 'secundaria', icone: Pause },
  pausado: { variante: 'secundaria', icone: Play },
};

/**
 * Lê a resposta em voz alta, só com voz sem terceiros: a do nosso servidor (obterAudio) ou uma voz
 * do próprio aparelho (speechSynthesis com localService). Nunca gTTS, nunca voz remota.
 */
export function ListenButton({ texto, rotulo = 'Ouvir resposta', obterAudio }: ListenButtonProps) {
  const voz = useSyncExternalStore(assinarVozes, nomeDaVoz, semVozNoServidor);
  const [estado, setEstado] = useState<EstadoDaLeitura>('parado');
  const [falhou, setFalhou] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const endereco = useRef<string | null>(null);
  const falandoNoAparelho = useRef(false);

  // Só ao sair da tela. O app costuma passar uma função obterAudio nova a cada desenho, e depender
  // dela pararia o áudio no meio sempre que a tela redesenhasse.
  useEffect(
    () => () => {
      audio.current?.pause();
      if (endereco.current) URL.revokeObjectURL(endereco.current);
      if (falandoNoAparelho.current) sintese()?.cancel();
    },
    [],
  );

  if (!obterAudio && !voz) return null;

  const terminar = () => {
    setEstado('parado');
    if (endereco.current) URL.revokeObjectURL(endereco.current);
    endereco.current = null;
    audio.current = null;
  };

  async function tocarDoServidor(buscar: (texto: string) => Promise<Blob>) {
    setEstado('carregando');
    try {
      const arquivo = await buscar(texto);
      endereco.current = URL.createObjectURL(arquivo);
      const elemento = new Audio(endereco.current);
      audio.current = elemento;
      elemento.addEventListener('playing', () => setEstado('tocando'));
      elemento.addEventListener('ended', terminar);
      await elemento.play();
    } catch {
      terminar();
      setFalhou(true);
    }
  }

  function tocarNoAparelho() {
    const s = sintese();
    const escolhida = vozDoAparelho();
    if (!s || !escolhida) return;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.voice = escolhida;
    fala.lang = escolhida.lang;
    fala.rate = 0.95;
    fala.onstart = () => setEstado('tocando');
    fala.onend = () => {
      falandoNoAparelho.current = false;
      setEstado('parado');
    };
    fala.onerror = () => {
      falandoNoAparelho.current = false;
      setEstado('parado');
    };
    s.cancel();
    setEstado('carregando');
    falandoNoAparelho.current = true;
    s.speak(fala);
  }

  function aoPressionar() {
    setFalhou(false);
    if (estado === 'parado') {
      if (obterAudio) void tocarDoServidor(obterAudio);
      else tocarNoAparelho();
    } else if (estado === 'tocando') {
      if (audio.current) audio.current.pause();
      else sintese()?.pause();
      setEstado('pausado');
    } else if (estado === 'pausado') {
      if (audio.current) void audio.current.play();
      else sintese()?.resume();
      setEstado('tocando');
    }
  }

  const { variante, icone: Icone } = aparencia[estado];
  const textoDoBotao = {
    parado: rotulo,
    carregando: 'Preparando o áudio…',
    tocando: 'Pausar',
    pausado: 'Continuar',
  }[estado];

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Sem isPending: o React Aria anuncia por um nó role="img" que o axe reprova. Carregando,
          o botão continua focável e só ignora o toque. */}
      <AriaButton
        aria-disabled={estado === 'carregando' ? true : undefined}
        onPress={aoPressionar}
        className={classesDeBotao(variante, false) + ' aria-disabled:cursor-wait'}
      >
        {estado === 'carregando' ? (
          <span
            aria-hidden="true"
            className="size-6 shrink-0 animate-spin rounded-full border-3 border-border-subtle border-t-action-primary motion-reduce:animate-none"
          />
        ) : Icone ? (
          <Icone size={24} weight="bold" aria-hidden="true" focusable="false" />
        ) : null}
        {textoDoBotao}
      </AriaButton>
      <p role="status" className="text-apoio text-text-muted empty:hidden">
        {falhou ? 'Não consegui preparar o áudio agora. A resposta continua escrita aqui.' : ''}
      </p>
    </div>
  );
}
```

`frontend/packages/ui/src/components/ListenButton/index.ts`:

```ts
export { ListenButton, ehVozPermitida, type EstadoDaLeitura, type ListenButtonProps } from './ListenButton';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ListenButton/
```

Esperado: `Tests  10 passed (10)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/ListenButton/ListenButton.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { simularAudio, simularVozes, VOZ_LOCAL, VOZ_REMOTA, type VozesSimuladas } from '../../test/stubs';
import { ListenButton } from './ListenButton';

// Nada toca de verdade: a voz e o áudio são simulados (o Chromium sem interface não tem voz).
let vozes: VozesSimuladas | undefined;

const meta = {
  title: 'Componentes/Domínio/ListenButton',
  component: ListenButton,
  args: { texto: 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.' },
  beforeEach: () => {
    vozes = simularVozes([VOZ_REMOTA, VOZ_LOCAL]);
    return vozes.desfazer;
  },
} satisfies Meta<typeof ListenButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Parado: Story = {};

export const Tocando: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir resposta' }));
    await expect(await canvas.findByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    await expect(vozes?.falas[0]?.voice).toBe(VOZ_LOCAL);
  },
};

export const Pausado: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir resposta' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Pausar' }));
    await expect(canvas.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  },
};

export const Carregando: Story = {
  name: 'Carregando o áudio do servidor',
  args: { obterAudio: () => new Promise<Blob>(() => undefined) },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir resposta' }));
    await expect(canvas.getByRole('button', { name: 'Preparando o áudio…' })).toBeInTheDocument();
  },
};

export const DoServidor: Story = {
  name: 'Áudio do servidor, na ficha',
  args: { rotulo: 'Ouvir esta página', obterAudio: async () => new Blob(['áudio'], { type: 'audio/wav' }) },
  beforeEach: () => simularAudio().desfazer,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvir esta página' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Pausar' })).toBeInTheDocument());
  },
};

export const SemVoz: Story = {
  name: 'Sem voz permitida: não aparece',
  beforeEach: () => {
    vozes?.trocarVozes([VOZ_REMOTA]);
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/ListenButton/
```

Esperado: `Tests  6 passed (6)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/ListenButton/ListenButton.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './ListenButton.stories';

<Meta of={Stories} />

# ListenButton

Lê a resposta (ou a ficha do remédio) em voz alta, sem mandar o texto para ninguém.

## Exemplo

<Canvas of={Stories.Parado} />

## Quando usar

Logo abaixo da frase-resposta ("Ouvir resposta") e abaixo do selo na ficha do remédio ("Ouvir esta página").

## Quando não usar

- Para gravar a pergunta falada, use `VoiceRecorder`.
- Nunca com voz que roda fora do aparelho ou do nosso servidor.

## Anatomia

- Um botão que muda de texto e de ícone a cada estado.
- Uma linha de status, que só aparece se o áudio do servidor falhar.

## De onde vem a voz

Dois caminhos, e só esses dois, como o `docs/etica.md` exige:

1. `obterAudio`: uma função que o app passa e que busca o áudio no nosso `/falar` (voz offline, `pyttsx3`). Quando ela vem, é ela que toca.
2. Sem `obterAudio`, a `speechSynthesis` do navegador, filtrada para vozes com `localService: true` e em português. Vozes remotas, como a "Google português do Brasil" do Chrome, ficam de fora.

Se nenhum dos dois estiver disponível, o componente não desenha nada. O gTTS nunca é usado, nem como opção com aviso. A escolha entre os dois caminhos é da issue #24.

## Props

<ArgTypes of={Stories} />

## Estados

Parado, carregando, tocando e pausado. Ao fim da leitura, volta a parado.

<Canvas of={Stories.Carregando} />

<Canvas of={Stories.Tocando} />

<Canvas of={Stories.Pausado} />

<Canvas of={Stories.SemVoz} />

## Acessibilidade

- É um `button` com o nome do estado atual: "Ouvir resposta", "Preparando o áudio…", "Pausar" e "Continuar".
- Carregando, o botão fica com `aria-disabled` e continua focável, para o foco não se perder. O `isPending` do React Aria não é usado porque o aviso dele cria um nó `role="img"` que o axe reprova.
- Com movimento reduzido, o círculo de carregamento fica parado.
- Tudo o que é falado já está escrito na tela.

## Conteúdo

O botão diz a ação (regra 8). Se o servidor não mandar o áudio, aparece "Não consegui preparar o áudio agora. A resposta continua escrita aqui.".

## Faça e não faça

- Faça: passe o texto sem as citações `[n]`, que soariam estranhas lidas em voz alta.
- Não faça: oferecer uma voz da nuvem "porque soa melhor".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/ListenButton
git commit -m "feat(ui): ListenButton só com voz do aparelho ou do servidor (#25)"
```

---

### Tarefa A3: `SourceChip`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/SourceChip/SourceChip.test.tsx`, `frontend/packages/ui/src/components/SourceChip/SourceChip.tsx`, `frontend/packages/ui/src/components/SourceChip/perguntarMais.ts`, `frontend/packages/ui/src/components/SourceChip/secoes.ts`, `frontend/packages/ui/src/components/SourceChip/index.ts`, `frontend/packages/ui/src/components/SourceChip/SourceChip.stories.tsx`, `frontend/packages/ui/src/components/SourceChip/SourceChip.mdx`

"[1] Na bula: Losartana · seção 4": o chip que liga a citação ao trecho e abre a ficha. É botão, nunca link, para o nome do remédio não ir para a URL. O mesmo visual serve ao `SuggestionChip`, das sugestões de "Perguntar mais" e dos exemplos da primeira visita. As sugestões saem de `sugestoesDePerguntarMais`, com três modelos fixos e sem LLM: "Como tomar a {remédio}?", "Para que serve a {remédio}?" e "E com {outro}?". Com o artigo conhecido, ele concorda; sem ele, a sugestão sai sem artigo. A pasta também traz `SECOES_DA_BULA`, as 9 seções da RDC 47/2009 com as perguntas curtas do plano 4, usadas na ficha do remédio.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/SourceChip/SourceChip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sugestoesDePerguntarMais } from './perguntarMais';
import { SECOES_DA_BULA } from './secoes';
import { SourceChip, SuggestionChip } from './SourceChip';

describe('SourceChip', () => {
  it('liga a citação à seção da bula e abre a ficha pelo botão', async () => {
    const onPress = vi.fn();
    render(<SourceChip numero={1} remedio="Losartana" secao={4} onPress={onPress} />);
    const chip = screen.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' });
    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('é botão, nunca link: o nome do remédio não vai para a URL', () => {
    render(<SourceChip remedio="Varfarina" secao={3} onPress={() => undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('href');
    // @ts-expect-error o chip não aceita href
    const elemento = <SourceChip remedio="Varfarina" secao={3} onPress={() => undefined} href="/remedio/varfarina" />;
    expect(elemento).toBeTruthy();
  });

  it('a sugestão tem o mesmo visual e faz a pergunta', async () => {
    const onPress = vi.fn();
    render(<SuggestionChip onPress={onPress}>Como tomar a losartana?</SuggestionChip>);
    const chip = screen.getByRole('button', { name: 'Como tomar a losartana?' });
    expect(chip).toHaveClass('bg-chip-fundo', 'min-h-12');
    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
  });
});

describe('sugestoesDePerguntarMais', () => {
  it('usa os modelos fixos, com o artigo certo', () => {
    expect(
      sugestoesDePerguntarMais({
        remedio: { nome: 'Losartana', artigo: 'a' },
        outros: ['Paracetamol'],
        pergunta: 'Posso tomar ibuprofeno com losartana?',
      }),
    ).toEqual(['Como tomar a losartana?', 'Para que serve a losartana?', 'E com paracetamol?']);
  });

  it('sem artigo conhecido, sai sem artigo (nunca com o artigo errado)', () => {
    expect(sugestoesDePerguntarMais({ remedio: { nome: 'Omeprazol' } })).toEqual([
      'Como tomar omeprazol?',
      'Para que serve omeprazol?',
    ]);
  });

  it('não repete o assunto da pergunta nem o remédio que já estava nela', () => {
    expect(
      sugestoesDePerguntarMais({
        remedio: { nome: 'Losartana', artigo: 'a' },
        outros: ['Metformina', 'Ibuprofeno'],
        pergunta: 'Como tomar os comprimidos de losartana com ibuprofeno?',
      }),
    ).toEqual(['Para que serve a losartana?', 'E com metformina?']);
  });

  it('nenhuma sugestão fala de dose, troca ou suspensão', () => {
    const todas = sugestoesDePerguntarMais({ remedio: { nome: 'Losartana', artigo: 'a' }, outros: ['Metformina'] });
    for (const sugestao of todas) expect(sugestao).not.toMatch(/dose|parar|trocar|suspender|dobrar/i);
  });

  it('as 9 seções da bula, na ordem', () => {
    expect(SECOES_DA_BULA.map((secao) => secao.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(SECOES_DA_BULA[3]?.pergunta).toBe('O que devo saber antes de usar?');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SourceChip/
```

Esperado: FAIL com `Failed to resolve import "./perguntarMais"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/SourceChip/SourceChip.tsx`:

```tsx
import { FileText } from '@phosphor-icons/react';
import { Button as AriaButton } from 'react-aria-components';

/** Visual do chip (texto azul-escuro sobre azul-claro, 11:1), igual ao da Tag. */
const classesDoChip =
  'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-controle border border-transparent bg-chip-fundo ' +
  'px-3 py-2 text-start text-apoio text-chip-texto transition-colors duration-rapida ease-out ' +
  'data-hovered:border-chip-texto data-pressed:border-chip-texto data-focus-visible:foco-visivel ' +
  'alto-contraste:border-(length:--bc-borda-controle) alto-contraste:border-text-default';

export interface SourceChipProps {
  /** O número da citação na explicação ([1], [2]…). */
  numero?: number;
  /** De qual bula é o trecho ("Losartana"). */
  remedio: string;
  /** Número da seção na bula (1 a 9, RDC 47/2009). */
  secao: number;
  /**
   * Abre a ficha do remédio na seção citada. É um botão, nunca um link: a ficha abre por estado de
   * navegação, sem o nome do remédio na URL.
   */
  onPress: () => void;
}

/** "[1] Na bula: Losartana · seção 4". Liga a citação ao trecho da bula. */
export function SourceChip({ numero, remedio, secao, onPress }: SourceChipProps) {
  return (
    <AriaButton onPress={onPress} className={classesDoChip}>
      <FileText size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
      <span>
        {numero ? `[${numero}] ` : ''}Na bula:{' '}
        <b className="font-bold">
          {remedio} · seção {secao}
        </b>
      </span>
    </AriaButton>
  );
}

export interface SuggestionChipProps {
  /** A pergunta sugerida, saída de um modelo fixo ("Como tomar a losartana?"). */
  children: string;
  /** Faz a pergunta. */
  onPress: () => void;
}

/** Sugestão de "Perguntar mais" e exemplo da primeira visita: o mesmo visual do SourceChip, sem ícone. */
export function SuggestionChip({ children, onPress }: SuggestionChipProps) {
  return (
    <AriaButton onPress={onPress} className={classesDoChip}>
      {children}
    </AriaButton>
  );
}
```

`frontend/packages/ui/src/components/SourceChip/perguntarMais.ts`:

```ts
// Sugestões de "Perguntar mais": modelos fixos, sem LLM.

export interface RemedioDaSugestao {
  /** Nome do remédio ("Losartana"). Sai em minúsculas na pergunta. */
  nome: string;
  /** Artigo que concorda com o nome ("a losartana", "o ibuprofeno"). Sem ele, a sugestão sai sem artigo. */
  artigo?: 'a' | 'o';
}

export interface OpcoesDePerguntarMais {
  /** O remédio principal da resposta. */
  remedio: RemedioDaSugestao;
  /** Outros remédios da lista da pessoa, para "E com…?". */
  outros?: readonly string[];
  /** A pergunta que acabou de ser respondida. Nenhuma sugestão repete o assunto dela. */
  pergunta?: string;
}

function normalizar(texto: string) {
  return texto
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[?!.,]/g, '')
    .trim();
}

/**
 * Monta as sugestões: "Como tomar a {remédio}?", "Para que serve a {remédio}?" e "E com {outro}?".
 * Nenhum modelo pergunta sobre dose, troca ou suspensão, que o backend bloquearia.
 */
export function sugestoesDePerguntarMais({ remedio, outros = [], pergunta = '' }: OpcoesDePerguntarMais): string[] {
  const nome = remedio.nome.toLocaleLowerCase('pt-BR');
  const comArtigo = remedio.artigo ? `${remedio.artigo} ${nome}` : nome;
  const feita = normalizar(pergunta);
  const sugestoes: string[] = [];
  if (!/como (tomar|usar)|como devo/.test(feita)) sugestoes.push(`Como tomar ${comArtigo}?`);
  if (!/para que serve/.test(feita)) sugestoes.push(`Para que serve ${comArtigo}?`);
  for (const outro of outros) {
    const nomeDoOutro = outro.toLocaleLowerCase('pt-BR');
    if (nomeDoOutro !== nome && !feita.includes(normalizar(nomeDoOutro))) sugestoes.push(`E com ${nomeDoOutro}?`);
  }
  return sugestoes;
}
```

`frontend/packages/ui/src/components/SourceChip/secoes.ts`:

```ts
// As 9 seções da bula do paciente (RDC 47/2009), com a pergunta curta usada na ficha do remédio.
// Os textos são os da página Conteúdo e voz/Glossário.

export interface SecaoDaBula {
  numero: number;
  /** Como a seção aparece na ficha ("Para que serve?"). */
  pergunta: string;
  /** Como a seção se chama na bula de papel. */
  naBula: string;
}

export const SECOES_DA_BULA: readonly SecaoDaBula[] = [
  { numero: 1, pergunta: 'Para que serve?', naBula: 'Para que este medicamento é indicado?' },
  { numero: 2, pergunta: 'Como ele funciona?', naBula: 'Como este medicamento funciona?' },
  { numero: 3, pergunta: 'Quando não devo usar?', naBula: 'Quando não devo usar este medicamento?' },
  { numero: 4, pergunta: 'O que devo saber antes de usar?', naBula: 'O que devo saber antes de usar este medicamento?' },
  { numero: 5, pergunta: 'Onde e como guardar?', naBula: 'Onde, como e por quanto tempo posso guardar este medicamento?' },
  { numero: 6, pergunta: 'Como devo usar?', naBula: 'Como devo usar este medicamento?' },
  {
    numero: 7,
    pergunta: 'E se eu esquecer uma dose?',
    naBula: 'O que devo fazer quando eu me esquecer de usar este medicamento?',
  },
  { numero: 8, pergunta: 'O que pode me fazer mal?', naBula: 'Quais os males que este medicamento pode me causar?' },
  {
    numero: 9,
    pergunta: 'E se eu tomar mais do que devia?',
    naBula: 'O que fazer se alguém usar uma quantidade maior do que a indicada deste medicamento?',
  },
];
```

`frontend/packages/ui/src/components/SourceChip/index.ts`:

```ts
export { SourceChip, SuggestionChip, type SourceChipProps, type SuggestionChipProps } from './SourceChip';
export { sugestoesDePerguntarMais, type OpcoesDePerguntarMais, type RemedioDaSugestao } from './perguntarMais';
export { SECOES_DA_BULA, type SecaoDaBula } from './secoes';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SourceChip/
```

Esperado: `Tests  8 passed (8)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/SourceChip/SourceChip.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { sugestoesDePerguntarMais } from './perguntarMais';
import { SourceChip, SuggestionChip } from './SourceChip';

const meta = {
  title: 'Componentes/Domínio/SourceChip',
  component: SourceChip,
  args: { numero: 1, remedio: 'Losartana', secao: 4, onPress: fn() },
} satisfies Meta<typeof SourceChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const DuasFontes: Story = {
  name: 'Duas fontes',
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <SourceChip {...args} />
      <SourceChip numero={2} remedio="Ibuprofeno" secao={4} onPress={args.onPress} />
    </div>
  ),
};

export const Sugestoes: Story = {
  name: 'Sugestões de Perguntar mais',
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {sugestoesDePerguntarMais({
        remedio: { nome: 'Losartana', artigo: 'a' },
        outros: ['Paracetamol'],
        pergunta: 'Posso tomar ibuprofeno com losartana?',
      }).map((sugestao) => (
        <SuggestionChip key={sugestao} onPress={args.onPress}>
          {sugestao}
        </SuggestionChip>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(3);
  },
};

export const AltoContraste: Story = {
  name: 'Alto contraste',
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('button')).borderTopWidth).toBe('2px');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/SourceChip/
```

Esperado: `Tests  4 passed (4)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/SourceChip/SourceChip.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './SourceChip.stories';

<Meta of={Stories} />

# SourceChip

Chip que liga uma citação `[n]` da resposta ao trecho da bula e abre a ficha do remédio na seção citada.

## Exemplo

<Canvas of={Stories.Principal} />

## Quando usar

- Logo abaixo da explicação, um chip para cada citação.
- Com o mesmo visual, o `SuggestionChip` faz as sugestões de "Perguntar mais" e os exemplos da primeira visita.

## Quando não usar

- Para levar a outra página do app, use `LinkButton`.
- Para mostrar os remédios da lista, use `Tag`.

## Anatomia

- Ícone de documento, decorativo.
- Número da citação ("[1]"), quando houver.
- "Na bula:" e, em negrito, o remédio e a seção ("Losartana · seção 4").

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.DuasFontes} />

<Canvas of={Stories.Sugestoes} />

<Canvas of={Stories.AltoContraste} />

## Perguntar mais

As sugestões saem de modelos fixos, sem LLM, pela função `sugestoesDePerguntarMais`:

- "Como tomar a losartana?", quando a pergunta não foi sobre como tomar;
- "Para que serve a losartana?", quando a pergunta não foi sobre para que serve;
- "E com paracetamol?", uma vez para cada outro remédio da lista que não estava na pergunta.

O artigo concorda com o remédio quando o app sabe o gênero do nome (`artigo: 'a'` ou `'o'`). Sem essa informação, a sugestão sai sem artigo ("Como tomar omeprazol?"), que soa seca mas nunca sai errada. Nenhum modelo fala de dose, troca ou suspensão, que o backend bloquearia.

O pacote também exporta `SECOES_DA_BULA`, as 9 seções da RDC 47/2009 com a pergunta curta da ficha.

## Acessibilidade

- É um `button`, nunca um link: a ficha abre por estado de navegação, e o nome do remédio não aparece na URL nem no histórico do navegador.
- O nome acessível é o texto visível ("[1] Na bula: Losartana · seção 4").
- 48px de altura ou mais. No alto contraste, contorno preto de 2px.

## Conteúdo

"Na bula" diz de onde vem a informação sem termo técnico. A seção é a mesma da bula de papel, para a pessoa conferir na caixa.

## Faça e não faça

- Faça: um chip por citação, na ordem dos números.
- Não faça: um link `href="/remedio/losartana"`.
- Não faça: sugestão escrita por LLM ou sobre mudança de dose.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/SourceChip
git commit -m "feat(ui): SourceChip, SuggestionChip e os modelos de Perguntar mais (#25)"
```

---

### Tarefa A4: `ProvenanceSeal`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.test.tsx`, `frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.tsx`, `frontend/packages/ui/src/components/ProvenanceSeal/index.ts`, `frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.stories.tsx`, `frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.mdx`

"Bula oficial ANVISA · Losartana, versão de 03/2025". Sem data, "data da versão não informada", e nunca uma data inventada. A data ISO vira mês e ano por texto: `new Date('2025-03-01')` em Brasília cai em 28/02, e o selo mostraria fevereiro. Na ficha, a entrada vem sem o nome do remédio. O ícone usa o token `selo.icone`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatarVersao, ProvenanceSeal } from './ProvenanceSeal';

describe('ProvenanceSeal', () => {
  it('mostra a bula e a versão', () => {
    render(<ProvenanceSeal bulas={[{ remedio: 'Losartana', versao: '03/2025' }]} />);
    expect(screen.getByText('Bula oficial ANVISA · Losartana, versão de 03/2025')).toBeInTheDocument();
  });

  it('sem data, diz que a data não foi informada e não inventa nenhuma', () => {
    const { container } = render(<ProvenanceSeal bulas={[{ remedio: 'Hidroclorotiazida', versao: null }]} />);
    expect(screen.getByText('Bula oficial ANVISA · Hidroclorotiazida · data da versão não informada')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\d{2}\/\d{4}/);
  });

  it('texto vazio conta como sem data', () => {
    render(<ProvenanceSeal bulas={[{ remedio: 'Dipirona', versao: '  ' }]} />);
    expect(screen.getByText(/Dipirona · data da versão não informada/)).toBeInTheDocument();
  });

  it('junta duas bulas na ordem recebida', () => {
    render(
      <ProvenanceSeal
        bulas={[
          { remedio: 'Losartana', versao: '03/2025' },
          { remedio: 'Ibuprofeno', versao: '11/2024' },
        ]}
      />,
    );
    expect(
      screen.getByText('Bula oficial ANVISA · Losartana, versão de 03/2025 · Ibuprofeno, versão de 11/2024'),
    ).toBeInTheDocument();
  });

  it('na ficha, sem o nome do remédio', () => {
    render(<ProvenanceSeal bulas={[{ versao: '03/2025' }]} />);
    expect(screen.getByText('Bula oficial ANVISA · versão de 03/2025')).toBeInTheDocument();
  });

  it('data ISO vira mês e ano sem mudar o mês por causa do fuso', () => {
    // Em Brasília, new Date('2025-03-01') cai em 28/02. O fuso é fixado aqui para o teste valer no CI (UTC).
    const fuso = process.env.TZ;
    process.env.TZ = 'America/Sao_Paulo';
    try {
      expect(formatarVersao('2025-03-01')).toBe('03/2025');
      expect(formatarVersao('2025-03')).toBe('03/2025');
      expect(formatarVersao('03/2025')).toBe('03/2025');
    } finally {
      if (fuso === undefined) delete process.env.TZ;
      else process.env.TZ = fuso;
    }
  });

  it('ícone decorativo', () => {
    const { container } = render(<ProvenanceSeal bulas={[{ remedio: 'Losartana', versao: '03/2025' }]} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ProvenanceSeal/
```

Esperado: FAIL com `Failed to resolve import "./ProvenanceSeal"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.tsx`:

```tsx
import { SealCheck } from '@phosphor-icons/react';

export interface BulaDeOrigem {
  /** Nome do remédio ("Losartana"). Na ficha, onde o nome já é o título, deixe de fora. */
  remedio?: string;
  /**
   * Data da versão da bula, como o backend manda: "03/2025", "2025-03" ou "2025-03-01".
   * `null` quando não há data registrada. O selo nunca inventa nem estima uma data.
   */
  versao: string | null;
}

export interface ProvenanceSealProps {
  /** Uma entrada para cada bula usada na resposta, na ordem das citações. */
  bulas: readonly BulaDeOrigem[];
}

/**
 * "2025-03-01" e "2025-03" viram "03/2025" por texto, sem passar por Date: new Date('2025-03-01')
 * em Brasília cai em 28/02 e mudaria o mês. Outros formatos saem como vieram.
 */
export function formatarVersao(versao: string): string {
  const iso = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(versao.trim());
  return iso ? `${iso[2]}/${iso[1]}` : versao.trim();
}

function descrever({ remedio, versao }: BulaDeOrigem): string {
  const temData = versao !== null && versao.trim() !== '';
  if (remedio) return temData ? `${remedio}, versão de ${formatarVersao(versao)}` : `${remedio} · data da versão não informada`;
  return temData ? `versão de ${formatarVersao(versao)}` : 'data da versão não informada';
}

/** Selo de procedência: de qual bula oficial a informação veio e de quando ela é. */
export function ProvenanceSeal({ bulas }: ProvenanceSealProps) {
  if (bulas.length === 0) return null;
  return (
    <p className="flex max-w-medida items-start gap-2 border-t border-border-subtle pt-3 text-apoio text-text-muted">
      <SealCheck size="1.25rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0 text-selo-icone" />
      <span>Bula oficial ANVISA · {bulas.map(descrever).join(' · ')}</span>
    </p>
  );
}
```

`frontend/packages/ui/src/components/ProvenanceSeal/index.ts`:

```ts
export { ProvenanceSeal, formatarVersao, type BulaDeOrigem, type ProvenanceSealProps } from './ProvenanceSeal';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ProvenanceSeal/
```

Esperado: `Tests  7 passed (7)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ProvenanceSeal } from './ProvenanceSeal';

const meta = {
  title: 'Componentes/Domínio/ProvenanceSeal',
  component: ProvenanceSeal,
} satisfies Meta<typeof ProvenanceSeal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComData: Story = {
  name: 'Com data',
  args: { bulas: [{ remedio: 'Losartana', versao: '03/2025' }] },
};

export const SemData: Story = {
  name: 'Sem data',
  args: { bulas: [{ remedio: 'Hidroclorotiazida', versao: null }] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data da versão não informada/)).toBeInTheDocument();
  },
};

export const DuasBulas: Story = {
  name: 'Duas bulas',
  args: {
    bulas: [
      { remedio: 'Losartana', versao: '03/2025' },
      { remedio: 'Ibuprofeno', versao: '11/2024' },
    ],
  },
};

export const NaFicha: Story = {
  name: 'Na ficha do remédio',
  args: { bulas: [{ versao: '03/2025' }] },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/ProvenanceSeal/
```

Esperado: `Tests  4 passed (4)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/ProvenanceSeal/ProvenanceSeal.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './ProvenanceSeal.stories';

<Meta of={Stories} />

# ProvenanceSeal

Selo de procedência: de qual bula oficial a informação veio e de quando ela é.

## Exemplo

<Canvas of={Stories.ComData} />

## Quando usar

Em toda resposta, depois dos chips de seção, com uma entrada para cada bula citada. Na ficha do remédio, logo abaixo do nome, sem repetir o nome.

## Quando não usar

Não use para fonte que não seja a bula oficial da ANVISA. Para a citação de um trecho, use `SourceChip`.

## Anatomia

- Ícone de selo, decorativo.
- "Bula oficial ANVISA", seguido de cada bula com a versão ("Losartana, versão de 03/2025").

## Props

<ArgTypes of={Stories} />

`versao` é `string | null`. O componente aceita o texto do backend ("03/2025") ou uma data ISO ("2025-03-01"), que vira "03/2025" por texto, sem passar por `Date`.

## Estados

<Canvas of={Stories.SemData} />

<Canvas of={Stories.DuasBulas} />

<Canvas of={Stories.NaFicha} />

## Acessibilidade

- Um parágrafo simples, lido na ordem da resposta.
- Texto de apoio (16px, `text-muted`, 8:1).

## Conteúdo

Sem data registrada, o selo diz "data da versão não informada". Ele nunca mostra uma data inventada ou estimada (risco R5). Converter `2025-03-01` com `new Date` em Brasília daria 02/2025: por isso a conversão é só de texto.

## Faça e não faça

- Faça: "Bula oficial ANVISA · Hidroclorotiazida · data da versão não informada".
- Não faça: usar a data de hoje, a data da coleta ou "recente" quando a versão não vier.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/ProvenanceSeal
git commit -m "feat(ui): ProvenanceSeal sem data inventada (#25)"
```

---

### Tarefa A5: `ReasoningSteps`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/ReasoningSteps/exemplos.ts`, `frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.test.tsx`, `frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.tsx`, `frontend/packages/ui/src/components/ReasoningSteps/index.ts`, `frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.stories.tsx`, `frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.mdx`

"Como chegamos nesta resposta", recolhido, sobre o `Disclosure` do plano 2. A lista é um `ol` com `list-decimal`, porque o reset do Tailwind tira os números. Os passos chegam prontos, em linguagem simples.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/ReasoningSteps/exemplos.ts`:

```ts
// Passos de exemplo, como na tela de resposta aprovada. Não é exportado pelo pacote.
export const passosDeExemplo = [
  'Identificamos: losartana, ibuprofeno e metformina.',
  'Lemos a seção 4 das três bulas.',
  'Checamos se uma bula fala da outra.',
  'Conferimos as regras de segurança.',
];
```

`frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { passosDeExemplo } from './exemplos';
import { ReasoningSteps } from './ReasoningSteps';

describe('ReasoningSteps', () => {
  it('começa recolhido e abre pelo botão', async () => {
    render(<ReasoningSteps passos={passosDeExemplo} />);
    const botao = screen.getByRole('button', { name: 'Como chegamos nesta resposta' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(passosDeExemplo);
  });

  it('lista numerada mesmo com o reset do Tailwind', () => {
    render(<ReasoningSteps passos={passosDeExemplo} />);
    expect(screen.getByRole('list', { hidden: true })).toHaveClass('list-decimal');
  });

  it('sem passos, não aparece', () => {
    const { container } = render(<ReasoningSteps passos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ReasoningSteps/
```

Esperado: FAIL com `Failed to resolve import "./ReasoningSteps"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.tsx`:

```tsx
import { Disclosure } from '../Disclosure';

export interface ReasoningStepsProps {
  /**
   * Os passos, montados pelo app a partir do trace dos agentes, já em linguagem do dia a dia
   * ("Lemos a seção 4 das duas bulas."). Sem nome de agente, tempo ou termo técnico.
   */
  passos: readonly string[];
  nivelTitulo?: 2 | 3 | 4;
}

/** "Como chegamos nesta resposta", recolhido por padrão. O trace técnico fica no DemoTrace. */
export function ReasoningSteps({ passos, nivelTitulo = 3 }: ReasoningStepsProps) {
  if (passos.length === 0) return null;
  return (
    <Disclosure titulo="Como chegamos nesta resposta" nivelTitulo={nivelTitulo}>
      <ol className="list-decimal space-y-2 ps-6">
        {passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
    </Disclosure>
  );
}
```

`frontend/packages/ui/src/components/ReasoningSteps/index.ts`:

```ts
export { ReasoningSteps, type ReasoningStepsProps } from './ReasoningSteps';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/ReasoningSteps/
```

Esperado: `Tests  3 passed (3)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { passosDeExemplo } from './exemplos';
import { ReasoningSteps } from './ReasoningSteps';

const meta = {
  title: 'Componentes/Domínio/ReasoningSteps',
  component: ReasoningSteps,
  args: { passos: passosDeExemplo },
} satisfies Meta<typeof ReasoningSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recolhido: Story = {};

export const Aberto: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Como chegamos nesta resposta' }));
    const lista = canvas.getByRole('list');
    await expect(getComputedStyle(lista).listStyleType).toBe('decimal');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/ReasoningSteps/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/ReasoningSteps/ReasoningSteps.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './ReasoningSteps.stories';

<Meta of={Stories} />

# ReasoningSteps

"Como chegamos nesta resposta": o caminho da resposta, em linguagem do dia a dia.

## Exemplo

<Canvas of={Stories.Recolhido} />

## Quando usar

Em toda resposta, depois do selo de procedência. Começa recolhido.

## Quando não usar

Para o trace técnico (agentes, tempos, trechos), use `DemoTrace`, que só aparece no modo demonstração.

## Anatomia

- O botão "Como chegamos nesta resposta", que abre e fecha.
- Uma lista numerada de passos.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Aberto} />

## Acessibilidade

- Usa o `Disclosure`: o botão fica dentro de um `h3` e tem `aria-expanded`. Abre com Enter ou Espaço.
- A lista é um `ol` com números visíveis (`list-decimal`), porque o reset do Tailwind tira os números.

## Conteúdo

Os passos são montados pelo app a partir do trace, já em linguagem simples: "Identificamos: losartana e ibuprofeno.", "Lemos a seção 4 das duas bulas.", "Checamos se uma bula fala da outra.", "Conferimos as regras de segurança.". Sem nome de agente, tempo ou termo técnico.

## Faça e não faça

- Faça: "Checamos se uma bula fala da outra."
- Não faça: "AgenteInteracoes retornou 1 match em precaucoes_interacoes."
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/ReasoningSteps
git commit -m "feat(ui): ReasoningSteps (#25)"
```

---

### Tarefa A6: `DemoTrace`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/DemoTrace/exemplos.ts`, `frontend/packages/ui/src/components/DemoTrace/DemoTrace.test.tsx`, `frontend/packages/ui/src/components/DemoTrace/DemoTrace.tsx`, `frontend/packages/ui/src/components/DemoTrace/index.ts`, `frontend/packages/ui/src/components/DemoTrace/DemoTrace.stories.tsx`, `frontend/packages/ui/src/components/DemoTrace/DemoTrace.mdx`

O trace técnico, só no modo demonstração: uma tabela de etapas (agente, tempo, detalhe), a categoria de risco, o OCR e os trechos recuperados. Só aparece quando recebe etapas; quem decide mostrar (`?demo=1`) é o app. Não há `font-mono`: as fontes padrão do Tailwind estão desligadas (`--font-*: initial`).

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/DemoTrace/exemplos.ts`:

```ts
// Trace de exemplo, no formato que o modo demonstração mostra. Não é exportado pelo pacote.
import type { DemoTraceProps } from './DemoTrace';

export const traceDeExemplo = {
  etapas: [
    { agente: 'AgenteSeguranca (pré)', duracaoMs: 12, detalhe: 'categoria_risco: nenhum' },
    { agente: 'AgenteIdentificador', duracaoMs: 48, detalhe: 'losartana, ibuprofeno (lista: metformina)' },
    { agente: 'AgenteRecuperador', duracaoMs: 640, detalhe: '6 trechos' },
    { agente: 'AgenteInteracoes', duracaoMs: 95, detalhe: '1 frase em precaucoes_interacoes' },
    { agente: 'LLM (Qwen2.5-1.5B)', duracaoMs: 8420 },
    { agente: 'AgenteSeguranca (pós)', duracaoMs: 21, detalhe: 'citações ok, nenhuma dose fora do contexto' },
  ],
  categoriaRisco: 'nenhum',
  trechos: [
    {
      remedio: 'Losartana',
      secao: 'precaucoes_interacoes',
      texto: 'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana.',
      pontuacao: 0.21,
    },
  ],
} satisfies DemoTraceProps;
```

`frontend/packages/ui/src/components/DemoTrace/DemoTrace.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DemoTrace, formatarDuracao } from './DemoTrace';
import { traceDeExemplo } from './exemplos';

describe('DemoTrace', () => {
  it('só aparece quando há dados', () => {
    const { container } = render(<DemoTrace etapas={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra agentes, tempos, categoria de risco e trechos', async () => {
    render(<DemoTrace {...traceDeExemplo} ocr="LOSARTANA POTÁSSICA 50mg" />);
    await userEvent.click(screen.getByRole('button', { name: 'Modo demonstração: o que os agentes fizeram' }));
    const tabela = screen.getByRole('table', { name: /Etapas, em 9,2 s no total/ });
    expect(tabela).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'AgenteInteracoes' })).toBeInTheDocument();
    expect(screen.getByText('categoria_risco:')).toBeInTheDocument();
    expect(screen.getByText('LOSARTANA POTÁSSICA 50mg')).toBeInTheDocument();
    expect(screen.getByText(/precaucoes_interacoes · 0,21/)).toBeInTheDocument();
  });

  it('formata o tempo em ms ou s', () => {
    expect(formatarDuracao(48)).toBe('48 ms');
    expect(formatarDuracao(8420)).toBe('8,4 s');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/DemoTrace/
```

Esperado: FAIL com `Failed to resolve import "./DemoTrace"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/DemoTrace/DemoTrace.tsx`:

```tsx
import { Disclosure } from '../Disclosure';

export interface EtapaDoTrace {
  /** Nome do agente, como no backend ("AgenteSeguranca"). */
  agente: string;
  duracaoMs: number;
  /** O que o agente decidiu, em uma linha ("categoria_risco: nenhum"). */
  detalhe?: string;
}

export interface TrechoRecuperado {
  remedio: string;
  secao: string;
  texto: string;
  /** Distância ou pontuação da busca, como veio. */
  pontuacao?: number;
}

export interface DemoTraceProps {
  /** As etapas do pipeline, na ordem em que rodaram. Sem etapas, o componente não aparece. */
  etapas: readonly EtapaDoTrace[];
  trechos?: readonly TrechoRecuperado[];
  /** O texto bruto lido pelo OCR, quando a pergunta veio de uma foto. */
  ocr?: string;
  categoriaRisco?: string;
}

const segundos = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const pontos = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatarDuracao(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${segundos.format(ms / 1000)} s`;
}

const classesDaCelula = 'border-b border-border-subtle px-2 py-2 text-start align-top';

/**
 * Trace técnico dos agentes, só no modo demonstração. O app decide quando mostrar (?demo=1) e passa
 * os dados. Para quem usa o app, a explicação é o ReasoningSteps.
 */
export function DemoTrace({ etapas, trechos = [], ocr, categoriaRisco }: DemoTraceProps) {
  if (etapas.length === 0) return null;
  const total = etapas.reduce((soma, etapa) => soma + etapa.duracaoMs, 0);
  return (
    <Disclosure titulo="Modo demonstração: o que os agentes fizeram">
      <div className="flex flex-col gap-4 text-apoio">
        <table className="w-full border-collapse">
          <caption className="text-start font-bold">Etapas, em {formatarDuracao(total)} no total</caption>
          <thead>
            <tr>
              <th scope="col" className={classesDaCelula}>
                Agente
              </th>
              <th scope="col" className={classesDaCelula}>
                Tempo
              </th>
              <th scope="col" className={classesDaCelula}>
                Detalhe
              </th>
            </tr>
          </thead>
          <tbody>
            {etapas.map((etapa, posicao) => (
              <tr key={`${etapa.agente}-${posicao}`}>
                <th scope="row" className={`${classesDaCelula} wrap-anywhere`}>
                  {etapa.agente}
                </th>
                <td className={`${classesDaCelula} whitespace-nowrap`}>{formatarDuracao(etapa.duracaoMs)}</td>
                <td className={`${classesDaCelula} wrap-anywhere`}>{etapa.detalhe ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {categoriaRisco ? (
          <p>
            <b>categoria_risco:</b> {categoriaRisco}
          </p>
        ) : null}
        {ocr ? (
          <p>
            <b>OCR:</b> {ocr}
          </p>
        ) : null}
        {trechos.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Trechos recuperados</p>
            <ol className="list-decimal space-y-2 ps-6">
              {trechos.map((trecho, posicao) => (
                <li key={posicao}>
                  <span className="font-bold">
                    {trecho.remedio} · {trecho.secao}
                    {trecho.pontuacao !== undefined ? ` · ${pontos.format(trecho.pontuacao)}` : ''}
                  </span>
                  <br />
                  {trecho.texto}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </Disclosure>
  );
}
```

`frontend/packages/ui/src/components/DemoTrace/index.ts`:

```ts
export { DemoTrace, formatarDuracao, type DemoTraceProps, type EtapaDoTrace, type TrechoRecuperado } from './DemoTrace';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/DemoTrace/
```

Esperado: `Tests  3 passed (3)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/DemoTrace/DemoTrace.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { DemoTrace } from './DemoTrace';
import { traceDeExemplo } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/DemoTrace',
  component: DemoTrace,
  args: traceDeExemplo,
} satisfies Meta<typeof DemoTrace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recolhido: Story = {};

export const Aberto: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Modo demonstração: o que os agentes fizeram' }));
    await expect(canvas.getByRole('table')).toBeVisible();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/DemoTrace/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/DemoTrace/DemoTrace.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './DemoTrace.stories';

<Meta of={Stories} />

# DemoTrace

O trace técnico dos agentes, para apresentar o Bula Clara: agentes, tempos, trechos recuperados, OCR e categoria de risco.

## Exemplo

<Canvas of={Stories.Aberto} />

## Quando usar

Só no modo demonstração. Quem decide é o app, pelo `?demo=1`, e o componente só aparece quando recebe as etapas.

## Quando não usar

Para quem usa o app no dia a dia, a explicação é o `ReasoningSteps`.

## Anatomia

- O botão "Modo demonstração: o que os agentes fizeram".
- Tabela de etapas (agente, tempo, detalhe), com o tempo total na legenda.
- Categoria de risco e OCR, quando houver.
- Lista numerada dos trechos recuperados, com remédio, seção e pontuação.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Recolhido} />

## Acessibilidade

- A tabela tem `caption`, cabeçalhos de coluna e o nome do agente como cabeçalho de linha.
- Nomes compridos quebram em qualquer ponto, sem rolagem lateral.

## Conteúdo

Aqui os termos técnicos são de propósito: é para quem avalia o sistema. Os tempos aparecem em ms abaixo de 1 segundo e em s acima.

## Faça e não faça

- Faça: mostre o trace numa apresentação, para explicar o pipeline.
- Não faça: ligar o modo demonstração por padrão no app.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/DemoTrace
git commit -m "feat(ui): DemoTrace para o modo demonstração (#25)"
```

---

### Tarefa A7: `DisclaimerFooter`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/DisclaimerFooter/exemplos.ts`, `frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.test.tsx`, `frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.tsx`, `frontend/packages/ui/src/components/DisclaimerFooter/index.ts`, `frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.stories.tsx`, `frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.mdx`

O aviso legal no fim de toda resposta, como veio do backend. É um parágrafo, e não `footer` (veja "Decisões"). Hoje o `aviso_legal` começa com emoji; tirar é da #23, e o componente não reescreve.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/DisclaimerFooter/exemplos.ts`:

```ts
// O aviso das telas aprovadas. No app, ele vem do backend (aviso_legal). Não é exportado pelo pacote.
export const avisoLegal =
  'Projeto acadêmico. Não substitui médico ou farmacêutico. Emergência: SAMU 192 · Disque-Intoxicação 0800 722 6001.';
```

`frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DisclaimerFooter } from './DisclaimerFooter';
import { avisoLegal } from './exemplos';

describe('DisclaimerFooter', () => {
  it('mostra o aviso legal como veio, em texto de apoio', () => {
    render(<DisclaimerFooter>{avisoLegal}</DisclaimerFooter>);
    expect(screen.getByText(avisoLegal)).toHaveClass('text-apoio', 'text-text-muted');
  });

  it('não reescreve o texto do backend, nem para tirar o emoji (isso é da #23)', () => {
    const doBackendHoje = '⚠️ Projeto acadêmico. Não substitui orientação médica.';
    render(<DisclaimerFooter>{doBackendHoje}</DisclaimerFooter>);
    expect(screen.getByText(doBackendHoje)).toBeInTheDocument();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/DisclaimerFooter/
```

Esperado: FAIL com `Failed to resolve import "./DisclaimerFooter"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.tsx`:

```tsx
export interface DisclaimerFooterProps {
  /** O `aviso_legal` que veio do backend, exatamente como veio. */
  children: string;
}

/** Aviso legal no fim de toda resposta, inclusive das bloqueadas. Discreto, mas legível (16px, 8:1). */
export function DisclaimerFooter({ children }: DisclaimerFooterProps) {
  // Parágrafo, e não <footer>: fora de um <main> ou <section>, um <footer> vira o rodapé da página
  // (contentinfo), e cada resposta tem o seu aviso.
  return <p className="max-w-medida text-apoio text-text-muted">{children}</p>;
}
```

`frontend/packages/ui/src/components/DisclaimerFooter/index.ts`:

```ts
export { DisclaimerFooter, type DisclaimerFooterProps } from './DisclaimerFooter';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/DisclaimerFooter/
```

Esperado: `Tests  2 passed (2)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DisclaimerFooter } from './DisclaimerFooter';
import { avisoLegal } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/DisclaimerFooter',
  component: DisclaimerFooter,
  args: { children: avisoLegal },
} satisfies Meta<typeof DisclaimerFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/DisclaimerFooter/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/DisclaimerFooter/DisclaimerFooter.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './DisclaimerFooter.stories';

<Meta of={Stories} />

# DisclaimerFooter

O aviso legal no fim de toda resposta, inclusive das bloqueadas.

## Exemplo

<Canvas of={Stories.Principal} />

## Quando usar

No fim de cada bloco de resposta, de emergência e de bloqueio, e no fim da ficha do remédio.

## Quando não usar

Não use para aviso de segurança ou de erro: esses são `Alert`, `SafetyNotice` ou `EmergencyCard`.

## Anatomia

Um parágrafo de texto de apoio. Não é `footer`: fora de um `main` ou `section`, o `footer` vira o rodapé da página (`contentinfo`), e cada resposta tem o seu aviso.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

Texto de apoio (16px, `text-muted`, 8:1), discreto mas legível, lido na ordem da resposta.

## Conteúdo

O texto é o `aviso_legal` do backend, mostrado como veio. Hoje o backend ainda manda o aviso com um emoji no começo; tirar é trabalho da #23, no backend, e não da interface.

## Faça e não faça

- Faça: mantenha o aviso mesmo nas respostas bloqueadas.
- Não faça: esconder o aviso atrás de um "saiba mais".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/DisclaimerFooter
git commit -m "feat(ui): DisclaimerFooter (#25)"
```

---

### Tarefa A8: `LoadingStatus`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.test.tsx`, `frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.tsx`, `frontend/packages/ui/src/components/LoadingStatus/index.ts`, `frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.stories.tsx`, `frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.mdx`

"Lendo a bula da losartana…": a única região `aria-live="polite"` da resposta. Fica montada vazia e só troca o texto. Usa o `Spinner` do plano 2, que para com o movimento reduzido.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingStatus } from './LoadingStatus';

describe('LoadingStatus', () => {
  it('a região aria-live existe antes do texto, e só troca o conteúdo', () => {
    const { container, rerender } = render(<LoadingStatus />);
    const regiao = container.querySelector('[aria-live="polite"]');
    expect(regiao).toBeEmptyDOMElement();
    rerender(<LoadingStatus>Identificando os remédios…</LoadingStatus>);
    expect(container.querySelector('[aria-live="polite"]')).toBe(regiao);
    rerender(<LoadingStatus>Lendo a bula da losartana…</LoadingStatus>);
    expect(regiao).toHaveTextContent('Lendo a bula da losartana…');
    expect(screen.getByRole('progressbar', { name: 'Lendo a bula da losartana…' })).toBeInTheDocument();
  });

  it('com movimento reduzido, o círculo para', () => {
    const { container } = render(<LoadingStatus>Checando interações…</LoadingStatus>);
    expect(container.querySelector('.animate-spin')).toHaveClass('motion-reduce:animate-none');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/LoadingStatus/
```

Esperado: FAIL com `Failed to resolve import "./LoadingStatus"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.tsx`:

```tsx
import { Spinner } from '../Spinner';

export interface LoadingStatusProps {
  /**
   * A etapa atual ("Lendo a bula da losartana…"). Vazio quando não há nada carregando. Monte o
   * componente uma vez e só troque o texto: região aria-live que já nasce com texto nem sempre é lida.
   */
  children?: string;
}

/**
 * Status de espera da resposta, que pode passar de 10 segundos. É a única região aria-live da
 * resposta: quando ela chega, o foco vai para a frase-resposta e nada é lido duas vezes.
 */
export function LoadingStatus({ children = '' }: LoadingStatusProps) {
  return <div aria-live="polite">{children ? <Spinner rotulo={children} /> : null}</div>;
}
```

`frontend/packages/ui/src/components/LoadingStatus/index.ts`:

```ts
export { LoadingStatus, type LoadingStatusProps } from './LoadingStatus';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/LoadingStatus/
```

Esperado: `Tests  2 passed (2)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { LoadingStatus } from './LoadingStatus';

const meta = {
  title: 'Componentes/Domínio/LoadingStatus',
  component: LoadingStatus,
  args: { children: 'Lendo a bula da losartana…' },
} satisfies Meta<typeof LoadingStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {};

const ETAPAS = ['Identificando os remédios…', 'Lendo a bula…', 'Checando interações…', 'Conferindo a segurança…'];

function Etapas() {
  const [etapa, setEtapa] = useState(0);
  useEffect(() => {
    if (etapa >= ETAPAS.length - 1) return;
    const espera = setTimeout(() => setEtapa((atual) => atual + 1), 150);
    return () => clearTimeout(espera);
  }, [etapa]);
  return <LoadingStatus>{ETAPAS[etapa]}</LoadingStatus>;
}

export const EtapaPorEtapa: Story = {
  name: 'Etapa por etapa',
  render: () => <Etapas />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText('Conferindo a segurança…')).toBeInTheDocument());
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/LoadingStatus/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/LoadingStatus/LoadingStatus.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './LoadingStatus.stories';

<Meta of={Stories} />

# LoadingStatus

O status de espera enquanto a resposta é montada, que pode passar de 10 segundos.

## Exemplo

<Canvas of={Stories.Principal} />

## Quando usar

Abaixo das respostas anteriores, enquanto a nova é montada. O texto muda a cada etapa.

## Quando não usar

- Para espera curta dentro de um botão, como no `ListenButton`, o próprio botão mostra o círculo.
- Para espera com passos conhecidos e contados, use `ProgressSteps`.

## Anatomia

Um círculo de carregamento (`Spinner`) com o texto da etapa ao lado, dentro de uma região `aria-live="polite"`.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.EtapaPorEtapa} />

## Acessibilidade

- É a única região `aria-live` da resposta. Quando a resposta chega, o foco vai para a frase-resposta (`AnswerHeadline`) e nada é lido duas vezes.
- Monte o componente uma vez, vazio, e só troque o texto. Uma região `aria-live` que já nasce com texto nem sempre é anunciada.
- Com movimento reduzido, o círculo fica parado.

## Conteúdo

As etapas da página Textos da interface: "Identificando os remédios…", "Lendo a bula…" (ou "Lendo a bula da losartana…"), "Checando interações…" e "Conferindo a segurança…".

## Faça e não faça

- Faça: diga o que está acontecendo agora.
- Não faça: "Carregando…" sozinho por 10 segundos.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/LoadingStatus
git commit -m "feat(ui): LoadingStatus (#25)"
```

---

### Tarefa A9: Barrel, changeset e conferência do grupo

**Arquivos:**
- Modificar: `frontend/packages/ui/src/grupos/resposta.ts`
- Criar: `frontend/.changeset/dominio-resposta.md`

- [ ] **Passo 1: Barrel e changeset**

`frontend/packages/ui/src/grupos/resposta.ts`:

```ts
// Grupo A do plano 3: a resposta.
export * from '../components/AnswerHeadline';
export * from '../components/DemoTrace';
export * from '../components/DisclaimerFooter';
export * from '../components/ListenButton';
export * from '../components/LoadingStatus';
export * from '../components/ProvenanceSeal';
export * from '../components/ReasoningSteps';
export * from '../components/SourceChip';
```

`frontend/.changeset/dominio-resposta.md`:

```md
---
'@bula-clara/ui': minor
---

Componentes da resposta: AnswerHeadline, ListenButton (só voz do aparelho ou do nosso servidor), SourceChip e SuggestionChip com os modelos de "Perguntar mais", ProvenanceSeal, ReasoningSteps, DemoTrace, DisclaimerFooter e LoadingStatus.
```

- [ ] **Passo 2: Conferir o grupo**

```bash
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui test < /dev/null
pnpm --filter @bula-clara/ui exec vitest run --project unit < /dev/null
```

Esperado: lint e tipos sem erro, `Tests  238 passed (238)` no `ui` e `Tests  146 passed (146)` de unidade.

- [ ] **Passo 3: Commit**

```bash
git add frontend/packages/ui/src/grupos/resposta.ts frontend/.changeset/dominio-resposta.md
git commit -m "feat(ui): exporta os componentes da resposta (#25)"
```

---

## Grupo B: segurança

Quatro componentes, sem dependência entre eles. Usam `Alert` e `Button` dos planos 1 e 2. Comece por este grupo se houver uma pessoa só: é o que mais pesa na ética.

### Tarefa B1: `InteractionCallout`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.test.tsx`, `frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.tsx`, `frontend/packages/ui/src/components/InteractionCallout/index.ts`, `frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.stories.tsx`, `frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.mdx`

Os três níveis de interação, sobre o `Alert` do plano 2. O nível sai só da seção (`contraindicacao`, `precaucoes_interacoes` ou `null`), e o componente não aceita tom: o teste com `@ts-expect-error` confirma que `tom="sucesso"` não compila, e na Tarefa 4 a troca do tom de "não fala" para `'sucesso'` reprova no `typecheck`. Com seção, a frase da bula é obrigatória e aparece como evidência, com o remédio e o número da seção. Todos os textos ficam em `TEXTOS_DA_INTERACAO`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InteractionCallout, nivelDaInteracao, TEXTOS_DA_INTERACAO } from './InteractionCallout';

const NAO_GARANTE = 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.';

describe('InteractionCallout', () => {
  it('frase em "Quando não usar" vira perigo, com a frase da bula e a seção 3', () => {
    render(
      <InteractionCallout
        remedios={['Varfarina', 'Ácido acetilsalicílico']}
        secao="contraindicacao"
        evidencia={{ frase: 'Não use este medicamento junto com ácido acetilsalicílico.', remedio: 'Varfarina' }}
      />,
    );
    const aviso = screen.getByRole('note');
    expect(
      screen.getByRole('heading', { name: 'Varfarina e ácido acetilsalicílico: a bula diz para não usar junto' }),
    ).toBeInTheDocument();
    expect(aviso).toHaveClass('bg-danger-bg');
    expect(aviso).toHaveTextContent('“Não use este medicamento junto com ácido acetilsalicílico.”');
    expect(aviso).toHaveTextContent('Varfarina, seção 3');
  });

  it('frase em "O que devo saber antes" vira cuidado, com a seção 4', () => {
    render(
      <InteractionCallout
        remedios={['Losartana', 'Ibuprofeno']}
        secao="precaucoes_interacoes"
        evidencia={{ frase: 'Anti-inflamatórios podem reduzir o efeito.', remedio: 'Losartana' }}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Losartana e ibuprofeno: a bula pede cuidado com essa combinação' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveClass('bg-caution-bg');
    expect(screen.getByRole('note')).toHaveTextContent('Losartana, seção 4');
  });

  it('"não fala" é neutro, nunca verde, e sempre diz que isso não garante segurança', () => {
    render(<InteractionCallout remedios={['Ibuprofeno', 'Metformina']} secao={null} />);
    const aviso = screen.getByRole('note');
    expect(
      screen.getByRole('heading', { name: 'Ibuprofeno e metformina: a bula não fala dessa combinação' }),
    ).toBeInTheDocument();
    expect(aviso).toHaveTextContent(NAO_GARANTE);
    expect(aviso).toHaveClass('bg-surface-info');
    expect(aviso.className).not.toMatch(/confirm|toast/);
    expect(aviso.querySelector('blockquote')).toBeNull();
  });

  it('o nível sai só da seção', () => {
    expect(nivelDaInteracao('contraindicacao')).toBe('nao-usar');
    expect(nivelDaInteracao('precaucoes_interacoes')).toBe('cuidado');
    expect(nivelDaInteracao(null)).toBe('nao-fala');
    expect(TEXTOS_DA_INTERACAO['nao-fala'].acao).toBe(NAO_GARANTE);
  });

  it('não aceita tom, seção desconhecida nem seção sem a frase da bula', () => {
    const elementos = [
      // @ts-expect-error o tom nunca é escolhido por quem usa: sai da seção, e não existe verde
      <InteractionCallout key="1" remedios={['Losartana', 'Ibuprofeno']} secao={null} tom="sucesso" />,
      // @ts-expect-error só as duas seções do agente de interações valem
      <InteractionCallout key="2" remedios={['Losartana', 'Ibuprofeno']} secao="indicacao" />,
      // @ts-expect-error com seção, a frase da bula é obrigatória
      <InteractionCallout key="3" remedios={['Losartana', 'Ibuprofeno']} secao="contraindicacao" />,
    ];
    expect(elementos).toHaveLength(3);
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/InteractionCallout/
```

Esperado: FAIL com `Failed to resolve import "./InteractionCallout"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.tsx`:

```tsx
import { Alert, type AlertTom } from '../Alert';

/** Seção da bula onde o agente de interações achou a frase que cita o outro remédio. */
export type SecaoDaInteracao = 'contraindicacao' | 'precaucoes_interacoes';

/** Os três níveis. Saem só da seção, sem nenhuma inferência de gravidade. */
export type NivelDaInteracao = 'nao-usar' | 'cuidado' | 'nao-fala';

/**
 * Todos os textos do componente, num lugar só. O título de `nao-usar` ainda depende da validação
 * com as bulas reais (spec, "Validar antes de fechar o texto"). Se aparecerem falsos "não usar
 * junto", troque aqui por `titulo: "A bula cita essa combinação em 'Quando não usar'"` e
 * `acao: 'Fale com o médico antes de usar os dois juntos.'`.
 */
export const TEXTOS_DA_INTERACAO = {
  'nao-usar': {
    titulo: 'A bula diz para não usar junto',
    acao: 'Fale com o médico antes. Não pare nenhum remédio por conta própria.',
  },
  cuidado: {
    titulo: 'A bula pede cuidado com essa combinação',
    acao: 'Converse com o farmacêutico antes de tomar os dois juntos.',
  },
  'nao-fala': {
    titulo: 'A bula não fala dessa combinação',
    acao: 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.',
  },
} as const satisfies Record<NivelDaInteracao, { titulo: string; acao: string }>;

/** O tom vem do Alert, que não tem verde: nenhum nível pode parecer "seguro". */
const TOM_DO_NIVEL: Record<NivelDaInteracao, AlertTom> = {
  'nao-usar': 'perigo',
  cuidado: 'cuidado',
  'nao-fala': 'info',
};

/** Número da seção na bula de papel (RDC 47/2009): 3 é "Quando não devo usar", 4 é "O que devo saber antes". */
export const NUMERO_DA_SECAO: Record<SecaoDaInteracao, number> = {
  contraindicacao: 3,
  precaucoes_interacoes: 4,
};

export function nivelDaInteracao(secao: SecaoDaInteracao | null): NivelDaInteracao {
  if (secao === 'contraindicacao') return 'nao-usar';
  if (secao === 'precaucoes_interacoes') return 'cuidado';
  return 'nao-fala';
}

/** A frase da bula que cita o outro remédio, exatamente como veio do backend. */
export interface EvidenciaDaBula {
  /** O trecho da bula, sem aspas. */
  frase: string;
  /** De qual bula é a frase ("Losartana"). */
  remedio: string;
}

interface InteractionCalloutBase {
  /** O par checado, na ordem em que deve aparecer no título ("Losartana", "Ibuprofeno"). */
  remedios: readonly [string, string];
  nivelTitulo?: 2 | 3 | 4;
}

export type InteractionCalloutProps = InteractionCalloutBase &
  (
    | {
        /** Onde a frase foi achada. Decide o nível. */
        secao: SecaoDaInteracao;
        /** Obrigatória quando há seção: a frase da bula sempre aparece como evidência. */
        evidencia: EvidenciaDaBula;
      }
    | {
        /** `null`: nenhuma frase achada para o par. */
        secao: null;
        evidencia?: never;
      }
  );

function comInicialMinuscula(texto: string) {
  return texto.charAt(0).toLocaleLowerCase('pt-BR') + texto.slice(1);
}

/** O que a bula diz sobre um par de remédios, com a frase da bula como evidência. */
export function InteractionCallout({ remedios, secao, evidencia, nivelTitulo = 3 }: InteractionCalloutProps) {
  const nivel = nivelDaInteracao(secao);
  const { titulo, acao } = TEXTOS_DA_INTERACAO[nivel];
  const [primeiro, segundo] = remedios;
  return (
    <Alert
      tom={TOM_DO_NIVEL[nivel]}
      nivelTitulo={nivelTitulo}
      titulo={`${primeiro} e ${segundo.toLocaleLowerCase('pt-BR')}: ${comInicialMinuscula(titulo)}`}
    >
      <p>{acao}</p>
      {secao && evidencia ? (
        <figure className="mt-2">
          <blockquote className="text-apoio italic">“{evidencia.frase}”</blockquote>
          <figcaption className="text-apoio font-bold">
            {evidencia.remedio}, seção {NUMERO_DA_SECAO[secao]}
          </figcaption>
        </figure>
      ) : null}
    </Alert>
  );
}
```

`frontend/packages/ui/src/components/InteractionCallout/index.ts`:

```ts
export {
  InteractionCallout,
  NUMERO_DA_SECAO,
  TEXTOS_DA_INTERACAO,
  nivelDaInteracao,
  type EvidenciaDaBula,
  type InteractionCalloutProps,
  type NivelDaInteracao,
  type SecaoDaInteracao,
} from './InteractionCallout';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/InteractionCallout/
```

Esperado: `Tests  5 passed (5)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InteractionCallout } from './InteractionCallout';

const meta = {
  title: 'Componentes/Domínio/InteractionCallout',
  component: InteractionCallout,
} satisfies Meta<typeof InteractionCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NaoUsarJunto: Story = {
  name: 'Não usar junto',
  args: {
    remedios: ['Varfarina', 'Ácido acetilsalicílico'],
    secao: 'contraindicacao',
    evidencia: {
      frase:
        'Não use este medicamento junto com ácido acetilsalicílico sem orientação médica, pelo risco aumentado de sangramento.',
      remedio: 'Varfarina',
    },
  },
};

export const PedeCuidado: Story = {
  name: 'Pede cuidado',
  args: {
    remedios: ['Losartana', 'Ibuprofeno'],
    secao: 'precaucoes_interacoes',
    evidencia: {
      frase: 'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana.',
      remedio: 'Losartana',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('note')).toHaveTextContent('Losartana, seção 4');
  },
};

export const NaoFala: Story = {
  name: 'Não fala',
  args: { remedios: ['Ibuprofeno', 'Metformina'], secao: null },
  play: async ({ canvas }) => {
    const aviso = canvas.getByRole('note');
    await expect(aviso).toHaveTextContent('Isso não garante que seja seguro.');
    // Fundo neutro: nem verde, nem branco liso.
    await expect(getComputedStyle(aviso).backgroundColor).toBe('rgb(241, 244, 249)');
  },
};

export const AltoContraste: Story = {
  name: 'Não usar junto no alto contraste',
  args: NaoUsarJunto.args,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    const estilo = getComputedStyle(canvas.getByRole('note'));
    await expect(estilo.borderTopWidth).toBe('2px');
    await expect(estilo.borderInlineStartWidth).toBe('10px');
  },
};

export const TextoGrande: Story = {
  name: 'Texto em 140%',
  args: PedeCuidado.args,
  globals: { escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/InteractionCallout/
```

Esperado: `Tests  5 passed (5)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/InteractionCallout/InteractionCallout.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './InteractionCallout.stories';

<Meta of={Stories} />

# InteractionCallout

Mostra o que a bula diz sobre um par de remédios, com a frase da bula como prova.

## Exemplo

<Canvas of={Stories.PedeCuidado} />

## Quando usar

Na resposta, logo depois do botão Ouvir, uma vez para cada par checado pelo agente de interações. Os pares com frase achada vêm antes dos pares sem menção.

## Quando não usar

- Para bloqueio por dose ou grupo especial, use `SafetyNotice`.
- Para emergência, use `EmergencyCard`.
- Para qualquer outro aviso da tela, use `Alert`.

## Anatomia

- Ícone do nível (proibido, alerta ou informação), sempre junto com a cor.
- Título com o par e o nível: "Losartana e ibuprofeno: a bula pede cuidado com essa combinação".
- Ação: o que fazer agora.
- Evidência: a frase da bula entre aspas, com o remédio e a seção ("Losartana, seção 4"). Só nos dois primeiros níveis.

## Os três níveis

O agente de interações não classifica gravidade. Ele acha, na bula de um remédio, frases que citam o outro. O nível sai só da seção onde a frase foi achada, e quem usa o componente não escolhe tom nem cor.

<Canvas of={Stories.NaoUsarJunto} />

<Canvas of={Stories.NaoFala} />

O terceiro nível nunca é verde e sempre traz "Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico." Não achar menção não quer dizer que a combinação é segura (risco R4).

## Props

<ArgTypes of={Stories} />

`secao` é `'contraindicacao'`, `'precaucoes_interacoes'` ou `null`. Com seção, `evidencia` é obrigatória: o TypeScript não compila sem ela.

## Estados

O componente não tem estado interativo. As variações são os três níveis, o alto contraste e o texto grande:

<Canvas of={Stories.AltoContraste} />

<Canvas of={Stories.TextoGrande} />

## Acessibilidade

- Papel `note`: o aviso faz parte da resposta e é lido na ordem, sem interromper. O foco vai para a frase-resposta, logo acima.
- O título é um `h3` (ou o nível pedido em `nivelTitulo`) e já diz o par e o nível. O ícone é decorativo, porque o título diz tudo.
- A frase da bula fica num `blockquote` dentro de `figure`, com a fonte no `figcaption`.
- No alto contraste, o aviso ganha contorno preto de 2px e a barra lateral vai a 10px.
- No A+ de 140%, o título quebra com hífen e a tela não rola para o lado.

## Conteúdo

Todos os textos ficam em `TEXTOS_DA_INTERACAO`, no próprio componente. O título do primeiro nível ainda depende da validação com as bulas reais (spec, "Validar antes de fechar o texto"): se aparecerem falsos "não usar junto", ele vira "A bula cita essa combinação em 'Quando não usar'", com a ação "Fale com o médico antes de usar os dois juntos.". A troca é numa linha só.

A frase da bula aparece como veio, sem resumo. Regra 6 de Conteúdo e voz: honestidade sobre o que não sabemos.

## Faça e não faça

- Faça: mostre a frase da bula sempre que houver uma.
- Faça: ponha os pares com frase achada antes dos pares sem menção.
- Não faça: escrever "Pode tomar junto" ou pintar de verde o nível "não fala".
- Não faça: esconder a evidência atrás de um "ver mais".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/InteractionCallout
git commit -m "feat(ui): InteractionCallout com os três níveis de interação (#25)"
```

---

### Tarefa B2: `EmergencyCard`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/EmergencyCard/exemplos.ts`, `frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.test.tsx`, `frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.tsx`, `frontend/packages/ui/src/components/EmergencyCard/index.ts`, `frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.stories.tsx`, `frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.mdx`

O cartão de emergência no estilo do NHS. Mostra exatamente o título, a mensagem e os contatos recebidos, na ordem recebida. Os dados de exemplo seguem a spec: intoxicação com SAMU 192, Disque-Intoxicação 0800 722 6001 e o "enquanto espera"; autolesão com tom acolhedor, CVV 188 primeiro e sem "enquanto espera". Os botões de ligar são links `tel:` com `min-h-14` (56px). O espaço entre "Ligar SAMU" e "192" é um texto de verdade (`{' '}`), para o nome acessível não sair grudado ("Ligar SAMU192").

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/EmergencyCard/exemplos.ts`:

```ts
// Dados de exemplo para stories, testes e páginas de Padrões. No app, tudo isso vem do backend
// (categoria_risco "emergencia", mensagem e contatos). Não é exportado pelo pacote.
import type { EmergencyCardProps } from './EmergencyCard';

/** Intoxicação: SAMU primeiro, Disque-Intoxicação depois, e a orientação de espera. */
export const intoxicacao = {
  titulo: 'Isso pode ser uma emergência',
  mensagem: 'Ligue agora para o SAMU ou para o Disque-Intoxicação. Tenha a caixa ou a bula do remédio em mãos.',
  contatos: [
    { numero: '192', nome: 'SAMU' },
    { numero: '08007226001', nome: 'Disque-Intoxicação', detalhe: 'grátis, 24h' },
  ],
  enquantoEspera: 'Não provoque vômito sem orientação.',
} satisfies EmergencyCardProps;

/** Autolesão: tom acolhedor, CVV 188 primeiro e nenhuma orientação de intoxicação. */
export const autolesao = {
  titulo: 'Ligue agora para o CVV',
  mensagem:
    'Sinto muito que você esteja passando por isso. Você tem com quem contar. Ligue agora para o CVV, de graça e a qualquer hora, ou para o SAMU.',
  contatos: [
    { numero: '188', nome: 'CVV', detalhe: 'grátis, 24h' },
    { numero: '192', nome: 'SAMU' },
  ],
} satisfies EmergencyCardProps;
```

`frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmergencyCard, formatarTelefone } from './EmergencyCard';
import { autolesao, intoxicacao } from './exemplos';

const hrefs = () => screen.getAllByRole('link').map((link) => link.getAttribute('href'));

afterEach(() => vi.restoreAllMocks());

describe('EmergencyCard', () => {
  it('autolesão: CVV 188 primeiro e nada de "enquanto espera"', () => {
    render(<EmergencyCard {...autolesao} />);
    expect(screen.getByRole('alert')).toHaveAccessibleName('Ligue agora para o CVV');
    expect(hrefs()).toEqual(['tel:188', 'tel:192']);
    expect(screen.getAllByRole('link')[0]).toHaveAccessibleName('Ligar CVV 188 · grátis, 24h');
    expect(screen.queryByText('Enquanto espera')).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('vômito');
  });

  it('intoxicação: SAMU, Disque-Intoxicação com o número agrupado e o "enquanto espera"', () => {
    render(<EmergencyCard {...intoxicacao} />);
    expect(hrefs()).toEqual(['tel:192', 'tel:08007226001']);
    expect(screen.getByRole('link', { name: 'Ligar Disque-Intoxicação 0800 722 6001 · grátis, 24h' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Enquanto espera');
    expect(screen.getByRole('note')).toHaveTextContent('Não provoque vômito sem orientação.');
  });

  it('mantém a ordem recebida, mesmo que pareça "fora de ordem"', () => {
    render(<EmergencyCard {...autolesao} contatos={[...autolesao.contatos].reverse()} />);
    expect(hrefs()).toEqual(['tel:192', 'tel:188']);
  });

  it('o cartão só tem o texto que veio por props', () => {
    render(<EmergencyCard {...intoxicacao} />);
    const cartao = screen.getByRole('alert');
    const contatos = within(cartao)
      .getAllByRole('link')
      .map((link) => link.textContent)
      .join('');
    expect(cartao.textContent).toBe(
      intoxicacao.titulo + intoxicacao.mensagem + 'Ligar SAMU 192' + 'Ligar Disque-Intoxicação 0800 722 6001 · grátis, 24h',
    );
    expect(contatos).toBe('Ligar SAMU 192Ligar Disque-Intoxicação 0800 722 6001 · grátis, 24h');
  });

  it('botões de ligar com 56px ou mais (classe min-h-14)', () => {
    render(<EmergencyCard {...intoxicacao} />);
    for (const link of screen.getAllByRole('link')) expect(link).toHaveClass('min-h-14');
  });

  it('reclama no console se houver dois cartões na tela', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <>
        <EmergencyCard {...intoxicacao} />
        <EmergencyCard {...autolesao} />
      </>,
    );
    expect(erro).toHaveBeenCalledWith(expect.stringContaining('mais de um cartão de emergência'));
  });

  it('formata o 0800 e deixa os números curtos como estão', () => {
    expect(formatarTelefone('08007226001')).toBe('0800 722 6001');
    expect(formatarTelefone('0800-722-6001')).toBe('0800 722 6001');
    expect(formatarTelefone('188')).toBe('188');
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/EmergencyCard/
```

Esperado: FAIL com `Failed to resolve import "./EmergencyCard"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.tsx`:

```tsx
import { Phone } from '@phosphor-icons/react';
import { useEffect, useId } from 'react';
import { Alert } from '../Alert';

/** Um telefone do cartão, montado pelo app a partir de `contatos` do backend. */
export interface ContatoDeEmergencia {
  /** O número como o backend manda ("188", "08007226001"). Vira o link tel:. */
  numero: string;
  /** Quem atende ("CVV", "SAMU", "Disque-Intoxicação"). */
  nome: string;
  /** Complemento que veio com o contato ("grátis, 24h"). */
  detalhe?: string;
}

export interface EmergencyCardProps {
  /** Título que veio do backend ("Isso pode ser uma emergência", "Ligue agora para o CVV"). */
  titulo: string;
  /** Mensagem que veio do backend, exatamente como veio. */
  mensagem: string;
  /** Telefones na ordem de prioridade do backend. O primeiro ganha o botão cheio. Nunca reordene. */
  contatos: readonly ContatoDeEmergencia[];
  /** Orientação de espera que veio do backend. Só a intoxicação tem. */
  enquantoEspera?: string;
  /** Na tela de emergência, o cartão é o título da página (h1). Dentro do histórico, h2. */
  nivelTitulo?: 1 | 2;
}

/** "08007226001" vira "0800 722 6001". Números curtos (188, 192) ficam como estão. */
export function formatarTelefone(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  const gratuito = /^(0800)(\d{3})(\d{4})$/.exec(digitos);
  return gratuito ? `${gratuito[1]} ${gratuito[2]} ${gratuito[3]}` : digitos;
}

const SELETOR = '[data-cartao-emergencia]';

/**
 * Cartão de emergência no estilo do NHS. Substitui a resposta inteira e mostra só o que o backend
 * mandou: título, mensagem e telefones, na ordem recebida. A interface não escreve texto de segurança.
 */
export function EmergencyCard({ titulo, mensagem, contatos, enquantoEspera, nivelTitulo = 2 }: EmergencyCardProps) {
  const idTitulo = useId();
  const Titulo = `h${nivelTitulo}` as const;

  useEffect(() => {
    if (document.querySelectorAll(SELETOR).length > 1) {
      console.error('EmergencyCard: há mais de um cartão de emergência na tela. Mostre só um, no topo.');
    }
  }, []);

  return (
    <div className="flex max-w-medida flex-col gap-4">
      <section
        role="alert"
        aria-labelledby={idTitulo}
        data-cartao-emergencia=""
        className={
          'flex flex-col gap-3 rounded-controle bg-emergencia-fundo p-4 text-emergencia-texto ' +
          'alto-contraste:border-3 alto-contraste:border-text-default'
        }
      >
        <Titulo id={idTitulo} className="font-voz text-resposta font-semibold hyphens-auto wrap-anywhere">
          {titulo}
        </Titulo>
        <p className="text-corpo">{mensagem}</p>
        <ul className="flex flex-col gap-3">
          {contatos.map((contato, posicao) => (
            <li key={`${contato.numero}-${posicao}`}>
              <a
                href={`tel:${contato.numero.replace(/\D/g, '')}`}
                className={
                  'flex min-h-14 items-center justify-center gap-3 rounded-controle px-4 py-2 no-underline ' +
                  'focus-visible:foco-visivel ' +
                  (posicao === 0
                    ? 'bg-emergencia-botao-fundo text-emergencia-botao-texto'
                    : 'border-(length:--bc-borda-controle) border-emergencia-texto text-emergencia-texto')
                }
              >
                <Phone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
                <span className="flex flex-col">
                  <span className="text-titulo-3 font-bold">Ligar {contato.nome}</span>{' '}
                  <span className="text-apoio">
                    {formatarTelefone(contato.numero)}
                    {contato.detalhe ? ` · ${contato.detalhe}` : ''}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      {enquantoEspera ? (
        <Alert tom="info" titulo="Enquanto espera" nivelTitulo={nivelTitulo === 1 ? 2 : 3}>
          {enquantoEspera}
        </Alert>
      ) : null}
      <p className="text-apoio text-text-muted">Se a ligação não abrir pelo botão, disque o número direto no telefone.</p>
    </div>
  );
}
```

`frontend/packages/ui/src/components/EmergencyCard/index.ts`:

```ts
export { EmergencyCard, formatarTelefone, type ContatoDeEmergencia, type EmergencyCardProps } from './EmergencyCard';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/EmergencyCard/
```

Esperado: `Tests  7 passed (7)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EmergencyCard } from './EmergencyCard';
import { autolesao, intoxicacao } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/EmergencyCard',
  component: EmergencyCard,
} satisfies Meta<typeof EmergencyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Intoxicacao: Story = {
  name: 'Intoxicação',
  args: intoxicacao,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(56);
    }
  },
};

export const Autolesao: Story = {
  name: 'Autolesão',
  args: autolesao,
  play: async ({ canvas }) => {
    const [primeiro] = canvas.getAllByRole('link');
    await expect(primeiro).toHaveAttribute('href', 'tel:188');
    await expect(canvas.queryByText('Enquanto espera')).toBeNull();
  },
};

export const AltoContraste: Story = {
  name: 'Intoxicação no alto contraste',
  args: intoxicacao,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    const estilo = getComputedStyle(canvas.getByRole('alert'));
    await expect(estilo.borderTopWidth).toBe('3px');
    await expect(estilo.backgroundColor).toBe('rgb(122, 14, 6)');
  },
};

export const TextoGrande: Story = {
  name: 'Autolesão com texto em 140%',
  args: autolesao,
  globals: { escala: '140' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(56);
    }
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/EmergencyCard/
```

Esperado: `Tests  4 passed (4)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/EmergencyCard/EmergencyCard.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './EmergencyCard.stories';

<Meta of={Stories} />

# EmergencyCard

Cartão de emergência: substitui a resposta inteira e leva direto aos telefones.

## Exemplo

<Canvas of={Stories.Intoxicacao} />

## Quando usar

Quando a `categoria_risco` da resposta é `emergencia` (intoxicação, overdose ou autolesão). O cartão fica sempre no topo e aparece no máximo uma vez por tela.

## Quando não usar

- Para bloqueio por dose ou grupo especial, use `SafetyNotice`.
- Para a faixa fixa "Emergência? Ligue 192", use `EmergencyBar`.
- Nunca para avisos de interação: esses são `InteractionCallout`.

## Anatomia

- Título e mensagem, os dois vindos do backend.
- Um botão de ligar para cada contato, na ordem recebida. O primeiro é cheio (branco sobre o vermelho), os outros têm contorno.
- "Enquanto espera", só quando o backend manda essa orientação.
- Uma linha de apoio: "Se a ligação não abrir pelo botão, disque o número direto no telefone."

## Props

<ArgTypes of={Stories} />

Cada contato tem `numero` (como o backend manda, "08007226001"), `nome` ("Disque-Intoxicação") e `detalhe` opcional ("grátis, 24h"). O componente só agrupa os dígitos do 0800 e monta o link `tel:`.

## Estados

Os dois casos que o backend manda hoje:

<Canvas of={Stories.Autolesao} />

<Canvas of={Stories.AltoContraste} />

<Canvas of={Stories.TextoGrande} />

## Acessibilidade

- Papel `alert`, com o título como nome. O leitor de tela anuncia o cartão assim que ele aparece. Por isso só pode haver um por tela, e o componente reclama no console se encontrar dois.
- Os botões de ligar são links `tel:` com 56px de altura ou mais, nos três tamanhos de texto. O nome de cada um é "Ligar CVV 188 · grátis, 24h".
- O ícone de telefone é decorativo.
- No alto contraste, o cartão fica em `#7A0E06` com contorno preto de 3px.

## Conteúdo

O texto de segurança tem uma fonte só: o backend, que é baseado em regras e testado (`seguranca.py`). O componente mostra exatamente o título, a mensagem e os contatos que recebe, na ordem em que vierem. Para autolesão, a mensagem é acolhedora, o CVV 188 vem primeiro e não há "enquanto espera". Para intoxicação, vêm o SAMU, o Disque-Intoxicação e o "enquanto espera".

Os únicos textos da interface são o "Ligar" de cada botão, o título "Enquanto espera" e a linha de apoio no fim.

## Faça e não faça

- Faça: passe os contatos na ordem do backend, sem reordenar.
- Faça: deixe a `EmergencyBar` na tela junto com o cartão.
- Não faça: escrever ou completar a mensagem na interface, nem para "suavizar".
- Não faça: mostrar orientações de intoxicação numa pergunta de autolesão.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/EmergencyCard
git commit -m "feat(ui): EmergencyCard só com o texto e os contatos do backend (#25)"
```

---

### Tarefa B3: `SafetyNotice`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/SafetyNotice/exemplos.ts`, `frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.test.tsx`, `frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.tsx`, `frontend/packages/ui/src/components/SafetyNotice/index.ts`, `frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.stories.tsx`, `frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.mdx`

O bloqueio por mudança de dose ou grupo especial: fundo neutro com contorno de 2px, nunca vermelho, papel `note`. Título e mensagem vêm de fora, e a ação de saída é opcional. Recebe o foco como a frase-resposta, porque fica no lugar dela.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/SafetyNotice/exemplos.ts`:

```ts
// Dados de exemplo. No app, título e mensagem vêm do backend (categoria_risco). Não é exportado.
import type { SafetyNoticeProps } from './SafetyNotice';

export const alteracaoDeDose = {
  titulo: 'Isso só o médico pode orientar',
  mensagem:
    'Não posso orientar sobre mudança de dose, suspensão ou troca de remédio. Isso deve ser decidido pelo médico que fez a receita. Fale com ele ou com o farmacêutico.',
} satisfies SafetyNoticeProps;

export const grupoEspecial = {
  titulo: 'Esse caso precisa de um profissional',
  mensagem:
    'Para gestantes, lactantes, crianças e pessoas idosas, a bula sozinha não dá conta do cuidado individual. Fale com o médico ou com o farmacêutico antes de usar qualquer remédio.',
} satisfies SafetyNoticeProps;
```

`frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SafetyNotice } from './SafetyNotice';
import { alteracaoDeDose, grupoEspecial } from './exemplos';

describe('SafetyNotice', () => {
  it('mostra o título e a mensagem do backend, sem acrescentar nada', () => {
    render(<SafetyNotice {...alteracaoDeDose} />);
    const aviso = screen.getByRole('note');
    expect(screen.getByRole('heading', { level: 2, name: alteracaoDeDose.titulo })).toBeInTheDocument();
    expect(aviso.textContent).toBe(alteracaoDeDose.titulo + alteracaoDeDose.mensagem);
  });

  it('não é vermelho nem interrompe o leitor de tela', () => {
    render(<SafetyNotice {...grupoEspecial} />);
    const aviso = screen.getByRole('note');
    expect(aviso.className).not.toMatch(/danger|emergencia|confirm/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tem uma saída opcional', async () => {
    const onPress = vi.fn();
    render(<SafetyNotice {...alteracaoDeDose} acao={{ rotulo: 'Fazer outra pergunta', onPress }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fazer outra pergunta' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('leva o foco ao título quando pedido e expõe o título por ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<SafetyNotice {...alteracaoDeDose} focarAoMontar ref={ref} />);
    const titulo = screen.getByRole('heading', { name: alteracaoDeDose.titulo });
    expect(titulo).toHaveFocus();
    expect(ref.current).toBe(titulo);
  });

  it('não aceita tom', () => {
    // @ts-expect-error o bloqueio tem um tom só, e ele não é de perigo
    const elemento = <SafetyNotice {...alteracaoDeDose} tom="perigo" />;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SafetyNotice/
```

Esperado: FAIL com `Failed to resolve import "./SafetyNotice"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.tsx`:

```tsx
import { Info } from '@phosphor-icons/react';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { Button } from '../Button';

export interface SafetyNoticeProps {
  /** Título que veio do backend ("Isso só o médico pode orientar"). */
  titulo: string;
  /** Mensagem do bloqueio, exatamente como veio do backend. */
  mensagem: string;
  /** Saída opcional, escrita pela interface ("Fazer outra pergunta"). */
  acao?: { rotulo: string; onPress: () => void };
  /** Quando o bloqueio é a resposta da página, use 1. No histórico de respostas, 2. */
  nivelTitulo?: 1 | 2 | 3;
  /** Leva o foco ao título quando o aviso aparece no lugar da resposta. */
  focarAoMontar?: boolean;
  /** O título, para quem quiser levar o foco na hora certa. */
  ref?: Ref<HTMLHeadingElement>;
}

/**
 * Bloqueio por mudança de dose (`alteracao_dose`) ou grupo especial (`grupo_especial`). Firme sem ser
 * alarmante: fundo neutro, nunca vermelho. Emergência e autolesão usam o EmergencyCard.
 */
export function SafetyNotice({ titulo, mensagem, acao, nivelTitulo = 2, focarAoMontar = false, ref }: SafetyNoticeProps) {
  const Titulo = `h${nivelTitulo}` as const;
  const refDoTitulo = useRef<HTMLHeadingElement>(null);
  useImperativeHandle(ref, () => refDoTitulo.current as HTMLHeadingElement, []);

  useEffect(() => {
    if (focarAoMontar) refDoTitulo.current?.focus();
  }, [focarAoMontar]);

  return (
    <div
      role="note"
      className={
        'flex max-w-medida gap-3 rounded-aviso border-(length:--bc-borda-controle) border-border-field ' +
        'bg-surface-info p-4 text-text-default'
      }
    >
      <Info size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Titulo
            ref={refDoTitulo}
            tabIndex={-1}
            className="text-titulo-3 font-bold hyphens-auto wrap-anywhere focus:outline-none"
          >
            {titulo}
          </Titulo>
          <p className="text-corpo">{mensagem}</p>
        </div>
        {acao ? (
          <div>
            <Button variante="secundaria" onPress={acao.onPress}>
              {acao.rotulo}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

`frontend/packages/ui/src/components/SafetyNotice/index.ts`:

```ts
export { SafetyNotice, type SafetyNoticeProps } from './SafetyNotice';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/SafetyNotice/
```

Esperado: `Tests  5 passed (5)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SafetyNotice } from './SafetyNotice';
import { alteracaoDeDose, grupoEspecial } from './exemplos';

const meta = {
  title: 'Componentes/Domínio/SafetyNotice',
  component: SafetyNotice,
} satisfies Meta<typeof SafetyNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MudancaDeDose: Story = {
  name: 'Mudança de dose',
  args: { ...alteracaoDeDose, acao: { rotulo: 'Fazer outra pergunta', onPress: fn() } },
};

export const GrupoEspecial: Story = {
  name: 'Grupo especial',
  args: grupoEspecial,
  play: async ({ canvas }) => {
    // Neutro: o mesmo fundo do aviso informativo.
    await expect(getComputedStyle(canvas.getByRole('note')).backgroundColor).toBe('rgb(241, 244, 249)');
  },
};

export const ComFoco: Story = {
  name: 'Recebe o foco ao aparecer',
  args: { ...alteracaoDeDose, focarAoMontar: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: alteracaoDeDose.titulo })).toHaveFocus();
  },
};

export const AltoContraste: Story = {
  name: 'Mudança de dose no alto contraste',
  args: MudancaDeDose.args,
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('note')).borderTopColor).toBe('rgb(0, 0, 0)');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/SafetyNotice/
```

Esperado: `Tests  4 passed (4)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/SafetyNotice/SafetyNotice.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './SafetyNotice.stories';

<Meta of={Stories} />

# SafetyNotice

Aviso de bloqueio: explica por que o Bula Clara não responde e aponta o próximo passo.

## Exemplo

<Canvas of={Stories.MudancaDeDose} />

## Quando usar

Quando a `categoria_risco` é `alteracao_dose` (dobrar, parar ou trocar remédio) ou `grupo_especial` (gestantes, lactantes, crianças e pessoas idosas). O aviso fica no lugar da resposta.

## Quando não usar

- Para emergência e autolesão, use `EmergencyCard`.
- Para interação entre remédios, use `InteractionCallout`.
- Para erro da tela (sem conexão, API fora do ar), use `Alert`.

## Anatomia

- Ícone de informação.
- Título e mensagem, vindos do backend.
- Ação opcional, escrita pela interface ("Fazer outra pergunta").

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.GrupoEspecial} />

<Canvas of={Stories.ComFoco} />

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

- Papel `note`. Não interrompe o leitor de tela: com `focarAoMontar`, o foco vai para o título (`tabIndex={-1}`) e a leitura começa dali, como na frase-resposta.
- O título também fica disponível por `ref`, para o app levar o foco na hora certa.
- Contorno de 2px em `border-field`, que no alto contraste fica preto.

## Conteúdo

O bloqueio é firme sem ser alarmante: fundo neutro, nunca vermelho, porque um bloqueio não quer dizer perigo. O título e a mensagem vêm do backend. A ação diz o que fazer ("Fazer outra pergunta"), nunca "OK". Regra 5 de Conteúdo e voz: toda recusa vem com o próximo passo.

## Faça e não faça

- Faça: logo abaixo, ofereça perguntas que o Bula Clara pode responder ("Para que serve a losartana?").
- Não faça: pintar de vermelho ou usar `role="alert"`.
- Não faça: sugerir pergunta sobre dose, troca ou suspensão, que seria bloqueada de novo.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/SafetyNotice
git commit -m "feat(ui): SafetyNotice para bloqueios (#25)"
```

---

### Tarefa B4: `EmergencyBar`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.test.tsx`, `frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.tsx`, `frontend/packages/ui/src/components/EmergencyBar/index.ts`, `frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.stories.tsx`, `frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.mdx`

"Emergência? Ligue 192", fixa logo abaixo do topo de toda tela. O texto não é prop. A posição fixa é do layout do app.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmergencyBar } from './EmergencyBar';

describe('EmergencyBar', () => {
  it('liga para o 192 sem precisar de nenhuma prop', () => {
    render(<EmergencyBar />);
    const faixa = screen.getByRole('link', { name: 'Emergência? Ligue 192' });
    expect(faixa).toHaveAttribute('href', 'tel:192');
    expect(faixa).toHaveClass('min-h-12');
  });

  it('pode levar para a página de contatos, com o mesmo texto', () => {
    render(<EmergencyBar href="/emergencia" />);
    expect(screen.getByRole('link', { name: 'Emergência? Ligue 192' })).toHaveAttribute('href', '/emergencia');
  });

  it('o texto é fixo', () => {
    // @ts-expect-error a faixa não recebe texto: é sempre "Emergência? Ligue 192"
    const elemento = <EmergencyBar>Ligue já</EmergencyBar>;
    expect(elemento).toBeTruthy();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/EmergencyBar/
```

Esperado: FAIL com `Failed to resolve import "./EmergencyBar"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.tsx`:

```tsx
import { Phone } from '@phosphor-icons/react';

export interface EmergencyBarProps {
  /**
   * Para onde a faixa leva. Por padrão liga direto para o 192. O app pode apontar para a página de
   * contatos de emergência, mas o texto da faixa não muda.
   */
  href?: string;
}

/**
 * Faixa "Emergência? Ligue 192", logo abaixo do topo, em todas as telas. Nunca some, nem no
 * carregamento nem num erro. A posição fixa é do layout do app.
 */
export function EmergencyBar({ href = 'tel:192' }: EmergencyBarProps) {
  return (
    <a
      href={href}
      className={
        'flex min-h-12 items-center gap-2 bg-faixa-emergencia-fundo px-4 py-2 text-apoio font-bold ' +
        'text-faixa-emergencia-texto no-underline focus-visible:foco-visivel ' +
        'alto-contraste:border-b-3 alto-contraste:border-faixa-emergencia-texto'
      }
    >
      <Phone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
      Emergência? Ligue 192
    </a>
  );
}
```

`frontend/packages/ui/src/components/EmergencyBar/index.ts`:

```ts
export { EmergencyBar, type EmergencyBarProps } from './EmergencyBar';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/EmergencyBar/
```

Esperado: `Tests  3 passed (3)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EmergencyBar } from './EmergencyBar';

const meta = {
  title: 'Componentes/Domínio/EmergencyBar',
  component: EmergencyBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmergencyBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  play: async ({ canvas }) => {
    const faixa = canvas.getByRole('link', { name: 'Emergência? Ligue 192' });
    await expect(faixa.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

export const AltoContraste: Story = {
  name: 'Alto contraste',
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('link')).borderBottomWidth).toBe('3px');
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/EmergencyBar/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/EmergencyBar/EmergencyBar.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './EmergencyBar.stories';

<Meta of={Stories} />

# EmergencyBar

Faixa fixa "Emergência? Ligue 192", logo abaixo do topo, em todas as telas.

## Exemplo

<Canvas of={Stories.Padrao} />

## Quando usar

Em toda tela do app, sempre: na primeira visita, na resposta, na ficha, em Meus remédios, durante o carregamento e nos erros.

## Quando não usar

Dentro de uma resposta de emergência, a faixa continua, mas quem leva aos telefones é o `EmergencyCard`. Não use a faixa como aviso de conteúdo.

## Anatomia

- Ícone de telefone, decorativo.
- O texto fixo "Emergência? Ligue 192".

## Props

<ArgTypes of={Stories} />

O texto não é prop. Só o destino pode mudar: por padrão, `tel:192`. O app pode apontar para a página de contatos de emergência.

## Estados

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

- É um link, e o nome é o próprio texto.
- 48px de altura ou mais, nos três tamanhos de texto.
- No alto contraste, ganha uma borda de 3px embaixo.
- A posição fixa (logo abaixo do cabeçalho) é do layout do app, que não deve cobrir o foco de outros elementos com ela.

## Conteúdo

Texto fixo, escrito pela interface e aprovado pelo grupo. Botões e links dizem a ação (regra 8).

## Faça e não faça

- Faça: mantenha a faixa visível mesmo quando a API cai ou a resposta vem fora do formato.
- Não faça: esconder a faixa para "limpar" a tela.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/EmergencyBar
git commit -m "feat(ui): EmergencyBar (#25)"
```

---

### Tarefa B5: Barrel, changeset e conferência do grupo

**Arquivos:**
- Modificar: `frontend/packages/ui/src/grupos/seguranca.ts`
- Criar: `frontend/.changeset/dominio-seguranca.md`

- [ ] **Passo 1: Barrel e changeset**

`frontend/packages/ui/src/grupos/seguranca.ts`:

```ts
// Grupo B do plano 3: segurança.
export * from '../components/EmergencyBar';
export * from '../components/EmergencyCard';
export * from '../components/InteractionCallout';
export * from '../components/SafetyNotice';
```

`frontend/.changeset/dominio-seguranca.md`:

```md
---
'@bula-clara/ui': minor
---

Componentes de segurança: InteractionCallout (os três níveis de interação, com a frase da bula como evidência), EmergencyCard, SafetyNotice e EmergencyBar.
```

- [ ] **Passo 2: Conferir o grupo**

```bash
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui test < /dev/null
pnpm --filter @bula-clara/ui exec vitest run --project unit < /dev/null
```

Esperado: lint e tipos sem erro, `Tests  209 passed (209)` no `ui` e `Tests  127 passed (127)` de unidade.

- [ ] **Passo 3: Commit**

```bash
git add frontend/packages/ui/src/grupos/seguranca.ts frontend/.changeset/dominio-seguranca.md
git commit -m "feat(ui): exporta os componentes de segurança (#25)"
```

---

## Grupo C: entrada

Seis componentes, na ordem: `OcrConfirm` e `TranscriptConfirm` usam o `CaptureConfirm`. Usam `IconButton`, `Button`, `Alert`, `Sheet` e `Campo/partes.tsx` do plano 2, e as simulações da Tarefa 1.

### Tarefa C1: `InputDock`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/InputDock/InputDock.test.tsx`, `frontend/packages/ui/src/components/InputDock/InputDock.tsx`, `frontend/packages/ui/src/components/InputDock/index.ts`, `frontend/packages/ui/src/components/InputDock/InputDock.stories.tsx`, `frontend/packages/ui/src/components/InputDock/InputDock.mdx`

A caixa de pergunta fixa no rodapé e a barra de navegação com três destinos, como no `canvas/Main.dc.html`. O campo é montado com as peças do React Aria e as classes de `Campo/partes.tsx`, porque o `TextField` do plano 2 sempre mostra o rótulo; aqui o rótulo fica `sr-only`. Com texto no campo, o microfone vira "Perguntar". Os links da barra são do React Aria, para usar o `RouterProvider` do app.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/InputDock/InputDock.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputDock, type InputDockProps } from './InputDock';

function montar(props: Partial<InputDockProps> = {}) {
  const funcoes = { onPerguntar: vi.fn(), onAbrirCamera: vi.fn(), onGravar: vi.fn() };
  render(<InputDock {...funcoes} destinoAtual="perguntar" {...props} />);
  return funcoes;
}

describe('InputDock', () => {
  it('o campo tem nome acessível, e o exemplo não é o rótulo', () => {
    montar();
    const campo = screen.getByRole('textbox', { name: 'Sua pergunta' });
    expect(campo).toHaveAttribute('placeholder', 'Escreva sua pergunta…');
    expect(campo).toHaveAttribute('enterkeyhint', 'send');
  });

  it('câmera e microfone têm nome e abrem cada um o seu fluxo', async () => {
    const { onAbrirCamera, onGravar } = montar();
    await userEvent.click(screen.getByRole('button', { name: 'Fotografar a caixa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar falando' }));
    expect(onAbrirCamera).toHaveBeenCalledOnce();
    expect(onGravar).toHaveBeenCalledOnce();
  });

  it('com texto, o microfone vira "Perguntar"; Enter também pergunta e limpa o campo', async () => {
    const { onPerguntar } = montar();
    const campo = screen.getByRole('textbox', { name: 'Sua pergunta' });
    await userEvent.type(campo, '  Para que serve a losartana?  ');
    expect(screen.queryByRole('button', { name: 'Perguntar falando' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar' }));
    expect(onPerguntar).toHaveBeenCalledWith('Para que serve a losartana?');
    expect(campo).toHaveValue('');
    await userEvent.type(campo, 'Como tomar a losartana?{Enter}');
    expect(onPerguntar).toHaveBeenLastCalledWith('Como tomar a losartana?');
  });

  it('não pergunta com o campo vazio', async () => {
    const { onPerguntar } = montar();
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onPerguntar).not.toHaveBeenCalled();
  });

  it('a barra tem três destinos e marca o atual', () => {
    montar({ destinoAtual: 'remedios', rotuloCampo: 'Outra pergunta' });
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const links = Array.from(nav.querySelectorAll('a'));
    expect(links.map((link) => link.textContent)).toEqual(['Perguntar', 'Meus remédios', 'Sobre']);
    expect(screen.getByRole('link', { name: 'Meus remédios' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Perguntar' })).not.toHaveAttribute('aria-current');
    for (const link of links) expect(link).toHaveClass('min-h-14', 'text-apoio');
    expect(screen.getByRole('textbox', { name: 'Outra pergunta' })).toBeInTheDocument();
  });

  it('sem a caixa, fica só a navegação', () => {
    montar({ mostrarCaixa: false });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/InputDock/
```

Esperado: FAIL com `Failed to resolve import "./InputDock"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/InputDock/InputDock.tsx`:

```tsx
import { Camera, ChatCircleText, Info, Microphone, PaperPlaneRight, Pill, type Icon } from '@phosphor-icons/react';
import { useState, type FormEvent } from 'react';
import { Link as AriaLink, Input, Label, TextField as AriaTextField } from 'react-aria-components';
import { classesDaEntrada } from '../Campo/partes';
import { IconButton } from '../IconButton';

export type DestinoPrincipal = 'perguntar' | 'remedios' | 'sobre';

export interface InputDockProps {
  /** Recebe a pergunta digitada, já sem espaços nas pontas. Nunca recebe texto vazio. */
  onPerguntar: (pergunta: string) => void;
  /** Abre a câmera (CameraCapture). */
  onAbrirCamera: () => void;
  /** Abre a gravação (VoiceRecorder). */
  onGravar: () => void;
  /** A tela atual, marcada com aria-current="page" na barra de navegação. */
  destinoAtual: DestinoPrincipal;
  /** Endereços dos três destinos. O app usa o RouterProvider do React Aria para navegar sem recarregar. */
  enderecos?: Record<DestinoPrincipal, string>;
  /** Nome do campo, para o leitor de tela. Depois da primeira resposta: "Outra pergunta". */
  rotuloCampo?: string;
  /** Exemplo dentro do campo vazio. Nunca faz o papel do rótulo. */
  exemplo?: string;
  /** Sem a caixa de pergunta, só a barra de navegação (Meus remédios e Sobre). */
  mostrarCaixa?: boolean;
}

const destinos: { id: DestinoPrincipal; texto: string; icone: Icon }[] = [
  { id: 'perguntar', texto: 'Perguntar', icone: ChatCircleText },
  { id: 'remedios', texto: 'Meus remédios', icone: Pill },
  { id: 'sobre', texto: 'Sobre', icone: Info },
];

const enderecosPadrao: Record<DestinoPrincipal, string> = {
  perguntar: '/',
  remedios: '/meus-remedios',
  sobre: '/sobre',
};

/**
 * A caixa de pergunta fixa no rodapé (câmera, texto e microfone) e a barra de navegação com três
 * destinos. A posição fixa é do layout do app.
 */
export function InputDock({
  onPerguntar,
  onAbrirCamera,
  onGravar,
  destinoAtual,
  enderecos = enderecosPadrao,
  rotuloCampo = 'Sua pergunta',
  exemplo = 'Escreva sua pergunta…',
  mostrarCaixa = true,
}: InputDockProps) {
  const [pergunta, setPergunta] = useState('');
  const temTexto = pergunta.trim() !== '';

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!temTexto) return;
    onPerguntar(pergunta.trim());
    setPergunta('');
  }

  return (
    <div className="border-t border-border-subtle bg-surface-default">
      {mostrarCaixa ? (
        <form onSubmit={enviar} className="flex items-center gap-2 px-3 py-2">
          <IconButton variante="primaria" icone={Camera} aria-label="Fotografar a caixa" onPress={onAbrirCamera} />
          <AriaTextField value={pergunta} onChange={setPergunta} className="min-w-0 flex-1">
            <Label className="sr-only">{rotuloCampo}</Label>
            <Input placeholder={exemplo} enterKeyHint="send" className={classesDaEntrada} />
          </AriaTextField>
          {temTexto ? (
            <IconButton variante="primaria" icone={PaperPlaneRight} aria-label="Perguntar" type="submit" />
          ) : (
            <IconButton variante="primaria" icone={Microphone} aria-label="Perguntar falando" onPress={onGravar} />
          )}
        </form>
      ) : null}
      <nav aria-label="Principal" className="border-t border-border-subtle">
        <ul className="flex">
          {destinos.map(({ id, texto, icone: Icone }) => {
            const atual = id === destinoAtual;
            return (
              <li key={id} className="flex flex-1">
                <AriaLink
                  href={enderecos[id]}
                  aria-current={atual ? 'page' : undefined}
                  className={
                    'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 border-t-3 px-1 py-1 text-center ' +
                    'text-apoio no-underline data-focus-visible:foco-visivel ' +
                    (atual
                      ? 'border-action-primary font-bold text-action-primary'
                      : 'border-transparent text-text-muted data-hovered:text-action-primary')
                  }
                >
                  <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" />
                  {texto}
                </AriaLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
```

`frontend/packages/ui/src/components/InputDock/index.ts`:

```ts
export { InputDock, type DestinoPrincipal, type InputDockProps } from './InputDock';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/InputDock/
```

Esperado: `Tests  6 passed (6)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/InputDock/InputDock.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { InputDock } from './InputDock';

const meta = {
  title: 'Componentes/Domínio/InputDock',
  component: InputDock,
  parameters: { layout: 'fullscreen' },
  args: {
    destinoAtual: 'perguntar',
    enderecos: { perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' },
    onPerguntar: fn(),
    onAbrirCamera: fn(),
    onGravar: fn(),
  },
} satisfies Meta<typeof InputDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    }
  },
};

export const ComTexto: Story = {
  name: 'Com texto digitado',
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'Sua pergunta' }), 'Para que serve a losartana?');
    await userEvent.keyboard('{Enter}');
    await expect(args.onPerguntar).toHaveBeenCalledWith('Para que serve a losartana?');
  },
};

export const SoNavegacao: Story = {
  name: 'Só a navegação, em Meus remédios',
  args: { mostrarCaixa: false, destinoAtual: 'remedios' },
};

export const TextoGrande: Story = {
  name: 'Texto em 140%',
  globals: { escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/InputDock/
```

Esperado: `Tests  5 passed (5)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/InputDock/InputDock.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './InputDock.stories';

<Meta of={Stories} />

# InputDock

A caixa de pergunta fixa no rodapé, com texto, câmera e microfone, e a barra de navegação com três destinos.

## Exemplo

<Canvas of={Stories.Principal} />

## Quando usar

No rodapé de Perguntar e de cada resposta. Em Meus remédios e Sobre, só a barra de navegação (`mostrarCaixa={false}`), como nas telas aprovadas.

## Quando não usar

- Para a busca de remédios da lista, use o `ComboBox` do `MedicationList`.
- Para pedir texto longo, use `TextArea`.

## Anatomia

- Botão da câmera ("Fotografar a caixa"), na variante primária.
- O campo, com nome acessível ("Sua pergunta", ou "Outra pergunta" depois da primeira resposta) e um exemplo dentro.
- Botão do microfone ("Perguntar falando"). Com texto no campo, ele vira "Perguntar", que envia.
- A barra de navegação: Perguntar, Meus remédios e Sobre, cada um com ícone e texto.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.ComTexto} />

<Canvas of={Stories.SoNavegacao} />

<Canvas of={Stories.TextoGrande} />

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

- O rótulo do campo fica escondido da tela (`sr-only`) e é lido pelo leitor de tela. O exemplo nunca faz o papel do rótulo.
- Enter envia, e o teclado do celular mostra "Enviar" (`enterKeyHint="send"`).
- Câmera, microfone e enviar têm `aria-label` e 48px.
- A navegação é um `nav` chamado "Principal", com links. O destino atual leva `aria-current="page"` e é marcado por cor, negrito e uma borda em cima, nunca só pela cor.
- Cada destino tem 56px de altura e texto de 16px, que cresce com o A+.

## Conteúdo

Os textos são os das telas aprovadas: "Escreva sua pergunta…", "Fotografar a caixa", "Perguntar falando", "Perguntar", "Meus remédios" e "Sobre".

## Faça e não faça

- Faça: deixe a caixa sempre embaixo, para a próxima pergunta.
- Não faça: um campo só com placeholder, sem nome acessível.
- Não faça: abrir a câmera ou o microfone sem a pessoa tocar no botão.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/InputDock
git commit -m "feat(ui): InputDock com caixa de pergunta e navegação (#25)"
```

---

### Tarefa C2: `CaptureConfirm`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.test.tsx`, `frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.tsx`, `frontend/packages/ui/src/components/CaptureConfirm/index.ts`, `frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.stories.tsx`, `frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.mdx`

A folha de confirmação comum à foto e à voz, sobre a `Sheet` do plano 2. Só o botão de confirmar chama `onConfirmar`; corrigir, Esc e toque fora não confirmam.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CaptureConfirm } from './CaptureConfirm';

const textos = {
  rotulo: 'Li na caixa',
  titulo: 'Losartana potássica 50 mg',
  pergunta: 'É esse o remédio?',
  rotuloConfirmar: 'Sim, perguntar sobre ele',
  rotuloCorrigir: 'Não, vou digitar o nome',
};

describe('CaptureConfirm', () => {
  it('é uma folha com o que foi lido como nome', () => {
    render(<CaptureConfirm isOpen {...textos} onConfirmar={vi.fn()} onCorrigir={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Losartana potássica 50 mg' })).toBeInTheDocument();
    expect(screen.getByText('Li na caixa')).toBeInTheDocument();
    expect(screen.getByText('É esse o remédio?')).toBeInTheDocument();
  });

  it('nada acontece antes de a pessoa escolher', () => {
    const onConfirmar = vi.fn();
    render(<CaptureConfirm isOpen {...textos} onConfirmar={onConfirmar} onCorrigir={vi.fn()} />);
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it('confirmar fecha a folha e avisa', async () => {
    const onConfirmar = vi.fn();
    const onOpenChange = vi.fn();
    render(<CaptureConfirm isOpen onOpenChange={onOpenChange} {...textos} onConfirmar={onConfirmar} onCorrigir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sim, perguntar sobre ele' }));
    expect(onConfirmar).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('o caminho por digitação está sempre lá', async () => {
    const onCorrigir = vi.fn();
    render(<CaptureConfirm isOpen {...textos} onConfirmar={vi.fn()} onCorrigir={onCorrigir} />);
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou digitar o nome' }));
    expect(onCorrigir).toHaveBeenCalledOnce();
  });

  it('Esc fecha sem confirmar', async () => {
    const onConfirmar = vi.fn();
    const onOpenChange = vi.fn();
    render(<CaptureConfirm isOpen onOpenChange={onOpenChange} {...textos} onConfirmar={onConfirmar} onCorrigir={vi.fn()} />);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirmar).not.toHaveBeenCalled();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/CaptureConfirm/
```

Esperado: FAIL com `Failed to resolve import "./CaptureConfirm"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.tsx`:

```tsx
import { Check, type Icon } from '@phosphor-icons/react';
import { Button } from '../Button';
import { Sheet } from '../Sheet';

export interface CaptureConfirmProps {
  /** A folha aparece quando a leitura da foto ou a transcrição da voz chega. */
  isOpen: boolean;
  /** Esc ou toque fora fecham a folha sem perguntar nada. */
  onOpenChange?: (aberta: boolean) => void;
  /** Linha curta em caixa alta acima do título ("Li na caixa", "Entendi"). */
  rotulo: string;
  /** O que foi lido ou transcrito, em destaque. É o nome da folha para o leitor de tela. */
  titulo: string;
  /** A pergunta de confirmação ("É esse o remédio?"). */
  pergunta: string;
  /** Texto do botão principal ("Sim, perguntar sobre ele"). */
  rotuloConfirmar: string;
  iconeConfirmar?: Icon;
  /** Texto do caminho por digitação, que está sempre disponível ("Não, vou digitar o nome"). */
  rotuloCorrigir: string;
  /** Nota curta abaixo dos botões ("A foto é usada só para ler o nome e não é guardada."). */
  nota?: string;
  /** Só depois disso a pergunta vai para a API (risco R3). */
  onConfirmar: () => void;
  onCorrigir: () => void;
}

/**
 * Folha de confirmação comum à foto (OcrConfirm) e à voz (TranscriptConfirm). A pessoa sempre
 * confirma o que o sistema entendeu antes de a pergunta ir para a API.
 */
export function CaptureConfirm({
  isOpen,
  onOpenChange,
  rotulo,
  titulo,
  pergunta,
  rotuloConfirmar,
  iconeConfirmar = Check,
  rotuloCorrigir,
  nota,
  onConfirmar,
  onCorrigir,
}: CaptureConfirmProps) {
  return (
    <Sheet isOpen={isOpen} onOpenChange={onOpenChange} rotulo={rotulo} titulo={titulo}>
      {({ fechar }) => (
        <>
          <p className="text-corpo">{pergunta}</p>
          <Button
            larguraTotal
            icone={iconeConfirmar}
            onPress={() => {
              fechar();
              onConfirmar();
            }}
          >
            {rotuloConfirmar}
          </Button>
          <Button
            larguraTotal
            variante="secundaria"
            onPress={() => {
              fechar();
              onCorrigir();
            }}
          >
            {rotuloCorrigir}
          </Button>
          {nota ? <p className="text-apoio text-text-muted">{nota}</p> : null}
        </>
      )}
    </Sheet>
  );
}
```

`frontend/packages/ui/src/components/CaptureConfirm/index.ts`:

```ts
export { CaptureConfirm, type CaptureConfirmProps } from './CaptureConfirm';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/CaptureConfirm/
```

Esperado: `Tests  5 passed (5)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureConfirm } from './CaptureConfirm';

const meta = {
  title: 'Componentes/Domínio/CaptureConfirm',
  component: CaptureConfirm,
  args: {
    isOpen: true,
    rotulo: 'Li na caixa',
    titulo: 'Losartana potássica 50 mg',
    pergunta: 'É esse o remédio?',
    rotuloConfirmar: 'Sim, perguntar sobre ele',
    rotuloCorrigir: 'Não, vou digitar o nome',
    nota: 'A foto é usada só para ler o nome e não é guardada.',
    onConfirmar: fn(),
    onCorrigir: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof CaptureConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  play: async ({ canvasElement, args }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    await userEvent.click(await pagina.findByRole('button', { name: 'Sim, perguntar sobre ele' }));
    await expect(args.onConfirmar).toHaveBeenCalledOnce();
  },
};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/CaptureConfirm/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/CaptureConfirm/CaptureConfirm.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './CaptureConfirm.stories';

<Meta of={Stories} />

# CaptureConfirm

A folha de confirmação comum à foto e à voz: mostra o que o sistema entendeu e pergunta se está certo.

## Exemplo

<Canvas of={Stories.Principal} />

## Quando usar

Quase nunca direto: use `OcrConfirm` (foto) ou `TranscriptConfirm` (voz), que já trazem os textos. Use o `CaptureConfirm` só para uma nova forma de entrada que precise do mesmo passo de confirmação.

## Quando não usar

- Para confirmar uma ação que não dá para desfazer ("Apagar a lista?"), use `Dialog` com `papel="alertdialog"`.
- Para confirmar que algo deu certo, use `Toast`.

## Anatomia

- Rótulo em caixa alta ("Li na caixa").
- O que foi lido, em destaque e na fonte da resposta.
- A pergunta ("É esse o remédio?").
- Botão de confirmar, primário e na largura toda.
- Botão de corrigir por digitação, sempre presente.
- Nota opcional.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

- Usa o `Sheet`: papel `dialog`, com o que foi lido como nome. O foco entra na folha e volta quando ela fecha.
- Esc e toque fora fecham sem confirmar nada.
- Os dois botões têm 48px e a largura toda.

## Conteúdo

A pergunta só vai para a API depois do "sim". É isso que protege contra responder sobre o remédio errado (risco R3 em `docs/definicoes.md`). Os botões dizem a ação, e o caminho por digitação está sempre lá.

## Faça e não faça

- Faça: mostre exatamente o que foi lido, mesmo que pareça estranho.
- Não faça: mandar a pergunta sozinho, sem o "sim".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/CaptureConfirm
git commit -m "feat(ui): CaptureConfirm para confirmar antes de perguntar (#25)"
```

---

### Tarefa C3: `OcrConfirm`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.test.tsx`, `frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.tsx`, `frontend/packages/ui/src/components/OcrConfirm/index.ts`, `frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.stories.tsx`, `frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.mdx`

"Li na caixa: Losartana potássica 50 mg. É esse o remédio?", com os textos do plano 4. Sem leitura (`null`), a folha oferece "Tirar outra foto" e "Digitar o nome", sem nenhum "sim". As stories esperam a folha terminar de subir (`waitFor`) antes de conferir que está visível.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OcrConfirm } from './OcrConfirm';

const acoes = () => ({ onConfirmar: vi.fn(), onDigitar: vi.fn(), onTentarDeNovo: vi.fn() });

describe('OcrConfirm', () => {
  it('mostra o que leu e só pergunta depois do "sim"', async () => {
    const funcoes = acoes();
    render(<OcrConfirm isOpen medicamento="Losartana potássica 50 mg" {...funcoes} />);
    expect(screen.getByRole('dialog', { name: 'Losartana potássica 50 mg' })).toHaveTextContent('Li na caixa');
    expect(screen.getByText('A foto é usada só para ler o nome e não é guardada.')).toBeInTheDocument();
    expect(funcoes.onConfirmar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sim, perguntar sobre ele' }));
    expect(funcoes.onConfirmar).toHaveBeenCalledOnce();
  });

  it('"Não, vou digitar o nome" leva à digitação', async () => {
    const funcoes = acoes();
    render(<OcrConfirm isOpen medicamento="Losartana potássica 50 mg" {...funcoes} />);
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou digitar o nome' }));
    expect(funcoes.onDigitar).toHaveBeenCalledOnce();
    expect(funcoes.onConfirmar).not.toHaveBeenCalled();
  });

  it('sem leitura, oferece outra foto ou a digitação, e nunca um "sim"', async () => {
    const funcoes = acoes();
    render(<OcrConfirm isOpen medicamento={null} {...funcoes} />);
    expect(screen.getByRole('dialog', { name: 'Não consegui ler o nome na foto' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sim/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tirar outra foto' }));
    expect(funcoes.onTentarDeNovo).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/OcrConfirm/
```

Esperado: FAIL com `Failed to resolve import "./OcrConfirm"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.tsx`:

```tsx
import { Camera } from '@phosphor-icons/react';
import { CaptureConfirm } from '../CaptureConfirm';

export interface OcrConfirmProps {
  isOpen: boolean;
  onOpenChange?: (aberta: boolean) => void;
  /**
   * O que o /ler-caixa leu ("Losartana potássica 50 mg"). `null` quando nenhum remédio foi
   * reconhecido: aí a folha oferece outra foto ou a digitação.
   */
  medicamento: string | null;
  /** "Sim, perguntar sobre ele": só agora a pergunta vai para a API. */
  onConfirmar: () => void;
  /** "Não, vou digitar o nome" ou "Digitar o nome": leva ao campo de pergunta. */
  onDigitar: () => void;
  /** "Tirar outra foto", quando nada foi lido. */
  onTentarDeNovo: () => void;
}

/** "Li: Losartana potássica 50 mg. É esse o remédio?" Confirma a leitura da caixa (risco R3). */
export function OcrConfirm({ isOpen, onOpenChange, medicamento, onConfirmar, onDigitar, onTentarDeNovo }: OcrConfirmProps) {
  if (medicamento === null || medicamento.trim() === '') {
    return (
      <CaptureConfirm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        rotulo="Foto da caixa"
        titulo="Não consegui ler o nome na foto"
        pergunta="Tente com mais luz, ou digite o nome que está na caixa."
        rotuloConfirmar="Tirar outra foto"
        iconeConfirmar={Camera}
        rotuloCorrigir="Digitar o nome"
        onConfirmar={onTentarDeNovo}
        onCorrigir={onDigitar}
      />
    );
  }
  return (
    <CaptureConfirm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      rotulo="Li na caixa"
      titulo={medicamento}
      pergunta="É esse o remédio?"
      rotuloConfirmar="Sim, perguntar sobre ele"
      rotuloCorrigir="Não, vou digitar o nome"
      nota="A foto é usada só para ler o nome e não é guardada."
      onConfirmar={onConfirmar}
      onCorrigir={onDigitar}
    />
  );
}
```

`frontend/packages/ui/src/components/OcrConfirm/index.ts`:

```ts
export { OcrConfirm, type OcrConfirmProps } from './OcrConfirm';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/OcrConfirm/
```

Esperado: `Tests  3 passed (3)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { OcrConfirm } from './OcrConfirm';

const meta = {
  title: 'Componentes/Domínio/OcrConfirm',
  component: OcrConfirm,
  args: {
    isOpen: true,
    medicamento: 'Losartana potássica 50 mg',
    onConfirmar: fn(),
    onDigitar: fn(),
    onTentarDeNovo: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof OcrConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Leu: Story = {
  name: 'Leu o nome',
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('dialog', { name: 'Losartana potássica 50 mg' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};

export const NaoLeu: Story = {
  name: 'Não conseguiu ler',
  args: { medicamento: null },
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('button', { name: 'Tirar outra foto' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/OcrConfirm/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/OcrConfirm/OcrConfirm.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './OcrConfirm.stories';

<Meta of={Stories} />

# OcrConfirm

"Li: Losartana potássica 50 mg. É esse o remédio?" A confirmação da leitura da caixa.

## Exemplo

<Canvas of={Stories.Leu} />

## Quando usar

Depois da foto, quando o `/ler-caixa` (issue #24) responde. A folha abre por cima do `CameraCapture`.

## Quando não usar

Para a voz, use `TranscriptConfirm`.

## Anatomia

É um `CaptureConfirm` com os textos da foto: "Li na caixa", o nome lido, "É esse o remédio?", "Sim, perguntar sobre ele", "Não, vou digitar o nome" e "A foto é usada só para ler o nome e não é guardada.".

## Props

<ArgTypes of={Stories} />

## Estados

Quando nada foi lido (`medicamento={null}`), a folha diz "Não consegui ler o nome na foto" e oferece "Tirar outra foto" ou "Digitar o nome". Nunca aparece um "sim".

<Canvas of={Stories.NaoLeu} />

## Acessibilidade

A mesma do `CaptureConfirm`: papel `dialog`, com o nome lido como nome da folha.

## Conteúdo

A nota "A foto é usada só para ler o nome e não é guardada" só vale se o `/ler-caixa` de fato não guardar a imagem. Se isso mudar na #24, o texto muda junto.

## Faça e não faça

- Faça: mostre o nome com a dose, como está na caixa ("Losartana potássica 50 mg").
- Não faça: escolher sozinho o remédio mais parecido quando a leitura falhar.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/OcrConfirm
git commit -m "feat(ui): OcrConfirm (#25)"
```

---

### Tarefa C4: `TranscriptConfirm`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.test.tsx`, `frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.tsx`, `frontend/packages/ui/src/components/TranscriptConfirm/index.ts`, `frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.stories.tsx`, `frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.mdx`

"Entendi: “Posso tomar ibuprofeno com losartana?” Está certo?", com os textos do plano 4. Com a transcrição vazia, oferece "Gravar de novo" e "Escrever a pergunta".

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TranscriptConfirm } from './TranscriptConfirm';

const acoes = () => ({ onConfirmar: vi.fn(), onEscrever: vi.fn(), onGravarDeNovo: vi.fn() });

describe('TranscriptConfirm', () => {
  it('mostra o que entendeu entre aspas e só pergunta depois do "sim"', async () => {
    const funcoes = acoes();
    render(<TranscriptConfirm isOpen transcricao="Posso tomar ibuprofeno com losartana?" {...funcoes} />);
    expect(screen.getByRole('dialog', { name: '“Posso tomar ibuprofeno com losartana?”' })).toHaveTextContent('Entendi');
    expect(screen.getByText('Está certo?')).toBeInTheDocument();
    expect(funcoes.onConfirmar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sim, perguntar' }));
    expect(funcoes.onConfirmar).toHaveBeenCalledOnce();
  });

  it('"Não, vou escrever" leva à digitação', async () => {
    const funcoes = acoes();
    render(<TranscriptConfirm isOpen transcricao="Posso tomar ibuprofeno com losartana?" {...funcoes} />);
    await userEvent.click(screen.getByRole('button', { name: 'Não, vou escrever' }));
    expect(funcoes.onEscrever).toHaveBeenCalledOnce();
  });

  it('sem transcrição, oferece gravar de novo ou escrever', async () => {
    const funcoes = acoes();
    render(<TranscriptConfirm isOpen transcricao="  " {...funcoes} />);
    expect(screen.getByRole('dialog', { name: 'Não consegui entender a gravação' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Gravar de novo' }));
    expect(funcoes.onGravarDeNovo).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TranscriptConfirm/
```

Esperado: FAIL com `Failed to resolve import "./TranscriptConfirm"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.tsx`:

```tsx
import { Microphone } from '@phosphor-icons/react';
import { CaptureConfirm } from '../CaptureConfirm';

export interface TranscriptConfirmProps {
  isOpen: boolean;
  onOpenChange?: (aberta: boolean) => void;
  /** O que o /transcrever devolveu. Vazio quando nada foi entendido. */
  transcricao: string;
  /** "Sim, perguntar": só agora a pergunta vai para a API. */
  onConfirmar: () => void;
  /** "Não, vou escrever" ou "Escrever a pergunta": leva ao campo de pergunta. */
  onEscrever: () => void;
  /** "Gravar de novo", quando nada foi entendido. */
  onGravarDeNovo: () => void;
}

/** "Entendi: … Está certo?" Confirma a transcrição antes de perguntar. */
export function TranscriptConfirm({
  isOpen,
  onOpenChange,
  transcricao,
  onConfirmar,
  onEscrever,
  onGravarDeNovo,
}: TranscriptConfirmProps) {
  if (transcricao.trim() === '') {
    return (
      <CaptureConfirm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        rotulo="Pergunta falada"
        titulo="Não consegui entender a gravação"
        pergunta="Tente falar de novo, mais perto do aparelho, ou escreva a sua pergunta."
        rotuloConfirmar="Gravar de novo"
        iconeConfirmar={Microphone}
        rotuloCorrigir="Escrever a pergunta"
        onConfirmar={onGravarDeNovo}
        onCorrigir={onEscrever}
      />
    );
  }
  return (
    <CaptureConfirm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      rotulo="Entendi"
      titulo={`“${transcricao.trim()}”`}
      pergunta="Está certo?"
      rotuloConfirmar="Sim, perguntar"
      rotuloCorrigir="Não, vou escrever"
      onConfirmar={onConfirmar}
      onCorrigir={onEscrever}
    />
  );
}
```

`frontend/packages/ui/src/components/TranscriptConfirm/index.ts`:

```ts
export { TranscriptConfirm, type TranscriptConfirmProps } from './TranscriptConfirm';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/TranscriptConfirm/
```

Esperado: `Tests  3 passed (3)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { TranscriptConfirm } from './TranscriptConfirm';

const meta = {
  title: 'Componentes/Domínio/TranscriptConfirm',
  component: TranscriptConfirm,
  args: {
    isOpen: true,
    transcricao: 'Posso tomar ibuprofeno com losartana?',
    onConfirmar: fn(),
    onEscrever: fn(),
    onGravarDeNovo: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof TranscriptConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Entendeu: Story = {
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('dialog', { name: '“Posso tomar ibuprofeno com losartana?”' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};

export const NaoEntendeu: Story = {
  name: 'Não entendeu',
  args: { transcricao: '' },
  play: async ({ canvasElement }) => {
    const pagina = within(canvasElement.ownerDocument.body);
    const alvo = await pagina.findByRole('button', { name: 'Gravar de novo' });
    // A folha sobe com animação: espera ela terminar.
    await waitFor(() => expect(alvo).toBeVisible());
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/TranscriptConfirm/
```

Esperado: `Tests  2 passed (2)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/TranscriptConfirm/TranscriptConfirm.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './TranscriptConfirm.stories';

<Meta of={Stories} />

# TranscriptConfirm

"Entendi: … Está certo?" A confirmação da pergunta falada.

## Exemplo

<Canvas of={Stories.Entendeu} />

## Quando usar

Depois da gravação, quando o `/transcrever` (issue #24) responde.

## Quando não usar

Para a foto, use `OcrConfirm`.

## Anatomia

É um `CaptureConfirm` com os textos da voz: "Entendi", a pergunta entre aspas, "Está certo?", "Sim, perguntar" e "Não, vou escrever".

## Props

<ArgTypes of={Stories} />

## Estados

Com a transcrição vazia, a folha diz "Não consegui entender a gravação" e oferece "Gravar de novo" ou "Escrever a pergunta".

<Canvas of={Stories.NaoEntendeu} />

## Acessibilidade

A mesma do `CaptureConfirm`. Tudo o que foi falado aparece escrito antes de virar pergunta.

## Conteúdo

Nenhum texto sobre o que acontece com o áudio entra aqui antes de a #24 decidir como a voz funciona. Quando entrar, precisa descrever exatamente o que o servidor faz.

## Faça e não faça

- Faça: mostre a transcrição como veio, para a pessoa conferir.
- Não faça: corrigir a transcrição sozinho antes de perguntar.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/TranscriptConfirm
git commit -m "feat(ui): TranscriptConfirm (#25)"
```

---

### Tarefa C5: `CameraCapture`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/CameraCapture/CameraCapture.test.tsx`, `frontend/packages/ui/src/components/CameraCapture/CameraCapture.tsx`, `frontend/packages/ui/src/components/CameraCapture/index.ts`, `frontend/packages/ui/src/components/CameraCapture/CameraCapture.stories.tsx`, `frontend/packages/ui/src/components/CameraCapture/CameraCapture.mdx`

O visor da câmera traseira (`facingMode: 'environment'`), com a moldura "Enquadre o nome do remédio aqui". "Tirar foto" desenha o quadro num canvas e entrega um JPEG por `onFoto`. Negada (`NotAllowedError`), explica e oferece a digitação; sem câmera (`NotFoundError` ou sem `mediaDevices`), diz isso, sem falar em bloqueio. As trilhas param quando o componente sai da tela. O `<video>` é `muted`, `playsInline` e `autoPlay`, o que deixa o `jsx-a11y` satisfeito sem legenda (não há som). O aviso usa `nivelTitulo={2}`, porque o título da tela é um `h1`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/CameraCapture/CameraCapture.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { simularCamera } from '../../test/stubs';
import { CameraCapture } from './CameraCapture';

let desfazer: () => void = () => undefined;
afterEach(() => desfazer());

const acoes = () => ({ onFoto: vi.fn(), onFechar: vi.fn(), onDigitar: vi.fn() });

describe('CameraCapture', () => {
  it('pede a câmera, mostra o visor e entrega a foto', async () => {
    const camera = simularCamera('permitir');
    desfazer = camera.desfazer;
    const funcoes = acoes();
    render(<CameraCapture {...funcoes} />);
    expect(screen.getByRole('region', { name: 'Foto da caixa' })).toBeInTheDocument();
    expect(screen.getByText('Enquadre o nome do remédio aqui')).toBeInTheDocument();
    const tirar = screen.getByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    expect(funcoes.onFoto).toHaveBeenCalledWith(expect.any(Blob));
    expect(camera.pedidos()).toBe(1);
  });

  it('desliga a câmera quando sai da tela', async () => {
    const camera = simularCamera('permitir');
    desfazer = camera.desfazer;
    const { unmount } = render(<CameraCapture {...acoes()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeEnabled());
    unmount();
    expect(camera.trilhas).toHaveLength(1);
    expect(camera.trilhas.every((trilha) => trilha.parada)).toBe(true);
  });

  it('câmera negada: explica e oferece a digitação', async () => {
    desfazer = simularCamera('negar').desfazer;
    const funcoes = acoes();
    render(<CameraCapture {...funcoes} />);
    const aviso = await screen.findByRole('status');
    expect(aviso).toHaveTextContent('A câmera está bloqueada para o Bula Clara');
    expect(aviso).toHaveTextContent('Você pode digitar o nome do remédio.');
    expect(screen.queryByRole('button', { name: 'Tirar foto' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Digitar o nome' }));
    expect(funcoes.onDigitar).toHaveBeenCalledOnce();
  });

  it('sem câmera no aparelho, diz isso, sem falar em bloqueio', async () => {
    desfazer = simularCamera('sem-dispositivo').desfazer;
    render(<CameraCapture {...acoes()} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Não achei uma câmera neste aparelho');
  });

  it('a digitação e o fechar estão sempre disponíveis', async () => {
    desfazer = simularCamera('permitir').desfazer;
    const funcoes = acoes();
    render(<CameraCapture {...funcoes} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Digitar o nome' }));
    expect(funcoes.onFechar).toHaveBeenCalledOnce();
    expect(funcoes.onDigitar).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/CameraCapture/
```

Esperado: FAIL com `Failed to resolve import "./CameraCapture"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/CameraCapture/CameraCapture.tsx`:

```tsx
import { Camera, X } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState } from 'react';
import { Alert } from '../Alert';
import { Button } from '../Button';

export interface CameraCaptureProps {
  /** Recebe a foto (JPEG) para o app mandar ao /ler-caixa. A foto não é guardada. */
  onFoto: (foto: Blob) => void;
  /** Fecha a câmera e volta para onde a pessoa estava. */
  onFechar: () => void;
  /** O caminho por digitação, sempre disponível. */
  onDigitar: () => void;
}

type EstadoDaCamera = 'pedindo' | 'pronta' | 'negada' | 'indisponivel';

/** Câmera traseira, quando houver. */
const PEDIDO: MediaStreamConstraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };

/**
 * Visor para fotografar a caixa do remédio. Se a câmera for negada ou não existir, explica o que
 * houve e oferece a digitação. A câmera desliga quando o componente sai da tela.
 */
export function CameraCapture({ onFoto, onFechar, onDigitar }: CameraCaptureProps) {
  const idTitulo = useId();
  const video = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<EstadoDaCamera>('pedindo');

  useEffect(() => {
    let fluxo: MediaStream | null = null;
    let ativo = true;
    const midia = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
    if (!midia?.getUserMedia) {
      queueMicrotask(() => setEstado('indisponivel'));
      return;
    }
    midia.getUserMedia(PEDIDO).then(
      (recebido) => {
        if (!ativo) {
          for (const trilha of recebido.getTracks()) trilha.stop();
          return;
        }
        fluxo = recebido;
        if (video.current) video.current.srcObject = recebido;
        setEstado('pronta');
      },
      (erro: unknown) => {
        if (!ativo) return;
        const negada = erro instanceof DOMException && (erro.name === 'NotAllowedError' || erro.name === 'SecurityError');
        setEstado(negada ? 'negada' : 'indisponivel');
      },
    );
    return () => {
      ativo = false;
      for (const trilha of fluxo?.getTracks() ?? []) trilha.stop();
    };
  }, []);

  function fotografar() {
    const quadro = video.current;
    if (!quadro) return;
    const canvas = document.createElement('canvas');
    canvas.width = quadro.videoWidth || 1280;
    canvas.height = quadro.videoHeight || 960;
    canvas.getContext('2d')?.drawImage(quadro, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((foto) => {
      if (foto) onFoto(foto);
    }, 'image/jpeg');
  }

  const semCamera = estado === 'negada' || estado === 'indisponivel';

  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variante="discreta" icone={X} onPress={onFechar}>
          Fechar
        </Button>
        <h1 id={idTitulo} className="text-titulo-3 font-bold">
          Foto da caixa
        </h1>
      </div>

      {semCamera ? (
        <Alert
          tom="info"
          anunciar="polite"
          nivelTitulo={2}
          titulo={estado === 'negada' ? 'A câmera está bloqueada para o Bula Clara' : 'Não achei uma câmera neste aparelho'}
        >
          <p>Você pode digitar o nome do remédio.</p>
          {estado === 'negada' ? (
            <p className="mt-1 text-apoio">Se quiser usar a câmera, libere nos ajustes do seu navegador.</p>
          ) : null}
        </Alert>
      ) : (
        <div className="relative aspect-3/4 max-h-[60dvh] w-full overflow-hidden rounded-painel bg-sobreposicao-fundo">
          <video ref={video} autoPlay muted playsInline className="size-full object-cover" />
          <div className="pointer-events-none absolute inset-6 flex items-end justify-center rounded-controle border-3 border-dashed border-text-on-solid">
            <p className="mb-3 rounded-controle bg-sobreposicao-fundo px-3 py-1 text-apoio font-bold text-text-on-solid">
              Enquadre o nome do remédio aqui
            </p>
          </div>
        </div>
      )}

      {semCamera ? null : (
        <Button larguraTotal icone={Camera} isDisabled={estado !== 'pronta'} onPress={fotografar}>
          Tirar foto
        </Button>
      )}
      {/* A chave troca o botão inteiro: sem ela, a transição de cor passaria por um meio-termo sem contraste. */}
      <Button
        key={semCamera ? 'principal' : 'alternativa'}
        larguraTotal
        variante={semCamera ? 'primaria' : 'discreta'}
        onPress={onDigitar}
      >
        Digitar o nome
      </Button>
    </section>
  );
}
```

`frontend/packages/ui/src/components/CameraCapture/index.ts`:

```ts
export { CameraCapture, type CameraCaptureProps } from './CameraCapture';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/CameraCapture/
```

Esperado: `Tests  5 passed (5)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/CameraCapture/CameraCapture.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { simularCamera } from '../../test/stubs';
import { CameraCapture } from './CameraCapture';

// A câmera é simulada: um canvas com o nome do remédio vira o fluxo de vídeo. Nada pede permissão.
const meta = {
  title: 'Componentes/Domínio/CameraCapture',
  component: CameraCapture,
  args: { onFoto: fn(), onFechar: fn(), onDigitar: fn() },
} satisfies Meta<typeof CameraCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visor: Story = {
  beforeEach: () => simularCamera('permitir').desfazer,
  play: async ({ canvas, args }) => {
    const tirar = canvas.getByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    await waitFor(() => expect(args.onFoto).toHaveBeenCalledOnce());
  },
};

export const Negada: Story = {
  name: 'Câmera negada',
  beforeEach: () => simularCamera('negar').desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('A câmera está bloqueada para o Bula Clara')).toBeVisible();
  },
};

export const SemCamera: Story = {
  name: 'Sem câmera',
  beforeEach: () => simularCamera('sem-dispositivo').desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Não achei uma câmera neste aparelho')).toBeVisible();
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/CameraCapture/
```

Esperado: `Tests  3 passed (3)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/CameraCapture/CameraCapture.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './CameraCapture.stories';

<Meta of={Stories} />

# CameraCapture

O visor para fotografar a caixa do remédio.

## Exemplo

<Canvas of={Stories.Visor} />

## Quando usar

Quando a pessoa toca em "Fotografar a caixa". O app mostra o componente na tela inteira e, com a foto, chama o `/ler-caixa` e abre o `OcrConfirm`.

## Quando não usar

Para ler um código de barras ou QR code. Esse fluxo não existe no Bula Clara.

## Anatomia

- "Fechar" e o título "Foto da caixa".
- O visor, com a moldura "Enquadre o nome do remédio aqui".
- "Tirar foto", que só fica ativo com a câmera pronta.
- "Digitar o nome", sempre presente.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Negada} />

<Canvas of={Stories.SemCamera} />

## Acessibilidade

- É uma região com o título "Foto da caixa" como nome.
- O vídeo não tem som (`muted`) e roda dentro da página (`playsInline`).
- Com a câmera negada ou ausente, aparece um aviso com `role="status"`, que o leitor de tela anuncia, e "Digitar o nome" vira o botão principal.
- A câmera desliga quando o componente sai da tela.

## Conteúdo

Os textos são os da página Textos da interface: "A câmera está bloqueada para o Bula Clara. Você pode digitar o nome do remédio.", com uma linha sobre como liberar o acesso. Sem câmera no aparelho, o aviso diz isso, sem falar em bloqueio.

## Faça e não faça

- Faça: peça a câmera só quando a pessoa tocar no botão.
- Não faça: guardar a foto. Ela serve só para ler o nome.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/CameraCapture
git commit -m "feat(ui): CameraCapture com caminho por digitação (#25)"
```

---

### Tarefa C6: `VoiceRecorder`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.test.tsx`, `frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.tsx`, `frontend/packages/ui/src/components/VoiceRecorder/index.ts`, `frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.stories.tsx`, `frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.mdx`

Grava com `MediaRecorder` e entrega o áudio por `onGravacao`. Começa sozinho, porque a pessoa já tocou em "Perguntar falando". Avisa por som, vibração e texto ao começar e ao terminar, e para sozinho no tempo máximo. Fechar descarta a gravação. Nunca usa a `SpeechRecognition`. Nos testes, o primeiro `status` é "Preparando o microfone…", então os testes de permissão negada esperam o título do aviso antes de olhar o `status`.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { simularMicrofone } from '../../test/stubs';
import { VoiceRecorder } from './VoiceRecorder';

let desfazer: () => void = () => undefined;
afterEach(() => desfazer());

const acoes = () => ({ onGravacao: vi.fn(), onFechar: vi.fn(), onEscrever: vi.fn() });

describe('VoiceRecorder', () => {
  it('começa a gravar e avisa por texto e vibração', async () => {
    const microfone = simularMicrofone();
    desfazer = microfone.desfazer;
    render(<VoiceRecorder {...acoes()} />);
    expect(await screen.findByRole('status')).toHaveTextContent('Ouvindo… fale sua pergunta');
    expect(microfone.vibracoes()).toBe(1);
  });

  it('ao parar, entrega o áudio com o tipo, desliga o microfone e avisa que terminou', async () => {
    const microfone = simularMicrofone();
    desfazer = microfone.desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Parar de gravar' }));
    expect(funcoes.onGravacao).toHaveBeenCalledOnce();
    const audio = funcoes.onGravacao.mock.calls[0]?.[0] as Blob;
    expect(audio.type).toBe('audio/webm;codecs=opus');
    expect(microfone.trilhas.every((trilha) => trilha.parada)).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Gravação terminada.');
    expect(microfone.vibracoes()).toBe(2);
  });

  it('no iPhone, grava em audio/mp4', async () => {
    const microfone = simularMicrofone('permitir', ['audio/mp4']);
    desfazer = microfone.desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Parar de gravar' }));
    expect((funcoes.onGravacao.mock.calls[0]?.[0] as Blob).type).toBe('audio/mp4');
  });

  it('para sozinha no tempo máximo', async () => {
    desfazer = simularMicrofone().desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} duracaoMaximaMs={30} />);
    await waitFor(() => expect(funcoes.onGravacao).toHaveBeenCalledOnce());
  });

  it('fechar descarta a gravação e desliga o microfone', async () => {
    const microfone = simularMicrofone();
    desfazer = microfone.desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await screen.findByRole('button', { name: 'Parar de gravar' });
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(funcoes.onFechar).toHaveBeenCalledOnce();
    expect(funcoes.onGravacao).not.toHaveBeenCalled();
    expect(microfone.trilhas.every((trilha) => trilha.parada)).toBe(true);
  });

  it('microfone negado: explica e oferece a escrita', async () => {
    desfazer = simularMicrofone('negar').desfazer;
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await screen.findByText('O microfone está bloqueado para o Bula Clara');
    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent('Você pode escrever a sua pergunta.');
    await userEvent.click(screen.getByRole('button', { name: 'Escrever a pergunta' }));
    expect(funcoes.onEscrever).toHaveBeenCalledOnce();
  });

  it('sem microfone no aparelho, diz isso', async () => {
    desfazer = simularMicrofone('sem-dispositivo').desfazer;
    render(<VoiceRecorder {...acoes()} />);
    await screen.findByText('Não achei um microfone neste aparelho');
    expect(screen.getByRole('status')).toHaveTextContent('Você pode escrever a sua pergunta.');
  });

  it('nunca toca na SpeechRecognition do navegador', async () => {
    const microfone = simularMicrofone();
    let leituras = 0;
    for (const nome of ['SpeechRecognition', 'webkitSpeechRecognition']) {
      Object.defineProperty(window, nome, {
        configurable: true,
        get: () => {
          leituras++;
          return undefined;
        },
      });
    }
    desfazer = () => {
      microfone.desfazer();
      Reflect.deleteProperty(window, 'SpeechRecognition');
      Reflect.deleteProperty(window, 'webkitSpeechRecognition');
    };
    const funcoes = acoes();
    render(<VoiceRecorder {...funcoes} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Parar de gravar' }));
    expect(funcoes.onGravacao).toHaveBeenCalledOnce();
    expect(leituras).toBe(0);
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/VoiceRecorder/
```

Esperado: FAIL com `Failed to resolve import "./VoiceRecorder"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.tsx`:

```tsx
import { Microphone, Stop, X } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState } from 'react';
import { Alert } from '../Alert';
import { Button } from '../Button';

export interface VoiceRecorderProps {
  /**
   * Recebe o áudio gravado, para o app mandar ao /transcrever (Whisper no nosso servidor).
   * O tipo do arquivo vem em `audio.type` (audio/webm no Chrome e no Android, audio/mp4 no iPhone).
   */
  onGravacao: (audio: Blob) => void;
  /** Fecha sem mandar nada. Se estiver gravando, a gravação é descartada. */
  onFechar: () => void;
  /** O caminho por digitação, sempre disponível. */
  onEscrever: () => void;
  /** A gravação para sozinha depois desse tempo. */
  duracaoMaximaMs?: number;
}

type EstadoDaGravacao = 'pedindo' | 'gravando' | 'terminou' | 'negado' | 'indisponivel';

/** Em ordem de preferência. O Safari do iPhone só grava audio/mp4. */
export const TIPOS_DE_AUDIO = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'] as const;

export function escolherTipoDeAudio(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return TIPOS_DE_AUDIO.find((tipo) => MediaRecorder.isTypeSupported(tipo)) ?? '';
}

/** Retorno sonoro e tátil: um bipe agudo ao começar, um grave ao terminar, e uma vibração. */
function sinalizar(momento: 'inicio' | 'fim') {
  navigator.vibrate?.(momento === 'inicio' ? 80 : [60, 40, 60]);
  const Contexto = typeof window === 'undefined' ? undefined : window.AudioContext;
  if (!Contexto) return;
  try {
    const contexto = new Contexto();
    const oscilador = contexto.createOscillator();
    const volume = contexto.createGain();
    volume.gain.value = 0.1;
    oscilador.frequency.value = momento === 'inicio' ? 880 : 440;
    oscilador.connect(volume).connect(contexto.destination);
    oscilador.onended = () => void contexto.close();
    oscilador.start();
    oscilador.stop(contexto.currentTime + 0.15);
  } catch {
    // Sem som, ainda ficam a vibração e o texto.
  }
}

const textoDoEstado: Partial<Record<EstadoDaGravacao, string>> = {
  pedindo: 'Preparando o microfone…',
  gravando: 'Ouvindo… fale sua pergunta',
  terminou: 'Gravação terminada. Vou conferir o que entendi.',
};

/**
 * Grava a pergunta falada com MediaRecorder e entrega o áudio. Nunca usa a SpeechRecognition do
 * navegador, que no Chrome manda o áudio para o Google. Avisa por som, vibração e texto quando
 * começa e quando termina.
 */
export function VoiceRecorder({ onGravacao, onFechar, onEscrever, duracaoMaximaMs = 30000 }: VoiceRecorderProps) {
  const idTitulo = useId();
  const [estado, setEstado] = useState<EstadoDaGravacao>('pedindo');
  const gravador = useRef<MediaRecorder | null>(null);
  const descartar = useRef(false);
  const aoGravar = useRef(onGravacao);

  useEffect(() => {
    aoGravar.current = onGravacao;
  }, [onGravacao]);

  useEffect(() => {
    let ativo = true;
    descartar.current = false;
    let fluxo: MediaStream | null = null;
    let limite: ReturnType<typeof setTimeout> | undefined;
    const desligar = () => {
      for (const trilha of fluxo?.getTracks() ?? []) trilha.stop();
    };
    const midia = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
    if (!midia?.getUserMedia || typeof MediaRecorder === 'undefined') {
      queueMicrotask(() => setEstado('indisponivel'));
      return;
    }
    midia.getUserMedia({ audio: true, video: false }).then(
      (recebido) => {
        fluxo = recebido;
        if (!ativo) {
          desligar();
          return;
        }
        const tipo = escolherTipoDeAudio();
        const novo = new MediaRecorder(recebido, tipo ? { mimeType: tipo } : undefined);
        const pedacos: Blob[] = [];
        novo.addEventListener('dataavailable', (evento) => {
          if (evento.data.size > 0) pedacos.push(evento.data);
        });
        novo.addEventListener('stop', () => {
          clearTimeout(limite);
          desligar();
          if (descartar.current) return;
          sinalizar('fim');
          setEstado('terminou');
          aoGravar.current(new Blob(pedacos, { type: novo.mimeType || tipo || 'audio/webm' }));
        });
        gravador.current = novo;
        novo.start();
        sinalizar('inicio');
        setEstado('gravando');
        limite = setTimeout(() => novo.stop(), duracaoMaximaMs);
      },
      (erro: unknown) => {
        if (!ativo) return;
        const negado = erro instanceof DOMException && (erro.name === 'NotAllowedError' || erro.name === 'SecurityError');
        setEstado(negado ? 'negado' : 'indisponivel');
      },
    );
    return () => {
      ativo = false;
      clearTimeout(limite);
      descartar.current = true;
      if (gravador.current?.state === 'recording') gravador.current.stop();
      desligar();
    };
  }, [duracaoMaximaMs]);

  function parar() {
    if (gravador.current?.state === 'recording') gravador.current.stop();
  }

  function fechar() {
    descartar.current = true;
    parar();
    onFechar();
  }

  const semMicrofone = estado === 'negado' || estado === 'indisponivel';

  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variante="discreta" icone={X} onPress={fechar}>
          Fechar
        </Button>
        <h1 id={idTitulo} className="text-titulo-3 font-bold">
          Pergunta falada
        </h1>
      </div>

      {semMicrofone ? (
        <Alert
          tom="info"
          anunciar="polite"
          nivelTitulo={2}
          titulo={estado === 'negado' ? 'O microfone está bloqueado para o Bula Clara' : 'Não achei um microfone neste aparelho'}
        >
          <p>Você pode escrever a sua pergunta.</p>
          {estado === 'negado' ? (
            <p className="mt-1 text-apoio">Se quiser usar o microfone, libere nos ajustes do seu navegador.</p>
          ) : null}
        </Alert>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <span
            aria-hidden="true"
            className={
              'flex size-24 items-center justify-center rounded-total bg-action-primary text-text-on-solid ' +
              (estado === 'gravando' ? 'animate-pulse motion-reduce:animate-none' : '')
            }
          >
            <Microphone size="3rem" weight="bold" />
          </span>
          <p role="status" className="text-center text-corpo font-bold">
            {textoDoEstado[estado]}
          </p>
        </div>
      )}

      {estado === 'gravando' ? (
        <Button larguraTotal icone={Stop} onPress={parar}>
          Parar de gravar
        </Button>
      ) : null}
      {/* A chave troca o botão inteiro: sem ela, a transição de cor passaria por um meio-termo sem contraste. */}
      <Button
        key={semMicrofone ? 'principal' : 'alternativa'}
        larguraTotal
        variante={semMicrofone ? 'primaria' : 'discreta'}
        onPress={onEscrever}
      >
        Escrever a pergunta
      </Button>
    </section>
  );
}
```

`frontend/packages/ui/src/components/VoiceRecorder/index.ts`:

```ts
export { TIPOS_DE_AUDIO, VoiceRecorder, escolherTipoDeAudio, type VoiceRecorderProps } from './VoiceRecorder';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/VoiceRecorder/
```

Esperado: `Tests  8 passed (8)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { simularMicrofone } from '../../test/stubs';
import { VoiceRecorder } from './VoiceRecorder';

// Microfone e gravador simulados: nada é gravado nem pede permissão.
const meta = {
  title: 'Componentes/Domínio/VoiceRecorder',
  component: VoiceRecorder,
  args: { onGravacao: fn(), onFechar: fn(), onEscrever: fn() },
} satisfies Meta<typeof VoiceRecorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gravando: Story = {
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Ouvindo… fale sua pergunta')).toBeVisible();
  },
};

export const Terminou: Story = {
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas, args }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Parar de gravar' }));
    await expect(args.onGravacao).toHaveBeenCalledOnce();
    await expect(canvas.getByText('Gravação terminada. Vou conferir o que entendi.')).toBeVisible();
  },
};

export const Negado: Story = {
  name: 'Microfone negado',
  beforeEach: () => simularMicrofone('negar').desfazer,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('O microfone está bloqueado para o Bula Clara')).toBeVisible();
  },
};
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/VoiceRecorder/
```

Esperado: `Tests  3 passed (3)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/VoiceRecorder/VoiceRecorder.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './VoiceRecorder.stories';

<Meta of={Stories} />

# VoiceRecorder

Grava a pergunta falada e entrega o áudio para o nosso servidor transcrever.

## Exemplo

<Canvas of={Stories.Gravando} />

## Quando usar

Quando a pessoa toca em "Perguntar falando". A gravação começa sozinha, porque a pessoa já pediu. O app manda o áudio ao `/transcrever` (Whisper no nosso servidor, issue #24) e abre o `TranscriptConfirm`.

## Quando não usar

Para ler a resposta em voz alta, use `ListenButton`.

## Anatomia

- "Fechar" e o título "Pergunta falada".
- O microfone grande, que pulsa enquanto grava.
- O status: "Ouvindo… fale sua pergunta" e, ao fim, "Gravação terminada. Vou conferir o que entendi.".
- "Parar de gravar", enquanto grava.
- "Escrever a pergunta", sempre presente.

## Props

<ArgTypes of={Stories} />

## Estados

<Canvas of={Stories.Terminou} />

<Canvas of={Stories.Negado} />

## Acessibilidade

- Avisa por som (um bipe agudo ao começar e um grave ao terminar), por vibração e por texto (`role="status"`). Tudo o que é avisado também aparece escrito.
- Com movimento reduzido, o microfone não pulsa.
- A gravação para sozinha em 30 segundos (`duracaoMaximaMs`).
- Microfone negado ou ausente: aviso com `role="status"` e "Escrever a pergunta" como botão principal.
- Fechar descarta a gravação, e o microfone desliga quando o componente sai da tela.

## Conteúdo

O componente nunca usa a `SpeechRecognition` do navegador, que no Chrome manda o áudio para o Google. A fala vira texto só no nosso servidor. O formato do áudio é escolhido por `MediaRecorder.isTypeSupported`: `audio/webm` no Chrome e no Android, `audio/mp4` no iPhone, e o tipo vai junto no arquivo.

## Faça e não faça

- Faça: mostre a transcrição para a pessoa confirmar antes de perguntar.
- Não faça: usar o reconhecimento de voz do navegador "porque é mais rápido".
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/VoiceRecorder
git commit -m "feat(ui): VoiceRecorder que só grava, sem reconhecimento do navegador (#25)"
```

---

### Tarefa C7: Barrel, changeset e conferência do grupo

**Arquivos:**
- Modificar: `frontend/packages/ui/src/grupos/entrada.ts`
- Criar: `frontend/.changeset/dominio-entrada.md`

- [ ] **Passo 1: Barrel e changeset**

`frontend/packages/ui/src/grupos/entrada.ts`:

```ts
// Grupo C do plano 3: entrada (pergunta, foto e voz).
export * from '../components/CameraCapture';
export * from '../components/CaptureConfirm';
export * from '../components/InputDock';
export * from '../components/OcrConfirm';
export * from '../components/TranscriptConfirm';
export * from '../components/VoiceRecorder';
```

`frontend/.changeset/dominio-entrada.md`:

```md
---
'@bula-clara/ui': minor
---

Componentes de entrada: InputDock (caixa de pergunta e navegação), CameraCapture, VoiceRecorder (só grava, a transcrição é do servidor) e a confirmação antes de perguntar, com CaptureConfirm, OcrConfirm e TranscriptConfirm.
```

- [ ] **Passo 2: Conferir o grupo**

```bash
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui test < /dev/null
pnpm --filter @bula-clara/ui exec vitest run --project unit < /dev/null
```

Esperado: lint e tipos sem erro, `Tests  221 passed (221)` no `ui` e `Tests  137 passed (137)` de unidade.

- [ ] **Passo 3: Commit**

```bash
git add frontend/packages/ui/src/grupos/entrada.ts frontend/.changeset/dominio-entrada.md
git commit -m "feat(ui): exporta os componentes de entrada (#25)"
```

---

## Grupo D: a lista de remédios

### Tarefa D1: `MedicationList`

**Arquivos:**
- Criar: `frontend/packages/ui/src/components/MedicationList/exemplos.ts`, `frontend/packages/ui/src/components/MedicationList/MedicationList.test.tsx`, `frontend/packages/ui/src/components/MedicationList/MedicationList.tsx`, `frontend/packages/ui/src/components/MedicationList/index.ts`, `frontend/packages/ui/src/components/MedicationList/MedicationList.stories.tsx`, `frontend/packages/ui/src/components/MedicationList/MedicationList.mdx`

A lista "Meus remédios": busca tolerante a erro (`ComboBox` do plano 2, com "Não achei esse remédio. Confira o nome na caixa."), um botão "Remover losartana" por item, o `Switch` "Lembrar neste aparelho" com os textos exatos do protótipo e "Apagar tudo" (`Button variante="perigo"`), que confirma por `confirmarAcao`. O componente não grava em storage: recebe a lista e avisa o app. O foco nunca se perde quando um item some. Um detalhe que custou tempo: com a lista de opções aberta, o React Aria esconde o resto da tela do leitor de tela, então o teste de adicionar usa `findByRole` para esperar o botão novo.

- [ ] **Passo 1: Escrever o teste**

`frontend/packages/ui/src/components/MedicationList/exemplos.ts`:

```ts
// Os 15 remédios da base do MVP, para stories, testes e páginas de Padrões. No app, a lista vem de
// /medicamentos. Não é exportado pelo pacote.
import type { RemedioDaLista } from './MedicationList';

export const baseDeRemedios: RemedioDaLista[] = [
  { id: 'dipirona', nome: 'Dipirona' },
  { id: 'paracetamol', nome: 'Paracetamol' },
  { id: 'ibuprofeno', nome: 'Ibuprofeno' },
  { id: 'losartana', nome: 'Losartana' },
  { id: 'enalapril', nome: 'Enalapril' },
  { id: 'captopril', nome: 'Captopril' },
  { id: 'hidroclorotiazida', nome: 'Hidroclorotiazida' },
  { id: 'metformina', nome: 'Metformina' },
  { id: 'sinvastatina', nome: 'Sinvastatina' },
  { id: 'omeprazol', nome: 'Omeprazol' },
  { id: 'amoxicilina', nome: 'Amoxicilina' },
  { id: 'varfarina', nome: 'Varfarina' },
  { id: 'acido acetilsalicilico', nome: 'Ácido acetilsalicílico' },
  { id: 'clopidogrel', nome: 'Clopidogrel' },
  { id: 'levotiroxina', nome: 'Levotiroxina' },
];

export const listaDeExemplo: RemedioDaLista[] = [
  { id: 'losartana', nome: 'Losartana' },
  { id: 'metformina', nome: 'Metformina' },
];
```

`frontend/packages/ui/src/components/MedicationList/MedicationList.test.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { filaDeToasts } from '../Toast';
import { baseDeRemedios, listaDeExemplo } from './exemplos';
import { MedicationList, TEXTOS_DO_CONSENTIMENTO, type RemedioDaLista } from './MedicationList';

function ComEstado({ inicial = listaDeExemplo, onApagarTudo = () => undefined }: { inicial?: RemedioDaLista[]; onApagarTudo?: () => void }) {
  const [remedios, setRemedios] = useState(inicial);
  const [lembrar, setLembrar] = useState(false);
  return (
    <MedicationList
      remedios={remedios}
      opcoes={baseDeRemedios}
      onAdicionar={(remedio) => setRemedios((atual) => [...atual, remedio])}
      onRemover={(id) => setRemedios((atual) => atual.filter((remedio) => remedio.id !== id))}
      lembrar={lembrar}
      onLembrarChange={setLembrar}
      onApagarTudo={() => {
        onApagarTudo();
        setRemedios([]);
      }}
    />
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  act(() => filaDeToasts.clear());
});

describe('MedicationList', () => {
  it('lista os remédios com um botão de remover para cada um', () => {
    render(<ComEstado />);
    const lista = screen.getByRole('list', { name: 'Remédios da lista' });
    expect(lista.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remover losartana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover metformina' })).toBeInTheDocument();
  });

  it('remove e leva o foco para o próximo item, e depois para a busca', async () => {
    render(<ComEstado />);
    await userEvent.click(screen.getByRole('button', { name: 'Remover losartana' }));
    expect(screen.queryByText('Losartana')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover metformina' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Remover metformina' }));
    expect(screen.getByRole('combobox', { name: 'Adicionar remédio' })).toHaveFocus();
    expect(screen.getByText('Nenhum remédio na lista.')).toBeInTheDocument();
  });

  it('adiciona pela busca tolerante a erro e limpa o campo', async () => {
    render(<ComEstado inicial={[]} />);
    const busca = screen.getByRole('combobox', { name: 'Adicionar remédio' });
    await userEvent.type(busca, 'sinvastatna');
    await userEvent.click(await screen.findByRole('option', { name: 'Sinvastatina' }));
    expect(await screen.findByRole('button', { name: 'Remover sinvastatina' })).toBeInTheDocument();
    const novaBusca = screen.getByRole('combobox', { name: 'Adicionar remédio' });
    expect(novaBusca).toHaveValue('');
    expect(novaBusca).toHaveFocus();
    expect(novaBusca).toHaveAttribute('aria-expanded', 'false');
  });

  it('não oferece o que já está na lista', async () => {
    render(<ComEstado />);
    await userEvent.type(screen.getByRole('combobox'), 'losartana');
    expect(screen.queryByRole('option', { name: 'Losartana' })).not.toBeInTheDocument();
  });

  it('o consentimento começa desligado, com o texto aprovado', async () => {
    render(<ComEstado />);
    const interruptor = screen.getByRole('switch', { name: 'Lembrar neste aparelho' });
    expect(interruptor).not.toBeChecked();
    expect(interruptor).toHaveAccessibleDescription(TEXTOS_DO_CONSENTIMENTO.desligado);
    await userEvent.click(interruptor);
    expect(interruptor).toBeChecked();
    expect(interruptor).toHaveAccessibleDescription(TEXTOS_DO_CONSENTIMENTO.ligado);
  });

  it('"Apagar tudo" usa a variante de perigo, apaga e confirma com o Toast', async () => {
    const apagou = vi.fn();
    render(<ComEstado onApagarTudo={apagou} />);
    const botao = screen.getByRole('button', { name: 'Apagar tudo' });
    expect(botao).toHaveClass('text-danger-text');
    await userEvent.click(botao);
    expect(apagou).toHaveBeenCalledOnce();
    expect(filaDeToasts.visibleToasts.map((toast) => toast.content.mensagem)).toEqual(['Lista apagada deste aparelho.']);
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('"Apagar tudo" só aparece com a lista cheia, como na tela aprovada', () => {
    render(<ComEstado inicial={[]} />);
    expect(screen.queryByRole('button', { name: 'Apagar tudo' })).not.toBeInTheDocument();
  });

  it('não grava nada no navegador: guardar é do app', async () => {
    const gravar = vi.spyOn(Storage.prototype, 'setItem');
    render(<ComEstado />);
    await userEvent.click(screen.getByRole('switch'));
    await userEvent.click(screen.getByRole('button', { name: 'Remover losartana' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(gravar).not.toHaveBeenCalled();
  });
});
```

- [ ] **Passo 2: Rodar e ver falhar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/MedicationList/
```

Esperado: FAIL com `Failed to resolve import "./MedicationList"`.

- [ ] **Passo 3: Escrever o componente**

`frontend/packages/ui/src/components/MedicationList/MedicationList.tsx`:

```tsx
import { Trash, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type Key } from 'react';
import { Button } from '../Button';
import { ComboBox, type OpcaoComboBox } from '../ComboBox';
import { IconButton } from '../IconButton';
import { Switch } from '../Switch';
import { confirmarAcao } from '../Toast';

export interface RemedioDaLista {
  /** O nome normalizado da base (`/medicamentos`), que vai em `medicamentos_em_uso`. */
  id: string;
  /** Como aparece na lista ("Losartana"). */
  nome: string;
}

export interface MedicationListProps {
  /** A lista atual. Quem guarda (sessionStorage ou localStorage) é o app, nunca o componente. */
  remedios: readonly RemedioDaLista[];
  /** Os remédios da base, para a busca tolerante a erro. */
  opcoes: readonly RemedioDaLista[];
  onAdicionar: (remedio: RemedioDaLista) => void;
  onRemover: (id: string) => void;
  /** Estado do consentimento "Lembrar neste aparelho". Começa desligado. */
  lembrar: boolean;
  /** Ao desligar, o app apaga a lista do localStorage na hora. */
  onLembrarChange: (ligado: boolean) => void;
  /** Apaga a lista. O componente confirma com o Toast "Lista apagada deste aparelho.". */
  onApagarTudo: () => void;
}

/** Os textos do consentimento, exatamente os das telas aprovadas. */
export const TEXTOS_DO_CONSENTIMENTO = {
  titulo: 'Lembrar neste aparelho',
  desligado:
    'Desligado: a lista some quando você fecha a página. Ela vai junto com cada pergunta, mas não fica guardada em nenhum servidor.',
  ligado: 'Ligado: a lista fica salva só neste navegador. Desligar apaga na hora.',
  apagada: 'Lista apagada deste aparelho.',
} as const;

type AlvoDoFoco = { tipo: 'remover'; id: string } | { tipo: 'busca' };

/** A lista "Meus remédios": busca, remoção, consentimento e "Apagar tudo". */
export function MedicationList({
  remedios,
  opcoes,
  onAdicionar,
  onRemover,
  lembrar,
  onLembrarChange,
  onApagarTudo,
}: MedicationListProps) {
  // Trocar a chave remonta a busca vazia e fechada depois de adicionar. Limpar o texto com a busca
  // em foco faria a lista de opções abrir de novo, com a base inteira.
  const [chaveDaBusca, setChaveDaBusca] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const focoPendente = useRef<AlvoDoFoco | null>(null);

  // Quando um item some, o foco iria para o fim da página. Ele vai para o próximo item, ou para a busca.
  useEffect(() => {
    const alvo = focoPendente.current;
    if (!alvo) return;
    focoPendente.current = null;
    const seletor =
      alvo.tipo === 'remover' ? `[data-remedio="${CSS.escape(alvo.id)}"] button` : 'input[role="combobox"]';
    const elemento = raiz.current?.querySelector<HTMLElement>(seletor);
    elemento?.focus();
  }, [remedios]);

  const naLista = new Set(remedios.map((remedio) => remedio.id));
  const disponiveis: OpcaoComboBox[] = opcoes
    .filter((opcao) => !naLista.has(opcao.id))
    .map((opcao) => ({ id: opcao.id, rotulo: opcao.nome }));

  function adicionar(chave: Key | null) {
    const escolhido = opcoes.find((opcao) => opcao.id === chave);
    if (!escolhido) return;
    focoPendente.current = { tipo: 'busca' };
    onAdicionar(escolhido);
    setChaveDaBusca((chave) => chave + 1);
  }

  function remover(posicao: number) {
    const proximo = remedios[posicao + 1] ?? remedios[posicao - 1];
    focoPendente.current = proximo ? { tipo: 'remover', id: proximo.id } : { tipo: 'busca' };
    const remedio = remedios[posicao];
    if (remedio) onRemover(remedio.id);
  }

  function apagarTudo() {
    focoPendente.current = { tipo: 'busca' };
    onApagarTudo();
    confirmarAcao(TEXTOS_DO_CONSENTIMENTO.apagada);
  }

  return (
    <div ref={raiz} className="flex max-w-medida flex-col gap-4">
      <ComboBox
        key={chaveDaBusca}
        rotulo="Adicionar remédio"
        exemplo="ex.: metformina"
        opcoes={disponiveis}
        textoSemResultado="Não achei esse remédio. Confira o nome na caixa."
        selectedKey={null}
        onSelectionChange={adicionar}
      />
      {remedios.length > 0 ? (
        <ul aria-label="Remédios da lista" className="flex flex-col gap-2">
          {remedios.map((remedio, posicao) => (
            <li
              key={remedio.id}
              data-remedio={remedio.id}
              className={
                'flex min-h-12 items-center justify-between gap-2 rounded-controle border border-border-field ps-4 ' +
                'text-corpo alto-contraste:border-(length:--bc-borda-controle)'
              }
            >
              <span className="wrap-anywhere">{remedio.nome}</span>
              <IconButton
                variante="discreta"
                icone={X}
                aria-label={`Remover ${remedio.nome.toLocaleLowerCase('pt-BR')}`}
                onPress={() => remover(posicao)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-corpo text-text-muted">Nenhum remédio na lista.</p>
      )}
      <Switch
        isSelected={lembrar}
        onChange={onLembrarChange}
        descricao={(ligado) => (ligado ? TEXTOS_DO_CONSENTIMENTO.ligado : TEXTOS_DO_CONSENTIMENTO.desligado)}
      >
        {TEXTOS_DO_CONSENTIMENTO.titulo}
      </Switch>
      {remedios.length > 0 ? (
        <div>
          <Button variante="perigo" icone={Trash} onPress={apagarTudo}>
            Apagar tudo
          </Button>
        </div>
      ) : null}
    </div>
  );
}
```

`frontend/packages/ui/src/components/MedicationList/index.ts`:

```ts
export { MedicationList, TEXTOS_DO_CONSENTIMENTO, type MedicationListProps, type RemedioDaLista } from './MedicationList';
```

- [ ] **Passo 4: Rodar e ver passar**

```bash
pnpm --filter @bula-clara/ui exec vitest run --project unit src/components/MedicationList/
```

Esperado: `Tests  8 passed (8)`.

- [ ] **Passo 5: Stories**

`frontend/packages/ui/src/components/MedicationList/MedicationList.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ToastRegion } from '../Toast';
import { baseDeRemedios, listaDeExemplo } from './exemplos';
import { MedicationList, type MedicationListProps } from './MedicationList';

// O estado fica na memória da story. Nada vai para sessionStorage nem localStorage.
function ComEstado(args: MedicationListProps) {
  const [remedios, setRemedios] = useState(args.remedios);
  const [lembrar, setLembrar] = useState(args.lembrar);
  return (
    <>
      <MedicationList
        {...args}
        remedios={remedios}
        lembrar={lembrar}
        onAdicionar={(remedio) => {
          args.onAdicionar(remedio);
          setRemedios((atual) => [...atual, remedio]);
        }}
        onRemover={(id) => {
          args.onRemover(id);
          setRemedios((atual) => atual.filter((remedio) => remedio.id !== id));
        }}
        onLembrarChange={(ligado) => {
          args.onLembrarChange(ligado);
          setLembrar(ligado);
        }}
        onApagarTudo={() => {
          args.onApagarTudo();
          setRemedios([]);
        }}
      />
      <ToastRegion />
    </>
  );
}

const meta = {
  title: 'Componentes/Domínio/MedicationList',
  component: MedicationList,
  args: {
    remedios: listaDeExemplo,
    opcoes: baseDeRemedios,
    lembrar: false,
    onAdicionar: fn(),
    onRemover: fn(),
    onLembrarChange: fn(),
    onApagarTudo: fn(),
  },
  render: (args) => <ComEstado {...args} />,
} satisfies Meta<typeof MedicationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComRemedios: Story = { name: 'Com remédios' };

export const Vazia: Story = { args: { remedios: [] } };

export const Adicionar: Story = {
  args: { remedios: [] },
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Adicionar remédio' }), 'lozartana');
    const pagina = within(canvasElement.ownerDocument.body);
    await userEvent.click(await pagina.findByRole('option', { name: 'Losartana' }));
    await expect(args.onAdicionar).toHaveBeenCalledWith({ id: 'losartana', nome: 'Losartana' });
    await expect(await canvas.findByRole('button', { name: 'Remover losartana' })).toBeInTheDocument();
  },
};

export const LembrarLigado: Story = {
  name: 'Lembrar neste aparelho ligado',
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('switch', { name: 'Lembrar neste aparelho' }));
    await expect(args.onLembrarChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByText(/^Ligado: a lista fica salva só neste navegador/)).toBeVisible();
  },
};

export const ApagarTudo: Story = {
  name: 'Apagar tudo',
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    await expect(args.onApagarTudo).toHaveBeenCalledOnce();
    const pagina = within(canvasElement.ownerDocument.body);
    await expect(await pagina.findByText('Lista apagada deste aparelho.')).toBeVisible();
    await expect(canvas.getByText('Nenhum remédio na lista.')).toBeVisible();
    await userEvent.click(pagina.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(pagina.queryByText('Lista apagada deste aparelho.')).toBeNull());
  },
};

export const AltoContraste: Story = { name: 'Alto contraste', globals: { contraste: 'alto' } };
```

```bash
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/components/MedicationList/
```

Esperado: `Tests  6 passed (6)`. Cada story também passa pelo axe.

- [ ] **Passo 6: Página de documentação**

`frontend/packages/ui/src/components/MedicationList/MedicationList.mdx`:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './MedicationList.stories';

<Meta of={Stories} />

# MedicationList

A lista "Meus remédios", que o Bula Clara usa para checar interações em cada pergunta.

## Exemplo

<Canvas of={Stories.ComRemedios} />

## Quando usar

Na tela Meus remédios, abaixo do título e da frase "Uso esta lista para checar interações em cada pergunta.".

## Quando não usar

- Para mostrar, dentro de uma resposta, quais remédios foram considerados, use o texto "Considerando também" do `AnswerHeadline`.
- Para um atalho na primeira visita ("Seus remédios: nenhum ainda"), use um link para a tela.

## Anatomia

- Busca "Adicionar remédio" (`ComboBox` com filtro tolerante a erro de digitação), com os remédios da base.
- A lista, um item por remédio, cada um com o botão "Remover losartana".
- "Nenhum remédio na lista.", quando está vazia.
- O interruptor "Lembrar neste aparelho", com a explicação de cada estado.
- "Apagar tudo", na variante `perigo`, quando a lista tem itens.

## Props

<ArgTypes of={Stories} />

O componente não grava nada. Ele recebe a lista e o estado do consentimento e avisa o app pelos callbacks. Quem guarda é o app: em `sessionStorage` por padrão e em `localStorage` com o consentimento ligado. Ao desligar, o app limpa o `localStorage` na hora.

## Estados

<Canvas of={Stories.Vazia} />

<Canvas of={Stories.Adicionar} />

<Canvas of={Stories.LembrarLigado} />

<Canvas of={Stories.ApagarTudo} />

<Canvas of={Stories.AltoContraste} />

## Acessibilidade

- A lista é um `ul` com nome ("Remédios da lista"). Cada botão de remover diz qual remédio sai.
- Ao remover, o foco vai para o próximo item (ou para o anterior). Se a lista esvaziar, vai para a busca. Depois de "Apagar tudo" e depois de adicionar, também vai para a busca, que volta vazia e fechada.
- O interruptor tem papel `switch`, e a explicação fica ligada a ele por `aria-describedby`: o leitor de tela lê o que acontece em cada estado.
- "Apagar tudo" confirma com o `Toast` ("Lista apagada deste aparelho."), que não some enquanto tem foco.

## Conteúdo

Os textos do consentimento ficam em `TEXTOS_DO_CONSENTIMENTO` e são os das telas aprovadas. O texto precisa ser verdadeiro: a lista vai junto com cada pergunta para a API, então a interface nunca diz que "nada é enviado". O que ela diz, porque é verdade, é que a lista não fica guardada em nenhum servidor.

## Faça e não faça

- Faça: comece com o interruptor desligado e a explicação visível antes de a pessoa ligar.
- Não faça: "Seus dados ficam só no seu aparelho. Nada é enviado para servidores."
- Não faça: gravar no `localStorage` sem o consentimento ligado.
```

- [ ] **Passo 7: Commit**

```bash
git add frontend/packages/ui/src/components/MedicationList
git commit -m "feat(ui): MedicationList com consentimento e Apagar tudo (#25)"
```

---

### Tarefa D2: Barrel, changeset e conferência do grupo

**Arquivos:**
- Modificar: `frontend/packages/ui/src/grupos/lista.ts`
- Criar: `frontend/.changeset/dominio-lista.md`

- [ ] **Passo 1: Barrel e changeset**

`frontend/packages/ui/src/grupos/lista.ts`:

```ts
// Grupo D do plano 3: a lista Meus remédios.
export * from '../components/MedicationList';
```

`frontend/.changeset/dominio-lista.md`:

```md
---
'@bula-clara/ui': minor
---

MedicationList: a lista "Meus remédios" com busca tolerante a erro, remoção com foco cuidado, o consentimento "Lembrar neste aparelho" (começa desligado) e "Apagar tudo" com confirmação.
```

- [ ] **Passo 2: Conferir o grupo**

```bash
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui test < /dev/null
pnpm --filter @bula-clara/ui exec vitest run --project unit < /dev/null
```

Esperado: lint e tipos sem erro, `Tests  188 passed (188)` no `ui` e `Tests  115 passed (115)` de unidade.

- [ ] **Passo 3: Commit**

```bash
git add frontend/packages/ui/src/grupos/lista.ts frontend/.changeset/dominio-lista.md
git commit -m "feat(ui): exporta a lista de remédios (#25)"
```

---

### Tarefa 2: Juntar os grupos

Quem coordena faz esta tarefa, no worktree do plano 3, depois que os quatro grupos terminarem.

- [ ] **Passo 1: Juntar os quatro grupos**

Cada grupo é um conjunto de commits sobre o commit da Tarefa 1. Traga os quatro, um de cada vez (merge ou cherry-pick, como preferir). Não deve haver conflito: cada grupo só criou as pastas dele, o barrel dele e o changeset dele.

```bash
ls frontend/packages/ui/src/components | wc -l   # 46: os 27 dos planos 1 e 2 e os 19 deste plano
ls frontend/.changeset/dominio-*.md | wc -l      # 5
```

- [ ] **Passo 2: Conferir**

```bash
cd frontend
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui test < /dev/null
```

Esperado: lint e tipos sem erro e `Tests  334 passed (334)` no `ui`.

---

### Tarefa 3: Páginas de Padrões

**Arquivos:**
- Criar: `frontend/packages/ui/src/docs/5-padroes/1-BlocoDeResposta.stories.tsx` e `1-BlocoDeResposta.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/2-FichaDoRemedio.stories.tsx` e `2-FichaDoRemedio.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/3-Emergencia.stories.tsx` e `3-Emergencia.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/4-Consentimento.stories.tsx` e `4-Consentimento.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/5-CapturaDeFoto.stories.tsx` e `5-CapturaDeFoto.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/6-CapturaDeVoz.stories.tsx` e `6-CapturaDeVoz.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/7-PrimeiraVisita.stories.tsx` e `7-PrimeiraVisita.mdx`
- Criar: `frontend/packages/ui/src/docs/5-padroes/8-Erros.stories.tsx` e `8-Erros.mdx`

Depende dos quatro grupos. Cada padrão é um par: uma story com a composição de verdade (que passa pelo axe e tem `play` conferindo o comportamento) e uma página MDX ligada a ela por `<Meta of>`. As composições ficam dentro do arquivo de stories e não são exportadas pelo pacote: são receitas para o app. Os textos são os da página Conteúdo e voz/Textos da interface do plano 4. Nenhuma story chama a rede: `/ler-caixa`, `/transcrever` e `/falar` são funções passadas por prop, que respondem na hora.

- [ ] **Passo 1: Bloco de resposta**

As 10 camadas, na ordem da spec, cada uma marcada com um comentário. O `play` confere a ordem pela posição no documento. A story "Carregando e chegando" confere que só existe uma região `aria-live`, que ela fica vazia quando a resposta chega e que o foco vai para a frase-resposta.

`frontend/packages/ui/src/docs/5-padroes/1-BlocoDeResposta.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';
import { AnswerHeadline } from '../../components/AnswerHeadline';
import { DemoTrace } from '../../components/DemoTrace';
import { traceDeExemplo } from '../../components/DemoTrace/exemplos';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { InteractionCallout } from '../../components/InteractionCallout';
import { ListenButton } from '../../components/ListenButton';
import { LoadingStatus } from '../../components/LoadingStatus';
import { Prose } from '../../components/Prose';
import { ProvenanceSeal } from '../../components/ProvenanceSeal';
import { ReasoningSteps } from '../../components/ReasoningSteps';
import { passosDeExemplo } from '../../components/ReasoningSteps/exemplos';
import { SourceChip, SuggestionChip, sugestoesDePerguntarMais } from '../../components/SourceChip';
import { Text } from '../../components/Text';
import { simularVozes, VOZ_LOCAL } from '../../test/stubs';

const frase = 'Pode ser perigoso. O ibuprofeno pode diminuir o efeito da losartana e forçar os rins.';
const explicacao = [
  'A bula da losartana diz que anti-inflamatórios, como o ibuprofeno, podem diminuir o efeito do remédio para pressão.',
  'Em algumas pessoas, usar os dois juntos também pode prejudicar os rins, principalmente em quem já tem problema renal ou é mais velho.',
  'A bula do ibuprofeno pede cuidado em quem usa remédios para pressão.',
];

interface BlocoDeRespostaProps {
  /** Abrir a ficha do remédio na seção citada (estado de navegação, nunca URL com o nome). */
  onAbrirFicha: (remedio: string, secao: number) => void;
  onPerguntar: (pergunta: string) => void;
  focarAoMontar?: boolean;
  /** Só no modo demonstração (?demo=1). */
  demonstracao?: boolean;
}

/** As 10 camadas da resposta, na ordem da spec. Cada camada só aparece quando há dados. */
function BlocoDeResposta({ onAbrirFicha, onPerguntar, focarAoMontar = false, demonstracao = false }: BlocoDeRespostaProps) {
  const sugestoes = sugestoesDePerguntarMais({
    remedio: { nome: 'Losartana', artigo: 'a' },
    outros: ['Paracetamol'],
    pergunta: 'Posso tomar ibuprofeno com losartana?',
  });
  return (
    // <article>, e não <section> com nome: cada resposta do histórico é um bloco completo, e várias
    // regiões chamadas "Resposta" na mesma tela confundiriam a navegação por regiões.
    <article className="flex max-w-medida flex-col gap-6">
      {/* 1 e 2: a pergunta, os remédios considerados e a frase-resposta */}
      <AnswerHeadline
        pergunta="Posso tomar ibuprofeno com losartana?"
        consideradosTambem={['Metformina']}
        focarAoMontar={focarAoMontar}
      >
        {frase}
      </AnswerHeadline>
      {/* 3: Ouvir */}
      <ListenButton texto={[frase, ...explicacao].join(' ')} />
      {/* 4: as interações, as com frase achada primeiro */}
      <div className="flex flex-col gap-3">
        <InteractionCallout
          remedios={['Losartana', 'Ibuprofeno']}
          secao="precaucoes_interacoes"
          evidencia={{
            frase: 'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana.',
            remedio: 'Losartana',
          }}
        />
        <InteractionCallout remedios={['Ibuprofeno', 'Metformina']} secao={null} />
      </div>
      {/* 5: a explicação com as citações */}
      <Prose>
        <p>
          {explicacao[0]} <sup>[1]</sup>
        </p>
        <p>
          {explicacao[1]} <sup>[1]</sup>
        </p>
        <p>
          {explicacao[2]} <sup>[2]</sup>
        </p>
      </Prose>
      {/* 6: os chips de seção */}
      <div className="flex flex-wrap gap-2">
        <SourceChip numero={1} remedio="Losartana" secao={4} onPress={() => onAbrirFicha('losartana', 4)} />
        <SourceChip numero={2} remedio="Ibuprofeno" secao={4} onPress={() => onAbrirFicha('ibuprofeno', 4)} />
      </div>
      {/* 7: o selo de procedência */}
      <ProvenanceSeal
        bulas={[
          { remedio: 'Losartana', versao: '03/2025' },
          { remedio: 'Ibuprofeno', versao: '11/2024' },
        ]}
      />
      {/* 8: como chegamos nesta resposta (e o trace, só no modo demonstração) */}
      <ReasoningSteps passos={passosDeExemplo} />
      {demonstracao ? <DemoTrace {...traceDeExemplo} /> : null}
      {/* 9: Perguntar mais, de modelos fixos */}
      <div className="flex flex-col gap-2">
        <Text variante="rotulo" elemento="p">
          Perguntar mais
        </Text>
        <div className="flex flex-wrap gap-2">
          {sugestoes.map((sugestao) => (
            <SuggestionChip key={sugestao} onPress={() => onPerguntar(sugestao)}>
              {sugestao}
            </SuggestionChip>
          ))}
        </div>
      </div>
      {/* 10: o aviso legal */}
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </article>
  );
}

const ETAPAS = ['Identificando os remédios…', 'Lendo a bula da losartana…', 'Checando interações…', 'Conferindo a segurança…'];

/** A espera e a chegada: o status muda na região aria-live e, quando a resposta chega, o foco vai para ela. */
function Chegada(props: BlocoDeRespostaProps) {
  const [etapa, setEtapa] = useState(0);
  const chegou = etapa >= ETAPAS.length;
  useEffect(() => {
    if (chegou) return;
    const espera = setTimeout(() => setEtapa((atual) => atual + 1), 120);
    return () => clearTimeout(espera);
  }, [chegou, etapa]);
  return (
    <div className="flex flex-col gap-6">
      {chegou ? <BlocoDeResposta {...props} focarAoMontar /> : null}
      <LoadingStatus>{chegou ? '' : ETAPAS[etapa]}</LoadingStatus>
    </div>
  );
}

const meta = {
  title: 'Padrões/Bloco de resposta',
  component: BlocoDeResposta,
  args: { onAbrirFicha: fn(), onPerguntar: fn() },
  beforeEach: () => simularVozes([VOZ_LOCAL]).desfazer,
} satisfies Meta<typeof BlocoDeResposta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {
  play: async ({ canvas, args }) => {
    // As camadas aparecem na ordem da spec.
    const camadas = [
      canvas.getByText('Sua pergunta'),
      canvas.getByRole('heading', { name: frase }),
      canvas.getByRole('button', { name: 'Ouvir resposta' }),
      canvas.getAllByRole('note')[0],
      canvas.getByText(explicacao[0] ?? '', { exact: false }),
      canvas.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' }),
      canvas.getByText(/^Bula oficial ANVISA/),
      canvas.getByRole('button', { name: 'Como chegamos nesta resposta' }),
      canvas.getByText('Perguntar mais'),
      canvas.getByText(avisoLegal),
    ];
    for (let i = 1; i < camadas.length; i++) {
      const antes = camadas[i - 1] as Node;
      await expect(antes.compareDocumentPosition(camadas[i] as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    canvas.getByRole('button', { name: '[1] Na bula: Losartana · seção 4' }).click();
    await expect(args.onAbrirFicha).toHaveBeenCalledWith('losartana', 4);
    await expect(canvas.getAllByRole('button', { name: /^(Como tomar|Para que serve|E com)/ })).toHaveLength(3);
  },
};

export const Chegando: Story = {
  name: 'Carregando e chegando',
  render: (args) => <Chegada {...args} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[aria-live]')).toHaveLength(1);
    await waitFor(() => expect(canvas.getByRole('heading', { name: frase })).toHaveFocus(), { timeout: 3000 });
    // Na chegada, a região aria-live fica vazia: a resposta é lida a partir do foco, uma vez só.
    await expect(canvasElement.querySelector('[aria-live]')).toBeEmptyDOMElement();
  },
};

export const ModoDemonstracao: Story = {
  name: 'No modo demonstração',
  args: { demonstracao: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Modo demonstração: o que os agentes fizeram' })).toBeInTheDocument();
  },
};

export const AltoContrasteETextoGrande: Story = {
  name: 'Alto contraste e texto em 140%',
  globals: { contraste: 'alto', escala: '140' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/1-BlocoDeResposta.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './1-BlocoDeResposta.stories';

<Meta of={Stories} />

# Bloco de resposta

Como os componentes se juntam numa resposta completa. Cada resposta é uma página inteira, e as respostas anteriores continuam acima, cada uma como um bloco igual a este.

## Exemplo

<Canvas of={Stories.Completo} />

## As 10 camadas, nesta ordem

Cada camada só aparece quando há dados para ela.

1. A pergunta feita e os remédios considerados (`AnswerHeadline`).
2. A frase-resposta (`AnswerHeadline`).
3. O botão Ouvir (`ListenButton`), que some se não houver voz permitida.
4. A interação (`InteractionCallout`), um por par checado, com os pares com frase achada primeiro.
5. A explicação completa com as citações `[n]` (`Prose`).
6. Os chips de seção da bula (`SourceChip`), um por citação.
7. O selo de procedência (`ProvenanceSeal`).
8. "Como chegamos nesta resposta", recolhido (`ReasoningSteps`). No modo demonstração, o `DemoTrace` vem logo depois.
9. As sugestões de "Perguntar mais" (`SuggestionChip`), montadas por `sugestoesDePerguntarMais` a partir de modelos fixos, sem LLM.
10. O aviso legal (`DisclaimerFooter`).

As citações `[n]` dentro do texto são só texto. Quem leva à ficha é o chip de seção, que tem área de toque de 48px. Um número pequeno dentro da frase seria difícil de tocar.

## Carregando e chegando

Enquanto a resposta é montada, o `LoadingStatus` mostra a etapa atual numa região `aria-live="polite"`, que fica montada o tempo todo. Quando a resposta chega, a região fica vazia e o foco vai para a frase-resposta. Assim o leitor de tela começa a ler dali, uma vez só.

<Canvas of={Stories.Chegando} />

## No modo demonstração

Com `?demo=1`, o app passa o trace e o `DemoTrace` aparece depois do "Como chegamos nesta resposta".

<Canvas of={Stories.ModoDemonstracao} />

## Alto contraste e texto em 140%

<Canvas of={Stories.AltoContrasteETextoGrande} />

## Regras

- Em emergência, a resposta inteira vira o `EmergencyCard` (veja Padrões/Emergência). Em bloqueio por dose ou grupo especial, o `SafetyNotice` fica no lugar das camadas 2 a 9.
- A ficha abre pelo chip, por estado de navegação, sem o nome do remédio na URL.
- Nenhuma sugestão fala de dose, troca ou suspensão.
- A resposta não é guardada em lugar nenhum além da memória da página.
```

- [ ] **Passo 2: Ficha do remédio**

As 9 seções da RDC 47/2009 como perguntas (`SECOES_DA_BULA`), num `Accordion` com o rótulo "Nesta bula", como no `canvas/Ficha.dc.html`. A seção citada vem aberta, com "Citado na sua resposta" e a frase destacada num `mark`. O texto das seções que não estão nas telas aprovadas é só um marcador ("Texto da seção 5 da bula, em linguagem simples."), porque o conteúdo vem da #22.

`frontend/packages/ui/src/docs/5-padroes/2-FichaDoRemedio.stories.tsx`:

```tsx
import { ArrowLeft } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from '../../components/Button';
import { Accordion, Disclosure } from '../../components/Disclosure';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { Heading } from '../../components/Heading';
import { ListenButton } from '../../components/ListenButton';
import { ProvenanceSeal } from '../../components/ProvenanceSeal';
import { SECOES_DA_BULA } from '../../components/SourceChip';
import { Text } from '../../components/Text';
import { simularVozes, VOZ_LOCAL } from '../../test/stubs';

// No app, o texto de cada seção vem do GET /medicamentos/{nome} (issue #22), já em linguagem simples.
const textoDaSecao: Record<number, string> = {
  1: 'A losartana serve para tratar a pressão alta.',
  4: 'Avise o médico se você tem problema nos rins ou no fígado.',
};

interface FichaProps {
  /** A seção citada na resposta, que abre sozinha. */
  secaoCitada: number;
  /** A frase da bula usada na resposta, destacada dentro da seção citada. */
  fraseCitada?: string;
  /** Data da versão da bula, ou null quando não há. */
  versao: string | null;
  onVoltar: () => void;
}

/** Ficha do remédio: nome, selo, "Ouvir esta página" e as 9 seções como perguntas, num acordeão. */
function FichaDoRemedio({ secaoCitada, fraseCitada, versao, onVoltar }: FichaProps) {
  const leitura = SECOES_DA_BULA.map((secao) => `${secao.pergunta} ${textoDaSecao[secao.numero] ?? ''}`).join(' ');
  return (
    <div className="flex max-w-medida flex-col gap-4">
      <div>
        <Button variante="discreta" icone={ArrowLeft} onPress={onVoltar}>
          Voltar
        </Button>
      </div>
      <Heading nivel={1}>Losartana</Heading>
      <ProvenanceSeal bulas={[{ versao }]} />
      <ListenButton texto={`Losartana. ${leitura}`} rotulo="Ouvir esta página" />
      <Text variante="rotulo" elemento="p">
        Nesta bula
      </Text>
      <Accordion defaultExpandedKeys={[String(secaoCitada)]}>
        {SECOES_DA_BULA.map((secao) => (
          <Disclosure key={secao.numero} id={String(secao.numero)} titulo={`${secao.numero}. ${secao.pergunta}`} nivelTitulo={2}>
            {secao.numero === secaoCitada && fraseCitada ? (
              <div className="flex flex-col gap-2">
                <Text variante="rotulo" elemento="p">
                  Citado na sua resposta
                </Text>
                <p>
                  <mark className="bg-caution-bg text-caution-text">“{fraseCitada}”</mark>
                </p>
                {textoDaSecao[secao.numero] ? <p>{textoDaSecao[secao.numero]}</p> : null}
              </div>
            ) : (
              <p>{textoDaSecao[secao.numero] ?? `Texto da seção ${secao.numero} da bula, em linguagem simples.`}</p>
            )}
          </Disclosure>
        ))}
      </Accordion>
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </div>
  );
}

const meta = {
  title: 'Padrões/Ficha do remédio',
  component: FichaDoRemedio,
  args: {
    secaoCitada: 4,
    versao: '03/2025',
    fraseCitada:
      'Anti-inflamatórios, como o ibuprofeno, podem reduzir o efeito anti-hipertensivo da losartana. O uso junto também pode piorar a função dos rins.',
    onVoltar: fn(),
  },
  beforeEach: () => simularVozes([VOZ_LOCAL]).desfazer,
} satisfies Meta<typeof FichaDoRemedio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AbertaNaSecaoCitada: Story = {
  name: 'Aberta na seção citada',
  play: async ({ canvas }) => {
    const secoes = canvas.getAllByRole('button', { name: /^\d\. / });
    await expect(secoes).toHaveLength(9);
    await expect(canvas.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: '1. Para que serve?' })).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText('Citado na sua resposta')).toBeVisible();
    await expect(canvas.getByText(/Anti-inflamatórios, como o ibuprofeno/).tagName).toBe('MARK');
    await expect(canvas.getByText('Bula oficial ANVISA · versão de 03/2025')).toBeInTheDocument();
  },
};

export const OutraSecao: Story = {
  name: 'Abrindo outra seção',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '6. Como devo usar?' }));
    // Abrir uma seção não fecha a citada.
    await expect(canvas.getByRole('button', { name: '6. Como devo usar?' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: '4. O que devo saber antes de usar?' })).toHaveAttribute('aria-expanded', 'true');
  },
};

export const SemData: Story = {
  name: 'Bula sem data, em alto contraste',
  args: { versao: null },
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Bula oficial ANVISA · data da versão não informada')).toBeInTheDocument();
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/2-FichaDoRemedio.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './2-FichaDoRemedio.stories';

<Meta of={Stories} />

# Ficha do remédio

A bula do remédio, inteira, organizada pelas 9 perguntas da RDC 47/2009. Ela abre pelo chip de seção de uma resposta, já na seção citada.

## Exemplo

<Canvas of={Stories.AbertaNaSecaoCitada} />

## Composição

- "Voltar" (`Button` discreto), que leva de volta à resposta.
- O nome do remédio como título da página (`Heading` nível 1, em Literata).
- O selo de procedência sem repetir o nome ("Bula oficial ANVISA · versão de 03/2025").
- "Ouvir esta página" (`ListenButton`).
- O rótulo "Nesta bula" e as 9 seções como perguntas, num `Accordion` de `Disclosure`. Os títulos vêm de `SECOES_DA_BULA`.
- Na seção citada, aberta: "Citado na sua resposta" e a frase usada, destacada com `mark`.
- O aviso legal.

## Abrindo outra seção

Abrir uma seção não fecha as outras, e a citada continua aberta.

<Canvas of={Stories.OutraSecao} />

## Sem data da versão

<Canvas of={Stories.SemData} />

## Regras

- A ficha abre por estado de navegação (`/remedio` com o nome no estado do router), nunca por `/remedio/losartana`. O histórico do celular não registra o remédio consultado.
- O texto de cada seção vem do `GET /medicamentos/{nome}` (issue #22). Enquanto ele não existe, os exemplos mostram só o que já está nas telas aprovadas.
- A frase destacada é a mesma da evidência na resposta, sem resumo.

## Acessibilidade

- Cada seção é um botão dentro de um `h2`, com `aria-expanded`. As perguntas numeradas servem de índice para o leitor de tela (lista de títulos).
- O destaque não depende só da cor: a frase vem com o rótulo "Citado na sua resposta" e entre aspas.
```

- [ ] **Passo 3: Emergência**

Intoxicação e autolesão, com a faixa no topo e um `role="alert"` só, até quando o cartão aparece depois de uma resposta comum. No caso da autolesão, o primeiro `tel:` da tela é o da faixa (192), e os do cartão vêm na ordem do backend (188 e 192).

`frontend/packages/ui/src/docs/5-padroes/3-Emergencia.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AnswerHeadline } from '../../components/AnswerHeadline';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { EmergencyBar } from '../../components/EmergencyBar';
import { EmergencyCard, type EmergencyCardProps } from '../../components/EmergencyCard';
import { autolesao, intoxicacao } from '../../components/EmergencyCard/exemplos';
import { Text } from '../../components/Text';

interface TelaDeEmergenciaProps {
  pergunta: string;
  cartao: EmergencyCardProps;
}

/**
 * Quando a categoria_risco é "emergencia", a resposta inteira vira o cartão. A faixa continua no
 * topo, e o aviso legal no fim.
 */
function TelaDeEmergencia({ pergunta, cartao }: TelaDeEmergenciaProps) {
  return (
    <div className="flex flex-col gap-4">
      <EmergencyBar />
      <div className="flex flex-col gap-1">
        <Text variante="rotulo">Sua pergunta</Text>
        <Text>“{pergunta}”</Text>
      </div>
      <EmergencyCard {...cartao} nivelTitulo={1} />
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </div>
  );
}

const meta = {
  title: 'Padrões/Emergência',
  component: TelaDeEmergencia,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TelaDeEmergencia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Intoxicacao: Story = {
  name: 'Intoxicação',
  args: { pergunta: 'Meu neto engoliu uns comprimidos da minha cartela', cartao: intoxicacao },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    await expect(canvas.getByRole('link', { name: 'Emergência? Ligue 192' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(intoxicacao.titulo);
    // Nenhuma resposta comum aparece junto.
    await expect(canvas.queryByRole('button', { name: 'Ouvir resposta' })).toBeNull();
  },
};

export const Autolesao: Story = {
  name: 'Autolesão',
  args: { pergunta: 'Não aguento mais, quero acabar com a minha vida', cartao: autolesao },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    const ligar = canvas.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('tel:1'));
    await expect(ligar.map((link) => link.getAttribute('href'))).toEqual(['tel:192', 'tel:188', 'tel:192']);
    await expect(canvas.queryByText('Enquanto espera')).toBeNull();
  },
};

export const NoHistorico: Story = {
  name: 'Depois de uma resposta comum',
  args: { pergunta: 'Tomei a cartela toda de dipirona', cartao: intoxicacao },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <EmergencyBar />
      <AnswerHeadline pergunta="Para que serve a dipirona?">A dipirona serve para aliviar a dor e baixar a febre.</AnswerHeadline>
      <EmergencyCard {...args.cartao} />
      <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/3-Emergencia.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './3-Emergencia.stories';

<Meta of={Stories} />

# Emergência

Quando a `categoria_risco` é `emergencia`, a resposta inteira é substituída pelo `EmergencyCard`.

## Exemplo

<Canvas of={Stories.Intoxicacao} />

## Composição

- A faixa `EmergencyBar`, que continua no topo.
- "Sua pergunta", para a pessoa ver o que disparou o cartão.
- O `EmergencyCard`, com o título como `h1` da página.
- O aviso legal, que aparece também nas respostas bloqueadas.

Nada mais: sem Ouvir, sem interação, sem sugestões.

## Autolesão

O mesmo cartão, com o conteúdo que o backend manda para autolesão: mensagem acolhedora, CVV 188 primeiro e nenhuma orientação de intoxicação.

<Canvas of={Stories.Autolesao} />

## Depois de uma resposta comum

As respostas anteriores continuam acima, e o cartão aparece no bloco novo. Ainda assim, só há um `role="alert"` na tela.

<Canvas of={Stories.NoHistorico} />

## Regras

- O texto de segurança tem uma fonte só: o backend. A interface mostra a mensagem e os contatos na ordem recebida e cuida só do layout e dos botões `tel:`.
- No máximo um cartão por tela, sempre no topo do bloco. O componente reclama no console se encontrar dois.
- A faixa de emergência nunca some.
```

- [ ] **Passo 4: Consentimento**

A tela Meus remédios. A composição não grava nada: ela registra onde o app guardaria (`onGuardar('sessionStorage' | 'localStorage', lista)`) e quando limparia o aparelho (`onLimparDoAparelho`), e o `play` confere essas chamadas.

`frontend/packages/ui/src/docs/5-padroes/4-Consentimento.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmergencyBar } from '../../components/EmergencyBar';
import { Heading } from '../../components/Heading';
import { InputDock } from '../../components/InputDock';
import { MedicationList, TEXTOS_DO_CONSENTIMENTO, type RemedioDaLista } from '../../components/MedicationList';
import { baseDeRemedios, listaDeExemplo } from '../../components/MedicationList/exemplos';
import { Text } from '../../components/Text';
import { ToastRegion } from '../../components/Toast';

interface MeusRemediosProps {
  inicial: RemedioDaLista[];
  /** O que o app faria com o armazenamento. Aqui só registra, sem gravar nada. */
  onGuardar: (onde: 'sessionStorage' | 'localStorage', lista: RemedioDaLista[]) => void;
  onLimparDoAparelho: () => void;
}

/**
 * A tela Meus remédios. A regra de guardar é do app: sessionStorage por padrão, localStorage só com o
 * consentimento ligado, e desligar limpa o localStorage na hora. Aqui as chamadas só são registradas.
 */
function MeusRemedios({ inicial, onGuardar, onLimparDoAparelho }: MeusRemediosProps) {
  const [remedios, setRemedios] = useState(inicial);
  const [lembrar, setLembrar] = useState(false);
  const mudar = (lista: RemedioDaLista[]) => {
    setRemedios(lista);
    onGuardar(lembrar ? 'localStorage' : 'sessionStorage', lista);
  };
  return (
    <div className="flex flex-col gap-4">
      <EmergencyBar />
      <div className="flex flex-col gap-4 px-4">
        <Heading nivel={1}>Meus remédios</Heading>
        <Text>Uso esta lista para checar interações em cada pergunta.</Text>
        <MedicationList
          remedios={remedios}
          opcoes={baseDeRemedios}
          onAdicionar={(remedio) => mudar([...remedios, remedio])}
          onRemover={(id) => mudar(remedios.filter((remedio) => remedio.id !== id))}
          lembrar={lembrar}
          onLembrarChange={(ligado) => {
            setLembrar(ligado);
            if (ligado) onGuardar('localStorage', remedios);
            else onLimparDoAparelho();
          }}
          onApagarTudo={() => {
            setRemedios([]);
            onLimparDoAparelho();
          }}
        />
      </div>
      <InputDock
        mostrarCaixa={false}
        destinoAtual="remedios"
        enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
        onPerguntar={() => undefined}
        onAbrirCamera={() => undefined}
        onGravar={() => undefined}
      />
      <ToastRegion />
    </div>
  );
}

const meta = {
  title: 'Padrões/Consentimento',
  component: MeusRemedios,
  parameters: { layout: 'fullscreen' },
  args: { inicial: listaDeExemplo, onGuardar: fn(), onLimparDoAparelho: fn() },
} satisfies Meta<typeof MeusRemedios>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComecaDesligado: Story = {
  name: 'Começa desligado',
  play: async ({ canvas }) => {
    const interruptor = canvas.getByRole('switch', { name: 'Lembrar neste aparelho' });
    await expect(interruptor).not.toBeChecked();
    await expect(interruptor).toHaveAccessibleDescription(TEXTOS_DO_CONSENTIMENTO.desligado);
  },
};

export const LigarEDesligar: Story = {
  name: 'Ligar e desligar',
  play: async ({ canvas, args }) => {
    const interruptor = canvas.getByRole('switch', { name: 'Lembrar neste aparelho' });
    await userEvent.click(interruptor);
    await expect(args.onGuardar).toHaveBeenCalledWith('localStorage', listaDeExemplo);
    await userEvent.click(interruptor);
    await expect(args.onLimparDoAparelho).toHaveBeenCalledOnce();
  },
};

export const ApagarTudo: Story = {
  name: 'Apagar tudo',
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apagar tudo' }));
    await expect(args.onLimparDoAparelho).toHaveBeenCalledOnce();
    const pagina = within(canvasElement.ownerDocument.body);
    await expect(await pagina.findByText(TEXTOS_DO_CONSENTIMENTO.apagada)).toBeVisible();
    await userEvent.click(pagina.getByRole('button', { name: 'Fechar' }));
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/4-Consentimento.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './4-Consentimento.stories';

<Meta of={Stories} />

# Consentimento

"Lembrar neste aparelho": a lista de remédios só fica salva no navegador com um consentimento explícito, e sai dele na hora em que a pessoa quiser.

## Exemplo

<Canvas of={Stories.ComecaDesligado} />

## Composição

- O título "Meus remédios" e a frase "Uso esta lista para checar interações em cada pergunta.".
- O `MedicationList`: busca, lista, interruptor e "Apagar tudo".
- A barra de navegação, sem a caixa de pergunta.
- O `ToastRegion`, montado uma vez no layout do app.

## O que o app faz com a lista

O componente não grava nada. O app segue estas regras:

- Por padrão, a lista vive no `sessionStorage` e some quando a página fecha.
- Com o interruptor ligado, a lista passa para o `localStorage`.
- Ao desligar, o `localStorage` é limpo na hora.
- "Apagar tudo" limpa os dois e confirma com o Toast "Lista apagada deste aparelho.".
- A lista vai junto com cada pergunta (`medicamentos_em_uso`) e não fica guardada em nenhum servidor.

<Canvas of={Stories.LigarEDesligar} />

<Canvas of={Stories.ApagarTudo} />

## Regras

- O interruptor começa sempre desligado, e a explicação aparece antes de a pessoa ligar (consentimento explícito, LGPD art. 11).
- O texto de privacidade precisa ser verdadeiro. A interface nunca diz que "nada é enviado".
- "Apagar tudo" aparece sempre que a lista tem itens, como na tela aprovada. Com a lista vazia, não há o que apagar.
```

- [ ] **Passo 5: Captura de foto**

Da caixa de pergunta até a pergunta enviada, com a câmera simulada. O `play` confere que nada é perguntado antes do "sim". Na folha de "não consegui ler", o "Digitar o nome" é procurado dentro da folha, porque o visor por trás tem um botão com o mesmo nome.

`frontend/packages/ui/src/docs/5-padroes/5-CapturaDeFoto.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CameraCapture } from '../../components/CameraCapture';
import { InputDock } from '../../components/InputDock';
import { LoadingStatus } from '../../components/LoadingStatus';
import { OcrConfirm } from '../../components/OcrConfirm';
import { simularCamera } from '../../test/stubs';

type Etapa = 'perguntar' | 'camera' | 'confirmar' | 'perguntando';

interface FluxoDaFotoProps {
  /** Faz o papel do POST /ler-caixa (issue #24). Aqui responde na hora, sem rede. */
  lerCaixa: (foto: Blob) => Promise<string | null>;
  onPerguntar: (pergunta: string) => void;
}

/** Foto da caixa, leitura e confirmação. A pergunta só sai depois do "sim". */
function FluxoDaFoto({ lerCaixa, onPerguntar }: FluxoDaFotoProps) {
  const [etapa, setEtapa] = useState<Etapa>('perguntar');
  const [lido, setLido] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      {etapa === 'camera' || etapa === 'confirmar' ? (
        <CameraCapture
          onFechar={() => setEtapa('perguntar')}
          onDigitar={() => setEtapa('perguntar')}
          onFoto={async (foto) => {
            setLido(await lerCaixa(foto));
            setEtapa('confirmar');
          }}
        />
      ) : null}
      {etapa === 'perguntando' ? <LoadingStatus>Lendo a bula da losartana…</LoadingStatus> : <LoadingStatus />}
      <OcrConfirm
        isOpen={etapa === 'confirmar'}
        onOpenChange={(aberta) => {
          if (!aberta && etapa === 'confirmar') setEtapa('camera');
        }}
        medicamento={lido}
        onConfirmar={() => {
          onPerguntar('Para que serve a losartana?');
          setEtapa('perguntando');
        }}
        onDigitar={() => setEtapa('perguntar')}
        onTentarDeNovo={() => setEtapa('camera')}
      />
      {etapa === 'perguntar' || etapa === 'perguntando' ? (
        <InputDock
          destinoAtual="perguntar"
          enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
          onPerguntar={onPerguntar}
          onAbrirCamera={() => setEtapa('camera')}
          onGravar={() => undefined}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: 'Padrões/Captura de foto',
  component: FluxoDaFoto,
  args: { lerCaixa: async (): Promise<string | null> => 'Losartana potássica 50 mg', onPerguntar: fn() },
} satisfies Meta<typeof FluxoDaFoto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmarAntesDePerguntar: Story = {
  name: 'Confirmar antes de perguntar',
  beforeEach: () => simularCamera('permitir').desfazer,
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    const tirar = await canvas.findByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: 'Losartana potássica 50 mg' });
    await waitFor(() => expect(folha).toBeVisible());
    await expect(args.onPerguntar).not.toHaveBeenCalled();
    await userEvent.click(pagina.getByRole('button', { name: 'Sim, perguntar sobre ele' }));
    await expect(args.onPerguntar).toHaveBeenCalledWith('Para que serve a losartana?');
    await expect(await canvas.findByText('Lendo a bula da losartana…')).toBeInTheDocument();
  },
};

export const NaoLeu: Story = {
  name: 'Não conseguiu ler',
  args: { lerCaixa: async () => null },
  beforeEach: () => simularCamera('permitir').desfazer,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    const tirar = await canvas.findByRole('button', { name: 'Tirar foto' });
    await waitFor(() => expect(tirar).toBeEnabled());
    await userEvent.click(tirar);
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: 'Não consegui ler o nome na foto' });
    await userEvent.click(within(folha).getByRole('button', { name: 'Digitar o nome' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument());
  },
};

export const CameraNegada: Story = {
  name: 'Câmera negada',
  beforeEach: () => simularCamera('negar').desfazer,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Fotografar a caixa' }));
    await expect(await canvas.findByText('A câmera está bloqueada para o Bula Clara')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Digitar o nome' }));
    await expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument();
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/5-CapturaDeFoto.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './5-CapturaDeFoto.stories';

<Meta of={Stories} />

# Captura de foto

Fotografar a caixa, conferir o que foi lido e só então perguntar.

## Exemplo

<Canvas of={Stories.ConfirmarAntesDePerguntar} />

## O fluxo

1. A pessoa toca em "Fotografar a caixa" (no corpo da primeira visita ou na caixa de pergunta).
2. O `CameraCapture` pede a câmera traseira e mostra o visor com a moldura "Enquadre o nome do remédio aqui".
3. "Tirar foto" entrega a imagem ao app, que chama o `POST /ler-caixa` (issue #24). Esse endpoint só lê: não monta pergunta nem chama a LLM.
4. O `OcrConfirm` sobe com "Li na caixa", o nome lido e "É esse o remédio?".
5. Só com "Sim, perguntar sobre ele" a pergunta vai para o `/perguntar`. "Não, vou digitar o nome" leva ao campo.

Esse passo de confirmação protege contra responder sobre o remédio errado (risco R3).

## Quando nada foi lido

<Canvas of={Stories.NaoLeu} />

## Câmera negada

<Canvas of={Stories.CameraNegada} />

## Regras

- Nas stories, a câmera é simulada com um canvas desenhado. Nenhuma story pede permissão de verdade nem chama a rede.
- A câmera desliga quando o visor sai da tela.
- A foto não é guardada. A nota "A foto é usada só para ler o nome e não é guardada" depende de o `/ler-caixa` cumprir isso.
```

- [ ] **Passo 6: Captura de voz**

`frontend/packages/ui/src/docs/5-padroes/6-CapturaDeVoz.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { InputDock } from '../../components/InputDock';
import { LoadingStatus } from '../../components/LoadingStatus';
import { TranscriptConfirm } from '../../components/TranscriptConfirm';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { simularMicrofone } from '../../test/stubs';

type Etapa = 'perguntar' | 'gravando' | 'confirmar' | 'perguntando';

interface FluxoDaVozProps {
  /** Faz o papel do POST /transcrever (Whisper no nosso servidor, issue #24). Aqui, sem rede. */
  transcrever: (audio: Blob) => Promise<string>;
  onPerguntar: (pergunta: string) => void;
}

/** Gravação, transcrição no servidor e confirmação. A pergunta só sai depois do "sim". */
function FluxoDaVoz({ transcrever, onPerguntar }: FluxoDaVozProps) {
  const [etapa, setEtapa] = useState<Etapa>('perguntar');
  const [texto, setTexto] = useState('');
  return (
    <div className="flex flex-col gap-4">
      {etapa === 'gravando' || etapa === 'confirmar' ? (
        <VoiceRecorder
          onFechar={() => setEtapa('perguntar')}
          onEscrever={() => setEtapa('perguntar')}
          onGravacao={async (audio) => {
            setTexto(await transcrever(audio));
            setEtapa('confirmar');
          }}
        />
      ) : null}
      {etapa === 'perguntando' ? <LoadingStatus>Identificando os remédios…</LoadingStatus> : <LoadingStatus />}
      <TranscriptConfirm
        isOpen={etapa === 'confirmar'}
        onOpenChange={(aberta) => {
          if (!aberta && etapa === 'confirmar') setEtapa('perguntar');
        }}
        transcricao={texto}
        onConfirmar={() => {
          onPerguntar(texto);
          setEtapa('perguntando');
        }}
        onEscrever={() => setEtapa('perguntar')}
        onGravarDeNovo={() => setEtapa('gravando')}
      />
      {etapa === 'perguntar' || etapa === 'perguntando' ? (
        <InputDock
          destinoAtual="perguntar"
          enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
          onPerguntar={onPerguntar}
          onAbrirCamera={() => undefined}
          onGravar={() => setEtapa('gravando')}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: 'Padrões/Captura de voz',
  component: FluxoDaVoz,
  args: { transcrever: async () => 'Posso tomar ibuprofeno com losartana?', onPerguntar: fn() },
} satisfies Meta<typeof FluxoDaVoz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmarAntesDePerguntar: Story = {
  name: 'Confirmar antes de perguntar',
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Perguntar falando' }));
    await expect(await canvas.findByText('Ouvindo… fale sua pergunta')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Parar de gravar' }));
    const pagina = within(canvasElement.ownerDocument.body);
    const folha = await pagina.findByRole('dialog', { name: '“Posso tomar ibuprofeno com losartana?”' });
    await waitFor(() => expect(folha).toBeVisible());
    await expect(args.onPerguntar).not.toHaveBeenCalled();
    await userEvent.click(pagina.getByRole('button', { name: 'Sim, perguntar' }));
    await expect(args.onPerguntar).toHaveBeenCalledWith('Posso tomar ibuprofeno com losartana?');
  },
};

export const Corrigir: Story = {
  name: 'Corrigir escrevendo',
  beforeEach: () => simularMicrofone().desfazer,
  play: async ({ canvas, args, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Perguntar falando' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Parar de gravar' }));
    const pagina = within(canvasElement.ownerDocument.body);
    await userEvent.click(await pagina.findByRole('button', { name: 'Não, vou escrever' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument());
    await expect(args.onPerguntar).not.toHaveBeenCalled();
  },
};

export const MicrofoneNegado: Story = {
  name: 'Microfone negado',
  beforeEach: () => simularMicrofone('negar').desfazer,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Perguntar falando' }));
    await expect(await canvas.findByText('O microfone está bloqueado para o Bula Clara')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Escrever a pergunta' }));
    await expect(canvas.getByRole('textbox', { name: 'Sua pergunta' })).toBeInTheDocument();
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/6-CapturaDeVoz.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './6-CapturaDeVoz.stories';

<Meta of={Stories} />

# Captura de voz

Gravar a pergunta, conferir o que foi entendido e só então perguntar.

## Exemplo

<Canvas of={Stories.ConfirmarAntesDePerguntar} />

## O fluxo

1. A pessoa toca em "Perguntar falando".
2. O `VoiceRecorder` começa a gravar e avisa por som, vibração e texto ("Ouvindo… fale sua pergunta").
3. "Parar de gravar" (ou o limite de 30 segundos) entrega o áudio ao app, que chama o `POST /transcrever` (Whisper no nosso servidor, issue #24).
4. O `TranscriptConfirm` sobe com "Entendi", a pergunta entre aspas e "Está certo?".
5. Só com "Sim, perguntar" a pergunta vai para o `/perguntar`. "Não, vou escrever" leva ao campo.

## Corrigir escrevendo

<Canvas of={Stories.Corrigir} />

## Microfone negado

<Canvas of={Stories.MicrofoneNegado} />

## Regras

- A fala vira texto só no nosso servidor. A `SpeechRecognition` do navegador nunca é usada, porque no Chrome ela manda o áudio para o Google.
- Nas stories, o microfone e o gravador são simulados. Nada é gravado nem enviado.
- Tudo o que foi falado aparece escrito antes de virar pergunta.
```

- [ ] **Passo 7: Primeira visita**

O estado vazio do `canvas/Main.dc.html`: título, frase, foto (primário) e voz (secundário), "Ou toque num exemplo" com três `SuggestionChip`, o atalho "Seus remédios: nenhum ainda" e o `InputDock`.

`frontend/packages/ui/src/docs/5-padroes/7-PrimeiraVisita.stories.tsx`:

```tsx
import { Camera, Info, Microphone } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from '../../components/Button';
import { EmergencyBar } from '../../components/EmergencyBar';
import { Heading } from '../../components/Heading';
import { InputDock } from '../../components/InputDock';
import { SuggestionChip } from '../../components/SourceChip';
import { Text } from '../../components/Text';

const EXEMPLOS = [
  'Posso tomar ibuprofeno com losartana?',
  'Para que serve a losartana?',
  'Posso dobrar a dose da losartana?',
];

interface PrimeiraVisitaProps {
  onPerguntar: (pergunta: string) => void;
  onAbrirCamera: () => void;
  onGravar: () => void;
}

/** Perguntar, na primeira visita: nenhuma resposta ainda e a lista de remédios vazia. */
function PrimeiraVisita({ onPerguntar, onAbrirCamera, onGravar }: PrimeiraVisitaProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <EmergencyBar />
      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        <Heading nivel={1}>Tire sua dúvida sobre um remédio</Heading>
        <Text>Eu explico a bula oficial da ANVISA com palavras simples.</Text>
        <div className="flex flex-col gap-3">
          <Button larguraTotal icone={Camera} onPress={onAbrirCamera}>
            Fotografar a caixa
          </Button>
          <Button variante="secundaria" larguraTotal icone={Microphone} onPress={onGravar}>
            Perguntar falando
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Text variante="apoio">Ou toque num exemplo</Text>
          <div className="flex flex-col items-start gap-2">
            {EXEMPLOS.map((exemplo) => (
              <SuggestionChip key={exemplo} onPress={() => onPerguntar(exemplo)}>
                {exemplo}
              </SuggestionChip>
            ))}
          </div>
        </div>
        <Link
          href="#meus-remedios"
          className={
            'flex max-w-medida gap-3 rounded-controle border border-border-field p-4 text-text-default no-underline ' +
            'data-focus-visible:foco-visivel data-hovered:bg-action-primary-subtle alto-contraste:border-(length:--bc-borda-controle)'
          }
        >
          <Info size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="mt-0.5 shrink-0 text-action-primary" />
          <span className="flex flex-col gap-1">
            <b className="font-bold">Seus remédios: nenhum ainda</b>
            <span className="text-apoio text-text-muted">Adicione os remédios que você usa para eu checar interações.</span>
            <span className="font-bold text-action-primary underline underline-offset-3">Adicionar</span>
          </span>
        </Link>
      </main>
      <InputDock
        destinoAtual="perguntar"
        enderecos={{ perguntar: '#perguntar', remedios: '#meus-remedios', sobre: '#sobre' }}
        onPerguntar={onPerguntar}
        onAbrirCamera={onAbrirCamera}
        onGravar={onGravar}
      />
    </div>
  );
}

const meta = {
  title: 'Padrões/Primeira visita',
  component: PrimeiraVisita,
  parameters: { layout: 'fullscreen' },
  args: { onPerguntar: fn(), onAbrirCamera: fn(), onGravar: fn() },
} satisfies Meta<typeof PrimeiraVisita>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EstadoVazio: Story = {
  name: 'Estado vazio',
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: 'Tire sua dúvida sobre um remédio' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Posso tomar ibuprofeno com losartana?' }));
    await expect(args.onPerguntar).toHaveBeenCalledWith('Posso tomar ibuprofeno com losartana?');
    // Câmera e microfone aparecem duas vezes: no corpo e na caixa de pergunta. Os dois abrem o mesmo fluxo.
    await expect(canvas.getAllByRole('button', { name: 'Fotografar a caixa' })).toHaveLength(2);
    await expect(canvas.getByRole('link', { name: /Seus remédios: nenhum ainda/ })).toBeInTheDocument();
  },
};

export const TextoGrande: Story = {
  name: 'Texto em 140%, alto contraste',
  globals: { escala: '140', contraste: 'alto' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/7-PrimeiraVisita.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './7-PrimeiraVisita.stories';

<Meta of={Stories} />

# Primeira visita

A tela Perguntar antes da primeira pergunta: o estado vazio do Bula Clara.

## Exemplo

<Canvas of={Stories.EstadoVazio} />

## Composição

- A faixa de emergência.
- O título "Tire sua dúvida sobre um remédio" e a frase "Eu explico a bula oficial da ANVISA com palavras simples.".
- As entradas por foto e por voz, como botões secundários de mesmo peso.
- "Ou toque num exemplo", com três perguntas em `SuggestionChip`. Uma delas ("Posso dobrar a dose da losartana?") mostra, de propósito, como o Bula Clara recusa um pedido de mudança de dose.
- O atalho "Seus remédios: nenhum ainda", que leva a Meus remédios.
- O `InputDock`, com a caixa de pergunta e a navegação.

## Texto em 140% e alto contraste

<Canvas of={Stories.TextoGrande} />

## Regras

- Com a lista cheia, o atalho diz quais remédios estão nela ("Seus remédios: losartana, metformina") e troca "Adicionar" por "Editar".
- A câmera e o microfone só abrem quando a pessoa toca no botão.
```

- [ ] **Passo 8: Erros**

API fora do ar, resposta fora do formato, remédio fora da base, sem conexão e câmera ou microfone negados. Todos com a faixa de emergência na tela e `Alert` com `tom="info"`.

`frontend/packages/ui/src/docs/5-padroes/8-Erros.stories.tsx`:

```tsx
import { ArrowClockwise, Camera } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Alert } from '../../components/Alert';
import { AnswerHeadline } from '../../components/AnswerHeadline';
import { Button } from '../../components/Button';
import { CameraCapture } from '../../components/CameraCapture';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { avisoLegal } from '../../components/DisclaimerFooter/exemplos';
import { EmergencyBar } from '../../components/EmergencyBar';
import { Text } from '../../components/Text';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { simularCamera, simularMicrofone } from '../../test/stubs';

interface TelaDeErroProps {
  erro: 'api-fora-do-ar' | 'fora-do-formato' | 'fora-da-base' | 'sem-conexao' | 'camera-negada' | 'microfone-negado';
  onTentarDeNovo: () => void;
  onDigitar: () => void;
  onAbrirCamera: () => void;
}

/** Os erros da resposta. A faixa de emergência fica na tela em todos. */
function TelaDeErro({ erro, onTentarDeNovo, onDigitar, onAbrirCamera }: TelaDeErroProps) {
  const conteudo = {
    'api-fora-do-ar': (
      <>
        <Alert tom="info" anunciar="polite" nivelTitulo={2} titulo="Não consegui falar com o Bula Clara agora">
          Tente de novo em alguns minutos. Se a dúvida não pode esperar, fale com o farmacêutico.
        </Alert>
        <div>
          <Button variante="secundaria" icone={ArrowClockwise} onPress={onTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      </>
    ),
    'fora-do-formato': (
      <>
        {/* Resposta fora do formato: nenhum aviso de segurança pela metade, só esta mensagem. */}
        <Alert tom="info" anunciar="polite" nivelTitulo={2} titulo="Não consegui montar a resposta com segurança">
          O farmacêutico pode te ajudar.
        </Alert>
        <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
      </>
    ),
    'fora-da-base': (
      <>
        {/* Título e explicação vêm do backend. */}
        <AnswerHeadline pergunta="Posso tomar nimesulida com dipirona?" focarAoMontar>
          Não consegui identificar o remédio.
        </AnswerHeadline>
        <Text>
          Escreva o nome como aparece na caixa, por exemplo &quot;losartana&quot;. Ou fotografe a caixa. Na dúvida, pergunte ao
          farmacêutico.
        </Text>
        <div>
          <Button variante="secundaria" icone={Camera} onPress={onAbrirCamera}>
            Fotografar a caixa
          </Button>
        </div>
        <DisclaimerFooter>{avisoLegal}</DisclaimerFooter>
      </>
    ),
    'sem-conexao': (
      <>
        <Alert tom="info" anunciar="polite" nivelTitulo={2} titulo="Sem conexão: preciso da internet para ler a bula." />
        <div>
          <Button variante="secundaria" icone={ArrowClockwise} onPress={onTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      </>
    ),
    'camera-negada': <CameraCapture onFoto={() => undefined} onFechar={onDigitar} onDigitar={onDigitar} />,
    'microfone-negado': <VoiceRecorder onGravacao={() => undefined} onFechar={onDigitar} onEscrever={onDigitar} />,
  }[erro];
  return (
    <div className="flex flex-col gap-4">
      <EmergencyBar />
      <div className="flex max-w-medida flex-col gap-4 px-4">{conteudo}</div>
    </div>
  );
}

const meta = {
  title: 'Padrões/Erros',
  component: TelaDeErro,
  parameters: { layout: 'fullscreen' },
  args: { erro: 'api-fora-do-ar', onTentarDeNovo: fn(), onDigitar: fn(), onAbrirCamera: fn() },
} satisfies Meta<typeof TelaDeErro>;

export default meta;
type Story = StoryObj<typeof meta>;

const faixaNaTela = async (canvas: { getByRole: (papel: string, opcoes: { name: string }) => HTMLElement }) =>
  expect(canvas.getByRole('link', { name: 'Emergência? Ligue 192' })).toBeInTheDocument();

export const ApiForaDoAr: Story = {
  name: 'API fora do ar',
  play: async ({ canvas, args }) => {
    await faixaNaTela(canvas);
    await expect(canvas.getByRole('status')).toHaveTextContent('Não consegui falar com o Bula Clara agora');
    await userEvent.click(canvas.getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.onTentarDeNovo).toHaveBeenCalledOnce();
  },
};

export const ForaDoFormato: Story = {
  name: 'Resposta fora do formato',
  args: { erro: 'fora-do-formato' },
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(canvas.getByRole('status')).toHaveTextContent('O farmacêutico pode te ajudar.');
  },
};

export const ForaDaBase: Story = {
  name: 'Remédio fora da base',
  args: { erro: 'fora-da-base' },
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(canvas.getByRole('heading', { name: 'Não consegui identificar o remédio.' })).toHaveFocus();
  },
};

export const SemConexao: Story = {
  name: 'Sem conexão',
  args: { erro: 'sem-conexao' },
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(canvas.getByRole('status')).toHaveTextContent('Sem conexão: preciso da internet para ler a bula.');
  },
};

export const CameraNegada: Story = {
  name: 'Câmera negada',
  args: { erro: 'camera-negada' },
  beforeEach: () => simularCamera('negar').desfazer,
  play: async ({ canvas, args }) => {
    await faixaNaTela(canvas);
    await expect(await canvas.findByText('A câmera está bloqueada para o Bula Clara')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Digitar o nome' }));
    await expect(args.onDigitar).toHaveBeenCalledOnce();
  },
};

export const MicrofoneNegado: Story = {
  name: 'Microfone negado',
  args: { erro: 'microfone-negado' },
  beforeEach: () => simularMicrofone('negar').desfazer,
  play: async ({ canvas }) => {
    await faixaNaTela(canvas);
    await expect(await canvas.findByText('O microfone está bloqueado para o Bula Clara')).toBeVisible();
  },
};
```

`frontend/packages/ui/src/docs/5-padroes/8-Erros.mdx`:

```mdx
import { Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './8-Erros.stories';

<Meta of={Stories} />

# Erros

O que a tela mostra quando algo dá errado. Em todos os casos, a faixa de emergência continua na tela, e toda mensagem traz o próximo passo.

## Exemplo

A API não respondeu:

<Canvas of={Stories.ApiForaDoAr} />

## Resposta fora do formato

Se a resposta da API não passa na validação, nenhum aviso de segurança aparece pela metade. A tela mostra só a mensagem e o aviso legal.

<Canvas of={Stories.ForaDoFormato} />

## Remédio fora da base

O título e a explicação vêm do backend. A frase recebe o foco, como uma resposta.

<Canvas of={Stories.ForaDaBase} />

## Sem conexão

<Canvas of={Stories.SemConexao} />

## Câmera ou microfone negados

A explicação e o caminho por digitação aparecem no próprio visor e na própria gravação.

<Canvas of={Stories.CameraNegada} />

<Canvas of={Stories.MicrofoneNegado} />

## Regras

- Os erros usam `Alert` com `tom="info"`: vermelho fica para perigo real.
- Erros que aparecem depois de a página carregar usam `anunciar="polite"`, e o leitor de tela anuncia sem interromper.
- Os textos são os da página Conteúdo e voz/Textos da interface.
```

- [ ] **Passo 9: Rodar**

```bash
pnpm lint && pnpm typecheck
pnpm --filter @bula-clara/ui exec vitest run --project storybook src/docs/5-padroes/ < /dev/null
pnpm --filter @bula-clara/ui test < /dev/null
```

Esperado: lint e tipos sem erro, `Tests  27 passed (27)` nos Padrões (4, 3, 3, 3, 3, 3, 2 e 6, na ordem das páginas) e `Tests  361 passed (361)` no `ui`.

- [ ] **Passo 10: Commit**

```bash
git add frontend/packages/ui/src/docs/5-padroes
git commit -m "docs(ui): páginas de Padrões com composições dos componentes (#25)"
```

---

### Tarefa 4: Integração final

Quem coordena faz esta tarefa, com os quatro grupos e os Padrões juntos.

- [ ] **Passo 1: Instalação limpa**

```bash
cd frontend
rm -rf node_modules packages/*/node_modules packages/tokens/dist
pnpm install --frozen-lockfile < /dev/null
git status --short
```

Esperado: instala sem mudar o `pnpm-lock.yaml` (`git status` sem nada).

- [ ] **Passo 2: Sequência completa**

```bash
pnpm --filter @bula-clara/tokens test && pnpm lint && pnpm typecheck && pnpm --filter @bula-clara/ui test < /dev/null && pnpm build-storybook < /dev/null
pnpm --filter @bula-clara/ui exec vitest run --project unit < /dev/null
```

Esperado: `Tests  77 passed (77)` nos tokens, lint e tipos sem erro, `Tests  361 passed (361)` no `ui` (204 de unidade e 157 stories) e o build do Storybook sem erro.

- [ ] **Passo 3: Conferir as páginas de documentação com o axe**

O addon de Vitest só testa stories. Este script é o do plano 2, com uma mudança: as regras de região repetida do axe (`landmark-unique` e as de `main`, `contentinfo` e `banner` duplicados) ficam desligadas só nas páginas. Uma página de documentação mostra várias stories do mesmo componente, e cada uma repete as regiões dele (a navegação "Principal", a região "Foto da caixa", o `main` da primeira visita). Cada story, sozinha, passa por essas regras no teste de story.

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
    // Uma página de documentação mostra várias stories do mesmo componente, e cada uma repete as
    // regiões dele (a navegação "Principal", a região "Foto da caixa", o <main> da primeira visita).
    // As regras de região repetida ficam de fora só aqui: cada story, sozinha, passa por elas no
    // teste de story.
    const r = await window.axe.run('.sbdocs-content', {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      rules: {
        'landmark-unique': { enabled: false },
        'landmark-no-duplicate-main': { enabled: false },
        'landmark-no-duplicate-contentinfo': { enabled: false },
        'landmark-no-duplicate-banner': { enabled: false },
      },
    });
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

Esperado: `ok` em cada página e `53 páginas, 0 com problema` (mais as do plano 4, se ele já estiver junto). Sem as regras desligadas, 7 páginas reprovam, todas só por região repetida (`landmark-unique` e, na primeira visita, `landmark-no-duplicate-main`).

- [ ] **Passo 4: Changesets**

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

- [ ] **Passo 5 (opcional, recomendado): Quebrar cada garantia de propósito**

Este script quebra cada garantia de segurança, privacidade e acessibilidade, uma de cada vez, roda a checagem que deveria pegar e desfaz. Ele já rodou na preparação deste plano, com 25 de 25 reprovando como deviam. Rode de novo se algum componente mudou na execução.

Crie `/tmp/bula-clara-provas-3.py`:

```python
# Para cada garantia: quebra o código, roda a checagem, confere que ela falha pelo motivo certo e desfaz.
import subprocess, sys
UI = sys.argv[1]
C = 'src/components/'
TC = 'pnpm typecheck'
def t(pasta): return f'pnpm vitest run --project unit {C}{pasta}/'
def s(pasta): return f'pnpm vitest run --project storybook {C}{pasta}/'
provas = [
 ('EmergencyCard mantém a ordem dos contatos', C+'EmergencyCard/EmergencyCard.tsx',
  '{contatos.map((contato, posicao) =>', '{[...contatos].sort((a, b) => a.numero.localeCompare(b.numero)).map((contato, posicao) =>',
  t('EmergencyCard'), 'mantém a ordem recebida'),
 ('EmergencyCard não complementa o texto', C+'EmergencyCard/EmergencyCard.tsx',
  '<p className="text-corpo">{mensagem}</p>', '<p className="text-corpo">{mensagem} Mantenha a calma.</p>',
  t('EmergencyCard'), 'só tem o texto que veio por props'),
 ('EmergencyCard: só um por tela', C+'EmergencyCard/EmergencyCard.tsx',
  'length > 1) {', 'length > 2) {', t('EmergencyCard'), 'dois cartões'),
 ('InteractionCallout: "não fala" não aceita verde', C+'InteractionCallout/InteractionCallout.tsx',
  "  'nao-fala': 'info',", "  'nao-fala': 'sucesso',", TC, 'TS2322'),
 ('InteractionCallout: "não fala" sempre diz que não garante', C+'InteractionCallout/InteractionCallout.tsx',
  "    acao: 'Isso não garante que seja seguro. Na dúvida, pergunte ao farmacêutico.',",
  "    acao: 'Na dúvida, pergunte ao farmacêutico.',", t('InteractionCallout'), 'nunca verde'),
 ('InteractionCallout: evidência obrigatória com seção', C+'InteractionCallout/InteractionCallout.tsx',
  '        evidencia: EvidenciaDaBula;', '        evidencia?: EvidenciaDaBula;', TC, 'TS2578'),
 ('ListenButton: só voz do aparelho', C+'ListenButton/ListenButton.tsx',
  'return voz.localService && /^pt', 'return /^pt', t('ListenButton'), 'ignora vozes remotas'),
 ('ListenButton: redesenhar não para o áudio', C+'ListenButton/ListenButton.tsx',
  '    [],\n  );', '    [obterAudio],\n  );', t('ListenButton'), 'continua tocando quando a tela redesenha'),
 ('ProvenanceSeal nunca inventa data', C+'ProvenanceSeal/ProvenanceSeal.tsx',
  ": `${remedio} · data da versão não informada`;",
  ": `${remedio}, versão de ${new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`;",
  t('ProvenanceSeal'), 'não inventa nenhuma'),
 ('ProvenanceSeal: data ISO sem fuso', C+'ProvenanceSeal/ProvenanceSeal.tsx',
  '  return iso ? `${iso[2]}/${iso[1]}` : versao.trim();',
  "  return iso ? new Date(versao).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : versao.trim();",
  t('ProvenanceSeal'), 'sem mudar o mês'),
 ('AnswerHeadline recebe o foco', C+'AnswerHeadline/AnswerHeadline.tsx',
  '    if (focarAoMontar) refDoTitulo.current?.focus();', '', t('AnswerHeadline'), 'recebe o foco'),
 ('LoadingStatus é a região aria-live', C+'LoadingStatus/LoadingStatus.tsx',
  '<div aria-live="polite">', '<div>', t('LoadingStatus'), 'a região aria-live existe'),
 ('SafetyNotice não é vermelho', C+'SafetyNotice/SafetyNotice.tsx',
  "'bg-surface-info p-4 text-text-default'", "'bg-danger-bg p-4 text-text-default'", t('SafetyNotice'), 'não é vermelho'),
 ('VoiceRecorder nunca usa SpeechRecognition', C+'VoiceRecorder/VoiceRecorder.tsx',
  '  function parar() {\n', "  function parar() {\n    void (window as unknown as Record<string, unknown>).webkitSpeechRecognition;\n",
  t('VoiceRecorder'), 'nunca toca na SpeechRecognition'),
 ('VoiceRecorder desliga o microfone', C+'VoiceRecorder/VoiceRecorder.tsx',
  '          clearTimeout(limite);\n          desligar();\n', '          clearTimeout(limite);\n',
  t('VoiceRecorder'), 'desliga o microfone'),
 ('VoiceRecorder: formato do iPhone', C+'VoiceRecorder/VoiceRecorder.tsx',
  "'audio/webm', 'audio/mp4',", "'audio/webm',", t('VoiceRecorder'), 'audio/mp4'),
 ('CameraCapture desliga a câmera', C+'CameraCapture/CameraCapture.tsx',
  '      ativo = false;\n      for (const trilha of fluxo?.getTracks() ?? []) trilha.stop();\n', '      ativo = false;\n',
  t('CameraCapture'), 'desliga a câmera'),
 ('CameraCapture: negada oferece digitação', C+'CameraCapture/CameraCapture.tsx',
  "erro.name === 'NotAllowedError' ||", "erro.name === 'NaoExiste' ||", t('CameraCapture'), 'câmera negada'),
 ('CaptureConfirm: nada sai antes do "sim"', C+'CaptureConfirm/CaptureConfirm.tsx',
  '}: CaptureConfirmProps) {\n', '}: CaptureConfirmProps) {\n  if (isOpen) onConfirmar();\n',
  t('CaptureConfirm'), 'nada acontece antes'),
 ('MedicationList não grava no navegador', C+'MedicationList/MedicationList.tsx',
  '    if (remedio) onRemover(remedio.id);', "    if (remedio) onRemover(remedio.id);\n    localStorage.setItem('meus-remedios', JSON.stringify(remedios));",
  t('MedicationList'), 'não grava nada'),
 ('MedicationList: foco depois de remover', C+'MedicationList/MedicationList.tsx',
  '    elemento?.focus();', '', t('MedicationList'), 'leva o foco para o próximo'),
 ('MedicationList: "Apagar tudo" confirma', C+'MedicationList/MedicationList.tsx',
  '    confirmarAcao(TEXTOS_DO_CONSENTIMENTO.apagada);', '', t('MedicationList'), 'confirma com o Toast'),
 ('InputDock: campo com nome', C+'InputDock/InputDock.tsx',
  '            <Label className="sr-only">{rotuloCampo}</Label>\n', '', t('InputDock'), 'nome acessível'),
 ('SourceChip: sugestões sem dose', C+'SourceChip/perguntarMais.ts',
  '  return sugestoes;', '  sugestoes.push(`Posso dobrar a dose ${comArtigo}?`);\n  return sugestoes;', t('SourceChip'), 'nenhuma sugestão fala de dose'),
 ('EmergencyBar: sempre 192', C+'EmergencyBar/EmergencyBar.tsx',
  "href = 'tel:192'", "href = 'tel:190'", t('EmergencyBar'), 'liga para o 192'),
]
so = sys.argv[2:]
for nome, arq, velho, novo, cmd, esperado in provas:
    if so and not any(x in nome for x in so): continue
    caminho = f'{UI}/{arq}'
    original = open(caminho).read()
    if original.count(velho) != 1:
        print(f'NÃO APLICA ({original.count(velho)}x): {nome}', flush=True); continue
    open(caminho, 'w').write(original.replace(velho, novo))
    try:
        r = subprocess.run(cmd, shell=True, cwd=UI, capture_output=True, text=True, stdin=subprocess.DEVNULL)
        saida = r.stdout + r.stderr
        ok = r.returncode != 0 and esperado in saida
        print(('falhou como devia  ' if ok else 'PROBLEMA           ') + nome, flush=True)
    finally:
        open(caminho, 'w').write(original)
```

```bash
python3 /tmp/bula-clara-provas-3.py packages/ui
git status --short
```

Esperado: 25 linhas `falhou como devia` e nenhuma `PROBLEMA` ou `NÃO APLICA`, e o `git status` sem nada (o script desfaz cada quebra).

- [ ] **Passo 6: Limpar**

```bash
rm -rf packages/ui/storybook-static
rm /tmp/bula-clara-conferir-paginas.mjs /tmp/bula-clara-provas-3.py
git status --short
```

Esperado: saída vazia.

- [ ] **Passo 7: PR (não faça nesta execução)**

Quem coordena abre um PR só, depois que os quatro planos estiverem juntos na `feat/design-system-base`, e só com o OK do Matheus. O PR fecha a #25.

---

## Para o coordenador

- **Texto da ação do primeiro nível no plano 4.** A tabela "Textos do InteractionCallout" da página Conteúdo e voz/Textos da interface dá "Converse com o farmacêutico antes de tomar os dois juntos." como ação dos dois primeiros níveis. O preview aprovado e este plano usam, no primeiro nível, "Fale com o médico antes. Não pare nenhum remédio por conta própria.". Vale acertar a linha do plano 4 para "Ação abaixo do nível de não usar junto" com esse texto, e deixar o "Converse com o farmacêutico" só para o nível de cuidado.
- **Textos novos para a página Textos da interface** (plano 4): os listados em "Diferenças em relação à spec e ao visual aprovado", todos já com Flesch de 50 ou mais. Também "Tirar outra foto" e a divisão da mensagem de foto sem leitura em título e explicação.
- **Título do aviso de interação no plano 4.** A página de textos do plano 4 mostra o par só no nível "não fala" ("Ibuprofeno e metformina: a bula não fala dessa combinação"). Aqui os três níveis levam o par. Os exemplos do plano 4 podem ganhar o par nos outros dois.
- **Ordem da barra lateral.** A Tarefa 1 deste plano põe o `storySort` que o plano 4 sugeria. Se o plano 4 renomear alguma seção do topo, a lista do `preview.tsx` muda junto.
- **Axe nas páginas MDX no CI.** Como nos planos 2 e 4, o script roda só na mão.
- **O `TZ` no teste do selo.** O teste do `ProvenanceSeal` troca `process.env.TZ` e devolve no fim. O Node aplica a troca na hora; se algum dia os testes de unidade rodarem em paralelo dentro do mesmo processo, essa troca pode vazar para outro teste. Hoje cada arquivo roda no seu worker.

## O que não foi verificado

- Nada rodou num celular de verdade. A câmera, o microfone, a vibração, o bipe e as vozes do aparelho só foram exercitados com as simulações da Tarefa 1. Em especial: a gravação em `audio/mp4` no Safari do iPhone, a lista de vozes com `localService` no Android e no iOS, e se o bipe toca antes de o navegador liberar o áudio (alguns só liberam depois de um toque, que aqui existe).
- O VoiceOver e o TalkBack não foram usados. O anúncio do `LoadingStatus`, do `role="alert"` do cartão e da mudança de nome do `ListenButton` foi conferido só pela marcação. O checklist manual do plano 4 cobre isso.
- Os links da barra de navegação não foram testados com o `RouterProvider` de um app de verdade (o app é a frente 2).
- O Storybook foi conferido só no Chromium.
- As páginas deste plano não foram vistas junto com as do plano 4, que ainda não estava aplicado na cópia de teste. A ordem da barra lateral foi conferida só com as seções que existiam.
- O movimento reduzido não foi emulado no navegador. Ele vem das durações de 0ms nos tokens e do `motion-reduce:` nas animações (o teste do `LoadingStatus` confere a classe).

## Autorrevisão

**Cobertura da spec e do pedido:**
- Os 15 componentes do domínio da spec, mais `LoadingStatus` e `CaptureConfirm` do artifact, com `OcrConfirm` e `TranscriptConfirm` sobre o `CaptureConfirm`: Tarefas A1 a A8, B1 a B4, C1 a C6 e D1.
- Níveis de interação derivados só da seção, "não fala" nunca verde e sempre com o aviso, frase da bula como evidência e título do primeiro nível num lugar só: B1.
- Emergência com o texto e os contatos recebidos, na ordem, `role="alert"`, um por tela e botões `tel:` de 56px: B2 e Padrões/Emergência. Autolesão com CVV 188 primeiro e sem "enquanto espera": `EmergencyCard/exemplos.ts`.
- Voz: `ListenButton` só com voz do aparelho ou do `/falar`, e some sem nenhum dos dois (A2); `VoiceRecorder` só grava, nunca `SpeechRecognition` (C6).
- Foco na frase-resposta e `aria-live` só no `LoadingStatus`: A1, A8 e Padrões/Bloco de resposta.
- `ProvenanceSeal` sem data inventada: A4.
- Consentimento começa desligado, com os textos do protótipo, "Apagar tudo" em perigo e confirmação por `confirmarAcao`, sem storage no componente: D1 e Padrões/Consentimento.
- `InputDock` com câmera, campo com rótulo acessível, microfone e navegação de três destinos com `aria-current` e 48px ou mais: C1.
- Permissão negada com explicação e digitação: C5, C6 e Padrões/Erros.
- `DemoTrace` só com dados: A6.
- Páginas de Padrões (bloco de resposta com as 10 camadas e "Perguntar mais" por modelos fixos, ficha com as 9 seções, emergência, consentimento, foto, voz, primeira visita e erros): Tarefa 3.
- Uma página MDX por componente, no modelo do plano 4: Passo 6 de cada tarefa de componente.
- Preparação com tudo o que é compartilhado, grupos independentes, contagens por grupo e no total, integração final e um changeset por grupo: Tarefas 1, A9, B5, C7, D2 e 4.

**Ética (`docs/etica.md`):** nenhum envio para terceiros (voz só do aparelho ou do nosso servidor, fala para texto só no servidor, nenhuma chamada de rede nas stories), lista no navegador só com consentimento e apagável, texto de segurança só do backend, aviso legal em toda resposta e nas bloqueadas, nenhum nome de remédio na URL e nenhuma sugestão que leve a bloqueio.
