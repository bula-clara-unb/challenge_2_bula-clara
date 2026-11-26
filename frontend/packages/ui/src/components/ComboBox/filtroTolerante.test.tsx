import { describe, expect, it } from 'vitest';
import { filtroTolerante, normalizar } from './filtroTolerante';

describe('filtroTolerante', () => {
  it('ignora acento e maiúscula', () => {
    expect(normalizar('Dipirona Sódica')).toBe('dipirona sodica');
    expect(filtroTolerante('Dipirona Sódica', 'SODICA')).toBe(true);
  });

  it('acha pelo começo e pelo meio do nome', () => {
    expect(filtroTolerante('Losartana', 'losar')).toBe(true);
    expect(filtroTolerante('Varfarina', 'ar')).toBe(true);
  });

  it('aceita um erro a cada 4 letras', () => {
    expect(filtroTolerante('Losartana', 'lozartana')).toBe(true);
    expect(filtroTolerante('Losartana', 'lozar')).toBe(true);
    expect(filtroTolerante('Metformina', 'metfromina')).toBe(true);
  });

  it('não inventa parecido em busca curta ou muito diferente', () => {
    expect(filtroTolerante('Losartana', 'lz')).toBe(false);
    expect(filtroTolerante('Losartana', 'xyz')).toBe(false);
    expect(filtroTolerante('Omeprazol', 'losartana')).toBe(false);
  });
});
