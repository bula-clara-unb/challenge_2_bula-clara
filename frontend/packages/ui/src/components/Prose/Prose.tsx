import type { ReactNode } from 'react';

export interface ProseProps {
  /** HTML simples: parágrafos, listas, links e ênfase. */
  children: ReactNode;
}

/**
 * Texto corrido: no máximo 65 caracteres por linha e ritmo vertical entre os blocos.
 * Estiliza os elementos de dentro (p, listas, links, ênfase), para receber HTML simples.
 */
const classes = [
  'max-w-medida text-corpo text-text-default',
  '[&>*+*]:mt-3 [&>:is(h2,h3)]:mt-6',
  '[&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:ps-6 [&_li+li]:mt-2',
  '[&_strong]:font-bold',
  '[&_a]:text-action-primary [&_a]:underline [&_a]:underline-offset-4',
  '[&_a:hover]:text-action-primary-strong [&_a:focus-visible]:foco-visivel',
].join(' ');

export function Prose({ children }: ProseProps) {
  return <div className={classes}>{children}</div>;
}
