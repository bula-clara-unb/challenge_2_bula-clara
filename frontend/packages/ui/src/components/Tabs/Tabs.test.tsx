import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

function Exemplo() {
  return (
    <Tabs>
      <TabList aria-label="Partes da bula">
        <Tab id="tomar">Como tomar</Tab>
        <Tab id="mal">O que pode fazer mal</Tab>
      </TabList>
      <TabPanel id="tomar">Um comprimido por dia.</TabPanel>
      <TabPanel id="mal">Tontura e cansaço.</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('liga abas e painéis', () => {
    render(<Exemplo />);
    expect(screen.getByRole('tablist', { name: 'Partes da bula' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Como tomar' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Como tomar' })).toHaveTextContent('Um comprimido por dia.');
  });

  it('troca de aba pelas setas', async () => {
    render(<Exemplo />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'O que pode fazer mal' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Tontura e cansaço.');
  });

  it('não compila sem aria-label na lista', () => {
    // @ts-expect-error a lista de abas precisa dizer do que é
    const elemento = <TabList>{null}</TabList>;
    expect(elemento).toBeTruthy();
  });
});
