import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tag, TagGroup } from './TagGroup';

describe('TagGroup', () => {
  it('é uma lista com rótulo visível', () => {
    render(
      <TagGroup rotulo="Seus remédios">
        <Tag id="losartana">Losartana</Tag>
        <Tag id="metformina">Metformina</Tag>
      </TagGroup>,
    );
    expect(screen.getByRole('grid', { name: 'Seus remédios' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('remove pelo botão com nome', async () => {
    const onRemove = vi.fn();
    render(
      <TagGroup rotulo="Seus remédios" onRemove={onRemove}>
        <Tag id="losartana">Losartana</Tag>
      </TagGroup>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remover Losartana' }));
    expect(onRemove).toHaveBeenCalledWith(new Set(['losartana']));
  });

  it('remove pelo teclado (Delete)', async () => {
    const onRemove = vi.fn();
    render(
      <TagGroup rotulo="Seus remédios" onRemove={onRemove}>
        <Tag id="losartana">Losartana</Tag>
      </TagGroup>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{Delete}');
    expect(onRemove).toHaveBeenCalledWith(new Set(['losartana']));
  });

  it('mostra o texto de lista vazia', () => {
    render(
      <TagGroup rotulo="Seus remédios" items={[]} textoVazio="Nenhum remédio na lista.">
        {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
      </TagGroup>,
    );
    expect(screen.getByText('Nenhum remédio na lista.')).toBeInTheDocument();
  });
});
