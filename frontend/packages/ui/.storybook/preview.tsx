import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles/index.css';
import './docs.css';

// Aplica tema e tamanho de texto no <html>, igual o app vai fazer.
const comTemaEEscala: Decorator = (Story, context) => {
  const { contraste, escala } = context.globals as { contraste: string; escala: string };
  const html = document.documentElement;
  html.lang = 'pt-BR';
  html.dataset.contraste = contraste;
  html.dataset.escala = escala;
  return <Story />;
};

const preview: Preview = {
  decorators: [comTemaEEscala],
  globalTypes: {
    contraste: {
      description: 'Tema de contraste',
      toolbar: {
        title: 'Contraste',
        icon: 'contrast',
        items: [
          { value: 'padrao', title: 'Padrão' },
          { value: 'alto', title: 'Alto contraste' },
        ],
        dynamicTitle: true,
      },
    },
    escala: {
      description: 'Tamanho do texto (A+)',
      toolbar: {
        title: 'Texto',
        icon: 'zoom',
        items: [
          { value: '100', title: '100%' },
          { value: '120', title: '120%' },
          { value: '140', title: '140%' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { contraste: 'padrao', escala: '100' },
  parameters: {
    // 'error' faz qualquer violação do axe reprovar o teste da story no Vitest.
    a11y: { test: 'error' },
    controls: { expanded: true },
    // A ordem da barra lateral segue a da spec, sem depender do nome das pastas.
    options: {
      storySort: {
        order: [
          'Introdução',
          'Fundamentos',
          'Conteúdo e voz',
          'Componentes',
          ['Modelo de página', 'Primitivos', 'Domínio'],
          'Padrões',
          'Changelog',
        ],
      },
    },
  },
};

export default preview;
