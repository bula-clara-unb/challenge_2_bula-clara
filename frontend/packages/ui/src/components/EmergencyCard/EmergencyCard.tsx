import { Phone } from '@phosphor-icons/react';
import { useEffect, useId } from 'react';
import { Alert } from '../Alert';

/** Um telefone do cartão, montado pelo app a partir de `contatos` do backend. */
export interface ContatoDeEmergencia {
  /** O número como o backend manda ("188", "08007226001"). Vira o link tel:. */
  numero: string;
  /** Quem atende ("CVV", "SAMU", "Disque-Intoxicação"). */
  nome: string;
  /** Complemento que veio com o contato ("grátis, 24h"). */
  detalhe?: string;
}

export interface EmergencyCardProps {
  /** Título que veio do backend ("Isso pode ser uma emergência", "Ligue agora para o CVV"). */
  titulo: string;
  /** Mensagem que veio do backend, exatamente como veio. */
  mensagem: string;
  /** Telefones na ordem de prioridade do backend. O primeiro ganha o botão cheio. Nunca reordene. */
  contatos: readonly ContatoDeEmergencia[];
  /**
   * Orientação de espera que veio do backend, com o título e o texto. Só a intoxicação tem.
   * O título também vem de fora: a interface não escreve nenhum texto nesta tela além do "Ligar".
   */
  enquantoEspera?: { titulo: string; texto: string };
  /** Na tela de emergência, o cartão é o título da página (h1). Dentro do histórico, h2. */
  nivelTitulo?: 1 | 2;
}

/** "08007226001" vira "0800 722 6001". Números curtos (188, 192) ficam como estão. */
export function formatarTelefone(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  const gratuito = /^(0800)(\d{3})(\d{4})$/.exec(digitos);
  return gratuito ? `${gratuito[1]} ${gratuito[2]} ${gratuito[3]}` : digitos;
}

const SELETOR = '[data-cartao-emergencia]';

/**
 * Cartão de emergência no estilo do NHS. Substitui a resposta inteira e mostra só o que o backend
 * mandou: título, mensagem e telefones, na ordem recebida. A interface não escreve texto de segurança.
 */
export function EmergencyCard({ titulo, mensagem, contatos, enquantoEspera, nivelTitulo = 2 }: EmergencyCardProps) {
  const idTitulo = useId();
  const Titulo = `h${nivelTitulo}` as const;

  useEffect(() => {
    if (document.querySelectorAll(SELETOR).length > 1) {
      console.error('EmergencyCard: há mais de um cartão de emergência na tela. Mostre só um, no topo.');
    }
  }, []);

  return (
    <div className="flex max-w-medida flex-col gap-4">
      <section
        role="alert"
        aria-labelledby={idTitulo}
        data-cartao-emergencia=""
        className={
          'flex flex-col gap-3 rounded-controle bg-emergencia-fundo p-4 text-emergencia-texto ' +
          'alto-contraste:border-3 alto-contraste:border-text-default'
        }
      >
        <Titulo id={idTitulo} className="font-voz text-resposta font-semibold hyphens-auto wrap-anywhere">
          {titulo}
        </Titulo>
        <p className="text-corpo">{mensagem}</p>
        <ul className="flex flex-col gap-3">
          {contatos.map((contato, posicao) => (
            <li key={`${contato.numero}-${posicao}`}>
              <a
                href={`tel:${contato.numero.replace(/\D/g, '')}`}
                className={
                  'flex min-h-14 items-center justify-center gap-3 rounded-controle px-4 py-2 no-underline ' +
                  'outline-none focus-visible:foco-visivel ' +
                  (posicao === 0
                    ? 'bg-emergencia-botao-fundo text-emergencia-botao-texto'
                    : 'border-(length:--bc-borda-controle) border-emergencia-texto text-emergencia-texto')
                }
              >
                <Phone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" className="shrink-0" />
                <span className="flex flex-col">
                  <span className="text-titulo-3 font-bold">Ligar {contato.nome}</span>{' '}
                  <span className="text-apoio">
                    {formatarTelefone(contato.numero)}
                    {contato.detalhe ? ` · ${contato.detalhe}` : ''}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      {enquantoEspera ? (
        <Alert tom="info" titulo={enquantoEspera.titulo} nivelTitulo={nivelTitulo === 1 ? 2 : 3}>
          {enquantoEspera.texto}
        </Alert>
      ) : null}
    </div>
  );
}
