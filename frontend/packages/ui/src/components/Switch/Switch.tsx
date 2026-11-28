import { useId, useState } from 'react';
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components';

export interface SwitchProps extends Omit<AriaSwitchProps, 'className' | 'style' | 'children' | 'render'> {
  /** O que o interruptor liga ("Lembrar neste aparelho"). É o rótulo. */
  children: string;
  /**
   * Explica o que acontece. Pode mudar com o estado, como no consentimento:
   * `(ligado) => ligado ? 'Ligado: …' : 'Desligado: …'`. Fica ligada ao interruptor por aria-describedby.
   */
  descricao?: string | ((ligado: boolean) => string);
}

/** Interruptor em cartão, como no consentimento de "Meus remédios". */
export function Switch({ children, descricao, isSelected, defaultSelected = false, onChange, ...props }: SwitchProps) {
  const [interno, setInterno] = useState(defaultSelected);
  const ligado = isSelected ?? interno;
  const idDescricao = useId();
  const texto = typeof descricao === 'function' ? descricao(ligado) : descricao;

  // O rótulo e a explicação ficam na mesma coluna, ao lado do interruptor, como na prévia do
  // design aprovado. O <label> do React Aria usa `contents` para os filhos entrarem na grade do
  // cartão; a explicação fica fora dele, para não entrar no nome acessível, e é ligada por
  // aria-describedby. O -my-2/py-2 em volta do trilho leva a área de toque a 48px sem mexer no desenho.
  return (
    <div
      className={
        'grid max-w-medida grid-cols-[auto_1fr] gap-x-3 rounded-controle border border-border-subtle px-4 py-3 ' +
        'alto-contraste:border-(length:--bc-borda-controle)'
      }
    >
      <AriaSwitch
        {...props}
        isSelected={ligado}
        onChange={(valor) => {
          setInterno(valor);
          onChange?.(valor);
        }}
        aria-describedby={texto ? idDescricao : undefined}
        className="group contents text-corpo font-bold text-text-default"
      >
        <span
          className={
            'row-span-2 -my-2 flex cursor-pointer items-start py-2 ' +
            'group-data-disabled:cursor-not-allowed group-data-disabled:opacity-55'
          }
        >
          <span
            className={
              'relative mt-0.5 h-8 w-13 shrink-0 rounded-total border-(length:--bc-borda-controle) border-selecao-borda ' +
              'bg-campo-fundo transition-colors duration-rapida ease-out ' +
              'group-data-selected:border-selecao-marcado group-data-selected:bg-selecao-marcado ' +
              'group-data-focus-visible:foco-visivel'
            }
          >
            <span
              className={
                'absolute start-1 top-1 size-5 rounded-total bg-selecao-borda transition-[inset-inline-start] ' +
                'duration-rapida ease-out group-data-selected:start-6 group-data-selected:bg-selecao-marca'
              }
            />
          </span>
        </span>
        <span
          className={
            'cursor-pointer self-center pt-0.5 ' +
            'group-data-disabled:cursor-not-allowed group-data-disabled:opacity-55'
          }
        >
          {children}
        </span>
      </AriaSwitch>
      {texto ? (
        <p id={idDescricao} className="col-start-2 text-apoio text-text-muted">
          {texto}
        </p>
      ) : null}
    </div>
  );
}
