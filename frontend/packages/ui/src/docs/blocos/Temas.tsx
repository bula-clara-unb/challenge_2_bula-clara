import { Tabela } from './Tabela';
import { temaAlto as alto, temaPadrao as padrao, variavelCss } from './tokens';

/** Os tokens que o alto contraste troca. Todo o resto é igual nos dois temas. */
export function DiferencasEntreTemas() {
  const diferentes = Object.entries(padrao.tokens).filter(([nome, v]) => alto.tokens[nome] !== v);
  return (
    <Tabela
      titulo="O que muda no tema de alto contraste"
      colunas={['Token', 'Variável CSS', padrao.nome, alto.nome]}
      linhas={diferentes.map(([nome, v]) => [
        <code key="n">{nome}</code>,
        <code key="v">{variavelCss(nome)}</code>,
        <code key="p">{String(v)}</code>,
        <code key="a">{String(alto.tokens[nome])}</code>,
      ])}
    />
  );
}
