import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputDock, type InputDockProps } from './InputDock';

function montar(props: Partial<InputDockProps> = {}) {
  const funcoes = { onPerguntar: vi.fn(), onAbrirCamera: vi.fn(), onGravar: vi.fn() };
  render(<InputDock {...funcoes} destinoAtual="perguntar" {...props} />);
  return funcoes;
}

describe('InputDock', () => {
  it('o campo tem nome acessível, e o exemplo não é o rótulo', () => {
    montar();
    const campo = screen.getByRole('textbox', { name: 'Sua pergunta' });
    expect(campo).toHaveAttribute('placeholder', 'Escreva sua pergunta…');
    expect(campo).toHaveAttribute('enterkeyhint', 'send');
  });

  it('câmera e microfone têm nome e abrem cada um o seu fluxo', async () => {
    const { onAbrirCamera, onGravar } = montar();
    await userEvent.click(screen.getByRole('button', { name: 'Fotografar a caixa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar falando' }));
    expect(onAbrirCamera).toHaveBeenCalledOnce();
    expect(onGravar).toHaveBeenCalledOnce();
  });

  it('com texto, o microfone vira "Perguntar"; Enter também pergunta e limpa o campo', async () => {
    const { onPerguntar } = montar();
    const campo = screen.getByRole('textbox', { name: 'Sua pergunta' });
    await userEvent.type(campo, '  Para que serve a losartana?  ');
    expect(screen.queryByRole('button', { name: 'Perguntar falando' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Perguntar' }));
    expect(onPerguntar).toHaveBeenCalledWith('Para que serve a losartana?');
    expect(campo).toHaveValue('');
    await userEvent.type(campo, 'Como tomar a losartana?{Enter}');
    expect(onPerguntar).toHaveBeenLastCalledWith('Como tomar a losartana?');
  });

  it('não pergunta com o campo vazio', async () => {
    const { onPerguntar } = montar();
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onPerguntar).not.toHaveBeenCalled();
  });

  it('a barra tem três destinos e marca o atual', () => {
    montar({ destinoAtual: 'remedios', rotuloCampo: 'Outra pergunta' });
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const links = Array.from(nav.querySelectorAll('a'));
    expect(links.map((link) => link.textContent)).toEqual(['Perguntar', 'Meus remédios', 'Sobre']);
    expect(screen.getByRole('link', { name: 'Meus remédios' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Perguntar' })).not.toHaveAttribute('aria-current');
    for (const link of links) expect(link).toHaveClass('min-h-14', 'text-apoio');
    expect(screen.getByRole('textbox', { name: 'Outra pergunta' })).toBeInTheDocument();
  });

  it('sem a caixa, fica só a navegação', () => {
    montar({ mostrarCaixa: false });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
