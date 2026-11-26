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
