export interface DisclaimerFooterProps {
  /** O `aviso_legal` que veio do backend, exatamente como veio. */
  children: string;
}

/** Aviso legal no fim de toda resposta, inclusive das bloqueadas. Discreto, mas legível (16px, 8:1). */
export function DisclaimerFooter({ children }: DisclaimerFooterProps) {
  // Parágrafo, e não <footer>: fora de um <main> ou <section>, um <footer> vira o rodapé da página
  // (contentinfo), e cada resposta tem o seu aviso.
  return <p className="max-w-medida text-apoio text-text-muted">{children}</p>;
}
