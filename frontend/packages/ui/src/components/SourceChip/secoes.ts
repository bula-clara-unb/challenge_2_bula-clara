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
