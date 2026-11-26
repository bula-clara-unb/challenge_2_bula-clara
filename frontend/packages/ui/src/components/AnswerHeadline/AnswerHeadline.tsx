import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { Heading } from '../Heading';
import { Text } from '../Text';

export interface AnswerHeadlineProps {
  /** A pergunta como a pessoa fez (ou como confirmou depois da foto ou da voz). Sai entre aspas. */
  pergunta: string;
  /** Remédios da lista que entraram na checagem, além dos que estão na pergunta. */
  consideradosTambem?: readonly string[];
  /** A frase-resposta: uma frase só, em voz ativa. Nunca afirme segurança. */
  children: string;
  /** 1 quando a resposta é a página; 2 quando está no histórico, abaixo de outras. */
  nivel?: 1 | 2;
  /** Leva o foco à frase-resposta quando ela aparece. O leitor de tela começa a ler dali. */
  focarAoMontar?: boolean;
  /** A frase-resposta, para o app levar o foco na hora certa. */
  ref?: Ref<HTMLHeadingElement>;
}

const lista = new Intl.ListFormat('pt-BR', { type: 'conjunction' });

/**
 * A pergunta feita, os remédios considerados e a frase-resposta em Literata. Quando a resposta
 * chega, o foco vem para cá. A região aria-live fica só no LoadingStatus, para nada ser lido duas vezes.
 */
export function AnswerHeadline({
  pergunta,
  consideradosTambem = [],
  children,
  nivel = 2,
  focarAoMontar = false,
  ref,
}: AnswerHeadlineProps) {
  const refDoTitulo = useRef<HTMLHeadingElement>(null);
  useImperativeHandle(ref, () => refDoTitulo.current as HTMLHeadingElement, []);

  useEffect(() => {
    if (focarAoMontar) refDoTitulo.current?.focus();
  }, [focarAoMontar]);

  return (
    <div className="flex max-w-medida flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Text variante="rotulo">Sua pergunta</Text>
        <Text>“{pergunta}”</Text>
        {consideradosTambem.length > 0 ? (
          <Text variante="apoio">
            Considerando também: {lista.format(consideradosTambem.map((nome) => nome.toLocaleLowerCase('pt-BR')))}
          </Text>
        ) : null}
      </div>
      <Heading nivel={nivel} estilo="resposta" tabIndex={-1} ref={refDoTitulo}>
        {children}
      </Heading>
    </div>
  );
}
