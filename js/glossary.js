import { mountMarketAutoRefresh } from "./market-data.js";
import { getProfileSummary, getRecommendations } from "./learning-state.js";

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
    termo: "Ações",
    definicao: "Pequenas partes de uma empresa negociadas em bolsa, com potencial de valorização e dividendos.",
    exemplo: "Ao comprar ações, você se torna sócio da empresa e participa dos resultados no longo prazo."
  },
  {
    termo: "FIIs",
    definicao: "Fundos de Investimento Imobiliário negociados em bolsa, focados em renda e/ou ganho de capital.",
    exemplo: "FIIs de tijolo podem distribuir rendimentos mensais com base em aluguéis dos imóveis."
  },
  {
    termo: "ETF",
    definicao: "Fundo de índice negociado em bolsa, usado para diversificação com custo eficiente.",
    exemplo: "Um ETF atrelado ao Ibovespa replica a carteira do índice em uma única compra."
  },
  {
    termo: "Perfil de Investidor",
    definicao: "Classificação de tolerância ao risco e objetivos financeiros: conservador, moderado ou arrojado.",
    exemplo: "Perfil moderado costuma equilibrar renda fixa e renda variável."
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

  const profile = getProfileSummary();
  const recommendation = getRecommendations(1)[0];

  const contextCard = `
    <article class="topic-card">
      <h3>Seu contexto de aprendizado</h3>
      <p>Nível: <strong>${profile.level}</strong> • Progresso: <strong>${profile.overallProgress}%</strong> • XP: <strong>${profile.xp}</strong></p>
      <p class="topic-example">Sugestão: ${recommendation || "Siga estudando os módulos em sequência."}</p>
    </article>
  `;

  container.innerHTML = contextCard + filtered
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
