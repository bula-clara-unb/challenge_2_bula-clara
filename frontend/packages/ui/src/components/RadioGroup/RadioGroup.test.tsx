import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from './RadioGroup';

function Exemplo(props: { onChange?: (valor: string) => void; isInvalid?: boolean }) {
  return (
    <RadioGroup rotulo="Para quem é o remédio?" mensagemErro="Escolha uma opção." {...props}>
      <Radio value="eu">Para mim</Radio>
      <Radio value="outra">Para outra pessoa</Radio>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('é um grupo com o rótulo visível', () => {
    render(<Exemplo />);
    expect(screen.getByRole('radiogroup', { name: 'Para quem é o remédio?' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('muda pelas setas do teclado', async () => {
    const onChange = vi.fn();
    render(<Exemplo onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Para mim' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('outra');
    expect(screen.getByRole('radio', { name: 'Para outra pessoa' })).toBeChecked();
  });

  it('anuncia o erro por aria-live', () => {
    const { container } = render(<Exemplo isInvalid />);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Escolha uma opção.');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error rotulo é obrigatório
    const elemento = <RadioGroup>{null}</RadioGroup>;
    expect(elemento).toBeTruthy();
  });
});
