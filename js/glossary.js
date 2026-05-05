import { mountMarketAutoRefresh } from "./market-data.js";

const glossaryTerms = [
  {
    termo: "CDI",
    definicao: "Taxa de referência para muitos investimentos de renda fixa, como CDB e fundos DI.",
    exemplo: "Um CDB que rende 110% do CDI tende a acompanhar de perto o cenário de juros do país."
  },
  {
    termo: "SELIC",
    definicao: "Taxa básica de juros da economia brasileira, definida pelo Banco Central.",
    exemplo: "Quando a Selic sobe, aplicações pós-fixadas costumam ganhar atratividade."
  },
  {
    termo: "IPCA",
    definicao: "Principal índice oficial de inflação no Brasil.",
    exemplo: "Se seu investimento rende menos que o IPCA, seu poder de compra cai no tempo."
  },
  {
    termo: "Ibovespa",
    definicao: "Índice que representa o desempenho médio das ações mais negociadas da bolsa brasileira.",
    exemplo: "Usar o Ibovespa como referência ajuda a comparar uma carteira de ações com o mercado."
  },
  {
    termo: "Reserva de Emergência",
    definicao: "Valor guardado para imprevistos, com liquidez e baixo risco.",
    exemplo: "O ideal é acumular de 6 a 12 meses de despesas fixas."
  },
  {
    termo: "Juros Compostos",
    definicao: "Juros sobre juros, que aceleram o crescimento do patrimônio no longo prazo.",
    exemplo: "Aportes mensais constantes podem gerar efeito exponencial em 10+ anos."
  },
  {
    termo: "Diversificação",
    definicao: "Estratégia de distribuir investimentos entre diferentes ativos para reduzir risco.",
    exemplo: "Combinar renda fixa, fundos imobiliários e ações reduz a dependência de um único mercado."
  },
  {
    termo: "Risco x Retorno",
    definicao: "Relação entre a possibilidade de perda e o potencial de ganho de um investimento.",
    exemplo: "Ativos com maior retorno esperado normalmente apresentam maior volatilidade."
  }
];

function renderTerms(filter = "") {
  const normalizedFilter = filter.trim().toLowerCase();
  const container = document.getElementById("glossaryGrid");
  if (!container) {
    return;
  }

  const filtered = glossaryTerms.filter((item) => {
    if (!normalizedFilter) {
      return true;
    }

    return `${item.termo} ${item.definicao} ${item.exemplo}`.toLowerCase().includes(normalizedFilter);
  });

  if (!filtered.length) {
    container.innerHTML = '<article class="topic-card"><h3>Nenhum termo encontrado</h3><p>Tente outro termo de busca.</p></article>';
    return;
  }

  container.innerHTML = filtered
    .map((item) => `
      <article class="topic-card">
        <h3>${item.termo}</h3>
        <p>${item.definicao}</p>
        <p class="topic-example">Exemplo: ${item.exemplo}</p>
      </article>
    `)
    .join("");
}

const input = document.getElementById("glossarySearch");
if (input) {
  input.addEventListener("input", (event) => {
    renderTerms(event.target.value);
  });
}

renderTerms();
mountMarketAutoRefresh({ scope: document, intervalMs: 30000, metaSelector: "#glossaryTickerMeta" });
