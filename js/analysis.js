export const investimentos = {
  "Poupança": 6.17,
  "Tesouro Selic": 13.25,
  "CDB 100% CDI": 13.15,
  "CDB 110% CDI": 14.46,
  "LCI/LCA": 12.5,
  "Fundo DI": 12.8
};

export function simularMensal(valor, taxa, meses) {
  const taxaMensal = taxa / 100 / 12;
  let total = 0;

  for (let i = 0; i < meses; i++) {
    total = (total + valor) * (1 + taxaMensal);
  }

  return total;
}

export function simularTodos(valor, meses) {
  const resultados = [];

  for (let nome in investimentos) {
    const taxa = investimentos[nome];
    const total = simularMensal(valor, taxa, meses);

    resultados.push({
      nome,
      taxa,
      total,
      lucro: total - (valor * meses)
    });
  }

  return resultados.sort((a, b) => b.total - a.total);
}

export function crescimentoMensal(valor, taxa, meses) {
  const taxaMensal = taxa / 100 / 12;
  let total = 0;
  const historico = [];

  for (let i = 0; i < meses; i++) {
    total = (total + valor) * (1 + taxaMensal);
    historico.push(total);
  }

  return historico;
}

