export function salvarGastos(gastos) {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

export function carregarGastos() {
  return JSON.parse(localStorage.getItem("gastos")) || [];
}
