import { Camera, ChatCircleText, Info, Microphone, PaperPlaneRight, Pill, type Icon } from '@phosphor-icons/react';
import { useState, type FormEvent } from 'react';
import { Link as AriaLink, Input, Label, TextField as AriaTextField } from 'react-aria-components';
import { classesDaEntrada } from '../Campo/partes';
import { IconButton } from '../IconButton';

export type DestinoPrincipal = 'perguntar' | 'remedios' | 'sobre';

export interface InputDockProps {
  /** Recebe a pergunta digitada, já sem espaços nas pontas. Nunca recebe texto vazio. */
  onPerguntar: (pergunta: string) => void;
  /** Abre a câmera (CameraCapture). */
  onAbrirCamera: () => void;
  /** Abre a gravação (VoiceRecorder). */
  onGravar: () => void;
  /** A tela atual, marcada com aria-current="page" na barra de navegação. */
  destinoAtual: DestinoPrincipal;
  /** Endereços dos três destinos. O app usa o RouterProvider do React Aria para navegar sem recarregar. */
  enderecos?: Record<DestinoPrincipal, string>;
  /** Nome do campo, para o leitor de tela. Depois da primeira resposta: "Outra pergunta". */
  rotuloCampo?: string;
  /** Exemplo dentro do campo vazio. Nunca faz o papel do rótulo. */
  exemplo?: string;
  /** Sem a caixa de pergunta, só a barra de navegação (Meus remédios e Sobre). */
  mostrarCaixa?: boolean;
}

const destinos: { id: DestinoPrincipal; texto: string; icone: Icon }[] = [
  { id: 'perguntar', texto: 'Perguntar', icone: ChatCircleText },
  { id: 'remedios', texto: 'Meus remédios', icone: Pill },
  { id: 'sobre', texto: 'Sobre', icone: Info },
];

const enderecosPadrao: Record<DestinoPrincipal, string> = {
  perguntar: '/',
  remedios: '/meus-remedios',
  sobre: '/sobre',
};

/**
 * A caixa de pergunta fixa no rodapé (câmera, texto e microfone) e a barra de navegação com três
 * destinos. A posição fixa é do layout do app.
 */
export function InputDock({
  onPerguntar,
  onAbrirCamera,
  onGravar,
  destinoAtual,
  enderecos = enderecosPadrao,
  rotuloCampo = 'Sua pergunta',
  exemplo = 'Escreva sua pergunta…',
  mostrarCaixa = true,
}: InputDockProps) {
  const [pergunta, setPergunta] = useState('');
  const temTexto = pergunta.trim() !== '';

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!temTexto) return;
    onPerguntar(pergunta.trim());
    setPergunta('');
  }

  return (
    <div className="border-t border-border-subtle bg-surface-default">
      {mostrarCaixa ? (
        <form onSubmit={enviar} className="flex items-center gap-2 px-3 py-2">
          <IconButton variante="primaria" icone={Camera} aria-label="Fotografar a caixa" onPress={onAbrirCamera} />
          <AriaTextField value={pergunta} onChange={setPergunta} className="min-w-0 flex-1">
            <Label className="sr-only">{rotuloCampo}</Label>
            <Input placeholder={exemplo} enterKeyHint="send" className={classesDaEntrada} />
          </AriaTextField>
          {temTexto ? (
            <IconButton variante="primaria" icone={PaperPlaneRight} aria-label="Perguntar" type="submit" />
          ) : (
            <IconButton variante="primaria" icone={Microphone} aria-label="Perguntar falando" onPress={onGravar} />
          )}
        </form>
      ) : null}
      <nav aria-label="Principal" className="border-t border-border-subtle">
        <ul className="flex">
          {destinos.map(({ id, texto, icone: Icone }) => {
            const atual = id === destinoAtual;
            return (
              <li key={id} className="flex flex-1">
                <AriaLink
                  href={enderecos[id]}
                  aria-current={atual ? 'page' : undefined}
                  className={
                    'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 border-t-3 px-1 py-1 text-center ' +
                    'text-apoio no-underline outline-none data-focus-visible:foco-visivel ' +
                    (atual
                      ? 'border-action-primary font-bold text-action-primary'
                      : 'border-transparent text-text-muted data-hovered:text-action-primary')
                  }
                >
                  <Icone size="1.5rem" weight="bold" aria-hidden="true" focusable="false" />
                  {texto}
                </AriaLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
