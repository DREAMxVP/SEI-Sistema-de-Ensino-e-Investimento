import { LEARNING_MODULES } from "./learning-data.js";
import { getModuleProgress, loadLearningState } from "./learning-state.js";

function renderModules() {
  const grid = document.getElementById("modulesGrid");
  if (!grid) {
    return;
  }

  const state = loadLearningState();

  grid.innerHTML = LEARNING_MODULES
    .map((item) => `
      <article class="topic-card">
        <p class="eyebrow">${item.nivel}</p>
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
        <div class="progress-row">
          <span>Progresso do módulo: ${getModuleProgress(item.id, state)}%</span>
          <div class="progress-bar"><i style="width:${getModuleProgress(item.id, state)}%;"></i></div>
        </div>
        <a class="panel-link" href="module.html?id=${item.id}">Abrir módulo</a>
      </article>
    `)
    .join("");
}

renderModules();
