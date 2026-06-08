import { mountMarketAutoRefresh, formatRate, formatPoints } from "./market-data.js";
import { LEARNING_MODULES } from "./learning-data.js";
import { getModuleProgress, loadLearningState } from "./learning-state.js";

function renderTracks(snapshot) {
  const container = document.getElementById("lessonTracks");
  if (!container) {
    return;
  }

  const state = loadLearningState();

  const marketLine = snapshot
    ? `<p class="topic-example">Contexto atual: CDI ${formatRate(snapshot.cdi)}, Selic ${formatRate(snapshot.selic)}, IPCA ${formatRate(snapshot.ipca)} e Ibovespa ${formatPoints(snapshot.ibov)}.</p>`
    : "";

  container.innerHTML = LEARNING_MODULES
    .map((track) => `
      <article class="topic-card">
        <p class="eyebrow">${track.nivel}</p>
        <h3>${track.titulo}</h3>
        <p>${track.descricao}</p>
        ${marketLine}
        <div class="progress-row">
          <span>Progresso atual: ${getModuleProgress(track.id, state)}%</span>
          <div class="progress-bar"><i style="width:${getModuleProgress(track.id, state)}%;"></i></div>
        </div>
        <a class="panel-link" href="/module/${track.id}">Abrir módulo</a>
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
