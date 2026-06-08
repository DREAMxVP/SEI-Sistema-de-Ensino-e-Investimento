import { mountMarketAutoRefresh } from "./market-data.js";
import { getDashboardSnapshot, getProfileSummary } from "./learning-state.js";

function updateGreeting() {
  const title = document.getElementById("welcomeTitle");
  if (!title) {
    return;
  }

  const profile = getProfileSummary();
  title.textContent = `Olá, ${profile.userName}! Perfil ${profile.investorProfile}.`;
}

function renderDashboardLearning() {
  const snapshot = getDashboardSnapshot();

  const xpNode = document.getElementById("dashboardXpValue");
  const levelNode = document.getElementById("dashboardLevelValue");
  const overallNode = document.getElementById("dashboardOverallValue");
  const modulesNode = document.getElementById("dashboardModulesList");
  const recommendationsNode = document.getElementById("dashboardRecommendations");
  const progressNode = document.getElementById("dashboardProgressBars");

  if (xpNode) xpNode.textContent = String(snapshot.xp);
  if (levelNode) levelNode.textContent = snapshot.level;
  if (overallNode) overallNode.textContent = `${snapshot.overallProgress}%`;

  if (modulesNode) {
    modulesNode.innerHTML = snapshot.modules
      .map((module) => `
        <article class="topic-card">
          <p class="eyebrow">${module.nivel}</p>
          <h3>${module.titulo}</h3>
          <p>${module.descricao}</p>
          <p class="topic-example">Progresso: ${module.progress}%</p>
          <a class="panel-link" href="/module/${module.id}">Abrir módulo</a>
        </article>
      `)
      .join("");
  }

  if (recommendationsNode) {
    recommendationsNode.innerHTML = snapshot.recommendations
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  if (progressNode) {
    progressNode.innerHTML = snapshot.modules
      .map(
        (module) => `
          <div class="progress-row">
            <span>${module.titulo}</span>
            <div class="progress-bar"><i style="width: ${module.progress}%;"></i></div>
          </div>
        `
      )
      .join("");
  }
}

function configureLogout() {
  const button = document.getElementById("logoutButton");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    localStorage.removeItem("sei-active-user");
    window.location.href = "/dashboard";
  });
}

updateGreeting();
configureLogout();
renderDashboardLearning();

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#dashboardTickerMeta"
});
