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

function updateGreeting() {
  const title = document.getElementById("welcomeTitle");
  if (!title) {
    return;
  }

  const user = getActiveUser();
  const userName = user && user.name ? user.name : "investidor";
  title.textContent = `Olá, ${userName}!`;
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
