// Leitura dos tokens para as páginas de documentação. Nenhum valor é digitado aqui:
// tudo vem do build do @bula-clara/tokens, e o contraste usa a mesma fórmula do teste.
import altoContraste from '@bula-clara/tokens/alto-contraste.json';
import padrao from '@bula-clara/tokens/padrao.json';
import { contraste } from '../../../../tokens/src/contraste';
import paresJson from '../../../../tokens/src/pares-contraste.json';

export type Tokens = Record<string, string | number>;

export interface Tema {
  id: 'padrao' | 'alto-contraste';
  nome: string;
  tokens: Tokens;
}

export interface Par {
  texto: string;
  fundo: string;
  minimo: number;
  uso: string;
}

export const temaPadrao: Tema = { id: 'padrao', nome: 'Padrão', tokens: padrao };
export const temaAlto: Tema = { id: 'alto-contraste', nome: 'Alto contraste', tokens: altoContraste };
export const temas: Tema[] = [temaPadrao, temaAlto];

export const pares: Par[] = paresJson;

export { contraste };

/** Tokens cujo nome começa com o prefixo, na ordem em que saem do build. */
export function doGrupo(tokens: Tokens, prefixo: string): [string, string][] {
  return Object.entries(tokens)
    .filter(([nome]) => nome.startsWith(`${prefixo}.`))
    .map(([nome, valor]) => [nome, String(valor)]);
}

export function valor(tokens: Tokens, nome: string): string {
  const v = tokens[nome];
  if (v === undefined) throw new Error(`token ${nome} não existe`);
  return String(v);
}

/** Nome da variável CSS que o build gera para um token (color.text.default → --bc-color-text-default). */
export function variavelCss(nome: string): string {
  return `--bc-${nome.replaceAll('.', '-')}`;
}

/**
 * Tamanho em px de um valor de fonte quando a raiz está em `escala` (1, 1.2 ou 1.4).
 * Aceita os formatos que os tokens usam: `1.125rem`, `16px` e `calc(19px + 0.9375rem)`.
 */
export function pxNaEscala(valorCss: string, escala: number): number {
  const raiz = 16 * escala;
  const partes = valorCss.replace(/^calc\((.*)\)$/, '$1').split('+');
  return partes.reduce((total, parte) => {
    const texto = parte.trim();
    const numero = parseFloat(texto);
    if (texto.endsWith('rem')) return total + numero * raiz;
    if (texto.endsWith('px')) return total + numero;
    throw new Error(`valor de fonte inesperado: ${valorCss}`);
  }, 0);
}

/** 7.3312 → "7,33:1" */
export function razao(n: number): string {
  return `${n.toFixed(2).replace('.', ',')}:1`;
}

/** 25.2 → "25,2 px" */
export function px(n: number): string {
  return `${String(Math.round(n * 10) / 10).replace('.', ',')} px`;
}
