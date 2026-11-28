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
