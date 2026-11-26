import { BookOpen, Pill, Question } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const meta = {
  title: 'Componentes/Primitivos/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComIcones: Story = {
  name: 'Com ícones',
  render: () => (
    <Tabs>
      <TabList aria-label="Partes da bula">
        <Tab id="serve" icone={Question}>
          Para que serve
        </Tab>
        <Tab id="tomar" icone={Pill}>
          Como tomar
        </Tab>
        <Tab id="bula" icone={BookOpen}>
          Bula inteira
        </Tab>
      </TabList>
      <TabPanel id="serve">Ajuda a controlar a pressão alta.</TabPanel>
      <TabPanel id="tomar">Um comprimido de 50 mg por dia, com ou sem comida.</TabPanel>
      <TabPanel id="bula">As 9 seções da bula oficial.</TabPanel>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    const aba = canvas.getByRole('tab', { name: 'Como tomar' });
    await expect(aba.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await userEvent.click(aba);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Um comprimido de 50 mg por dia');
  },
};
