// Lógica modularizada do orçamento mensal
import { unformatCurrency } from './app.js';
let investorListenerAdded = false;

export function inicializarOrcamento() {
  document.getElementById("calcularOrcamento").addEventListener("click", () => {
    const renda = unformatCurrency(document.getElementById("rendaMensal").value);
    const fixos = unformatCurrency(document.getElementById("gastosFixos").value);
    const ali = unformatCurrency(document.getElementById("alimentacao").value);
    const trans = unformatCurrency(document.getElementById("transporte").value);
    const laz = unformatCurrency(document.getElementById("lazer").value);

    if (isNaN(renda) || renda <= 0) {
      mostrarAlerta('Por favor, insira uma renda mensal válida e positiva.');
      return;
    }

    const totalGastos = fixos + ali + trans + laz;
    const sobras = renda - totalGastos;

    document.getElementById("resultadoOrcamento").innerHTML = `
      <h3>📊 Resultado do Orçamento</h3>
      <p>Renda: <strong style="color:#00ff9d">R$ ${renda.toFixed(2)}</strong></p>
      <p>Total de Gastos: <strong style="color:#ff4d6d">R$ ${totalGastos.toFixed(2)}</strong></p>
      <p><strong style="color:${sobras>=0?'#00ff9d':'#ff4d6d'}">${sobras>=0?'Sobras para Investir':'Déficit'}: R$ ${sobras.toFixed(2)}</strong></p>
      ${sobras > 0 ? `<p>💡 Com R$ ${sobras.toFixed(2)} por mês, você pode investir e alcançar seus objetivos!</p><button class="btnSaibaInvestir">💼 Saiba Investir!</button>` : `<p>⚠️ Seus gastos estão acima da renda. Considere reduzir despesas.</p>`}
    `;

    if (!investorListenerAdded) {
      const container = document.getElementById("resultadoOrcamento");
      if (container) {
        container.addEventListener("click", (e) => {
          if (e.target && e.target.classList.contains("btnSaibaInvestir")) {
            window.abrirModalInvestimento && window.abrirModalInvestimento();
          }
        });
        investorListenerAdded = true;
      }
    }

    if (sobras > 0) {
      document.getElementById("valorInvestimento").value = sobras;
      window.atualizarAutomatico && window.atualizarAutomatico();
      document.getElementById("valorMensal").value = sobras;
    }
  });
}
