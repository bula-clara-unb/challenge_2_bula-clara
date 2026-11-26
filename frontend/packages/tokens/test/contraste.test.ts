import { describe, expect, it } from 'vitest';
import { contraste } from '../src/contraste';
import pares from '../src/pares-contraste.json';
import padrao from '../dist/padrao.json';
import altoContraste from '../dist/alto-contraste.json';

describe('contraste()', () => {
  it('dá 21:1 entre preto e branco', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('dá 1:1 para a mesma cor', () => {
    expect(contraste('#1351B4', '#1351B4')).toBeCloseTo(1, 5);
  });

  it('bate com o valor da spec para o azul de ação', () => {
    expect(contraste('#1351B4', '#FFFFFF')).toBeCloseTo(7.33, 2);
  });

  it('recusa cor fora do formato #RRGGBB', () => {
    expect(() => contraste('azul', '#FFFFFF')).toThrow('cor inválida');
  });
});

const temas: Record<string, Record<string, string | number>> = {
  padrao,
  'alto-contraste': altoContraste,
};

describe.each(Object.entries(temas))('tema %s', (_nome, tokens) => {
  it.each(pares)('$uso: $texto sobre $fundo atinge $minimo:1', ({ texto, fundo, minimo }) => {
    const corTexto = tokens[texto];
    const corFundo = tokens[fundo];
    expect(corTexto, `token ${texto} não existe`).toBeTypeOf('string');
    expect(corFundo, `token ${fundo} não existe`).toBeTypeOf('string');
    expect(contraste(String(corTexto), String(corFundo))).toBeGreaterThanOrEqual(minimo);
  });
});

describe('tema alto-contraste', () => {
  it('usa texto preto puro (21:1)', () => {
    expect(contraste(String(altoContraste['color.text.default']), '#FFFFFF')).toBeCloseTo(21, 2);
  });
});
