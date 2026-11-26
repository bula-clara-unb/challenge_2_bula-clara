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

  return (
    <div
      className={
        'flex max-w-medida flex-col gap-1 rounded-controle border border-border-subtle px-4 py-3 ' +
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
        className={
          'group flex min-h-12 cursor-pointer items-start gap-3 text-corpo font-bold text-text-default ' +
          'data-disabled:cursor-not-allowed data-disabled:opacity-55'
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
        <span className="pt-0.5">{children}</span>
      </AriaSwitch>
      {texto ? (
        <p id={idDescricao} className="ps-16 text-apoio text-text-muted">
          {texto}
        </p>
      ) : null}
    </div>
  );
}
