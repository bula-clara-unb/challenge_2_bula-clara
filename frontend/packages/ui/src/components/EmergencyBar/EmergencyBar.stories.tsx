import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EmergencyBar } from './EmergencyBar';

const meta = {
  title: 'Componentes/Domínio/EmergencyBar',
  component: EmergencyBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmergencyBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  play: async ({ canvas }) => {
    const faixa = canvas.getByRole('link', { name: 'Emergência? Ligue 192' });
    await expect(faixa.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

export const AltoContraste: Story = {
  name: 'Alto contraste',
  globals: { contraste: 'alto' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('link')).borderBottomWidth).toBe('3px');
  },
};
