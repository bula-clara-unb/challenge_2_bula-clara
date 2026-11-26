import { Spinner } from '../Spinner';

export interface LoadingStatusProps {
  /**
   * A etapa atual ("Lendo a bula da losartana…"). Vazio quando não há nada carregando. Monte o
   * componente uma vez e só troque o texto: região aria-live que já nasce com texto nem sempre é lida.
   */
  children?: string;
}

/**
 * Status de espera da resposta, que pode passar de 10 segundos. É a única região aria-live da
 * resposta: quando ela chega, o foco vai para a frase-resposta e nada é lido duas vezes.
 */
export function LoadingStatus({ children = '' }: LoadingStatusProps) {
  return <div aria-live="polite">{children ? <Spinner rotulo={children} /> : null}</div>;
}
