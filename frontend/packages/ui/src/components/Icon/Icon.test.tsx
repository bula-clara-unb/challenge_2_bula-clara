import { Info } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('com rótulo, é uma imagem com nome', () => {
    render(<Icon icone={Info} rotulo="Informação" />);
    expect(screen.getByRole('img', { name: 'Informação' })).toBeInTheDocument();
  });

  it('decorativo, fica escondido do leitor de tela', () => {
    const { container } = render(<Icon icone={Info} decorativo />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('cresce com o A+ (tamanho em rem)', () => {
    const { container } = render(<Icon icone={Info} decorativo tamanho="grande" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '2rem');
  });

  it('não compila sem rótulo nem decorativo', () => {
    // @ts-expect-error o ícone precisa ter rotulo ou ser decorativo
    const elemento = <Icon icone={Info} />;
    expect(elemento).toBeTruthy();
  });
});
