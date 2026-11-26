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
