import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import padrao from '../dist/padrao.json';
import altoContraste from '../dist/alto-contraste.json';

const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../dist/tailwind.css', import.meta.url), 'utf8');
const linhasDeComponente = css.split('\n').filter((linha) => linha.includes('--bc-componente-'));
const nomesDeComponente = Object.keys(padrao).filter((caminho) => caminho.startsWith('componente.'));

describe('tokens de componente', () => {
  it('existem', () => {
    expect(nomesDeComponente.length).toBeGreaterThan(0);
  });

  it('saem no CSS como referência a um semântico, nunca como cor fixa', () => {
    for (const linha of linhasDeComponente) {
      expect(linha).toMatch(/: var\(--bc-color-[a-z-]+\);$/);
    }
  });

  it('aparecem uma vez só, no :root (o tema troca o semântico, não eles)', () => {
    expect(linhasDeComponente).toHaveLength(nomesDeComponente.length);
  });

  it('seguem o tema de alto contraste', () => {
    expect(padrao['componente.campo.borda']).toBe('#6B7A90');
    expect(altoContraste['componente.campo.borda']).toBe('#000000');
  });

  it('viram cores do Tailwind', () => {
    expect(tailwind).toContain('--color-campo-borda: var(--bc-componente-campo-borda);');
  });
});

describe('fundo de sobreposição', () => {
  it('é semitransparente e mais escuro no alto contraste', () => {
    expect(padrao['color.overlay']).toMatch(/^#[0-9A-F]{8}$/);
    expect(altoContraste['color.overlay']).toBe('#000000D9');
  });
});
