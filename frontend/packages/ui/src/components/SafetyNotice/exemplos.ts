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
