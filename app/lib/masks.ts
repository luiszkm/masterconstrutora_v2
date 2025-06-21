export function removerMascaraMonetaria(valor: string): number {
  if (!valor) return 0;

  const valorLimpo = valor
    .replace(/\s/g, '')     // remove espaços
    .replace('R$', '')      // remove "R$"
    .replace(/\./g, '')     // remove pontos (separador de milhar)
    .replace(',', '.');     // troca vírgula por ponto

  const numero = parseFloat(valorLimpo);

  if (isNaN(numero)) {
    throw new Error(`Valor monetário inválido: ${valor}`);
  }

  return numero;
}

export function aplicarMascaraMonetaria(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';

  let numero: number;

  if (typeof valor === 'string') {
    // Remove tudo que não é número ou ponto ou vírgula
    const limpo = valor.replace(/[^\d,.-]/g, '').replace(',', '.');
    numero = parseFloat(limpo);
  } else {
    numero = valor;
  }

  if (isNaN(numero)) return 'R$ 0,00';

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
