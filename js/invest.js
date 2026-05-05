export function juros(capital, taxa, anos = 1) {
  return capital * Math.pow(1 + taxa / 100, anos);
}

export function calcularInvestimentos(total, selic, cdi) {
  return {
    "Gasto": total,
    "Poupança (6%)": juros(total, 6),
    "Selic": juros(total, selic),
    "Tesouro Selic": juros(total, selic - 0.2),
    "Tesouro IPCA+ (IPCA 4% + 5%)": juros(total, 9),
    "CDB 100% CDI": juros(total, cdi),
    "CDB 110% CDI": juros(total, cdi * 1.1),
    "CDB 120% CDI": juros(total, cdi * 1.2)
  };
}
