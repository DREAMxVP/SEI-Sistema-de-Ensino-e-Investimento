import { mountMarketAutoRefresh, formatRate, formatPoints } from "./market-data.js";

const tracks = [
  {
    nivel: "Iniciante",
    titulo: "Fundamentos de investimento",
    descricao: "Entenda objetivos, reserva de emergência e primeiros passos para começar a investir com segurança.",
    progresso: 72
  },
  {
    nivel: "Intermediário",
    titulo: "Renda fixa na prática",
    descricao: "Compare Tesouro Selic, CDB, LCI/LCA e saiba montar sua estratégia com base em CDI e Selic.",
    progresso: 58
  },
  {
    nivel: "Intermediário",
    titulo: "Proteção contra inflação",
    descricao: "Aprenda como avaliar retorno real e usar produtos atrelados ao IPCA no planejamento.",
    progresso: 41
  },
  {
    nivel: "Avançado",
    titulo: "Bolsa e diversificação",
    descricao: "Construa visão de longo prazo para renda variável, usando o Ibovespa como benchmark de mercado.",
    progresso: 31
  }
];

function renderTracks(snapshot) {
  const container = document.getElementById("lessonTracks");
  if (!container) {
    return;
  }

  const marketLine = snapshot
    ? `<p class="topic-example">Contexto atual: CDI ${formatRate(snapshot.cdi)}, Selic ${formatRate(snapshot.selic)}, IPCA ${formatRate(snapshot.ipca)} e Ibovespa ${formatPoints(snapshot.ibov)}.</p>`
    : "";

  container.innerHTML = tracks
    .map((track) => `
      <article class="topic-card">
        <p class="eyebrow">${track.nivel}</p>
        <h3>${track.titulo}</h3>
        <p>${track.descricao}</p>
        ${marketLine}
        <div class="progress-row">
          <span>Progresso sugerido: ${track.progresso}%</span>
          <div class="progress-bar"><i style="width:${track.progresso}%;"></i></div>
        </div>
      </article>
    `)
    .join("");
}

renderTracks(null);

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#lessonsTickerMeta",
  onData: (snapshot) => {
    renderTracks(snapshot);
  }
});
