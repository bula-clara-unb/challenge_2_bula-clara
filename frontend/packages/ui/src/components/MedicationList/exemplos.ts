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
