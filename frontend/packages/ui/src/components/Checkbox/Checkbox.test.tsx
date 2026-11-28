import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('usa o texto como rótulo', () => {
    render(<Checkbox>Tomo esse remédio todo dia</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'Tomo esse remédio todo dia' })).not.toBeChecked();
  });

  it('marca pelo clique no texto e pelo espaço', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Tomo esse remédio todo dia</Checkbox>);
    await userEvent.click(screen.getByText('Tomo esse remédio todo dia'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('tem a área de toque mínima', () => {
    const { container } = render(<Checkbox>Tomo esse remédio todo dia</Checkbox>);
    expect(container.querySelector('label')).toHaveClass('min-h-12');
  });

  it('não compila sem rótulo', () => {
    // @ts-expect-error o texto (children) é o rótulo e é obrigatório
    const elemento = <Checkbox />;
    expect(elemento).toBeTruthy();
  });
});
