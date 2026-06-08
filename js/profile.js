import { getRecommendations, getProfileSummary } from "./learning-state.js";

function renderProfile() {
  const profile = getProfileSummary();

  const nameNode = document.getElementById("profileName");
  const emailNode = document.getElementById("profileEmail");
  const summary = document.getElementById("profileSummary");

  const recommendations = getRecommendations(2);

  if (nameNode) nameNode.textContent = profile.userName;
  if (emailNode) emailNode.textContent = profile.email || "Visitante sem login";

  if (summary) {
    summary.innerHTML = `
      <p>Perfil investidor: <strong>${profile.investorProfile}</strong></p>
      <p>Nível atual: <strong>${profile.level}</strong></p>
      <p>XP: <strong>${profile.xp}</strong></p>
      <p>Progresso geral: <strong>${profile.overallProgress}%</strong></p>
      <p>Próximo foco: <strong>${recommendations[0] || "Continue estudando os módulos."}</strong></p>
    `;
  }
}

renderProfile();
