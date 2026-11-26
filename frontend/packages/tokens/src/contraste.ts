// Razão de contraste da WCAG 2.x: (L1 + 0,05) / (L2 + 0,05), com L a luminância relativa.
function canal(valor8bits: number): number {
  const c = valor8bits / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const limpo = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) throw new Error(`cor inválida: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => canal(parseInt(limpo.slice(i, i + 2), 16))) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (escuro + 0.05);
}
