/** Tira acentos e maiúsculas: "Sódica" e "sodica" ficam iguais. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** Distância de edição (Levenshtein): quantas letras trocar, pôr ou tirar para ir de a até b. */
function distancia(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      const troca = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min((anterior[j] ?? 0) + 1, (atual[j - 1] ?? 0) + 1, (anterior[j - 1] ?? 0) + troca);
    }
    anterior = atual;
  }
  return anterior[b.length] ?? 0;
}

/**
 * Filtro padrão do ComboBox: acha pelo pedaço do nome, sem ligar para acento e maiúscula,
 * e aceita erro de digitação ("lozartana" acha "Losartana"): 1 erro a cada 4 letras, no máximo 2.
 */
export function filtroTolerante(opcao: string, digitado: string): boolean {
  const alvo = normalizar(opcao);
  const busca = normalizar(digitado);
  if (!busca || alvo.includes(busca)) return true;
  const limite = Math.min(2, Math.floor(busca.length / 4));
  if (limite === 0) return false;
  return alvo.split(/\s+/).some((palavra) => distancia(palavra.slice(0, busca.length), busca) <= limite);
}
