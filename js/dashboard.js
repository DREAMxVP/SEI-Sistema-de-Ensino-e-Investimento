import { mountMarketAutoRefresh } from "./market-data.js";

const SESSION_KEY = "sei-active-user";

function getActiveUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function ensureAuthenticated() {
  const user = getActiveUser();
  if (!user) {
    window.location.href = "./login.html";
    return null;
  }
  return user;
}

function updateGreeting() {
  const title = document.getElementById("welcomeTitle");
  if (!title) {
    return;
  }

  const user = ensureAuthenticated();
  if (!user) {
    return;
  }

  const userName = user.name || "investidor";
  const tipoPerfil = user.investorProfile && user.investorProfile.tipo ? user.investorProfile.tipo : "moderado";
  title.textContent = `Olá, ${userName}! Perfil ${tipoPerfil}.`;
}

function configureLogout() {
  const button = document.getElementById("logoutButton");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "./login.html";
  });
}

updateGreeting();
configureLogout();

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#dashboardTickerMeta"
});
