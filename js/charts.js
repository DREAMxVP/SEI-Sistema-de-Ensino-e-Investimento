let graficoPrincipal;
let graficoMensal;

function formatarAbreviado(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 2
  });
}

export function atualizarGraficoInvestimentos(resultados, investimentoSelecionado) {
  const ctx = document.getElementById("graficoInvestimentos");

  if (!ctx) return;

  if (graficoPrincipal) graficoPrincipal.destroy();

  const cores = resultados.map((r, i) => {
    if (r.nome === investimentoSelecionado) return "#00ff9d";
    if (i === 0) return "#a259ff";
    return "#4a4a66";
  });

  graficoPrincipal = new Chart(ctx, {
    type: "bar",
    data: {
      labels: resultados.map(r => r.nome),
      datasets: [{
        label: "Total Final",
        data: resultados.map(r => r.total),
        backgroundColor: cores
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutQuart"
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` Total projetado: ${Number(context.parsed.y).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#e2e2e2",
            maxRotation: 0,
            autoSkip: false
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#e2e2e2",
            callback: (valor) => formatarAbreviado(valor)
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        }
      }
    }
  });
}

export function atualizarGraficoMensal(dadosComparativos, nomeInvestimento = "Carteira") {
  const ctx = document.getElementById("graficoRapido");

  if (!ctx) return;

  if (graficoMensal) graficoMensal.destroy();

  const labels = Array.isArray(dadosComparativos?.labels) ? dadosComparativos.labels : [];
  const total = Array.isArray(dadosComparativos?.total) ? dadosComparativos.total : [];
  const guardado = Array.isArray(dadosComparativos?.guardado) ? dadosComparativos.guardado : [];
  const investido = Array.isArray(dadosComparativos?.investido) ? dadosComparativos.investido : [];
  const lucro = Array.isArray(dadosComparativos?.lucro) ? dadosComparativos.lucro : [];

  graficoMensal = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `Total acumulado - ${nomeInvestimento}`,
          data: total,
          borderColor: "#00d4ff",
          backgroundColor: "rgba(0, 212, 255, 0.18)",
          tension: 0.35,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 3
        },
        {
          label: "Total investido",
          data: investido,
          borderColor: "#a259ff",
          backgroundColor: "transparent",
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [8, 4]
        },
        {
          label: "Total guardado",
          data: guardado,
          borderColor: "#ffd166",
          backgroundColor: "transparent",
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [4, 4]
        },
        {
          label: "Lucro acumulado",
          data: lucro,
          borderColor: "#00ff9d",
          backgroundColor: "transparent",
          tension: 0.28,
          fill: false,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500
      },
      plugins: {
        legend: {
          labels: {
            color: "#e2e2e2"
          }
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            title: (items) => {
              const indice = items?.[0]?.dataIndex ?? 0;
              return `Data: ${labels[indice] || "-"}`;
            },
            label: (context) => ` ${context.dataset.label}: ${Number(context.parsed.y).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
            afterBody: (items) => {
              const indice = items?.[0]?.dataIndex ?? 0;
              return [
                `Investido: ${Number(investido[indice] || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                `Lucro: ${Number(lucro[indice] || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                `Total: ${Number(total[indice] || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
              ];
            }
          }
        }
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        x: {
          ticks: { color: "#cfcfcf" },
          grid: { color: "rgba(255,255,255,0.07)" }
        },
        y: {
          ticks: {
            color: "#cfcfcf",
            callback: (valor) => formatarAbreviado(valor)
          },
          grid: { color: "rgba(255,255,255,0.07)" }
        }
      }
    }
  });
}
