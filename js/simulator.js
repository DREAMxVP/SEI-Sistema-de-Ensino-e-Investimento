import { mountMarketAutoRefresh, formatRate } from "./market-data.js";
import { getProfileSummary, getRecommendations } from "./learning-state.js";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function calcularJurosCompostos(aporteMensal, anos, taxaAnual) {
  const meses = anos * 12;
  const taxaMensal = taxaAnual / 100 / 12;
  let montante = 0;

  for (let i = 0; i < meses; i += 1) {
    montante = (montante + aporteMensal) * (1 + taxaMensal);
  }

  return montante;
}

function updateSimulation() {
  const aporte = Number(document.getElementById("aporteMensal")?.value || 0);
  const anos = Number(document.getElementById("prazoAnos")?.value || 0);
  const taxa = Number(document.getElementById("taxaAnual")?.value || 0);

  const resultNode = document.getElementById("simulatorResult");
  const summaryNode = document.getElementById("scenarioSummary");

  if (!resultNode || !summaryNode || aporte <= 0 || anos <= 0 || taxa <= 0) {
    if (resultNode) {
      resultNode.textContent = "Preencha os campos com valores válidos para simular.";
    }
    return;
  }

  const totalInvestido = aporte * anos * 12;
  const patrimonioFinal = calcularJurosCompostos(aporte, anos, taxa);
  const lucro = patrimonioFinal - totalInvestido;

  resultNode.textContent = `Com ${formatCurrency(aporte)} por mês durante ${anos} anos a ${taxa.toFixed(2).replace(".", ",")}% a.a., seu patrimônio estimado é ${formatCurrency(patrimonioFinal)}.`;

  summaryNode.innerHTML = `
    <p>Aporte mensal: <strong>${formatCurrency(aporte)}</strong></p>
    <p>Prazo: <strong>${anos} anos</strong></p>
    <p>Taxa: <strong>${taxa.toFixed(2).replace(".", ",")}% a.a.</strong></p>
    <p>Valor investido: <strong>${formatCurrency(totalInvestido)}</strong></p>
    <p>Lucro estimado: <strong>${formatCurrency(lucro)}</strong></p>
    <p>Patrimônio final: <strong>${formatCurrency(patrimonioFinal)}</strong></p>
  `;

  const profile = getProfileSummary();
  const recommendations = getRecommendations(1);
  summaryNode.innerHTML += `
    <p>Nível educacional atual: <strong>${profile.level}</strong></p>
    <p>Dica de estudo: <strong>${recommendations[0] || "Continue evoluindo nos módulos."}</strong></p>
  `;
}

const form = document.getElementById("simulatorForm");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSimulation();
  });
}

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#simulatorTickerMeta",
  onData: (snapshot) => {
    const taxaInput = document.getElementById("taxaAnual");
    if (taxaInput && !taxaInput.dataset.userChanged) {
      taxaInput.value = snapshot.cdi.toFixed(2);
    }

    updateSimulation();

    const resultNode = document.getElementById("simulatorResult");
    if (resultNode && !resultNode.textContent.includes("patrimônio estimado")) {
      resultNode.textContent = `Taxa de referência carregada automaticamente com base no CDI atual (${formatRate(snapshot.cdi)}).`;
    }
  }
});

const taxaInput = document.getElementById("taxaAnual");
if (taxaInput) {
  taxaInput.addEventListener("input", () => {
    taxaInput.dataset.userChanged = "1";
  });
}

updateSimulation();
